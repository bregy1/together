# ADR-0008 Test tooling

- **Status:** accepted · **Date:** 2026-11-08
- **Decided by:** the boss · **Prepared by:** Claude, consulted: expo-react-native-expert, backend-developer
- **Affected spec IDs:** `constitution.md` → Quality bars (every scenario proved by a test); `spec/README.md` → Traceability (`@spec` tags); all MVP areas
- **Supersedes:** — · **Superseded by:** —

## Context

Every scenario of an implemented requirement must be proved by an automated test tagged with its scenario ID (`@spec AREA-NNN.Sn`). The app is Expo (ADR-0003), the server Go with PostgreSQL (ADR-0004); pipelines run in GitLab with gitlab-ci-local (Linux containers), and the boss has a Mac for iOS.

## Decision drivers

1. Scenario-tagged tests for app and server (constitution, `spec/README.md`)
2. Runs in GitLab CI and locally with gitlab-ci-local (boss)
3. iOS testing on the boss's Mac; Linux for everything else (boss)
4. Open source, no paid service (boss)

## Proposed set

- **App, unit and component:** Jest with `jest-expo` and React Native Testing Library (Expo's recommendation; `react-test-renderer` is deprecated).
- **App, end-to-end:** Maestro flows against built apps: Android emulator in a Linux CI job, iOS simulator on the Mac.
- **Server:** Go `testing` with testify; integration tests against a real PostgreSQL started as a CI `services:` container (testcontainers-go is possible in GitLab with Docker-in-Docker, but a service container is simpler with gitlab-ci-local).
- **Contract:** the OpenAPI file (ADR-0004) is validated in CI, and the generated client and server must compile.
- **Tagging:** test names or tags carry the scenario ID (`@spec ONB-003.S2`).
- **Sources:** https://docs.expo.dev/develop/unit-testing/ (checked 2026-11-08) · https://docs.maestro.dev/get-started/supported-platform/react-native (checked 2026-11-08) · https://golang.testcontainers.org/system_requirements/ci/gitlab_ci/ (checked 2026-11-08)

### Alternatives considered
- **Detox** for end-to-end: needs app-specific setup; Expo's docs point to Maestro.
- **Maestro Cloud** for hosted iOS simulators: paid; not needed with the Mac.

**Recommendation (Claude):** the proposed set, because it covers every layer with free tools that run in the planned CI and on the Mac. Would change if Maestro proves flaky with the chosen navigation. Reversal cost: low (tests per layer can be ported).
**Not verified:** Maestro on Windows; Android emulator performance in the Linux runners; testcontainers-go under gitlab-ci-local.

## Decision

**The proposed set**, decided by the boss on 2026-11-08.

**Reasons (boss):** accepted the proposal.

## Consequences

- **Positive:** every layer is testable with free tools in the planned CI; scenario tags make `/spec-verify` traceable.
- **Negative and risks:** iOS end-to-end runs only on the boss's Mac, so it is a manual step in the pipeline; Android emulators in CI can be slow.
- **Follow-ups:**
  - Project setup: Jest, jest-expo and React Native Testing Library; Maestro with a first smoke flow; Go test setup with a PostgreSQL service in `.gitlab-ci.yml`; OpenAPI validation job.
  - Document how to run the iOS Maestro flows on the Mac.
