// Package server assembles the HTTP handler from the generated API code and
// the operation implementations of each area, on the standard library
// router. Around the generated router it adds, from the outside in:
//
//  1. recovery from panics (500 `internal_error`);
//  2. in development only, cross-origin access for the local web preview;
//  3. `Cache-Control: no-store` on calls that carry or return a session
//     token, and the holder through which handlers learn the session;
//  4. request body limits (64 KB for JSON calls, 16 MB for the photo
//     upload), answered 413 before anything reads more;
//  5. request validation against the contract embedded in the generated
//     code, including the session check (nethttp-middleware, kin-openapi).
//
// Every error it writes carries the contract's Error body.
//
// spec: ADR-0004, ADR-0005, NFR-PRIV-003
package server

import (
	"errors"
	"fmt"
	"log/slog"
	"net/http"
	"time"

	"github.com/getkin/kin-openapi/openapi3filter"
	"github.com/getkin/kin-openapi/routers/gorillamux"
	nethttpmiddleware "github.com/oapi-codegen/nethttp-middleware"

	"github.com/bregy1/together/server/internal/api"
	"github.com/bregy1/together/server/internal/config"
	"github.com/bregy1/together/server/internal/health"
	"github.com/bregy1/together/server/internal/login"
	"github.com/bregy1/together/server/internal/photos"
	"github.com/bregy1/together/server/internal/server/session"
	"github.com/bregy1/together/server/internal/signup"
)

// Timeouts of the HTTP server.
const (
	readHeaderTimeout = 5 * time.Second
	readTimeout       = 15 * time.Second
	writeTimeout      = 30 * time.Second
	idleTimeout       = 60 * time.Second
)

// Options are what the HTTP handler is built from.
type Options struct {
	// DB is pinged by the health check.
	DB health.Pinger
	// Sessions verifies the bearer token of signed-in calls.
	Sessions session.Verifier
	// Logger receives the request log; never tokens, codes or phone numbers.
	Logger *slog.Logger
	// Environment is development or production.
	Environment config.Environment
	// CORSAllowedOrigins are the browser origins allowed cross-origin in
	// development. Must be empty in production.
	CORSAllowedOrigins []string
}

func (o Options) validate() error {
	var errs []error
	if o.DB == nil {
		errs = append(errs, errors.New("no database pinger"))
	}
	if o.Sessions == nil {
		errs = append(errs, errors.New("no session verifier"))
	}
	if o.Logger == nil {
		errs = append(errs, errors.New("no logger"))
	}
	if !o.Environment.Valid() {
		errs = append(errs, errors.New("no valid environment"))
	}
	if o.Environment.IsProduction() && len(o.CORSAllowedOrigins) > 0 {
		errs = append(errs, errors.New("cross-origin access is for development only"))
	}
	return errors.Join(errs...)
}

// The area types share the name Handlers; these aliases give the embedded
// fields of operations distinct names.
type (
	loginHandlers  = login.Handlers
	signupHandlers = signup.Handlers
	photoHandlers  = photos.Handlers
)

// operations implements api.StrictServerInterface by embedding the handlers
// of each area of the contract; each area's task edits only its own package.
type operations struct {
	*health.Handler
	*loginHandlers
	*signupHandlers
	*photoHandlers
}

var _ api.StrictServerInterface = operations{}

func newOperations(o Options) operations {
	return operations{
		Handler:        health.New(o.DB),
		loginHandlers:  login.New(),
		signupHandlers: signup.New(),
		photoHandlers:  photos.New(),
	}
}

// NewHandler returns the HTTP handler serving the API contract.
func NewHandler(o Options) (http.Handler, error) {
	if err := o.validate(); err != nil {
		return nil, fmt.Errorf("server options: %w", err)
	}
	return newHandler(o, newOperations(o))
}

// New returns an HTTP server for addr with timeouts set.
func New(addr string, o Options) (*http.Server, error) {
	h, err := NewHandler(o)
	if err != nil {
		return nil, err
	}
	return &http.Server{
		Addr:              addr,
		Handler:           h,
		ReadHeaderTimeout: readHeaderTimeout,
		ReadTimeout:       readTimeout,
		WriteTimeout:      writeTimeout,
		IdleTimeout:       idleTimeout,
		ErrorLog:          slog.NewLogLogger(o.Logger.Handler(), slog.LevelWarn),
	}, nil
}

func init() {
	// The photo upload's part is declared as image/jpeg or image/png
	// (api/openapi.yaml, putSignUpPhoto); kin-openapi knows no decoder for
	// these and would refuse every upload. The bytes are checked by the
	// photo handler, not here. The registry is global and not safe for
	// concurrent changes, hence once, at start.
	openapi3filter.RegisterBodyDecoder("image/jpeg", openapi3filter.FileBodyDecoder)
	openapi3filter.RegisterBodyDecoder("image/png", openapi3filter.FileBodyDecoder)
}

func newHandler(o Options, ops api.StrictServerInterface) (http.Handler, error) {
	// The contract is embedded in the generated code (oapi-codegen
	// embedded-spec), so the binary never reads api/openapi.yaml at run time.
	doc, err := api.GetSpec()
	if err != nil {
		return nil, fmt.Errorf("load embedded contract: %w", err)
	}
	// The contract's server URL "/" is not a host to check.
	doc.Servers = nil
	router, err := gorillamux.NewRouter(doc)
	if err != nil {
		return nil, fmt.Errorf("route embedded contract: %w", err)
	}

	logger := o.Logger
	strict := api.NewStrictHandlerWithOptions(ops, nil, api.StrictHTTPServerOptions{
		RequestErrorHandlerFunc: func(w http.ResponseWriter, r *http.Request, _ error) {
			// The decoder's message may quote the request; it is not logged.
			logger.WarnContext(r.Context(), "request rejected", "method", r.Method, "path", r.URL.Path, "reason", "body not decodable")
			writeError(w, http.StatusBadRequest, api.ErrorCodeRequestInvalid)
		},
		ResponseErrorHandlerFunc: func(w http.ResponseWriter, r *http.Request, err error) {
			logger.ErrorContext(r.Context(), "request failed", "method", r.Method, "path", r.URL.Path, "error", err)
			writeError(w, http.StatusInternalServerError, api.ErrorCodeInternalError)
		},
	})
	routes := api.HandlerWithOptions(strict, api.StdHTTPServerOptions{
		BaseRouter: http.NewServeMux(),
		ErrorHandlerFunc: func(w http.ResponseWriter, r *http.Request, _ error) {
			// Parameter binding failed after validation passed; the message
			// may quote the value, so it is not logged.
			logger.WarnContext(r.Context(), "request rejected", "method", r.Method, "path", r.URL.Path, "reason", "parameter not bindable")
			writeError(w, http.StatusBadRequest, api.ErrorCodeRequestInvalid)
		},
	})

	validate := nethttpmiddleware.OapiRequestValidatorWithOptions(doc, &nethttpmiddleware.Options{
		Options: openapi3filter.Options{
			AuthenticationFunc: authenticate(o.Sessions),
		},
		DoNotValidateServers: true,
		ErrorHandlerWithOpts: validationErrorHandler(logger, router),
	})

	var h http.Handler = validate(routes)
	h = limitBodies(router, h)
	h = sessionContext(router, h)
	if o.Environment == config.Development {
		h = devCORS(o.CORSAllowedOrigins, h)
	}
	h = recoverPanics(logger, h)
	return h, nil
}
