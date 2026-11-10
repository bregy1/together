# Tasks — CR-0001 Project setup and sign-up

> Derived from `proposal.md` and `delta.md` by `/spec-plan` on 2026-11-11. Disposable: behaviour changes only in the spec, never here. A ticked box is a claim; `/spec-verify` decides what is done.

**Scope:** ONB-001 … ONB-018, ONB-020; NFR-ACC-001, NFR-INTL-001, NFR-PRIV-002, NFR-PRIV-003, NFR-SEC-001 … NFR-SEC-004 · **Waves:** 6 · **Specialists:** backend-developer ×5, expo-react-native-expert ×6, devops-engineer, api-designer, ui-designer, postgres-pro, auth-integration-engineer, test-automator ×2, security-auditor, manager (verify)
**Dispatch:** every task that writes code or tests runs as a subagent on Opus (boss, 2026-11-11); the manager briefs, runs the tests and checks each result.
**Client and server split:** the server decides access, limits and what is stored; the app does layout, input checks that only save a round trip, photo preparation and keeping entered data. Each task says which side it is.
**Libraries:** only what an accepted ADR or *Approved libraries* names, plus official Expo SDK packages under ADR-0003 (`expo-router`, `expo-secure-store`, `expo-image-picker`, `expo-localization`, `expo-font`, `react-native-svg`). No other package is added without asking: no state or form library, no date-picker package (the birth date is three number fields), no icon set (the few icons are drawn with `react-native-svg`), and the root command is a small Node script of our own.
**Prerequisites (checked on the boss's Windows machine, 2026-11-11):** Go is 1.22 in a 32-bit build, too old for `oapi-codegen` and `air` (a current 64-bit Go is needed); Docker is not installed (needed for PostgreSQL, ADR-0012); the Android SDK and emulator are not installed (the browser preview works without them); Node is 25, not a long-term-support version. T01, T03, T07 and every server task wait for Go and Docker; T17 waits for the emulator.
**Rules for every task (boss, 2026-11-11):** npm is always run with `--ignore-scripts`, and the repository carries `ignore-scripts=true` in its `.npmrc` files; no `npx` of packages that are not project dependencies; the new 64-bit Go is at `C:\Program Files\Go\bin` and must be used ahead of the old one on the PATH; nothing is pushed. Docker and the Android emulator come later: tests that need PostgreSQL are skipped with a clear message while no database is configured and are listed as not run; the app is checked in the browser at phone size first.
**Risks:**
- Expo SDK 58, `oapi-codegen` and their Go and Node versions are confirmed in T01 and T02; a version problem there blocks everything after.
- Maestro on Windows may need WSL; if it does not run locally, T17 falls back to the Mac or is reported as blocked.
- App tasks test against a mocked API client; the real app-to-server path is proven only in T17.
- All German texts are drafts by T06 from the spec and the mockups; the boss and Romi review them on screen.
- Design placeholders (daylight borders, no shadows, standard timing, wordmark from the font) are marked in code so they can be found and replaced.

## Wave 1

- [ ] **CR-0001.T01 [ADR-0004, ADR-0012]** Server skeleton
  - **Goal:** a Go service in `server/` that starts, connects to PostgreSQL, answers a health check, and has ent, Atlas migrations, configuration from the environment and the Go test setup in place (server side).
  - **Covers:** ADR-0004, ADR-0012 (groundwork)
  - **Tests:** written first in this task (health check, configuration, database connection)
  - **Touches:** `server/`, `api/openapi.yaml` (health only), `server/.air.toml` (likely)
  - **Specialist:** backend-developer
  - **Depends on:** —
  - **Done when:** `go test ./...` passes against a local PostgreSQL; `go vet` and `gofmt` are clean; the server starts and `/healthz` answers; Go and tool versions are written into `server/README.md`

- [ ] **CR-0001.T02 [ADR-0003, ADR-0007, ADR-0009, NFR-INTL-001]** App skeleton and shell
  - **Goal:** an Expo SDK 58 app in `app/` with file-based routing, the three tabs as bare placeholders, the brand theme in light and dark from `spec/design/brand/tokens.json`, the brand fonts, i18n with a German resource file, an API client wrapper with session storage (secure storage on the phone, a development stand-in on the web), and the Jest setup (client side).
  - **Covers:** NFR-INTL-001.S1, NFR-INTL-001.S2
  - **Tests:** written first in this task (a check that fails on hard-coded user-facing text; a test that adding a French resource switches the language without a code change; the shell renders in both looks)
  - **Touches:** `app/` (all new), copies of the fonts from `spec/design/brand/fonts/`
  - **Specialist:** expo-react-native-expert
  - **Depends on:** —
  - **Done when:** tests tagged `@spec NFR-INTL-001.S1` and `@spec NFR-INTL-001.S2` pass; the app starts in the browser at phone size and in the Android emulator and shows the three tabs; lint is clean; design placeholders are marked

## Wave 2

- [ ] **CR-0001.T03 [ADR-0012, ADR-0008]** Dev command, database, pipeline and docs
  - **Goal:** one root command starts PostgreSQL in Docker, the server with reload on save and the app dev server; the pipeline runs locally; the commands are documented.
  - **Covers:** ADR-0012, ADR-0008 (groundwork)
  - **Tests:** the pipeline itself: lint, Go tests with PostgreSQL, app tests, OpenAPI validation
  - **Touches:** root `package.json`, `scripts/dev.mjs`, `deploy/docker-compose.yml`, `.gitlab-ci.yml`, `.gitignore`, `README.md`, `CLAUDE.md` (Commands only)
  - **Specialist:** devops-engineer
  - **Depends on:** CR-0001.T01, CR-0001.T02
  - **Done when:** the root command brings up all three and a change in `server/` or `app/` shows without a manual restart; `gitlab-ci-local` runs the pipeline green; the *Commands* section of the project `CLAUDE.md` lists install, build, test, lint and run; `air` is not in any production image

- [ ] **CR-0001.T04 [ADR-0004]** API contract for sign-up and generated code
  - **Goal:** the OpenAPI file describes every call sign-up needs (request and check a code, sign-up steps and resume, municipality search, interest list, photo upload, finish, session), with one error shape, and the Go stubs and the typed client are generated from it.
  - **Covers:** ADR-0004 (groundwork for ONB-001 … ONB-018, ONB-020)
  - **Tests:** OpenAPI validation in the pipeline; generated code compiles on both sides
  - **Touches:** `api/openapi.yaml`, `server/internal/api/` (generated), `app/src/api/generated/` (generated), generator configs
  - **Specialist:** api-designer
  - **Depends on:** CR-0001.T01
  - **Done when:** the file validates; every operation names the requirement it serves; no response that others could see carries a phone number or a birth date (NFR-PRIV-002); the code request answers the same for known and unknown numbers (NFR-SEC-003); generation is one documented command

- [ ] **CR-0001.T05 [NFR-ACC-001]** UI building blocks
  - **Goal:** the shared pieces the sign-up screens are made of, as in `design/direction.md` → UI building blocks: buttons (primary, secondary, text), chip, text field, step progress, screen frame, wordmark placeholder (client side).
  - **Covers:** NFR-ACC-001 (groundwork; its scenarios are tested in T16)
  - **Tests:** written first in this task (each block renders in both looks, has a label and a touch area of at least 44 px)
  - **Touches:** `app/src/ui/`
  - **Specialist:** expo-react-native-expert
  - **Depends on:** CR-0001.T02
  - **Done when:** the block tests pass; sizes, radii and colours come from the theme, none is typed in by hand; no hard-coded text

- [ ] **CR-0001.T06 [NFR-INTL-001]** German texts for sign-up
  - **Goal:** every `onb.*` key the in-scope requirements and screens name, the six Spielregeln with their sentences (MOD-008), the shell labels and clearly marked placeholder legal texts, in German, in the tone of `design/direction.md`.
  - **Covers:** NFR-INTL-001 (groundwork)
  - **Tests:** a test that every key named in `product/onboarding.md` and the seven sign-up screens exists in the German file
  - **Touches:** `app/src/i18n/locales/de.json`, `app/src/i18n/legal/` (placeholders)
  - **Specialist:** ui-designer
  - **Depends on:** CR-0001.T02
  - **Done when:** the key test passes; texts use the glossary terms; texts stay within the GSM-7 character set where they are sent by SMS; the legal texts are marked as placeholders

## Wave 3

- [ ] **CR-0001.T07 [ADR-0004, ADR-0005]** Data model and seed data
  - **Goal:** tables and migrations for members and unfinished sign-ups, login-code challenges, device sessions, municipalities, activities, a member's interests and photos; seed data: the official Swiss municipalities and the ten starter interests (server side).
  - **Covers:** ADR-0004, ADR-0005 (groundwork for ONB-003 … ONB-018)
  - **Tests:** written first in this task (migrations apply to an empty database and roll forward cleanly; seeds load; constraints hold, e.g. one account per phone number, at most five interests, at most four photos)
  - **Touches:** `server/ent/schema/`, `server/migrations/`, `server/seed/`
  - **Specialist:** postgres-pro
  - **Depends on:** CR-0001.T01, CR-0001.T04
  - **Done when:** the migration tests pass; phone numbers are stored in E.164 and codes only as hashes (ADR-0005); the source and date of the municipality list are noted

- [ ] **CR-0001.T08 [ADR-0004, ADR-0005]** Server wiring
  - **Goal:** the generated server interface is mounted on the standard router with request validation and the session check, and each area (login, sign-up, photos) has its own handler file that answers "not implemented" until its task fills it (server side).
  - **Covers:** ADR-0004, ADR-0005 (groundwork)
  - **Tests:** written first in this task (invalid requests are refused by validation; calls without a session are refused where a session is needed)
  - **Touches:** `server/internal/api/` (wiring), `server/internal/login/handlers.go`, `server/internal/signup/handlers.go`, `server/internal/photos/handlers.go`
  - **Specialist:** backend-developer
  - **Depends on:** CR-0001.T04
  - **Done when:** the wiring tests pass; the generator, its runtime and the validation middleware are on matching versions

- [ ] **CR-0001.T09 [ONB-001 … ONB-007]** App: phone number and code screens
  - **Goal:** SCR-onb-phone and SCR-onb-code with all their states, the resend countdown, changing the number, and landing on the next step or on Entdecken for an existing member (client side; the server decides whether a number or code is valid, the app only checks the format to save a round trip).
  - **Covers:** ONB-001.S1, ONB-001.S2, ONB-002.S1, ONB-002.S2, ONB-003.S1, ONB-003.S2, ONB-004.S1, ONB-004.S2, ONB-004.S3, ONB-005.S1, ONB-006.S1, ONB-007.S1
  - **Tests:** written first in this task, against a mocked API client
  - **Touches:** `app/app/(onboarding)/phone.tsx`, `app/app/(onboarding)/code.tsx`, `app/src/features/login/`
  - **Specialist:** expo-react-native-expert
  - **Depends on:** CR-0001.T04, CR-0001.T05, CR-0001.T06
  - **Done when:** a test tagged `@spec` exists and passes for each covered scenario; the states of both screens in `design/screens.md` are built except "banned" (ONB-022 is out of scope); no hard-coded text

- [ ] **CR-0001.T10 [ONB-008 … ONB-013, ONB-020]** App: about you, age stop and interests
  - **Goal:** SCR-onb-about, SCR-onb-age-stop and SCR-onb-interests with all their states, the age confirmation, the municipality and interest search, and the sign-up state that survives going back and reopening the app (client side keeps what was typed; the server holds the unfinished sign-up).
  - **Covers:** ONB-008.S1, ONB-009.S1, ONB-009.S2, ONB-009.S3, ONB-010.S1, ONB-010.S2, ONB-011.S1, ONB-011.S2, ONB-012.S1, ONB-012.S2, ONB-012.S3, ONB-013.S1, ONB-013.S2, ONB-013.S3, ONB-020.S1
  - **Tests:** written first in this task, against a mocked API client
  - **Touches:** `app/app/(onboarding)/about.tsx`, `app/app/(onboarding)/age-stop.tsx`, `app/app/(onboarding)/interests.tsx`, `app/src/features/signup/`
  - **Specialist:** expo-react-native-expert
  - **Depends on:** CR-0001.T04, CR-0001.T05, CR-0001.T06
  - **Done when:** a test tagged `@spec` exists and passes for each covered scenario; the birth date is three number fields that work in the browser and on the phone; no hard-coded text

## Wave 4

- [ ] **CR-0001.T11 [ONB-002, ONB-003, ONB-004, ONB-005, ONB-007, NFR-SEC-001 … NFR-SEC-004]** Server: login codes and sessions
  - **Goal:** request and check login codes with their limits, a sender interface with the development sender that writes the code to the log, the development switch that lets any code pass, the guard that stops a production start with either enabled, and device sessions (server side).
  - **Covers:** ONB-003.S3, ONB-005.S2, NFR-SEC-001.S1, NFR-SEC-001.S2, NFR-SEC-002.S1, NFR-SEC-002.S2, NFR-SEC-003.S1, NFR-SEC-004.S1
  - **Tests:** written first in this task (API level, with the any-code switch off for the code rules and on for its own test)
  - **Touches:** `server/internal/login/`
  - **Specialist:** auth-integration-engineer
  - **Depends on:** CR-0001.T07, CR-0001.T08
  - **Done when:** a test tagged `@spec` exists and passes for each covered scenario; only Swiss mobile numbers are accepted; no code or session token is ever logged except by the development sender; the full suite is green

- [ ] **CR-0001.T12 [ONB-008 … ONB-013, ONB-016, ONB-018, ONB-020, NFR-PRIV-002]** Server: sign-up steps
  - **Goal:** save and resume the sign-up steps, check first name, age, region and interests, delete everything at the age stop, search municipalities, list interests, record the acceptance of the terms and Spielregeln, and finish the account (server side).
  - **Covers:** ONB-008.S2, ONB-010.S3, ONB-010.S4, NFR-PRIV-002.S1
  - **Tests:** written first in this task (API level)
  - **Touches:** `server/internal/signup/`
  - **Specialist:** backend-developer
  - **Depends on:** CR-0001.T07, CR-0001.T08
  - **Done when:** a test tagged `@spec` exists and passes for each covered scenario; every rule the app checks is checked again on the server; the full suite is green

- [ ] **CR-0001.T13 [ONB-014, NFR-PRIV-003]** Server: photo upload
  - **Goal:** accept a JPEG or PNG, enforce the size and pixel limits, apply the orientation, resize to 1600 px and 400 px, re-encode without metadata, store behind the storage interface and never keep the original (server side; `tech/architecture.md` → Storage).
  - **Covers:** ONB-014.S3, NFR-PRIV-003.S1
  - **Tests:** written first in this task (a photo with GPS data comes out without any metadata segment; oversized, non-image and too-many-pixel files are refused)
  - **Touches:** `server/internal/photos/`, `server/internal/storage/`
  - **Specialist:** backend-developer
  - **Depends on:** CR-0001.T07, CR-0001.T08
  - **Done when:** a test tagged `@spec` exists and passes for each covered scenario; only the standard library and `golang.org/x/image` are used; at most four photos per member; the full suite is green

- [ ] **CR-0001.T14 [ONB-014, ONB-015]** App: photos screen
  - **Goal:** SCR-onb-photos with all its states: one portrait required, up to three more, from camera or library, the denied-permission path, and each photo resized and saved as JPEG on the phone before upload (client side does the conversion; the server still strips metadata).
  - **Covers:** ONB-014.S1, ONB-014.S2, ONB-015.S1
  - **Tests:** written first in this task, against a mocked API client and a mocked picker
  - **Touches:** `app/app/(onboarding)/photos.tsx`, `app/src/features/photos/`
  - **Specialist:** expo-react-native-expert
  - **Depends on:** CR-0001.T10
  - **Done when:** a test tagged `@spec` exists and passes for each covered scenario; picking a file works in the browser preview; the permission texts are in `app.json` as `product/app.md` → Permissions says; no hard-coded text

- [ ] **CR-0001.T15 [ONB-016, ONB-017, ONB-018]** App: Spielregeln and finish
  - **Goal:** SCR-onb-rules with the six rules, the "not a dating app" line visible without scrolling, the legal texts opening and returning to the step, acceptance, finishing with the offline path, and landing on Entdecken (client side).
  - **Covers:** ONB-016.S1, ONB-016.S2, ONB-017.S1, ONB-018.S1, ONB-018.S2
  - **Tests:** written first in this task, against a mocked API client
  - **Touches:** `app/app/(onboarding)/rules.tsx`, `app/app/(onboarding)/legal.tsx`, `app/src/features/signup/finish.ts`
  - **Specialist:** expo-react-native-expert
  - **Depends on:** CR-0001.T10
  - **Done when:** a test tagged `@spec` exists and passes for each covered scenario; the Entdecken tab is still the bare placeholder; no hard-coded text

## Wave 5

- [ ] **CR-0001.T16 [NFR-ACC-001]** Accessibility tests for the shell and sign-up
  - **Goal:** automated proof of the accessibility bar on every screen built in this round.
  - **Covers:** NFR-ACC-001.S1, NFR-ACC-001.S2, NFR-ACC-001.S3
  - **Tests:** this task writes them: every screen at the largest text size keeps its actions reachable; every control and photo has a label, in a sensible order; every text and control pair of the theme meets its contrast in both looks
  - **Touches:** `app/src/__tests__/accessibility/`
  - **Specialist:** test-automator
  - **Depends on:** CR-0001.T09, CR-0001.T10, CR-0001.T14, CR-0001.T15
  - **Done when:** tests tagged `@spec NFR-ACC-001.S1` to `.S3` pass; the two pairs already known to fail (`design/tokens.md`: input border, switch) are listed as known findings for Romi, not hidden

- [ ] **CR-0001.T17 [ADR-0008]** End-to-end sign-up
  - **Goal:** one Maestro flow that signs up a new person against the real local server, from the phone number to Entdecken, and one that signs the same member in again.
  - **Covers:** ADR-0008 (the smoke flow; J-01 steps 1 to 3)
  - **Tests:** this task writes them
  - **Touches:** `app/.maestro/`
  - **Specialist:** test-automator
  - **Depends on:** CR-0001.T11, CR-0001.T12, CR-0001.T13, CR-0001.T14, CR-0001.T15, CR-0001.T03
  - **Done when:** both flows pass on the Android emulator with the root command running; how to run them (also on the Mac for iOS) is in the `README.md`

- [ ] **CR-0001.T18 [ADR-0005, NFR-SEC-001 … NFR-SEC-004]** Security review of login
  - **Goal:** an independent, read-only review of the code flow, the limits, the session handling and the development switches.
  - **Covers:** ADR-0005 (the review it calls for)
  - **Tests:** none; findings become fix tasks
  - **Touches:** nothing (read-only)
  - **Specialist:** security-auditor
  - **Depends on:** CR-0001.T11, CR-0001.T12, CR-0001.T13
  - **Done when:** the findings are reported, ranked by severity, each with a concrete fix; every high or medium finding is a fix task or a question for the boss

## Wave 6 (final)

- [ ] **CR-0001.T19 [ONB-001 … ONB-018, ONB-020, NFR-ACC-001, NFR-INTL-001, NFR-PRIV-002, NFR-PRIV-003, NFR-SEC-001 … NFR-SEC-004]** Verify
  - **Specialist:** manager
  - **Depends on:** all other tasks, including fix rounds
  - **Done when:** `/spec-verify CR-0001` reports `converged`

## Fix tasks (from /spec-verify)

<!-- /spec-verify appends "### Fix round N — /spec-verify YYYY-MM-DD" with tasks in the same shape,
     plus a "**Gap:**" line (missing | partial | contradicts | unrequested — file:line — one line). -->

## Verify log

<!-- /spec-verify appends one line per run; /spec-close reads the last one. Never edit past lines. -->
