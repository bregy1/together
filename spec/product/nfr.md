# Non-functional requirements

Qualities the whole app must have. Same format and statuses as product requirements (`spec/README.md`); IDs are `NFR-<CAT>-<NNN>`. Every NFR is measurable: a number and a condition. Keep only the categories that have content. Category codes are capital letters only, no digits, so the kit's ID checks recognise them.

| Category | Code |
|---|---|
| Accessibility | `ACC` |
| Privacy and data protection | `PRIV` |
| Security | `SEC` |
| Internationalisation | `INTL` |

## Accessibility (`ACC`)

### NFR-ACC-001 WCAG 2.2 AA on every screen
- **Status:** approved · **Priority:** MVP · **Since:** —
- **Requirement:** THE SYSTEM SHALL meet the success criteria of WCAG 2.2 level AA on every screen, in the light and the dark look.
- **Rationale:** `constitution.md` → Quality bars; `design/direction.md` → Accessibility.
- **Scenarios:**
  - **S1** Given the largest system text size, when any screen is shown, then no text is cut off and every action stays reachable.
  - **S2** Given a screen reader is on, when the member moves through a screen, then every control and photo is announced with a label and in a logical order.
  - **S3** Given any text or control in either look, when its contrast is measured, then it is at least 4.5:1 for body text and 3:1 for large text and controls.

## Privacy and data protection (`PRIV`)

### NFR-PRIV-001 Stored personal data in Switzerland
- **Status:** approved · **Priority:** MVP · **Since:** —
- **Requirement:** THE SYSTEM SHALL store all personal data, including photos, backups and logs that contain personal data, only on servers in Switzerland.
- **Rationale:** ADR-0001.
- **Scenarios:**
  - **S1** Given any stored personal data or backup, when its storage location is checked, then it is in Switzerland.

### NFR-PRIV-002 Phone number and birth date stay private
- **Status:** approved · **Priority:** MVP · **Since:** —
- **Requirement:** THE SYSTEM SHALL never show a member's phone number or full date of birth to other members; other members see the age only.
- **Rationale:** `features.md` → ONB, PROF ("the full birth date stays private"); ONB-001 hint.
- **Scenarios:**
  - **S1** Given any screen or API response another member can see, when it shows a profile, then it contains the age but neither the phone number nor the birth date.

### NFR-PRIV-003 Photos without metadata
- **Status:** approved · **Priority:** MVP · **Since:** —
- **Requirement:** WHEN a photo is uploaded, THE SYSTEM SHALL re-encode it and remove all embedded metadata, including location, before storing it.
- **Rationale:** ADR-0004 (photos re-encoded on upload); photos must not reveal where they were taken.
- **Scenarios:**
  - **S1** Given a photo with GPS coordinates in its metadata, when it is uploaded, then the stored photo contains no metadata.

## Security (`SEC`)

### NFR-SEC-001 Login codes
- **Status:** approved · **Priority:** MVP · **Since:** —
- **Requirement:** THE SYSTEM SHALL use login codes of 6 digits that are valid for 5 minutes, work only once, become invalid after 5 wrong attempts, and become invalid when a newer code is sent.
- **Rationale:** ADR-0005 (abuse protection baseline).
- **Scenarios:**
  - **S1** Given a code sent 6 minutes ago, when it is entered, then it is rejected as expired.
  - **S2** Given 5 wrong attempts, when the correct code is entered, then it is rejected and a new code is needed.

### NFR-SEC-002 SMS sending limits
- **Status:** approved · **Priority:** MVP · **Since:** —
- **Requirement:** THE SYSTEM SHALL send at most one SMS code per phone number per 60 seconds, 3 per 15 minutes and 5 per day, at most 10 per network address per hour, and at most 200 in total per day, alerting the admins when 100 are reached that day.
- **Rationale:** ADR-0005 (rate limits and a global daily cap, the main defence against SMS pumping); limits confirmed by the boss, 2026-11-08.
- **Scenarios:**
  - **S1** Given a number that received 5 codes today, when a sixth is requested, then no SMS is sent and `onb.phone.error.tooMany` is shown.
  - **S2** Given the daily total is reached, when anyone requests a code, then no SMS is sent and `onb.phone.error.unavailable` is shown.

### NFR-SEC-003 No account enumeration
- **Status:** approved · **Priority:** MVP · **Since:** —
- **Requirement:** THE SYSTEM SHALL answer a code request in the same way, and in about the same time, whether or not the phone number belongs to an account.
- **Rationale:** ADR-0005 (same answer whether or not a number has an account).
- **Scenarios:**
  - **S1** Given one registered and one unknown number, when codes are requested for both, then the responses do not differ in content.

### NFR-SEC-004 No test code delivery in production
- **Status:** approved · **Priority:** MVP · **Since:** —
- **Requirement:** THE SYSTEM SHALL refuse to start in production while the development code sender (which writes codes to logs instead of sending SMS) is enabled.
- **Rationale:** ADR-0005 (the free development sender must never be active in production).
- **Scenarios:**
  - **S1** Given the production configuration with the development sender enabled, when the server starts, then it stops with an error.

## Internationalisation (`INTL`)

### NFR-INTL-001 All UI text through keys
- **Status:** approved · **Priority:** MVP · **Since:** —
- **Requirement:** THE SYSTEM SHALL take every user-facing text, including push and SMS texts, from translation keys, with German as the source language, so that French and English ship by adding translations only.
- **Rationale:** `constitution.md` → Languages; ADR-0007.
- **Scenarios:**
  - **S1** Given the code base, when it is checked for hard-coded user-facing strings, then none are found.
  - **S2** Given French translations are added, when the device language is French, then the app shows French without a code change.
