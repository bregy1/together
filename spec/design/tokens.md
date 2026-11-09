# Design tokens

- **Source:** Romi, "Yaruno Brand Guide v1.0" (November 2026), `design/brand/Yaruno_Brand_Guide_v1.0.pdf`, pages 7–11 and 16 · **Received:** 2026-11-09
- Brand values (colours, fonts, logo) come from the designer or the boss's explicit choice, never invented. A missing one stays `[NEEDS DECISION: … — waiting for the designer]`.
- Token names are the designer's (`--nacht`, `--eis` …, guide p.16). The rules for using them are in `direction.md`.

## Colour: palette "Gletscher"

| Token | Value | Role (guide) |
|---|---|---|
| `nacht` | #0F1412 | Ground, 60 % |
| `eis` | #E8EEEA | Text and wordmark, 30 % |
| `mint` | #7CF5C0 | The only accent, 10 %; a surface with `nacht` text |
| `gletscherblau` | #1D3A3F | Image areas, secondary surfaces |
| `nebel` | #9BB0AC | Secondary text, inactive icons |
| `schiefer` | #17201D | Cards, input fields |
| `linie` | #2A3733 | Lines and dividers |
| `senf` | #F4C542 | Status: warning |
| `koralle` | #FF8A80 | Status: error |
| `moos` | #5F6E52 | Image placeholders |
| `schiefer-blau` | #3C4A5E | Image placeholders |
| `nebel-hell` | #56635F | Secondary text on light ("on light, Nebel becomes #56635F") |
| `weiss` | #FFFFFF | Cards in the daylight variant |

Status colours: success `mint`, warning `senf`, error `koralle`, hint `nebel`; always with an icon or a word, never colour alone.

### Roles in the dark (default) and daylight variants

| Role | Dark (default) | Daylight |
|---|---|---|
| Background | `nacht` | `eis` |
| Cards | `schiefer` | `weiss` |
| Text | `eis` | `nacht` |
| Secondary text | `nebel` | `nebel-hell` |
| Secondary surfaces, image areas | `gletscherblau` | `gletscherblau` |
| Accent (surface, `nacht` text on it) | `mint` | `mint` |
| Mint as text | allowed on `nacht` for headlines from 20 px and single words in the claim | never |
| Input fields | `schiefer` with a `linie` border | [NEEDS DECISION: input fields in the daylight variant — waiting for the designer] |
| Lines and dividers | `linie` | [NEEDS DECISION: line colour in the daylight variant — waiting for the designer] |

Contrast (checked 2026-11-09 with the WCAG 2.2 formula against NFR-ACC-001; all of the guide's own values confirmed):

| Pair | Ratio | Use | Result |
|---|---|---|---|
| `eis` on `nacht` | 15.8 | text, wordmark | pass |
| `nebel` on `nacht` | 8.1 | secondary text | pass |
| `nacht` on `mint` | 13.9 | buttons, tags | pass |
| `mint` on `nacht` | 13.9 | headline words, the dot | pass |
| `eis` on `gletscherblau` | 10.3 | text on image areas | pass |
| `eis` on `schiefer` | 14.2 | cards | pass |
| `nebel` on `schiefer` | 7.3 | card meta | pass |
| `nacht` on `eis` | 15.8 | daylight text | pass |
| `nebel-hell` on `eis` | 5.3 | daylight secondary text | pass |
| `nacht` on `weiss` | 18.6 | daylight cards | pass |
| `nebel-hell` on `weiss` | 6.3 | daylight card meta | pass |
| `nacht` on `senf` | 11.4 | warning | pass |
| `nacht` on `koralle` | 8.1 | error | pass |
| `eis` on `moos` | 4.65 | placeholder text | pass |
| `eis` on `schiefer-blau` | 7.7 | placeholder text | pass |
| `mint` on `eis` | 1.1 | — | never used (guide) |
| **`linie` on `nacht`** | **1.5** | **input-field border** | **fails 3:1 (WCAG 1.4.11) where the border is what identifies the field** — for Romi |
| **`mint` knob on `eis` switch track** | **1.1** | **switch "on" state** | **fails 3:1 (WCAG 1.4.11)** — for Romi |

## Typography

Archivo for everything (Google Fonts, SIL Open Font License 1.1, variable font with a width axis 62–125 %). Fraunces (weight 900, SOFT 100, optical size 144, tracking −2 %) only in the wordmark and the short mark. System fallback: Helvetica, Arial.

| Token | Font | Size (px) / line height | Weight | Use |
|---|---|---|---|---|
| `text.hero` | Archivo | 56 / 1.0 | 700 | Hero |
| `text.h1` | Archivo | 40 / 1.02 | 700 | Headline 1 |
| `text.h2` | Archivo | 32 / 1.05 | 700 | Headline 2 |
| `text.h3` | Archivo | 24 / 1.1 | 600 | Headline 3 |
| `text.cardTitle` | Archivo | 20 / 1.1 | 600 | Card titles |
| `text.body` | Archivo | 16 / 1.5 | 400 | Body text |
| `text.small` | Archivo | 14 / 1.45 | 400 | Small text (minimum for running text) |
| `text.meta` | Archivo | 13 | 400 | Card meta, in `nebel` |
| `text.button` | Archivo | 18 | 700 | Buttons |
| `text.label` | Archivo | 11, uppercase, tracking +8 % | 600 | Labels and tags |
| `text.chip` | Archivo | — | 500 | Chips and meta |
| `text.number` | Archivo, tabular figures | — | 700 | Times and counts (05:30, 3 von 6) |

Headlines: tracking −3 %, line height 1.02, no capitals (capitals only for labels and tags). Body lines at most 70 characters.

## Spacing, radii, sizes

| Token | Value | Use |
|---|---|---|
| `space.1` … `space.7` | 4 · 8 · 12 · 16 · 20 · 24 · 32 px | 8 px grid |
| `space.page` | 20 px | Side margin of a screen |
| `radius.button` | 999 px (pill) | Buttons |
| `radius.chip` | 999 px | Chips |
| `radius.input` | 16 px | Input fields |
| `radius.card` | 24 px | Cards; image area in a card rounded 24 px at the top |
| `size.button` | 60 px (44 px small) | Button height |
| `size.chip` | 38–40 px | Chip height |
| `size.input` | 56 px | Input height |
| `size.cardImage` | 150 px | Image area at the top of a card |
| `size.touch` | 44 × 44 px minimum | Touch targets |
| `icon` | 20–24 px, 2 px stroke, round caps | Icons; never emoji |
| `elevation.*` | [NEEDS DECISION: shadows and elevation are not specified (the guide forbids shadows only on the logo) — waiting for the designer] | |
| `motion.*` | [NEEDS DECISION: animation durations and easing are not specified — waiting for the designer] | |

## Logo sizes

| Token | Value |
|---|---|
| `logo.minWidth` | 90 px on screen, 24 mm in print; below that the short mark |
| `logo.clearSpace` | the dot's diameter on every side |
| `logo.dot` | diameter 0.56 × font size, gap to the "n" 0.06 × font size, on the baseline |
| `appIcon` | 1024 × 1024 px, no rounding (the stores round); short mark fills 60 % of the edge |
