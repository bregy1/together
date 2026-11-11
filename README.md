# Yaruno

Yaruno is an app to plan activities and let people join: hosts choose who comes, and a trust score filters out people who don't show up. It is a non-profit project for Switzerland; what the app is and does is written down in [`spec/`](spec/README.md), the single source of truth.

## Repository

| Folder | What |
|---|---|
| `app/` | Expo app (iOS, Android; Expo web in the browser for development only) — see [`app/README.md`](app/README.md) |
| `server/` | Go service — see [`server/README.md`](server/README.md) |
| `api/` | `openapi.yaml`, the contract both sides generate code from |
| `deploy/` | Docker Compose for local development (PostgreSQL, Atlas) |
| `scripts/` | `dev.mjs`, the one root command |
| `spec/` | requirements, decisions, design |

## Prerequisites

| Tool | Version | Notes |
|---|---|---|
| Go | 1.27.4, **64-bit** | https://go.dev/dl/ — on Windows the installer puts it in `C:\Program Files\Go\bin` |
| air | v1.67.4 | `go install github.com/air-verse/air@v1.67.4` (reload on save; development only, GPL-3.0) |
| Node.js | 24 (`.nvmrc`) | 22.13+, 24.3+ or 26+ are accepted; odd releases such as 25 are not supported by Expo SDK 58 |
| Docker | Docker Desktop or Docker Engine with Compose v2 | runs PostgreSQL |
| Android emulator | later | Android Studio; the browser preview works without it |

**Which Go is used.** The root command and the root `npm run …:server` scripts look for Go in this order: the folder in `YARUNO_GO_BIN` if you set it; on Windows `<Program Files>\Go\bin` (ahead of anything on the `PATH`, so an older or 32-bit Go elsewhere is not picked up); then `go` on the `PATH`. A 32-bit Go is refused. `air` is looked up in Go's bin folder (`go env GOBIN`, else `<GOPATH>\bin`, usually `%USERPROFILE%\go\bin`), where `go install` puts it, then on the `PATH`.

**npm always runs with `--ignore-scripts`.** Both `.npmrc` files set `ignore-scripts=true` and `engine-strict=true`; pass `--ignore-scripts` on the command line as well. Do not `npx` packages that are not project dependencies.

## Run everything

```sh
npm --prefix app ci --ignore-scripts   # once, and after the lockfile changes (or: npm run install:app)
npm run dev --ignore-scripts
```

`npm run dev` starts, in this order:

1. **PostgreSQL** in Docker (`deploy/docker-compose.yml`). If Docker is not installed or not running, it says so in one line and carries on.
2. **The Go server** through `air` in `server/`: rebuilds and restarts on every saved `.go` file.
3. **The Expo dev server** for the web in `app/`: hot reload in the browser.

Output is prefixed with `[db]`, `[server]`, `[app]`. **Ctrl-C** stops the server and the app together; if either of them dies or cannot be started, the other is stopped and the command fails. If port 8080 or 8081 is already in use (for example by an earlier `npm run dev`), it stops before starting anything and says so. PostgreSQL keeps running in the background: `npm run db:stop` stops it.

| What | Where |
|---|---|
| App in the browser | http://localhost:8081 — open the browser's device toolbar at phone size (ADR-0009) |
| Server health check | http://127.0.0.1:8080/healthz — `200 {"status":"ok"}`, or `503 {"status":"unavailable"}` while the database is not reachable |
| PostgreSQL | `127.0.0.1:5432` (this machine only) |

Environment the root command sets when they are not already set:

| Variable | For | Local value |
|---|---|---|
| `DATABASE_URL` | server | `postgres://yaruno:yaruno-local-dev@127.0.0.1:5432/yaruno?sslmode=disable` |
| `EXPO_PUBLIC_API_BASE_URL` | app | `http://127.0.0.1:8080` |

`yaruno-local-dev` is a local-only development password, not a secret: never use it anywhere else.

## Databases

`deploy/docker-compose.yml` runs PostgreSQL 18.6 with a named volume (`yaruno_postgres-data`) and creates three databases on the first start:

| Database | Used by | Variable |
|---|---|---|
| `yaruno` | the server during development | `DATABASE_URL` |
| `yaruno_test` | the Go tests, so they never touch development data | `TEST_DATABASE_URL` = `postgres://yaruno:yaruno-local-dev@127.0.0.1:5432/yaruno_test?sslmode=disable` |
| `yaruno_atlas_dev` | Atlas, as its empty scratch database | `ATLAS_DEV_URL` (set inside the Atlas container) |

```sh
npm run db:start                                         # start PostgreSQL only
npm run db:stop                                          # stop it, keep the data
docker compose -f deploy/docker-compose.yml down -v      # delete all local data
```

The Go tests currently read `DATABASE_URL`; they switch to `TEST_DATABASE_URL` in CR-0001.T07. Until then, point `DATABASE_URL` at `yaruno_test` when you run them against the database. Tests that need PostgreSQL are skipped with a message when no database is configured.

## Tests and checks

No linters are used (boss, 2026-11-11): the checks are the compilers and the type check, `gofmt`, and the tests.

| What | Root command | Directly |
|---|---|---|
| Server build | `npm run build:server` | `cd server && go build ./...` |
| Server format check | `npm run format:server` (fails when a file is listed) | `cd server && gofmt -l .` |
| Server tests | `npm run test:server` | `cd server && go test ./...` |
| App type check | `npm run typecheck:app` | `cd app && npm run typecheck` |
| App tests | `npm run test:app` | `cd app && npm test` |

Add `--ignore-scripts` to every `npm run` (for example `npm run test:app --ignore-scripts`).

## Generate code

| What | Command |
|---|---|
| Go server code from `api/openapi.yaml` | `npm run generate:server` (`cd server && go generate ./...`) |
| App API types from `api/openapi.yaml` (`app/src/api/generated/schema.ts`) | `npm run generate:api` (`cd app && npm run generate:api`) |
| App theme from `spec/design/brand/tokens.json` | `npm run generate:theme` |

After a change to `api/openapi.yaml`, run both `generate:server` and `generate:api`. Generated files are checked in; the pipeline fails when they are out of date (`api:contract` for the server, `app:contract` for the app types).

## Migrations

ent with Atlas versioned migrations in `server/ent/migrate/migrations` (ADR-0004; details in `server/README.md`). Atlas runs from Docker, nothing to install:

```sh
docker compose -f deploy/docker-compose.yml run --rm atlas migrate status --env local
docker compose -f deploy/docker-compose.yml run --rm atlas migrate apply --env local
```

The image is the Atlas Community Edition (`arigaio/atlas:1.3.9-community-alpine`, Apache-2.0). It applies and checks migrations but cannot read the ent schema (`ent://` is not supported by the Community Edition), so **new** migration files are not created with this container; how they are created is decided with the data model (CR-0001.T07).

## Pipeline

The code is on GitHub; the pipeline in `.gitlab-ci.yml` is run locally with [gitlab-ci-local](https://github.com/firecow/gitlab-ci-local) (ADR-0012), which needs Docker, and on Windows Git Bash and rsync:

```sh
gitlab-ci-local --list          # the jobs
gitlab-ci-local                 # the whole pipeline
gitlab-ci-local server:test     # one job
```

gitlab-ci-local copies only files Git tracks, so commit or `git add` first. Jobs: `server:build`, `server:format`, `api:contract` (regenerates the server code from `api/openapi.yaml`; fails on an invalid contract or stale generated code in `server/internal/api` or `server/ent`), `app:typecheck`, `app:contract` (regenerates `app/src/api/generated/schema.ts`; fails when it differs from the committed file), then `server:test` (with a PostgreSQL service) and `app:test`. Run it before merging; nothing runs it on a push.

## Line endings

`.gitattributes` keeps Go files, `go.mod`, `go.sum`, `api/*.yaml`, `*.sh` and `*.sql` on LF, also on Windows, so `gofmt -l` is clean. In a checkout made before `.gitattributes` existed, refresh the files once (with no local changes in them): `git rm -r -q --cached server api` then `git checkout HEAD -- server api`.
