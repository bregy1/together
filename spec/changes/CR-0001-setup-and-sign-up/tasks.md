# Tasks — CR-0001 Project setup and sign-up

> Derived from `proposal.md` and `delta.md` by `/spec-plan` on 2026-11-11. Disposable: behaviour changes only in the spec, never here. A ticked box is a claim; `/spec-verify` decides what is done.

**Scope:** ONB-001 … ONB-018, ONB-020; NFR-ACC-001, NFR-INTL-001, NFR-PRIV-002, NFR-PRIV-003, NFR-SEC-001 … NFR-SEC-004 · **Waves:** 6 · **Specialists:** backend-developer ×5, expo-react-native-expert ×6, devops-engineer, api-designer, ui-designer, postgres-pro, auth-integration-engineer, test-automator ×2, security-auditor, manager (verify)
**Dispatch:** every task that writes code or tests runs as a subagent on Opus (boss, 2026-11-11); the manager briefs, runs the tests and checks each result.
**Client and server split:** the server decides access, limits and what is stored; the app does layout, input checks that only save a round trip, photo preparation and keeping entered data. Each task says which side it is.
**Libraries:** only what an accepted ADR or *Approved libraries* names, plus official Expo SDK packages under ADR-0003 (`expo-router`, `expo-secure-store`, `expo-image-picker`, `expo-localization`, `expo-font`, `react-native-svg`). No other package is added without asking: no state or form library, no date-picker package (the birth date is three number fields), no icon set (the few icons are drawn with `react-native-svg`), and the root command is a small Node script of our own.
**Prerequisites (checked on the boss's Windows machine, 2026-11-11):** Go is 1.22 in a 32-bit build, too old for `oapi-codegen` and `air` (a current 64-bit Go is needed); Docker is not installed (needed for PostgreSQL, ADR-0012); the Android SDK and emulator are not installed (the browser preview works without them); Node is 25, not a long-term-support version. T01, T03, T07 and every server task wait for Go and Docker; T17 waits for the emulator.
**Rules for every task (boss, 2026-11-11):** npm is always run with `--ignore-scripts`, and the repository carries `ignore-scripts=true` in its `.npmrc` files; no `npx` of packages that are not project dependencies; the new 64-bit Go is at `C:\Program Files\Go\bin` and must be used ahead of the old one on the PATH; nothing is pushed. No linters (boss, 2026-11-11): no ESLint, no migration lint and no lint step; the checks are the compilers and type checks, `gofmt`, and the tests, and a rule that would be a lint rule is written as a test. Docker and the Android emulator come later: tests that need PostgreSQL are skipped with a clear message while no database is configured and are listed as not run; the app is checked in the browser at phone size first.
**Risks:**
- Expo SDK 58, `oapi-codegen` and their Go and Node versions are confirmed in T01 and T02; a version problem there blocks everything after.
- Maestro on Windows may need WSL; if it does not run locally, T17 falls back to the Mac or is reported as blocked.
- App tasks test against a mocked API client; the real app-to-server path is proven only in T17.
- All German texts are drafts by T06 from the spec and the mockups; the boss and Romi review them on screen.
- Design placeholders (daylight borders, no shadows, standard timing, wordmark from the font) are marked in code so they can be found and replaced.

## Wave 1

- [x] **CR-0001.T01 [ADR-0004, ADR-0012]** Server skeleton
  - **Goal:** a Go service in `server/` that starts, connects to PostgreSQL, answers a health check, and has ent, Atlas migrations, configuration from the environment and the Go test setup in place (server side).
  - **Covers:** ADR-0004, ADR-0012 (groundwork)
  - **Tests:** written first in this task (health check, configuration, database connection)
  - **Touches:** `server/`, `api/openapi.yaml` (health only), `server/.air.toml` (likely)
  - **Specialist:** backend-developer
  - **Depends on:** —
  - **Done when:** `go test ./...` passes against a local PostgreSQL; `gofmt` is clean; the server starts and `/healthz` answers; Go and tool versions are written into `server/README.md`
  - **Result:** 2026-11-11 · `go test ./...`: 5 packages ok, 14 tests passed; `go vet` clean; committed content is `gofmt`-clean · backend-developer (Opus) · commit c0e1a46
  - **Not run here:** 2 tests that need PostgreSQL (`TestConnect_ReachesTheDatabase`, `TestHealthz_AgainstARealDatabase`) are skipped until Docker is installed; the 200 answer of `/healthz` was not seen live
  - **Deviation:** the server keeps running and answers 503 on `/healthz` while the database is unreachable, so the root command can start both together; ent code generation is switched on in T07 with the first table (ent refuses an empty schema); the Atlas command-line tool is not installed (it no longer supports `go install`), so `atlas.hcl` is unchecked until T03 provides it; `gofmt -l` lists every file on a Windows checkout because of CRLF line endings, to be fixed by a root `.gitattributes` in T03
  - **Carried into later tasks:** tests use a separate `TEST_DATABASE_URL` from T07 on, so they never wipe the development database; a development-or-production setting comes with T08 (needed for NFR-SEC-004)

- [x] **CR-0001.T02 [ADR-0003, ADR-0007, ADR-0009, NFR-INTL-001]** App skeleton and shell
  - **Goal:** an Expo SDK 58 app in `app/` with file-based routing, the three tabs as bare placeholders, the brand theme in light and dark from `spec/design/brand/tokens.json`, the brand fonts, i18n with a German resource file, an API client wrapper with session storage (secure storage on the phone, a development stand-in on the web), and the Jest setup (client side).
  - **Covers:** NFR-INTL-001.S1, NFR-INTL-001.S2
  - **Tests:** written first in this task (a check that fails on hard-coded user-facing text; a test that adding a French resource switches the language without a code change; the shell renders in both looks)
  - **Touches:** `app/` (all new), copies of the fonts from `spec/design/brand/fonts/`
  - **Specialist:** expo-react-native-expert
  - **Depends on:** —
  - **Done when:** tests tagged `@spec NFR-INTL-001.S1` and `@spec NFR-INTL-001.S2` pass; the app starts in the browser at phone size and shows the three tabs (the emulator is checked once it is installed); the TypeScript type check is clean; design placeholders are marked
  - **Result:** 2026-11-11 · `npm test`: 6 suites, 17 tests passed; `tsc --noEmit` clean; three tabs seen in the browser at phone size in both looks · expo-react-native-expert (Opus) · commit 7f13ef0
  - **Not run here:** Android emulator and iOS Simulator (not installed)
  - **Deviation:** Expo SDK 58 does not support Node 25; everything runs on Node 24.11.1, and `app/.npmrc` refuses other versions (`engine-strict`); a `+not-found` screen was added because Expo Router's built-in one has hard-coded English text; no ESLint (boss, 2026-11-11)
  - **Carried into later tasks:** the daylight input fill uses `weiss` as a marked placeholder (T05); the session token is stored for this device only (T09); the root pins Node 24 and sets the API base URL (T03); `expo-system-ui`, which Android needs to follow the dark setting, is added when the emulator is available

## Wave 2

- [x] **CR-0001.T03 [ADR-0012, ADR-0008]** Dev command, database, pipeline and docs
  - **Goal:** one root command starts PostgreSQL in Docker, the server with reload on save and the app dev server; the pipeline runs locally; the commands are documented.
  - **Covers:** ADR-0012, ADR-0008 (groundwork)
  - **Tests:** the pipeline itself: build and type checks, `gofmt`, Go tests with PostgreSQL, app tests, OpenAPI validation
  - **Touches:** root `package.json`, `scripts/dev.mjs`, `deploy/docker-compose.yml`, `.gitlab-ci.yml`, `.gitignore`, `README.md`, `CLAUDE.md` (Commands only)
  - **Specialist:** devops-engineer
  - **Depends on:** CR-0001.T01, CR-0001.T02
  - **Done when:** the root command brings up all three and a change in `server/` or `app/` shows without a manual restart; `gitlab-ci-local` runs the pipeline green; the *Commands* section of the project `CLAUDE.md` lists install, build, test, format check and run; a root `.gitattributes` keeps Go files on LF line endings and `.claude/` is ignored; `air` is not in any production image
  - **Result:** 2026-11-11 · root scripts run by the manager: `format:server` clean, `build:server` ok, `test:server` ok (5 packages); the agent ran `npm run dev` and saw server and app start together, reload on save and stop together · devops-engineer (Opus) · commit 3bebbd2
  - **Not run here:** Docker Compose (PostgreSQL, the extra databases, the Atlas service), the whole pipeline under gitlab-ci-local, the Go tests against a real database, and a real Ctrl-C; all wait for Docker
  - **Deviation:** `scripts/dev.mjs` also has a tool mode so the root Go scripts use the 64-bit Go; an init script creates the test database and a scratch database for Atlas; PostgreSQL 18.6; no format check for the app (no formatter is approved)
  - **Carried into later tasks:** the free Atlas image cannot create migrations from the ent schema, so T07 adds a small Go generator using ent and the Atlas Go library that are already dependencies; the server default `DATABASE_URL` gets the local development password (T07); the server allows the browser preview's origin in development (T08); the Android emulator needs its own API base URL (when it is installed)

- [x] **CR-0001.T04 [ADR-0004]** API contract for sign-up and generated code
  - **Goal:** the OpenAPI file describes every call sign-up needs (request and check a code, sign-up steps and resume, municipality search, interest list, photo upload, finish, session), with one error shape, and the Go stubs and the typed client are generated from it.
  - **Covers:** ADR-0004 (groundwork for ONB-001 … ONB-018, ONB-020)
  - **Tests:** OpenAPI validation in the pipeline; generated code compiles on both sides
  - **Touches:** `api/openapi.yaml`, `server/internal/api/` (generated), `app/src/api/generated/` (generated), generator configs
  - **Specialist:** api-designer
  - **Depends on:** CR-0001.T01
  - **Done when:** the file validates; every operation names the requirement it serves; no response that others could see carries a phone number or a birth date (NFR-PRIV-002); the code request answers the same for known and unknown numbers (NFR-SEC-003); generation is one documented command
  - **Result:** 2026-11-11 · server: `go build` and `go test ./...` ok, incl. 4 contract tests; app: `tsc --noEmit` clean, Jest green · api-designer (Opus) · commit 5288072
  - **Deviation:** a placeholder `server/internal/server/not_implemented.go` answers the 11 new operations with an error until T08 replaces it (the server would not build otherwise); `app/package.json` has an `overrides` entry so `openapi-typescript` 7.13 installs next to TypeScript 6; the READMEs list the generation commands
  - **Carried into later tasks:** the birth date stays editable until finish (ONB-020); non-mobile `+41` numbers answer `phone_invalid` (ONB-002); the server stores the accepted version of the terms and the time itself; at most 20 municipality results; the sign-up step where the person left is recorded explicitly so a resume lands on that step (ONB-008), which needs one small addition to the contract in T12; responses to signed-in calls get `Cache-Control: no-store` in T08

- [x] **CR-0001.T05 [NFR-ACC-001]** UI building blocks
  - **Goal:** the shared pieces the sign-up screens are made of, as in `design/direction.md` → UI building blocks: buttons (primary, secondary, text), chip, text field, step progress, screen frame, wordmark placeholder (client side).
  - **Covers:** NFR-ACC-001 (groundwork; its scenarios are tested in T16)
  - **Tests:** written first in this task (each block renders in both looks, has a label and a touch area of at least 44 px)
  - **Touches:** `app/src/ui/`
  - **Specialist:** expo-react-native-expert
  - **Depends on:** CR-0001.T02
  - **Done when:** the block tests pass; sizes, radii and colours come from the theme, none is typed in by hand; no hard-coded text
  - **Result:** 2026-11-11 · `npm test`: 34 block tests green within the full suite; `tsc --noEmit` clean · expo-react-native-expert (Opus) · commit 650b7ca
  - **Not run here:** the blocks were not looked at in a browser or emulator (no screen uses them yet); they are checked by their tests only
  - **Deviation:** no package added; the theme gained an input fill, a chip text style, line widths, a disabled opacity and the logo construction values, all marked `PLACEHOLDER(design)` where the designer has not decided; error text is in the text colour with a Koralle icon and border, because Koralle text fails the contrast bar in daylight
  - **For the designer:** a daylight error colour; a field border on dark that reaches 3:1; chip text size, line widths, disabled look, progress segment look. React Native cannot set Fraunces' SOFT and optical-size axes, so the wordmark placeholder differs slightly from the guide

- [x] **CR-0001.T06 [NFR-INTL-001]** German texts for sign-up
  - **Goal:** every `onb.*` key the in-scope requirements and screens name, the six Spielregeln with their sentences (MOD-008), the shell labels and clearly marked placeholder legal texts, in German, in the tone of `design/direction.md`.
  - **Covers:** NFR-INTL-001 (groundwork)
  - **Tests:** a test that every key named in `product/onboarding.md` and the seven sign-up screens exists in the German file
  - **Touches:** `app/src/i18n/locales/de.json`, `app/src/i18n/legal/` (placeholders)
  - **Specialist:** ui-designer
  - **Depends on:** CR-0001.T02
  - **Done when:** the key test passes; texts use the glossary terms; texts stay within the GSM-7 character set where they are sent by SMS; the legal texts are marked as placeholders
  - **Result:** 2026-11-11 · `i18n-signup-keys-test`: 96 checks passed; full app suite green · general-purpose agent as writer (Opus) · commit 216987b
  - **Deviation:** the ui-designer agent has no command line and could not update its copy of the repository; the task was rerun with a general-purpose agent and the same brief. 41 keys come from the spec, 47 were added for labels, placeholders, buttons and screen titles; most wording is draft copy for the boss and the designer
  - **Open (for the boss):** `onb.about.region` and `onb.about.region.noMatch` cannot both exist as nested keys; stored for now as a literal dotted key. `onb.about.error.birthDateInvalid` (an impossible date such as 31.02.) is not named in the spec

**Review of waves 1 and 2 (code-reviewer, 2026-11-11):** approve with fixes; no high-severity finding. Taken into wave 3: the server allows the browser preview's origin in development only and writes the contract's error body everywhere, `Cache-Control: no-store` on the token response, spec tags on the contract test (all T08); the text field announces an error once and the hard-coded-text test covers more shapes (T09). Still open, for a small devops fix after wave 3: the pipeline does not check that the generated TypeScript types are current, the root has no `generate:api` script, and `scripts/dev.mjs` hangs when a process fails to start.

**Review fixes done (2026-11-11):** the start script stops cleanly when a process cannot start and reports busy ports; the root has `generate:api`; the pipeline has a job that fails on stale generated TypeScript types, and the Go check compares only the generated folders (devops-engineer, commit 165c03b; the pipeline itself is still not run, no Docker). Request bodies are capped in the wiring before validation and the session check: 64 KB for JSON calls, 16 MB for the photo upload, refused with 413; the contract gained a shared 413 answer for the six JSON operations (backend-developer, commit 5e9afd4; 8 new tests, checked by the manager: server suite green, app type check clean, 236 app tests green on the second run). Still open: the type check depends on locally generated route types; `server/README.md` does not list the 413.

**Order in wave 3:** T08 and T09 run in parallel; T10 follows T09 because both use the typed API client in `app/src/api/`. T07 (data model) waits for Docker: its migrations cannot be tested without PostgreSQL, and wave 4's server tasks build on it.

## Wave 3

- [ ] **CR-0001.T07 [ADR-0004, ADR-0005]** Data model and seed data
  - **Goal:** tables and migrations for members and unfinished sign-ups, login-code challenges, device sessions, municipalities, activities, a member's interests and photos; seed data: the official Swiss municipalities and the ten starter interests (server side).
  - **Covers:** ADR-0004, ADR-0005 (groundwork for ONB-003 … ONB-018)
  - **Tests:** written first in this task (migrations apply to an empty database and roll forward cleanly; seeds load; constraints hold, e.g. one account per phone number, at most five interests, at most four photos)
  - **Touches:** `server/ent/schema/`, `server/migrations/`, `server/seed/`
  - **Specialist:** postgres-pro
  - **Depends on:** CR-0001.T01, CR-0001.T04
  - **Done when:** the migration tests pass; phone numbers are stored in E.164 and codes only as hashes (ADR-0005); the source and date of the municipality list are noted

- [x] **CR-0001.T08 [ADR-0004, ADR-0005]** Server wiring
  - **Goal:** the generated server interface is mounted on the standard router with request validation and the session check, and each area (login, sign-up, photos) has its own handler file that answers "not implemented" until its task fills it (server side).
  - **Covers:** ADR-0004, ADR-0005 (groundwork)
  - **Tests:** written first in this task (invalid requests are refused by validation; calls without a session are refused where a session is needed)
  - **Touches:** `server/internal/api/` (wiring), `server/internal/login/handlers.go`, `server/internal/signup/handlers.go`, `server/internal/photos/handlers.go`
  - **Specialist:** backend-developer
  - **Depends on:** CR-0001.T04
  - **Done when:** the wiring tests pass; the generator, its runtime and the validation middleware are on matching versions
  - **Result:** 2026-11-11 · `go build` ok, `gofmt -l .` clean, `go test -count=1 ./...`: 9 packages ok; app type check and Jest green after regenerating the types · backend-developer (Opus) · commit 88b3bd0
  - **Not run here:** the database test (no PostgreSQL)
  - **Deviation:** the session interface lives in its own package `server/internal/server/session` (an import cycle otherwise); the contract is embedded through the generator's own option; `nethttp-middleware` v1.2.0 is used because newer releases need a newer kin-openapi than the generator; the contract gained `PUT /signup/step` and the recorded `step` as briefed
  - **Carried into later tasks:** `APP_ENV` is `development` or `production`, and may be unset only on a loopback address (T11 refuses its development switches in production); `PUT /signup/step` accepts `interests` and `photos` once first name, birth date and municipality are saved and `rules` once the portrait exists, going back is always allowed (T12); request bodies have no size limit yet, so a fix task adds one in the wiring before T13; a photo part that is neither JPEG nor PNG is refused by validation with `request_invalid` (T13 keeps that in mind)

- [x] **CR-0001.T09 [ONB-001 … ONB-007]** App: phone number and code screens
  - **Goal:** SCR-onb-phone and SCR-onb-code with all their states, the resend countdown, changing the number, and landing on the next step or on Entdecken for an existing member (client side; the server decides whether a number or code is valid, the app only checks the format to save a round trip).
  - **Covers:** ONB-001.S1, ONB-001.S2, ONB-002.S1, ONB-002.S2, ONB-003.S1, ONB-003.S2, ONB-004.S1, ONB-004.S2, ONB-004.S3, ONB-005.S1, ONB-006.S1, ONB-007.S1
  - **Tests:** written first in this task, against a mocked API client
  - **Touches:** `app/app/(onboarding)/phone.tsx`, `app/app/(onboarding)/code.tsx`, `app/src/features/login/`
  - **Specialist:** expo-react-native-expert
  - **Depends on:** CR-0001.T04, CR-0001.T05, CR-0001.T06
  - **Done when:** a test tagged `@spec` exists and passes for each covered scenario; the states of both screens in `design/screens.md` are built except "banned" (ONB-022 is out of scope); no hard-coded text
  - **Result:** 2026-11-11 · `npm test`: 10 suites, 189 tests passed (run twice by the manager); `tsc --noEmit` clean after one line of the test was aligned with the renamed `step` field from T08 · expo-react-native-expert (Opus) · commit 975b707
  - **Not run here:** nobody has looked at the two screens in a browser or emulator yet (the agent has no browser, and the manager's browser pane refused the local address); no real server call was made
  - **Deviation:** the session state lives in `app/src/features/login/session.tsx`; four existing tests were adapted because a person without a session is now sent to sign-up; the wordmark is not on the phone screen (the spec does not ask for it and no text key for its name exists)
  - **Carried into later tasks:** on start-up the app asks the server who the person is and continues an unfinished sign-up at its step (T10, ONB-008); the privacy link opens the legal screen that T15 builds

- [x] **CR-0001.T10 [ONB-008 … ONB-013, ONB-020]** App: about you, age stop and interests
  - **Goal:** SCR-onb-about, SCR-onb-age-stop and SCR-onb-interests with all their states, the age confirmation, the municipality and interest search, and the sign-up state that survives going back and reopening the app (client side keeps what was typed; the server holds the unfinished sign-up).
  - **Covers:** ONB-008.S1, ONB-009.S1, ONB-009.S2, ONB-009.S3, ONB-010.S1, ONB-010.S2, ONB-010.S5, ONB-011.S1, ONB-011.S2, ONB-012.S1, ONB-012.S2, ONB-012.S3, ONB-013.S1, ONB-013.S2, ONB-013.S3, ONB-020.S1
  - **Tests:** written first in this task, against a mocked API client
  - **Touches:** `app/app/(onboarding)/about.tsx`, `app/app/(onboarding)/age-stop.tsx`, `app/app/(onboarding)/interests.tsx`, `app/src/features/signup/`
  - **Specialist:** expo-react-native-expert
  - **Depends on:** CR-0001.T04, CR-0001.T05, CR-0001.T06
  - **Done when:** a test tagged `@spec` exists and passes for each covered scenario; the birth date is three number fields that work in the browser and on the phone; the no-match text uses the key `onb.about.regionNoMatch` and the literal dotted key in `de.json` is replaced (delta → MODIFIED ONB-012); no hard-coded text
  - **Result:** 2026-11-11 · `npm test`: 12 suites, 236 tests passed; `tsc --noEmit` clean; all 16 covered scenarios have a tagged test · expo-react-native-expert (Opus) · commit 0c53ce5
  - **Not run here:** nobody has looked at the three screens in a browser or emulator; the three date fields, the screen-reader reading of the date group and the save-while-typing need a look on a device
  - **Deviation:** a visible back button on the interests screen (the screens have no header); the first name is saved shortly after typing stops and a chosen municipality at once; three existing tests now mock the start-up call; the type check is only strict about route names after the dev server has run once (typed routes are generated locally), which made it fail in the manager's checkout on the route to the not-yet-built photos screen until the stale generated file was removed
  - **Carried into later tasks:** after the code check a returning person lands on their recorded step, not always on the about screen (T15); the server accepts both the straight and the curly apostrophe in first names (T12); the Jest timeout is raised because the first run after an install times out on a cold cache (T14)

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

- [x] **CR-0001.T14 [ONB-014, ONB-015]** App: photos screen
  - **Goal:** SCR-onb-photos with all its states: one portrait required, up to three more, from camera or library, the denied-permission path, and each photo resized and saved as JPEG on the phone before upload (client side does the conversion; the server still strips metadata).
  - **Covers:** ONB-014.S1, ONB-014.S2, ONB-015.S1
  - **Tests:** written first in this task, against a mocked API client and a mocked picker
  - **Touches:** `app/app/(onboarding)/photos.tsx`, `app/src/features/photos/`
  - **Specialist:** expo-react-native-expert
  - **Depends on:** CR-0001.T10
  - **Done when:** a test tagged `@spec` exists and passes for each covered scenario; picking a file works in the browser preview; the permission texts are in `app.json` as `product/app.md` → Permissions says; no hard-coded text
  - **Result:** 2026-11-11 · `npm test`: 17 suites, 276 tests passed on the first run after the merge (the 30 s Jest timeout cured the cold-start failures); `tsc --noEmit` clean; all 3 covered scenarios have a tagged test · expo-react-native-expert (Opus) · commit fbd72a4
  - **Not run here:** no browser or device run: the file chooser on the web, a real upload and the display of uploaded photos are checked only against mocks; the web export builds
  - **Deviation:** `expo-image-picker` ~58.0.10 and `expo-image-manipulator` ~58.0.16 added (both approved); the microphone permission is switched off; the remove action is a small control of its own because the shared button has no separate screen-reader name; uploading shows a spinner, not a percentage; a new store build is needed for the two native modules and the permissions
  - **Open (for the boss):** the system photo picker needs no photo-library permission on iOS and Android, so asking for it shows an extra prompt and may pull in Android media permissions that Google Play restricts; ONB-015 as written asks for the library permission path. No text exists yet for a photo the server refuses or for a failed conversion on the phone

- [x] **CR-0001.T15 [ONB-016, ONB-017, ONB-018]** App: Spielregeln and finish
  - **Goal:** SCR-onb-rules with the six rules, the "not a dating app" line visible without scrolling, the legal texts opening and returning to the step, acceptance, finishing with the offline path, and landing on Entdecken (client side).
  - **Covers:** ONB-016.S1, ONB-016.S2, ONB-017.S1, ONB-018.S1, ONB-018.S2
  - **Tests:** written first in this task, against a mocked API client
  - **Touches:** `app/app/(onboarding)/rules.tsx`, `app/app/(onboarding)/legal.tsx`, `app/src/features/signup/finish.ts`
  - **Specialist:** expo-react-native-expert
  - **Depends on:** CR-0001.T10
  - **Done when:** a test tagged `@spec` exists and passes for each covered scenario; the Entdecken tab is still the bare placeholder; no hard-coded text
  - **Result:** 2026-11-11 · `npm test`: 14 suites, 251 tests passed on the second run (the first run after the merge timed out in `shell-test` and `i18n-add-language-test`, as after every merge so far); `tsc --noEmit` clean; all 5 covered scenarios have a tagged test · expo-react-native-expert (Opus) · commit 9aae2c6
  - **Not run here:** nobody has looked at the screen in a browser or emulator; that the "not a dating app" line is visible without scrolling at phone size is proven only by the order of elements
  - **Deviation:** the acceptance control is built inside the feature folder (no UI block fitted); the session is switched to member by calling the existing start function with the stored token, because the session module was outside the task's files
  - **Carried into later tasks:** a small `becomeMember` function in the session module would be cleaner (after T14)

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

## Time log

Kept at the boss's request (2026-11-11) to estimate what such an app takes. "Wall clock" is from the wave's start to its checked commit, taken from the commit times; "agent time" is the sum of the running times the agents reported. Waiting for answers, installs and shutdowns is not counted where it can be told apart.

| Wave | Tasks | Wall clock | Agent time | Notes |
|---|---|---|---|---|
| Planning | change request and task plan | about 20 min | — | 00:05 to 00:24, including the boss's answers |
| 1 | T01, T02 | about 30 min | 38 min (12 + 26) | two agents in parallel |
| 2 | T03, T04, T05, T06 | about 21 min | 61 min (19 + 15 + 15 + 12) | four agents in parallel; T06 restarted once; plus a 1.5 min review |
| Review fixes | start script and pipeline, body size limit | about 15 min | 25 min (12.6 + 12.8) | two agents in parallel, alongside T10 |
| 4 (app part) | T14, T15 | about 20 min | 25 min (15.5 + 9.4) | two agents in parallel, pulled forward while Docker was missing |
| 3 (app and wiring part) | T08, T09, T10 | not measurable | at least 15 min after the restarts (T08 6.5, T09 6, T10 1.7) | the computer shut down mid-wave and T10 was paused once; the time before each stop is not recorded. T07 still waits for Docker |

## Fix tasks (from /spec-verify)

<!-- /spec-verify appends "### Fix round N — /spec-verify YYYY-MM-DD" with tasks in the same shape,
     plus a "**Gap:**" line (missing | partial | contradicts | unrequested — file:line — one line). -->

## Verify log

<!-- /spec-verify appends one line per run; /spec-close reads the last one. Never edit past lines. -->
