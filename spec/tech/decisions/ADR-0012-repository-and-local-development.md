# ADR-0012 Repository layout and local development

- **Status:** accepted · **Date:** 2026-11-10
- **Decided by:** the boss · **Prepared by:** Claude
- **Affected spec IDs:** ADR-0003, ADR-0004 (clarified: where the code lives and how the pipeline runs), ADR-0009; `product/features.md` → Milestones (M0); project `CLAUDE.md` → Commands
- **Supersedes:** — · **Superseded by:** —

## Context

Nothing is built yet; the repository holds only `spec/` and `notes/`. The boss is a developer, will work in the repository directly, and wants one repository for app and server, hot reload, and a proper dev server to open the app in the browser (boss, 2026-11-10). ADR-0004 names GitLab pipelines with gitlab-ci-local, while the repository is on GitHub. This ADR decides the repository layout, how the project runs on a developer machine, and where code and pipeline live. Tools inside the app and the server are decided in their own ADRs and in *Approved libraries*.

## Decision drivers

1. One repository for app and server (boss, 2026-11-10)
2. Reload on save for app and server, and the app in the browser (boss, 2026-11-10; ADR-0009)
3. Works on the boss's Windows machine; the Mac is used for iOS (ADR-0003)
4. Few tools, near-zero cost (`vision.md` → Budget)

## Options

### Layout
- **A) `app/`, `server/`, `api/`, `deploy/`** next to `spec/` and `notes/`: the Expo app, the Go service, the OpenAPI file both sides generate from, and the Docker files. Flat and easy to find.
- **B) `apps/mobile`, `apps/server`, `packages/api`:** the usual JavaScript workspace shape; one level deeper, with no benefit for one app and one Go service.

### Local development
- **A) PostgreSQL in Docker; server and app run directly on the machine:** the Go server restarts on save (`air`), the app runs on Expo's dev server with hot reload in the browser and the emulator; one root command starts all three. Fastest reload on Windows.
- **B) Everything in Docker Compose:** only Docker to install, but file watching through Docker on Windows is slow and unreliable.

### Code hosting and pipeline
- **A) Code on GitHub; the pipeline is a `.gitlab-ci.yml` run locally with gitlab-ci-local:** no GitLab server needed; matches ADR-0004 as written.
- **B) Move or mirror the repository to GitLab.**
- **C) GitHub Actions instead:** would replace the GitLab part of ADR-0004.

**Recommendation (Claude):** A in all three, for the reasons given with each. Reversal cost: low for the layout and the dev setup while the code is small; low for the pipeline, because the jobs are plain scripts.
**Not verified:** none; `air` on Windows was checked in its repository on 2026-11-10 by architect-reviewer.

## Decision

**A in all three**, decided by the boss on 2026-11-10: a monorepo with `app/`, `server/`, `api/` and `deploy/`; PostgreSQL in Docker with the server and the app running directly on the machine, reloading on save, started by one root command; the code stays on GitHub and the pipeline is a `.gitlab-ci.yml` run locally with gitlab-ci-local.
**Reasons (boss):** "we want a mono repo"; "add hot reload and a proper dev server so I can open it in the browser to test myself"; chose the recommended options.

## Consequences

- **Positive:** one clone, one command, changes visible on save in the browser, the emulator and the server.
- **Negative and risks:** Go, Node and Docker must be installed on the developer machine; nothing runs the pipeline automatically on a push until a runner is set up, so it is run by hand before merging; `air` is GPL-3.0 and stays a development tool, out of the production images.
- **Follow-ups:**
  - Project setup (first baseline CR): the folders, the root command, Docker Compose for PostgreSQL, `air`, Expo dev server for web and emulator, `.gitlab-ci.yml`, and the *Commands* section of the project `CLAUDE.md` and the `README.md`.
  - The tool behind the one root command is chosen with the setup task (small-library approval if it needs one).
