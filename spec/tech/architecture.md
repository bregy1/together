# Architecture

The current technical truth of the app. Each section states what is decided, in a few lines, and links the ADR that decided it. A section without an accepted ADR says *Open*. When a topic needs more than about a screen of text, move the detail to `tech/<topic>.md` and link it.

Nothing is built yet: every section below describes decided design, not existing code.

## Overview

An Expo (React Native, TypeScript) app for iOS and Android talks to one Go service over a REST API (OpenAPI) and a WebSocket. The Go service stores everything in PostgreSQL and on a photo volume, all on Docker hosts in Switzerland. Data changes write events that PostgreSQL announces with LISTEN/NOTIFY; the Go service fans them out over WebSockets and, for closed apps, sends push notifications directly to Apple and Google. App UI and logic are updated over the air from our own update server (xprem).

```
App (Expo) ──REST/OpenAPI──▶ Go service ──ent──▶ PostgreSQL ──NOTIFY──┐
    ▲  ◀────── WebSocket ─────── hub ◀──────── LISTEN ◀──────────────┘
    │                         │  └──▶ APNs / FCM (push, minimal content)
    │                         └────▶ SMS provider (login codes)
    └── OTA bundles ◀── xprem update server       (all servers in Switzerland)
```

## Stack

| Topic | Choice | ADR |
|---|---|---|
| App framework | Expo SDK 58, React Native, TypeScript, Continuous Native Generation; OTA via `expo-updates` and self-hosted xprem | ADR-0003 |
| Backend & data | Go, ent with Atlas versioned migrations, PostgreSQL, REST + OpenAPI (spec-first), River for jobs | ADR-0004 |
| Auth | Custom phone + SMS-code flow in Go, opaque device sessions; SMS through ASPSMS | ADR-0005, ADR-0011 |
| Realtime & push | Event table + `pg_notify` → Go hub → WebSocket (coder/websocket); push direct to APNs and FCM | ADR-0006 |
| i18n | i18next + react-i18next + expo-localization; server-side catalogue for push and SMS texts | ADR-0007 |
| Testing | Jest + jest-expo + React Native Testing Library; Maestro; Go testing + testify with PostgreSQL in CI | ADR-0008 |
| Hosting & environments | Docker on plain Linux servers in Switzerland; GitLab with gitlab-ci-local | ADR-0004, ADR-0001 |
| Maps | swisstopo vector tiles self-hosted as PMTiles; MapLibre (native and web); search and municipality lookup via the Go service to geo.admin.ch | ADR-0010 |
| Repository & local development | Monorepo: `app/`, `server/`, `api/`, `deploy/`; PostgreSQL in Docker, server and app run directly and reload on save, one root command; code on GitHub, `.gitlab-ci.yml` run locally with gitlab-ci-local | ADR-0012 |
| Local preview | Android emulator and iOS Simulator for the real behaviour; Expo web target in a phone-sized browser for quick looks, development only, never shipped | ADR-0009 |

## Approved libraries

Small libraries the boss approved in a batch through `/spec-decide`, without an ADR each. Anything that is neither here nor in an accepted ADR needs approval before it is used.

| Library | Purpose | Approved on | Via |
|---|---|---|---|
| `oapi-codegen` v2 (generator and its `runtime`) | Go server stubs and types from the OpenAPI file, strict server, on the standard `net/http` router; Apache-2.0; v2.8.2 (2026-10-31) | 2026-11-10 | chosen by Claude on the boss's instruction ("decide with a reasoning"; tie-breaker oapi-codegen), after research by architect-reviewer |
| `nethttp-middleware` with `kin-openapi` | Validates requests against the OpenAPI file and offers the hook that checks the session token; needed with oapi-codegen, which does not validate on its own | 2026-11-10 | part of the oapi-codegen choice; flagged to the boss |
| `openapi-typescript` with `openapi-fetch` | Typed API client in the app from the same OpenAPI file; MIT; `openapi-typescript` was named in ADR-0004, `openapi-fetch` is its small runtime companion | 2026-11-10 | ADR-0004 and the oapi-codegen choice; `openapi-fetch` flagged to the boss |
| `expo-image-manipulator` | The app resizes a chosen photo and saves it as JPEG before upload, so iPhone HEIC photos are accepted; official Expo SDK package | 2026-11-10 | the boss, in a question round |
| `golang.org/x/image` (its `draw` package) | Resizing uploaded profile photos, together with the standard library JPEG and PNG decoders and the JPEG encoder; pure Go, no cgo, maintained by the Go team (v0.48.0, 2026-11-09) | 2026-11-10 | chosen by Claude on the boss's instruction ("do a search and choose one"), after research by architect-reviewer |
| `air` (air-verse/air) | Restarts the Go server on save during local development; a development tool only, not part of the deployed service; GPL-3.0, so it stays out of the production images; v1.67.4 (2026-08-01) | 2026-11-10 | the boss, in chat ("air tool works") |

## Components

- **App** (Expo): screens per feature area, i18n, secure token storage, WebSocket client with catch-up, push registration (native device tokens).
- **Go service**: REST API, WebSocket hub, auth, background jobs (River), push sender, photo handling, admin and moderator endpoints. One deployable, several instances possible.
- **PostgreSQL**: all data, the event table, River's job tables.
- **Photo volume**: profile photos behind a `Storage` interface.
- **xprem**: serves signed OTA update bundles.
(ADR-0003, ADR-0004, ADR-0006)

## Data model

*Open.* Decided so far: a plan's location and meeting point live in their own table and are read only through one service function that checks acceptance; ent privacy policies are a second layer (ADR-0004).

## Client and server split

The aim is to limit processing on the server: work goes to the client where it makes sense, because phones are powerful, as long as it is done in a respectful way for battery and data (boss, 2026-11-10). The limits come from the spec: the server alone decides everything that concerns access, other people's data, trust and the rules, and never trusts a value the app sends (who may see a location, PLAN-007; the trust score; limits and the text filter that refuses; stripping photo metadata, NFR-PRIV-003). The client does what only concerns the member's own view of data it already holds: layout and formatting, filtering and sorting of loaded lists, preparing photos before upload, caching, and keeping unsent messages. Each task plan names what runs where.

## APIs

REST with a hand-written OpenAPI file as the contract; ent models never appear in the API (ADR-0004). The Go side is generated with oapi-codegen (strict server) on the standard `net/http` router; requests are validated against the OpenAPI file, and the session token is checked, in middleware (`nethttp-middleware` with kin-openapi). The app uses a typed client from `openapi-typescript` with `openapi-fetch`. The generator, its runtime and the validation middleware are always upgraded together (boss's instruction and choice by Claude, 2026-11-10; see *Approved libraries*). The WebSocket carries "changed, fetch again" events only; the REST API stays the source of truth (ADR-0006).

## Realtime

Every relevant change writes a row to an `event` table in the same transaction; a trigger on that table calls `pg_notify` with the event id. Each Go instance holds one LISTEN connection (pgx v5) and a hub that sends events only to a plan's current participants. Clients send their last sequence number on every (re)connect and replay from the event table with a small safety window (ADR-0006).

## Push notifications

The app registers native APNs and FCM device tokens; the Go service sends directly to APNs (token-based key) and FCM HTTP v1 (Firebase project for delivery only, analytics off). Payloads carry the event type, the plan id and a short localised text, never a location, meeting point or chat text (ADR-0006, ADR-0001).

## Authentication

Phone numbers in E.164, `+41` only at launch; 6-digit hashed single-use codes, 5-minute expiry, 5 attempts; rate limits per number, IP and device plus a global daily SMS cap; opaque device sessions (hash stored, sliding expiry) kept in `expo-secure-store`; the WebSocket upgrade is authenticated with the same token; log out, ban and deletion revoke sessions and close sockets (ADR-0005).

- **SMS provider:** ASPSMS (a Swiss, prepaid gateway), behind a provider interface, for real testers and the pilot (ADR-0011). Until the ASPSMS account exists, the app is built with the full code entry, and the server in development mode accepts any code without sending an SMS (boss, 2026-11-10); this mode must never run in production. The data processing agreement and the account holder are settled when the account is opened. To research later: our own SIM card with an unlimited-SMS subscription in a GSM modem on our server (boss, 2026-11-10).

## Repository and local development

One repository: `app/` (Expo app), `server/` (Go service), `api/` (the OpenAPI file both sides generate from), `deploy/` (Docker files), next to `spec/` and `notes/`. On a developer machine PostgreSQL runs in Docker, the Go server runs directly and restarts on save (`air`), and the app runs on Expo's dev server with hot reload in the browser and the emulator; one root command starts all three. The code is hosted on GitHub; the pipeline is a `.gitlab-ci.yml` run locally with gitlab-ci-local (ADR-0012, ADR-0009). No linters are used, neither for the app, the server nor the migrations (boss, 2026-11-11; this drops the migration lint named in ADR-0004): the checks are the compilers and type checks, `gofmt`, and the tests.

## Maps

Hosts pick a plan's location on a map; accepted participants see it on a map (PLAN-006, PLAN-007). The map is the official swisstopo vector base map, served as one PMTiles file from our own Swiss server and rendered with MapLibre (`@maplibre/maplibre-react-native` on iOS and Android, `maplibre-gl` with `pmtiles` in the browser preview, one shared style). Place search and the municipality lookup go through the Go service to geo.admin.ch, so the app talks only to our servers; the Go service stores the municipality (BFS number) it derives from the point and never trusts one sent by the app. The local prototype loads the tiles straight from geo.admin.ch until our own tile file is set up (ADR-0010).

## Storage (files and media)

Profile photos on a Docker volume behind a `Storage` interface, re-encoded on upload with size limits (removes EXIF location data), served through authenticated or signed URLs. Processing uses the Go standard library plus `golang.org/x/image/draw`, with no image library beyond that: only JPEG and PNG are accepted (checked by their first bytes); uploads over about 15 MB, over 8000 px on an edge or over about 40 megapixels are rejected before decoding; the EXIF orientation is read with a small reader of our own and applied to the pixels; the photo is resized to 1600 px on the long edge plus a 400 px version, never enlarged, and re-encoded as JPEG, which drops all metadata (NFR-PRIV-003, proven by a test); the original is never kept. HEIC and WebP are not accepted on the server; the app sends JPEG. S3-compatible storage (e.g. Garage) can be added behind the same interface later. MinIO is not used (ADR-0004).

## Environments

| Environment | Purpose | Where | Data |
|---|---|---|---|
| Local development | Building and testing on developer machines | Docker Compose (PostgreSQL, Go service, xprem) | Test data only |
| CI | Pipelines with gitlab-ci-local / GitLab | Linux containers; iOS jobs on the boss's Mac | Test data only |
| Production | The pilot | Docker on plain Linux servers in Switzerland | Real personal data, Switzerland only (ADR-0001) |

Whether a separate staging environment is needed is decided with the first baseline CR.

## Hosting and operations

Docker on plain Linux servers in Switzerland (a friend's infrastructure), deployed half-automatically through GitLab pipelines run with gitlab-ci-local. Backups: nightly encrypted `pg_dump` plus the photo volume to a second location in Switzerland; pgBackRest with point-in-time recovery once a second Swiss host exists; short, documented retention (ADR-0004, ADR-0001).

## Builds and releases

iOS builds are made and signed on the boss's Mac; Android builds run in a Linux GitLab runner. UI and logic changes ship as signed OTA updates through xprem; native changes (new permissions, SDKs, Expo SDK upgrades) ship as store releases with a new runtime version. OTA updates stay within the reviewed purpose of the app (ADR-0003).
