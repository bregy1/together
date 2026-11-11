package server

// Placeholder so the server builds after the sign-up contract was added
// (CR-0001.T04). CR-0001.T08 replaces it with the handler files of each area.
// Every operation here fails, which the strict handler answers with 500.
//
// spec: ADR-0004

import (
	"context"
	"errors"

	"github.com/bregy1/together/server/internal/api"
)

var errNotImplemented = errors.New("operation not implemented yet")

type notImplemented struct{}

func (notImplemented) ListInterests(context.Context, api.ListInterestsRequestObject) (api.ListInterestsResponseObject, error) {
	return nil, errNotImplemented
}

func (notImplemented) RequestLoginCode(context.Context, api.RequestLoginCodeRequestObject) (api.RequestLoginCodeResponseObject, error) {
	return nil, errNotImplemented
}

func (notImplemented) VerifyLoginCode(context.Context, api.VerifyLoginCodeRequestObject) (api.VerifyLoginCodeResponseObject, error) {
	return nil, errNotImplemented
}

func (notImplemented) GetMe(context.Context, api.GetMeRequestObject) (api.GetMeResponseObject, error) {
	return nil, errNotImplemented
}

func (notImplemented) SearchMunicipalities(context.Context, api.SearchMunicipalitiesRequestObject) (api.SearchMunicipalitiesResponseObject, error) {
	return nil, errNotImplemented
}

func (notImplemented) UpdateSignUpAbout(context.Context, api.UpdateSignUpAboutRequestObject) (api.UpdateSignUpAboutResponseObject, error) {
	return nil, errNotImplemented
}

func (notImplemented) FinishSignUp(context.Context, api.FinishSignUpRequestObject) (api.FinishSignUpResponseObject, error) {
	return nil, errNotImplemented
}

func (notImplemented) SetSignUpInterests(context.Context, api.SetSignUpInterestsRequestObject) (api.SetSignUpInterestsResponseObject, error) {
	return nil, errNotImplemented
}

func (notImplemented) DeleteSignUpPhoto(context.Context, api.DeleteSignUpPhotoRequestObject) (api.DeleteSignUpPhotoResponseObject, error) {
	return nil, errNotImplemented
}

func (notImplemented) GetSignUpPhoto(context.Context, api.GetSignUpPhotoRequestObject) (api.GetSignUpPhotoResponseObject, error) {
	return nil, errNotImplemented
}

func (notImplemented) PutSignUpPhoto(context.Context, api.PutSignUpPhotoRequestObject) (api.PutSignUpPhotoResponseObject, error) {
	return nil, errNotImplemented
}
