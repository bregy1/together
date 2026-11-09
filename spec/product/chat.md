# Plan chat (`CHAT`)

One chat per plan, for the host and the participants, shown as "Chat" inside the plan. It replaces the WhatsApp group around a plan, where details such as the time or place get lost (`vision.md` → Problem). It exists only while someone is in the plan; there are no chats outside plans.

- **Journeys:** J-01, J-02, J-03 · **Screens:** SCR-plan-chat · **NFRs:** NFR-ACC-001, NFR-INTL-001, NFR-PRIV-001

## Out of scope

- A group chat beyond a single plan (e.g. for a friend group): later, the concept is to be rethought (`features.md` → CHAT).
- Direct messages between two members: not planned; contact happens inside a plan (`vision.md` → Non-goals: no people directory).
- Photos, files and locations in the chat (boss, 2026-11-10).
- How blocking works between two members of the same plan, and what the text filter does: MOD.

## Requirements

### CHAT-001 Who is in the chat
- **Status:** approved · **Priority:** MVP · **Since:** —
- **Requirement:** WHILE a member is the host or a participant of a plan, THE SYSTEM SHALL let them read and write in the plan chat (`chat.title`), and deliver its messages to nobody else.
- **Rationale:** A plan chat for the host and the participants (`features.md` → CHAT); only an accepted request unlocks the chat (JOIN-004; PLAN-007).
- **Scenarios:**
  - **S1** Given Timmy's request is still open, when he opens the plan, then there is no chat.
  - **S2** Given the host accepts Timmy, when he opens the plan, then the chat is there and he can write.
  - **S3** Given someone who is not in the plan tries to load its chat (e.g. through an old link), when the request reaches the server, then no messages are delivered.
- **Depends on:** JOIN-004, PLAN-007

### CHAT-002 Access ends
- **Status:** approved · **Priority:** MVP · **Since:** —
- **Requirement:** WHEN a participant cancels or is removed, or the host leaves the plan, THE SYSTEM SHALL end that person's access to the plan chat, including the messages written before.
- **Rationale:** "Access ends when someone cancels or is removed" (`features.md` → CHAT; JOIN-013, PLAN-017); the former host no longer belongs to the plan (PLAN-013 S4).
- **Scenarios:**
  - **S1** Given Max cancels, when he opens the plan, then the chat is gone, and new messages no longer reach him.
  - **S2** Given the host left the plan to the group, when they open it, then the chat is gone for them.
- **Depends on:** JOIN-013, PLAN-013, PLAN-017

### CHAT-003 Chat history
- **Status:** approved · **Priority:** MVP · **Since:** —
- **Requirement:** WHEN a member gets access to a plan chat, THE SYSTEM SHALL show them all of its messages, including those of people who have left the plan since.
- **Rationale:** The meeting details are often discussed before the last person joins (boss, 2026-11-10); the plan keeps its details in one place (`vision.md` → Problem).
- **Scenarios:**
  - **S1** Given the group agreed yesterday to meet "beim Kiosk", when Timmy is accepted today, then he sees that message.
  - **S2** Given Max wrote two messages and then cancelled, when the others open the chat, then his messages are still there with his first name.
- **Depends on:** CHAT-001

### CHAT-004 Write a message
- **Status:** approved · **Priority:** MVP · **Since:** —
- **Requirement:** WHEN a member sends a message in the plan chat, THE SYSTEM SHALL accept text and emoji of up to 1000 characters and show it to everyone in the chat with the author's first name, photo and the time.
- **Rationale:** The group coordinates in the plan chat (J-03 step 6; J-02 step 7); text and emoji only, so no photo upload, storage or image moderation is needed (boss, 2026-11-10).
- **Scenarios:**
  - **S1** Given Lea writes "Bin 5 Min später 🙈", when she sends it, then the others see it with her first name, photo and the time.
  - **S2** Given Lea has typed 1000 characters, when she types on, then the field takes no more and shows the limit (`chat.message.limit`).
  - **S3** Given the field is empty or holds only spaces, when Lea looks at the send action, then it cannot be used.

### CHAT-005 Live messages
- **Status:** approved · **Priority:** MVP · **Since:** —
- **Requirement:** WHILE a member has the plan chat open, THE SYSTEM SHALL show new messages without reloading, within 2 seconds for 95 % of messages when both sides are online.
- **Rationale:** Coordinating right before and during an activity (`vision.md` → Target users: "right before and during"); live updates over the WebSocket (`tech/architecture.md` → Realtime); 2 seconds (boss, 2026-11-10).
- **Scenarios:**
  - **S1** Given Lea and Max both have the chat open, when Max sends a message, then Lea sees it within 2 seconds.
  - **S2** Given Lea's app lost the connection for a minute, when it is back, then the messages from that minute appear without reloading and in the right order.

### CHAT-006 New message notifications
- **Status:** approved · **Priority:** MVP · **Since:** —
- **Requirement:** WHILE a member does not have the plan chat open, THE SYSTEM SHALL push the first new message of a plan at once and collect further ones into one summary per plan at most every 10 minutes (e.g. "4 neue Nachrichten im Chat «Bouldern in kleiner Runde»", `notif.chat.newMessages`), never with the message text.
- **Rationale:** Notifications, but debounced and grouped, so the phone does not keep ringing; "x messages" is enough (boss, 2026-11-10); a last-minute "Bin gleich da" still arrives at once; push payloads never carry chat text (ADR-0006, `tech/architecture.md` → Push notifications); each kind of notification can be switched off in the settings (`features.md` → SET).
- **Scenarios:**
  - **S1** Given Lea has not opened the chat for an hour, when Max writes "Bin gleich da", then Lea gets a push at once.
  - **S2** Given that push was 2 minutes ago, when three more messages arrive, then Lea gets no further push until 10 minutes have passed, and then one push "3 neue Nachrichten im Chat «…»".
  - **S3** Given Lea has the chat open, when a message arrives, then she gets no push.
  - **S4** Given Lea switched chat notifications off in the settings, when messages arrive, then she gets no push, and the unread count still shows (CHAT-015).
- **Depends on:** NOTIF, SET

### CHAT-007 Highlighted messages from the app
- **Status:** approved · **Priority:** MVP · **Since:** —
- **Requirement:** WHEN the app posts a message to the plan chat (e.g. a changed meeting point, PLAN-011), THE SYSTEM SHALL show it highlighted and set apart from the members' messages.
- **Rationale:** A highlighted chat message shows the old and the new meeting point (PLAN-011; prototype chat).
- **Scenarios:**
  - **S1** Given the host moved the meeting point, when a participant opens the chat, then a highlighted message shows the old and the new meeting point.
- **Depends on:** PLAN-011

### CHAT-008 Events in the chat
- **Status:** approved · **Priority:** MVP · **Since:** —
- **Requirement:** WHEN someone joins or cancels, or a crucial change of the plan is saved, THE SYSTEM SHALL post a short line about it in the plan chat (e.g. "Lea ist dabei", "Max hat abgesagt", "Zeit geändert: 19:00", `chat.event.*`).
- **Rationale:** Everything about the plan stays in one place (boss, 2026-11-10; `vision.md` → Problem).
- **Scenarios:**
  - **S1** Given the host accepts Lea, when the participants open the chat, then they see "Lea ist dabei".
  - **S2** Given the host moves the start to 19:00, when the participants open the chat, then they see "Zeit geändert: 19:00".
  - **S3** Given these lines, when a push is due (CHAT-006), then they do not count as new messages.
- **Depends on:** CHAT-007, PLAN-020

### CHAT-009 Report a message
- **Status:** approved · **Priority:** MVP · **Since:** —
- **Requirement:** WHEN a member reports a message in the plan chat (`chat.message.report`), THE SYSTEM SHALL file a report with the message, its author and the chosen reason for the moderators, and offer to block the author.
- **Rationale:** Report a chat message with reasons that match the community rules, and block the user (`features.md` → MOD; J-05 step 1).
- **Scenarios:**
  - **S1** Given Max wrote an insulting message, when Lea reports it with the reason "Belästigung", then the moderators get the report with the message, and Lea is offered to block Max.
- **Depends on:** MOD

### CHAT-010 Text filter
- **Status:** approved · **Priority:** MVP · **Since:** —
- **Requirement:** WHEN a member sends a message, THE SYSTEM SHALL check it with the text filter (MOD) before it reaches the others.
- **Rationale:** Text filter for plan, profile and chat texts (`features.md` → MOD).
- **Scenarios:**
  - **S1** Given a message the text filter catches, when the member sends it, then it is handled as MOD says and does not reach the others unchecked.
- **Depends on:** MOD

### CHAT-011 Edit or delete an own message
- **Status:** approved · **Priority:** MVP · **Since:** —
- **Requirement:** WHILE an own message is less than 3 minutes old, THE SYSTEM SHALL let its author edit or delete it, and accept an edit started in that time if it is saved within 5 minutes after sending; an edited message just changes and a deleted one disappears for everyone, without a mark.
- **Rationale:** Edit or delete within 3 minutes after sending, then no more; an edit already in progress when the 3 minutes run out may still be saved, so the server allows 5 minutes; no "edited" or "deleted" mark, which fits the short window (boss, 2026-11-10).
- **Scenarios:**
  - **S1** Given Lea sent a message 2 minutes ago, when she opens its actions, then she can edit or delete it; after deleting, it is gone for everyone without a trace in the chat.
  - **S2** Given Lea started editing at minute 2 and saves at minute 4, when the edit reaches the server, then it is accepted.
  - **S3** Given a message older than 3 minutes, when Lea opens its actions, then edit and delete are no longer offered.
  - **S4** Given an edit is saved more than 5 minutes after sending, when it reaches the server, then it is refused and the message stays as it was (`chat.message.error.editExpired`).
  - **S5** Given Lea's message was reported, when she deletes it, then the moderators still see the reported text (MOD).

### CHAT-012 The chat after the plan
- **Status:** approved · **Priority:** MVP · **Since:** —
- **Requirement:** WHEN 7 days have passed since a plan ended or was cancelled, THE SYSTEM SHALL make its chat read-only, open it for writing again when the host reopens the plan with a new date (PLAN-025), and delete it one month after the plan's last end or cancellation.
- **Rationale:** Writable for 7 days after the event, then read-only; the chat is coupled to the event, so it opens again when the host reopens the plan with a new date (boss, 2026-11-10); 7 days match adding friends after a plan (FRND-003), one month matches the past plans (CAL-004); data minimisation (`constitution.md`).
- **Scenarios:**
  - **S1** Given a walk ended 3 days ago, when Lea writes "Danke, war schön!", then the message is sent.
  - **S2** Given the walk ended 8 days ago, when Lea opens the chat, then she can read it but not write (`chat.readOnly`).
  - **S3** Given the host reopens the walk with a date next week, when Lea opens the chat, then she can write again and sees the earlier messages.
  - **S4** Given the walk ended 31 days ago and was not reopened, when anyone looks for the chat, then it is deleted.
- **Depends on:** CAL-004, PLAN-025

### CHAT-013 Without a connection
- **Status:** approved · **Priority:** MVP · **Since:** —
- **Requirement:** WHILE the device is offline, THE SYSTEM SHALL show the plan chat as loaded last, keep a message written in that time as "nicht gesendet" with a retry (`chat.message.notSent`), and send each message at most once.
- **Rationale:** People often write right before a plan, at places with bad reception (boss, 2026-11-10; `vision.md` → Target users).
- **Scenarios:**
  - **S1** Given no connection, when Lea opens the chat, then she sees the messages loaded last.
  - **S2** Given no connection, when Lea sends "Bin gleich da", then it shows "nicht gesendet" with retry; when she retries with a connection, it is sent.
  - **S3** Given the message reached the server but the answer was lost, when Lea retries, then the others see it only once.

### CHAT-014 Empty chat
- **Status:** approved · **Priority:** MVP · **Since:** —
- **Requirement:** IF a plan chat has no messages yet, THEN THE SYSTEM SHALL show a short note that invites the group to say hello (`chat.empty`).
- **Rationale:** Completeness check (empty state); brand tone (`design/direction.md` → Microcopy).
- **Scenarios:**
  - **S1** Given Timmy was just accepted into a plan without messages, when he opens the chat, then `chat.empty` and the input field are shown.

### CHAT-015 Unread messages
- **Status:** approved · **Priority:** MVP · **Since:** —
- **Requirement:** WHILE a plan chat has messages the member has not seen, THE SYSTEM SHALL show their number on the plan in Meine Pläne and on the way into the chat (`chat.unread`).
- **Rationale:** An unread count besides the grouped push (boss, 2026-11-10).
- **Scenarios:**
  - **S1** Given 4 new messages Lea has not seen, when she opens Meine Pläne, then the plan shows 4 unread messages; after she opens the chat, the number is gone.
- **Depends on:** CAL-001

### CHAT-016 Mute a plan's chat
- **Status:** approved · **Priority:** MVP · **Since:** —
- **Requirement:** WHEN a member mutes a plan's chat (`chat.mute`), THE SYSTEM SHALL send them no chat pushes for that plan until they unmute it, and keep all other notifications.
- **Rationale:** Mute a single plan without switching off chat pushes for all plans (boss, 2026-11-10).
- **Scenarios:**
  - **S1** Given Lea muted a busy plan's chat, when messages arrive there, then she gets no push, but the unread count shows (CHAT-015).
  - **S2** Given the host of that plan changes the time, when the change is saved, then Lea is still notified (PLAN-021).
