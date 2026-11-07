# Digest: ChatGPT prototype chat ("TOGETHER-Oberfläche erstellen")

Source: https://chatgpt.com/s/cx_6adc77fd9fe48191a8f002d9346fd4f4 (read 2026-11-07). The chat itself is in German; this digest is in English, with the original German terms in quotes. It is **input for `/app-discover`, not spec**. Points marked *(proposal)* came from ChatGPT and have not been confirmed.

The chat refers to earlier decisions that are **not in this share**: a tier model for who may host, a "no selling" community rule, a CHF 5 deposit with a 24 h rule, and a decision against public profiles. If that earlier chat still exists, add it here.

## What was built

A clickable phone prototype with simulated data. You can browse plans ("Pläne"), filter, request to join, cancel, and create your own plans. It also has "Meine Pläne", a demo group chat, feedback and a trust profile. SMS, payments, verification and messaging were simulated. Scope: the prototype is UX only, and the technical build happens separately.

## Location privacy

- The feed and the public detail view show only the **coarse region**, e.g. "Brig", plus hints such as "central, reachable by public transport". They show no exact address and no map pin.
- The **exact meeting point** is shown only after the host accepts the request. It appears in "Meine Pläne" and in the closed group area.
- Shared plan links also show only the region. After a cancellation or removal, access to the meeting point and the chat ends.
- The host enters the exact meeting point when creating the plan, and it stays hidden until then.
- **Technical requirement:** the address must not be delivered to the client before acceptance. Hiding it in the UI is not enough, so this needs server-side authorisation.
- No live locations.

## Joining: host approval (decided by Bregy)

- The button reads **"Teilnahme anfragen"** (request to join) instead of "Bin dabei". The request can include an optional short message.
- The host gets a notification, e.g. "Timmy möchte mit dir etwas unternehmen", and accepts or declines. Hosts should actively decline rather than let requests expire.
- Requests have a **visible expiry** and lapse automatically. Spontaneous and long-planned plans need different expiry times *(proposal)*.
- States: "Angefragt" → "Angenommen" / "Abgelehnt" / "Abgelaufen" / "Gruppe inzwischen voll".
  - Only "Angenommen" takes a seat and unlocks the meeting point and the group chat.
  - Open requests do not take a seat.
- **When the last seat is taken**, open requests end with "Die Gruppe ist inzwischen voll". This is not a personal rejection and does not affect the profile. Next comes "Ähnlichen Plan erstellen", which copies the idea and category; date, host and meeting point must be set again.
- **Full plans disappear from the feed.**
- Someone may have several requests open at once. The app warns about time overlaps, shows whether the overlapping plan is requested or confirmed, and still allows the request. This overlap warning was built and Bregy liked it.
- If both overlapping requests are accepted, the app shows both and suggests which one to cancel. It never cancels automatically.
- Cancelling asks for confirmation ("Teilnahme wirklich absagen?") and shows any deposit consequence before the user confirms.
- Creating a plan needs a start time and an **expected end time**. The overlap check does not count travel time.

## Profiles

- Profiles can be viewed **in context**:
  - the host's profile before you send a request;
  - the requester's profile when the host decides;
  - group members' profiles after acceptance.
  
  There is no searchable people directory *(proposal, accepted)*.
- Layout: a large photo with name, first name and age, like Bumble.
- ChatGPT's concern: hosts may choose by looks. It suggested showing the request message, interests and reliability first, with the photo secondary. Bregy's view: people choose who they feel comfortable with, and that is legitimate.
- Do not ask about or filter by political views.

## Onboarding (modelled on Bumble, adapted)

1. Phone number with country code, then "Code senden", then enter the SMS code. An SMS proves access to the number, not identity.
2. First name and date of birth. Users must be 18+. The full birth date stays private. Correcting a typo later goes through a controlled process instead of "never changeable" *(proposal)*.
3. Coarse region, e.g. "Wo möchtest du etwas unternehmen?" with Brig, Visp, Naters or a search. Entering it manually is enough at first; location permission can come later as an optional help.
4. Up to **5 interests** from a **curated list** with search and categories. The search finds existing interests only, so free text cannot create tags like "Seex". Missing interests can be suggested for review.
5. **3 mandatory photos**: a clear portrait, an activity photo and one more recognisable photo. Bregy wants them; ChatGPT treats this as a hypothesis to test and notes that photos are not verification.
6. Confirm the community rules.
7. Discover plans.

Dropped from Bumble's flow: religion, gender, wanting children, smoking/drinking, ad tracking and partner tracking. Email is not required at start; it can be added later for account recovery.

Notifications are asked for at the moment they make sense, e.g. after the first join request ("Sollen wir dich informieren, wenn deine Anfrage bestätigt wird?"), with "Nicht jetzt".

## Community rules

ChatGPT revised them to **9 rules**; the text is not in the share.
- Consensual flirting is fine, but the app is not a flirting platform.
- No sexual harassment, racism, hate, harassment or selling.
- Partner events would need an explicit exception to "no selling": labelled, with transparent costs.
- The rules must stay reachable from the profile later. Report reasons were adapted to match.

## Reliability, deposit, cancellations

- A **CHF 5 deposit** for no-shows, and for hosts who cancel without good reason. Bregy thinks CHF 5 is little even when there is a good reason.
- Proof of attendance *(proposal)*:
  - Participants confirm independently who was there.
  - Contradictions lead to a review instead of an automatic penalty, and the person can object.
  - In the first pilot, record attendance manually and charge no automatic CHF 5.
- **Still to decide:** the free-cancellation deadline (until when is cancelling free, from when does the CHF 5 apply), who holds the money, and when it is refunded.
- **Host cancels:** everyone is notified and gets any deposit back.
  - Bregy suggested making all remaining participants hosts. ChatGPT suggested instead asking "Wer möchte übernehmen?" so one person takes over explicitly.
  - If nobody takes over, the group decides.
- **Meeting-point change:**
  - It uses a "Treffpunkt ändern" button, and all accepted participants are notified.
  - A highlighted chat message shows the old and new location, and participants confirm with "Gesehen".
  - The host sees who hasn't seen it, and participants can cancel without penalty after a significant change.
  - *(proposal)* No normal changes within 2 h of the start; after that the group must agree.

## Pilot (organisational, partly out of scope for the app)

- Start in Brig.
- Pick about **10 initial hosts** from the first sign-ups.
- Coordinate the first meetings in the same week.
- Groups of at most 6.
- A first-activity idea: a walk followed by a drink.
- Bregy wanted real meetings rather than test users, then clarified that the current focus is the prototype only.
- Reports need a named responsible person, even during the pilot. Who handles reports is still open.
- Against an empty feed: partner organisations such as bars, bouldering gyms and bands could create plans, e.g. "Spieleabend im Dölaplace in Brig".

## Wording

- Use consistently: "Plan", "Teilnahme anfragen", "Gastgeber" (host), "freier Platz" (free seat).
- Avoid "Slot", which is ambiguous.
- Plan titles must say the concrete activity, e.g. "Bouldern in kleiner Runde" rather than just a slogan. A creative tagline can be added on top.
- The prototype is mobile-first, and a desktop version is not planned.
