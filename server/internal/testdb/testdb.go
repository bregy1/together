// Package testdb gives tests the connection string of a test PostgreSQL
// database. Tests that need a database call URL and are skipped, with a clear
// message, when none is configured.
package testdb

import (
	"os"
	"testing"
)

// EnvVar names the environment variable that holds the connection string of
// the PostgreSQL database the tests may use. Never point it at production.
const EnvVar = "DATABASE_URL"

// URL returns the test database connection string, or skips the test when
// EnvVar is not set.
func URL(t testing.TB) string {
	t.Helper()
	url := os.Getenv(EnvVar)
	if url == "" {
		t.Skipf("%s is not set: skipping this test because it needs PostgreSQL", EnvVar)
	}
	return url
}
