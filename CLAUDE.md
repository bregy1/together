# TOGETHER

An app to plan activities and let people join: hosts choose who comes, and a trust score filters out people who don't show up.

## How we work here

This project is **spec-driven**: `spec/` is the single source of truth for what the app is and does. Read `spec/README.md` (conventions) and `spec/constitution.md` (non-negotiables) before you touch the spec or the code. Change the spec first, then the code.

The project expects the **claude-skills** kit to be installed (https://github.com/bregy1/claude-skills): its global working rules, its skills (`/app-discover`, `/spec-write`, `/spec-decide`, `/spec-change` …) and its specialist agents. If those skills are missing, install the kit before working on the spec.

## Stack

_Not decided yet._ Each choice is made with `/spec-decide` and recorded as an ADR in `spec/tech/decisions/`. Keep this section a short summary of the accepted ADRs.

## Commands

_None yet._ The project-setup task of the first baseline CR fills in the install, build, test, lint and run commands.

## Team

Specialists active in this project: _full roster available (see `/team-manager`); narrowed once the stack is decided._

## Notes

Raw notes (often German) are in `notes/`. They are input, not spec: an idea counts only once it is written into `spec/`.
