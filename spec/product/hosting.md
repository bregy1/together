# Hosting (`PLAN`)

Create, edit, cancel, share and reuse plans, with the location and the meeting point hidden until a member is accepted. Any member can host (`vision.md` → Roles).

- **Journeys:** J-01, J-02, J-03, J-04 · **Screens:** SCR-plan-create, SCR-plan-view, SCR-plan-edit, SCR-plan-cancel, SCR-plan-takeover · **NFRs:** NFR-PRIV-001, NFR-ACC-001, NFR-INTL-001
- **Crucial information** of a plan: its start and expected end, its location, its meeting point and its activity. Changing it is confirmed, announced and marked (PLAN-020 … PLAN-022).

## Out of scope

- Co-hosts and the "Gesehen" confirmation of a changed meeting point: later (`features.md` → PLAN).
- Inviting friends into a plan: FRND. Requests, acceptance, overlap warning and attendance: JOIN. Where plans appear: FEED and CAL.
- No deposit or any payment (`vision.md` → Non-goals).
- No live location and no location permission (`vision.md` → Non-goals).

## Requirements

### PLAN-001 Create a plan
- **Status:** approved · **Priority:** MVP · **Since:** —
- **Requirement:** WHEN a member publishes a complete plan on SCR-plan-create ("Plan erstellen", `plan.create.publish`), THE SYSTEM SHALL create the plan with the member as host and make it visible in the feed of its region.
- **Rationale:** Create a plan (`features.md` → PLAN); J-02 steps 1–2.
- **Scenarios:**
  - **S1** Given a member fills in title, activity, start, expected end, seats, region and location, when they publish, then the plan appears in Entdecken for members of that region, showing the region but not the location.
  - **S2** Given a required field is missing, when the member publishes, then the field is marked with its error and nothing is published.
  - **S3** Given the connection drops while publishing, when the member retries, then exactly one plan is created.
- **Depends on:** PLAN-002 … PLAN-008

### PLAN-002 Title
- **Status:** approved · **Priority:** MVP · **Since:** —
- **Requirement:** WHEN a member enters a plan title, THE SYSTEM SHALL require a title of at most 60 characters that passes the text filter, with a hint to name the concrete activity (`plan.create.title.hint`).
- **Rationale:** Plan titles must name the concrete activity, e.g. "Bouldern in kleiner Runde" (prototype chat; `features.md` → PLAN); text filter (`features.md` → MOD); 60 characters (boss, 2026-11-09).
- **Scenarios:**
  - **S1** Given an empty title, when the member publishes, then `plan.create.error.titleRequired` is shown.
  - **S2** Given a title the text filter blocks, when the member publishes, then `plan.create.error.titleBlocked` is shown.
  - **S3** Given a title of 61 characters, when the member types the 61st, then it is not accepted and the counter shows 60 of 60.

### PLAN-003 Activity (category)
- **Status:** approved · **Priority:** MVP · **Since:** —
- **Requirement:** WHEN a member creates a plan, THE SYSTEM SHALL require one activity from the curated activity list, either a general activity (which is also an interest, e.g. "Outdoor") or a specific activity that belongs to one (e.g. "Wandern" under "Outdoor"), and show it as the plan's tag.
- **Rationale:** Category (`features.md` → PLAN); interests stay general so they are not overwhelming, while plans can be general or specific; the general activity is the category (boss, 2026-11-09).
- **Scenarios:**
  - **S1** Given SCR-plan-create, when the member picks "Wandern", then the plan's card shows the tag "WANDERN" and the plan counts as "Outdoor" for members interested in Outdoor.
  - **S2** Given SCR-plan-create, when the member picks only the general activity "Outdoor", then the card shows "OUTDOOR".
  - **S3** Given a search for an activity that is not on the list, when the member types it, then nothing new is created.

### PLAN-004 Start and expected end
- **Status:** approved · **Priority:** MVP · **Since:** —
- **Requirement:** WHEN a member sets the time of a plan, THE SYSTEM SHALL require a start in the future and an expected end after the start, both in Swiss local time.
- **Rationale:** A plan needs a start and an expected end time (prototype chat; `features.md` → PLAN); the end is needed for overlap warnings and for when a plan has taken place.
- **Scenarios:**
  - **S1** Given a start in the past, when the member publishes, then `plan.create.error.startInPast` is shown.
  - **S2** Given an expected end before the start, when the member publishes, then `plan.create.error.endBeforeStart` is shown.

### PLAN-005 Seats
- **Status:** approved · **Priority:** MVP · **Since:** —
- **Requirement:** WHEN a member sets the group size of a plan, THE SYSTEM SHALL offer 5 people including the host by default and accept any size from 2 (the host and one other person) to 12.
- **Rationale:** Number of seats (`features.md` → PLAN); give hosts freedom instead of a tight limit (boss, 2026-11-09, deviating from the brand guide's 6, or 8 for hosts).
- **Scenarios:**
  - **S1** Given SCR-plan-create, when it opens, then the group size is 5.
  - **S2** Given a group size of 13, when the member publishes, then `plan.create.error.groupSize` is shown.
  - **S3** Given a group size of 2, when the member publishes, then the plan has one free seat.

### PLAN-006 Region, location and meeting point
- **Status:** approved · **Priority:** MVP · **Since:** —
- **Requirement:** WHEN a member sets the location ("Ort") of a plan, THE SYSTEM SHALL let them pick it on a map, by searching for a place or by placing a pin, take the plan's public region (the Swiss municipality) from it, and show a hint that plans meet in public places, never at private addresses (`plan.create.location.publicHint`).
- **Rationale:** Location required (boss, 2026-11-08); a map, because people otherwise share map links in the chat anyway (boss, 2026-11-09); public meeting points, no private addresses (Spielregel "Keine Privatadressen."; brand guide p.14).
- **Scenarios:**
  - **S1** Given SCR-plan-create, when the member searches "Talstation Blatten" and picks the result, then the pin is set there and the region shows "Naters".
  - **S2** Given a pin placed outside Switzerland, when the member publishes, then `plan.create.error.locationNotSwiss` is shown.
  - **S3** Given no location is set, when the member publishes, then `plan.create.error.locationRequired` is shown.
  - **S4** Given SCR-plan-create, when the member adds a meeting point, then they place a second pin and may add a note of at most 80 characters (e.g. "beim Kiosk"); without a meeting point the plan has only the location.
- **Map service:** decided in ADR-0010 (`tech/architecture.md` → Maps). Search finds places, addresses, stations, lifts, lakes and mountains, not businesses; a pin covers the rest.

### PLAN-007 Location only for participants
- **Status:** approved · **Priority:** MVP · **Since:** —
- **Requirement:** THE SYSTEM SHALL deliver a plan's location and meeting point only to its host and its accepted participants, and never to anyone else.
- **Rationale:** The exact place must not reach a client before acceptance; hiding it in the UI is not enough (prototype chat; `vision.md` → Principles; ADR-0004 location rule).
- **Scenarios:**
  - **S1** Given a member who has only requested to join, when the plan is loaded, then the response contains the region but neither the location nor the meeting point.
  - **S2** Given a member is accepted, when the plan is loaded again, then the location and the meeting point are shown on a map.
  - **S3** Given a participant who cancelled or was removed, when the plan is loaded, then the location and the meeting point are no longer delivered.
  - **S4** Given a member who is not accepted, when the plan is shown, then no pin and no map section of the location appear, only the region's name.

### PLAN-023 Open in maps
- **Status:** approved · **Priority:** MVP · **Since:** —
- **Requirement:** WHILE the location or the meeting point is shown to a host or participant, THE SYSTEM SHALL offer to open it in the phone's maps app for directions (`plan.view.openInMaps`).
- **Rationale:** Getting there is what people need the place for (boss, 2026-11-09).
- **Scenarios:**
  - **S1** Given an accepted participant on an iPhone, when they tap `plan.view.openInMaps` at the meeting point, then Apple Maps opens at that pin.
  - **S2** Given a member who is not accepted, when the plan is shown, then the action is not offered.
- **Depends on:** PLAN-007

### PLAN-008 Description
- **Status:** approved · **Priority:** MVP · **Since:** —
- **Requirement:** WHEN a member saves a plan description, THE SYSTEM SHALL accept it only if it has at most 500 characters and passes the text filter; the description is optional.
- **Rationale:** Description (`features.md` → PLAN); text filter (`features.md` → MOD); 500 characters leave room for what to bring, pace or costs (boss, 2026-11-09).
- **Scenarios:**
  - **S1** Given a description the text filter blocks, when the member publishes, then `plan.create.error.descriptionBlocked` is shown.
  - **S2** Given no description, when the member publishes, then the plan is published without one.

### PLAN-009 Accepted cancellation reasons
- **Status:** approved · **Priority:** MVP · **Since:** —
- **Requirement:** WHEN a member creates a plan, THE SYSTEM SHALL let them pick accepted cancellation reasons from a fixed list ("schlechtes Wetter", "zu wenige Leute", "krank") and add one short reason of their own, and show all of them to members before they request to join.
- **Rationale:** Accepted cancellation reasons (`features.md` → PLAN; boss, 2026-11-08); the host decides how easy cancelling is: every reason the host sets, from the list or their own, makes a cancellation fine (boss, 2026-11-09: "make it easy if they want it easy, a bit more structured if they want to").
- **Scenarios:**
  - **S1** Given a hiking plan with "schlechtes Wetter" as an accepted reason, when a member views it before requesting, then the reason is shown (`plan.view.acceptedReasons`).
  - **S2** Given a cancellation for "schlechtes Wetter" on that plan, when the trust effect is decided, then it has none.
  - **S3** Given the host's own reason "Halle geschlossen", when someone cancels for it, then the cancellation has no trust effect, like a reason from the list.
  - **S4** Given a host who sets no accepted reasons, when someone cancels, then the usual trust rules apply.
- **Depends on:** TRUST

### PLAN-010 Edit a plan
- **Status:** approved · **Priority:** MVP · **Since:** —
- **Requirement:** WHEN the host saves changes on SCR-plan-edit, THE SYSTEM SHALL apply any change to the plan, except a group size below the number of people already in it.
- **Rationale:** A balanced system: the host can change anything; crucial changes are confirmed and announced rather than blocked (boss, 2026-11-09).
- **Scenarios:**
  - **S1** Given a plan with three accepted participants, when the host changes the description, then it is saved without a prompt or a notification.
  - **S2** Given four people in the plan, when the host sets the group size to 3, then `plan.edit.error.groupSizeTooSmall` is shown, pointing to removing a participant first (PLAN-017), and nothing changes.

### PLAN-020 Confirm a crucial change
- **Status:** approved · **Priority:** MVP · **Since:** —
- **Requirement:** WHEN the host saves a change to crucial information of a plan with participants (the start or expected end, the location, the meeting point or the activity), THE SYSTEM SHALL first show a short, friendly note that the participants will be informed (`plan.edit.crucialInfo`) with the choices to change or go back.
- **Rationale:** The host gets a prompt asking whether they really want to change crucial information, as a small piece of information, not a "don't do that" (boss, 2026-11-09).
- **Scenarios:**
  - **S1** Given a plan with participants, when the host moves the start from 18:00 to 19:00 and saves, then `plan.edit.crucialInfo` is shown; confirming saves the change, going back keeps 18:00.
  - **S2** Given a plan without participants, when the host changes the start, then it is saved without the note.

### PLAN-021 Inform participants of a crucial change
- **Status:** approved · **Priority:** MVP · **Since:** —
- **Requirement:** WHEN crucial information of a plan changes, THE SYSTEM SHALL notify every participant and say what changed (`notif.plan.changed`).
- **Rationale:** Members are specifically informed of crucial changes (boss, 2026-11-09; `features.md` → NOTIF).
- **Scenarios:**
  - **S1** Given the host moved the start to 19:00, when the change is saved, then each participant gets a notification naming the new time.
- **Depends on:** NOTIF

### PLAN-022 "Changed" badge
- **Status:** approved · **Priority:** MVP · **Since:** —
- **Requirement:** WHEN crucial information of a plan changes, THE SYSTEM SHALL show each participant a small badge on that plan naming what changed (e.g. "Zeit geändert", `plan.badge.changed`) until the participant opens the plan or dismisses the badge.
- **Rationale:** A short-term indication on the plan of what changed, which disappears once seen (boss, 2026-11-09).
- **Scenarios:**
  - **S1** Given the location of a plan changed, when a participant looks at Meine Pläne, then the plan carries the badge "Ort geändert".
  - **S2** Given the badge, when the participant opens the plan, then the badge is gone.
  - **S3** Given the badge, when the participant dismisses it without opening the plan, then it is gone.
  - **S4** Given the time and the meeting point both changed, when the participant looks at the plan, then one badge names both changes.

### PLAN-019 Free exit after a change
- **Status:** approved · **Priority:** MVP · **Since:** —
- **Requirement:** WHEN a participant cancels after the host changed crucial information of the plan (PLAN-020), THE SYSTEM SHALL count that cancellation as having no trust effect.
- **Rationale:** Participants may leave without penalty after a significant change (prototype chat; boss, 2026-11-09).
- **Scenarios:**
  - **S1** Given the host moved the plan to another day, when a participant cancels 3 hours before the new start, then the cancellation has no trust effect.
- **Depends on:** TRUST

### PLAN-011 Change the meeting point
- **Status:** approved · **Priority:** MVP · **Since:** —
- **Requirement:** WHEN the host changes the meeting point ("Treffpunkt ändern", `plan.edit.changeMeetingPoint`), THE SYSTEM SHALL post a highlighted message with the old and the new meeting point in the plan chat, in addition to the note, notification and badge of a crucial change.
- **Rationale:** "Treffpunkt ändern" (`features.md` → PLAN); a highlighted chat message with the old and the new place (prototype chat); the host can change anything at any time, with information instead of a block (boss, 2026-11-09).
- **Scenarios:**
  - **S1** Given a plan with participants, when the host moves the meeting point 30 minutes before the start and confirms, then the change is saved, the chat shows old and new meeting point, and participants are notified and see the badge.
- **Depends on:** PLAN-020, PLAN-021, PLAN-022, CHAT

### PLAN-012 Cancel a plan
- **Status:** approved · **Priority:** MVP · **Since:** —
- **Requirement:** WHEN the host cancels on SCR-plan-cancel, THE SYSTEM SHALL require a reason (one of the offered reasons or a short text) and, for a plan with participants, let the host choose between leaving the plan to the group (`plan.cancel.leave`, recommended) and cancelling it completely (`plan.cancel.cancelAll`).
- **Rationale:** A reason is always required (`features.md` → PLAN; boss, 2026-11-08); the host can hand the plan over or, when it cannot happen without them, cancel it for everyone (boss, 2026-11-09).
- **Scenarios:**
  - **S1** Given a plan without participants, when the host cancels with a reason, then the plan is cancelled at once, disappears from the feed, and has no trust effect.
  - **S2** Given the host has not chosen or written a reason, when they confirm, then `plan.cancel.error.reasonRequired` is shown.
  - **S3** Given a plan with participants, when the host opens SCR-plan-cancel, then both choices are shown, with leaving the plan to the group marked as recommended.
- **Depends on:** TRUST

### PLAN-013 Host leaves: takeover
- **Status:** approved · **Priority:** MVP · **Since:** —
- **Requirement:** WHEN the host leaves a plan with participants to the group, THE SYSTEM SHALL tell the participants clearly that the host has left and that they decide whether the plan still takes place, ask "Wer möchte übernehmen?" until the plan starts, and make the first participant who accepts the new host.
- **Rationale:** Host takeover (`features.md` → PLAN; prototype chat: one person takes over explicitly); open until the start, with the group deciding (boss, 2026-11-09).
- **Scenarios:**
  - **S1** Given the host left the plan, when a participant opens it, then `plan.takeover.hostLeft` and the action "Ich übernehme" (`plan.takeover.accept`) are shown.
  - **S2** Given two participants tap "Ich übernehme" at almost the same time, when the first one is saved, then that person becomes host and the other sees that someone has taken over.
  - **S3** Given nobody has taken over, when the plan's start time arrives, then the plan is cancelled and the participants are informed.
  - **S4** Given a participant took over, when the plan continues, then the new host has every host action and the former host no longer belongs to the plan.
  - **S5** Given a participant took over, when the trust effect of the former host's leaving is decided, then it counts like a member's cancellation: only within 24 hours of the start, and not if the group said it was fine (boss, 2026-11-09).
- **Depends on:** NOTIF

### PLAN-024 Cancel a plan completely
- **Status:** approved · **Priority:** MVP · **Since:** —
- **Requirement:** WHEN the host chooses to cancel a plan with participants completely, THE SYSTEM SHALL show a short note that leaving the plan to the group is usually better (`plan.cancel.cancelAllInfo`) and, once the host confirms, cancel the plan for everyone and notify the participants.
- **Rationale:** Not recommended, but possible, for example when only the host can bring something essential or has access to the place (boss, 2026-11-09).
- **Scenarios:**
  - **S1** Given a plan with three participants, when the host chooses `plan.cancel.cancelAll` and confirms after the note, then the plan is cancelled, disappears from the feed, and each participant is notified with the reason.
- **Depends on:** NOTIF, TRUST

### PLAN-014 Plan cancelled: was it okay?
- **Status:** approved · **Priority:** MVP · **Since:** —
- **Requirement:** WHEN a plan with participants is cancelled, because the host cancelled it completely or because nobody took it over, THE SYSTEM SHALL show each participant the reason and ask "War dieser Abbruch für dich okay?" (`plan.cancelled.okay`).
- **Rationale:** `features.md` → PLAN; the answers decide the trust effect (`features.md` → TRUST).
- **Scenarios:**
  - **S1** Given a cancelled plan with three participants, when they open the app, then each sees the reason and the question with "okay" and "nicht okay".
- **Depends on:** TRUST

### PLAN-015 Reuse a plan
- **Status:** approved · **Priority:** MVP · **Since:** —
- **Requirement:** WHEN a member chooses to reuse a plan, THE SYSTEM SHALL open SCR-plan-create with the date and time empty and, for a plan they hosted, every other detail copied, or, for someone else's plan ("Ähnlichen Plan erstellen"), only the title, activity and description copied.
- **Rationale:** Reusable plans (boss, 2026-11-08; `vision.md` → Problem); "Ähnlichen Plan erstellen" copies the idea and category (prototype chat); someone else's location was never visible to the member (PLAN-007); boss, 2026-11-09.
- **Scenarios:**
  - **S1** Given a walk the member hosted last week, when they choose to reuse it, then SCR-plan-create shows the same title, activity, description, group size, location, meeting point and accepted reasons, and an empty date and time.
  - **S2** Given a full plan the member requested, when they choose "Ähnlichen Plan erstellen", then only title, activity and description are filled in, and no location of the original plan is delivered.

### PLAN-016 Share a plan
- **Status:** approved · **Priority:** MVP · **Since:** —
- **Requirement:** WHEN a member shares a plan (`plan.view.share`), THE SYSTEM SHALL create a link that opens the plan in the app with the same public details as in the feed, and leads to the store when the app is not installed.
- **Rationale:** Share a plan link that shows only the coarse region (`features.md` → PLAN); J-03 step 4; a web page for the link comes later (boss, 2026-11-09).
- **Scenarios:**
  - **S1** Given a member with the app, when they open a shared link, then the plan opens in Yaruno with its region, time, activity and free seats, but no location.
  - **S2** Given someone without the app, when they open the link, then the store page of Yaruno opens.
  - **S3** Given a link to a cancelled or past plan, when it is opened, then `plan.view.unavailable` is shown.

### PLAN-017 Remove a participant
- **Status:** approved · **Priority:** MVP · **Since:** —
- **Requirement:** WHEN the host removes a participant, THE SYSTEM SHALL require a reason from the report reasons, file it as a report about that member for the moderators, free the seat, end the person's access to the location, the meeting point and the plan chat, and notify them.
- **Rationale:** The prototype chat mentions "Person entfernen"; access ends after removal (`features.md` → CHAT); people can be removed only with a proper reason, so a removal always goes together with a report (boss, 2026-11-09).
- **Scenarios:**
  - **S1** Given a participant who wrote insulting messages in the plan chat, when the host removes them with the reason "Belästigung" and confirms, then the seat is free, the person no longer sees the location or the chat, is notified, and a report goes to the moderators.
  - **S2** Given the host has not chosen a reason, when they try to remove someone, then `plan.remove.error.reasonRequired` is shown and nobody is removed.
- **Depends on:** MOD, ADM, TRUST

### PLAN-018 Plan ends
- **Status:** approved · **Priority:** MVP · **Since:** —
- **Requirement:** WHEN a plan's expected end time has passed, THE SYSTEM SHALL mark the plan as past, remove it from the feed and start the attendance confirmation (JOIN).
- **Rationale:** The expected end defines when a plan has taken place; attendance is confirmed after the plan (`features.md` → JOIN).
- **Scenarios:**
  - **S1** Given a plan whose expected end was at 20:00, when it is 20:01, then it no longer appears in Entdecken and shows as past in Meine Pläne.
- **Depends on:** JOIN

### PLAN-025 Reopen a plan with a new date
- **Status:** approved · **Priority:** MVP · **Since:** —
- **Requirement:** WHEN the host reopens a past or cancelled plan with a new date and time (`plan.reopen`) within one month after its end or cancellation, THE SYSTEM SHALL make the same plan, with its chat, upcoming again, ask each earlier participant whether they are in again (`plan.reopen.ask`), and make them participants again only once they confirm while a seat is free.
- **Rationale:** The host can reopen the event with a new date; the chat is coupled to the event (boss, 2026-11-10). Nobody is put into a plan without a yes; within the month, because the plan and its chat are deleted after that (CAL-004, CHAT-012). Unlike reusing (PLAN-015), which creates a new plan with a new chat, reopening keeps the same plan, group and chat.
- **Scenarios:**
  - **S1** Given a walk with four participants ended last Saturday, when the host reopens it for next Saturday, then the four are asked "Bist du wieder dabei?", and the walk is upcoming again in Meine Pläne.
  - **S2** Given two of the four confirm, when the others have not answered, then the walk has two participants and free seats, and appears in Entdecken again.
  - **S3** Given Max does not answer before the new start, when the walk starts, then he is not in it, and it has no trust effect for him.
  - **S4** Given the host cancelled a plan completely 10 days ago, when they reopen it with a new date, then it works the same way.
  - **S5** Given a plan that ended 5 weeks ago, when the host looks for the action, then it is no longer offered; they can still reuse a kept copy (CAL-012).
- **Depends on:** CHAT-012, NOTIF
