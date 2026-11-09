# Screens

Navigation, screen inventory and the states of every screen. Behaviour lives in the requirements (`product/`); this file says where it appears. Look and feel come from `direction.md` and `tokens.md`.

## Navigation map

- First launch, no session
  - SCR-onb-phone → SCR-onb-code → SCR-onb-about (→ SCR-onb-age-stop) → SCR-onb-interests → SCR-onb-photos → SCR-onb-rules → Entdecken
  - SCR-onb-code → Entdecken (existing member)
- Unfinished sign-up, app reopened
  - the step where the person left (ONB-008)
- Tabs: Entdecken · Meine Pläne (with friends) · Profil (`direction.md`)
  - Entdecken → SCR-feed → SCR-feed-filter, SCR-feed-area, a plan card → SCR-plan-view
  - Meine Pläne → SCR-cal-list ⇄ SCR-cal-month; → SCR-cal-kept; → SCR-frnd-list → SCR-frnd-add; an entry → SCR-plan-view or SCR-plan-requests
  - Profil → SCR-prof-own → SCR-prof-edit; → SCR-set-home → SCR-set-notif, SCR-set-blocked, SCR-set-help, SCR-set-delete, SCR-set-number, SCR-feed-area, SCR-mod-rules, SCR-mod-tips; → SCR-adm-home (moderators and admins) → SCR-adm-report, SCR-adm-objection, SCR-adm-cancellations, SCR-adm-activities, SCR-adm-words, SCR-adm-roles
  - a host, requester, participant or friend → SCR-prof-view
  - "Plan erstellen" → SCR-plan-create; a plan card or link → SCR-plan-view → SCR-plan-chat (host, participant), SCR-plan-edit, SCR-plan-cancel, SCR-plan-invite (host) or SCR-plan-takeover (participant, after the host left)
- After the first join request, or after publishing the first plan
  - SCR-notif-ask → system permission prompt

## Inventory

| Screen | Name | Area | Reached from |
|---|---|---|---|
| SCR-onb-phone | Phone number (step 1 of 5) | ONB | First launch; signed out |
| SCR-onb-code | SMS code (step 1 of 5) | ONB | SCR-onb-phone |
| SCR-onb-about | About you: first name, birth date, region (step 2 of 5) | ONB | SCR-onb-code |
| SCR-onb-age-stop | Under 18 | ONB | SCR-onb-about |
| SCR-onb-interests | Interests (step 3 of 5) | ONB | SCR-onb-about |
| SCR-onb-photos | Photos (step 4 of 5) | ONB | SCR-onb-interests |
| SCR-onb-rules | Spielregeln (step 5 of 5) | ONB | SCR-onb-photos |
| SCR-notif-ask | Ask for notifications | ONB | First join request; first published plan |
| SCR-prof-view | Another member's profile | PROF | A plan (host), a join request, a plan's participants, the friends list |
| SCR-prof-own | Own profile | PROF | Tab "Profil" |
| SCR-prof-edit | Edit profile | PROF | SCR-prof-own |
| SCR-plan-create | Create a plan | PLAN | "Plan erstellen" in Entdecken or Meine Pläne; reuse of a plan |
| SCR-plan-view | A plan | PLAN | A card in Entdecken or Meine Pläne; a shared link; a notification |
| SCR-plan-edit | Edit a plan | PLAN | SCR-plan-view (host) |
| SCR-plan-cancel | Cancel a plan | PLAN | SCR-plan-view (host) |
| SCR-plan-takeover | Host has left | PLAN | SCR-plan-view (participant); notification |
| SCR-join-request | Request to join | JOIN | "Bin dabei" on SCR-plan-view |
| SCR-plan-requests | Open requests (host) | JOIN | SCR-plan-view (host); notification |
| SCR-join-cancel | Cancel participation | JOIN | "Doch nicht" on SCR-plan-view |
| SCR-join-attendance | Who was missing | JOIN | SCR-plan-view of a past plan; "War jemand nicht da?" in Meine Pläne (48 hours, NOTIF-007) |
| SCR-feed | Entdecken | FEED | Tab "Entdecken"; first screen after sign-up |
| SCR-feed-filter | Filters | FEED | SCR-feed |
| SCR-feed-area | Feed area (radius) | FEED | Region chip on SCR-feed; settings |
| SCR-cal-list | Meine Pläne (list) | CAL | Tab "Meine Pläne" |
| SCR-cal-month | Meine Pläne (month) | CAL | SCR-cal-list |
| SCR-cal-kept | Gemerkte Pläne | CAL | SCR-cal-list |
| SCR-frnd-list | Freunde | FRND | `cal.friends` in Meine Pläne |
| SCR-frnd-add | Add a friend | FRND | SCR-frnd-list |
| SCR-plan-invite | Invite friends | FRND | SCR-plan-view (host) |
| SCR-plan-chat | Chat | CHAT | SCR-plan-view (host, participant); a chat notification |
| SCR-mod-report | Report | MOD | A plan, another member's profile or chat message |
| SCR-mod-rules | Spielregeln | MOD | SCR-prof-own; settings; SCR-mod-report |
| SCR-mod-tips | Safety tips | MOD | First accepted plan (once); SCR-plan-view; settings |
| SCR-adm-home | Moderation | ADM | SCR-prof-own (moderators, admins); a moderation push |
| SCR-adm-report | A report | ADM | SCR-adm-home; a moderation push |
| SCR-adm-objection | An objection | ADM | SCR-adm-home; a moderation push |
| SCR-adm-cancellations | Cancellations that count | ADM | SCR-adm-home (admins) |
| SCR-adm-activities | Activity list | ADM | SCR-adm-home (admins) |
| SCR-adm-words | Word lists | ADM | SCR-adm-home (admins) |
| SCR-adm-roles | Roles, reviewer access and log | ADM | SCR-adm-home (admins) |
| SCR-set-home | Einstellungen | SET | SCR-prof-own |
| SCR-set-notif | Notifications | SET | SCR-set-home |
| SCR-set-blocked | Blocked members | SET | SCR-set-home |
| SCR-set-help | Help | SET | SCR-set-home |
| SCR-set-delete | Delete account | SET | SCR-set-home |
| SCR-set-number | New phone number | SET | SCR-set-home |

## States per screen

### SCR-onb-phone Phone number
- **Purpose:** enter a Swiss phone number to sign up or sign in.
- **Requirements:** ONB-001, ONB-002, ONB-003
- **States:**
  - **default:** country code `+41`, number field, hint `onb.phone.hint`, privacy-policy link, "Code senden".
  - **invalid:** `onb.phone.error.invalid` or `onb.phone.error.notSwiss` at the field.
  - **sending:** the send action shows progress and cannot be tapped twice.
  - **error:** `onb.phone.error.sendFailed` with retry; `onb.phone.error.tooMany` or `onb.phone.error.unavailable` when limits are reached (NFR-SEC-002).
  - **offline:** `onb.error.offline` with retry.

### SCR-onb-code SMS code
- **Purpose:** enter the code that was sent by SMS.
- **Requirements:** ONB-004, ONB-005, ONB-006, ONB-007, ONB-021, ONB-022, ONB-025
- **States:**
  - **default:** the number the code went to, code field, resend countdown, "change number".
  - **wrong code:** `onb.code.error.wrong` with attempts left.
  - **expired:** `onb.code.error.expired` with "send new code".
  - **banned:** `onb.code.banned` with the way to object.
  - **offline:** `onb.error.offline` with retry.

### SCR-onb-about About you
- **Purpose:** first name, date of birth and home region.
- **Requirements:** ONB-008, ONB-009, ONB-010, ONB-011, ONB-012, ONB-020
- **States:**
  - **default:** the three fields and "continue"; filled in again when the person comes back or resumes.
  - **invalid:** the field errors (`onb.about.error.*`).
  - **region search:** matching Swiss municipalities while typing; no match → `onb.about.region.noMatch`.
  - **confirm age:** `onb.about.confirmAge` ("Du bist 29. Stimmt das?") with confirm and change.

### SCR-onb-age-stop Under 18
- **Purpose:** explain kindly that Yaruno is for adults only.
- **Requirements:** ONB-010
- **States:**
  - **default:** `onb.age.stop`; no way forward.

### SCR-onb-interests Interests
- **Purpose:** pick up to 5 interests from the curated list.
- **Requirements:** ONB-013
- **States:**
  - **default:** categories, search, chosen interests with a counter.
  - **no match:** `onb.interests.noMatch`.
  - **limit reached:** `onb.interests.limit`.

### SCR-onb-photos Photos
- **Purpose:** add one portrait and up to three more photos.
- **Requirements:** ONB-014, ONB-015
- **States:**
  - **empty:** placeholder for the portrait with camera and library actions.
  - **uploading:** progress per photo; failed upload → retry on that photo.
  - **permission denied:** `onb.photos.permissionDenied` with a button to the settings.
  - **full:** four photos; no add action.

### SCR-onb-rules Spielregeln
- **Purpose:** accept the terms of use and the Spielregeln; learn that Yaruno is not a dating app.
- **Requirements:** ONB-016, ONB-017, ONB-018
- **States:**
  - **default:** the Spielregeln, `onb.rules.notDating`, links to the terms of use and the privacy policy, acceptance, finish (disabled until accepted).
  - **finishing:** progress; offline → `onb.error.offline` with retry, input kept.

### SCR-notif-ask Ask for notifications
- **Purpose:** explain why notifications help before the system prompt.
- **Requirements:** ONB-019, ONB-024
- **States:**
  - **after a join request:** `notif.ask.afterRequest`, allow, "Nicht jetzt" (`notif.ask.notNow`).
  - **after the first plan:** `notif.ask.afterPlan`, allow, "Nicht jetzt".
- **Notes for design:** one step per screen with a segmented progress bar ("Schritt 1 von 5"), as in the prototype (`direction.md`).

### SCR-prof-view Another member's profile
- **Purpose:** see who someone is before requesting, deciding or meeting.
- **Requirements:** PROF-001, PROF-002, PROF-010, MOD-004, MOD-007
- **States:**
  - **default:** main photo large with first name and age, further photos, interests in the owner's order, "Über mich", the trust bar with its info sign; report and block actions.
  - **sparse:** sections without content (no interests, no "Über mich") are left out.
  - **unavailable:** `prof.view.unavailable` when there is no shared context (PROF-002); no profile data shown.
  - **loading / error / offline:** loading indicator; `Das hat nicht geklappt. Nochmal?` with retry.

### SCR-prof-own Own profile
- **Purpose:** see your profile as others see it.
- **Requirements:** PROF-003, PROF-004, ADM-002, SET-001
- **States:**
  - **default:** the profile as on SCR-prof-view, plus `prof.own.edit` and the link to the Spielregeln (`prof.own.rules`); no report or block actions.
  - **bar lowered:** a short hint under the own trust bar (TRUST-011).

### SCR-prof-edit Edit profile
- **Purpose:** change first name, photos and their order, home region, interests and their order, "Über mich".
- **Requirements:** PROF-005, PROF-006, PROF-007, PROF-008, PROF-009, PROF-011
- **States:**
  - **default:** the fields with current values; reorder actions for photos and interests (drag, or move-earlier and move-later).
  - **invalid:** field errors (`prof.edit.error.*`), e.g. last photo, "Über mich" too long or blocked, name change too soon.
  - **unsaved changes:** leaving asks `prof.edit.discard`.
  - **saving / offline:** progress; offline keeps the input and offers retry.

### SCR-plan-create Create a plan
- **Purpose:** publish a plan.
- **Requirements:** PLAN-001 … PLAN-006, PLAN-008, PLAN-009, PLAN-015
- **States:**
  - **default:** title (hint to name the activity, counter 60), activity, start and expected end, group size (default 5, 2–12), a map for the location and an optional meeting point with a note, description (counter 500), accepted cancellation reasons; one primary button "Plan erstellen".
  - **reused:** filled from an earlier plan; date and time empty.
  - **invalid:** field errors (`plan.create.error.*`).
  - **publishing / offline:** progress; offline keeps everything and offers retry; a retry never creates a second plan.

### SCR-plan-view A plan
- **Purpose:** see a plan; for members not yet accepted, decide whether to request; for participants and the host, everything needed to go.
- **Requirements:** PLAN-007, PLAN-009, PLAN-016, PLAN-022, PLAN-023, JOIN-002, JOIN-006, JOIN-007, JOIN-008, JOIN-011, JOIN-014, FRND-003, FRND-005, FRND-006, FRND-009, CHAT-001, CHAT-015, PLAN-025, MOD-007, MOD-009
- **States:**
  - **public (not accepted):** title, activity tag, time, region name, group size and free seats, host, description, accepted cancellation reasons, report; no map, no location, no meeting point.
  - **first plan accepted:** the safety tips open once (SCR-mod-tips); afterwards they stay reachable from the plan.
  - **participant / host:** additionally the map with location and meeting point, "open in maps", the way into the chat with its unread count; host actions (edit, cancel, remove a participant, invite friends); friends who are in (FRND-006).
  - **invited:** who invited the member, with accept and decline (FRND-005, FRND-009).
  - **reopened:** the new date and "Bist du wieder dabei?" with yes and no (`plan.reopen.ask`, PLAN-025).
  - **changed:** the badge naming what changed, dismissible (PLAN-022).
  - **host left:** see SCR-plan-takeover.
  - **past / cancelled / unavailable:** a short note (`plan.view.unavailable`); no actions except reuse, and within 7 days after the end "Als Freund hinzufügen" next to the people (`frnd.addFromPlan`, FRND-003); within a month after the end or cancellation, the host can reopen it with a new date (`plan.reopen`, PLAN-025); the chat stays readable (CHAT-012).

### SCR-plan-edit Edit a plan
- **Purpose:** change a plan.
- **Requirements:** PLAN-010, PLAN-011, PLAN-020
- **States:**
  - **default:** the same fields as SCR-plan-create, filled in.
  - **crucial change:** before saving, the friendly note `plan.edit.crucialInfo` with change or back.
  - **invalid:** e.g. `plan.edit.error.groupSizeTooSmall`.

### SCR-plan-cancel Cancel a plan
- **Purpose:** cancel with a reason; hand the plan over or cancel it completely.
- **Requirements:** PLAN-012, PLAN-024
- **States:**
  - **without participants:** reason, confirm.
  - **with participants:** reason, then "leave the plan to the group" (recommended) or "cancel completely" with the note `plan.cancel.cancelAllInfo`.

### SCR-plan-takeover Host has left
- **Purpose:** tell participants that the host left and let one of them take over.
- **Requirements:** PLAN-013, PLAN-014
- **States:**
  - **open:** `plan.takeover.hostLeft`, "Ich übernehme" until the start.
  - **taken over:** who the new host is.
  - **cancelled:** the reason and "War dieser Abbruch für dich okay?" (`plan.cancelled.okay`).

### SCR-join-request Request to join
- **Purpose:** send a join request with an optional message.
- **Requirements:** JOIN-001, JOIN-010, MOD-010
- **States:**
  - **default:** the plan's title and time, an optional message, send.
  - **overlap:** `join.overlap.warning` naming the other plan and whether it is requested or confirmed; sending is still possible.
  - **blocked person in it:** the small hint `mod.block.inPlan`, naming nobody; sending is still possible (MOD-010).
  - **sent:** the plan now shows "angefragt" with "Anfrage zurückziehen" (`join.request.withdraw`).
  - **error / offline:** `Das hat nicht geklappt. Nochmal?`; the message is kept.

### SCR-plan-requests Open requests (host)
- **Purpose:** decide on requests.
- **Requirements:** JOIN-003, JOIN-004, JOIN-005, JOIN-016
- **States:**
  - **default:** one card per request: main photo, first name, age, trust label, message; accept and decline; tap opens the profile.
  - **empty:** no open requests.
  - **full:** accepting is no longer possible (`join.accept.error.full`).

### SCR-join-cancel Cancel participation
- **Purpose:** leave a plan with a reason.
- **Requirements:** JOIN-012
- **States:**
  - **default:** "Teilnahme wirklich absagen?", reasons (the plan's accepted reasons, "krank", "etwas ist dazwischengekommen", own text), confirm and back.
  - **short notice:** within 24 hours of the start, additionally `join.cancel.shortNotice`.

### SCR-join-attendance Who was missing
- **Purpose:** after a plan, report anyone who did not come; otherwise nothing to do.
- **Requirements:** JOIN-015, JOIN-017
- **States:**
  - **default:** the people of the plan with "war nicht da" next to each; no ratings.
  - **closed:** 48 hours after the end, no longer offered.

### SCR-feed Entdecken
- **Purpose:** find plans to join in your area.
- **Requirements:** FEED-001 … FEED-013
- **States:**
  - **default:** small wordmark, region chip ("Brig · 10 km"), headline, chips ("Für dich" active by default, "Heute", main categories), search, a list of cards (activity illustration, activity tag, time, title, region, "3 von 6 dabei", friends who are in, "angefragt" where requested); one primary button "Plan erstellen".
  - **filtered:** active filters visible, clearable in one step.
  - **new plans:** a small "Neue Pläne" hint; the list does not move.
  - **empty:** "Nichts dabei? Mach den ersten Schritt." with "Plan erstellen" and "Umkreis vergrössern" or "Filter zurücksetzen".
  - **loading / error:** loading indicator; "Das hat nicht geklappt. Nochmal?" with retry.
  - **offline:** the last loaded plans, marked `feed.offline`; "Bin dabei" disabled (FEED-014).

### SCR-feed-filter Filters
- **Purpose:** narrow the feed.
- **Requirements:** FEED-005
- **States:**
  - **default:** date (Heute, Morgen, Wochenende, a day), main activity categories (several), maximum group size; apply and reset.

### SCR-feed-area Feed area
- **Purpose:** choose the radius around the home municipality.
- **Requirements:** FEED-003
- **States:**
  - **default:** 5, 10 (default), 25 or 50 km around the home municipality.

### SCR-cal-list Meine Pläne (list)
- **Purpose:** the member's upcoming and past plans.
- **Requirements:** CAL-001 … CAL-005, CAL-007 … CAL-010, FRND-009, CHAT-015
- **States:**
  - **default:** upcoming plans by start time, each marked "Ich organisiere", "Ich nehme teil", "angefragt" or "eingeladen" (FRND-009); request counts on hosted plans; unread chat messages (CHAT-015); "changed" badges; takeover state; the filters of Entdecken; the way to friends and to "Gemerkte Pläne"; one primary button "Plan erstellen".
  - **past:** plans that ended within the last month, newest first, with the hint `cal.past.hint`, "war nicht da" (within 48 hours), reuse and "Merken".
  - **empty:** `cal.empty` with "Plan erstellen" and the way to Entdecken.
  - **offline:** `cal.offline` with retry.

### SCR-cal-month Meine Pläne (month)
- **Purpose:** the same plans as a month.
- **Requirements:** CAL-006, CAL-007
- **States:**
  - **default:** a month with a dot on each day that has a plan; tapping a day lists its plans; "Plan erstellen" uses the selected day.

### SCR-cal-kept Gemerkte Pläne
- **Purpose:** the member's kept copies of past plans.
- **Requirements:** CAL-012
- **States:**
  - **default:** the copies; each can become a new plan or be deleted.
  - **empty:** a short note on how to keep a plan.

### SCR-frnd-list Freunde
- **Purpose:** the member's friends, their open friend requests and their own name + ID.
- **Requirements:** FRND-001, FRND-004, FRND-007, FRND-008
- **States:**
  - **default:** own name + ID with share (`frnd.myId`); open friend requests on top with accept and decline; friends with photo and first name, each leading to SCR-prof-view, where the friend can be removed or blocked; "Freund hinzufügen".
  - **empty:** own name + ID, a short note on how to add friends (`frnd.empty`) and "Freund hinzufügen".
  - **offline:** `cal.offline` with retry, as in Meine Pläne (CAL-010).

### SCR-frnd-add Add a friend
- **Purpose:** send a friend request by name + ID.
- **Requirements:** FRND-002
- **States:**
  - **default:** one field for the name + ID (e.g. "Lea#4821") and "Freundschaftsanfrage senden".
  - **sent:** a short confirmation; the request waits for the other person's answer.
  - **not found:** `frnd.add.notFound`; nobody is suggested.

### SCR-plan-invite Invite friends
- **Purpose:** the host picks friends to invite into their plan.
- **Requirements:** FRND-005
- **States:**
  - **default:** the host's friends with photo and first name to select, the free seats, "Einladen" (`plan.invite`); friends already in the plan or invited are marked.
  - **no friends:** a short note with the way to add friends (SCR-frnd-add).

### SCR-plan-chat Chat
- **Purpose:** the plan's host and participants coordinate.
- **Requirements:** CHAT-001 … CHAT-016, MOD-005, MOD-011
- **States:**
  - **default:** messages with first name, photo and time, oldest first, scrolled to the newest; highlighted app messages (e.g. the changed meeting point) and short event lines set apart; the input field (up to 1000 characters) with send; mute and unmute (`chat.mute`); for an own message under 3 minutes old, edit and delete; for others' messages, report; messages of someone the member blocked are hidden; milder swear words masked unless the member turned on unfiltered language.
  - **empty:** `chat.empty` and the input field.
  - **read-only:** the messages without the input field, with `chat.readOnly` (7 days after the end, until the plan is reopened or deleted).
  - **offline:** the messages loaded last; a message written offline shows "nicht gesendet" with retry.

### SCR-mod-report Report
- **Purpose:** report a member, a plan or a chat message.
- **Requirements:** MOD-001, MOD-002
- **States:**
  - **default:** what is reported, the nine reasons, an optional text (required for "Etwas anderes"), a link to the Spielregeln, send; for a member, the offer to block them as well.
  - **missing reason or text:** `mod.report.error.reasonRequired` or `mod.report.error.textRequired`.
  - **sent:** `mod.report.sent`.
  - **error / offline:** `Das hat nicht geklappt. Nochmal?`; the choice and text are kept.

### SCR-mod-rules Spielregeln
- **Purpose:** read the six rules at any time.
- **Requirements:** MOD-008
- **States:**
  - **default:** the six rules, each with its sentence, and "Yaruno ist ab 18."

### SCR-mod-tips Safety tips
- **Purpose:** short advice before meeting people from the app.
- **Requirements:** MOD-009
- **States:**
  - **default:** the tips, the emergency numbers 117, 144 and 112, and "Verstanden".

### SCR-adm-home Moderation
- **Purpose:** the way into everything the member's role allows.
- **Requirements:** ADM-001, ADM-002
- **States:**
  - **moderator:** open reports and objections, oldest first, with their count.
  - **admin:** additionally cancellations that count, the activity list, the word lists, roles, reviewer access and the decision log.
  - **nothing open:** a short note that all is done.

### SCR-adm-report A report
- **Purpose:** review one report and decide.
- **Requirements:** ADM-003, ADM-004, ADM-005, ADM-015
- **States:**
  - **default:** what was reported as it was then, reason, text, reporter, earlier decisions about the member; the decisions (no action, warning, hide, suspension 7/30/90 days, ban), a note, "Danke senden", "Missbräuchliche Meldung".
  - **missing note:** `adm.decision.error.noteRequired`.
  - **already decided:** who decided, when and what (another moderator was faster).

### SCR-adm-objection An objection
- **Purpose:** review an objection to a sanction or a no-show.
- **Requirements:** ADM-007
- **States:**
  - **default:** the original decision with its note, the member's objection text; accept (lifts the decision) or reject, with a note.
  - **own decision:** for a moderator, not offered; for an admin, offered.

### SCR-adm-cancellations Cancellations that count
- **Purpose:** lift unfair cancellations.
- **Requirements:** ADM-008
- **States:**
  - **default:** cancellations that count, with plan, reason and the group's answers; "Aufheben" with a note.
  - **empty:** a short note.

### SCR-adm-activities Activity list
- **Purpose:** keep the curated activities.
- **Requirements:** ADM-011
- **States:**
  - **default:** general activities with their specific ones, each with German, French and English names; add, rename, deactivate.

### SCR-adm-words Word lists
- **Purpose:** keep the text-filter lists.
- **Requirements:** ADM-012
- **States:**
  - **default:** the refused and the masked list, per language; add and remove.

### SCR-adm-roles Roles, reviewer access and log
- **Purpose:** give or take the moderator role, switch store reviewer access, read the decision log.
- **Requirements:** ADM-001, ADM-013, ADM-014
- **States:**
  - **default:** moderators with "Rolle entfernen"; add a moderator by name + ID; reviewer access on or off; the decision log, newest first.

### SCR-set-home Einstellungen
- **Purpose:** every setting and account action in one list.
- **Requirements:** SET-001, SET-002, SET-004, SET-005, SET-007, SET-009, SET-010
- **States:**
  - **default:** language (only if more than one ships), notifications, "Freunde sehen, wo ich dabei bin", "Ungefilterte Sprache anzeigen", feed radius, blocked members, new phone number, Spielregeln, safety tips, terms of use, privacy policy, help, "Meine Daten" (ZIP via the share sheet), log out (with confirmation), delete account.
  - **export failed / offline:** `Das hat nicht geklappt. Nochmal?`.

### SCR-set-notif Notifications
- **Purpose:** switch notifications and quiet hours.
- **Requirements:** SET-003, NOTIF-004, NOTIF-006, NOTIF-008
- **States:**
  - **default:** one switch per notification, grouped by kind (requests, plan changes, reminders, chat, friends, account, and moderation for moderators); quiet hours with from and to.
  - **pushes not allowed:** `notif.permission.off` with a button to the phone's settings, above the switches.

### SCR-set-blocked Blocked members
- **Purpose:** see and undo blocks.
- **Requirements:** SET-006
- **States:**
  - **default:** blocked members by first name, each with "Blockierung aufheben" and a confirmation.
  - **empty:** a short note that nobody is blocked.

### SCR-set-help Help
- **Purpose:** answers and a way to the team.
- **Requirements:** SET-008
- **States:**
  - **default:** the FAQ and "Kontakt" (mail app to the support address).
  - **no mail app:** the address, ready to copy.

### SCR-set-delete Delete account
- **Purpose:** leave Yaruno.
- **Requirements:** SET-011, SET-012
- **States:**
  - **default:** what happens (upcoming plans, 14 days to change one's mind, what stays as "Ehemaliges Mitglied"), the hint to take a copy of the data first, confirm.
  - **pending deletion (after signing in again):** "Doch bleiben" (`set.delete.cancel`) or continue deleting.

### SCR-set-number New phone number
- **Purpose:** move the account to a new number.
- **Requirements:** SET-014
- **States:**
  - **default:** the new number, "Code senden", then the code field as in sign-up.
  - **taken / banned:** `set.number.error.taken` or the ban message; nothing changes.
