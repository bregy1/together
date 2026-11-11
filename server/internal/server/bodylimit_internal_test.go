package server

// Covers: NFR-PRIV-003 and ADR-0005 groundwork (CR-0001 review fix); these
// have no scenarios for the wiring. Every request body is capped before the
// contract validation and the session check read it: 64 KB for JSON calls,
// 16 MB for the whole photo upload. A body over its limit is refused with
// 413 and the contract's Error body, and the operation is never called.

import (
	"bytes"
	"context"
	"io"
	"log/slog"
	"mime/multipart"
	"net/http"
	"net/http/httptest"
	"net/textproto"
	"strings"
	"sync"
	"testing"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"

	"github.com/bregy1/together/server/internal/api"
	"github.com/bregy1/together/server/internal/config"
	"github.com/bregy1/together/server/internal/server/session"
	"github.com/bregy1/together/server/internal/server/session/sessiontest"
)

const limitToken = "limit-token"

// callSpy records which operations were reached and otherwise answers like
// the composed implementation.
type callSpy struct {
	api.StrictServerInterface
	mu    sync.Mutex
	calls []string
}

func (s *callSpy) record(name string) {
	s.mu.Lock()
	defer s.mu.Unlock()
	s.calls = append(s.calls, name)
}

func (s *callSpy) called() []string {
	s.mu.Lock()
	defer s.mu.Unlock()
	return append([]string(nil), s.calls...)
}

func (s *callSpy) RequestLoginCode(ctx context.Context, r api.RequestLoginCodeRequestObject) (api.RequestLoginCodeResponseObject, error) {
	s.record("requestLoginCode")
	return s.StrictServerInterface.RequestLoginCode(ctx, r)
}

func (s *callSpy) SetSignUpStep(ctx context.Context, r api.SetSignUpStepRequestObject) (api.SetSignUpStepResponseObject, error) {
	s.record("setSignUpStep")
	return s.StrictServerInterface.SetSignUpStep(ctx, r)
}

func (s *callSpy) PutSignUpPhoto(ctx context.Context, r api.PutSignUpPhotoRequestObject) (api.PutSignUpPhotoResponseObject, error) {
	s.record("putSignUpPhoto")
	return s.StrictServerInterface.PutSignUpPhoto(ctx, r)
}

func (s *callSpy) GetMe(ctx context.Context, r api.GetMeRequestObject) (api.GetMeResponseObject, error) {
	s.record("getMe")
	return s.StrictServerInterface.GetMe(ctx, r)
}

func limitHandler(t *testing.T) (http.Handler, *callSpy) {
	t.Helper()
	opts := Options{
		DB:          nopPinger{},
		Sessions:    sessiontest.NewFake(map[string]session.Session{limitToken: {ID: "s-1"}}),
		Logger:      slog.New(slog.NewTextHandler(io.Discard, nil)),
		Environment: config.Development,
	}
	s := &callSpy{StrictServerInterface: newOperations(opts)}
	h, err := newHandler(opts, s)
	require.NoError(t, err)
	return h, s
}

// unknownLength hides the length of a body, as a chunked upload does.
type unknownLength struct{ io.Reader }

// paddedJSON returns body padded with trailing spaces to exactly n bytes;
// whitespace keeps it valid JSON.
func paddedJSON(t *testing.T, body string, n int) string {
	t.Helper()
	require.LessOrEqual(t, len(body), n)
	return body + strings.Repeat(" ", n-len(body))
}

// photoRequest builds a multipart photo upload of exactly total bytes.
func photoRequest(t *testing.T, total int) (*bytes.Buffer, string) {
	t.Helper()
	build := func(fileSize int) (*bytes.Buffer, string) {
		var buf bytes.Buffer
		mw := multipart.NewWriter(&buf)
		require.NoError(t, mw.SetBoundary("limit-test-boundary"))
		part, err := mw.CreatePart(textproto.MIMEHeader{
			"Content-Disposition": {`form-data; name="photo"; filename="p"`},
			"Content-Type":        {"image/jpeg"},
		})
		require.NoError(t, err)
		data := make([]byte, fileSize)
		copy(data, []byte{0xFF, 0xD8, 0xFF, 0xE0})
		_, err = part.Write(data)
		require.NoError(t, err)
		require.NoError(t, mw.Close())
		return &buf, mw.FormDataContentType()
	}
	empty, _ := build(0)
	buf, contentType := build(total - empty.Len())
	require.Equal(t, total, buf.Len())
	return buf, contentType
}

func send(h http.Handler, method, path string, body io.Reader, contentType, token string) *httptest.ResponseRecorder {
	req := httptest.NewRequest(method, path, body)
	if contentType != "" {
		req.Header.Set("Content-Type", contentType)
	}
	if token != "" {
		req.Header.Set("Authorization", "Bearer "+token)
	}
	if _, ok := body.(unknownLength); ok {
		req.ContentLength = -1
	}
	rec := httptest.NewRecorder()
	h.ServeHTTP(rec, req)
	return rec
}

func assertRefused(t *testing.T, rec *httptest.ResponseRecorder, code api.ErrorCode) {
	t.Helper()
	assert.Equal(t, http.StatusRequestEntityTooLarge, rec.Code)
	assert.Equal(t, string(code), errorCode(t, rec))
}

func TestBodyLimit_TheLimitsAreNamed(t *testing.T) {
	assert.EqualValues(t, 64<<10, maxJSONBodyBytes)
	assert.EqualValues(t, 16<<20, maxPhotoRequestBytes)
}

func TestBodyLimit_RefusesAnOversizedJSONBodyWithoutCallingTheOperation(t *testing.T) {
	body := paddedJSON(t, `{"phoneNumber":"+41791234567"}`, maxJSONBodyBytes+1)
	for name, r := range map[string]io.Reader{
		"declared length": strings.NewReader(body),
		"unknown length":  unknownLength{strings.NewReader(body)},
	} {
		t.Run(name, func(t *testing.T) {
			h, spy := limitHandler(t)

			rec := send(h, http.MethodPost, "/login/code-requests", r, "application/json", "")

			assertRefused(t, rec, api.ErrorCodeRequestInvalid)
			assert.Empty(t, spy.called())
		})
	}
}

func TestBodyLimit_LetsAJSONBodyAtTheLimitThrough(t *testing.T) {
	h, spy := limitHandler(t)
	body := paddedJSON(t, `{"phoneNumber":"+41791234567"}`, maxJSONBodyBytes)

	rec := send(h, http.MethodPost, "/login/code-requests", unknownLength{strings.NewReader(body)}, "application/json", "")

	assert.Equal(t, http.StatusInternalServerError, rec.Code, "the stub answers once the body passes")
	assert.Equal(t, []string{"requestLoginCode"}, spy.called())
}

func TestBodyLimit_RefusesAnOversizedJSONBodyEvenWithoutAValidSession(t *testing.T) {
	body := paddedJSON(t, `{"step":"interests"}`, maxJSONBodyBytes+1)
	for name, token := range map[string]string{"no session": "", "unknown token": "unknown-token", "valid session": limitToken} {
		for kind, r := range map[string]func() io.Reader{
			"declared length": func() io.Reader { return strings.NewReader(body) },
			"unknown length":  func() io.Reader { return unknownLength{strings.NewReader(body)} },
		} {
			t.Run(name+"/"+kind, func(t *testing.T) {
				h, spy := limitHandler(t)

				rec := send(h, http.MethodPut, "/signup/step", r(), "application/json", token)

				assertRefused(t, rec, api.ErrorCodeRequestInvalid)
				assert.Empty(t, spy.called())
			})
		}
	}
}

func TestBodyLimit_RefusesAnOversizedPhotoUploadWithoutCallingTheOperation(t *testing.T) {
	buf, contentType := photoRequest(t, maxPhotoRequestBytes+1)
	data := buf.Bytes()
	for name, token := range map[string]string{"no session": "", "unknown token": "unknown-token", "valid session": limitToken} {
		for kind, r := range map[string]func() io.Reader{
			"declared length": func() io.Reader { return bytes.NewReader(data) },
			"unknown length":  func() io.Reader { return unknownLength{bytes.NewReader(data)} },
		} {
			t.Run(name+"/"+kind, func(t *testing.T) {
				h, spy := limitHandler(t)

				rec := send(h, http.MethodPut, "/signup/photos/0", r(), contentType, token)

				assertRefused(t, rec, api.ErrorCodePhotoTooLarge)
				assert.Empty(t, spy.called())
			})
		}
	}
}

func TestBodyLimit_LetsAPhotoUploadAtTheLimitThrough(t *testing.T) {
	h, spy := limitHandler(t)
	buf, contentType := photoRequest(t, maxPhotoRequestBytes)

	rec := send(h, http.MethodPut, "/signup/photos/0", unknownLength{buf}, contentType, limitToken)

	assert.Equal(t, http.StatusInternalServerError, rec.Code, "the stub answers once the upload passes")
	assert.Equal(t, []string{"putSignUpPhoto"}, spy.called())
}

func TestBodyLimit_APhotoSizedBodyIsRefusedOnJSONCalls(t *testing.T) {
	h, spy := limitHandler(t)
	buf, contentType := photoRequest(t, maxJSONBodyBytes+1)

	rec := send(h, http.MethodPut, "/signup/step", buf, contentType, limitToken)

	assertRefused(t, rec, api.ErrorCodeRequestInvalid)
	assert.Empty(t, spy.called())
}

func TestBodyLimit_ABodyOnACallWithoutOneIsNeverRead(t *testing.T) {
	h, spy := limitHandler(t)
	body := strings.Repeat("x", maxJSONBodyBytes+1)

	rec := send(h, http.MethodGet, "/me", unknownLength{strings.NewReader(body)}, "application/json", limitToken)

	assert.Equal(t, http.StatusInternalServerError, rec.Code, "the stub answers; the body is ignored")
	assert.Equal(t, []string{"getMe"}, spy.called())
}
