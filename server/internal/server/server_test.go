package server_test

// Covers: ADR-0004 and ADR-0005 groundwork (CR-0001.T01, CR-0001.T08); these
// ADRs have no scenarios. The wiring: request validation against the
// contract, the session check, one error shape, Cache-Control on calls that
// carry a session token, and cross-origin access for the local web preview
// in development only.

import (
	"bytes"
	"context"
	"encoding/json"
	"errors"
	"io"
	"log/slog"
	"mime/multipart"
	"net/http"
	"net/http/httptest"
	"net/textproto"
	"strings"
	"sync"
	"testing"
	"time"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"

	"github.com/bregy1/together/server/internal/config"
	"github.com/bregy1/together/server/internal/database"
	"github.com/bregy1/together/server/internal/server"
	"github.com/bregy1/together/server/internal/server/session"
	"github.com/bregy1/together/server/internal/server/session/sessiontest"
	"github.com/bregy1/together/server/internal/testdb"
)

const (
	validToken = "valid-token-0123456789"
	phone      = "+41791234567"
)

type fakePinger struct{ err error }

func (f fakePinger) Ping(context.Context) error { return f.err }

func quietLogger() *slog.Logger { return slog.New(slog.NewTextHandler(io.Discard, nil)) }

// syncBuffer collects log output safely across goroutines.
type syncBuffer struct {
	mu  sync.Mutex
	buf bytes.Buffer
}

func (b *syncBuffer) Write(p []byte) (int, error) {
	b.mu.Lock()
	defer b.mu.Unlock()
	return b.buf.Write(p)
}

func (b *syncBuffer) String() string {
	b.mu.Lock()
	defer b.mu.Unlock()
	return b.buf.String()
}

func options(mod ...func(*server.Options)) server.Options {
	o := server.Options{
		DB:          fakePinger{},
		Sessions:    sessiontest.NewFake(map[string]session.Session{validToken: {ID: "s1"}}),
		Logger:      quietLogger(),
		Environment: config.Development,
	}
	for _, m := range mod {
		m(&o)
	}
	return o
}

func handler(t *testing.T, mod ...func(*server.Options)) http.Handler {
	t.Helper()
	h, err := server.NewHandler(options(mod...))
	require.NoError(t, err)
	return h
}

func production(o *server.Options) { o.Environment = config.Production; o.CORSAllowedOrigins = nil }

func devOrigins(origins ...string) func(*server.Options) {
	return func(o *server.Options) { o.CORSAllowedOrigins = origins }
}

func do(t *testing.T, h http.Handler, method, path, body string, headers map[string]string) *httptest.ResponseRecorder {
	t.Helper()
	var r io.Reader
	if body != "" {
		r = strings.NewReader(body)
	}
	req := httptest.NewRequest(method, path, r)
	if body != "" {
		req.Header.Set("Content-Type", "application/json")
	}
	for k, v := range headers {
		req.Header.Set(k, v)
	}
	rec := httptest.NewRecorder()
	h.ServeHTTP(rec, req)
	return rec
}

func get(t *testing.T, h http.Handler, method, path string) *httptest.ResponseRecorder {
	t.Helper()
	return do(t, h, method, path, "", nil)
}

func bearer(token string) map[string]string {
	return map[string]string{"Authorization": "Bearer " + token}
}

// assertError checks the contract's Error body: JSON with only a code.
func assertError(t *testing.T, rec *httptest.ResponseRecorder, status int, code string) {
	t.Helper()
	assert.Equal(t, status, rec.Code)
	assert.Equal(t, "application/json", rec.Header().Get("Content-Type"))
	var body map[string]any
	require.NoError(t, json.Unmarshal(rec.Body.Bytes(), &body), "body: %q", rec.Body.String())
	assert.Equal(t, map[string]any{"code": code}, body)
}

// --- Health check (CR-0001.T01) ---

func TestHealthz_AnswersOKAsJSON(t *testing.T) {
	rec := get(t, handler(t), http.MethodGet, "/healthz")

	assert.Equal(t, http.StatusOK, rec.Code)
	assert.Equal(t, "application/json", rec.Header().Get("Content-Type"))
	var body map[string]any
	require.NoError(t, json.Unmarshal(rec.Body.Bytes(), &body))
	assert.Equal(t, map[string]any{"status": "ok"}, body)
}

func TestHealthz_Answers503WithoutDetailsWhenTheDatabaseIsDown(t *testing.T) {
	h := handler(t, func(o *server.Options) {
		o.DB = fakePinger{err: errors.New("dial tcp 10.0.0.5:5432: connection refused")}
	})

	rec := get(t, h, http.MethodGet, "/healthz")

	assert.Equal(t, http.StatusServiceUnavailable, rec.Code)
	assert.JSONEq(t, `{"status":"unavailable"}`, rec.Body.String())
	assert.NotContains(t, rec.Body.String(), "10.0.0.5", "internal details must not leak")
}

func TestHealthz_NeedsNoSessionAndIsNotMarkedNoStore(t *testing.T) {
	rec := get(t, handler(t), http.MethodGet, "/healthz")

	assert.Equal(t, http.StatusOK, rec.Code)
	assert.Empty(t, rec.Header().Get("Cache-Control"))
}

// --- One error shape ---

func TestWrongMethod_Answers405InTheErrorShape(t *testing.T) {
	rec := get(t, handler(t), http.MethodPost, "/healthz")

	assertError(t, rec, http.StatusMethodNotAllowed, "request_invalid")
	assert.Equal(t, "GET", rec.Header().Get("Allow"))
}

func TestWrongMethod_ListsEveryAllowedMethod(t *testing.T) {
	rec := get(t, handler(t), http.MethodPost, "/signup/photos/1")

	assertError(t, rec, http.StatusMethodNotAllowed, "request_invalid")
	assert.Equal(t, "DELETE, GET, PUT", rec.Header().Get("Allow"))
}

func TestUnknownPath_Answers404InTheErrorShape(t *testing.T) {
	rec := get(t, handler(t), http.MethodGet, "/does-not-exist")

	assertError(t, rec, http.StatusNotFound, "not_found")
}

func TestUnknownPath_IsNotLogged(t *testing.T) {
	var logs syncBuffer
	h := handler(t, func(o *server.Options) { o.Logger = slog.New(slog.NewTextHandler(&logs, nil)) })

	get(t, h, http.MethodGet, "/"+phone)

	assert.NotContains(t, logs.String(), phone, "paths of unknown routes may hold anything; they are not logged")
}

// --- Request validation against the contract ---

func TestValidation_RefusesARequestThatBreaksTheContract(t *testing.T) {
	cases := []struct {
		name, method, path, body string
		headers                  map[string]string
	}{
		{"missing body", http.MethodPost, "/login/code-requests", "", nil},
		{"empty phone number", http.MethodPost, "/login/code-requests", `{"phoneNumber":""}`, nil},
		{"unknown field", http.MethodPost, "/login/code-requests", `{"phoneNumber":"` + phone + `","extra":1}`, nil},
		{"malformed JSON", http.MethodPost, "/login/code-requests", `{"phoneNumber":`, nil},
		{"code not 6 digits", http.MethodPost, "/login/code-verifications", `{"phoneNumber":"` + phone + `","code":"12ab"}`, nil},
		{"step not in the list", http.MethodPut, "/signup/step", `{"step":"profile"}`, bearer(validToken)},
		{"slot out of range", http.MethodDelete, "/signup/photos/4", "", bearer(validToken)},
		{"search text missing", http.MethodGet, "/municipalities", "", bearer(validToken)},
	}
	for _, c := range cases {
		t.Run(c.name, func(t *testing.T) {
			rec := do(t, handler(t), c.method, c.path, c.body, c.headers)
			assertError(t, rec, http.StatusBadRequest, "request_invalid")
		})
	}
}

func TestValidation_NeverEchoesRequestValuesInTheResponseOrTheLog(t *testing.T) {
	var logs syncBuffer
	h := handler(t, func(o *server.Options) { o.Logger = slog.New(slog.NewTextHandler(&logs, nil)) })

	for _, body := range []string{
		`{"phoneNumber":"` + phone + `","extra":"x"}`,
		`{"phoneNumber":"` + phone + `","code":"98765x"}`,
		`{"phoneNumber":"` + phone + strings.Repeat("9", 40) + `","code":"987654"}`,
	} {
		for _, path := range []string{"/login/code-requests", "/login/code-verifications"} {
			rec := do(t, h, http.MethodPost, path, body, nil)
			require.Equal(t, http.StatusBadRequest, rec.Code, "%s %s", path, body)
			assert.NotContains(t, rec.Body.String(), phone)
			assert.NotContains(t, rec.Body.String(), "98765")
		}
	}
	assert.NotContains(t, logs.String(), phone, "a phone number must never be logged")
	assert.NotContains(t, logs.String(), "98765", "a login code must never be logged")
	assert.Contains(t, logs.String(), "request rejected", "rejections are still logged, without values")
}

func TestValidation_LetsAValidRequestThroughToTheStub(t *testing.T) {
	rec := do(t, handler(t), http.MethodPost, "/login/code-requests", `{"phoneNumber":"`+phone+`"}`, nil)

	assertError(t, rec, http.StatusInternalServerError, "internal_error")
}

func TestValidation_AcceptsAPhotoUploadAsTheContractDescribesIt(t *testing.T) {
	for _, contentType := range []string{"image/jpeg", "image/png"} {
		t.Run(contentType, func(t *testing.T) {
			var buf bytes.Buffer
			mw := multipart.NewWriter(&buf)
			part, err := mw.CreatePart(textproto.MIMEHeader{
				"Content-Disposition": {`form-data; name="photo"; filename="p"`},
				"Content-Type":        {contentType},
			})
			require.NoError(t, err)
			_, err = part.Write([]byte{0xFF, 0xD8, 0xFF, 0xE0, 0x00, 0x10, 'J', 'F', 'I', 'F'})
			require.NoError(t, err)
			require.NoError(t, mw.Close())

			req := httptest.NewRequest(http.MethodPut, "/signup/photos/0", &buf)
			req.Header.Set("Content-Type", mw.FormDataContentType())
			req.Header.Set("Authorization", "Bearer "+validToken)
			rec := httptest.NewRecorder()
			handler(t).ServeHTTP(rec, req)

			assertError(t, rec, http.StatusInternalServerError, "internal_error")
		})
	}
}

// --- Session check ---

func TestSession_IsRequiredWhereTheContractAsksForIt(t *testing.T) {
	cases := []struct{ method, path, body string }{
		{http.MethodGet, "/me", ""},
		{http.MethodPatch, "/signup/about", `{"firstName":"Anna"}`},
		{http.MethodPut, "/signup/interests", `{"interestIds":[]}`},
		{http.MethodPut, "/signup/step", `{"step":"interests"}`},
		{http.MethodPost, "/signup/finish", `{"acceptTermsOfUse":true,"acceptRules":true}`},
		{http.MethodGet, "/signup/photos/0", ""},
		{http.MethodDelete, "/signup/photos/0", ""},
		{http.MethodGet, "/municipalities?q=Na", ""},
		{http.MethodGet, "/interests", ""},
	}
	headers := map[string]map[string]string{
		"no header":        nil,
		"unknown token":    bearer("unknown-token"),
		"empty token":      {"Authorization": "Bearer "},
		"other scheme":     {"Authorization": "Basic " + validToken},
		"token only":       {"Authorization": validToken},
		"token with space": {"Authorization": "Bearer " + validToken + " x"},
	}
	for _, c := range cases {
		for name, hdr := range headers {
			t.Run(c.method+" "+c.path+"/"+name, func(t *testing.T) {
				rec := do(t, handler(t), c.method, c.path, c.body, hdr)
				assertError(t, rec, http.StatusUnauthorized, "unauthenticated")
				assert.Equal(t, "Bearer", rec.Header().Get("WWW-Authenticate"))
			})
		}
		t.Run(c.method+" "+c.path+"/valid", func(t *testing.T) {
			rec := do(t, handler(t), c.method, c.path, c.body, bearer(validToken))
			assertError(t, rec, http.StatusInternalServerError, "internal_error")
		})
	}
}

func TestSession_AcceptsTheSchemeInAnyCase(t *testing.T) {
	rec := do(t, handler(t), http.MethodGet, "/me", "", map[string]string{"Authorization": "bearer " + validToken})

	assertError(t, rec, http.StatusInternalServerError, "internal_error")
}

func TestSession_IsCheckedBeforeTheBody(t *testing.T) {
	rec := do(t, handler(t), http.MethodPut, "/signup/step", `{"step":"nope"}`, nil)

	assertError(t, rec, http.StatusUnauthorized, "unauthenticated")
}

func TestSession_AFailingSessionStoreIsAServerErrorNotA401(t *testing.T) {
	var logs syncBuffer
	h := handler(t, func(o *server.Options) {
		f := sessiontest.NewFake(nil)
		f.Err = errors.New("db: connection reset by 10.0.0.5")
		o.Sessions = f
		o.Logger = slog.New(slog.NewTextHandler(&logs, nil))
	})

	rec := do(t, h, http.MethodGet, "/me", "", bearer(validToken))

	assertError(t, rec, http.StatusInternalServerError, "internal_error")
	assert.NotContains(t, rec.Body.String(), "10.0.0.5")
	assert.NotContains(t, logs.String(), validToken, "a session token must never be logged")
}

func TestSession_TheDefaultVerifierRejectsEveryToken(t *testing.T) {
	h := handler(t, func(o *server.Options) { o.Sessions = session.RejectAll{} })

	rec := do(t, h, http.MethodGet, "/me", "", bearer(validToken))

	assertError(t, rec, http.StatusUnauthorized, "unauthenticated")
}

func TestSession_OperationsWithoutASessionIgnoreTheHeader(t *testing.T) {
	rec := do(t, handler(t), http.MethodPost, "/login/code-requests", `{"phoneNumber":"`+phone+`"}`, bearer("unknown-token"))

	assertError(t, rec, http.StatusInternalServerError, "internal_error")
}

func TestSession_TokensAreNeverLogged(t *testing.T) {
	var logs syncBuffer
	h := handler(t, func(o *server.Options) { o.Logger = slog.New(slog.NewTextHandler(&logs, nil)) })

	do(t, h, http.MethodGet, "/me", "", bearer("secret-unknown-token"))
	do(t, h, http.MethodGet, "/me", "", bearer(validToken))
	do(t, h, http.MethodPut, "/signup/step", `{"step":"x"}`, bearer(validToken))

	assert.NotContains(t, logs.String(), "secret-unknown-token")
	assert.NotContains(t, logs.String(), validToken)
}

// --- Cache-Control: no-store on calls that carry or return a session token ---

func TestNoStore_OnEverySignedInCall(t *testing.T) {
	h := handler(t)
	for name, rec := range map[string]*httptest.ResponseRecorder{
		"with a valid session":      do(t, h, http.MethodGet, "/me", "", bearer(validToken)),
		"refused with 401":          do(t, h, http.MethodGet, "/me", "", nil),
		"refused with 400":          do(t, h, http.MethodPut, "/signup/step", `{"step":"x"}`, bearer(validToken)),
		"photo read":                do(t, h, http.MethodGet, "/signup/photos/0", "", bearer(validToken)),
		"a token on a public call":  do(t, h, http.MethodGet, "/healthz", "", bearer(validToken)),
		"verifyLoginCode":           do(t, h, http.MethodPost, "/login/code-verifications", `{"phoneNumber":"`+phone+`","code":"123456"}`, nil),
		"verifyLoginCode refused":   do(t, h, http.MethodPost, "/login/code-verifications", `{}`, nil),
		"municipality search (GET)": do(t, h, http.MethodGet, "/municipalities?q=Na", "", bearer(validToken)),
	} {
		assert.Equal(t, "no-store", rec.Header().Get("Cache-Control"), name)
	}
}

func TestNoStore_NotOnPublicCallsWithoutAToken(t *testing.T) {
	rec := do(t, handler(t), http.MethodPost, "/login/code-requests", `{"phoneNumber":"`+phone+`"}`, nil)

	assert.Empty(t, rec.Header().Get("Cache-Control"))
}

// --- Cross-origin access for the local web preview, development only ---

func preflight(t *testing.T, h http.Handler, origin string) *httptest.ResponseRecorder {
	t.Helper()
	return do(t, h, http.MethodOptions, "/me", "", map[string]string{
		"Origin":                         origin,
		"Access-Control-Request-Method":  "PATCH",
		"Access-Control-Request-Headers": "authorization, content-type",
	})
}

func TestCORS_DevelopmentAnswersThePreflightOfTheWebPreview(t *testing.T) {
	h := handler(t, devOrigins("http://localhost:8081"))

	rec := preflight(t, h, "http://localhost:8081")

	assert.Equal(t, http.StatusNoContent, rec.Code)
	assert.Equal(t, "http://localhost:8081", rec.Header().Get("Access-Control-Allow-Origin"))
	assert.Contains(t, rec.Header().Get("Access-Control-Allow-Methods"), "PATCH")
	allowed := strings.ToLower(rec.Header().Get("Access-Control-Allow-Headers"))
	assert.Contains(t, allowed, "authorization")
	assert.Contains(t, allowed, "content-type")
	assert.Empty(t, rec.Header().Get("Access-Control-Allow-Credentials"), "no cookies are used")
	assert.Contains(t, rec.Header().Values("Vary"), "Origin")
}

func TestCORS_DevelopmentMarksResponsesForTheWebPreview(t *testing.T) {
	h := handler(t, devOrigins("http://localhost:8081"))

	rec := do(t, h, http.MethodGet, "/healthz", "", map[string]string{"Origin": "http://localhost:8081"})
	assert.Equal(t, http.StatusOK, rec.Code)
	assert.Equal(t, "http://localhost:8081", rec.Header().Get("Access-Control-Allow-Origin"))

	rec = do(t, h, http.MethodGet, "/me", "", map[string]string{"Origin": "http://localhost:8081"})
	assertError(t, rec, http.StatusUnauthorized, "unauthenticated")
	assert.Equal(t, "http://localhost:8081", rec.Header().Get("Access-Control-Allow-Origin"),
		"error answers must be readable by the preview too")
}

func TestCORS_DevelopmentIgnoresOriginsNotOnTheAllowlist(t *testing.T) {
	h := handler(t, devOrigins("http://localhost:8081"))

	rec := preflight(t, h, "http://evil.example")
	assert.Empty(t, rec.Header().Get("Access-Control-Allow-Origin"))
	assert.Empty(t, rec.Header().Get("Access-Control-Allow-Methods"))

	rec = do(t, h, http.MethodGet, "/healthz", "", map[string]string{"Origin": "http://evil.example"})
	assert.Empty(t, rec.Header().Get("Access-Control-Allow-Origin"))
}

func TestCORS_DevelopmentUsesTheConfiguredAllowlist(t *testing.T) {
	h := handler(t, devOrigins("http://127.0.0.1:8081", "http://localhost:19006"))

	assert.Equal(t, "http://localhost:19006", preflight(t, h, "http://localhost:19006").Header().Get("Access-Control-Allow-Origin"))
	assert.Equal(t, "http://127.0.0.1:8081", preflight(t, h, "http://127.0.0.1:8081").Header().Get("Access-Control-Allow-Origin"))
	assert.Empty(t, preflight(t, h, "http://localhost:8081").Header().Get("Access-Control-Allow-Origin"))
}

func TestCORS_ProductionHasNoCrossOriginHandling(t *testing.T) {
	h := handler(t, production)

	rec := preflight(t, h, "http://localhost:8081")
	assertError(t, rec, http.StatusMethodNotAllowed, "request_invalid")
	for k := range rec.Header() {
		assert.NotContains(t, k, "Access-Control-", "no CORS header in production")
	}

	rec = do(t, h, http.MethodGet, "/healthz", "", map[string]string{"Origin": "http://localhost:8081"})
	assert.Equal(t, http.StatusOK, rec.Code)
	for k := range rec.Header() {
		assert.NotContains(t, k, "Access-Control-", "no CORS header in production")
	}
}

func TestCORS_ProductionRefusesAnAllowlist(t *testing.T) {
	_, err := server.NewHandler(options(func(o *server.Options) {
		o.Environment = config.Production
		o.CORSAllowedOrigins = []string{"http://localhost:8081"}
	}))

	require.Error(t, err)
}

// --- Construction ---

func TestNewHandler_RequiresItsDependencies(t *testing.T) {
	for name, mod := range map[string]func(*server.Options){
		"no database":    func(o *server.Options) { o.DB = nil },
		"no sessions":    func(o *server.Options) { o.Sessions = nil },
		"no logger":      func(o *server.Options) { o.Logger = nil },
		"no environment": func(o *server.Options) { o.Environment = "" },
	} {
		t.Run(name, func(t *testing.T) {
			_, err := server.NewHandler(options(mod))
			require.Error(t, err)
		})
	}
}

func TestNew_SetsTimeoutsOnTheHTTPServer(t *testing.T) {
	srv, err := server.New("127.0.0.1:0", options())
	require.NoError(t, err)

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

	ts := httptest.NewServer(handler(t, func(o *server.Options) { o.DB = pool }))
	defer ts.Close()

	resp, err := http.Get(ts.URL + "/healthz")
	require.NoError(t, err)
	defer resp.Body.Close()

	assert.Equal(t, http.StatusOK, resp.StatusCode)
	b, err := io.ReadAll(resp.Body)
	require.NoError(t, err)
	assert.JSONEq(t, `{"status":"ok"}`, string(b))
}
