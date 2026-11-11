package server

// The middleware around the generated router: the session check hook,
// Cache-Control for calls that carry a session token, request body limits,
// cross-origin access for the local web preview in development, and panic
// recovery.
//
// spec: ADR-0004, ADR-0005, ADR-0009, NFR-PRIV-003

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

// Request body limits (NFR-PRIV-003, ADR-0005). They are applied before the
// contract validation and the session check, which read the whole body into
// memory. The photo limit covers the whole multipart request; the photo
// itself may be up to about 15 MB (tech/architecture.md → Storage).
const (
	maxJSONBodyBytes     = 64 << 10
	maxPhotoRequestBytes = 16 << 20
)

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

// photoUploadOperation is the one operation with the larger body limit.
const photoUploadOperation = "putSignUpPhoto"

// bodyLimit returns the body limit of an operation and the code a body over
// it is refused with (413): `photo_too_large` for the photo upload,
// `request_invalid` for every other call.
func bodyLimit(route *routers.Route) (int64, api.ErrorCode) {
	if route != nil && route.Operation != nil && route.Operation.OperationID == photoUploadOperation {
		return maxPhotoRequestBytes, api.ErrorCodePhotoTooLarge
	}
	return maxJSONBodyBytes, api.ErrorCodeRequestInvalid
}

// limitBodies caps every request body before the validator reads it, so no
// caller, signed in or not, can make the server hold more than the limit in
// memory. A declared length over the limit is refused at once; a body of
// unknown length stops at the limit while being read, and the validation
// error handler answers it. A body sent to an operation that the contract
// gives no body is never read.
func limitBodies(router routers.Router, next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		route, _, err := router.FindRoute(r)
		if err != nil || route.Operation == nil || route.Operation.RequestBody == nil {
			r.Body = http.NoBody
			r.ContentLength = 0
			next.ServeHTTP(w, r)
			return
		}
		limit, code := bodyLimit(route)
		if r.ContentLength > limit {
			writeError(w, http.StatusRequestEntityTooLarge, code)
			return
		}
		r.Body = http.MaxBytesReader(w, r.Body, limit)
		next.ServeHTTP(w, r)
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
