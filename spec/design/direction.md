# Design direction — TOGETHER

**Decided by:** the boss (2026-11-08). The look comes from the ChatGPT prototype ("TOGETHER-Oberfläche erstellen"); buttons and UX are agreed now, and later changes (e.g. by Romi) are visual only.

## Brand personality

- **Warm and welcoming:** feels like being invited by a neighbour, not like signing up for a service.
- **Trustworthy and calm:** clear and honest; safety is felt, not shouted.
- **Local and down-to-earth:** from locals for locals; no big-company gloss.
- **Light and playful:** a bit of humour and lightness, because activities are fun.

Never: like a dating app (`vision.md` → Non-goals), like a big corporate service, or like a feed built to keep people scrolling (`vision.md` → Principles).

## Tone of voice

- **German (source):** *du*. Short sentences, plain words, friendly. Light humour where nothing is at stake; calm, clear and serious around safety, cancellations, reports and account deletion.
- **French:** [NEEDS DECISION: French form of address — options: A) tu, B) vous — recommended: A, because it matches the German du and the local, informal personality]
- **English:** informal, matching the German tone.

Illustrative lines (from the prototype, not final copy): "Ein Anfang. Gute Gesellschaft." · "Wo möchtest du etwas unternehmen?" · "Die Gruppe ist inzwischen voll."

## Look and feel

As in the ChatGPT prototype (details in `notes/chatgpt-prototype-chat.md` → Visuals):

- **Colour mood:** the later phone previews are dark: near-black, slightly green-tinted surfaces, muted dark-green cards and input fields, and one bright lime (yellow-green) accent for primary actions. An earlier screen of the prototype is light: warm off-white background, near-black text and black primary buttons.
- **Typography mood:** bold, heavy sans-serif headlines as short two-line statements; plain, readable sans-serif body text.
- **Shapes:** rounded buttons, inputs and cards; full-width primary buttons with an arrow.
- **Imagery:** real photos of people and activities: candid, natural daylight, local settings (mountains, lakes, climbing gyms, cafés), like the prototype's sample photos. Profiles show a large photo with first name and age; the feed shows plans as full-height cards.
- **Onboarding:** one step per screen with a segmented progress bar ("Schritt 1 von 5").
- **Platforms:** one shared brand look on iOS and Android; platform conventions only where users expect them (back gesture, share sheet, system permission dialogs).
- **Light and dark mode:** both, following the system setting: the dark look with lime, and the warm light look of the earlier prototype screen.

## References

| Reference | What we take | What we avoid |
|---|---|---|
| ChatGPT prototype "TOGETHER-Oberfläche erstellen" (https://chatgpt.com/s/cx_6adc77fd9fe48191a8f002d9346fd4f4) | Colours, the dark look with the lime accent, bold headlines, the onboarding layout and wording | — |
| Bumble | Onboarding order (phone → name and birth date → interests → photos → rules); profile with a large photo, first name and age | Dating fields (gender, religion, children, smoking), ad-tracking consent, a location prompt at the start |
| Instagram Reels | Plans as full-height cards in the feed | Endless scrolling for its own sake |
| Discord | Adding friends by name + ID | — |

## Accessibility

Level: see `constitution.md`. Design musts:

- Text and the lime accent meet contrast requirements on the dark surfaces, in every state.
- Text scales with the system text size without breaking layouts.
- Touch targets are large enough for use on the go.
- Colour is never the only signal: request states (requested, accepted, declined, expired, group full) and the trust label always carry words, and icons where useful.
- Motion respects the system's reduced-motion setting.
- Every control and photo has a screen-reader label.

## Brand assets

- **Colours and fonts:** from the ChatGPT prototype; exact values go into `design/tokens.md`. [NEEDS DECISION: Where do the exact colour and font values come from? — options: A) the downloaded prototype source, added to `notes/`, B) measured from screenshots — recommended: A, because measured values drift and the font name can't be read from a screenshot]
- **Logo and app icon:** [NEEDS DECISION: Who makes the logo and the app icon, and by when? — options: A) Romi, before the pilot, B) a simple wordmark for the pilot, a logo by Romi later — recommended: A, because the app icon is needed for the store listings]
