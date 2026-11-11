# CR-0001 delta

Baseline: the requirements under IN SCOPE are built as written in the living spec; no text is copied or changed there. Two of the round's requirements needed a small correction while it was being built; they are under MODIFIED with their full new text.

## MODIFIED

### ONB-010 Age check
- **Status:** approved · **Priority:** MVP · **Since:** —
- **Requirement:** IF the entered date of birth shows that the person is younger than 18, THEN THE SYSTEM SHALL stop the sign-up on SCR-onb-age-stop with a friendly explanation (`onb.age.stop`) and create no member account.
- **Rationale:** Yaruno is for adults only, self-declared birth date (ADR-0002); J-01 failure case. A date that does not exist is caught before the age is worked out (boss, 2026-11-11).
- **Scenarios:**
  - **S1** Given a person who enters a birth date 17 years ago, when they continue, then SCR-onb-age-stop is shown and no profile is created.
  - **S2** Given a person who turns 18 today, when they continue, then the sign-up goes on.
  - **S3** Given the age stop, when it is shown, then everything entered for this sign-up, including the phone number, is deleted at once, and nothing about the person is kept (boss, 2026-11-08).
  - **S4** Given the age stop happened, when the same number starts a new sign-up, then it is treated like any new number.
  - **S5** Given a date that does not exist (such as 31.02.) or lies in the future, when the person continues, then `onb.about.error.birthDateInvalid` is shown, the sign-up does not go on, and nothing is deleted.
- **Depends on:** NFR-PRIV-002

### ONB-012 Home region
- **Status:** approved · **Priority:** MVP · **Since:** —
- **Requirement:** WHEN the person sets their home region on SCR-onb-about ("Wo möchtest du etwas unternehmen?", `onb.about.region`), THE SYSTEM SHALL let them choose any Swiss municipality by searching for it, without asking for location permission.
- **Rationale:** Region entered by hand, no location permission (`features.md` → ONB; `vision.md` → Non-goals); any Swiss municipality (boss, 2026-11-08).
- **Scenarios:**
  - **S1** Given SCR-onb-about, when the person searches "Na", then matching municipalities such as "Naters" are offered and can be chosen.
  - **S2** Given no region is chosen, when the person continues, then `onb.about.error.regionRequired` is shown.
  - **S3** Given a search for a place outside Switzerland, when the person types it, then nothing is offered (`onb.about.regionNoMatch`).

## IN SCOPE

- ONB-001 … ONB-009, ONB-011, ONB-013 … ONB-018, ONB-020
- NFR-ACC-001, NFR-INTL-001
- NFR-PRIV-002, NFR-PRIV-003
- NFR-SEC-001 … NFR-SEC-004

Not in scope from the same area: ONB-019, ONB-021, ONB-022, ONB-023, ONB-024, ONB-025 (see the proposal → Out of scope). NFR-PRIV-001 (stored data in Switzerland) is not in scope: nothing is stored on a server in this round; it returns with the first deployment.
