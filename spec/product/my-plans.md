# My plans (`CAL`)

"Meine Pläne", the second tab: everything the member hosts, takes part in or has requested, as a list or a calendar, plus the way into friends. Entdecken is for finding new plans; Meine Pläne is for the ones that concern you (FEED-012).

- **Journeys:** J-01, J-02, J-03, J-04 · **Screens:** SCR-cal-list, SCR-cal-month, SCR-cal-kept · **NFRs:** NFR-ACC-001, NFR-INTL-001

## Out of scope

- Friends themselves (adding, inviting, friends going): FRND. Meine Pläne only holds the entry to them (boss, 2026-11-09: friends live inside Meine Pläne).
- Request handling, cancelling, attendance: JOIN; editing and cancelling plans: PLAN. Meine Pläne shows their states and leads to them.

## Requirements

### CAL-001 The list
- **Status:** approved · **Priority:** MVP · **Since:** —
- **Requirement:** WHEN a member opens Meine Pläne, THE SYSTEM SHALL list their upcoming plans by start time, each marked as "Ich organisiere" (hosted), "Ich nehme teil" (accepted) or "angefragt" (open request).
- **Rationale:** List of the member's hosted, requested and accepted plans (`features.md` → CAL); "Ich nehme teil" and "Ich organisiere" (prototype chat).
- **Scenarios:**
  - **S1** Given a member who hosts a plan on Friday, takes part in one on Wednesday and requested one on Saturday, when they open Meine Pläne, then the three appear in the order Wednesday, Friday, Saturday, each with its mark.
  - **S2** Given a request that was declined, when the member opens Meine Pläne, then the plan shows "nicht angenommen" with a link to similar plans (JOIN-008) until the member dismisses it.
- **Depends on:** JOIN-008

### CAL-002 What the host sees on a hosted plan
- **Status:** approved · **Priority:** MVP · **Since:** —
- **Requirement:** WHILE a hosted plan has open requests, THE SYSTEM SHALL show their number on its entry in Meine Pläne (e.g. "2 Anfragen", `cal.openRequests`), leading to SCR-plan-requests.
- **Rationale:** Hosts see open requests in Meine Pläne (prototype chat; JOIN-003).
- **Scenarios:**
  - **S1** Given two open requests for the member's plan, when they open Meine Pläne, then the plan shows "2 Anfragen"; tapping it opens the requests.
- **Depends on:** JOIN-003

### CAL-003 Changes and hand-overs show here
- **Status:** approved · **Priority:** MVP · **Since:** —
- **Requirement:** WHILE a plan in Meine Pläne carries a "changed" badge (PLAN-022) or waits for a takeover (PLAN-013), THE SYSTEM SHALL show that on its entry.
- **Rationale:** The badge and the takeover question concern the member's own plans (PLAN-013, PLAN-022).
- **Scenarios:**
  - **S1** Given the time of a plan the member takes part in changed, when they open Meine Pläne, then the entry carries "Zeit geändert".
  - **S2** Given the host left a plan the member takes part in, when they open Meine Pläne, then the entry shows that the host left and "Ich übernehme".
- **Depends on:** PLAN-013, PLAN-022

### CAL-004 Past plans
- **Status:** approved · **Priority:** MVP · **Since:** —
- **Requirement:** WHEN a member looks at past plans in Meine Pläne (`cal.past`), THE SYSTEM SHALL list the plans they hosted or attended that ended within the last month, newest first, with a small hint that past plans disappear after a month (`cal.past.hint`) and the actions to report someone missing (within 48 hours, JOIN-015), to reuse the plan (PLAN-015) and to keep a copy (CAL-012).
- **Rationale:** Plans end and become past (PLAN-018); only a month, with a small hint (boss, 2026-11-09); data minimisation (`constitution.md`).
- **Scenarios:**
  - **S1** Given a plan the member attended that ended 3 weeks ago, when they open the past plans, then it is listed with the hint.
  - **S2** Given a plan that ended 5 weeks ago and was not kept, when they open the past plans, then it is no longer listed.

### CAL-012 Keep a copy of a plan
- **Status:** approved · **Priority:** MVP · **Since:** —
- **Requirement:** WHEN a member keeps a past plan ("Merken", `cal.past.keep`), THE SYSTEM SHALL save a copy of it for that member under "Gemerkte Pläne", with the same details that reusing the plan copies (PLAN-015), and keep it until the member deletes it or their account.
- **Rationale:** The member can keep a plan around longer if they want, as a copy (boss, 2026-11-09); the copy follows the reuse rules, so another host's places are not kept.
- **Scenarios:**
  - **S1** Given a walk the member hosted, when they keep it, then the copy holds everything except date and time, and stays after the original disappears from the past plans.
  - **S2** Given a plan someone else hosted, when the member keeps it, then the copy holds only title, activity and description.
  - **S3** Given a kept copy, when the member opens it, then they can create a new plan from it or delete it.
- **Depends on:** PLAN-015

### CAL-005 Filters
- **Status:** approved · **Priority:** MVP · **Since:** —
- **Requirement:** WHEN a member filters Meine Pläne, upcoming or past, THE SYSTEM SHALL offer the same filters, in the same component and look, as Entdecken (date, main category, group size; FEED-005) and show only the matching plans.
- **Rationale:** A classic list with filter options (`notes/use-case.md`; `features.md` → CAL); the same filter component, look and feel as Entdecken (boss, 2026-11-09).
- **Scenarios:**
  - **S1** Given the member's plans include a hike and a games evening this week, when they filter "Outdoor", then only the hike is shown.
  - **S2** Given the past plans, when the member opens the filters, then they are the same as in Entdecken.
- **Depends on:** FEED-005

### CAL-006 Calendar view
- **Status:** approved · **Priority:** MVP · **Since:** —
- **Requirement:** WHEN a member switches Meine Pläne to the calendar (`cal.view.calendar`), THE SYSTEM SHALL show a month with a dot on every day that has one of their plans, and list a day's plans when the member taps that day.
- **Rationale:** Calendar view of the same plans (`features.md` → CAL); "multiple views, calendar view" (`notes/use-case.md`); month with dots (boss, 2026-11-09).
- **Scenarios:**
  - **S1** Given plans on the 12th and the 15th, when the member opens the calendar, then those days carry a dot.
  - **S2** Given the member taps the 15th, when the day opens, then its plans are listed with their marks.
  - **S3** Given a screen reader, when it reaches a day with a plan, then it announces the date and the number of plans, not only a dot.
- **Depends on:** NFR-ACC-001

### CAL-007 Create a plan from Meine Pläne
- **Status:** approved · **Priority:** MVP · **Since:** —
- **Requirement:** WHILE the list or the calendar is shown, THE SYSTEM SHALL offer "Plan erstellen" (`cal.createPlan`) as the screen's one primary button, opening SCR-plan-create with the selected calendar day as the date if a day is selected.
- **Rationale:** Create a new plan from either view (`features.md` → CAL; `notes/use-case.md`: "can add new activities in each list"); the selected day is pre-filled (boss, 2026-11-09).
- **Scenarios:**
  - **S1** Given the member selected Saturday the 15th in the calendar, when they tap "Plan erstellen", then SCR-plan-create opens with the 15th as the date.
  - **S2** Given the list view, when they tap "Plan erstellen", then SCR-plan-create opens with an empty date.

### CAL-008 Friends inside Meine Pläne
- **Status:** approved · **Priority:** MVP · **Since:** —
- **Requirement:** WHILE Meine Pläne is shown, THE SYSTEM SHALL offer the way to the member's friends (`cal.friends`), which leads into FRND.
- **Rationale:** Friends live inside Meine Pläne, there is no separate tab (boss, 2026-11-09; `design/direction.md` → clash 13).
- **Scenarios:**
  - **S1** Given Meine Pläne, when the member taps `cal.friends`, then their friends list opens (FRND).
- **Depends on:** FRND

### CAL-009 Empty Meine Pläne
- **Status:** approved · **Priority:** MVP · **Since:** —
- **Requirement:** IF the member has no upcoming plans, THEN THE SYSTEM SHALL show a short note (`cal.empty`) with "Plan erstellen" and a way to Entdecken.
- **Rationale:** Completeness check (empty state); brand tone: "Nichts dabei? Mach den ersten Schritt." (`design/direction.md` → Microcopy).
- **Scenarios:**
  - **S1** Given a new member, when they open Meine Pläne, then `cal.empty`, "Plan erstellen" and the way to Entdecken are shown.

### CAL-010 Without a connection
- **Status:** approved · **Priority:** MVP · **Since:** —
- **Requirement:** WHILE the device is offline, THE SYSTEM SHALL show an offline message with a retry action in Meine Pläne (`cal.offline`) instead of the plans.
- **Rationale:** Completeness check (offline); an offline message (boss, 2026-11-09).
- **Scenarios:**
  - **S1** Given no connection, when the member opens Meine Pläne, then `cal.offline` with retry is shown.
  - **S2** Given the connection is back, when the member taps retry, then the plans load.

