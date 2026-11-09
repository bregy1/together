# Notifications (`NOTIF`)

Tell people about what concerns them: requests, decisions, changes to their plans, invitations, chat, and moderation. The events themselves are specified in their areas; this area holds the list of notifications and the rules that apply to all of them. Push goes directly to APNs and FCM and never carries a location, a meeting point or chat text (ADR-0006).

- **Journeys:** J-01, J-02, J-03, J-04, J-05 · **Screens:** SCR-notif-ask (ONB), SCR-set-notif (SET) · **NFRs:** NFR-INTL-001, NFR-PRIV-001

## Out of scope

- E-mail and SMS notifications: SMS is only for the login code (ADR-0005); there is no e-mail.
- Asking for the notification permission: ONB-019, ONB-024.
- The switches themselves live in the settings (SET); this area says what can be switched.

## Notifications

Every notification below goes to the people named, in their app language, and opens the screen named when tapped. Every notification can be switched off on its own; "Kind" is the group it is listed under in the settings (NOTIF-004).

| # | Event | To | Opens | Source | Kind |
|---|---|---|---|---|---|
| N1 | A join request arrived | host | SCR-plan-requests | JOIN-001, JOIN-003 | requests |
| N2 | A request is still open (once, after 24 h or 3 h before the start) | host | SCR-plan-requests | JOIN-016 | requests |
| N3 | Request accepted | requester | SCR-plan-view | JOIN-004 | requests |
| N4 | Request not accepted, group full, or ended at the start | requester | SCR-plan-view with similar plans | JOIN-005, JOIN-006, JOIN-007 | requests |
| N5 | Invited into a plan | invited friend | SCR-plan-view | FRND-005 | requests |
| N6 | A plan you were in is reopened: "Bist du wieder dabei?" | earlier participants | SCR-plan-view | PLAN-025 | requests |
| N7 | Crucial change (time, place, meeting point, activity) | participants | SCR-plan-view | PLAN-021 | plan changes |
| N8 | Plan cancelled, with the reason and "War dieser Abbruch für dich okay?" | participants | SCR-plan-view | PLAN-014, PLAN-024, PLAN-013 S3 | plan changes |
| N9 | Host left: "Wer möchte übernehmen?" | participants | SCR-plan-takeover | PLAN-013 | plan changes |
| N10 | A participant cancelled, with the reason and "Ist das okay?" | host, other participants | SCR-plan-view | JOIN-014 | plan changes |
| N11 | You were removed from a plan | removed member | SCR-plan-view | PLAN-017 | account |
| N12 | Reminder the day before | participants | SCR-plan-view | `features.md` → NOTIF | reminders |
| N13 | New chat messages, grouped | host, participants | SCR-plan-chat | CHAT-006, CHAT-016 | chat |
| N14 | Friend request | the other member | SCR-frnd-list | FRND-002 | friends |
| N15 | No-show recorded, with "Widersprechen" | the member | SCR-plan-view | TRUST-012 | account |
| N16 | A sanction, with the rule and "Widersprechen"; the outcome of an objection | the member | the notice | ADM-006, ADM-007 | account |
| N17 | Thank-you for a report (only if the moderator chooses) | reporter | — | MOD-003 | account |
| N18 | New report or objection; reminder after 24 h | moderators | SCR-adm-report or SCR-adm-objection | ADM-010 | moderation |

## Requirements

### NOTIF-001 What is notified
- **Status:** approved · **Priority:** MVP · **Since:** —
- **Requirement:** WHEN one of the events N1 to N18 happens, THE SYSTEM SHALL send a push notification to the people named in the table, unless they switched that notification off (NOTIF-004) or it falls into their quiet hours (NOTIF-006), and open the named screen when it is tapped.
- **Rationale:** The notification list in `features.md` → NOTIF and the areas' requirements named in the table.
- **Scenarios:**
  - **S1** Given Timmy requested a plan, when the host accepts him, then Timmy gets N3, and tapping it opens the plan with the location unlocked.
  - **S2** Given a notification about a plan Timmy no longer has access to (e.g. he was removed), when he taps it, then the plan shows `plan.view.unavailable`.
- **Depends on:** ONB-019, ONB-024

### NOTIF-002 Nothing private in a push
- **Status:** approved · **Priority:** MVP · **Since:** —
- **Requirement:** WHEN a push notification is sent, THE SYSTEM SHALL put into it only the kind of event, the plan's title, a first name where needed and a short text in the member's app language, never a location, a meeting point, a chat text, a report reason or the name of a reporter.
- **Rationale:** Push goes through Apple and Google, outside Switzerland, so it carries minimal content (ADR-0001, ADR-0006); the reporter stays anonymous (MOD-001); the push is in the member's language (NFR-INTL-001).
- **Scenarios:**
  - **S1** Given the host moved the meeting point, when the push is sent, then it says that the meeting point changed, not where it is now.
  - **S2** Given Lea uses the app in French, when she gets a push, then it is in French.
- **Depends on:** NFR-INTL-001

### NOTIF-003 Push only, no inbox
- **Status:** approved · **Priority:** MVP · **Since:** —
- **Requirement:** WHILE a notification's event still matters, THE SYSTEM SHALL show its state where it belongs in the app (Meine Pläne, the plan, the friends list, badges), so that nothing depends on the push, and show a sanction or a no-show (N15, N16) on the next app start if the member has not opened it; there is no list of notifications in the app.
- **Rationale:** Push only, because Meine Pläne already shows requests, invitations, changes, takeovers and unread chats; a second inbox would duplicate it (boss, 2026-11-10; KISS). Members without push still learn what matters (`app.md` → Permissions).
- **Scenarios:**
  - **S1** Given Timmy has pushes off, when the host accepts him and he opens Meine Pläne, then the plan shows "Ich nehme teil".
  - **S2** Given Max was warned while his pushes were off, when he next opens the app, then the warning with "Widersprechen" is shown before anything else.
  - **S3** Given a member looks for a notification list, when they browse the app, then there is none.

### NOTIF-004 Switching notifications off
- **Status:** approved · **Priority:** MVP · **Since:** —
- **Requirement:** WHEN a member switches a notification off or on in the settings (SCR-set-notif), THE SYSTEM SHALL stop or resume pushing it to them; every notification N1 to N18 has its own switch, on by default, listed under its kind.
- **Rationale:** Any notification can be switched off: user freedom (boss, 2026-11-10); each kind of notification, e.g. reminders, can be switched off (`features.md` → SET). The state stays visible in the app either way (NOTIF-003).
- **Scenarios:**
  - **S1** Given Lea switched off the reminder (N12), when a plan of hers is tomorrow, then she gets no reminder, and her other notifications still arrive.
  - **S2** Given Max switched off sanction notices (N16), when he is warned, then he gets no push, and the warning is shown on his next app start (NOTIF-003).
  - **S3** Given a new member, when they open the notification settings, then every switch is on.
- **Depends on:** SET, NOTIF-003

### NOTIF-005 Reminder the day before
- **Status:** approved · **Priority:** MVP · **Since:** —
- **Requirement:** WHEN it is 18:00 on the evening before a plan's start day, THE SYSTEM SHALL remind each participant, naming the start time and the host's first name (e.g. "Morgen 05:30, Lea rechnet mit dir.", `notif.plan.reminder`), and remind the host with the number of people who are in (e.g. "Morgen 05:30, 4 Leute sind dabei.", `notif.plan.reminderHost`).
- **Rationale:** Reminder the day before, on by default, can be switched off (`features.md` → NOTIF; brand guide p.13; boss, 2026-11-09); at 18:00 the evening before, for participants and the host: calm, and still time to cancel honestly (boss, 2026-11-10).
- **Scenarios:**
  - **S1** Given a hike on Saturday at 05:30 hosted by Lea, when it is Friday 18:00, then each participant gets "Morgen 05:30, Lea rechnet mit dir."
  - **S2** Given the same hike with four participants, when it is Friday 18:00, then Lea gets "Morgen 05:30, 4 Leute sind dabei."
  - **S3** Given a plan created on Friday at 19:00 for Saturday, when the evening has passed, then no reminder is sent.

### NOTIF-006 Quiet hours
- **Status:** approved · **Priority:** MVP · **Since:** —
- **Requirement:** WHILE a member's quiet hours are on and it is within the time they set, THE SYSTEM SHALL hold back their pushes and send what was held, grouped, when the quiet hours end; quiet hours are off by default.
- **Rationale:** A setting for quiet hours (boss, 2026-11-10); user freedom, as with the switches (NOTIF-004).
- **Scenarios:**
  - **S1** Given Lea set quiet hours from 22:00 to 07:00, when the host changes the time of her plan at 23:00, then she gets the push at 07:00.
  - **S2** Given three pushes were held, when the quiet hours end, then they arrive grouped per plan, not one by one.
  - **S3** Given a new member, when they open the notification settings, then quiet hours are off.
- **Depends on:** SET

### NOTIF-007 After the plan: who was missing
- **Status:** approved · **Priority:** MVP · **Since:** —
- **Requirement:** WHILE a plan ended less than 48 hours ago, THE SYSTEM SHALL show "War jemand nicht da?" (`join.attendance.ask`) on it in Meine Pläne for the host and the participants, and send no push about it.
- **Rationale:** Attendance is by exception; no report means everyone attended (JOIN-015; boss, 2026-11-09); a push after every plan would nag the many groups where everyone came (boss, 2026-11-10).
- **Scenarios:**
  - **S1** Given a walk ended an hour ago, when Lea opens Meine Pläne, then the walk shows "War jemand nicht da?", and she got no push.
  - **S2** Given the walk ended 49 hours ago, when Lea opens Meine Pläne, then the question is gone.
- **Depends on:** JOIN-015, CAL-004
### NOTIF-008 Without permission
- **Status:** approved · **Priority:** MVP · **Since:** —
- **Requirement:** IF a member has not allowed notifications on the phone, THEN THE SYSTEM SHALL keep working without pushes and show in the notification settings that pushes are off, with the way to the phone's settings (`notif.permission.off`).
- **Rationale:** Without the permission, the member sees updates only when opening the app (`app.md` → Permissions); completeness check (permission denied permanently: offer the way to settings).
- **Scenarios:**
  - **S1** Given Lea chose "Nicht jetzt" and later denied the system prompt, when she opens the notification settings, then she sees `notif.permission.off` and a button to the phone's settings.
- **Depends on:** ONB-019, SET
