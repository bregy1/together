# Friends (`FRND`)

Add friends by name + ID or after a shared plan, see where they are in, and bring them straight into your plans. Friends live inside Meine Pläne, with no tab of their own (CAL-008). There is no way to search or browse people (`vision.md` → Non-goals).

- **Journeys:** J-01, J-03 · **Screens:** SCR-frnd-list, SCR-frnd-add, SCR-plan-invite · **NFRs:** NFR-ACC-001, NFR-INTL-001

## Out of scope

- No people search, no suggestions of people you may know, no address-book upload (`vision.md` → Non-goals).
- Inviting friends as co-hosts: later (`features.md` → FRND).
- A persistent group chat for friends: later (`features.md` → CHAT).
- No limits on friend requests (per day or after a decline); misuse is handled by blocking and reports (boss, 2026-11-10; MOD).
- No notification when a friend request is accepted or declined, or when a friend removes you (boss, 2026-11-10).

## Requirements

### FRND-001 Name + ID
- **Status:** approved · **Priority:** MVP · **Since:** —
- **Requirement:** WHEN a member opens their friends list, THE SYSTEM SHALL show their own name + ID, made of their first name and a four-digit number the app assigns (e.g. "Lea#4821", `frnd.myId`), with an action to share it.
- **Rationale:** "Freunde können wie in Discord über Name + ID hinzugefügt werden" (`notes/use-case.md`; `features.md` → FRND); first name plus an assigned number needs no extra field and keeps the first name as the only name (boss, 2026-11-09; ONB-009).
- **Scenarios:**
  - **S1** Given a member named Lea, when she opens her friends list, then she sees "Lea#4821" and can share it.
  - **S2** Given two members named Lea, when their IDs are assigned, then the numbers differ.
  - **S3** Given Lea changes her first name to Leandra (PROF-011), when her ID is shown, then it reads "Leandra#4821"; the number stays.

### FRND-002 Add a friend by name + ID
- **Status:** approved · **Priority:** MVP · **Since:** —
- **Requirement:** WHEN a member enters a complete name + ID on SCR-frnd-add, THE SYSTEM SHALL send a friend request to exactly that member, which makes them friends only once the other person accepts it, and answer an unknown name + ID with the same neutral message (`frnd.add.notFound`) without suggesting anyone.
- **Rationale:** Add friends by name + ID; there is no people search (`features.md` → FRND; `vision.md` → Non-goals); a friendship needs both sides' OK (boss, 2026-11-09).
- **Scenarios:**
  - **S1** Given Max enters "Lea#4821", when he sends the request, then Lea gets a friend request; they are friends once she accepts.
  - **S2** Given Lea declines, when Max looks at his requests, then the request is gone without a message that it was declined.
  - **S3** Given Max enters "Lea#482" or "Le#4821", when he sends it, then `frnd.add.notFound` is shown and nobody is suggested.
- **Depends on:** NOTIF

### FRND-003 Add after a shared plan
- **Status:** approved · **Priority:** MVP · **Since:** —
- **Requirement:** WHILE the member and another person were in the same plan that ended less than 7 days ago, THE SYSTEM SHALL offer to add that person as a friend from the plan's people (`frnd.addFromPlan`).
- **Rationale:** "Freunde können nach Aktivität hinzugefügt werden" (`notes/use-case.md`); J-01 step 11; profiles stay visible for 7 days after a plan (PROF-002).
- **Scenarios:**
  - **S1** Given a walk that ended yesterday with Lea and Max, when the member opens it in the past plans, then "Als Freund hinzufügen" is offered next to Lea and Max.
  - **S2** Given the plan ended 8 days ago, when the member opens it, then the action is no longer offered.
- **Depends on:** PROF-002, CAL-004

### FRND-004 Friends list
- **Status:** approved · **Priority:** MVP · **Since:** —
- **Requirement:** WHEN a member opens their friends from Meine Pläne, THE SYSTEM SHALL list their friends with photo and first name, open friend requests to answer, and the way to add a friend.
- **Rationale:** Friends live inside Meine Pläne (boss, 2026-11-09; CAL-008).
- **Scenarios:**
  - **S1** Given the member has three friends and one open request, when they open the friends list, then the request is shown on top with accept and decline, followed by the three friends; tapping a friend opens the profile (PROF-002).
  - **S2** Given a member with no friends and no requests, when they open the friends list, then their own name + ID, a short note on how to add friends (`frnd.empty`) and "Freund hinzufügen" are shown.
- **Depends on:** CAL-008, PROF-002

### FRND-005 Invite friends into a plan
- **Status:** approved · **Priority:** MVP · **Since:** —
- **Requirement:** WHEN the host invites friends into their plan (`plan.invite`), THE SYSTEM SHALL notify each invited friend and make them a participant, without a further request, once they accept the invitation while a seat is free; only the host can invite.
- **Rationale:** "Freunde können direkt als Mitbearbeiter oder Teilnehmer in Aktivitäten eingebunden werden, mit Notification" (`notes/features.md`); J-03 step 3; nobody is put into a plan without a yes, and the host keeps the choice of who comes (boss, 2026-11-09).
- **Scenarios:**
  - **S1** Given the host invites Lea to a plan with two free seats, when Lea accepts, then she is a participant and sees the location and the plan chat.
  - **S2** Given the plan became full before Lea answered, when she accepts, then `frnd.invite.full` is shown and she is not added.
  - **S3** Given Lea declines the invitation, when the host looks at the plan, then she is not in it, and nothing else happens.
  - **S4** Given a participant who is not the host, when they look for a way to invite friends, then there is none; they can share the plan link (PLAN-016).
- **Depends on:** NOTIF, PLAN-007, PLAN-016

### FRND-006 Friends who are in a plan
- **Status:** approved · **Priority:** MVP · **Since:** —
- **Requirement:** WHILE a member's setting "Freunde sehen, wo ich dabei bin" is on, which it is by default, THE SYSTEM SHALL let their friends see on a plan that the member hosts or takes part in it (FEED-010).
- **Rationale:** See which friends are going to a plan (`features.md` → FRND; boss, 2026-11-08); a setting, on by default, following privacy over convenience (boss, 2026-11-09; `vision.md` → Principles).
- **Scenarios:**
  - **S1** Given Lea takes part in a plan and has the setting on, when her friend Max sees the plan's card, then it shows "Lea ist dabei".
  - **S2** Given Lea switched the setting off, when Max sees the card, then Lea is not named.
- **Depends on:** FEED-010, SET

### FRND-007 Remove a friend
- **Status:** approved · **Priority:** MVP · **Since:** —
- **Requirement:** WHEN a member removes a friend (`frnd.remove`), THE SYSTEM SHALL end the friendship for both without notifying the other person.
- **Rationale:** Completeness check (friendships also end); quietly, so ending a friendship creates no confrontation (boss, 2026-11-10).
- **Scenarios:**
  - **S1** Given Lea and Max are friends, when Lea removes Max, then neither sees the other in their friends list any more, and Max gets no notification.
  - **S2** Given Lea removed Max, when Max sees a plan Lea takes part in, then Lea is not named on it (FRND-006).
  - **S3** Given Lea removed Max, when either sends a new friend request, then it works like any other (FRND-002).

### FRND-008 Blocking ends a friendship
- **Status:** approved · **Priority:** MVP · **Since:** —
- **Requirement:** WHEN a member blocks a friend, THE SYSTEM SHALL end the friendship and its open invitations and friend requests.
- **Rationale:** Blocking stops another member from interacting with you (`glossary.md` → block; `features.md` → MOD).
- **Scenarios:**
  - **S1** Given Lea and Max are friends, when Lea blocks Max, then they are no longer friends and Max cannot send Lea a new friend request.
- **Depends on:** MOD

### FRND-009 Open invitations
- **Status:** approved · **Priority:** MVP · **Since:** —
- **Requirement:** WHILE an invitation is open, THE SYSTEM SHALL list its plan in the invited member's Meine Pläne marked "eingeladen" (`cal.invited`), and end the invitation when the plan starts or is cancelled.
- **Rationale:** Completeness check (an invitation is a state of the member's plans, like a request; CAL-001); it should not get lost with a missed notification (boss, 2026-11-10).
- **Scenarios:**
  - **S1** Given the host invited Lea and she has not answered, when she opens Meine Pläne, then the plan is listed by start time, marked "eingeladen"; tapping it opens the plan with accept and decline.
  - **S2** Given the plan starts before Lea answered, when she opens Meine Pläne, then the invitation is gone.
  - **S3** Given the host cancels the plan, when Lea opens Meine Pläne, then the invitation is gone; she is told like any member concerned by the plan (PLAN, NOTIF).
- **Depends on:** CAL-001, FRND-005
