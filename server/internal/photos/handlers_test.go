package photos_test

// Covers: ADR-0004 groundwork (CR-0001.T08): until CR-0001.T13 fills them,
// the photo operations answer the contract's 500 `internal_error`.

import (
	"context"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"

	"github.com/bregy1/together/server/internal/api"
	"github.com/bregy1/together/server/internal/photos"
)

func TestStubsAnswerInternalError(t *testing.T) {
	h := photos.New()
	ctx := context.Background()

	cases := map[string]func(w http.ResponseWriter) error{
		"putSignUpPhoto": func(w http.ResponseWriter) error {
			r, err := h.PutSignUpPhoto(ctx, api.PutSignUpPhotoRequestObject{})
			require.NoError(t, err)
			return r.VisitPutSignUpPhotoResponse(w)
		},
		"getSignUpPhoto": func(w http.ResponseWriter) error {
			r, err := h.GetSignUpPhoto(ctx, api.GetSignUpPhotoRequestObject{})
			require.NoError(t, err)
			return r.VisitGetSignUpPhotoResponse(w)
		},
		"deleteSignUpPhoto": func(w http.ResponseWriter) error {
			r, err := h.DeleteSignUpPhoto(ctx, api.DeleteSignUpPhotoRequestObject{})
			require.NoError(t, err)
			return r.VisitDeleteSignUpPhotoResponse(w)
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
