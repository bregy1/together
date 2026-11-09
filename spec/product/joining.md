# Joining (`JOIN`)

Request to join a plan, get accepted by the host, show up, and confirm who was there. Only an accepted request takes a seat and unlocks the places and the plan chat.

- **Journeys:** J-01, J-02, J-04 · **Screens:** SCR-plan-view, SCR-join-request, SCR-plan-requests, SCR-join-cancel, SCR-join-attendance · **NFRs:** NFR-ACC-001, NFR-INTL-001

## Out of scope

- Friends invited directly into a plan: FRND. Where plans and requests are listed: FEED and CAL.
- The trust effect itself: TRUST (this area records cancellations and attendance).
- No rating of other people after a plan; only who was there (boss, 2026-11-09).
- No deposit (`vision.md` → Non-goals).

## Requirements

### JOIN-001 Request to join
- **Status:** approved · **Priority:** MVP · **Since:** —
- **Requirement:** WHEN a member taps "Bin dabei" (`join.request`) on a plan with a free seat, THE SYSTEM SHALL send a join request to the host with an optional message of at most 140 characters and show the plan to the member as "angefragt".
- **Rationale:** "Bin dabei" sends a request the host still has to accept (boss, 2026-11-09; `glossary.md` → request to join); optional message (prototype chat: "Bin neu in Brig und hätte Lust, mitzukommen.").
- **Scenarios:**
  - **S1** Given a plan with two free seats, when a member taps "Bin dabei", writes "Bin neu in Brig" and sends, then the host receives the request with the message, and the member sees the plan as "angefragt".
  - **S2** Given a member with open requests for two other plans, when they request a third, then the request is sent; several open requests are allowed.
  - **S3** Given a message the text filter blocks, when the member sends it, then `join.request.error.messageBlocked` is shown and nothing is sent.
  - **S4** Given a message of 140 characters, when the member types more, then nothing more is accepted and the counter shows 140 of 140.

### JOIN-002 When a request is not possible
- **Status:** approved · **Priority:** MVP · **Since:** —
- **Requirement:** IF a member is the plan's host, is already in the plan or has an open request for it, or the plan is full, has started, is past or cancelled, THEN THE SYSTEM SHALL not offer "Bin dabei" and show the reason instead (`join.request.unavailable.*`).
- **Rationale:** Only plans with a free seat can be joined (`features.md` → JOIN); full plans leave the feed.
- **Scenarios:**
  - **S1** Given a full plan opened through a shared link, when a member views it, then `join.request.unavailable.full` and "Ähnlichen Plan erstellen" are shown.
  - **S2** Given the member's own plan, when they view it, then host actions are shown instead of "Bin dabei".

### JOIN-003 Host sees requests
- **Status:** approved · **Priority:** MVP · **Since:** —
- **Requirement:** WHILE a plan has open requests, THE SYSTEM SHALL show the host each request on SCR-plan-requests with the requester's photo, first name, age, trust label and message, and actions to accept or decline.
- **Rationale:** The host decides who comes, after seeing the profile and the message (`features.md` → JOIN; PROF-002; prototype chat: "Timmy möchte mit dir etwas unternehmen").
- **Scenarios:**
  - **S1** Given Timmy requested to join Anna's plan, when Anna opens the requests, then she sees Timmy's main photo, first name, age, trust label and message, and can open his profile.
- **Depends on:** PROF-001, PROF-002, NOTIF

### JOIN-004 Accept a request
- **Status:** approved · **Priority:** MVP · **Since:** —
- **Requirement:** WHEN the host accepts a request while the plan has a free seat, THE SYSTEM SHALL make the requester a participant, take a seat, unlock the location, the meeting point and the plan chat for them, and notify them.
- **Rationale:** Only an accepted request takes a seat and unlocks the places and the chat (`features.md` → JOIN; PLAN-007).
- **Scenarios:**
  - **S1** Given one free seat and two open requests, when the host accepts Timmy, then Timmy is notified, sees the location on the map and the chat, and the plan is full.
  - **S2** Given the plan became full a moment ago, when the host tries to accept another request, then `join.accept.error.full` is shown and nobody else is accepted.
- **Depends on:** PLAN-007, NOTIF

### JOIN-005 Decline a request
- **Status:** approved · **Priority:** MVP · **Since:** —
- **Requirement:** WHEN the host declines a request, THE SYSTEM SHALL end it as declined and notify the requester with a neutral message (`join.declined`).
- **Rationale:** The host accepts or declines; hosts should actively decide rather than leave requests open (`features.md` → JOIN; prototype chat).
- **Scenarios:**
  - **S1** Given an open request, when the host declines it, then the requester sees "nicht angenommen" with the suggestion to look at similar plans, and nothing changes on their profile or trust label.

### JOIN-006 Open requests end at the start
- **Status:** approved · **Priority:** MVP · **Since:** —
- **Requirement:** WHEN a plan starts while requests are still open, THE SYSTEM SHALL end those requests and tell the requesters neutrally that the plan has started without a decision (`join.request.endedAtStart`).
- **Rationale:** Requests have no expiry; they stay visible until the host decides or the requester withdraws (boss, 2026-11-09); a request for a plan that has started can no longer be accepted (JOIN-002).
- **Scenarios:**
  - **S1** Given a request sent three days ago that the host never answered, when the requester looks at it, then it is still "angefragt", without any expiry.
  - **S2** Given an open request, when the plan starts, then the request ends and the requester sees `join.request.endedAtStart` with a link to similar plans; nothing changes on their profile.

### JOIN-007 Group full
- **Status:** approved · **Priority:** MVP · **Since:** —
- **Requirement:** WHEN the last seat of a plan is taken, THE SYSTEM SHALL end all open requests with "Die Gruppe ist inzwischen voll" (`join.groupFull`), suggest similar plans and offer "Ähnlichen Plan erstellen".
- **Rationale:** Not a personal rejection, and it does not affect the profile (`features.md` → JOIN; prototype chat; J-01 failure case).
- **Scenarios:**
  - **S1** Given three open requests and one free seat, when the host accepts one, then the other two requesters are told "Die Gruppe ist inzwischen voll" and see similar plans and "Ähnlichen Plan erstellen".
- **Depends on:** PLAN-015, FEED

### JOIN-008 Request status for the requester
- **Status:** approved · **Priority:** MVP · **Since:** —
- **Requirement:** WHEN a member's request changes its state, THE SYSTEM SHALL show the new state with a fitting next step on the plan in Meine Pläne: "angefragt" (withdraw), "angenommen" (open the plan), "nicht angenommen" or ended at the start (similar plans), "Gruppe voll" ("Ähnlichen Plan erstellen").
- **Rationale:** A declined request must not simply disappear; each state needs its own feedback and next step (prototype chat).
- **Scenarios:**
  - **S1** Given a request the host declined yesterday, when the member opens Meine Pläne, then the plan shows "nicht angenommen" with a link to similar plans.

### JOIN-009 Withdraw a request
- **Status:** approved · **Priority:** MVP · **Since:** —
- **Requirement:** WHEN a member withdraws an open request (`join.request.withdraw`), THE SYSTEM SHALL end it at once, remove it from the host's list, and count it as having no trust effect.
- **Rationale:** Requests can be cancelled at any time (boss, 2026-11-09); a withdrawn request is better for the host than an accepted person who cancels.
- **Scenarios:**
  - **S1** Given an open request, when the member withdraws it, then the host no longer sees it, and the member can request again later.
  - **S2** Given the host accepted the request a moment before, when the member tries to withdraw, then they are told they are now a participant and can cancel with "Doch nicht" instead.

### JOIN-010 Overlap warning
- **Status:** approved · **Priority:** MVP · **Since:** —
- **Requirement:** WHEN a member requests to join a plan that overlaps in time with another plan they requested or are accepted for, THE SYSTEM SHALL warn them, naming the other plan and whether it is requested or confirmed (`join.overlap.warning`), and still allow the request.
- **Rationale:** The overlap warning was built in the prototype and the boss liked it; travel time is not counted (prototype chat; `features.md` → JOIN).
- **Scenarios:**
  - **S1** Given a confirmed plan from 18:00 to 20:00, when the member requests another from 19:30, then the warning names the first plan as "bestätigt", and the member can still send the request.
  - **S2** Given a plan that ends at 18:00, when the member requests one that starts at 18:00, then no warning is shown.

### JOIN-011 Two confirmed plans at once
- **Status:** approved · **Priority:** MVP · **Since:** —
- **Requirement:** WHEN a member is accepted for two plans that overlap in time, THE SYSTEM SHALL show both on one notice ("Beide Treffen sind bestätigt. Prüfe, an welchem du teilnehmen kannst.", `join.overlap.bothConfirmed`) with links to cancel one, and never cancel either automatically.
- **Rationale:** The app shows both and suggests which to cancel, but never cancels automatically (prototype chat; `features.md` → JOIN).
- **Scenarios:**
  - **S1** Given two overlapping requests, when the second one is accepted, then the member sees the notice with both plans and a "Doch nicht" link for each.

### JOIN-012 Cancel participation
- **Status:** approved · **Priority:** MVP · **Since:** —
- **Requirement:** WHEN a participant chooses "Doch nicht" (`join.cancel`), THE SYSTEM SHALL ask "Teilnahme wirklich absagen?" with a required reason — one of the plan's accepted reasons, "krank", "etwas ist dazwischengekommen", or a short own text — and end the participation only after the participant confirms.
- **Rationale:** Cancelling needs a confirmation and a reason (`features.md` → JOIN; prototype chat); "Doch nicht" is the brand guide's wording for leaving (`design/direction.md` → Microcopy); the reason list (boss, 2026-11-09).
- **Scenarios:**
  - **S1** Given a participant taps "Doch nicht" by mistake, when the confirmation appears, then going back keeps the participation.
  - **S2** Given no reason chosen, when the participant confirms, then `join.cancel.error.reasonRequired` is shown.
  - **S3** Given the plan starts in 10 hours, when the confirmation appears, then it also says that a short-notice cancellation can affect the trust label unless the group finds it okay (`join.cancel.shortNotice`).
- **Depends on:** TRUST

### JOIN-013 Seat becomes free
- **Status:** approved · **Priority:** MVP · **Since:** —
- **Requirement:** WHEN a participant cancels or is removed, THE SYSTEM SHALL free the seat, end their access to the location, the meeting point and the plan chat, and open the plan for requests again if it was full.
- **Rationale:** J-04 step 4: the seat becomes free; a full plan shows up in the feed again; PLAN-007 S3.
- **Scenarios:**
  - **S1** Given a full plan, when a participant cancels, then the plan has one free seat and appears in Entdecken again.
- **Depends on:** PLAN-007, FEED

### JOIN-014 Is the cancellation fine?
- **Status:** approved · **Priority:** MVP · **Since:** —
- **Requirement:** WHEN a participant cancels, THE SYSTEM SHALL show the host and the other participants the reason and ask each of them whether the cancellation is fine (`join.cancelled.okay`), and let the host mark it as legitimate (`join.cancelled.legitimate`).
- **Rationale:** Friends can cancel among themselves without penalty; the host can mark a cancellation as legitimate (`features.md` → JOIN, TRUST).
- **Scenarios:**
  - **S1** Given Lea cancels with "krank" 5 hours before the start, when the host and the two other participants open the plan, then they see Lea's reason and the question, and the host can mark it as legitimate.
- **Depends on:** TRUST, NOTIF

### JOIN-015 Who was there
- **Status:** approved · **Priority:** MVP · **Since:** —
- **Requirement:** WHEN a plan has ended, THE SYSTEM SHALL let the host and every participant report within 48 hours that a person was missing (`join.attendance.missing`), and count everyone nobody reported as having attended.
- **Rationale:** Attendance feeds the north star and the trust score (`features.md` → JOIN; `vision.md` → Goal and success); groups keep their freedom, no report means no action, and a no-show can only come from other people's reports, not from a stiff confirmation system (boss, 2026-11-09).
- **Scenarios:**
  - **S1** Given a plan with four people that ended, when nobody reports anyone, then all four count as having attended.
  - **S2** Given Max did not come, when Lea reports "Max war nicht da", then Max's no-show is recorded as described in JOIN-017.
  - **S3** Given a participant, when they look for a way to rate or comment on the others, then there is none; only "missing" can be reported.
  - **S4** Given a plan that ended 49 hours ago, when a participant opens it, then reporting someone missing is no longer offered.
- **Depends on:** PLAN-018, TRUST

### JOIN-017 When a "missing" report counts
- **Status:** approved · **Priority:** MVP · **Since:** —
- **Requirement:** WHEN a person is reported missing for a plan, THE SYSTEM SHALL record a no-show only if the host reported it or at least two other people in the group did.
- **Rationale:** Punishment only on the basis of other people's reports; host or two people (boss, 2026-11-09); repeated no-shows lower the score, a single one does not (`features.md` → TRUST).
- **Scenarios:**
  - **S1** Given the host reports Max missing, when the 48 hours are over, then Max has one no-show.
  - **S2** Given only one participant reports Max missing, when the 48 hours are over, then no no-show is recorded.
  - **S3** Given the host did not come, when two participants report the host missing, then the host has one no-show.
- **Depends on:** TRUST

### JOIN-016 Remind hosts to decide
- **Status:** approved · **Priority:** MVP · **Since:** —
- **Requirement:** WHEN a request has been open for 24 hours, or the plan starts in 3 hours while it is open, whichever comes first, THE SYSTEM SHALL remind the host once to accept or decline it (`notif.join.decideReminder`).
- **Rationale:** Hosts should actively decide rather than leave requests hanging (prototype chat); one reminder per request (boss, 2026-11-09); requests answered is a watched figure (`vision.md` → Goal and success).
- **Scenarios:**
  - **S1** Given a request for a plan next week, when it has been open for 24 hours, then the host gets one reminder.
  - **S2** Given a request sent 2 hours before a spontaneous plan, when it is still open 3 hours before the start (i.e. right away), then the host gets one reminder, and no second one later.
- **Depends on:** NOTIF
