# ADR-0001 Data-protection law and data residency

- **Status:** accepted · **Date:** 2026-11-08
- **Decided by:** the boss · **Prepared by:** Claude
- **Affected spec IDs:** `constitution.md` → Privacy and security baseline; `product/vision.md` → Target users (markets), Risks and constraints; `product/app.md` → Legal; every area that stores personal data (ONB, PROF, PLAN, JOIN, CHAT, FRND, MOD, ADM, SET); NFR-PRIV (to be written)
- **Supersedes:** — · **Superseded by:** —

## Context

During `/app-discover` (2026-11-08) the boss decided which data-protection law applies and where personal data may live, and both answers were written into `constitution.md`. This ADR records that decision and defines what "Switzerland only" covers, because push notifications and SMS codes cannot work without processors outside Switzerland. It constrains every later stack decision (backend, hosting, auth, push).

## Decision drivers

1. Local trust: "from locals for locals", members can rely on their data staying at home (boss, 2026-11-08)
2. Own Swiss servers: TOGETHER is hosted on a friend's infrastructure in Switzerland anyway (boss, 2026-11-08)
3. Simplest legal story: no cross-border transfers of stored data to explain (boss, 2026-11-08)
4. Launch market Switzerland only (`vision.md` → Target users)
5. Push notifications and SMS codes are MVP features (`features.md` → NOTIF, ONB) and depend on Apple, Google and phone carriers

## Options

### A) Store personal data in Switzerland only
- **Pros:** strongest trust message; matches the planned Swiss hosting; no stored-data transfers abroad.
- **Cons:** rules out managed cloud backends outside Switzerland; fewer provider choices.
- **Cost and effort:** self-hosting on Swiss servers; low running cost, more operations work.

### B) Switzerland and the EU/EEA
- **Pros:** more managed providers (e.g. Frankfurt regions); still low legal effort.
- **Cons:** weaker local-trust message; transfers to explain.
- **Cost and effort:** managed services possible.

### C) Any region with adequate safeguards
- **Pros:** most choice.
- **Cons:** hardest to explain; contradicts the local identity.
- **Cost and effort:** varies.

### Comparison

| Driver | A | B | C |
|---|---|---|---|
| Local trust | meets | partly | fails |
| Own Swiss servers | meets | meets | meets |
| Simplest legal story | meets | partly | fails |
| Push and SMS possible | meets with the scope rule below | meets | meets |

**Recommendation (Claude):** during discovery Claude recommended B, because it keeps mainstream managed hosting open. Would change: with self-hosting on Swiss servers decided, A costs little extra. Reversal cost: medium (data migration and privacy-policy update).
**Not verified:** none (no external facts used).

## Decision

**Option A**, plus compliance with both the Swiss revFADP and the EU GDPR, decided by the boss on 2026-11-08.

**Reasons (boss):** local trust; we run our own Swiss servers anyway; the simplest legal story. "For now TOGETHER sticks to Switzerland."

**Scope of "Switzerland only"** (boss, 2026-11-08: "stored data in CH"):

- All stored personal data stays in Switzerland: databases, files and photos, backups, and logs that contain personal data, on servers located in Switzerland.
- Unavoidable transient processors are allowed, with minimal content: Apple Push Notification service, Google Firebase Cloud Messaging, and the SMS provider and carriers for login codes. Push and SMS content never includes a plan's location or meeting point, chat text, or other profile data beyond what the message needs.
- App code delivered over the air contains no personal data and is not covered by this rule; self-hosting is still preferred (see the app-framework ADR).
- The SMS provider should process and store data in Switzerland where possible (authentication ADR).

## Consequences

- **Positive:** a clear, explainable privacy promise; fits self-hosting on Swiss servers.
- **Negative and risks:** managed backends outside Switzerland are excluded; we operate databases, backups and storage ourselves; every new processor needs a check against this ADR.
- **Follow-ups:**
  - Write NFR-PRIV requirements: data location, minimal push and SMS content, backups in Switzerland (`/spec-write`, `product/nfr.md`).
  - The privacy policy lists the transient processors (`app.md` → Legal; open legal-review marker).
  - Store regions: Switzerland only (`app.md` → Stores).
  - The backend, auth and push ADRs must show compliance with this ADR.
