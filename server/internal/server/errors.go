package server

// One error shape for everything the wiring answers (the contract's Error
// body), and the mapping of validation failures to it. Neither responses
// nor logs ever carry request values: a phone number, a login code or a
// session token must never appear in either.
//
// spec: ADR-0004, NFR-PRIV-002

import (
	"context"
	"encoding/json"
	"errors"
	"log/slog"
	"net/http"
	"regexp"
	"strings"

	"github.com/getkin/kin-openapi/openapi3"
	"github.com/getkin/kin-openapi/openapi3filter"
	"github.com/getkin/kin-openapi/routers"
	nethttpmiddleware "github.com/oapi-codegen/nethttp-middleware"

	"github.com/bregy1/together/server/internal/api"
)

// writeError answers with the contract's Error body carrying only code.
func writeError(w http.ResponseWriter, status int, code api.ErrorCode) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	_ = json.NewEncoder(w).Encode(api.Error{Code: code})
}

// validationErrorHandler maps what the request validator refuses to the
// contract's error codes:
//   - no route for the path: 404 `not_found` (not logged: the path may hold anything);
//   - the path exists with other methods: 405 `request_invalid` with Allow;
//   - the session store failed: 500 `internal_error`;
//   - missing, malformed or unknown session token: 401 `unauthenticated`;
//   - the request breaks the contract: 400 `request_invalid`.
func validationErrorHandler(logger *slog.Logger, router routers.Router) nethttpmiddleware.ErrorHandlerWithOpts {
	return func(ctx context.Context, err error, w http.ResponseWriter, r *http.Request, opts nethttpmiddleware.ErrorHandlerOpts) {
		if opts.MatchedRoute == nil || opts.MatchedRoute.Route == nil {
			if errors.Is(err, routers.ErrMethodNotAllowed) {
				w.Header().Set("Allow", allowedMethods(router, r))
				writeError(w, http.StatusMethodNotAllowed, api.ErrorCodeRequestInvalid)
				return
			}
			writeError(w, http.StatusNotFound, api.ErrorCodeNotFound)
			return
		}
		route := opts.MatchedRoute.Route
		operation := ""
		if route.Operation != nil {
			operation = route.Operation.OperationID
		}

		var storeErr *sessionStoreError
		var securityErr *openapi3filter.SecurityRequirementsError
		var requestErr *openapi3filter.RequestError
		switch {
		case errors.As(err, &storeErr):
			logger.ErrorContext(ctx, "session check failed", "operation", operation, "error", storeErr.err)
			writeError(w, http.StatusInternalServerError, api.ErrorCodeInternalError)
		case errors.As(err, &securityErr):
			w.Header().Set("WWW-Authenticate", "Bearer")
			writeError(w, http.StatusUnauthorized, api.ErrorCodeUnauthenticated)
		case errors.As(err, &requestErr):
			logger.WarnContext(ctx, "request rejected", append([]any{"operation", operation}, describeRequestError(requestErr)...)...)
			writeError(w, http.StatusBadRequest, api.ErrorCodeRequestInvalid)
		default:
			// Unknown validator failure; its text may quote the request.
			logger.ErrorContext(ctx, "request validation failed", "operation", operation)
			writeError(w, http.StatusInternalServerError, api.ErrorCodeInternalError)
		}
	}
}

// methodsInOrder are the methods the contract may use, in the order the
// Allow header lists them.
var methodsInOrder = []string{http.MethodDelete, http.MethodGet, http.MethodPatch, http.MethodPost, http.MethodPut}

// allowedMethods lists the methods the contract defines for r's path.
func allowedMethods(router routers.Router, r *http.Request) string {
	var allowed []string
	for _, m := range methodsInOrder {
		probe := r.Clone(r.Context())
		probe.Method = m
		if _, _, err := router.FindRoute(probe); err == nil {
			allowed = append(allowed, m)
		}
	}
	return strings.Join(allowed, ", ")
}

// safeSegment is a part of a JSON pointer that is safe to log: a property
// name as the contract spells them, or a small array index. Anything else
// (a property name a client made up could be a phone number) is masked.
var safeSegment = regexp.MustCompile(`^([A-Za-z][A-Za-z0-9]{0,63}|[0-9]{1,3})$`)

// describeRequestError returns log attributes that say where and which rule
// a request broke, without any value from the request.
func describeRequestError(e *openapi3filter.RequestError) []any {
	var attrs []any
	switch {
	case e.Parameter != nil:
		attrs = append(attrs, "in", e.Parameter.In, "parameter", e.Parameter.Name)
	case e.RequestBody != nil:
		attrs = append(attrs, "in", "body")
	}
	var schemaErr *openapi3.SchemaError
	if errors.As(e.Err, &schemaErr) {
		segments := schemaErr.JSONPointer()
		for i, s := range segments {
			if !safeSegment.MatchString(s) {
				segments[i] = "*"
			}
		}
		attrs = append(attrs, "field", "/"+strings.Join(segments, "/"), "rule", schemaErr.SchemaField)
	}
	return attrs
}
