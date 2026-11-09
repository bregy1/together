# Profile (`PROF`)

Show who someone is, only in the context of a plan or a friendship, and let members keep their own profile up to date. The layout follows the prototype (like Bumble): a large photo with first name and age, then the rest.

- **Journeys:** J-01, J-02, J-03 · **Screens:** SCR-prof-view, SCR-prof-own, SCR-prof-edit · **NFRs:** NFR-PRIV-002, NFR-PRIV-003, NFR-ACC-001, NFR-INTL-001

## Out of scope

- No people directory: nobody can search or browse members (`vision.md` → Non-goals).
- No gender, religion, children, smoking, drinking or political views on profiles (`vision.md` → Non-goals; prototype chat).
- Later, specified when it is built: the selfie-verified badge (`features.md` → PROF).
- Correcting the date of birth (later, `features.md` → ONB).

## Requirements

### PROF-001 What a profile shows
- **Status:** approved · **Priority:** MVP · **Since:** —
- **Requirement:** WHEN a member opens a profile, THE SYSTEM SHALL show the photos, first name, age, interests in the member's own order, the optional "Über mich" text and the trust label (Verlässlichkeit), and never the phone number, the date of birth or the home region.
- **Rationale:** `features.md` → PROF; `notes/use-case.md` (Profil); prototype chat (large photo with name and age); the home region is used for the feed only (boss, 2026-11-08).
- **Scenarios:**
  - **S1** Given a member with 3 photos, 2 interests and an "Über mich" text, when another member opens the profile, then SCR-prof-view shows the main photo large with first name and age, the other photos, the 2 interests in the owner's order, the "Über mich" text and the trust label.
  - **S2** Given a member without an "Über mich" text and without interests, when the profile is opened, then those sections are left out instead of shown empty.
  - **S3** Given any profile, when another member opens it, then it shows neither the phone number, the date of birth nor the home region.
- **Depends on:** NFR-PRIV-002; TRUST (the label itself)

### PROF-002 Profiles only in context
- **Status:** approved · **Priority:** MVP · **Since:** —
- **Requirement:** WHEN a member tries to open another member's profile, THE SYSTEM SHALL show it only if they share a context: the other is the host of a plan the member can see, the other has an open join request for the member's plan, both are participants of the same plan that has not ended more than 7 days ago, or they are friends.
- **Rationale:** Profiles are visible only in context; no people directory (`features.md` → PROF; `vision.md` → Non-goals; prototype chat); a week after the plan is enough to add each other as friends (boss, 2026-11-08).
- **Scenarios:**
  - **S1** Given a plan in the feed, when a member taps the host, then the host's profile is shown.
  - **S2** Given Timmy requested to join Anna's plan, when Anna opens the request, then she can open Timmy's profile.
  - **S3** Given two members with no shared plan, open request or friendship, when one tries to open the other's profile (e.g. through an old link), then `prof.view.unavailable` is shown and no profile data is delivered.
  - **S4** Given any member, when they look for a way to search or list members, then there is none.
  - **S5** Given two participants of a plan that ended 6 days ago, when one opens the other's profile, then it is shown; 8 days after the end, `prof.view.unavailable` is shown unless they have become friends.

### PROF-003 Own profile
- **Status:** approved · **Priority:** MVP · **Since:** —
- **Requirement:** WHEN a member opens the Profil tab, THE SYSTEM SHALL show SCR-prof-own: their own profile exactly as other members see it, with an edit action (`prof.own.edit`).
- **Rationale:** "Profil" is one of the three tabs (`design/direction.md` → Tab bar); members see what hosts will see (boss, 2026-11-09).
- **Scenarios:**
  - **S1** Given a member opens the Profil tab, when SCR-prof-own is shown, then it shows the same sections as SCR-prof-view would show to another member, plus the edit action.
  - **S2** Given SCR-prof-own, when the member taps `prof.own.edit`, then SCR-prof-edit opens.

### PROF-004 Spielregeln from the profile
- **Status:** approved · **Priority:** MVP · **Since:** —
- **Requirement:** WHILE SCR-prof-own is shown, THE SYSTEM SHALL offer a link to the Spielregeln (`prof.own.rules`).
- **Rationale:** The community rules are reachable from the profile (`features.md` → PROF; prototype chat).
- **Scenarios:**
  - **S1** Given SCR-prof-own, when the member taps `prof.own.rules`, then the Spielregeln are shown.

### PROF-005 Edit profile
- **Status:** approved · **Priority:** MVP · **Since:** —
- **Requirement:** WHEN a member saves changes on SCR-prof-edit, THE SYSTEM SHALL update their first name, photos, home region, interests and "Über mich" text under the same rules as at sign-up (ONB-009, ONB-012, ONB-013, ONB-014).
- **Rationale:** "Edit your own profile" (`features.md` → PROF).
- **Scenarios:**
  - **S1** Given SCR-prof-edit, when the member adds an interest and saves, then their profile shows it at once.
  - **S2** Given unsaved changes, when the member leaves SCR-prof-edit, then they are asked whether to discard them (`prof.edit.discard`).
  - **S3** Given the member's birth date, when they open SCR-prof-edit, then it cannot be changed there.
- **Depends on:** ONB-009, ONB-012, ONB-013, ONB-014

### PROF-006 A portrait stays
- **Status:** approved · **Priority:** MVP · **Since:** —
- **Requirement:** IF a member tries to remove their only remaining photo, THEN THE SYSTEM SHALL refuse with a message (`prof.edit.error.lastPhoto`) and keep the photo.
- **Rationale:** One portrait is required (`features.md` → ONB).
- **Scenarios:**
  - **S1** Given a profile with one photo, when the member deletes it, then `prof.edit.error.lastPhoto` is shown and the photo stays.
  - **S2** Given a profile with two photos, when the member replaces the portrait, then the new photo is stored without metadata.
- **Depends on:** NFR-PRIV-003

### PROF-007 Main photo
- **Status:** approved · **Priority:** MVP · **Since:** —
- **Requirement:** WHEN a member reorders their photos on SCR-prof-edit, THE SYSTEM SHALL save the order and show the first photo as the large main photo.
- **Rationale:** Prototype chat (large main photo); members can change their main photo without deleting photos (boss, 2026-11-09).
- **Scenarios:**
  - **S1** Given photos P1, P2, P3, when the member moves P3 to the first place and saves, then P3 is shown large on the profile, followed by P1 and P2.
  - **S2** Given a member who cannot drag, when they reorder photos, then move-earlier and move-later actions do the same (WCAG 2.2, 2.5.7 Dragging Movements).
- **Depends on:** NFR-ACC-001

### PROF-008 Sort interests
- **Status:** approved · **Priority:** MVP · **Since:** —
- **Requirement:** WHEN a member reorders their interests on SCR-prof-edit, THE SYSTEM SHALL save and show them in that order.
- **Rationale:** "Members can sort their interests" (`features.md` → PROF; `notes/use-case.md`).
- **Scenarios:**
  - **S1** Given interests A, B, C, when the member moves C to the top and saves, then the profile shows C, A, B.
  - **S2** Given a member who cannot drag, when they reorder interests, then move-up and move-down actions do the same (WCAG 2.2, 2.5.7 Dragging Movements).
- **Depends on:** NFR-ACC-001

### PROF-009 "Über mich" text
- **Status:** approved · **Priority:** MVP · **Since:** —
- **Requirement:** WHEN a member saves their "Über mich" text, THE SYSTEM SHALL accept it only if it has at most 300 characters and passes the text filter.
- **Rationale:** "Optionale Beschreibung" (`notes/use-case.md`); text filter for profile texts (`features.md` → MOD); 300 characters fit a few sentences without turning profiles into essays (boss, 2026-11-09).
- **Scenarios:**
  - **S1** Given a description over the maximum length, when the member saves, then `prof.edit.error.descriptionTooLong` is shown with the number of characters over.
  - **S2** Given a description the text filter blocks, when the member saves, then `prof.edit.error.descriptionBlocked` is shown and nothing is saved.
- **Depends on:** MOD (text filter)

### PROF-010 Report or block from a profile
- **Status:** approved · **Priority:** MVP · **Since:** —
- **Requirement:** WHILE another member's profile is shown, THE SYSTEM SHALL offer to report (`prof.view.report`) or block (`prof.view.block`) that member; what reporting and blocking do is specified in MOD.
- **Rationale:** Report and block a user (`features.md` → MOD); the profile is where people decide whom they don't want to meet (boss, 2026-11-08).
- **Scenarios:**
  - **S1** Given another member's profile, when it is shown, then the report and block actions are available.
  - **S2** Given the member's own profile, when it is shown, then neither action is offered.
- **Depends on:** MOD

### PROF-011 First-name changes limited
- **Status:** approved · **Priority:** MVP · **Since:** —
- **Requirement:** IF a member tries to change their first name less than 30 days after the last change, THEN THE SYSTEM SHALL refuse it and show the date from which a change is possible again (`prof.edit.error.nameChangeTooSoon`).
- **Rationale:** At most one first-name change per 30 days limits name-hopping (boss, 2026-11-08).
- **Scenarios:**
  - **S1** Given a member who changed their first name 10 days ago, when they try to change it again, then `prof.edit.error.nameChangeTooSoon` is shown with the date 20 days from now and the old name stays.
  - **S2** Given a member who never changed their first name since sign-up, when they change it, then the change is saved.
- **Depends on:** PROF-005
