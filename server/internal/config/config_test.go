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
		"APP_ENV":      "production",
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

// The environment setting (CR-0001.T08) lets later tasks refuse development
// switches in production (NFR-SEC-004); its own scenario is tested in T11.

func TestLoad_EnvironmentDefaultsToDevelopmentOnALoopbackAddress(t *testing.T) {
	for _, addr := range []string{"127.0.0.1:8080", "localhost:8080", "[::1]:8080", "127.0.0.2:9000"} {
		t.Run(addr, func(t *testing.T) {
			cfg, err := config.Load(env(map[string]string{"HTTP_ADDR": addr}))
			require.NoError(t, err)
			assert.Equal(t, config.Development, cfg.Environment)
			assert.False(t, cfg.Environment.IsProduction())
		})
	}
}

func TestLoad_EnvironmentIsRequiredWhenListeningBeyondLoopback(t *testing.T) {
	for _, addr := range []string{":8080", "0.0.0.0:8080", "10.0.0.5:8080", "api.example.ch:443"} {
		t.Run(addr, func(t *testing.T) {
			_, err := config.Load(env(map[string]string{"HTTP_ADDR": addr}))
			require.Error(t, err)
			assert.Contains(t, err.Error(), "APP_ENV")
		})
	}
}

func TestLoad_ReadsTheEnvironment(t *testing.T) {
	cfg, err := config.Load(env(map[string]string{"HTTP_ADDR": ":8080", "APP_ENV": "production"}))
	require.NoError(t, err)
	assert.Equal(t, config.Production, cfg.Environment)
	assert.True(t, cfg.Environment.IsProduction())

	cfg, err = config.Load(env(map[string]string{"HTTP_ADDR": ":8080", "APP_ENV": "development"}))
	require.NoError(t, err)
	assert.Equal(t, config.Development, cfg.Environment)
}

func TestLoad_RejectsAnUnknownEnvironment(t *testing.T) {
	for _, v := range []string{"prod", "Production", "staging", " development"} {
		t.Run(v, func(t *testing.T) {
			_, err := config.Load(env(map[string]string{"APP_ENV": v}))
			require.Error(t, err)
			assert.Contains(t, err.Error(), "APP_ENV")
		})
	}
}

func TestLoad_AllowsTheLocalWebPreviewByDefaultInDevelopment(t *testing.T) {
	cfg, err := config.Load(env(nil))
	require.NoError(t, err)
	assert.Equal(t, []string{"http://localhost:8081"}, cfg.CORSAllowedOrigins)
}

func TestLoad_ReadsTheCORSAllowlist(t *testing.T) {
	cfg, err := config.Load(env(map[string]string{
		"CORS_ALLOWED_ORIGINS": "http://localhost:8081, http://127.0.0.1:8081,https://preview.local:19006",
	}))
	require.NoError(t, err)
	assert.Equal(t, []string{"http://localhost:8081", "http://127.0.0.1:8081", "https://preview.local:19006"}, cfg.CORSAllowedOrigins)
}

func TestLoad_RejectsAnInvalidCORSOrigin(t *testing.T) {
	for _, v := range []string{"*", "localhost:8081", "http://localhost:8081/", "http://localhost:8081/app", "ftp://localhost", "http://", "http://a:8081,,"} {
		t.Run(v, func(t *testing.T) {
			_, err := config.Load(env(map[string]string{"CORS_ALLOWED_ORIGINS": v}))
			require.Error(t, err)
			assert.Contains(t, err.Error(), "CORS_ALLOWED_ORIGINS")
		})
	}
}

func TestLoad_HasNoCrossOriginSettingInProduction(t *testing.T) {
	cfg, err := config.Load(env(map[string]string{"HTTP_ADDR": ":8080", "APP_ENV": "production"}))
	require.NoError(t, err)
	assert.Empty(t, cfg.CORSAllowedOrigins)

	_, err = config.Load(env(map[string]string{
		"HTTP_ADDR": ":8080", "APP_ENV": "production", "CORS_ALLOWED_ORIGINS": "http://localhost:8081",
	}))
	require.Error(t, err, "a cross-origin allowlist in production is a misconfiguration")
	assert.Contains(t, err.Error(), "CORS_ALLOWED_ORIGINS")
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
