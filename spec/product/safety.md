# Safety (`MOD`)

What members can do themselves to stay safe: report a member, a plan or a chat message, block a member, the text filter, the Spielregeln and the safety tips. What happens to a report after it is filed (review, decisions, sanctions, objections) is ADM.

- **Journeys:** J-01, J-05 · **Screens:** SCR-mod-report, SCR-mod-rules, SCR-mod-tips · **NFRs:** NFR-ACC-001, NFR-INTL-001

## Out of scope

- Reviewing reports, deciding on them, sanctions and objections: ADM (J-05 steps 2 to 4).
- The list of blocked members and unblocking: SET (`features.md` → SET).
- Immediate bans without review: dropped; moderators review first (boss, 2026-11-09; `design/direction.md` → clash 5).
- Automatic text-filter hits have no effect on the trust score (TRUST; `features.md` → Dropped).
- An ID check: later idea (`features.md` → Ideas parking lot).

## Requirements

### MOD-001 Report
- **Status:** approved · **Priority:** MVP · **Since:** —
- **Requirement:** WHEN a member reports another member, a plan or a chat message (SCR-mod-report), THE SYSTEM SHALL require a reason (MOD-002), accept an optional short text of up to 500 characters, file the report for the moderators with what was reported, confirm it to the reporter (`mod.report.sent`), and never let the reported person or anyone else in the plan learn who reported.
- **Rationale:** Report a user, a plan or a chat message with reasons that match the Spielregeln (`features.md` → MOD; J-05 step 1); reporting from a profile (PROF-010) and from a chat message (CHAT-009); "Melden statt Aushalten." (Spielregeln); the reporter stays anonymous, or people stop reporting out of fear of revenge (boss, 2026-11-10).
- **Scenarios:**
  - **S1** Given Max wrote an insulting message, when Lea reports it with "Belästigung" and a short text, then the moderators get the report with the message, and Lea sees `mod.report.sent`.
  - **S2** Given Lea has not picked a reason, when she sends the report, then `mod.report.error.reasonRequired` is shown and nothing is filed.
  - **S3** Given the moderators decide on Lea's report, when Max is told the decision (ADM), then nothing names Lea.
  - **S4** Given Lea taps send twice, when the report reaches the server, then it is filed once.
- **Depends on:** ADM

### MOD-002 Report reasons
- **Status:** approved · **Priority:** MVP · **Since:** —
- **Requirement:** WHEN a member reports, or a host removes a participant (PLAN-017), THE SYSTEM SHALL offer these reasons (`mod.report.reason.*`): "Dating / sexuelle Annäherung", "Belästigung", "Hass oder Rassismus", "Verkaufen oder Werbung", "Geld verlangt", "Privatadresse", "Gefährliches Verhalten", "Fake-Profil" and "Etwas anderes", which requires a short text.
- **Rationale:** Reasons that match the Spielregeln (`features.md` → MOD; prototype chat: "report reasons were adapted to match"; boss, 2026-11-10); no sexual harassment, racism, hate, harassment or selling (`notes/chatgpt-prototype-chat.md` → Community rules). A no-show is not a report reason; it is reported as missing (JOIN-015).
- **Scenarios:**
  - **S1** Given SCR-mod-report, when it opens, then the nine reasons are offered.
  - **S2** Given Lea picks "Etwas anderes" without a text, when she sends the report, then `mod.report.error.textRequired` is shown.
- **Depends on:** MOD-008, PLAN-017

### MOD-003 A thank-you to the reporter
- **Status:** approved · **Priority:** MVP · **Since:** —
- **Requirement:** WHEN a moderator decides on a report and chooses to thank the reporter, THE SYSTEM SHALL send the reporter a short note (e.g. "Danke, dass du Yaruno sicher hältst.", `mod.report.thanks`) that does not say what was decided; without that choice, the reporter hears nothing more.
- **Rationale:** The reporter gets a notification only if the moderator wants to, e.g. a thank-you when the report really had a positive impact; that keeps it open (boss, 2026-11-10). Reports should feel worth it (`vision.md` → Risks: harassment).
- **Scenarios:**
  - **S1** Given Lea's report led to a warning and the moderator chose to thank her, when the decision is saved, then Lea gets `mod.report.thanks`, and it does not say that Max was warned.
  - **S2** Given the moderator did not choose to thank her, when the decision is saved, then Lea gets no notification.
- **Depends on:** ADM, NOTIF

### MOD-004 Block a member
- **Status:** approved · **Priority:** MVP · **Since:** —
- **Requirement:** WHEN a member blocks another member (`mod.block`) and confirms, THE SYSTEM SHALL hide each one's profile and plans from the other, stop join requests, friend requests and invitations between them, end their friendship (FRND-008), and not tell the blocked member.
- **Rationale:** Block a user (`features.md` → MOD); blocking stops another member from interacting with you (`glossary.md` → block); FEED-011 (no plans of each other), FRND-008 (friendship ends).
- **Scenarios:**
  - **S1** Given Lea blocks Max, when Max looks at Entdecken, then Lea's plans are not shown, and Lea no longer sees Max's (FEED-011).
  - **S2** Given Max had an open request for Lea's plan, when Lea blocks him, then the request ends as not accepted (JOIN-005).
  - **S3** Given Lea blocked Max, when Max opens an old link to her profile, then `prof.view.unavailable` is shown (PROF-002).
  - **S4** Given Lea blocked Max, when Max uses the app, then nothing tells him that he was blocked.
- **Depends on:** FEED-011, FRND-008, PROF-002

### MOD-005 Blocking someone in the same plan
- **Status:** approved · **Priority:** MVP · **Since:** —
- **Requirement:** WHILE a member and someone they blocked are both in the same plan, THE SYSTEM SHALL keep both in it under the usual rules, including cancelling, and hide the blocked member's chat messages from the blocker.
- **Rationale:** A block applies outside the plan; both normally stay in, because a free exit would be abused; it does hide the chat messages (boss, 2026-11-10). The host decided who comes (`vision.md` → Principles).
- **Scenarios:**
  - **S1** Given Lea and Max take part in the same walk, when Lea blocks Max, then both stay in the walk, and Lea no longer sees Max's chat messages.
  - **S2** Given Lea blocked Max, when she cancels that walk within 24 hours of the start, then it counts like any other short-term cancellation (TRUST).
  - **S3** Given Lea blocked Max, when Max reads the chat, then he still sees Lea's messages, and nothing tells him that he was blocked.
- **Depends on:** CHAT-001, JOIN-012, TRUST

### MOD-006 Text filter
- **Status:** approved · **Priority:** MVP · **Since:** —
- **Requirement:** WHEN a member saves or sends a text (plan title and description, profile description, join-request message, chat message, first name), THE SYSTEM SHALL refuse it with the field's message, without naming the word, if it contains hate, slurs or sexual harassment, and otherwise accept it with any milder swear words in it.
- **Rationale:** Text filter for plan, profile and chat texts (`features.md` → MOD; `notes/problems.md`: "Text Filter"); two levels: what is never okay is refused, swear words are a matter of taste (boss, 2026-11-10); refusing with the field's message is how PLAN-002, PLAN-008, PROF-009, JOIN-001 and CHAT-010 already work. Word lists in German, Swiss German, French and English, kept by the admins (ADM).
- **Scenarios:**
  - **S1** Given a chat message with a racist slur, when Lea sends it, then it is refused with the field's message, and nobody else sees it.
  - **S2** Given the first name contains a sexual term, when the person continues, then it is refused with `onb.about.error.firstNameInvalid`.
  - **S3** Given a chat message "So ein Scheisswetter", when Lea sends it, then it is sent.
- **Depends on:** ADM

### MOD-007 Report a plan or a member from anywhere they appear
- **Status:** approved · **Priority:** MVP · **Since:** —
- **Requirement:** WHILE a plan, another member's profile or another member's chat message is shown, THE SYSTEM SHALL offer to report it (`mod.report`).
- **Rationale:** Report a user, a plan or a chat message (`features.md` → MOD); app stores require reporting for user content (`vision.md` → Risks: store rules).
- **Scenarios:**
  - **S1** Given a plan in Entdecken that Lea is not part of, when she opens it, then she can report it.
  - **S2** Given another member's profile or chat message, when Lea opens its actions, then she can report it (PROF-010, CHAT-009).
  - **S3** Given her own plan, profile or message, when Lea opens its actions, then report is not offered.
- **Depends on:** PROF-010, CHAT-009

### MOD-008 Spielregeln
- **Status:** approved · **Priority:** MVP · **Since:** —
- **Requirement:** WHEN a member opens the Spielregeln (SCR-mod-rules, from sign-up, the profile, the settings and the report screen), THE SYSTEM SHALL show the six rules, each with one explaining sentence, as listed below, and the note that Yaruno is for people from 18 (`mod.rules.*`).
- **Rationale:** The six rules from the brand guide (p.13), the first one reworded by the boss; one explaining sentence each, taken from the rule screen in the prototype (`features.md` → MOD; `notes/chatgpt-prototype-chat.md` → Community rules); reachable at any time (ONB-016, PROF-004, SET).

| # | Rule | Explaining sentence |
|---|---|---|
| 1 | Keine Dating-App. | Yaruno ist für gemeinsame Aktivitäten und Freundschaften da, nicht für Dates. |
| 2 | Kein Verkaufen. | Keine Werbung, kein Handel und keine bezahlten Dienste. |
| 3 | Kein Geld unter Teilnehmenden. | Niemand verlangt private Überweisungen; vor Ort zahlt jede und jeder selbst. |
| 4 | Keine Privatadressen. | Pläne starten an öffentlichen, gut erreichbaren Treffpunkten. |
| 5 | Absagen statt Ghosten. | Wenn du nicht kommen kannst, gib deinen Platz rechtzeitig frei. |
| 6 | Melden statt Aushalten. | Wenn etwas nicht okay ist, melde es oder blockiere die Person. |

- **Scenarios:**
  - **S1** Given the profile, when the member taps `prof.own.rules`, then the six rules with their sentences are shown.
- **Depends on:** ONB-016, PROF-004

### MOD-009 Safety tips
- **Status:** approved · **Priority:** MVP · **Since:** —
- **Requirement:** WHEN a member is accepted into their first plan, or as a host accepts the first person into a plan, THE SYSTEM SHALL show the safety tips once (SCR-mod-tips, `mod.tips.*`), and keep them reachable from every plan and the settings: meet in public places; tell someone where you are going and with whom; organise your own way there and back; you may leave at any time if you feel uncomfortable; never give out a private address or money; in danger call the police 117, the ambulance 144 or the emergency number 112, and report afterwards in the app.
- **Rationale:** Safety tips before a member's first meetup (`features.md` → MOD; J-01 step 8; `vision.md` → Risks: meeting strangers in person); once, at the first plan, so it arrives when it matters and does not nag (boss, 2026-11-10). The tips are built from the Spielregeln and the Swiss emergency numbers (confirmed by the boss, 2026-11-10).
- **Scenarios:**
  - **S1** Given Timmy is accepted into his first plan, when he opens it, then the safety tips are shown once; after "Verstanden" they do not open on their own again.
  - **S2** Given Lea hosts her first plan, when she accepts the first person, then she sees the safety tips once.
  - **S3** Given any plan the member is in, when they look for the tips, then they can open them from the plan and from the settings.

### MOD-010 Hint when a blocked member is in a plan
- **Status:** approved · **Priority:** MVP · **Since:** —
- **Requirement:** WHEN a member requests to join a plan in which someone they blocked is a participant, THE SYSTEM SHALL show a small hint that a person they blocked is in this plan (`mod.block.inPlan`), without naming them, and let them send the request anyway.
- **Rationale:** A small hint "blocked person in here", but only when trying to join (boss, 2026-11-10).
- **Scenarios:**
  - **S1** Given Lea blocked Max and Max takes part in a walk, when Lea taps "Bin dabei" on it, then `mod.block.inPlan` is shown, and she can still send the request.
  - **S2** Given the same walk, when Lea only sees it in Entdecken, then no hint is shown.
  - **S3** Given Max wants to join a plan Lea takes part in, when he taps "Bin dabei", then he sees no hint.
- **Depends on:** JOIN-001

### MOD-011 Swear words are masked
- **Status:** approved · **Priority:** MVP · **Since:** —
- **Requirement:** WHILE the setting "Ungefilterte Sprache anzeigen" (`set.unfilteredLanguage`) is off, which it is by default, THE SYSTEM SHALL show the milder swear words in other members' texts masked (e.g. "So ein ****wetter").
- **Rationale:** An option in the settings to allow unfiltered language (boss, 2026-11-10); members who do not mind see texts as written.
- **Scenarios:**
  - **S1** Given Max wrote "So ein Scheisswetter" and Lea has the setting off, when she reads the chat, then she sees the swear word masked.
  - **S2** Given Lea switched the setting on, when she reads it, then she sees it as written.
  - **S3** Given Max reads his own message, when it is shown, then he sees it as written.
- **Depends on:** MOD-006, SET
