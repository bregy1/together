# Yaruno app

Expo SDK 58 (React Native 0.88, React 19.3, TypeScript 6.0) with Expo Router, i18next and Jest. See `../spec/tech/architecture.md` and ADR-0003, ADR-0007, ADR-0008, ADR-0009.

## Requirements

- Node.js 22.13+ (22 line), 24.3+ (24 line) or 26+. Odd releases (23, 25) are not supported by Expo SDK 58.
- npm always runs without install scripts (`.npmrc` sets `ignore-scripts=true`; pass `--ignore-scripts` as well).

## Commands

Run from this folder.

| Task | Command |
|---|---|
| Install | `npm install --ignore-scripts` |
| Start in the browser (development preview only, ADR-0009) | `npm run web`, then open the shown address with the browser's device toolbar at phone size |
| Tests | `npm test` |
| Type check | `npm run typecheck` |
| Regenerate the theme after `spec/design/brand/tokens.json` changes | `npm run generate:theme` |
| Regenerate the API types after `../api/openapi.yaml` changes | `npm run generate:api` (writes `src/api/generated/schema.ts`; use it with `openapi-fetch`) |

## Layout

- `src/app/`: routes (Expo Router). Tabs: Entdecken (`index`), Meine Pläne (`my-plans`), Profil (`profile`).
- `src/theme/`: `tokens.generated.ts` is generated from `spec/design/brand/tokens.json` and checked in; `index.ts` builds the dark and daylight looks. Search for `PLACEHOLDER(design)` to find values that wait for the designer.
- `src/i18n/`: every JSON file in `locales/` is a language; German (`de.json`) is the source. Adding `fr.json` is enough to ship French.
- `src/session/`: the session token store; `sessionStore.ts` (iOS, Android: expo-secure-store) and `sessionStore.web.ts` (browser preview, development only).
- `src/api/client.ts`: where the base URL (`EXPO_PUBLIC_API_BASE_URL`) and the session token are attached.
- `assets/fonts/`: Archivo and Fraunces, copied from `spec/design/brand/fonts/` (SIL Open Font License 1.1).
