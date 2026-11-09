# Brand files

Romi's brand for Yaruno, kept next to the spec and, once the app exists, next to the code. The content of the guide is merged into `../direction.md` (rules) and `../tokens.md` (values, the source of truth); this folder holds the files themselves.

| File | What it is | Source |
|---|---|---|
| `Yaruno_Brand_Guide_v1.0.pdf` | The brand guide, 16 pages | Romi, November 2026; added 2026-11-09 |
| `tokens.css` | The design tokens as CSS, exactly as on page 16 of the guide | Transcribed 2026-11-09 |
| `tokens.json` | All tokens (palette, dark and light roles, typography, spacing, radii, sizes) in the W3C Design Tokens format, for generating the app theme | Generated from `../tokens.md`, 2026-11-09 |
| `fonts/Archivo-VariableFont_wdth,wght.ttf` | Archivo, variable (width 62–125 %, weight 100–900): everything in the app | Official Google Fonts repository (`google/fonts`, `ofl/archivo`), downloaded 2026-11-09 |
| `fonts/Archivo-Italic-VariableFont_wdth,wght.ttf` | Archivo italic, variable: quotes only | Same |
| `fonts/Fraunces-VariableFont_SOFT,WONK,opsz,wght.ttf` | Fraunces, variable: the wordmark and the short mark only (weight 900, SOFT 100, opsz 144) | Official Google Fonts repository (`ofl/fraunces`), downloaded 2026-11-09 |
| `fonts/OFL-Archivo.txt`, `fonts/OFL-Fraunces.txt` | The licences: SIL Open Font License 1.1, free to use and to embed in the app | Same |

If `tokens.md` changes, `tokens.json` (and, for Romi's own values, `tokens.css`) are updated in the same commit.

## Still missing

The guide lists these files (page 16), but the PDF contains no embedded images or font files: the logo is drawn as vector shapes inside the page, so it cannot be exported cleanly from it. They have to come from Romi.

- Wordmark as SVG in four variants (primary, on Mint, on light, single colour) and as PNG, 2000 px wide
- Short mark ("y" with the dot) as SVG
- App icons as PNG, 1024 × 1024 px, in the Nacht and the Mint variant
- Click prototype v1 (eight screens), the colour, type and logo canvases, and the research document "Yaruno – Recherche & Strategie"

When the app project is set up (first baseline change request), the icons, the wordmark and the fonts are copied into the app's asset folder, and the app theme is generated from `tokens.json`.
