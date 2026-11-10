package ent_test

// Covers: ADR-0004 groundwork (CR-0001.T01): Atlas versioned migrations.

import (
	"testing"

	"ariga.io/atlas/sql/migrate"
	"github.com/stretchr/testify/require"
)

// The migration directory must always match its atlas.sum, so a hand-edited
// or half-generated migration is caught before it reaches a database.
func TestMigrationDirectory_MatchesItsChecksum(t *testing.T) {
	dir, err := migrate.NewLocalDir("migrate/migrations")
	require.NoError(t, err)

	require.NoError(t, migrate.Validate(dir))
}
