# Discover (`FEED`)

"Entdecken": find plans to join in your area, as a calm list of cards, with only the coarse region shown. The first of the three tabs (`design/direction.md` → Tab bar).

- **Journeys:** J-01, J-02, J-04 · **Screens:** SCR-feed, SCR-feed-filter, SCR-feed-area · **NFRs:** NFR-ACC-001, NFR-INTL-001

## Out of scope

- No people in the feed, only plans (`vision.md` → Non-goals: no people directory).
- No exact places, pins or distances per plan before acceptance (PLAN-007).
- No ads, no sponsored placement (`vision.md` → Non-goals).
- Partner events: later (PART).

## Requirements

### FEED-001 The feed
- **Status:** approved · **Priority:** MVP · **Since:** —
- **Requirement:** WHEN a member opens Entdecken, THE SYSTEM SHALL list the plans in their feed area that have a free seat and have not started, as cards with the illustration of the plan's general activity, the activity tag, the time, the title, the region and how many people are in ("3 von 6 dabei").
- **Rationale:** Feed of open plans in the member's region, as a list of cards with an image area on top (`features.md` → FEED; brand guide p.12; boss, 2026-11-09); full plans disappear (`features.md` → FEED); a drawn picture per general activity, no uploads (boss, 2026-11-09; `design/direction.md` → clash 15).
- **Scenarios:**
  - **S1** Given three open plans in the area and one full plan, when the member opens Entdecken, then three cards are shown.
  - **S2** Given a plan that starts in 30 minutes and has a free seat, when the member opens Entdecken, then it is shown; a plan that started 5 minutes ago is not.
  - **S3** Given a plan with the specific activity "Wandern" under "Outdoor", when its card is shown, then it carries the Outdoor illustration and the tag "Wandern".
- **Depends on:** FEED-002, FEED-003

### FEED-002 Only the region on cards
- **Status:** approved · **Priority:** MVP · **Since:** —
- **Requirement:** THE SYSTEM SHALL show on every card and in every feed result only the plan's region (its municipality), never its location, meeting point, pin or distance.
- **Rationale:** The feed shows only the coarse region (`features.md` → FEED; prototype chat; PLAN-007); a per-plan distance would let people narrow down the place. Coarse hints such as "zentral, mit ÖV erreichbar" go into the description; there is no extra field (boss, 2026-11-09).
- **Scenarios:**
  - **S1** Given a plan at "Talstation Blatten-Belalp", when it appears in Entdecken, then the card shows "Naters" and no distance.
- **Depends on:** PLAN-007

### FEED-003 Feed area
- **Status:** approved · **Priority:** MVP · **Since:** —
- **Requirement:** WHILE Entdecken is shown, THE SYSTEM SHALL show only plans whose location lies within the member's feed radius of their home municipality, 10 km by default, and show the area in the region chip (e.g. "Brig · 10 km", `feed.area`); the member chooses 5, 10, 25 or 50 km in the settings, which tapping the region chip opens directly (SCR-feed-area).
- **Rationale:** The member's region (`features.md` → FEED; ONB-012); brand guide p.12 region chip; "let the user decide, 10 km, in the settings" (boss, 2026-11-09). The distance is only used to select plans and is never shown per plan (FEED-002).
- **Scenarios:**
  - **S1** Given a member in Brig with the default radius, when a plan's location is in Naters (about 2 km away), then it is shown; a plan in Zermatt is not.
  - **S2** Given a new member who never changed the setting, when they open Entdecken, then the region chip reads "<home municipality> · 10 km".
  - **S3** Given Entdecken, when the member taps the region chip and picks 25 km, then the feed shows plans within 25 km and the chip reads "Brig · 25 km".
- **Depends on:** ONB-012

### FEED-004 Order and "Für dich"
- **Status:** approved · **Priority:** MVP · **Since:** —
- **Requirement:** WHILE "Für dich" (`feed.forYou`) is selected, which it is by default, THE SYSTEM SHALL list first the plans whose general activity is one of the member's interests and then all other plans, each group by start time; WHEN the member deselects it, THE SYSTEM SHALL list all plans by start time.
- **Rationale:** Brand guide p.12 ("Für dich" chip, active); interests are the general activities (ONB-013, PLAN-003); "Für dich" first (boss, 2026-11-09). Members still see every plan below their interests.
- **Scenarios:**
  - **S1** Given a member interested in "Outdoor", a "Spieleabend" today and a hike tomorrow, when Entdecken opens, then the hike comes first and the Spieleabend after it.
  - **S2** Given the same plans, when the member deselects "Für dich", then the Spieleabend comes first.
  - **S3** Given a member with no interests, when Entdecken opens, then all plans are listed by start time.

### FEED-005 Filters
- **Status:** approved · **Priority:** MVP · **Since:** —
- **Requirement:** WHEN a member filters Entdecken by date (Heute, Morgen, Wochenende or a chosen day), by one or more general activities (the main categories only) and by a maximum group size, THE SYSTEM SHALL show only the plans that match every chosen filter, and show which filters are active.
- **Rationale:** "Viele und komplexe Filter-Möglichkeiten" (`notes/use-case.md`); search and filters (`features.md` → FEED); chips "Für dich", "Heute", "Outdoor" (brand guide p.12); date and activity, but only the 5–6 main activity categories (boss, 2026-11-09); plus group size (boss, 2026-11-09).
- **Scenarios:**
  - **S1** Given a hike today and a hike on Saturday, when the member filters "Heute" and "Outdoor", then only today's hike is shown.
  - **S2** Given "Outdoor" and "Kultur" are chosen, when Entdecken updates, then plans of both activities are shown, and plans with a specific activity under them (e.g. "Wandern") count as "Outdoor".
  - **S3** Given active filters, when the member looks at Entdecken, then the active filters are visible and can be cleared in one step.
  - **S4** Given a plan for 4 people and one for 10, when the member filters "bis 4 Personen", then only the plan for 4 is shown.

### FEED-006 Search
- **Status:** approved · **Priority:** MVP · **Since:** —
- **Requirement:** WHEN a member searches in Entdecken (`feed.search`), THE SYSTEM SHALL show the plans in the feed area whose title, activity or description contains the search words.
- **Rationale:** "In Feed können Aktivitäten gesucht werden" (`notes/use-case.md`); search (`features.md` → FEED).
- **Scenarios:**
  - **S1** Given a plan "Bouldern in kleiner Runde" in the area, when the member searches "bouldern", then it is shown.
  - **S2** Given no match, when the member searches "Tango", then the empty state with "Plan erstellen" is shown (FEED-008).

### FEED-007 Create a plan from the feed
- **Status:** approved · **Priority:** MVP · **Since:** —
- **Requirement:** WHILE Entdecken is shown, THE SYSTEM SHALL offer "Plan erstellen" (`feed.createPlan`) as the screen's one primary button, opening SCR-plan-create.
- **Rationale:** Create a plan from the feed (`features.md` → FEED); one primary button per screen (brand guide p.11–12).
- **Scenarios:**
  - **S1** Given Entdecken, when the member taps "Plan erstellen", then SCR-plan-create opens.

### FEED-008 Empty feed
- **Status:** approved · **Priority:** MVP · **Since:** —
- **Requirement:** IF no plan matches the feed area, the filters or the search, THEN THE SYSTEM SHALL show "Nichts dabei? Mach den ersten Schritt." (`feed.empty`) with "Plan erstellen" and an action to widen the area or clear the filters.
- **Rationale:** J-01 failure case (the feed is empty in the region); brand guide microcopy (p.13).
- **Scenarios:**
  - **S1** Given no plans within 10 km, when the member opens Entdecken, then `feed.empty`, "Plan erstellen" and "Umkreis vergrössern" are shown.
  - **S2** Given filters that match nothing, when they are applied, then `feed.empty` with "Filter zurücksetzen" is shown.

### FEED-009 Similar plans
- **Status:** approved · **Priority:** MVP · **Since:** —
- **Requirement:** WHEN a member's request does not work out (declined, group full, or the plan started without a decision), THE SYSTEM SHALL suggest the open plans in the member's feed area with the same general activity, soonest first.
- **Rationale:** Similar plans are suggested when a join request doesn't work out (`features.md` → FEED; JOIN-005 … JOIN-008); same main category keeps the pool big enough in a pilot region (boss, 2026-11-09).
- **Scenarios:**
  - **S1** Given a declined request for a hike ("Outdoor"), when the member sees the decline, then open "Outdoor" plans in their area are suggested, including a bike tour.
  - **S2** Given no other "Outdoor" plan in the area, when the request is declined, then the empty state with "Plan erstellen" is shown instead (FEED-008).

### FEED-010 Friends on a card
- **Status:** approved · **Priority:** MVP · **Since:** —
- **Requirement:** WHEN a plan in the feed has participants who are the member's friends, THE SYSTEM SHALL show them on the card (e.g. "Lea ist dabei", `feed.card.friendsGoing`), as far as FRND allows.
- **Rationale:** See which friends are going to a plan (`features.md` → FRND; boss, 2026-11-08: "this friend of yours is also going").
- **Scenarios:**
  - **S1** Given Lea is a friend and a participant of a plan, when the member sees its card, then "Lea ist dabei" is shown.
- **Depends on:** FRND

### FEED-011 Blocked members' plans
- **Status:** approved · **Priority:** MVP · **Since:** —
- **Requirement:** IF the member has blocked the host of a plan, or the host has blocked the member, THEN THE SYSTEM SHALL not show that plan in the member's feed, search or similar plans.
- **Rationale:** Blocking stops another member from interacting with you (`glossary.md` → block; `features.md` → MOD).
- **Scenarios:**
  - **S1** Given the member blocked Max, when Max publishes a plan in the area, then the member does not see it.
- **Depends on:** MOD

### FEED-012 Own and joined plans in the feed
- **Status:** approved · **Priority:** MVP · **Since:** —
- **Requirement:** WHEN Entdecken lists plans, THE SYSTEM SHALL leave out the plans the member hosts or is a participant of, and mark the plans they have requested as "angefragt".
- **Rationale:** Entdecken is for finding new plans; Meine Pläne lists hosted, requested and accepted plans (`features.md` → CAL; boss, 2026-11-09).
- **Scenarios:**
  - **S1** Given the member hosts one plan and is accepted for another in the area, when they open Entdecken, then neither is shown.
  - **S2** Given the member requested a plan, when they open Entdecken, then its card shows "angefragt".

### FEED-013 Keeping the feed current
- **Status:** approved · **Priority:** MVP · **Since:** —
- **Requirement:** WHILE Entdecken is open, THE SYSTEM SHALL remove plans that become full, start or are cancelled at once, announce newly published plans with a small "Neue Pläne" hint (`feed.newPlans`) instead of moving the list, and refresh the list when the member pulls down.
- **Rationale:** Server push out of the box (boss, 2026-11-07; ADR-0006); full plans disappear (`features.md` → FEED); a card that is already full must not invite a request (boss, 2026-11-09).
- **Scenarios:**
  - **S1** Given the member is looking at a plan's card, when its last seat is taken, then the card disappears.
  - **S2** Given the member is scrolling, when a new plan is published in the area, then "Neue Pläne" appears and the list stays where it is; tapping the hint shows the new plan.

### FEED-014 Without a connection
- **Status:** approved · **Priority:** MVP · **Since:** —
- **Requirement:** WHILE the device is offline, THE SYSTEM SHALL show the last loaded plans in Entdecken, marked as not up to date (`feed.offline`), and disable "Bin dabei" until the connection is back.
- **Rationale:** Completeness check (offline and poor connectivity); members can still browse on a train through the valley (boss, 2026-11-09).
- **Scenarios:**
  - **S1** Given the member loaded Entdecken, when the connection drops, then the plans stay visible with `feed.offline`, and "Bin dabei" is disabled.
  - **S2** Given the connection comes back, when Entdecken is open, then the list refreshes and "Bin dabei" works again.
