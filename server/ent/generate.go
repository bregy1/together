// Package ent holds the ent ORM code of the Yaruno service (ADR-0004).
//
// The schema in ./schema is empty on purpose: the data model is added by its
// own task (CR-0001.T07). ent refuses to generate code from a schema without
// any entity ("entc/load: no schema found"), so the go:generate directive is
// switched on together with the first entity. It is, without the leading
// "// " and the word "Enable:":
//
// Enable: //go:generate go tool ent generate --feature sql/versioned-migration ./schema
//
// Migrations are versioned with Atlas in ./migrate/migrations (timestamped SQL
// files plus atlas.sum); see server/README.md and server/atlas.hcl.
//
// spec: ADR-0004
package ent
