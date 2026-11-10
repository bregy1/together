// Package health implements the health check operation of the API contract
// (GET /healthz in api/openapi.yaml).
//
// spec: ADR-0004
package health

import (
	"context"
	"time"

	"github.com/bregy1/together/server/internal/api"
)

// PingTimeout bounds the database check, so a hanging database makes the
// health check answer "unavailable" instead of hanging too.
const PingTimeout = 2 * time.Second

// Pinger is the part of the database pool the health check needs.
type Pinger interface {
	Ping(ctx context.Context) error
}

// Handler answers the health check.
type Handler struct {
	db Pinger
}

// New returns a health check handler that pings db.
func New(db Pinger) *Handler {
	return &Handler{db: db}
}

// GetHealthz implements api.StrictServerInterface. It answers 200 "ok" when
// the database answers within PingTimeout, otherwise 503 "unavailable",
// without any detail about the cause.
func (h *Handler) GetHealthz(ctx context.Context, _ api.GetHealthzRequestObject) (api.GetHealthzResponseObject, error) {
	ctx, cancel := context.WithTimeout(ctx, PingTimeout)
	defer cancel()

	if err := h.db.Ping(ctx); err != nil {
		return api.GetHealthz503JSONResponse{Status: api.Unavailable}, nil
	}
	return api.GetHealthz200JSONResponse{Status: api.Ok}, nil
}
