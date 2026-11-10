# Yaruno

An app to plan activities and let people join: hosts choose who comes, and a trust score filters out people who don't show up.

## How we work here

This project is **spec-driven**: `spec/` is the single source of truth for what the app is and does. Read `spec/README.md` (conventions) and `spec/constitution.md` (non-negotiables) before you touch the spec or the code. Change the spec first, then the code.

The project expects the **claude-skills** kit to be installed (https://github.com/bregy1/claude-skills): its global working rules, its skills (`/app-discover`, `/spec-write`, `/spec-decide`, `/spec-change` …) and its specialist agents. If those skills are missing, install the kit before working on the spec.

## Stack

Summary of the accepted ADRs in `spec/tech/decisions/`; details in `spec/tech/architecture.md`.

- Data protection: Swiss revFADP + EU GDPR; stored personal data in Switzerland only (ADR-0001)
- Minimum age 18, self-declared birth date (ADR-0002)
- App: Expo SDK 58, React Native, TypeScript; OTA via `expo-updates` and self-hosted xprem (ADR-0003)
- Backend: Go, ent + Atlas migrations, PostgreSQL, REST + OpenAPI spec-first, River jobs, Docker on Swiss servers, GitLab + gitlab-ci-local (ADR-0004)
- Auth: custom phone + SMS-code flow in Go, opaque device sessions; production SMS provider open (ADR-0005)
- Realtime & push: event table + `pg_notify` → Go hub → WebSocket; push direct to APNs and FCM (ADR-0006)
- i18n: i18next + react-i18next + expo-localization (ADR-0007)
- Tests: Jest + RNTL, Maestro, Go testing + testify (ADR-0008)
- Local preview: Android emulator and iOS Simulator, plus Expo web in a phone-sized browser, for development only (ADR-0009)

## Commands

_None yet._ The project-setup task of the first baseline CR fills in the install, build, test, lint and run commands.

## Team

Specialists active in this project (see `/team-manager`): `expo-react-native-expert`, `backend-developer`, `postgres-pro`, `websocket-engineer`, `auth-integration-engineer`, `api-designer`, `test-automator`, `code-reviewer`, `security-auditor`, `privacy-compliance`, `accessibility-tester`, `ui-designer`, `devops-engineer`, `mobile-release-engineer`, `product-manager`, `architect-reviewer`. Not used: `flutter-expert` (ADR-0003).

## Notes

Raw notes (often German) are in `notes/`. They are input, not spec: an idea counts only once it is written into `spec/`.
