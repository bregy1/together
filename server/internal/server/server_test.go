package server_test

// Covers: ADR-0004 groundwork (CR-0001.T01); the ADR has no scenarios.

import (
	"context"
	"encoding/json"
	"errors"
	"io"
	"log/slog"
	"net/http"
	"net/http/httptest"
	"testing"
	"time"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"

	"github.com/bregy1/together/server/internal/database"
	"github.com/bregy1/together/server/internal/server"
	"github.com/bregy1/together/server/internal/testdb"
)

type fakePinger struct{ err error }

func (f fakePinger) Ping(context.Context) error { return f.err }

func quietLogger() *slog.Logger { return slog.New(slog.NewTextHandler(io.Discard, nil)) }

func get(t *testing.T, h http.Handler, method, path string) *httptest.ResponseRecorder {
	t.Helper()
	rec := httptest.NewRecorder()
	h.ServeHTTP(rec, httptest.NewRequest(method, path, nil))
	return rec
}

func TestHealthz_AnswersOKAsJSON(t *testing.T) {
	h := server.NewHandler(fakePinger{}, quietLogger())

	rec := get(t, h, http.MethodGet, "/healthz")

	assert.Equal(t, http.StatusOK, rec.Code)
	assert.Equal(t, "application/json", rec.Header().Get("Content-Type"))
	var body map[string]any
	require.NoError(t, json.Unmarshal(rec.Body.Bytes(), &body))
	assert.Equal(t, map[string]any{"status": "ok"}, body)
}

func TestHealthz_Answers503WithoutDetailsWhenTheDatabaseIsDown(t *testing.T) {
	h := server.NewHandler(fakePinger{err: errors.New("dial tcp 10.0.0.5:5432: connection refused")}, quietLogger())

	rec := get(t, h, http.MethodGet, "/healthz")

	assert.Equal(t, http.StatusServiceUnavailable, rec.Code)
	assert.JSONEq(t, `{"status":"unavailable"}`, rec.Body.String())
	assert.NotContains(t, rec.Body.String(), "10.0.0.5", "internal details must not leak")
}

func TestHealthz_RefusesOtherMethods(t *testing.T) {
	h := server.NewHandler(fakePinger{}, quietLogger())

	rec := get(t, h, http.MethodPost, "/healthz")

	assert.Equal(t, http.StatusMethodNotAllowed, rec.Code)
}

func TestUnknownPath_Answers404(t *testing.T) {
	h := server.NewHandler(fakePinger{}, quietLogger())

	rec := get(t, h, http.MethodGet, "/does-not-exist")

	assert.Equal(t, http.StatusNotFound, rec.Code)
}

func TestNew_SetsTimeoutsOnTheHTTPServer(t *testing.T) {
	srv := server.New("127.0.0.1:0", fakePinger{}, quietLogger())

	assert.Equal(t, "127.0.0.1:0", srv.Addr)
	assert.Positive(t, srv.ReadHeaderTimeout)
	assert.Positive(t, srv.ReadTimeout)
	assert.Positive(t, srv.WriteTimeout)
	assert.Positive(t, srv.IdleTimeout)
}

// Needs PostgreSQL: skipped when DATABASE_URL is not set.
func TestHealthz_AgainstARealDatabase(t *testing.T) {
	url := testdb.URL(t)
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	pool, err := database.Connect(ctx, url)
	require.NoError(t, err)
	defer pool.Close()

	ts := httptest.NewServer(server.NewHandler(pool, quietLogger()))
	defer ts.Close()

	resp, err := http.Get(ts.URL + "/healthz")
	require.NoError(t, err)
	defer resp.Body.Close()

	assert.Equal(t, http.StatusOK, resp.StatusCode)
	b, err := io.ReadAll(resp.Body)
	require.NoError(t, err)
	assert.JSONEq(t, `{"status":"ok"}`, string(b))
}
