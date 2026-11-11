package server

// Covers: ADR-0004 and ADR-0005 groundwork (CR-0001.T08): handlers learn the
// caller's session, and panics and handler errors are answered in the
// contract's error shape without leaking internal text.

import (
	"bytes"
	"context"
	"encoding/json"
	"errors"
	"io"
	"log/slog"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"

	"github.com/bregy1/together/server/internal/api"
	"github.com/bregy1/together/server/internal/config"
	"github.com/bregy1/together/server/internal/server/session"
	"github.com/bregy1/together/server/internal/server/session/sessiontest"
)

type nopPinger struct{}

func (nopPinger) Ping(context.Context) error { return nil }

// spy replaces some operations of the composed implementation.
type spy struct {
	api.StrictServerInterface
	getMe func(ctx context.Context) (api.GetMeResponseObject, error)
}

func (s spy) GetMe(ctx context.Context, r api.GetMeRequestObject) (api.GetMeResponseObject, error) {
	return s.getMe(ctx)
}

func spyHandler(t *testing.T, logs io.Writer, getMe func(ctx context.Context) (api.GetMeResponseObject, error)) http.Handler {
	t.Helper()
	opts := Options{
		DB:          nopPinger{},
		Sessions:    sessiontest.NewFake(map[string]session.Session{"tok": {ID: "s-42"}}),
		Logger:      slog.New(slog.NewTextHandler(logs, nil)),
		Environment: config.Development,
	}
	h, err := newHandler(opts, spy{StrictServerInterface: newOperations(opts), getMe: getMe})
	require.NoError(t, err)
	return h
}

func callMe(h http.Handler) *httptest.ResponseRecorder {
	req := httptest.NewRequest(http.MethodGet, "/me", nil)
	req.Header.Set("Authorization", "Bearer tok")
	rec := httptest.NewRecorder()
	h.ServeHTTP(rec, req)
	return rec
}

func errorCode(t *testing.T, rec *httptest.ResponseRecorder) string {
	t.Helper()
	assert.Equal(t, "application/json", rec.Header().Get("Content-Type"))
	var body map[string]any
	require.NoError(t, json.Unmarshal(rec.Body.Bytes(), &body), "body: %q", rec.Body.String())
	require.Len(t, body, 1, "only a code: %v", body)
	return body["code"].(string)
}

func TestHandlersSeeTheVerifiedSession(t *testing.T) {
	var got session.Session
	var ok bool
	h := spyHandler(t, io.Discard, func(ctx context.Context) (api.GetMeResponseObject, error) {
		got, ok = session.FromContext(ctx)
		return api.GetMe200JSONResponse{}, nil
	})

	callMe(h)

	require.True(t, ok)
	assert.Equal(t, "s-42", got.ID)
}

func TestAPanicIsAnswered500WithoutItsText(t *testing.T) {
	var logs bytes.Buffer
	h := spyHandler(t, &logs, func(context.Context) (api.GetMeResponseObject, error) {
		panic("secret detail +41791234567")
	})

	rec := callMe(h)

	assert.Equal(t, http.StatusInternalServerError, rec.Code)
	assert.Equal(t, "internal_error", errorCode(t, rec))
	assert.NotContains(t, rec.Body.String(), "secret")
	assert.NotContains(t, logs.String(), "+41791234567", "the panic value may hold personal data; it is not logged")
	assert.Contains(t, logs.String(), "panic")
}

func TestAHandlerErrorIsAnswered500WithoutItsText(t *testing.T) {
	h := spyHandler(t, io.Discard, func(context.Context) (api.GetMeResponseObject, error) {
		return nil, errors.New("pq: relation \"session\" does not exist")
	})

	rec := callMe(h)

	assert.Equal(t, http.StatusInternalServerError, rec.Code)
	assert.Equal(t, "internal_error", errorCode(t, rec))
	assert.NotContains(t, rec.Body.String(), "relation")
}
