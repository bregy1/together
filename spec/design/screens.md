# Screens

Navigation, screen inventory and the states of every screen. Behaviour lives in the requirements (`product/`); this file says where it appears. Look and feel come from `direction.md` and `tokens.md`.

## Navigation map

- First launch, no session
  - SCR-onb-phone → SCR-onb-code → SCR-onb-about (→ SCR-onb-age-stop) → SCR-onb-interests → SCR-onb-photos → SCR-onb-rules → Entdecken
  - SCR-onb-code → Entdecken (existing member)
- Unfinished sign-up, app reopened
  - the step where the person left (ONB-008)
- Tabs: Entdecken · Meine Pläne (with friends) · Profil (`direction.md`)
  - Profil → SCR-prof-own → SCR-prof-edit
  - a host, requester, participant or friend → SCR-prof-view
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
- **Requirements:** PROF-001, PROF-002, PROF-010
- **States:**
  - **default:** main photo large with first name and age, further photos, interests in the owner's order, "Über mich", the trust label; report and block actions.
  - **sparse:** sections without content (no interests, no "Über mich") are left out.
  - **unavailable:** `prof.view.unavailable` when there is no shared context (PROF-002); no profile data shown.
  - **loading / error / offline:** loading indicator; `Das hat nicht geklappt. Nochmal?` with retry.

### SCR-prof-own Own profile
- **Purpose:** see your profile as others see it.
- **Requirements:** PROF-003, PROF-004
- **States:**
  - **default:** the profile as on SCR-prof-view, plus `prof.own.edit` and the link to the Spielregeln (`prof.own.rules`); no report or block actions.

### SCR-prof-edit Edit profile
- **Purpose:** change first name, photos and their order, home region, interests and their order, "Über mich".
- **Requirements:** PROF-005, PROF-006, PROF-007, PROF-008, PROF-009, PROF-011
- **States:**
  - **default:** the fields with current values; reorder actions for photos and interests (drag, or move-earlier and move-later).
  - **invalid:** field errors (`prof.edit.error.*`), e.g. last photo, "Über mich" too long or blocked, name change too soon.
  - **unsaved changes:** leaving asks `prof.edit.discard`.
  - **saving / offline:** progress; offline keeps the input and offers retry.
