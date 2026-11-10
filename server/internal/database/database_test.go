package database_test

// Covers: ADR-0004 groundwork (CR-0001.T01); the ADR has no scenarios.

import (
	"context"
	"errors"
	"testing"
	"time"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"

	"github.com/bregy1/together/server/internal/database"
	"github.com/bregy1/together/server/internal/testdb"
)

func TestConnect_ReturnsAClearErrorWhenTheDatabaseIsUnreachable(t *testing.T) {
	const secret = "s3cr3t-password"
	// Port 1 on the loopback interface: nothing listens there.
	url := "postgres://app:" + secret + "@127.0.0.1:1/yaruno?sslmode=disable&connect_timeout=2"

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	pool, err := database.Connect(ctx, url)
	require.Error(t, err)
	assert.Nil(t, pool)
	assert.True(t, errors.Is(err, database.ErrUnreachable), "error should wrap ErrUnreachable, got: %v", err)
	assert.Contains(t, err.Error(), "127.0.0.1:1", "the error should say which server was tried")
	assert.NotContains(t, err.Error(), secret, "the error must never contain the password")
}

func TestConnect_RejectsAnInvalidURL(t *testing.T) {
	pool, err := database.Connect(context.Background(), "postgres://app:pw@db:notaport/yaruno")
	require.Error(t, err)
	assert.Nil(t, pool)
	assert.False(t, errors.Is(err, database.ErrUnreachable))
}

func TestOpen_DoesNotNeedTheDatabaseButPingReportsItClearly(t *testing.T) {
	const secret = "s3cr3t-password"
	url := "postgres://app:" + secret + "@127.0.0.1:1/yaruno?sslmode=disable&connect_timeout=2"

	pool, err := database.Open(url)
	require.NoError(t, err, "opening the pool must not contact the database")
	defer pool.Close()

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()
	err = database.Ping(ctx, pool)
	require.Error(t, err)
	assert.ErrorIs(t, err, database.ErrUnreachable)
	assert.Contains(t, err.Error(), "127.0.0.1:1")
	assert.NotContains(t, err.Error(), secret)
}

func TestOpen_RejectsAnInvalidURLWithoutEchoingIt(t *testing.T) {
	_, err := database.Open("postgres://app:s3cr3t@db:notaport/yaruno")
	require.ErrorIs(t, err, database.ErrInvalidURL)
	assert.NotContains(t, err.Error(), "s3cr3t")
}

// Needs PostgreSQL: skipped when DATABASE_URL is not set.
func TestConnect_ReachesTheDatabase(t *testing.T) {
	url := testdb.URL(t)

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	pool, err := database.Connect(ctx, url)
	require.NoError(t, err)
	defer pool.Close()

	require.NoError(t, pool.Ping(ctx))
}
