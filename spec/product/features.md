# Feature map — Yaruno

| Prefix | Area | Purpose | Priority | Spec |
|---|---|---|---|---|
| ONB | Onboarding | Sign up with a verified phone number and get a profile ready for the first plan | MVP | approved |
| PROF | Profile | Show who someone is, only in the context of a plan or a friendship | MVP | approved |
| FEED | Discover ("Entdecken") | Find plans to join in your region | MVP | approved |
| PLAN | Hosting | Create, edit, cancel, share and reuse plans, with places hidden until acceptance | MVP | approved |
| JOIN | Joining | Request to join, get accepted, show up, and confirm who was there | MVP | approved |
| CAL | My plans ("Kalender") | See your hosted, requested and accepted plans as a list or a calendar | MVP | approved |
| TRUST | Trust score | Signal reliability with a coloured bar, mainly by flagging repeated bad behaviour | MVP | approved |
| MOD | Safety | Report, block, filter texts, community rules and safety tips | MVP | approved |
| ADM | Admin tools | Review reports, sanction users, manage the interest list | MVP | approved |
| NOTIF | Notifications | Tell people about requests, decisions and changes to their plans | MVP | approved |
| FRND | Friends | Add friends and bring them into plans | MVP | approved |
| CHAT | Chat | Plan chat for a plan's host and accepted participants | MVP | approved |
| SET | Settings & account | Settings, legal texts, help, data export and account deletion | MVP | not started |
| PART | Partner organisations | Organisations publish open events anyone can join | later | not started |

## MVP cut

The MVP is the smallest set in which a member signs up, finds or hosts a plan, gets accepted, shows up and confirms who was there, because that is the core value ("plans that really happen") and what the north star measures. Friends, the plan chat, the calendar view and plan links are in because the boss chose them for the pilot: they make Yaruno an alternative to planning in WhatsApp groups (see `vision.md` → Problem). Safety, admin tools and account settings are in because the stores require reporting, blocking and in-app account deletion for apps with accounts and user content.

## ONB — Onboarding

- Phone number with an SMS code; no account without a verified phone number — MVP
- First name (no last name) and date of birth; members must be 18 or older; the full birth date stays private — MVP
- Home region entered by hand, without location permission — MVP
- Up to 5 interests from a curated list with search and categories; free text cannot create new interests — MVP
- Profile photos: one clear portrait is required; up to three more are optional — MVP
- Accept the terms of use (EULA) and confirm the community rules, including a clear notice that Yaruno is not a dating app — MVP
- Notification permission asked in context (e.g. after the first join request), with "Nicht jetzt" — MVP
- Suggest a missing interest for review — later
- Add an e-mail address for account recovery — later
- Controlled correction of a mistyped birth date — later

## PROF — Profile

- Profiles are visible only in context: the host's profile before requesting, the requester's profile for the host, the group's profiles after acceptance, and friends' profiles — MVP
- A profile shows photos, first name, age, interests, an optional description and the trust label; never the full birth date — MVP
- Members can sort their interests — MVP
- Edit your own profile — MVP
- The community rules are reachable from the profile — MVP
- Selfie-verified badge: a live selfie compared with the profile photos gives a "verified" badge — later

## FEED — Discover ("Entdecken")

- Feed of open plans in the member's region, as a list of cards with an image area on top (brand guide; boss, 2026-11-09) — MVP
- The feed and the public plan view show only the coarse region and hints (e.g. "central, reachable by public transport"), never the exact place — MVP
- Search and filters — MVP
- Full plans disappear from the feed — MVP
- Similar plans are suggested when a join request doesn't work out (declined, group full, plan started without a decision) — MVP
- Create a plan from the feed — MVP
- Feed area: the home municipality plus a radius, 10 km by default, changed in the settings; the region chip shows it ("Brig · 10 km") (boss, 2026-11-09) — MVP
- "Für dich" first: plans matching the member's interests on top (boss, 2026-11-09) — MVP
- Filters: date, the main activity categories and group size (boss, 2026-11-09) — MVP
- Each card shows the drawn picture of its main activity category; no uploads (boss, 2026-11-09) — MVP

## PLAN — Hosting

- Create a plan: a title naming the concrete activity (optional tagline), category, start time and expected end time, number of seats, coarse region, description — MVP
- A location ("Ort", required) and an optional separate meeting point ("Treffpunkt"); both are shown only to accepted participants and are never delivered to anyone else — MVP
- Edit a plan; edits that make no sense (e.g. after people have joined) are restricted — MVP
- Accepted cancellation reasons: when creating a plan, the host picks from a fixed list (e.g. bad weather) and may add one reason of their own; members see them before requesting; every reason the host sets makes a cancellation fine — MVP
- Cancel a plan: a reason is always required; the host picks one of a few reasons or writes a short one; everyone is notified — MVP
- Host takeover: before a plan with participants is cancelled, they are asked "Wer möchte übernehmen?"; if one takes over, the plan continues with a new host — MVP
- After a host cancels, each participant sees the reason and is asked "War dieser Abbruch für dich okay?" — MVP
- Change the meeting point ("Treffpunkt ändern"); accepted participants are notified — MVP
- Reuse a plan: copy an earlier or a full plan ("Ähnlichen Plan erstellen") with its idea and category; date, time and places are set again — MVP
- Share a plan link that shows only the coarse region; it opens the app or the store — MVP
- A small web page for shared plan links (for people without the app) — later (boss, 2026-11-09)
- Co-hosts who can edit the plan together with the host — later
- Participants confirm a significant meeting-point change ("Gesehen"); the host sees who has not seen it — later
- Things to bring: the host lists what the plan needs (e.g. a climbing rope), and participants say "Ich bringe das mit" — later (version 2); until then the group sorts it out in the plan chat (boss, 2026-11-09)
- Input from the brand guide (p.14), to confirm in `/spec-write PLAN`: groups of at most 6 people, a host may allow up to 8; "Neue starten mit mindestens drei" (meaning to clarify); meeting points are public places, never private addresses
- The host can reopen a past or cancelled plan with a new date, within a month; earlier participants confirm whether they are in again, and the chat continues (boss, 2026-11-10) — MVP

## JOIN — Joining

- Request to join with the button "Bin dabei", with an optional short message; the plan then shows the request as "angefragt" until the host decides — MVP
- The host accepts or declines — MVP
- Requests have no expiry: they stay until the host decides, the requester withdraws them (any time, no trust effect), the group is full or the plan starts (boss, 2026-11-09) — MVP
- Request states: requested, accepted, declined, withdrawn, group full, ended at the start; only an accepted request takes a seat and unlocks the places and the plan chat — MVP
- When the last seat is taken, open requests end with "Die Gruppe ist inzwischen voll"; this is not a personal rejection — MVP
- Overlap warning when plans overlap in time (requested or confirmed); the request is still allowed, and nothing is cancelled automatically — MVP
- Cancel participation after a confirmation ("Teilnahme wirklich absagen?"); a reason is always required; the member picks one of a few reasons or writes a short one — MVP
- After a member cancels, the host and the other participants see the reason and are asked whether the cancellation is fine; the host can also mark it as legitimate. This lets friends cancel among themselves without any penalty — MVP
- After the plan, anyone in the group can report that a person was missing; without a report everyone counts as having attended; it feeds the north star and the trust score (boss, 2026-11-09) — MVP

## CAL — My plans ("Kalender")

- List of the member's hosted, requested and accepted plans, with filters — MVP
- Calendar view of the same plans — MVP
- Create a new plan from either view — MVP

## TRUST — Trust score

- The score is computed internally and never shown as a number; members see a coloured bar with four fixed states (new, normal, lowered, low) and an info sign that explains it (boss, 2026-11-09) — MVP
- The rules stay really simple and small; nothing is rated that a normal member would have to work for — MVP
- New members start neutral (grey) until they have attended enough plans; solo plans don't count — MVP
- Attending plans raises the score gently, so normal members reach an ok-to-good score — MVP
- Repeated no-shows lower the score; a single miss does not — MVP
- Only annoying short-term cancellations lower the score: a member's cancellation within 24 hours of the start, a host's cancellation within 14 days of the start; a host who leaves a plan that a participant then takes over counts like a member (PLAN-013) — MVP
- These cancellations have no effect: a plan cancelled while it has no participants; a cancellation for one of the reasons the host accepted for the plan (e.g. bad weather for an outdoor plan); a member's cancellation the host marked as legitimate; any cancellation the rest of the group said was fine; a participant's cancellation after the host changed crucial information of the plan (PLAN-019) — MVP
- Silence on "is this cancellation fine?" counts as fine; only an explicit "nicht okay" counts against (boss, 2026-11-09) — MVP
- Reports affect the score only after an admin has reviewed them; automatic text-filter hits do not count — MVP
- Hosts who remove participants casually lower their own score: a removal whose report the moderators do not confirm counts against the host; a single one does not (boss, 2026-11-09; PLAN-017) — MVP
- Lateness is not rated; a member who is late in a way that really matters can be reported — MVP

## MOD — Safety

- Report a user, a plan or a chat message, with reasons that match the community rules — MVP
- Block a user — MVP
- Text filter for plan, profile and chat texts, in two levels: hate, slurs and sexual harassment are refused; milder swear words are shown masked unless the member turns on "Ungefilterte Sprache anzeigen" (boss, 2026-11-10) — MVP
- Community rules (Spielregeln), reachable at any time: the six rules from the brand guide (p.13), the first one reworded by the boss — "Keine Dating-App.", "Kein Verkaufen.", "Kein Geld unter Teilnehmenden.", "Keine Privatadressen.", "Absagen statt Ghosten.", "Melden statt Aushalten."; one explaining sentence each is written in `/spec-write MOD` — MVP
- Safety tips before a member's first meetup — MVP

## ADM — Admin tools

- Moderator role: members with this role can review reports and decide on them, without full admin rights — MVP
- Review reports and decide on them (moderators and admins) — MVP
- Review cancellations; at the start, admins can review every cancellation — MVP
- Sanctions: warn, hide content, suspend, ban; the person can object — MVP
- Manage the curated interest list — MVP
- The trust score is never edited by hand; it changes only as a side effect of decisions, and heavier sanctions lower it more (warning 1 issue up to a 90-day suspension 4) (boss, 2026-11-10) — MVP
- Review suggested interests — later

## NOTIF — Notifications

- Join request received (host) — MVP
- Request accepted, declined, group full or ended at the start (requester); reminder to the host about an open request — MVP
- Plan changed (e.g. meeting point, time) or cancelled; a member cancelled — MVP
- Host takeover offered ("Wer möchte übernehmen?") — MVP
- Reminder at 18:00 the evening before a plan, for its participants and its host (e.g. "Morgen 05:30, Lea rechnet mit dir.") — on by default, can be switched off in the settings (boss, 2026-11-09 and 2026-11-10) — MVP
- Friend request received; invited into a plan by a friend who hosts it — MVP
- New plan chat messages: the first at once, further ones grouped at most every 10 minutes ("4 neue Nachrichten"), never with the text; a single plan's chat can be muted (boss, 2026-11-10) — MVP
- A plan you were in is reopened with a new date: "Bist du wieder dabei?" — MVP
- A thank-you after a report, only if the moderator chooses to send one (MOD-003) — MVP
- A sanction with the rule it is about and the way to object; the outcome of an objection (ADM-006, ADM-007) — MVP
- Moderators: a new report or objection, and a reminder when one is still open after 24 hours (ADM-010) — MVP
- Push only, no notification list in the app; every notification can be switched off on its own; quiet hours are a setting; no push after a plan to report who was missing (boss, 2026-11-10) — MVP

## FRND — Friends

- Friends live inside "Meine Pläne"; there is no separate tab (boss, 2026-11-09) — MVP
- Add friends by name + ID (like Discord); there is no people search — MVP
- Add people as friends after a shared plan — MVP
- Invite friends directly into a plan as participants, with a notification — MVP
- See which friends are going to a plan — MVP
- Invite friends as co-hosts — later

## CHAT — Chat

- A plan chat for the host and the participants of each plan; access ends when someone cancels or is removed — MVP
- Text and emoji only; own messages can be edited or deleted for 3 minutes; writable until 7 days after the plan, then read-only, deleted after a month (boss, 2026-11-10) — MVP
- Group chat beyond a single plan (e.g. for a friend group) — later; the concept is to be rethought

## SET — Settings & account

- Language, notification settings (every notification can be switched on or off on its own; quiet hours, off by default; NOTIF-004, NOTIF-006), "Freunde sehen, wo ich dabei bin" (on by default, FRND-006), "Ungefilterte Sprache anzeigen" (off by default, MOD-011), blocked users — MVP
- Feed radius for Entdecken (10 km by default) [FEED-003] — MVP
- Legal texts: terms of use, privacy policy, community rules — MVP
- Help and support: FAQ and a contact option — MVP
- Data export: members can get a copy of their data — MVP
- Log out; delete the account in the app — MVP

## PART — Partner organisations

- Partner accounts for organisations such as bars, gyms or bands — later
- Open events that anyone can join — later
- Partner events are labelled, with transparent costs — later
- Copy a partner event and ask other people to go along — later

## Milestones

- **M1 — Pilot:** every feature marked MVP.
- **Later:** every feature marked later waits in one list and is ordered into M2 once M1 is done, based on what the pilot shows.

## Ideas parking lot

- Voluntary "buy us a coffee" support link — idea; store rules for tips and donations to be checked (topic 9)
- ID check for hosts — idea; considered later, not for the start, because it is a big hurdle (boss, 2026-11-09; proposed in the brand guide)
- Add a plan to the phone's own calendar — idea; not now (boss, 2026-11-09)
- Hosts upload their own plan picture instead of the activity illustration — maybe; to be discussed (needs upload and image moderation) (boss, 2026-11-09)

## Dropped

- **CHF 5 deposit** for no-shows and host cancellations — 2026-11-08 — users never pay anything; reliability is handled by the trust score.
- **Host tier model** (only approved hosts may host) — 2026-11-08 — anyone can host; misuse is handled by moderation.
- **Punctuality in the trust score** (`notes/use-case.md`) — 2026-11-08 — ratings must stay simple; lateness that really matters goes through a report.
- **Automatic swear-word penalty in the trust score** (`notes/score.md`) — 2026-11-08 — only reviewed reports count.
