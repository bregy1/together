# ADR-0005 Authentication with phone number and SMS code

- **Status:** accepted · **Date:** 2026-11-08
- **Decided by:** the boss · **Prepared by:** Claude, consulted: auth-integration-engineer
- **Affected spec IDs:** `product/features.md` → ONB (phone number with SMS code; no account without a verified phone number), SET (log out, delete account), ADM (moderator and admin roles, bans); `product/journeys.md` → J-01 (SMS code doesn't arrive), J-06; ADR-0001; ADR-0004
- **Supersedes:** — · **Superseded by:** —

## Context

Every account needs a verified phone number; sign-up and sign-in use an SMS code, and email is not required (`features.md` → ONB). Sessions should last long on the device. The backend is Go, ent and PostgreSQL on Swiss servers (ADR-0004), and the WebSocket must be authenticated too (ADR-0006). This ADR decides how the code flow and sessions are built, which SMS provider sends the codes, and the abuse protection baseline. Detailed limits become NFR-SEC requirements.

## Decision drivers

1. Phone + SMS code as the only sign-in method in the MVP (`features.md` → ONB)
2. Stored data in Switzerland; the SMS provider ideally Swiss with a data-processing agreement (ADR-0001)
3. Fits the Go/ent/PostgreSQL stack; open source; near-zero cost (boss, ADR-0004)
4. Abuse resistance: SMS pumping, code brute force, enumeration (`vision.md` → Risks)
5. Instant revocation on log out, ban and account deletion (`features.md` → SET, ADM)

## Options

### A) Custom code flow in the Go service
- **Pros:** no extra service; one identity store (ent); we control rate limits, the WebSocket handshake and the SMS provider; lowest cost.
- **Cons:** we own the security details (hashed single-use codes, constant-time comparison, attempt limits, session handling).
- **Cost and effort:** small: one table for code challenges, one for device sessions.

### B) Ory Kratos (self-hosted, Go)
- **Pros:** ready-made identity service; passwordless SMS code login with the phone number as identifier is supported; generic HTTP SMS courier.
- **Cons:** a second service and identity store next to ent; flow-oriented API needs adapter work for the mobile app and the WebSocket; pumping protection is still ours.
- **Cost and effort:** medium; a spike is needed first.
- **Sources:** https://www.ory.com/docs/kratos/passwordless/one-time-code (checked 2026-11-08)

### C) Zitadel (self-hosted)
- Ruled out: SMS codes are a second factor only, sign-in with only a phone number is not supported, and the server is AGPL-3.0 from v3.
- **Sources:** https://help.zitadel.com/zitadel-licensing-faqs (checked 2026-11-08)

### Sessions (for A)
Opaque random device-session tokens (256 bit; only a hash stored), one session per device, sliding expiry, stored on the device in `expo-secure-store` (Keychain / Keystore). Log out, ban and account deletion delete the sessions and close open WebSockets. The WebSocket upgrade request carries the token in the `Authorization` header and is checked before the connection is accepted. JWTs are not used: they cannot be revoked before they expire, and one server gains nothing from them.
- **Sources:** https://docs.expo.dev/versions/latest/sdk/securestore/ (checked 2026-11-08)

### SMS provider
- **ASPSMS (VADIAN.NET AG, St. Gallen):** Swiss; prepaid credits that never expire; about 4–7 euro cents per SMS to Swiss mobile numbers depending on network and volume (Sunrise rises to 1.75 credits from 2026-08-01); REST/JSON API. Data location and DPA to be confirmed in writing. **Recommended.**
- **eCall (F24 Schweiz AG):** claims data stays in Switzerland; prices not published.
- **Twilio (Verify or SMS):** built-in fraud controls, but a US processor and more expensive; ruled out by driver 2.
- **Sources:** https://www.aspsms.com/en/prices/ (checked 2026-11-08) · https://www.aspsms.com/en/newsletter/ (checked 2026-11-08) · https://info.ecall.ch/en/products/interfaces/ (checked 2026-11-08) · https://www.twilio.com/en-us/sms/pricing/ch (checked 2026-11-08)

### Abuse protection baseline
- Phone numbers normalised to E.164; only `+41` at launch (configurable allowlist).
- 6-digit codes from a secure random source, stored hashed, single use, 5-minute expiry, at most 5 attempts.
- Rate limits per number, per IP and per device, plus a global daily SMS cap with an alert at half the budget (the main defence against SMS pumping).
- The same answer whether or not a number has an account; the account is created only after the code is verified.
- Re-verification on a new device after long inactivity (recycled numbers).
- Device attestation (Apple App Attest, Google Play Integrity): not in the MVP; added if abuse appears, because it adds Apple and Google calls to the sign-in path.

### Comparison

| Driver | A) Custom | B) Kratos | C) Zitadel |
|---|---|---|---|
| Phone + SMS as only method | meets | meets | fails |
| Data in Switzerland | meets (self-hosted) | meets (self-hosted) | meets |
| Stack fit, open, cost | meets | partly (second service) | fails (AGPL, heavy) |
| Abuse resistance | meets with the baseline | meets with the baseline | — |
| Instant revocation | meets | meets | — |

**Recommendation (Claude):** A with opaque device sessions and ASPSMS, because the flow is small, fits the stack and keeps one identity store; an identity service would add a second store without removing the hard parts (abuse control, sessions). Would change if more sign-in methods (passkeys, social login) become MVP: then Kratos is worth a spike. Reversal cost: medium (session migration; the SMS provider is easy to swap).
**Not verified:** ASPSMS data location, DPA and API quality; eCall prices; Ory Kratos's current licence; whether App Attest verification needs calls to Apple.

## Decision

**Option A: a custom code flow in the Go service with opaque device sessions** and the abuse protection baseline above, decided by the boss on 2026-11-08. SMS sending sits behind a provider interface. **The production SMS provider is not chosen yet:** development and early testing use a free development sender, and the provider is decided before the first store deployment (`tech/architecture.md` → Authentication).

**Reasons (boss):** chose the recommended flow. On the SMS provider: "We have to start with something free, for development and early testing. Decide later, when deploying to the App Store."

## Consequences

- **Positive:** one identity store; full control over abuse limits, revocation and the WebSocket handshake; no cost during development.
- **Negative and risks:** we own the security details of the flow (an independent security review before launch is advisable); the free development sender must never be active in production, because it would let anyone read login codes.
- **Follow-ups:**
  - NFR-SEC requirements: code length, expiry and attempts, rate limits, daily SMS cap, session lifetime, re-verification on a new device, the development sender disabled in production (`/spec-write`, `product/nfr.md`).
  - Choose the production SMS provider before the first store deployment (marker in `tech/architecture.md`); ASPSMS is the researched candidate.
  - Store review needs a way to sign in without a real SMS (e.g. a reviewer test number with a fixed code); decide with the ONB requirements.
  - Security audit of the auth flow before launch (`security-auditor`).
