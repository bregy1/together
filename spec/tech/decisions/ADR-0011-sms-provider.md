# ADR-0011 SMS provider for login codes

- **Status:** accepted · **Date:** 2026-11-10
- **Decided by:** the boss · **Prepared by:** Claude, consulted: architect-reviewer
- **Affected spec IDs:** ADR-0005 (authentication; the provider sits behind an interface), ADR-0001 (transient processor), ONB-001 … ONB-006, SET-014, NFR-SEC-002 (SMS limits)
- **Supersedes:** — · **Superseded by:** —

## Context

Login codes go out by SMS to Swiss mobile numbers (ADR-0005). The local prototype (M0) needs no provider: it signs in with the development sender or a fixed code. For the first real testers the boss wants a service that is free for a while, and the comparison should focus on price (boss, 2026-11-10). The boss also asked what the Swiss carriers themselves offer. A later idea, not researched here: our own SIM card with an unlimited-SMS subscription in a modem on our server (`tech/architecture.md` → Authentication).

## Decision

**Option A: ASPSMS**, decided by the boss on 2026-11-10, for the first real testers; it stays the provider for the pilot unless the later research on our own SIM card or a price check changes that.
**Reasons (boss):** chose the recommended option ("ASPSMS"): all gateways cost about the same, and this one is Swiss, prepaid and without a contract.

## Consequences

- **Positive:** a Swiss provider; prepaid credit that never expires caps both cost and fraud damage; no contract; the provider stays replaceable behind the interface (ADR-0005).
- **Negative and risks:** the price depends on the mix of Swiss networks (Sunrise and Salt cost 1.75 credits); the data processing agreement and the processing location are not confirmed yet; whether a private person can open the account is not confirmed, and the legal entity is still open (`app.md` → Legal).
- **Follow-ups:**
  - Ask ASPSMS for the free test volume; if there is none, buy one EUR 30 pack (the boss's account; the credentials stay out of the repository).
  - Before real testers: confirm the data processing agreement and where ASPSMS processes data (ADR-0001), and check the prices of larger packs.
  - Until the account exists, the code entry is built in full and the server in development mode accepts any code without sending an SMS (boss, 2026-11-10); never in production. ASPSMS is switched on only for real testers, never in tests.
  - The account, the data processing agreement and the question of who holds the account are settled by the boss once the app stands (boss, 2026-11-10).
  - Implementation rules for any provider: texts within the GSM-7 character set so a code fits one message; only Swiss mobile ranges; the limits of NFR-SEC-002; a spending alert.
  - Later research (boss, 2026-11-10): our own SIM card with an unlimited-SMS subscription (about CHF 30 a month) in a GSM modem on our server; it pays off above roughly 400 messages a month, if the subscription allows machine-sent messages. To be looked at once the volume gets near that (boss, 2026-11-10).
