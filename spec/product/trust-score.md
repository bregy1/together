# Trust score (`TRUST`)

A gentle reliability signal ("Verlässlichkeit") that mainly flags repeated bad behaviour. It is computed internally and shown only as a coloured bar with four fixed states, never as a number. Normal members, who come to what they agreed to and behave decently, reach the normal state without effort; there is nothing to collect or chase (`vision.md` → Principles; boss, 2026-11-08 and 2026-11-09).

- **Journeys:** J-01, J-02, J-04, J-05 · **Screens:** SCR-prof-view, SCR-prof-own, SCR-plan-requests (the bar appears there) · **NFRs:** NFR-ACC-001, NFR-INTL-001

## Out of scope

- No numbers, percentages, progress towards a goal, levels with rights, counters or badges such as "Stammgast" (boss, 2026-11-09; `design/direction.md` → clash 3).
- No rating of people after a plan, no punctuality rating (`features.md` → Dropped; JOIN-015).
- No deposit or money (`vision.md` → Non-goals).
- Automatic text-filter hits have no effect (`features.md` → TRUST).

## Requirements

### TRUST-001 A coloured bar, never a number
- **Status:** approved · **Priority:** MVP · **Since:** —
- **Requirement:** WHEN a member's trust label is shown, THE SYSTEM SHALL show it as a bar without any number, in one of four fixed states — new (grey, empty), normal (Mint, nearly full: fewer than 2 issues in the last 10 plans), lowered (Senf, about half: 2 or 3 issues), low (Koralle, nearly empty: 4 or more issues) — with a small visual variation of the fill inside the state's range that never makes it look like another state.
- **Rationale:** Few words, mostly the level, no number, a visual bar coloured by how full it is; KISS; a little random variation so it feels more dynamic (boss, 2026-11-09, revising "words only" of clash 3). Fixed states keep it from becoming points to chase (`vision.md` → Principles).
- **Scenarios:**
  - **S1** Given a member with 1 issue in their last 10 plans, when their profile is shown, then the bar is Mint and nearly full, with no number.
  - **S2** Given a member with 3 issues in their last 10 plans, when their profile is shown, then the bar is Senf and about half full.
  - **S3** Given two members in the normal state, when their bars are compared, then the fill may differ slightly, but both are clearly in the normal range.
  - **S4** Given the same member, when their profile is opened again later without any new issue, then the bar shows the same fill (the variation is fixed per member, so it does not look like a change).
  - **S5** Given a screen reader, when it reaches the bar, then it reads the state in words (`trust.state.new`, `.normal`, `.lowered`, `.low`), so the meaning never depends on colour alone.
- **Depends on:** PROF-001, JOIN-003, NFR-ACC-001
### TRUST-002 New members start neutral
- **Status:** approved · **Priority:** MVP · **Since:** —
- **Requirement:** WHILE a member has attended fewer than 3 plans at which at least one other person was present, THE SYSTEM SHALL show the neutral "new" state of the trust label, whatever else has happened.
- **Rationale:** New members start neutral (grey) until they have attended enough plans; solo plans don't count (`notes/score.md`; `features.md` → TRUST); 3 plans (boss, 2026-11-09).
- **Scenarios:**
  - **S1** Given a member who attended 2 plans, when their profile is shown, then the label is in the neutral "new" state.
  - **S2** Given a member who hosted 3 plans that nobody else came to, when their profile is shown, then the label is still "new".
  - **S3** Given a member who attended their third plan with others, when the plan has ended and nobody reported them missing, then their label is computed.

### TRUST-003 Attending raises the label gently
- **Status:** approved · **Priority:** MVP · **Since:** —
- **Requirement:** WHEN a member counts as having attended a plan (JOIN-015), THE SYSTEM SHALL count it towards a better label, so that members without issues reach the normal state.
- **Rationale:** Attending raises the score gently, so normal members reach an ok-to-good score (`features.md` → TRUST; boss, 2026-11-08).
- **Scenarios:**
  - **S1** Given a member who attended the threshold number of plans without any issue, when their label is computed, then it is in the normal state.
- **Depends on:** JOIN-015

### TRUST-004 What lowers the label
- **Status:** approved · **Priority:** MVP · **Since:** —
- **Requirement:** WHEN a member has 2 or more issues (no-shows, short-term cancellations that count, confirmed reports, removals the moderators did not confirm) within their last 10 plans, THE SYSTEM SHALL lower their label, and raise it again as soon as fewer than 2 issues remain within their last 10 plans.
- **Rationale:** Repeated no-shows lower the score, a single miss does not; the score mainly punishes bad behaviour (`features.md` → TRUST; boss, 2026-11-08); 2 or more within the last 10 plans, recovering by going to more plans (boss, 2026-11-09).
- **Scenarios:**
  - **S1** Given one no-show in the last 10 plans, when the label is computed, then it is not lowered.
  - **S2** Given a no-show and a counting short-term cancellation in the last 10 plans, when the label is computed, then it is lowered.
  - **S3** Given the lowered member then attends plans until the older issue is no longer among their last 10 plans, when the label is computed, then it is no longer lowered.
- **Depends on:** JOIN-017, TRUST-005, TRUST-008, TRUST-009

### TRUST-005 Short-term cancellations
- **Status:** approved · **Priority:** MVP · **Since:** —
- **Requirement:** WHEN a cancellation is recorded, THE SYSTEM SHALL count it as an issue only if it is short-term (a participant within 24 hours of the start, a host within 14 days of the start, a host who hands the plan over like a participant) and none of the exceptions of TRUST-006 applies.
- **Rationale:** Only annoying short-term cancellations count (`features.md` → TRUST; boss, 2026-11-08 and 2026-11-09; PLAN-013).
- **Scenarios:**
  - **S1** Given a participant cancels 30 hours before the start, when the effect is decided, then it is no issue.
  - **S2** Given a participant cancels 10 hours before the start for their own reason and nobody says it was fine, when the effect is decided, then it is one issue.
  - **S3** Given a host cancels a plan with participants completely 5 days ahead, when nobody says it was fine, then it is one issue for the host.
  - **S4** Given a host hands a plan over 3 days ahead and a participant takes over, when the effect is decided, then it is no issue (more than 24 hours ahead).

### TRUST-006 Cancellations without any effect
- **Status:** approved · **Priority:** MVP · **Since:** —
- **Requirement:** WHEN a cancellation falls under an exception, THE SYSTEM SHALL count it as no issue: the plan had no participants; the reason is one the host accepted for the plan (PLAN-009); the host marked it as legitimate; the rest of the group said it was fine; the host had changed crucial information of the plan (PLAN-019); the member withdrew a request before acceptance (JOIN-009).
- **Rationale:** `features.md` → TRUST (boss, 2026-11-08 and 2026-11-09); friends can cancel among themselves without any penalty.
- **Scenarios:**
  - **S1** Given a hiking plan with "schlechtes Wetter" accepted, when a participant cancels 2 hours before for that reason, then it is no issue.
  - **S2** Given two friends in a plan, when one cancels short-term and the other says it was fine, then it is no issue.
- **Depends on:** PLAN-009, PLAN-019, JOIN-009, JOIN-014

### TRUST-007 Silence on "is this fine?"
- **Status:** approved · **Priority:** MVP · **Since:** —
- **Requirement:** WHEN the group is asked whether a cancellation is fine, THE SYSTEM SHALL count it as fine unless someone answers "nicht okay"; members who do not answer count as fine.
- **Rationale:** Silence should never punish anyone (boss, 2026-11-09); JOIN-014, PLAN-014.
- **Scenarios:**
  - **S1** Given a short-term cancellation in a group of four where nobody answers, when the effect is decided, then it is no issue.
  - **S2** Given one participant answers "nicht okay" and the others don't answer, when the effect is decided, then the usual rules apply (TRUST-005).
- **Depends on:** JOIN-014, PLAN-014

### TRUST-008 Reports count only after review
- **Status:** approved · **Priority:** MVP · **Since:** —
- **Requirement:** WHEN a report about a member is confirmed by a moderator, THE SYSTEM SHALL count it as an issue; unreviewed or rejected reports and automatic text-filter hits SHALL not count.
- **Rationale:** Reports affect the score only once reviewed (boss, 2026-11-08); filter hits don't count (`features.md` → Dropped).
- **Scenarios:**
  - **S1** Given a report about Max that is still open, when his label is computed, then it has no effect.
  - **S2** Given the moderators confirm the report, when his label is computed, then it counts as one issue.
- **Depends on:** ADM

### TRUST-009 Casual removals count against the host
- **Status:** approved · **Priority:** MVP · **Since:** —
- **Requirement:** WHEN the moderators do not confirm the report that came with a host's removal of a participant (PLAN-017), THE SYSTEM SHALL count it as an issue for the host.
- **Rationale:** Hosts who remove participants casually lower their own score (boss, 2026-11-09).
- **Scenarios:**
  - **S1** Given a host removed a participant with the reason "Belästigung" and the moderators reject the report, when the host's label is computed, then it counts as one issue for the host.
- **Depends on:** PLAN-017, ADM

### TRUST-010 Lateness is not rated
- **Status:** approved · **Priority:** MVP · **Since:** —
- **Requirement:** THE SYSTEM SHALL not record or rate lateness; lateness that really matters can only reach the label through a report confirmed by a moderator.
- **Rationale:** Ratings stay really simple; lateness is not rated (boss, 2026-11-08; `features.md` → Dropped).
- **Scenarios:**
  - **S1** Given a participant arrived 20 minutes late, when the plan ends, then there is no way to record that, except a report.

### TRUST-011 A hint on the own bar
- **Status:** approved · **Priority:** MVP · **Since:** —
- **Requirement:** WHILE a member's own bar is lowered or low, THE SYSTEM SHALL show them, on their own profile only, one short neutral line on what lowered it and that it recovers with the next plans (e.g. "Ein paar kurzfristige Absagen – geht mit den nächsten Plänen wieder weg.", `trust.own.hint.*`), never numbers.
- **Rationale:** Bar plus a short hint (boss, 2026-11-09); a fair system explains itself and shows the way back (`vision.md` → Risks: unfair trust labels).
- **Scenarios:**
  - **S1** Given a member whose bar is lowered by two short-term cancellations, when they open their own profile, then the hint names short-term cancellations and that it recovers with the next plans.
  - **S2** Given another member views that profile, when it is shown, then they see only the bar, without the hint.
  - **S3** Given a member in the normal state, when they open their own profile, then no hint is shown.
- **Depends on:** PROF-003

### TRUST-012 Objecting to a no-show
- **Status:** approved · **Priority:** MVP · **Since:** —
- **Requirement:** WHEN a no-show is recorded for a member (JOIN-017), THE SYSTEM SHALL tell them and let them object once (`trust.noShow.object`); while a moderator has not decided on the objection, the no-show SHALL not count.
- **Rationale:** A no-show comes only from other people's reports, so it must be open to appeal (boss, 2026-11-09; `vision.md` → Risks).
- **Scenarios:**
  - **S1** Given the host reported Max missing, when the no-show is recorded, then Max is notified and can object.
  - **S2** Given Max objected, when his bar is computed before the moderator decides, then the no-show does not count.
  - **S3** Given the moderator rejects the objection, when his bar is computed, then the no-show counts, and Max cannot object to it again.
- **Depends on:** JOIN-017, ADM, NOTIF

### TRUST-013 What the trust bar is
- **Status:** approved · **Priority:** MVP · **Since:** —
- **Requirement:** WHEN a member taps the info sign next to a trust bar (`trust.info`), THE SYSTEM SHALL explain in a few lines what the bar shows, what lowers it, how it recovers, and how it affects the app: hosts see it when deciding on requests.
- **Rationale:** An info sign with information about the trust score, how it is made and how it can affect the app experience (boss, 2026-11-09).
- **Scenarios:**
  - **S1** Given any trust bar, when the member taps the info sign, then the explanation opens and names no-shows, short-term cancellations and confirmed reports as what lowers it, and going to plans as what brings it back.
- **Depends on:** TRUST-001, TRUST-004
