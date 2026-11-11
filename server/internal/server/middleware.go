package server

// The middleware around the generated router: the session check hook,
// Cache-Control for calls that carry a session token, cross-origin access
// for the local web preview in development, and panic recovery.
//
// spec: ADR-0004, ADR-0005, ADR-0009

import (
	"context"
	"errors"
	"fmt"
	"log/slog"
	"net/http"
	"runtime/debug"
	"strings"

	"github.com/getkin/kin-openapi/openapi3filter"
	"github.com/getkin/kin-openapi/routers"

	"github.com/bregy1/together/server/internal/api"
	"github.com/bregy1/together/server/internal/server/session"
)

// sessionScheme is the name of the security scheme in api/openapi.yaml.
const sessionScheme = "session"

// maxTokenLength bounds the bearer token before it reaches the verifier;
// real tokens (256 random bits, ADR-0005) are far shorter.
const maxTokenLength = 256

// errNoSession means the request carries no usable session; answered 401.
var errNoSession = errors.New("no valid session")

// sessionStoreError means the verifier failed for another reason than an
// unknown token; answered 500.
type sessionStoreError struct{ err error }

func (e *sessionStoreError) Error() string { return "session store failed: " + e.err.Error() }
func (e *sessionStoreError) Unwrap() error { return e.err }

// authenticate is the kin-openapi hook called for operations that require
// the session scheme. It reads `Authorization: Bearer <token>`, asks the
// verifier and records the session for the handler. The token is never
// logged or put into an error.
func authenticate(v session.Verifier) openapi3filter.AuthenticationFunc {
	return func(ctx context.Context, in *openapi3filter.AuthenticationInput) error {
		if in.SecuritySchemeName != sessionScheme {
			return errNoSession
		}
		token, ok := bearerToken(in.RequestValidationInput.Request.Header.Get("Authorization"))
		if !ok {
			return errNoSession
		}
		s, err := v.Verify(ctx, token)
		if errors.Is(err, session.ErrNotFound) {
			return errNoSession
		}
		if err != nil {
			return &sessionStoreError{err: err}
		}
		if !session.Attach(ctx, s) {
			return &sessionStoreError{err: errors.New("request context has no session holder")}
		}
		return nil
	}
}

// bearerToken extracts the token of an `Authorization: Bearer <token>`
// header; the scheme name is case-insensitive (RFC 9110).
func bearerToken(header string) (string, bool) {
	scheme, token, found := strings.Cut(header, " ")
	if !found || !strings.EqualFold(scheme, "Bearer") {
		return "", false
	}
	if token == "" || len(token) > maxTokenLength || strings.ContainsAny(token, " \t") {
		return "", false
	}
	return token, true
}

// carriesToken reports whether an operation's request or response carries
// a session token: every operation that requires the session scheme, and
// verifyLoginCode, which returns a new token.
func carriesToken(route *routers.Route) bool {
	if route.Operation == nil {
		return false
	}
	if route.Operation.OperationID == "verifyLoginCode" {
		return true
	}
	security := route.Operation.Security
	if security == nil {
		security = &route.Spec.Security
	}
	for _, requirement := range *security {
		if _, ok := requirement[sessionScheme]; ok {
			return true
		}
	}
	return false
}

// sessionContext marks responses to calls that carry or return a session
// token with `Cache-Control: no-store` (including error answers), and
// prepares the request context to receive the verified session.
func sessionContext(router routers.Router, next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		noStore := r.Header.Get("Authorization") != ""
		if !noStore {
			if route, _, err := router.FindRoute(r); err == nil {
				noStore = carriesToken(route)
			}
		}
		if noStore {
			w.Header().Set("Cache-Control", "no-store")
		}
		next.ServeHTTP(w, r.WithContext(session.WithHolder(r.Context())))
	})
}

// Cross-origin settings for the local web preview (development only).
const (
	corsAllowMethods = "GET, POST, PUT, PATCH, DELETE"
	corsAllowHeaders = "Authorization, Content-Type"
	corsMaxAge       = "600"
)

// devCORS lets the browser origins in allowed call the API, so the Expo web
// preview on the developer machine can reach the server (ADR-0009). It is
// installed in development only; production has no cross-origin handling.
// No cookies are used, so credentials are not allowed.
func devCORS(allowed []string, next http.Handler) http.Handler {
	origins := make(map[string]bool, len(allowed))
	for _, o := range allowed {
		origins[o] = true
	}
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		h := w.Header()
		h.Add("Vary", "Origin")
		origin := r.Header.Get("Origin")
		if origin == "" || !origins[origin] {
			next.ServeHTTP(w, r)
			return
		}
		h.Set("Access-Control-Allow-Origin", origin)
		if r.Method == http.MethodOptions && r.Header.Get("Access-Control-Request-Method") != "" {
			h.Add("Vary", "Access-Control-Request-Method")
			h.Add("Vary", "Access-Control-Request-Headers")
			h.Set("Access-Control-Allow-Methods", corsAllowMethods)
			h.Set("Access-Control-Allow-Headers", corsAllowHeaders)
			h.Set("Access-Control-Max-Age", corsMaxAge)
			w.WriteHeader(http.StatusNoContent)
			return
		}
		next.ServeHTTP(w, r)
	})
}

// headerTracker remembers whether the response has started.
type headerTracker struct {
	http.ResponseWriter
	wroteHeader bool
}

func (t *headerTracker) WriteHeader(code int) {
	t.wroteHeader = true
	t.ResponseWriter.WriteHeader(code)
}

func (t *headerTracker) Write(b []byte) (int, error) {
	t.wroteHeader = true
	return t.ResponseWriter.Write(b)
}

// Unwrap lets http.ResponseController reach the underlying writer.
func (t *headerTracker) Unwrap() http.ResponseWriter { return t.ResponseWriter }

// recoverPanics answers a panic with 500 `internal_error` when the response
// has not started. It logs the panic's type and the stack, not its value,
// which may hold request data.
func recoverPanics(logger *slog.Logger, next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		tw := &headerTracker{ResponseWriter: w}
		defer func() {
			v := recover()
			if v == nil {
				return
			}
			if v == http.ErrAbortHandler {
				panic(v)
			}
			logger.ErrorContext(r.Context(), "panic while serving a request",
				"method", r.Method, "panic_type", fmt.Sprintf("%T", v), "stack", string(debug.Stack()))
			if !tw.wroteHeader {
				writeError(tw, http.StatusInternalServerError, api.ErrorCodeInternalError)
			}
		}()
		next.ServeHTTP(tw, r)
	})
}
