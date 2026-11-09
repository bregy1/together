# Settings & account (`SET`)

Everything a member adjusts about the app and their account: language, notifications, privacy and content choices, the feed radius, blocked members, legal texts and help, a copy of their data, logging out and deleting the account. Profile content (photos, first name, interests, "Über mich") is edited in PROF.

- **Journeys:** J-06 · **Screens:** SCR-set-home, SCR-set-notif, SCR-set-blocked, SCR-set-help, SCR-set-delete, SCR-set-number · **NFRs:** NFR-PRIV-001, NFR-INTL-001, NFR-ACC-001

## Out of scope

- Editing the profile: PROF.
- A recovery e-mail address: later (`features.md` → ONB).
- Choosing light or dark: the app follows the phone (`design/direction.md` → clash 11).

## Requirements

### SET-001 The settings
- **Status:** approved · **Priority:** MVP · **Since:** —
- **Requirement:** WHEN a member opens the settings from their own profile (`prof.own.settings`), THE SYSTEM SHALL show SCR-set-home with: language, notifications, "Freunde sehen, wo ich dabei bin", "Ungefilterte Sprache anzeigen", feed radius, blocked members, Spielregeln, safety tips, terms of use, privacy policy, help, a copy of the data, log out and delete account.
- **Rationale:** `features.md` → SET; the three tabs are Entdecken, Meine Pläne and Profil, so the settings hang off the profile (`design/direction.md` → clash 13).
- **Scenarios:**
  - **S1** Given the Profil tab, when the member taps `prof.own.settings`, then SCR-set-home lists the entries above.
- **Depends on:** PROF-003

### SET-002 Language
- **Status:** approved · **Priority:** MVP · **Since:** —
- **Requirement:** WHEN the app starts, THE SYSTEM SHALL use the phone's language if Yaruno ships it, otherwise German, unless the member chose another shipped language in the settings (`set.language`); pushes follow the same language (NOTIF-002).
- **Rationale:** Language (`features.md` → SET); German is the source, French and English are prepared (`constitution.md` → Languages; ADR-0007); most people never touch it, and bilingual Valais members can switch (boss, 2026-11-10). Which languages ship first is still open in `constitution.md`.
- **Scenarios:**
  - **S1** Given a phone set to French and French ships, when the member opens Yaruno, then it is in French.
  - **S2** Given a phone set to Italian, when the member opens Yaruno, then it is in German.
  - **S3** Given the member chose German in the settings on a French phone, when a push arrives, then it is in German.
  - **S4** Given only German ships, when the member opens the settings, then the language choice is not offered.
- **Depends on:** NOTIF-002

### SET-003 Notification settings
- **Status:** approved · **Priority:** MVP · **Since:** —
- **Requirement:** WHEN a member opens the notification settings (SCR-set-notif), THE SYSTEM SHALL show a switch for every notification they can receive, grouped by kind, the quiet hours with their times, and, if the phone does not allow pushes, the hint with the way to the phone's settings.
- **Rationale:** NOTIF-004, NOTIF-006, NOTIF-008; moderators also see the moderation notifications (N18).
- **Scenarios:**
  - **S1** Given a member without a role, when they open SCR-set-notif, then N1 to N17 are listed under their kinds, all on, and quiet hours are off.
  - **S2** Given a moderator, when they open it, then N18 is listed as well.
- **Depends on:** NOTIF-004, NOTIF-006, NOTIF-008

### SET-004 Privacy and language choices
- **Status:** approved · **Priority:** MVP · **Since:** —
- **Requirement:** WHEN a member switches "Freunde sehen, wo ich dabei bin" (on by default) or "Ungefilterte Sprache anzeigen" (off by default), THE SYSTEM SHALL apply it at once.
- **Rationale:** FRND-006, MOD-011.
- **Scenarios:**
  - **S1** Given Lea switches "Freunde sehen, wo ich dabei bin" off, when her friend Max next sees a plan she is in, then she is not named (FRND-006).
- **Depends on:** FRND-006, MOD-011

### SET-005 Feed radius
- **Status:** approved · **Priority:** MVP · **Since:** —
- **Requirement:** WHEN a member opens the feed radius from the settings, THE SYSTEM SHALL show SCR-feed-area (FEED-003).
- **Rationale:** Feed radius for Entdecken, 10 km by default, in the settings (`features.md` → SET; FEED-003).
- **Scenarios:**
  - **S1** Given the settings, when the member taps the feed radius, then SCR-feed-area opens with the current radius.
- **Depends on:** FEED-003

### SET-006 Blocked members
- **Status:** approved · **Priority:** MVP · **Since:** —
- **Requirement:** WHEN a member opens their blocked members (SCR-set-blocked), THE SYSTEM SHALL list them by first name and let the member unblock each one after a confirmation, after which the block's effects (MOD-004, MOD-005, MOD-010) end; an ended friendship is not restored.
- **Rationale:** Blocked users in the settings (`features.md` → SET; MOD).
- **Scenarios:**
  - **S1** Given Lea blocked Max, when she opens SCR-set-blocked, then Max is listed.
  - **S2** Given Lea unblocks Max and confirms, when Max publishes a plan, then Lea can see it again; they are not friends again.
  - **S3** Given nobody is blocked, when the list opens, then a short note says so.
- **Depends on:** MOD-004, FRND-008

### SET-007 Legal texts and safety
- **Status:** approved · **Priority:** MVP · **Since:** —
- **Requirement:** WHILE the settings are shown, THE SYSTEM SHALL offer the Spielregeln (SCR-mod-rules), the safety tips (SCR-mod-tips), the terms of use and the privacy policy, in the member's language.
- **Rationale:** Legal texts: terms of use, privacy policy, community rules (`features.md` → SET); safety tips reachable from the settings (MOD-009); the texts themselves are still open (`app.md` → Legal).
- **Scenarios:**
  - **S1** Given the settings, when the member taps the privacy policy, then it opens in their language.
- **Depends on:** MOD-008, MOD-009

### SET-008 Help and support
- **Status:** approved · **Priority:** MVP · **Since:** —
- **Requirement:** WHEN a member opens help (SCR-set-help), THE SYSTEM SHALL show the FAQ and a contact action that opens the phone's mail app to the project's support address, with the app version and the phone's system version filled in, and nothing else about the member.
- **Rationale:** Help and support: FAQ and a contact option (`features.md` → SET); e-mail, because members have no e-mail in Yaruno to answer to otherwise, and it needs nothing extra to build (boss, 2026-11-10); the stores require a support contact; the address itself is open in `app.md` → Legal.
- **Scenarios:**
  - **S1** Given SCR-set-help, when the member taps contact, then the mail app opens addressed to support, with the app version in the text.
  - **S2** Given no mail app is set up, when the member taps contact, then the address is shown so it can be copied.

### SET-009 A copy of my data
- **Status:** approved · **Priority:** MVP · **Since:** —
- **Requirement:** WHEN a member asks for a copy of their data (`set.export`), THE SYSTEM SHALL create at once a ZIP file with everything stored about them — profile and photos, the plans they host or took part in and their requests, their own chat messages, friends, friend requests and blocks, their settings, their trust state with the issues counting toward it, and sanctions about them — as JSON plus the photo files, and offer it through the phone's share sheet; it contains nothing about other members and never who reported them.
- **Rationale:** Data export (`features.md` → SET; J-06 step 1); right of access and portability under revFADP and GDPR (`constitution.md` → Privacy); at once as a ZIP, because a member's data is small and there is no e-mail to send it to (boss, 2026-11-10).
- **Scenarios:**
  - **S1** Given Lea asks for her data, when the file is ready a few seconds later, then the share sheet opens with a ZIP holding her data as JSON and her photos.
  - **S2** Given Lea was reported by Max, when she reads her export, then it contains no report about her that names Max, and no data about Max beyond his first name where he appears in her plans.
  - **S3** Given no connection, when Lea asks for her data, then `Das hat nicht geklappt. Nochmal?` is shown.

### SET-010 Log out
- **Status:** approved · **Priority:** MVP · **Since:** —
- **Requirement:** WHEN a member logs out and confirms, THE SYSTEM SHALL end the session on this device at once and show SCR-onb-phone.
- **Rationale:** Log out (`features.md` → SET); instant revocation on log out (ADR-0005).
- **Scenarios:**
  - **S1** Given Lea is signed in on her phone and her tablet, when she logs out on the phone, then the phone shows SCR-onb-phone and the tablet stays signed in.

### SET-011 Delete the account
- **Status:** approved · **Priority:** MVP · **Since:** —
- **Requirement:** WHEN a member deletes their account (SCR-set-delete) and confirms, THE SYSTEM SHALL at once end all its sessions, take the member out of every place where others see them, and handle their upcoming plans as for a suspension (ADM-009), and delete the account and its personal data 14 days later unless the member signs in again within that time and cancels the deletion; for a banned member, only what ONB-025 allows is kept.
- **Rationale:** Delete the account in the app (`features.md` → SET; J-06; required by both stores); instant revocation (ADR-0005); upcoming plans like a suspension, so deletion stays easy and the plans stay alive; 14 days to change one's mind (boss, 2026-11-10).
- **Scenarios:**
  - **S1** Given Lea confirms the deletion, when she is signed out, then her profile and plans are no longer visible to others, her seats are free, and her hosted plan asks the group "Wer möchte übernehmen?".
  - **S2** Given Lea signs in again 5 days later, when she confirms that she wants to stay (`set.delete.cancel`), then her account is active again; the plans she left are not restored.
  - **S3** Given 14 days have passed without a sign-in, when the clean-up runs, then the account and its personal data are deleted.
  - **S4** Given none of the plans Lea left because of the deletion, when the trust bars are computed, then they count for nobody.
- **Depends on:** ONB-025, PLAN-013, ADM-009

### SET-012 Traces of a deleted account
- **Status:** approved · **Priority:** MVP · **Since:** —
- **Requirement:** WHEN an account is deleted, THE SYSTEM SHALL show the former member as "Ehemaliges Mitglied" without photo wherever they still appear (chat messages, a past plan's people, a kept copy, a report they filed), and keep their chat messages under that name.
- **Rationale:** Keep the messages, anonymously, so the plans and chats of others stay readable (boss, 2026-11-10); chats are deleted a month after the plan anyway (CHAT-012).
- **Scenarios:**
  - **S1** Given Lea wrote in a plan chat and deleted her account, when the others read the chat, then her messages are there with "Ehemaliges Mitglied" and no photo.
  - **S2** Given Lea's account is deleted, when someone taps "Ehemaliges Mitglied", then no profile opens.
- **Depends on:** SET-011, CHAT-012

### SET-013 Deletion request from the web
- **Status:** approved · **Priority:** MVP · **Since:** —
- **Requirement:** WHEN someone asks for deletion by e-mail through the deletion page of the Yaruno website, THE SYSTEM SHALL let an admin, after checking the phone number with an SMS code, delete that account as in SET-011.
- **Rationale:** Google Play requires a web link where people can request deletion (`app.md` → Legal); a page that explains in-app deletion plus an e-mail request needs almost nothing to build, and such requests will be rare (boss, 2026-11-10).
- **Scenarios:**
  - **S1** Given someone without the app writes to support from the website, when an admin checks their number with an SMS code, then the admin can start the deletion, which runs as in SET-011.
  - **S2** Given the code is not confirmed, when the admin looks at the request, then the deletion cannot be started.
- **Depends on:** SET-011, ADM-002

### SET-014 A new phone number
- **Status:** approved · **Priority:** MVP · **Since:** —
- **Requirement:** WHEN a signed-in member enters a new Swiss mobile number in the settings (SCR-set-number) and confirms it with the SMS code sent to it, THE SYSTEM SHALL move the account to the new number, after which the old number no longer signs in to it.
- **Rationale:** Without it, people lose their trust state and friends with a new SIM; reuses the sign-up code flow (boss, 2026-11-10; ADR-0005: the phone number is the only identity).
- **Scenarios:**
  - **S1** Given Lea gets a new number, when she enters it and the correct code, then her account works with the new number, and the old number is treated like any new number.
  - **S2** Given the new number already belongs to another account, when Lea enters it, then `set.number.error.taken` is shown and nothing changes.
  - **S3** Given the new number belongs to a banned member, when Lea enters it, then it is refused like a sign-up (ONB-022).
  - **S4** Given the code limits of NFR-SEC-001 and NFR-SEC-002, when Lea asks for codes, then the same limits apply.
- **Depends on:** ONB-002, ONB-022, NFR-SEC-001, NFR-SEC-002
