# ADR-0002 Minimum age 18, self-declared

- **Status:** accepted · **Date:** 2026-11-08
- **Decided by:** the boss · **Prepared by:** Claude
- **Affected spec IDs:** `product/vision.md` → Target users (minimum age), Risks and constraints; `product/features.md` → ONB (date of birth, 18+); `product/app.md` → Stores (age rating); `product/journeys.md` → J-01 (under 18 stops sign-up)
- **Supersedes:** — · **Superseded by:** —

## Context

TOGETHER brings people together in person, in small groups of strangers. During `/app-discover` (2026-11-08) the boss set the minimum age to 18, checked through a self-declared date of birth at sign-up. This ADR records that legal product rule, because it is expensive to reverse once minors' data exists or the store age rating is set.

## Decision drivers

1. Safety: adults meet strangers in person; minors in that setting would need protections TOGETHER cannot offer (boss, 2026-11-08)
2. No minors' data: avoids the extra legal duties for processing minors' data (boss, 2026-11-08)
3. Low cost and little sensitive data: an ID check costs money per check and handles very sensitive data (boss, 2026-11-08; `constitution.md` data minimisation)

## Options

### A) 18+, self-declared date of birth
- **Pros:** simple; no extra sensitive data; standard for comparable apps.
- **Cons:** people can lie about their birth date.
- **Cost and effort:** none beyond the sign-up step.

### B) 18+, with an ID or age-estimation check
- **Pros:** age is actually proven.
- **Cons:** cost per check; sensitive (often biometric) data; more people drop out at sign-up.
- **Cost and effort:** a vendor contract and integration.

### C) 16+
- **Pros:** a larger audience.
- **Cons:** minors meeting adult strangers; extra duties for minors' data.
- **Cost and effort:** extra safety features and legal work.

### Comparison

| Driver | A | B | C |
|---|---|---|---|
| Safety | meets (adults only, self-declared) | meets best | fails |
| No minors' data | meets, apart from false declarations | meets | fails |
| Low cost, little sensitive data | meets | fails | meets |

**Recommendation (Claude):** A, because it covers the drivers at no cost; the selfie-verified badge (later) adds trust without collecting ID documents. Would change if a law or store rule required proven age for this kind of app. Reversal cost: medium (tightening later is possible; loosening needs new safety and legal work).
**Not verified:** none (no external facts used).

## Decision

**Option A**, decided by the boss on 2026-11-08.

**Reasons (boss):** safety; no minors' data; a self-declared birth date is enough for the pilot.

## Consequences

- **Positive:** a simple sign-up; no ID documents stored.
- **Negative and risks:** minors can sign up with a false birth date. Moderators ban accounts that turn out to be minors (`features.md` → ADM sanctions).
- **Follow-ups:**
  - ONB requirements for the age check and the friendly stop for under-18s (`/spec-write ONB`).
  - Store age-rating questionnaires answered for 18+ (`app.md` → Stores).
  - The Spielregeln state "TOGETHER ist ab 18" (`features.md` → MOD rules-text marker).
