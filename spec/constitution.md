# Constitution — Yaruno

The non-negotiables for this app. Every spec file, plan and line of code respects them. Only the boss changes this file; a significant change also gets an ADR (`/spec-decide`).

## Ways of working

- **Spec first.** `spec/` is the single source of truth; its conventions are in `spec/README.md`. The spec changes first, then the code. Code contains no behaviour the spec does not ask for.
- **Ask, never assume.** Whatever is not decided becomes a `[NEEDS DECISION: …]` marker and goes to the boss with options and a recommendation. Nobody fills a gap with a guess, because guesses get built on.
- **Manager and specialists.** Claude is the manager: it writes the spec from the boss's answers, gives specialist agents one task each, checks their work and reports. A specialist's report is a claim until it has been checked.

## Decision rights

| Decision | Who decides | Recorded in |
|---|---|---|
| Scope, priorities, MVP cut | Boss | `product/features.md` |
| Behaviour: approving requirements and change requests | Boss | `product/<area>.md`, `changes/` |
| Technology, services, architecture | Boss, on the manager's recommendation | ADR in `tech/decisions/` |
| Brand and visual direction | Boss, with Romi (design, colours, logo) | `design/direction.md` |
| Legal texts, privacy, store submissions | Boss | `product/app.md` |
| Small, reversible implementation details | Manager, mentioned in its report | — |

## Platforms

- **Targets:** iOS and Android
- [NEEDS DECISION: Which form factors? — options: A) phones only, B) phones and tablets with the phone layout, C) phones plus tablet-optimised layouts — recommended: A for the first release, because the app is mobile-first and tablet layouts multiply design and test work]
- **Minimum OS versions:** follow the Expo SDK in use (SDK 58: iOS 16.4 or later; Android at the SDK's minimum API level, confirmed at project setup) and rise with each SDK upgrade (ADR-0003, boss, 2026-11-08).

## Languages

- **Source language:** German · **Prepared:** French, English
- All user-facing text goes through i18n keys from the first line of code; nothing is hard-coded. Dates, times, numbers and currencies are formatted for the user's locale.
- "Prepared" means a language can ship by adding translations, with no code change.
- Canonical terms per language are fixed in `product/glossary.md`.
- [NEEDS DECISION: Which languages ship in the first release? — options: A) German only, B) German, French and English — recommended: A for the pilot in Oberwallis, because translations can follow without code changes once the texts are stable; Valais is bilingual, so French becomes mandatory once the app is promoted in Lower Valais]

## Quality bars

- **Tests:** every scenario of an implemented requirement is proved by an automated test, traced as `spec/README.md` describes.
- **Accessibility:** WCAG 2.2 level AA on every screen (boss, 2026-11-08).
- **Measurable targets** (speed, offline behaviour, battery, reliability) are non-functional requirements in `product/nfr.md`.

## Privacy and security baseline

- **Data minimisation:** collect only the personal data an approved requirement needs, and say why in that requirement.
- **Permissions in context:** request a device permission only when a feature needs it, at the moment it is needed. The reason is recorded in `product/app.md`.
- **No tracking by default:** no third-party analytics, advertising or tracking SDK without a boss decision (ADR).
- **No secrets in the repository:** keys, tokens, passwords and certificates stay out of version control.
- **Data-protection law:** the app complies with the Swiss revFADP and the EU GDPR; for now Yaruno sticks to Switzerland (boss, 2026-11-08).
- **Data residency:** personal data is stored and processed in Switzerland only (boss, 2026-11-08).
