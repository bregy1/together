# Onboarding (`ONB`)

Sign up with a verified phone number and get a profile ready for the first plan; existing members sign in again with their phone number. One step per screen, as in the prototype ("Schritt 1 von 5"): phone and code, about you, interests, photos, Spielregeln.

- **Journeys:** J-01, J-02 (ONB-024) · **Screens:** SCR-onb-phone, SCR-onb-code, SCR-onb-about, SCR-onb-age-stop, SCR-onb-interests, SCR-onb-photos, SCR-onb-rules, SCR-notif-ask · **NFRs:** NFR-SEC-001, NFR-SEC-002, NFR-SEC-003, NFR-SEC-004, NFR-PRIV-001, NFR-PRIV-002, NFR-PRIV-003, NFR-ACC-001, NFR-INTL-001

## Out of scope

- No e-mail address at sign-up (an optional recovery address comes later, `features.md` → ONB).
- No gender, religion, children, smoking, drinking or political views (`vision.md` → Non-goals; prototype chat).
- No location permission and no address-book access (`vision.md` → Non-goals).
- No advertising or tracking consent step, because there is no tracking (`constitution.md`).
- Later, specified when they are built: suggesting a missing interest, a recovery e-mail address, correcting a mistyped birth date.

## Requirements

### ONB-001 Enter phone number
- **Status:** approved · **Priority:** MVP · **Since:** —
- **Requirement:** WHEN a person starts sign-up or sign-in, THE SYSTEM SHALL show SCR-onb-phone, which asks for a phone number with country code and explains that the number is used only to verify the account and is never shown to other members (`onb.phone.hint`).
- **Rationale:** No account without a verified phone number (`features.md` → ONB); the prototype's explanation ("Sie erscheint nicht in deinem Profil") builds trust.
- **Scenarios:**
  - **S1** Given the app is opened without a session, when the person taps to start, then SCR-onb-phone shows the country code `+41`, a number field and the hint `onb.phone.hint`.
  - **S2** Given SCR-onb-phone, when the person looks for the privacy policy, then a link to it is shown (`onb.phone.privacy`).
- **Depends on:** NFR-PRIV-002

### ONB-002 Swiss mobile numbers only
- **Status:** approved · **Priority:** MVP · **Since:** —
- **Requirement:** IF the entered number is not a valid Swiss phone number (`+41`), THEN THE SYSTEM SHALL refuse it with a message (`onb.phone.error.notSwiss`) and send no code.
- **Rationale:** Yaruno launches in Switzerland only (`vision.md` → Markets); limiting numbers also limits SMS abuse (ADR-0005).
- **Scenarios:**
  - **S1** Given SCR-onb-phone, when the person enters a German number (`+49 …`), then `onb.phone.error.notSwiss` is shown and no SMS is sent.
  - **S2** Given SCR-onb-phone, when the person enters a number with too few digits, then `onb.phone.error.invalid` is shown and no SMS is sent.

### ONB-003 Send SMS code
- **Status:** approved · **Priority:** MVP · **Since:** —
- **Requirement:** WHEN the person submits a valid Swiss phone number ("Code senden", `onb.phone.send`), THE SYSTEM SHALL send a one-time code to that number by SMS and show SCR-onb-code.
- **Rationale:** An SMS code proves access to the number (`features.md` → ONB; ADR-0005).
- **Scenarios:**
  - **S1** Given a valid Swiss number, when the person taps `onb.phone.send`, then an SMS with a code is sent and SCR-onb-code is shown with the number it was sent to.
  - **S2** Given the code cannot be sent (no connection or SMS service failure), when the person taps send, then an error with a retry action is shown (`onb.phone.error.sendFailed`) and nothing is created.
  - **S3** Given the number belongs to no account yet, when the code is sent, then the screen looks exactly as for an existing member's number.
- **Depends on:** NFR-SEC-001, NFR-SEC-002, NFR-SEC-003

### ONB-004 Verify code
- **Status:** approved · **Priority:** MVP · **Since:** —
- **Requirement:** WHEN the person enters the correct, still valid code on SCR-onb-code, THE SYSTEM SHALL mark the phone number as verified and continue: a new person to SCR-onb-about, an existing member signed in to Entdecken (ONB-007).
- **Rationale:** Verification before anything else is stored (`features.md` → ONB).
- **Scenarios:**
  - **S1** Given a code was sent to a new number, when the person enters it correctly, then SCR-onb-about is shown ("Schritt 2 von 5").
  - **S2** Given a wrong code, when the person submits it, then `onb.code.error.wrong` is shown with the number of attempts left, and the person stays on SCR-onb-code.
  - **S3** Given the code has expired or all attempts are used, when the person submits a code, then `onb.code.error.expired` is shown with the action to request a new code.
- **Depends on:** NFR-SEC-001

### ONB-005 Resend code
- **Status:** approved · **Priority:** MVP · **Since:** —
- **Requirement:** WHILE SCR-onb-code is shown, THE SYSTEM SHALL offer to send a new code once the wait time has passed, showing the remaining wait time until then (`onb.code.resendIn`).
- **Rationale:** J-01: "The SMS code doesn't arrive or is wrong: resend after a wait".
- **Scenarios:**
  - **S1** Given the code was sent 20 seconds ago, when the person looks at SCR-onb-code, then the resend action is disabled and shows the seconds left.
  - **S2** Given the wait time has passed, when the person taps `onb.code.resend`, then a new code is sent and the previous code stops working.
- **Depends on:** NFR-SEC-002

### ONB-006 Correct the number
- **Status:** approved · **Priority:** MVP · **Since:** —
- **Requirement:** WHEN the person chooses to change the number on SCR-onb-code (`onb.code.changeNumber`), THE SYSTEM SHALL return to SCR-onb-phone with the number filled in for editing.
- **Rationale:** J-01: "… or correct the number".
- **Scenarios:**
  - **S1** Given SCR-onb-code after a typo in the number, when the person taps `onb.code.changeNumber`, then SCR-onb-phone shows the entered number ready to edit.

### ONB-007 Sign in as an existing member
- **Status:** approved · **Priority:** MVP · **Since:** —
- **Requirement:** WHEN a person verifies the phone number of an existing member account, THE SYSTEM SHALL sign them in on this device and show Entdecken, without repeating the profile steps.
- **Rationale:** Sign-in uses the same phone and code flow (ADR-0005); members rarely sign in again because sessions last long.
- **Scenarios:**
  - **S1** Given a member with a complete profile installs the app on a new phone, when they verify their number, then Entdecken is shown with their profile intact.
- **Depends on:** ONB-004

### ONB-008 Resume an unfinished sign-up
- **Status:** approved · **Priority:** MVP · **Since:** —
- **Requirement:** WHEN a person with an unfinished sign-up opens the app again, THE SYSTEM SHALL continue the sign-up at the step where they left, with everything entered so far kept.
- **Rationale:** Re-verifying and retyping makes people give up (boss, 2026-11-08).
- **Scenarios:**
  - **S1** Given a person who verified the code and entered their first name, then closed the app, when they open it again, then SCR-onb-about is shown with the first name filled in.
  - **S2** Given an unfinished sign-up, when another member uses the app, then the unfinished profile appears nowhere.

### ONB-023 Delete abandoned sign-ups
- **Status:** approved · **Priority:** MVP · **Since:** —
- **Requirement:** WHEN an unfinished sign-up has had no activity for 30 days, THE SYSTEM SHALL delete it and all data entered for it.
- **Rationale:** Data minimisation (`constitution.md`); boss, 2026-11-08 (resume, with deletion after 30 days without activity).
- **Scenarios:**
  - **S1** Given an unfinished sign-up last touched 31 days ago, when the daily clean-up runs, then its data is deleted, and the number can sign up again from the start.
- **Depends on:** ONB-008

### ONB-009 First name
- **Status:** approved · **Priority:** MVP · **Since:** —
- **Requirement:** WHEN the person continues from SCR-onb-about, THE SYSTEM SHALL require a first name of 1 to 30 characters made of letters (including accented letters), spaces, hyphens and apostrophes (`onb.about.firstName`); no last name is asked.
- **Rationale:** First name only (`features.md` → ONB); names are shown to strangers, so digits and emoji are not allowed (boss, 2026-11-08).
- **Scenarios:**
  - **S1** Given SCR-onb-about with an empty first name, when the person continues, then `onb.about.error.firstNameRequired` is shown.
  - **S2** Given the first name "Anna2" or one with an emoji, when the person continues, then `onb.about.error.firstNameInvalid` is shown.
  - **S3** Given the first name "Zoë-Marie", when the person continues, then it is accepted.

### ONB-010 Age check
- **Status:** approved · **Priority:** MVP · **Since:** —
- **Requirement:** IF the entered date of birth shows that the person is younger than 18, THEN THE SYSTEM SHALL stop the sign-up on SCR-onb-age-stop with a friendly explanation (`onb.age.stop`) and create no member account.
- **Rationale:** Yaruno is for adults only, self-declared birth date (ADR-0002); J-01 failure case.
- **Scenarios:**
  - **S1** Given a person who enters a birth date 17 years ago, when they continue, then SCR-onb-age-stop is shown and no profile is created.
  - **S2** Given a person who turns 18 today, when they continue, then the sign-up goes on.
  - **S3** Given the age stop, when it is shown, then everything entered for this sign-up, including the phone number, is deleted at once, and nothing about the person is kept (boss, 2026-11-08).
  - **S4** Given the age stop happened, when the same number starts a new sign-up, then it is treated like any new number.
- **Depends on:** NFR-PRIV-002

### ONB-011 Confirm the age
- **Status:** approved · **Priority:** MVP · **Since:** —
- **Requirement:** WHEN the person continues with a birth date that makes them 18 or older, THE SYSTEM SHALL show the resulting age and ask them to confirm it (`onb.about.confirmAge`, e.g. "Du bist 29. Stimmt das?") before saving it.
- **Rationale:** Catches typos cheaply, because correcting a birth date is only a later feature (boss, 2026-11-08; prototype chat).
- **Scenarios:**
  - **S1** Given a birth date that gives 29 years, when the person continues, then "Du bist 29. Stimmt das?" is shown with confirm and change.
  - **S2** Given the confirmation, when the person chooses to change it, then SCR-onb-about is shown with the birth date ready to edit and nothing saved.

### ONB-012 Home region
- **Status:** approved · **Priority:** MVP · **Since:** —
- **Requirement:** WHEN the person sets their home region on SCR-onb-about ("Wo möchtest du etwas unternehmen?", `onb.about.region`), THE SYSTEM SHALL let them choose any Swiss municipality by searching for it, without asking for location permission.
- **Rationale:** Region entered by hand, no location permission (`features.md` → ONB; `vision.md` → Non-goals); any Swiss municipality (boss, 2026-11-08).
- **Scenarios:**
  - **S1** Given SCR-onb-about, when the person searches "Na", then matching municipalities such as "Naters" are offered and can be chosen.
  - **S2** Given no region is chosen, when the person continues, then `onb.about.error.regionRequired` is shown.
  - **S3** Given a search for a place outside Switzerland, when the person types it, then nothing is offered (`onb.about.region.noMatch`).

### ONB-013 Interests
- **Status:** approved · **Priority:** MVP · **Since:** —
- **Requirement:** WHEN the person picks interests on SCR-onb-interests, THE SYSTEM SHALL offer only the general activities of the curated activity list (e.g. "Outdoor", "Sport", "Kultur"), searchable, and allow from 0 to 5.
- **Rationale:** Up to 5 interests from a curated list; search finds existing interests only, so free text cannot create tags (`features.md` → ONB; prototype chat); none are required (boss, 2026-11-08); interests are general so the choice is not overwhelming, while plans can name specific activities (boss, 2026-11-09; PLAN-003).
- **Scenarios:**
  - **S1** Given SCR-onb-interests, when the person searches "out", then "Outdoor" is offered; typing a word that is not on the list creates nothing.
  - **S2** Given 5 interests are chosen, when the person tries to pick a sixth, then `onb.interests.limit` is shown and the sixth is not added.
  - **S3** Given no interest is chosen, when the person continues, then SCR-onb-photos is shown.

### ONB-014 Profile photos
- **Status:** approved · **Priority:** MVP · **Since:** —
- **Requirement:** WHEN the person adds photos on SCR-onb-photos, THE SYSTEM SHALL require one portrait and allow up to three more photos, taken with the camera or picked from the photo library.
- **Rationale:** One clear portrait required, up to three more optional (`features.md` → ONB; boss, 2026-11-08).
- **Scenarios:**
  - **S1** Given no photo yet, when the person tries to continue, then `onb.photos.error.portraitRequired` is shown.
  - **S2** Given a portrait and three more photos, when the person tries to add a fifth, then the add action is no longer offered.
  - **S3** Given a photo with location metadata, when it is uploaded, then the stored photo contains no location metadata.
- **Depends on:** NFR-PRIV-003

### ONB-015 Photo access denied
- **Status:** approved · **Priority:** MVP · **Since:** —
- **Requirement:** IF the person denies access to the camera or the photo library, THEN THE SYSTEM SHALL explain that a portrait is needed to finish sign-up and offer the way to the system settings (`onb.photos.permissionDenied`).
- **Rationale:** `app.md` → Permissions: without photo access, no photo can be added and sign-up needs one portrait.
- **Scenarios:**
  - **S1** Given the person denied photo-library access, when they tap to add a photo, then `onb.photos.permissionDenied` is shown with a button to the settings, and the camera remains offered if allowed.

### ONB-016 Terms, privacy policy and Spielregeln
- **Status:** approved · **Priority:** MVP · **Since:** —
- **Requirement:** WHEN the person reaches SCR-onb-rules, THE SYSTEM SHALL show the Spielregeln with links to the terms of use and the privacy policy, and complete the sign-up only after the person accepts the terms of use and the Spielregeln (`onb.rules.accept`).
- **Rationale:** Accept the terms of use (EULA) and confirm the community rules (`features.md` → ONB; `app.md` → Legal).
- **Scenarios:**
  - **S1** Given SCR-onb-rules, when the person has not accepted, then the finish action is disabled.
  - **S2** Given SCR-onb-rules, when the person opens the terms of use or the privacy policy, then the text opens and returning keeps the step.
- **Depends on:** `features.md` → MOD (rules text marker)

### ONB-017 Not a dating app
- **Status:** approved · **Priority:** MVP · **Since:** —
- **Requirement:** WHILE SCR-onb-rules is shown, THE SYSTEM SHALL state clearly that Yaruno is for meeting up and planning, not a dating app (`onb.rules.notDating`).
- **Rationale:** "We inform users that we are NOT a dating app" (boss, 2026-11-08; `vision.md` → Non-goals).
- **Scenarios:**
  - **S1** Given SCR-onb-rules, when it is shown, then `onb.rules.notDating` is visible without scrolling past the Spielregeln.

### ONB-018 Finish sign-up
- **Status:** approved · **Priority:** MVP · **Since:** —
- **Requirement:** WHEN the person accepts on SCR-onb-rules, THE SYSTEM SHALL complete the member account and show Entdecken.
- **Rationale:** J-01 step 1 → 2.
- **Scenarios:**
  - **S1** Given all steps are complete, when the person accepts, then Entdecken is shown and the member can request to join plans.
  - **S2** Given the connection drops while finishing, when the person accepts, then `onb.error.offline` is shown with a retry action and all input is kept.

### ONB-019 Ask for notifications in context
- **Status:** approved · **Priority:** MVP · **Since:** —
- **Requirement:** WHEN a member sends their first join request, THE SYSTEM SHALL explain why notifications help ("Sollen wir dich informieren, wenn deine Anfrage bestätigt wird?", `notif.ask.afterRequest`) with the choices to allow or "Nicht jetzt", before showing the system permission prompt.
- **Rationale:** Notification permission asked in context, with "Nicht jetzt" (`features.md` → ONB; prototype chat; `app.md` → Permissions).
- **Scenarios:**
  - **S1** Given a member without a notification decision, when they send their first join request, then SCR-notif-ask is shown; choosing to allow shows the system prompt.
  - **S2** Given SCR-notif-ask, when the member chooses "Nicht jetzt" (`notif.ask.notNow`), then no system prompt appears and the join request is sent anyway.

### ONB-024 Ask hosts for notifications
- **Status:** approved · **Priority:** MVP · **Since:** —
- **Requirement:** WHEN a member without a notification decision publishes their first plan, THE SYSTEM SHALL explain that notifications tell them about join requests (`notif.ask.afterPlan`) with the choices to allow or "Nicht jetzt", before showing the system permission prompt.
- **Rationale:** A host without notifications misses join requests, which hurts "plans that really happen" (boss, 2026-11-08).
- **Scenarios:**
  - **S1** Given a member who never decided on notifications, when they publish their first plan, then SCR-notif-ask is shown with `notif.ask.afterPlan`.
  - **S2** Given a member who already allowed or declined notifications, when they publish their first plan, then SCR-notif-ask is not shown.

### ONB-020 Go back without losing input
- **Status:** approved · **Priority:** MVP · **Since:** —
- **Requirement:** WHEN the person goes back to an earlier sign-up step, THE SYSTEM SHALL keep everything already entered in that step and the later ones.
- **Rationale:** Prototype chat ("Eingaben behalten"); confirmed by the boss, 2026-11-08.
- **Scenarios:**
  - **S1** Given the person picked three interests on SCR-onb-interests, when they go back to SCR-onb-about and forward again, then the three interests are still chosen.

### ONB-021 Sign-in for store reviewers
- **Status:** approved · **Priority:** MVP · **Since:** —
- **Requirement:** WHILE reviewer access is switched on by an admin, THE SYSTEM SHALL accept a fixed code for one configured reviewer number, without sending an SMS, and log every such sign-in.
- **Rationale:** Store reviewers have no Swiss SIM card, and both stores expect working demo access (ADR-0005 follow-up; boss, 2026-11-08).
- **Scenarios:**
  - **S1** Given reviewer access is on, when the reviewer number and the fixed code are entered, then the reviewer is signed in and the sign-in is logged.
  - **S2** Given reviewer access is off, when the reviewer number is entered, then it behaves like any other number and the fixed code is rejected.

### ONB-022 Banned members
- **Status:** approved · **Priority:** MVP · **Since:** —
- **Requirement:** IF a person verifies the phone number of a banned member, THEN THE SYSTEM SHALL not sign them in and show that the account is banned, with the way to object (`onb.code.banned`).
- **Rationale:** Sanctions include bans, and the person can object (`features.md` → ADM).
- **Scenarios:**
  - **S1** Given a banned member, when they verify their number, then `onb.code.banned` is shown and no session is created.

### ONB-025 A ban survives account deletion
- **Status:** approved · **Priority:** MVP · **Since:** —
- **Requirement:** WHEN a banned member's account is deleted, THE SYSTEM SHALL keep only a one-way hash of the phone number, so that the number cannot sign up again while the ban lasts.
- **Rationale:** Otherwise a ban could be escaped in two taps (boss, 2026-11-08); only a hash is kept (data minimisation).
- **Scenarios:**
  - **S1** Given a banned member deleted their account, when the same number tries to sign up, then `onb.code.banned` is shown and no account is created.
  - **S2** Given the deleted account of a banned member, when the stored data is checked, then only the hash of the number and the ban remain.
- **Depends on:** ONB-022
