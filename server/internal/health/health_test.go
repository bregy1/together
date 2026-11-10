package health_test

// Covers: ADR-0004 groundwork (CR-0001.T01); the ADR has no scenarios.

import (
	"context"
	"errors"
	"testing"
	"time"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"

	"github.com/bregy1/together/server/internal/api"
	"github.com/bregy1/together/server/internal/health"
)

type fakePinger struct {
	err      error
	deadline bool
}

func (f *fakePinger) Ping(ctx context.Context) error {
	_, f.deadline = ctx.Deadline()
	return f.err
}

func TestGetHealthz_AnswersOKWhenTheDatabaseAnswers(t *testing.T) {
	db := &fakePinger{}
	resp, err := health.New(db).GetHealthz(context.Background(), api.GetHealthzRequestObject{})
	require.NoError(t, err)

	assert.Equal(t, api.GetHealthz200JSONResponse{Status: api.Ok}, resp)
	assert.True(t, db.deadline, "the database ping must be bounded by a timeout")
}

func TestGetHealthz_AnswersUnavailableWhenTheDatabaseDoesNot(t *testing.T) {
	resp, err := health.New(&fakePinger{err: errors.New("connection refused")}).
		GetHealthz(context.Background(), api.GetHealthzRequestObject{})
	require.NoError(t, err)

	assert.Equal(t, api.GetHealthz503JSONResponse{Status: api.Unavailable}, resp)
}

func TestNew_UsesAShortPingTimeout(t *testing.T) {
	assert.LessOrEqual(t, health.PingTimeout, 5*time.Second)
	assert.Greater(t, health.PingTimeout, time.Duration(0))
}
