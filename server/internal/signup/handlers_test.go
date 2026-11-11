package signup_test

// Covers: ADR-0004 groundwork (CR-0001.T08): until CR-0001.T12 fills them,
// the sign-up operations answer the contract's 500 `internal_error`.

import (
	"context"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"

	"github.com/bregy1/together/server/internal/api"
	"github.com/bregy1/together/server/internal/signup"
)

func TestStubsAnswerInternalError(t *testing.T) {
	h := signup.New()
	ctx := context.Background()

	cases := map[string]func(w http.ResponseWriter) error{
		"updateSignUpAbout": func(w http.ResponseWriter) error {
			r, err := h.UpdateSignUpAbout(ctx, api.UpdateSignUpAboutRequestObject{})
			require.NoError(t, err)
			return r.VisitUpdateSignUpAboutResponse(w)
		},
		"setSignUpInterests": func(w http.ResponseWriter) error {
			r, err := h.SetSignUpInterests(ctx, api.SetSignUpInterestsRequestObject{})
			require.NoError(t, err)
			return r.VisitSetSignUpInterestsResponse(w)
		},
		"setSignUpStep": func(w http.ResponseWriter) error {
			r, err := h.SetSignUpStep(ctx, api.SetSignUpStepRequestObject{})
			require.NoError(t, err)
			return r.VisitSetSignUpStepResponse(w)
		},
		"finishSignUp": func(w http.ResponseWriter) error {
			r, err := h.FinishSignUp(ctx, api.FinishSignUpRequestObject{})
			require.NoError(t, err)
			return r.VisitFinishSignUpResponse(w)
		},
		"searchMunicipalities": func(w http.ResponseWriter) error {
			r, err := h.SearchMunicipalities(ctx, api.SearchMunicipalitiesRequestObject{})
			require.NoError(t, err)
			return r.VisitSearchMunicipalitiesResponse(w)
		},
		"listInterests": func(w http.ResponseWriter) error {
			r, err := h.ListInterests(ctx, api.ListInterestsRequestObject{})
			require.NoError(t, err)
			return r.VisitListInterestsResponse(w)
		},
	}
	for name, call := range cases {
		t.Run(name, func(t *testing.T) {
			rec := httptest.NewRecorder()
			require.NoError(t, call(rec))
			assert.Equal(t, http.StatusInternalServerError, rec.Code)
			assert.JSONEq(t, `{"code":"internal_error"}`, rec.Body.String())
		})
	}
}
