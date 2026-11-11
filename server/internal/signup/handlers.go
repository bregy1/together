// Package signup implements the sign-up operations of the API contract: the
// steps of an unfinished sign-up and the lists it chooses from (tags
// `signup` and `reference` in api/openapi.yaml, except the photos).
//
// Until CR-0001.T12 fills them, every operation answers the contract's 500
// `internal_error` (the contract has no "not implemented" code).
//
// spec: ADR-0004
package signup

import (
	"context"

	"github.com/bregy1/together/server/internal/api"
)

// Handlers implements the sign-up operations of api.StrictServerInterface.
type Handlers struct{}

// New returns the sign-up handlers.
func New() *Handlers { return &Handlers{} }

var notImplemented = api.InternalErrorJSONResponse{Code: api.ErrorCodeInternalError}

// UpdateSignUpAbout implements PATCH /signup/about.
func (h *Handlers) UpdateSignUpAbout(context.Context, api.UpdateSignUpAboutRequestObject) (api.UpdateSignUpAboutResponseObject, error) {
	return api.UpdateSignUpAbout500JSONResponse{InternalErrorJSONResponse: notImplemented}, nil
}

// SetSignUpInterests implements PUT /signup/interests.
func (h *Handlers) SetSignUpInterests(context.Context, api.SetSignUpInterestsRequestObject) (api.SetSignUpInterestsResponseObject, error) {
	return api.SetSignUpInterests500JSONResponse{InternalErrorJSONResponse: notImplemented}, nil
}

// SetSignUpStep implements PUT /signup/step (ONB-008, ONB-020).
func (h *Handlers) SetSignUpStep(context.Context, api.SetSignUpStepRequestObject) (api.SetSignUpStepResponseObject, error) {
	return api.SetSignUpStep500JSONResponse{InternalErrorJSONResponse: notImplemented}, nil
}

// FinishSignUp implements POST /signup/finish.
func (h *Handlers) FinishSignUp(context.Context, api.FinishSignUpRequestObject) (api.FinishSignUpResponseObject, error) {
	return api.FinishSignUp500JSONResponse{InternalErrorJSONResponse: notImplemented}, nil
}

// SearchMunicipalities implements GET /municipalities.
func (h *Handlers) SearchMunicipalities(context.Context, api.SearchMunicipalitiesRequestObject) (api.SearchMunicipalitiesResponseObject, error) {
	return api.SearchMunicipalities500JSONResponse{InternalErrorJSONResponse: notImplemented}, nil
}

// ListInterests implements GET /interests.
func (h *Handlers) ListInterests(context.Context, api.ListInterestsRequestObject) (api.ListInterestsResponseObject, error) {
	return api.ListInterests500JSONResponse{InternalErrorJSONResponse: notImplemented}, nil
}
