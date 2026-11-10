package config_test

// Covers: ADR-0004, ADR-0012 groundwork (CR-0001.T01); these ADRs have no scenarios.

import (
	"testing"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"

	"github.com/bregy1/together/server/internal/config"
)

// env returns a getenv function backed by a map, so tests never depend on
// the real environment of the machine.
func env(vars map[string]string) func(string) string {
	return func(key string) string { return vars[key] }
}

func TestLoad_UsesLocalDefaultsWhenNothingIsSet(t *testing.T) {
	cfg, err := config.Load(env(nil))
	require.NoError(t, err)

	assert.Equal(t, "127.0.0.1:8080", cfg.HTTPAddr)
	assert.Equal(t, "postgres://yaruno@localhost:5432/yaruno?sslmode=disable", cfg.DatabaseURL)
}

func TestLoad_ReadsValuesFromTheEnvironment(t *testing.T) {
	cfg, err := config.Load(env(map[string]string{
		"HTTP_ADDR":    ":9090",
		"DATABASE_URL": "postgres://app:pw@db.internal:5433/yaruno",
	}))
	require.NoError(t, err)

	assert.Equal(t, ":9090", cfg.HTTPAddr)
	assert.Equal(t, "postgres://app:pw@db.internal:5433/yaruno", cfg.DatabaseURL)
}

func TestLoad_RejectsAnInvalidHTTPAddress(t *testing.T) {
	for _, addr := range []string{"8080", "localhost", "localhost:http", "localhost:0", "localhost:70000", "localhost:-1"} {
		t.Run(addr, func(t *testing.T) {
			_, err := config.Load(env(map[string]string{"HTTP_ADDR": addr}))
			require.Error(t, err)
			assert.Contains(t, err.Error(), "HTTP_ADDR")
		})
	}
}

func TestLoad_RejectsAnInvalidDatabaseURLWithoutEchoingIt(t *testing.T) {
	const secret = "s3cr3t-password"
	_, err := config.Load(env(map[string]string{
		"DATABASE_URL": "postgres://app:" + secret + "@db:notaport/yaruno",
	}))
	require.Error(t, err)
	assert.Contains(t, err.Error(), "DATABASE_URL")
	assert.NotContains(t, err.Error(), secret, "the error must never contain the password")
}
