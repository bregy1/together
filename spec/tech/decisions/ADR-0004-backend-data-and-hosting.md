# ADR-0004 Backend, data storage and hosting

- **Status:** accepted · **Date:** 2026-11-08
- **Decided by:** the boss · **Prepared by:** Claude, consulted: backend-developer
- **Affected spec IDs:** all MVP areas that store data (ONB, PROF, PLAN, JOIN, CAL, TRUST, MOD, ADM, NOTIF, FRND, CHAT, SET); `product/features.md` → PLAN (location and meeting point delivered only to participants); ADR-0001
- **Supersedes:** — · **Superseded by:** —

## Context

The boss has fixed the core of the backend (2026-11-08): a server in Go, the ent ORM "to stay open", PostgreSQL (chosen for LISTEN/NOTIFY on data changes), Docker deployment on plain Linux servers in Switzerland (a friend's infrastructure), and GitLab with gitlab-ci-local for half-automatic pipelines. This ADR records those choices and decides the open parts: API style, file storage for photos, background jobs, migrations and backups. Realtime and push are in ADR-0006, authentication in ADR-0005.

## Decision drivers

1. Boss's stack: Go, ent, PostgreSQL, Docker, GitLab (boss, 2026-11-08)
2. Stored personal data in Switzerland only (ADR-0001)
3. Near-zero running cost; open-source, self-hostable components (boss, 2026-11-08)
4. A plan's location and meeting point never reach a client before acceptance: server-side authorization, not UI hiding (`features.md` → PLAN)
5. Pilot scale: about 1,000 members and 100 plans a month, then ten times that (assumption, Claude)

## Options for the open parts

### API style between app and server
- **A) REST + OpenAPI, spec-first:** a hand-written OpenAPI file; Go server stubs generated (oapi-codegen or ogen), typed TypeScript client generated (openapi-typescript). Simple, widely known, keeps ent models out of the API. **Recommended.**
- **B) Connect (gRPC-compatible) with connect-go and connect-es:** one typed protobuf schema for both sides; needs protobuf tooling (buf).
- **C) GraphQL with entgql:** flexible queries; ent's contrib packages show a review backlog, and field-level access rules are harder to keep tight for the location rule.
- **Sources:** https://github.com/connectrpc/connect-go (checked 2026-11-08) · https://github.com/ent/contrib (checked 2026-11-08)

### Photos (file storage)
- **A) A Docker volume behind the Go server, behind a small `Storage` interface:** about 1,000 members × 4 photos is a few GB; photos are served through authenticated or signed URLs; metadata in PostgreSQL; the volume is part of the backups; S3 can be added later behind the interface. Every upload is re-encoded with a size cap, which also removes EXIF location data. **Recommended.**
- **B) Self-hosted S3 (Garage or SeaweedFS) from the start:** more moving parts at pilot scale. MinIO is out: its community repository was archived on 2026-04-25 and is no longer maintained.
- **Sources:** https://github.com/minio/minio (checked 2026-11-08)

### Background jobs (request expiry, reminders, push retries)
- **A) River (PostgreSQL-backed job queue for Go, MPL-2.0, v0.x, actively maintained):** jobs are enqueued in the same transaction as the data change; periodic jobs; retries with backoff; no extra service; River owns a few tables in our schema. **Recommended.**
- **B) An in-process ticker:** loses work on a crash and runs twice with several instances; acceptable only for a prototype.
- **Sources:** https://pkg.go.dev/github.com/riverqueue/river (checked 2026-11-08)

### Schema migrations
ent with Atlas versioned migrations (timestamped SQL files plus `atlas.sum`, `atlas migrate lint` in CI); auto-migrate only in tests.
- **Sources:** https://entgo.io/docs/versioned-migrations (checked 2026-11-08) · https://pkg.go.dev/entgo.io/ent (checked 2026-11-08, v0.14.6, Apache-2.0)

### Backups
- **A) Nightly `pg_dump` plus the photo volume, encrypted, to a second location in Switzerland, now; pgBackRest with point-in-time recovery once a second Swiss host is available:** fits the pilot. **Recommended.**
- **B) pgBackRest from day one:** needs a second Swiss host or Swiss object store right away.
- Retention is short and documented in the privacy policy, so deleted accounts disappear from backups within a known time.
- **Sources:** https://pgbackrest.org/ (checked 2026-11-08)

### Location rule (design note, no options)
The location and meeting point live in their own table and are read through one service function that checks acceptance; ent privacy policies are a second layer, not the only one.
- **Sources:** https://entgo.io/docs/privacy (checked 2026-11-08)

### Comparison of the recommended set

| Driver | Recommended set |
|---|---|
| Boss's stack | meets: Go, ent, PostgreSQL, Docker, GitLab |
| Stored data in Switzerland | meets: everything on our Swiss servers, backups in Switzerland |
| Near-zero cost, open source | meets: no paid service; licences Apache-2.0, MIT, MPL-2.0 |
| Location rule | meets: separate table, one checked access path |
| Pilot scale and 10× | meets: single server first; LISTEN/NOTIFY and River work with several instances |

**Recommendation (Claude):** REST + OpenAPI spec-first, photos on a Docker volume behind a `Storage` interface, River for jobs, Atlas versioned migrations, nightly encrypted `pg_dump` now and pgBackRest later. Would change if the app needs many ad-hoc queries (then Connect or GraphQL) or photos grow beyond one server's disk (then Garage behind the same interface). Reversal cost: low for storage and backups, medium for the API style and the job queue.
**Not verified:** current status of oapi-codegen, ogen and openapi-typescript; Garage and SeaweedFS versions and licences; image library status in Go; Atlas features that may need a login.

## Decision

**The boss's core stack** (Go server, ent with Atlas versioned migrations, PostgreSQL, Docker on plain Linux servers in Switzerland, GitLab with gitlab-ci-local) **plus the recommended set**: REST + OpenAPI written first with generated Go stubs and TypeScript client; photos on a Docker volume behind a `Storage` interface, re-encoded on upload; River for background jobs; nightly encrypted `pg_dump` and photo-volume backups to a second location in Switzerland, pgBackRest once a second Swiss host exists; the location rule as described. Decided by the boss on 2026-11-08.

**Reasons (boss):** the core stack is the boss's own choice ("we stick to ENT package, to stay open"; PostgreSQL "specifically for the built-in notify mechanism"; Docker on plain servers; GitLab with gitlab-ci-local); for the open parts the boss chose the recommended options.

## Consequences

- **Positive:** one language on the server, all components open source and self-hosted in Switzerland, no running fees beyond the servers; the API contract is reviewable before code exists.
- **Negative and risks:** we operate PostgreSQL, backups, the photo volume and the job queue ourselves; River is pre-1.0; photos are bound to one server's disk until S3 is added behind the interface.
- **Follow-ups:**
  - `tech/architecture.md`: stack, components, storage, hosting and environments (done in this decision).
  - NFR-PRIV and NFR-SEC requirements: backup retention and deletion, photo re-encoding without EXIF, location access path (`/spec-write`, `product/nfr.md`).
  - Project setup (first baseline CR): Go module with ent and Atlas, OpenAPI file and generators, Docker Compose for local development, GitLab pipeline.
  - Ask the server provider for a second Swiss location for backups.
  - Approve the generators and image library in a small-library batch when the first tasks need them.
