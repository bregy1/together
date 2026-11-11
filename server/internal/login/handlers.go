// Package login implements the login operations of the API contract: login
// codes, device sessions and the caller's own state (tag `login` in
// api/openapi.yaml).
//
// Until CR-0001.T11 fills them, every operation answers the contract's 500
// `internal_error` (the contract has no "not implemented" code).
//
// spec: ADR-0004, ADR-0005
package login

import (
	"context"

	"github.com/bregy1/together/server/internal/api"
)

// Handlers implements the login operations of api.StrictServerInterface.
type Handlers struct{}

// New returns the login handlers.
func New() *Handlers { return &Handlers{} }

var notImplemented = api.InternalErrorJSONResponse{Code: api.ErrorCodeInternalError}

// RequestLoginCode implements POST /login/code-requests.
func (h *Handlers) RequestLoginCode(context.Context, api.RequestLoginCodeRequestObject) (api.RequestLoginCodeResponseObject, error) {
	return api.RequestLoginCode500JSONResponse{InternalErrorJSONResponse: notImplemented}, nil
}

// VerifyLoginCode implements POST /login/code-verifications.
func (h *Handlers) VerifyLoginCode(context.Context, api.VerifyLoginCodeRequestObject) (api.VerifyLoginCodeResponseObject, error) {
	return api.VerifyLoginCode500JSONResponse{InternalErrorJSONResponse: notImplemented}, nil
}

// GetMe implements GET /me.
func (h *Handlers) GetMe(context.Context, api.GetMeRequestObject) (api.GetMeResponseObject, error) {
	return api.GetMe500JSONResponse{InternalErrorJSONResponse: notImplemented}, nil
}
