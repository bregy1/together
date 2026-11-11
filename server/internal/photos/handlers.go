// Package photos implements the sign-up photo operations of the API
// contract (/signup/photos/{slot} in api/openapi.yaml).
//
// Until CR-0001.T13 fills them, every operation answers the contract's 500
// `internal_error` (the contract has no "not implemented" code).
//
// spec: ADR-0004
package photos

import (
	"context"

	"github.com/bregy1/together/server/internal/api"
)

// Handlers implements the photo operations of api.StrictServerInterface.
type Handlers struct{}

// New returns the photo handlers.
func New() *Handlers { return &Handlers{} }

var notImplemented = api.InternalErrorJSONResponse{Code: api.ErrorCodeInternalError}

// PutSignUpPhoto implements PUT /signup/photos/{slot}.
func (h *Handlers) PutSignUpPhoto(context.Context, api.PutSignUpPhotoRequestObject) (api.PutSignUpPhotoResponseObject, error) {
	return api.PutSignUpPhoto500JSONResponse{InternalErrorJSONResponse: notImplemented}, nil
}

// GetSignUpPhoto implements GET /signup/photos/{slot}.
func (h *Handlers) GetSignUpPhoto(context.Context, api.GetSignUpPhotoRequestObject) (api.GetSignUpPhotoResponseObject, error) {
	return api.GetSignUpPhoto500JSONResponse{InternalErrorJSONResponse: notImplemented}, nil
}

// DeleteSignUpPhoto implements DELETE /signup/photos/{slot}.
func (h *Handlers) DeleteSignUpPhoto(context.Context, api.DeleteSignUpPhotoRequestObject) (api.DeleteSignUpPhotoResponseObject, error) {
	return api.DeleteSignUpPhoto500JSONResponse{InternalErrorJSONResponse: notImplemented}, nil
}
