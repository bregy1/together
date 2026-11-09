# Journeys — Yaruno

Six MVP journeys: J-01 to J-06. Steps cite area prefixes from `features.md`; requirement IDs follow with `/spec-write`.

## J-01 First launch to first plan attended

- **Actor:** new member · **Priority:** MVP
- **Trigger:** someone installs Yaruno because they want company for an activity or are new to the region.
- **Steps:**
  1. Signs up: phone number and SMS code, first name, date of birth (18+), home region, interests, a portrait; accepts the terms of use and the community rules, including the notice that Yaruno is not a dating app [ONB-001…ONB-018]
  2. Browses the feed of plans in the region [FEED]
  3. Opens a plan and looks at the host's profile [PROF-001, PROF-002]
  4. Requests to join ("Bin dabei") with an optional message [JOIN]
  5. Is asked in context whether to allow notifications [ONB-019]
  6. The host accepts; the member is notified [NOTIF]
  7. The location, the meeting point (if the host set one) and the plan chat unlock; the places can be opened in the maps app [PLAN-007, PLAN-023, CHAT]
  8. Sees safety tips before the first meetup [MOD]
  9. Attends; attendance is confirmed after the plan [JOIN]
  10. The trust label starts to grow [TRUST]
  11. Adds people from the plan as friends, within a week after the plan [FRND, PROF-002]
- **Outcome:** the new member has met people in real life through a plan that really happened.
- **What can go wrong:**
  - The SMS code doesn't arrive or is wrong: resend after a wait, or correct the number [ONB-005, ONB-006].
  - The birth date shows the person is under 18: sign-up stops with a friendly explanation, and no account is created [ONB-010].
  - The feed is empty in the region: the member is invited to host the first plan or to widen the region [FEED, PLAN].
  - The request is declined, expires or the group fills up: similar plans are suggested, or the member can create a similar plan ("Ähnlichen Plan erstellen") [FEED, JOIN, PLAN].

## J-02 Host a plan

- **Actor:** host · **Priority:** MVP
- **Trigger:** a member has an idea for an activity and wants people to join.
- **Steps:**
  1. Creates a plan from the feed or the calendar: title naming the activity, activity, start time and expected end time, group size, location and an optional meeting point on a map, accepted cancellation reasons [PLAN-001…PLAN-009, CAL]
  2. The plan appears in the feed with the coarse region only; a first-time host is asked about notifications [FEED, ONB-024]
  3. Join requests come in [NOTIF]
  4. Looks at the requesters' profiles and trust labels [PROF-001, PROF-002, TRUST]
  5. Accepts or declines each request before it expires [JOIN]
  6. When the last seat is taken, open requests end with "Die Gruppe ist inzwischen voll" and the plan leaves the feed [JOIN, FEED]
  7. Coordinates with the group in the plan chat; a change of the meeting point or another crucial change is confirmed, announced and marked with a badge [CHAT, PLAN-010, PLAN-011, PLAN-020…PLAN-022, NOTIF]
  8. The plan takes place; attendance is confirmed [JOIN]
  9. Reuses the plan next time [PLAN-015]
- **Outcome:** the plan took place with people who showed up, and it can be run again with little effort.
- **What can go wrong:**
  - Nobody requests to join.
  - Requests expire unanswered.
  - The host has to cancel (see J-04).
  - A requester is rude: the host declines, blocks or reports them [MOD].

## J-03 Plan with friends

- **Actor:** member of a friend group · **Priority:** MVP
- **Trigger:** friends want to do something together.
- **Steps:**
  1. Adds friends by name + ID, or after a shared plan [FRND]
  2. Creates a plan [PLAN-001]
  3. Invites friends directly as participants; they are notified [FRND, NOTIF]
  4. Shares a link, which shows only the region, with people who are not on Yaruno yet [PLAN-016]
  5. Others request to join, and the host decides [JOIN]
  6. The group coordinates in the plan chat [CHAT]
  7. Everyone sees the plan in their calendar [CAL]
  8. After the plan, it is reused for next time [PLAN-015]
- **Outcome:** the group planned an activity without a WhatsApp thread, and can run it again.
- **What can go wrong:**
  - A friend is not on Yaruno yet: the shared link leads to sign-up.
  - An invited friend declines.

## J-04 Cancel

- **Actor:** member or host · **Priority:** MVP
- **Trigger:** someone can't make it.
- **Steps (member cancels):**
  1. Cancels after a confirmation ("Teilnahme wirklich absagen?") and gives a reason [JOIN]
  2. The host and the group are notified and see the reason [NOTIF]
  3. The group is asked whether the cancellation is fine; the host can mark it as legitimate [JOIN]
  4. The seat becomes free; a full plan shows up in the feed again [FEED]
  5. The trust score is affected only by a short-term cancellation that nobody accepted [TRUST]
- **Steps (host cancels):**
  1. Cancels and gives a reason, choosing to leave the plan to the group or, if it cannot happen without them, to cancel it completely [PLAN-012, PLAN-024]
  2. If the host left, participants learn that the host has left and are asked "Wer möchte übernehmen?" until the start; if one takes over, the plan continues with a new host [PLAN-013, NOTIF]
  3. Otherwise the plan is cancelled; members see the reason and are asked "War dieser Abbruch für dich okay?" [PLAN-014, NOTIF]
  4. The trust score is affected only by a short-term cancellation that was not accepted [TRUST]
- Admins can review cancellations [ADM].
- **Outcome:** cancelling is easy and honest; only annoying short-term cancellations count.
- **What can go wrong:**
  - Nobody answers the "is this fine?" question (open decision in `features.md` → TRUST).
  - Nobody takes over the plan.
  - The group disagrees about a cancellation: an admin reviews it.

## J-05 Report

- **Actor:** member, admin · **Priority:** MVP
- **Trigger:** someone behaves badly.
- **Steps:**
  1. A member reports a user, a plan or a chat message with a reason, and may block the user [MOD]
  2. An admin reviews the report and decides: no action, warning, hide the content, suspend or ban [ADM]
  3. A confirmed report lowers the reported person's trust score [TRUST]
  4. The reported person is informed and can object [ADM, NOTIF]
- **Outcome:** bad behaviour has consequences, and normal members are protected.
- **What can go wrong:**
  - False or revenge reports.
  - Reports pile up faster than admins can review them.

## J-06 Leave

- **Actor:** member · **Priority:** MVP
- **Trigger:** a member wants a copy of their data or wants to leave.
- **Steps:**
  1. Requests a copy of their data in the settings [SET]
  2. Deletes the account in the app after a confirmation [SET]
  3. The account and the personal data are deleted [SET]
- **Outcome:** the member has left, and their personal data is gone.
- **What can go wrong:**
  - The member still hosts upcoming plans or has accepted places.
- **Open:** [NEEDS DECISION: What happens to upcoming plans when a member deletes their account? — options: A) they are cancelled automatically, with the takeover question for hosted plans, and with no trust effect, B) deletion is possible only after the member has cancelled or handed over everything, C) the account is deleted at once and the plans are cancelled without a takeover question — recommended: A, because both stores expect account deletion to be easy, and the takeover keeps plans alive]
