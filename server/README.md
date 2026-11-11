# Yaruno server

The Go service of Yaruno (ADR-0004, ADR-0012): REST API from the hand-written contract in `../api/openapi.yaml`, PostgreSQL through pgx v5, ent with Atlas versioned migrations.

## Versions

| Tool or module | Version | How it is used |
|---|---|---|
| Go | 1.27.4 (windows/amd64) | `go.mod` |
| oapi-codegen | v2.8.2 | `go tool oapi-codegen` (tool directive in `go.mod`) |
| oapi-codegen runtime | v1.9.0 | imported by the generated code (dates, path parameters, the `Me` union) |
| kin-openapi | v0.142.0 (the version oapi-codegen v2.8.2 uses) | `internal/api/contract_test.go` validates `../api/openapi.yaml` |
| ent | v0.14.6 | `go tool ent` (tool directive); no generated code yet |
| ariga.io/atlas (Go library) | v0.36.2-0.20250730182955-2c6300d0a3e1 (the version ent v0.14.6 requires) | migration directory checks in tests |
| Atlas CLI | not installed (see *Migrations*) | `atlas.hcl` |
| pgx | v5.12.0 | database pool |
| testify | v1.12.1 | tests |
| air | v1.67.4 | `go install`, development only (GPL-3.0, never in a production image) |
| golang.org/x/tools | v0.52.0 | indirect; raised from v0.48.0 because older versions cannot read Go 1.27 export data, which breaks `ent generate` |

## Layout

```
cmd/server/          main: configuration, database pool, HTTP server, graceful shutdown
internal/api/        code generated from ../api/openapi.yaml (do not edit api.gen.go)
internal/config/     configuration from environment variables
internal/database/   PostgreSQL pool (pgx v5)
internal/health/     GET /healthz
internal/server/     assembles the generated router and the handlers
internal/testdb/     test helper: database URL or skip
ent/schema/          ent schema (empty until the data model task)
ent/migrate/migrations/  Atlas versioned migrations (empty)
atlas.hcl            Atlas project file
.air.toml            reload on save (development only)
```

## Configuration

| Variable | Default (local development only) | Meaning |
|---|---|---|
| `HTTP_ADDR` | `127.0.0.1:8080` | host:port the server listens on |
| `DATABASE_URL` | `postgres://yaruno@localhost:5432/yaruno?sslmode=disable` | PostgreSQL connection string; holds a password in real deployments, never logged |

The configuration is validated at startup; an invalid value stops the server with a message naming the variable (never its value). If the database is not reachable at startup, the server logs a clear error, keeps running and `GET /healthz` answers `503 {"status":"unavailable"}` until the database answers.

## Commands

Run from `server/` with the 64-bit Go 1.27 first on the `PATH` (bash: `export PATH="/c/Program Files/Go/bin:$PATH"`).

| What | Command |
|---|---|
| Build | `go build ./...` |
| Test | `go test ./...` |
| Test with a database | `DATABASE_URL=postgres://… go test ./...` (never production) |
| Vet | `go vet ./...` |
| Format check | `gofmt -l .` (prints nothing when clean) |
| Generate | `go generate ./...` (Go code from `../api/openapi.yaml`) |
| Validate the contract | `go test ./internal/api/` (kin-openapi loads and validates `../api/openapi.yaml`; generation also fails on an invalid file) |
| Run | `go run ./cmd/server` |
| Run with reload on save | `go install github.com/air-verse/air@v1.67.4`, then `air` |
| Health check | `curl -i http://127.0.0.1:8080/healthz` |

Tests that need PostgreSQL read `DATABASE_URL` and are skipped with a message when it is not set.

## Migrations

ent with Atlas versioned migrations (ADR-0004): timestamped SQL files plus `atlas.sum` in `ent/migrate/migrations/`; a test checks that the directory matches its `atlas.sum`.

- **ent code generation** starts with the first entity: ent refuses an empty schema. The `go:generate` line to switch on is in `ent/generate.go`.
- **Atlas CLI:** Atlas no longer supports `go install`; it is installed as a release binary or used as the `arigaio/atlas` Docker image. Its Community Edition (Apache-2.0) supports `migrate diff`, `apply` and `status` but not `migrate lint`. With the CLI: `atlas migrate diff <name> --env local` and `atlas migrate apply --env local`, with `DATABASE_URL` and `ATLAS_DEV_URL` (an empty scratch database) set. Not yet verified on this machine.
