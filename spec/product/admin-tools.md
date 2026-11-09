# Admin tools (`ADM`)

How the Yaruno team keeps the app safe and running: moderators review reports and objections and decide on them; admins can do everything a moderator can, plus review cancellations, manage the curated activity list and the text-filter word lists, and give the moderator role. In the pilot, Bregy and Romi moderate (`vision.md` → Users and roles).

- **Journeys:** J-04, J-05 · **Screens:** SCR-adm-home, SCR-adm-report, SCR-adm-objection, SCR-adm-cancellations, SCR-adm-activities, SCR-adm-words, SCR-adm-roles · **NFRs:** NFR-INTL-001, NFR-PRIV-001

## Out of scope

- What members do to report and block, the report reasons and the text filter's behaviour: MOD.
- Reviewing interests that members suggest: later (`features.md` → ADM).
- How the trust score counts confirmed reports and cancellations: TRUST.

## Requirements

### ADM-001 Moderator role
- **Status:** approved · **Priority:** MVP · **Since:** —
- **Requirement:** WHEN an admin gives a member the moderator role or takes it away, THE SYSTEM SHALL let that member review and decide on reports and objections from then on, or stop it at once.
- **Rationale:** Members with the moderator role can review reports and decide on them, without full admin rights (`features.md` → ADM); the role lets more people help when reports pile up (`vision.md` → Risks: moderation load).
- **Scenarios:**
  - **S1** Given an admin gives Lea the moderator role, when Lea opens the moderation, then she sees the open reports.
  - **S2** Given Lea is a moderator, when she looks for the activity list, the word lists or cancellation reviews, then they are not offered (admins only).
  - **S3** Given the admin takes the role away, when Lea opens the app, then the moderation is gone.

### ADM-002 Moderation inside the app
- **Status:** approved · **Priority:** MVP · **Since:** —
- **Requirement:** WHILE a member has the moderator or admin role, THE SYSTEM SHALL offer a "Moderation" area inside the app (SCR-adm-home, `adm.home`), reached from their own profile, with the parts their role allows.
- **Rationale:** Inside the app: no second front end, works on the phone where reports arrive, and stays within the decided stack (boss, 2026-11-10; `tech/architecture.md` → admin and moderator endpoints).
- **Scenarios:**
  - **S1** Given Romi is a moderator, when Romi opens their own profile, then "Moderation" is offered, with open reports and objections.
  - **S2** Given Bregy is an admin, when Bregy opens "Moderation", then it also shows cancellations, the activity list, the word lists, roles and reviewer access.
  - **S3** Given a member without a role, when they open their profile, then "Moderation" is not offered, and the moderation endpoints refuse them.

### ADM-003 Open reports
- **Status:** approved · **Priority:** MVP · **Since:** —
- **Requirement:** WHILE reports are open, THE SYSTEM SHALL show the moderators a list of them, oldest first, each with what was reported as it was at the time of the report, the reason and text, who reported it, and earlier decisions about the same member.
- **Rationale:** Review reports and decide on them (`features.md` → ADM; J-05 step 2); the reporter is shown only to moderators, so they can spot revenge reports (J-05: "false or revenge reports"; MOD-001 keeps the reporter hidden from everyone else); a reported chat message is kept even if deleted (CHAT-011 S5).
- **Scenarios:**
  - **S1** Given Lea reported a chat message that Max then deleted, when a moderator opens the report, then the message is shown as Lea reported it.
  - **S2** Given Max had a warning last month, when a moderator opens a new report about him, then the earlier warning is shown.

### ADM-004 Decide on a report
- **Status:** approved · **Priority:** MVP · **Since:** —
- **Requirement:** WHEN a moderator decides on a report, THE SYSTEM SHALL require one decision — no action, warning, hide the content, suspension for 7, 30 or 90 days, or ban — with a short note, count every decision except "no action" as a confirmed report with the trust effect of its sanction (TRUST-008, TRUST-014), and let the moderator choose to thank the reporter (MOD-003).
- **Rationale:** Sanctions: warn, hide content, suspend, ban (`features.md` → ADM; J-05 step 2); moderators review first, then decide (`design/direction.md` → clash 5); three fixed suspension lengths keep decisions consistent between moderators; the trust effect follows how bad the sanction is (boss, 2026-11-10).
- **Scenarios:**
  - **S1** Given a report about an insulting message, when a moderator chooses "hide the content" with a note, then the message is hidden, the report counts as confirmed, and the moderator can tick "Danke senden".
  - **S2** Given a report that turns out to be a misunderstanding, when the moderator chooses "no action", then nothing happens to the reported member, and it does not count.
  - **S3** Given a suspension, when the moderator picks its length, then only 7, 30 or 90 days are offered.
  - **S4** Given no note, when the moderator saves, then `adm.decision.error.noteRequired` is shown.
- **Depends on:** TRUST-008, TRUST-014, MOD-003

### ADM-005 What a sanction does
- **Status:** approved · **Priority:** MVP · **Since:** —
- **Requirement:** WHEN a sanction is decided, THE SYSTEM SHALL apply it at once: a warning only informs; hiding removes the reported message, plan, profile text or photo for everyone, and a hidden plan is cancelled for everyone with a neutral note (`adm.plan.hidden`) and no trust effect for its participants; a suspension or ban ends all sessions of the member (ADR-0005) and keeps them out until it ends or, for a ban, for good (ONB-022, ONB-025).
- **Rationale:** Sanctions (`features.md` → ADM); instant revocation on ban (ADR-0005); a ban survives account deletion (ONB-025).
- **Scenarios:**
  - **S1** Given a moderator hides Max's chat message, when the others open the chat, then it is gone.
  - **S2** Given a moderator hides a plan that sells something, when its participants open it, then it is cancelled with `adm.plan.hidden`, and their seats have no trust effect.
  - **S3** Given Max is suspended for 7 days, when he opens the app, then he is signed out and sees until when he is suspended, with the way to object.
- **Depends on:** ONB-022, ONB-025

### ADM-006 Tell the sanctioned member
- **Status:** approved · **Priority:** MVP · **Since:** —
- **Requirement:** WHEN a sanction is decided, THE SYSTEM SHALL tell the member which sanction it is, which Spielregel it is about and how to object (`adm.sanction.notice`), without naming the reporter.
- **Rationale:** The reported person is informed and can object (J-05 step 4); the reporter stays anonymous (MOD-001).
- **Scenarios:**
  - **S1** Given Max gets a warning for "Belästigung", when he opens the notification, then he sees the warning, the rule "Melden statt Aushalten." or the matching one, and "Widersprechen"; Lea is not named.
- **Depends on:** MOD-001, NOTIF

### ADM-007 Objections
- **Status:** approved · **Priority:** MVP · **Since:** —
- **Requirement:** WHEN a member objects to a sanction or a no-show (TRUST-012) with a short text within 14 days, once per decision, THE SYSTEM SHALL give the objection to a different moderator or an admin than the one who decided, and tell the member the outcome; an admin may decide on any objection alone, also on their own decision; a banned member objects from the ban screen without signing in (ONB-022).
- **Rationale:** The person can object (`features.md` → ADM; J-05 step 4; TRUST-012; ONB-022); 14 days and a second review by another moderator; admins can decide alone (boss, 2026-11-10).
- **Scenarios:**
  - **S1** Given Romi warned Max, when Max objects within 14 days, then the objection goes to Bregy, not to Romi.
  - **S2** Given Bregy as an admin made a decision, when the member objects, then Bregy may decide on the objection alone or leave it to Romi.
  - **S3** Given the objection is accepted, when the decision is saved, then the sanction is lifted, it no longer counts (TRUST-008), and Max is told.
  - **S4** Given 15 days have passed, or Max already objected once, when he looks for "Widersprechen", then it is no longer offered.
  - **S5** Given Max is banned, when he verifies his number, then the ban screen lets him send an objection text without signing in.
- **Depends on:** TRUST-012, ONB-022, NOTIF

### ADM-008 Review cancellations
- **Status:** approved · **Priority:** MVP · **Since:** —
- **Requirement:** WHILE a cancellation counts as an issue (TRUST-005), THE SYSTEM SHALL show it to the admins with the plan, the reason and the group's answers, and let an admin lift it with a short note, so that it no longer counts; admins cannot make a cancellation count.
- **Rationale:** Review cancellations; at the start, admins can review every cancellation (`features.md` → ADM; J-04: "the group disagrees about a cancellation: an admin reviews it"); only in the member's favour, so the system never gets harsher (boss, 2026-11-10; `vision.md` → Principles: gentle trust).
- **Scenarios:**
  - **S1** Given Max cancelled 5 hours before the start because of a family emergency and one participant said "nicht okay", when an admin reviews it and lifts it with a note, then it no longer counts for Max.
  - **S2** Given a cancellation 30 hours before the start, which does not count, when an admin looks at the list, then it is not there and cannot be made to count.
- **Depends on:** TRUST-005, TRUST-006, TRUST-007

### ADM-009 Plans of a suspended or banned member
- **Status:** approved · **Priority:** MVP · **Since:** —
- **Requirement:** WHEN a member is suspended or banned, THE SYSTEM SHALL end their participations in upcoming plans and free the seats, end their open requests, leave the plans they host to the group with "Wer möchte übernehmen?" (PLAN-013), and count none of this for anyone's trust score.
- **Rationale:** The others keep their plans, and nobody is punished for someone else's sanction (boss, 2026-11-10); the takeover keeps plans alive (PLAN-013).
- **Scenarios:**
  - **S1** Given Max takes part in two upcoming plans, when he is suspended, then both seats are free and the plans can take requests again (JOIN-013).
  - **S2** Given Max hosts a plan with three participants, when he is banned, then the participants learn that the host has left and are asked "Wer möchte übernehmen?".
  - **S3** Given these cancellations, when the trust bars are computed, then none of them counts for Max's former groups.
- **Depends on:** PLAN-013, JOIN-013

### ADM-010 Reminders for open reports
- **Status:** approved · **Priority:** MVP · **Since:** —
- **Requirement:** WHEN a report or an objection is filed, THE SYSTEM SHALL push it to all moderators (`notif.adm.newReport`), and push again when it is still open after 24 hours.
- **Rationale:** The stores expect timely action on user content (Apple App Review Guideline 1.2; Google Play User Generated Content policy; `vision.md` → Risks); the pilot has two moderators (boss, 2026-11-10).
- **Scenarios:**
  - **S1** Given Lea reports a message, when the report is filed, then Bregy and Romi get a push that names no content.
  - **S2** Given nobody has decided after 24 hours, when the time passes, then both get a reminder.
- **Depends on:** NOTIF

### ADM-011 Curated activity list
- **Status:** approved · **Priority:** MVP · **Since:** —
- **Requirement:** WHEN an admin adds, renames or deactivates a general or specific activity, with its names in German, French and English, THE SYSTEM SHALL offer it, under the new name, or no longer offer it for new plans and interests, and keep deactivated activities on the plans and profiles that already use them.
- **Rationale:** Manage the curated interest list (`features.md` → ADM); interests are the general activities, plans use general or specific ones (ONB-013, PLAN-003); every UI language needs the term (NFR-INTL-001).
- **Scenarios:**
  - **S1** Given an admin adds "Pétanque" under "Sport" with its three names, when a member creates a plan, then "Pétanque" can be chosen.
  - **S2** Given an admin deactivates "Pétanque", when a member creates a plan, then it is no longer offered, and existing Pétanque plans keep it.
- **Depends on:** ONB-013, PLAN-003

### ADM-012 Text-filter word lists
- **Status:** approved · **Priority:** MVP · **Since:** —
- **Requirement:** WHEN an admin adds or removes a word on the list of words that are refused or on the list of words that are masked, for German, Swiss German, French or English, THE SYSTEM SHALL apply the change to every text checked or shown from then on.
- **Rationale:** Word lists kept by the admins, in two levels (MOD-006, MOD-011; boss, 2026-11-10).
- **Scenarios:**
  - **S1** Given an admin adds a slur to the refused list, when a member then sends a message with it, then it is refused.
  - **S2** Given an admin adds a swear word to the masked list, when a member with the default setting reads an older message with it, then it is masked.
- **Depends on:** MOD-006, MOD-011

### ADM-013 Store reviewer access
- **Status:** approved · **Priority:** MVP · **Since:** —
- **Requirement:** WHEN an admin switches store reviewer access on or off, THE SYSTEM SHALL accept or stop accepting the fixed code for the configured reviewer number (ONB-021).
- **Rationale:** ONB-021 (reviewer access is switched on by an admin).
- **Scenarios:**
  - **S1** Given reviewer access is off, when an admin switches it on, then the reviewer can sign in with the fixed code.
- **Depends on:** ONB-021

### ADM-014 Decision log
- **Status:** approved · **Priority:** MVP · **Since:** —
- **Requirement:** WHEN a moderator or admin decides on a report, an objection or a cancellation, or changes a role, the activity list, the word lists or reviewer access, THE SYSTEM SHALL record who did it, when, what and the note, and show this log to the admins.
- **Rationale:** Objections, a misbehaving moderator and data-protection questions need to know who decided what (boss, 2026-11-10).
- **Scenarios:**
  - **S1** Given Romi warned Max, when an admin opens the log, then it shows Romi, the time, the warning and the note.
  - **S2** Given a moderator, when they look for the log, then it is not offered (admins only).

### ADM-015 False reports
- **Status:** approved · **Priority:** MVP · **Since:** —
- **Requirement:** WHEN a moderator marks a report as abusive (`adm.report.abusive`), THE SYSTEM SHALL decide the report as "no action" and file a new report about the reporter, which is decided like any other.
- **Rationale:** Stops false or revenge reports (J-05) with the existing sanctions; the trust rules stay as they are (boss, 2026-11-10).
- **Scenarios:**
  - **S1** Given Max reported Lea three times for things she did not do, when a moderator marks the latest report as abusive, then Lea is not affected, and a report about Max is opened.
  - **S2** Given that report, when a moderator decides, then any decision from ADM-004 is possible.
- **Depends on:** ADM-004

### ADM-016 How long reports are kept
- **Status:** approved · **Priority:** MVP · **Since:** —
- **Requirement:** WHEN 2 years have passed since a decision, THE SYSTEM SHALL delete the report, the reported content, the decision and its log entry, except the record of a ban, which stays while the ban lasts (ONB-025).
- **Rationale:** Repeat offenders stay recognisable for a while, and nothing is kept forever (boss, 2026-11-10; data minimisation, `constitution.md`).
- **Scenarios:**
  - **S1** Given Max got a warning 2 years ago, when the daily clean-up runs, then the report, the message and the decision are deleted.
  - **S2** Given Max was banned 3 years ago, when the clean-up runs, then the ban stays, without the reported content.
- **Depends on:** ONB-025

### ADM-017 The trust score is never edited by hand
- **Status:** approved · **Priority:** MVP · **Since:** —
- **Requirement:** THE SYSTEM SHALL offer moderators and admins no way to set or change a member's trust score directly; it changes only as a side effect of their decisions (ADM-004, ADM-007, ADM-008).
- **Rationale:** The trust score cannot be edited directly; it is always a side effect of a sanction (boss, 2026-11-10).
- **Scenarios:**
  - **S1** Given an admin looks at Max's profile in the moderation, when they look for a way to change his trust bar, then there is none.
  - **S2** Given a moderator suspends Max for 90 days, when his bar is computed, then it changes as TRUST-014 says, and in no other way.
- **Depends on:** TRUST-014
