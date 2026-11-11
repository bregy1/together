// Package server assembles the HTTP handler from the generated API code and
// the operation implementations, on the standard library router.
//
// spec: ADR-0004
package server

import (
	"log/slog"
	"net/http"
	"time"

	"github.com/bregy1/together/server/internal/api"
	"github.com/bregy1/together/server/internal/health"
)

// Timeouts of the HTTP server.
const (
	readHeaderTimeout = 5 * time.Second
	readTimeout       = 15 * time.Second
	writeTimeout      = 30 * time.Second
	idleTimeout       = 60 * time.Second
)

// operations implements api.StrictServerInterface by embedding the handler of
// each area of the contract.
type operations struct {
	*health.Handler
	notImplemented // until CR-0001.T08
}

var _ api.StrictServerInterface = operations{}

// NewHandler returns the HTTP handler serving the API contract.
func NewHandler(db health.Pinger, logger *slog.Logger) http.Handler {
	ops := operations{Handler: health.New(db)}

	strict := api.NewStrictHandlerWithOptions(ops, nil, api.StrictHTTPServerOptions{
		RequestErrorHandlerFunc: func(w http.ResponseWriter, r *http.Request, err error) {
			logger.WarnContext(r.Context(), "request rejected", "method", r.Method, "path", r.URL.Path, "error", err)
			writeStatus(w, http.StatusBadRequest)
		},
		ResponseErrorHandlerFunc: func(w http.ResponseWriter, r *http.Request, err error) {
			logger.ErrorContext(r.Context(), "request failed", "method", r.Method, "path", r.URL.Path, "error", err)
			writeStatus(w, http.StatusInternalServerError)
		},
	})

	return api.HandlerWithOptions(strict, api.StdHTTPServerOptions{
		BaseRouter: http.NewServeMux(),
		ErrorHandlerFunc: func(w http.ResponseWriter, r *http.Request, err error) {
			logger.WarnContext(r.Context(), "request rejected", "method", r.Method, "path", r.URL.Path, "error", err)
			writeStatus(w, http.StatusBadRequest)
		},
	})
}

// New returns an HTTP server for addr with timeouts set.
func New(addr string, db health.Pinger, logger *slog.Logger) *http.Server {
	return &http.Server{
		Addr:              addr,
		Handler:           NewHandler(db, logger),
		ReadHeaderTimeout: readHeaderTimeout,
		ReadTimeout:       readTimeout,
		WriteTimeout:      writeTimeout,
		IdleTimeout:       idleTimeout,
		ErrorLog:          slog.NewLogLogger(logger.Handler(), slog.LevelWarn),
	}
}

// writeStatus answers with the bare status and no detail. The shared error
// shape of the API is defined with the contract (CR-0001.T04).
func writeStatus(w http.ResponseWriter, code int) {
	w.WriteHeader(code)
}
