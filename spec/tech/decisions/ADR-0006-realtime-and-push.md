# ADR-0006 Realtime updates and push notifications

- **Status:** accepted · **Date:** 2026-11-08
- **Decided by:** the boss · **Prepared by:** Claude, consulted: backend-developer, expo-react-native-expert
- **Affected spec IDs:** `product/features.md` → NOTIF, CHAT, JOIN (request states), PLAN (changes, takeover), FEED (full plans disappear); ADR-0001; ADR-0004; ADR-0005
- **Supersedes:** — · **Superseded by:** —

## Context

The boss wants server push out of the box: data changes in PostgreSQL drive live updates to the app (LISTEN/NOTIFY → Go server → WebSocket; boss, 2026-11-08). When the app is closed, members still need push notifications for join requests, decisions, plan changes and invitations (`features.md` → NOTIF). This ADR records the realtime choice, decides how it is made reliable, and decides how push notifications are sent.

## Decision drivers

1. PostgreSQL LISTEN/NOTIFY and WebSocket (boss, 2026-11-08)
2. No lost updates: clients catch up after a disconnect (`features.md` → CHAT, JOIN)
3. Only authorised members receive a plan's events; the location never travels before acceptance (`features.md` → PLAN)
4. Push with minimal content through the unavoidable processors only (ADR-0001)
5. Open source, near-zero cost (boss)

## Design (recorded choice, with the details that make it reliable)

- **Event log:** every relevant change writes a row to an `event` table in the same transaction (sequence number, plan id, type, small body without chat text or location).
- **Notify:** a trigger on the `event` table only calls `pg_notify` with the event id; payloads stay far below PostgreSQL's 8,000-byte limit.
- **Fan-out:** each Go instance holds one dedicated LISTEN connection (pgx v5) and a hub that maps plans to open WebSockets; several instances work without extra components.
- **Catch-up:** LISTEN/NOTIFY is not durable, so the app sends its last seen sequence number on every connect and reconnect, and the server replays from the `event` table. Sequence numbers can commit out of order, so the replay uses a small safety window.
- **Authorization:** the hub sends a plan's events only to its current participants, re-checked against the database on subscribe and replay; events say "changed, fetch again", and the app fetches details through the API (ADR-0004).
- **WebSocket library:** coder/websocket (ISC licence, maintained by Coder); gorilla/websocket as a fallback.
- **Sources:** https://www.postgresql.org/docs/current/sql-notify.html (checked 2026-11-08) · https://pkg.go.dev/github.com/jackc/pgx/v5/pgconn (checked 2026-11-08) · https://github.com/coder/websocket (checked 2026-11-08)

## Options for push notifications

### A) Direct to APNs and FCM from the Go server
- The app registers native device tokens (`expo-notifications`, `getDevicePushTokenAsync`); the server sends to Apple APNs (token-based `.p8` key) and Google FCM HTTP v1 (Firebase project used for delivery only, analytics off).
- **Pros:** no extra relay; only the two unavoidable processors (ADR-0001); free.
- **Cons:** we handle two APIs and token invalidation; a Firebase project and `google-services.json` are needed for Android.
- **Sources:** https://docs.expo.dev/push-notifications/sending-notifications-custom/ (checked 2026-11-08) · https://firebase.google.com/docs/cloud-messaging/send/v1-api (checked 2026-11-08) · https://pkg.go.dev/firebase.google.com/go/v4 (checked 2026-11-08) · https://pkg.go.dev/github.com/sideshow/apns2 (checked 2026-11-08)

### B) Expo Push Service
- **Pros:** one API for both platforms.
- **Cons:** an additional processor outside Switzerland whose data handling we could not verify; still needs the FCM and APNs credentials.

**Payload rule (both):** event type and plan id plus a short localised text; never the location, meeting point or chat text; details are fetched in the app.

### Comparison

| Driver | A) Direct APNs + FCM | B) Expo Push Service |
|---|---|---|
| Minimal processors (ADR-0001) | meets | fails partly (extra processor) |
| Open source, cost | meets (free) | meets (free) |
| Effort | medium (two APIs) | low |

**Recommendation (Claude):** the design above for realtime, and A for push, because it keeps the processor list to Apple and Google only. Would change if maintaining two push APIs becomes a burden. Reversal cost: low (sending is one server module).
**Not verified:** what Google stores for FCM delivery; the claim that NOTIFY can serialise commits under heavy load (irrelevant at pilot scale); the latest apns2 release activity (a thin in-house APNs client is a fallback).

## Decision

**The realtime design above** (event table, `pg_notify` trigger with the event id, Go hub with one LISTEN connection per instance, WebSocket via coder/websocket, catch-up by sequence number, per-plan authorization) **and Option A for push** (direct to APNs and FCM from the Go server, Firebase project for Android delivery only, analytics off; minimal payload), decided by the boss on 2026-11-08.

**Reasons (boss):** realtime: accepted the design, which implements the boss's own choice of LISTEN/NOTIFY and WebSocket. Push: "What is free, I don't care"; both options are free, so the recommendation was taken.

## Consequences

- **Positive:** live updates without polling; no lost updates after a reconnect; only Apple and Google as push processors; no fees.
- **Negative and risks:** we maintain two push integrations and handle invalid device tokens; a Firebase project and its Android config file are needed; the event table grows and needs a retention rule.
- **Follow-ups:**
  - NFR requirements: realtime latency target, catch-up after reconnect, push payload content rule, event-table retention (`/spec-write`, `product/nfr.md`).
  - Project setup: Apple Push key (needs the Apple developer account) and a Firebase project for FCM with analytics off.
  - NOTIF requirements list each notification and its text keys (`/spec-write NOTIF`).
