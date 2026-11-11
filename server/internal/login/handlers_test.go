package login_test

// Covers: ADR-0004 groundwork (CR-0001.T08): until CR-0001.T11 fills them,
// the login operations answer the contract's 500 `internal_error`.

import (
	"context"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"

	"github.com/bregy1/together/server/internal/api"
	"github.com/bregy1/together/server/internal/login"
)

func TestStubsAnswerInternalError(t *testing.T) {
	h := login.New()
	ctx := context.Background()

	cases := map[string]func(w http.ResponseWriter) error{
		"requestLoginCode": func(w http.ResponseWriter) error {
			r, err := h.RequestLoginCode(ctx, api.RequestLoginCodeRequestObject{})
			require.NoError(t, err)
			return r.VisitRequestLoginCodeResponse(w)
		},
		"verifyLoginCode": func(w http.ResponseWriter) error {
			r, err := h.VerifyLoginCode(ctx, api.VerifyLoginCodeRequestObject{})
			require.NoError(t, err)
			return r.VisitVerifyLoginCodeResponse(w)
		},
		"getMe": func(w http.ResponseWriter) error {
			r, err := h.GetMe(ctx, api.GetMeRequestObject{})
			require.NoError(t, err)
			return r.VisitGetMeResponse(w)
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
