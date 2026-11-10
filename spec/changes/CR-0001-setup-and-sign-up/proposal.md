# CR-0001 Project setup and sign-up

- **Type:** baseline · **Status:** in-progress · **Opened:** 2026-11-11
- **Intent:** Set up the project so it runs locally with one command, and let a person sign up and sign in.

## Why

Nothing is built yet. The boss wants a local prototype first (milestone M0), started from the repository with hot reload and openable in the browser (boss, 2026-11-10). Sign-up is the first step of J-01 and the smallest thing that can be run and clicked through end to end.

## Scope

- **The project:** the monorepo with `app/`, `server/`, `api/` and `deploy/` (ADR-0012); one root command that starts PostgreSQL in Docker, the Go server with reload on save and the Expo dev server with hot reload for the browser and the emulator (ADR-0009, ADR-0012); the OpenAPI file with the generated Go server stubs and the typed client (ADR-0004); database migrations; i18n with German texts (ADR-0007); the test setup with a first smoke flow (ADR-0008); the pipeline as a `.gitlab-ci.yml` run locally; the commands in the project `CLAUDE.md` and the `README.md`.
- **The app shell:** the three tabs Entdecken, Meine Pläne and Profil in the brand look, light and dark, each with a bare placeholder until its area is built.
- **Sign-up and sign-in:** every requirement listed in `delta.md`: phone number, login code, first name and age check, home region, interests, photos, Spielregeln, finishing, resuming an unfinished sign-up, going back without losing input, and signing in again as an existing member with a device session (ADR-0005).
- **Login codes without SMS for now:** the server does the real code work (six digits, expiry, attempt and resend limits), but no SMS is sent: the development sender writes the code to the server log, and a development switch lets any code pass (boss, 2026-11-10 and 2026-11-11; ADR-0011). Neither may be active in production (NFR-SEC-004 guards the sender; the switch gets the same guard).
- **Photos:** the app converts to JPEG before upload; the server re-encodes and stores them without metadata (NFR-PRIV-003; `tech/architecture.md` → Storage).
- **Client and server split:** each task names what runs on the phone and what on the server (`tech/architecture.md` → Client and server split).

## Out of scope

- Sending real SMS through ASPSMS: when the account exists (ADR-0011).
- Asking for notifications (ONB-019, ONB-024), store reviewer access (ONB-021), bans (ONB-022, ONB-025) and deleting abandoned sign-ups (ONB-023): with the areas they belong to (NOTIF, ADM) or a later round.
- The standalone Spielregeln screen (MOD-008) and everything else in MOD, PROF, PLAN, FEED, JOIN, CAL, CHAT, FRND, TRUST, NOTIF, ADM and SET. The sign-up shows the six rules with the texts of MOD-008.
- Push notifications, the WebSocket, the map, over-the-air updates, store builds, signing and any deployment to a server: later rounds; M0 runs locally only.
- French and English texts: German only at first (`constitution.md`).
- NFR-PRIV-001 (stored personal data in Switzerland): nothing is stored on a server in this round, so it cannot be checked; it returns with the round that first deploys (boss, 2026-11-11).

## Affected

- **Areas and IDs:** ONB-001 … ONB-018, ONB-020; NFR-ACC-001, NFR-INTL-001, NFR-PRIV-002, NFR-PRIV-003, NFR-SEC-001 … NFR-SEC-004
- **Screens, ADRs, journeys:** SCR-onb-phone, SCR-onb-code, SCR-onb-about, SCR-onb-age-stop, SCR-onb-interests, SCR-onb-photos, SCR-onb-rules; ADR-0001, ADR-0003, ADR-0004, ADR-0005, ADR-0007, ADR-0008, ADR-0009, ADR-0011, ADR-0012; J-01 steps 1 to 3

## Regression guards

- None: this is the first baseline; nothing is implemented yet.

## Impact

- **How scanned:** 2026-11-11; searched the repository outside `spec/` and `.git` for `@spec` and `spec:` tags.
- **Code:** none exists; the repository holds only `spec/`, `notes/`, `CLAUDE.md` and `README.md`.
- **Tests to change or delete:** none.
- **Spec references:** `product/onboarding.md`, `product/nfr.md`, `design/screens.md` (the seven sign-up screens), `design/tokens.md`, `product/safety.md` → MOD-008 (the rule texts), `product/journeys.md` → J-01.
- **Not covered by the scan:** nothing; there is no code yet.

## Risks

- **Design gaps:** the daylight colours for input fields and lines, shadows, animation timing, and the wordmark and icon files are still missing from Romi. Decision (boss, 2026-11-11): build with clearly marked placeholders — the darker grey (`nebel-hell`) for daylight borders, no shadows, standard timing, the wordmark drawn from the Fraunces font — and replace them when Romi delivers.
- **Placeholders that must not ship:** the legal texts (terms of use, privacy policy) are placeholder texts until the template versions exist (`app.md` → Legal); the development sender and the any-code switch must stay out of production.
- **Dependencies outside the slice:** ONB-007 and ONB-018 end on Entdecken, which is a bare placeholder until FEED is built; ONB-016 uses the rule texts of MOD-008 without its standalone screen.
- **Seed data:** the home-region search needs the official list of Swiss municipalities (Federal Statistical Office), loaded as seed data; the interests start with ten general activities as seed data, changeable later in the admin tools (ADM-011): Outdoor, Sport, Kultur, Spiele, Essen und Trinken, Musik, Kreativ, Ausgang, Wellness, Lernen (boss, 2026-11-11).
- **Tool versions:** `oapi-codegen` needs a current Go version and its three parts upgraded together; the MapLibre and Expo versions are confirmed at setup (`tech/architecture.md` → Approved libraries).

## History

- 2026-11-11 drafted
- 2026-11-11 amended during planning, approved by the boss: NFR-PRIV-001 moved out of scope to the first deployment round
- 2026-11-11 approved by the boss, with the ten starter interests, placeholders for the open design values, and login codes that are checked but not sent
- 2026-11-11 in progress
