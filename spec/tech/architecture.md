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
| Auth | Custom phone + SMS-code flow in Go, opaque device sessions; production SMS provider open | ADR-0005 |
| Realtime & push | Event table + `pg_notify` → Go hub → WebSocket (coder/websocket); push direct to APNs and FCM | ADR-0006 |
| i18n | i18next + react-i18next + expo-localization; server-side catalogue for push and SMS texts | ADR-0007 |
| Testing | Jest + jest-expo + React Native Testing Library; Maestro; Go testing + testify with PostgreSQL in CI | ADR-0008 |
| Hosting & environments | Docker on plain Linux servers in Switzerland; GitLab with gitlab-ci-local | ADR-0004, ADR-0001 |

## Approved libraries

Small libraries the boss approved in a batch through `/spec-decide`, without an ADR each. Anything that is neither here nor in an accepted ADR needs approval before it is used.

| Library | Purpose | Approved on | Via |
|---|---|---|---|

## Components

- **App** (Expo): screens per feature area, i18n, secure token storage, WebSocket client with catch-up, push registration (native device tokens).
- **Go service**: REST API, WebSocket hub, auth, background jobs (River), push sender, photo handling, admin and moderator endpoints. One deployable, several instances possible.
- **PostgreSQL**: all data, the event table, River's job tables.
- **Photo volume**: profile photos behind a `Storage` interface.
- **xprem**: serves signed OTA update bundles.
(ADR-0003, ADR-0004, ADR-0006)

## Data model

*Open.* Decided so far: a plan's location and meeting point live in their own table and are read only through one service function that checks acceptance; ent privacy policies are a second layer (ADR-0004).

## APIs

REST with a hand-written OpenAPI file as the contract; Go stubs and a typed TypeScript client are generated; ent models never appear in the API (ADR-0004). The WebSocket carries "changed, fetch again" events only; the REST API stays the source of truth (ADR-0006).

## Realtime

Every relevant change writes a row to an `event` table in the same transaction; a trigger on that table calls `pg_notify` with the event id. Each Go instance holds one LISTEN connection (pgx v5) and a hub that sends events only to a plan's current participants. Clients send their last sequence number on every (re)connect and replay from the event table with a small safety window (ADR-0006).

## Push notifications

The app registers native APNs and FCM device tokens; the Go service sends directly to APNs (token-based key) and FCM HTTP v1 (Firebase project for delivery only, analytics off). Payloads carry the event type, the plan id and a short localised text, never a location, meeting point or chat text (ADR-0006, ADR-0001).

## Authentication

Phone numbers in E.164, `+41` only at launch; 6-digit hashed single-use codes, 5-minute expiry, 5 attempts; rate limits per number, IP and device plus a global daily SMS cap; opaque device sessions (hash stored, sliding expiry) kept in `expo-secure-store`; the WebSocket upgrade is authenticated with the same token; log out, ban and deletion revoke sessions and close sockets (ADR-0005).

- **SMS provider:** behind a provider interface. Development and early testing use a free development sender that must never run in production. [NEEDS DECISION: Which SMS provider sends login codes in production? — options: A) ASPSMS (Swiss, prepaid, about 4–7 euro cents per SMS, DPA and data location to confirm), B) eCall, C) Swisscom Enterprise SMS — recommended: A, because it is Swiss, prepaid and has no minimum contract — decide before the first store deployment]

## Storage (files and media)

Profile photos on a Docker volume behind a `Storage` interface, re-encoded on upload with size limits (removes EXIF location data), served through authenticated or signed URLs; S3-compatible storage (e.g. Garage) can be added behind the same interface later. MinIO is not used (ADR-0004).

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
