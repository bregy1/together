# ADR-0003 App framework and over-the-air updates

- **Status:** accepted · **Date:** 2026-11-08
- **Decided by:** the boss · **Prepared by:** Claude, consulted: expo-react-native-expert
- **Affected spec IDs:** `constitution.md` → Platforms (minimum OS versions); all MVP areas (ONB, PROF, FEED, PLAN, JOIN, CAL, TRUST, MOD, ADM, NOTIF, FRND, CHAT, SET); `design/direction.md` → Look and feel (one shared look, light and dark)
- **Supersedes:** — · **Superseded by:** —

## Context

TOGETHER needs one iOS and Android app. The boss's hard requirement is a small store app whose UI and logic are updated from our own server at runtime, so store releases stay rare; native changes (new permissions or SDKs) may still need a store release (boss, 2026-11-08: "over-the-air app updates"). No area requirements exist yet; the drivers come from the constitution, the feature map and the boss. This ADR decides the app framework, the over-the-air (OTA) update mechanism and where it is hosted, the build route and the minimum OS versions. Push, i18n and testing have their own ADRs.

## Decision drivers

1. OTA updates of UI and logic from our server, store-compliant (boss, 2026-11-08)
2. Team fit: the boss knows TypeScript, React and web well; no Dart (boss, 2026-11-08)
3. Self-hosted, open components on Swiss servers, near-zero running cost (boss; ADR-0001)
4. Covers the MVP capabilities: SMS-code login UI, photos from library or camera, feed, calendar, plan chat over WebSocket, push, deep links to plans, secure token storage, light and dark mode, WCAG 2.2 AA (`features.md`, `constitution.md`)
5. Builds: a Mac is available; GitLab with gitlab-ci-local; no developer accounts yet (boss, 2026-11-08)

## Options

### A) Expo (React Native, TypeScript) with self-hosted OTA (expo-updates + xprem)
- **Pros:** fits the boss's TypeScript/React skills; Expo SDK modules and config plugins cover every MVP capability without ejecting (Continuous Native Generation, no committed `ios/`/`android/`); `expo-updates` speaks the documented Expo Updates protocol, which supports code signing and rollback; xprem (formerly Expo Open OTA) is a Go server for that protocol, shipped as a Docker image or static binary, with a stateless mode, MIT-licensed core; bundles stay on our Swiss servers; code signing is free.
- **Cons:** we run the update server and must check it against every Expo SDK upgrade; xprem is a small project whose RBAC/SSO features are commercial (`ee/`); fallback is a thin Go server written on the documented protocol.
- **Cost and effort:** our own server only; a day or two to set up publishing and signing.
- **Sources:** https://expo.dev/changelog/sdk-58 (checked 2026-11-08) · https://docs.expo.dev/technical-specs/expo-updates-1 (checked 2026-11-08) · https://docs.expo.dev/eas-update/custom-updates-server (checked 2026-11-08) · https://github.com/mercuretechnologies/xprem (checked 2026-11-08)

### B) Expo with hosted EAS Update ("Expo Update")
- **Pros:** least setup; rollback by republishing.
- **Cons:** bundles hosted by Expo outside Switzerland (no personal data, but against the self-hosting preference); free plan capped at 1,000 monthly active users; end-to-end code signing only in the Production plan (USD 199/month).
- **Cost and effort:** free up to 1,000 MAU, then USD 19/month (3,000 MAU) or more.
- **Sources:** https://expo.dev/pricing (checked 2026-11-08)

### C) Flutter with Shorebird code push
- Ruled out: the team has no Dart experience (driver 2), and nothing decisive favours it.

### Builds (same for A and B)
- iOS: built and signed locally on the boss's Mac (Xcode); EAS cloud builds stay an option (free plan about 15 iOS builds, then about USD 2 each).
- Android: built in a Linux GitLab runner (`eas build --local --platform android`, or Gradle after prebuild); gitlab-ci-local runs Linux containers only, so iOS jobs run on the Mac.
- **Sources:** https://docs.expo.dev/build-reference/local-builds/ (checked 2026-11-08) · https://expo.dev/pricing (checked 2026-11-08)

### OTA usage rule (same for A and B)
OTA updates carry JavaScript and assets only, stay within the reviewed purpose of the app (bug fixes, UI and content changes), are code-signed, and never add native capabilities or permissions; anything else ships as a store release. Google Play allows code that runs in an interpreter such as JavaScript; Apple's Developer Program License Agreement allows downloaded interpreted code that does not change the app's primary purpose.
- **Sources:** https://support.google.com/googleplay/android-developer/answer/9888379 (checked 2026-11-08) · https://developer.apple.com/app-store/review/guidelines/ (checked 2026-11-08, guideline 2.5.2)

### Minimum OS versions
Expo SDK 58 supports iOS 16.4 and later; the Android minimum follows the SDK (see *Not verified*).

### Comparison

| Driver | A) Expo + self-hosted OTA | B) Expo + EAS Update | C) Flutter + Shorebird |
|---|---|---|---|
| OTA from our server | meets | meets, but Expo's server | meets, Shorebird's server |
| Team fit (TS/React) | meets | meets | fails |
| Self-hosted, Swiss, near-zero cost | meets | fails partly (hosted, 1,000 MAU cap, signing paid) | fails partly |
| MVP capabilities | meets | meets | meets |
| Builds with Mac + GitLab | meets | meets | meets |

**Recommendation (Claude):** A, because it is the only option that meets the self-hosting and cost drivers while matching the team's skills; hosted EAS Update stays a quick fallback for the pilot. Would change if xprem stalls and writing our own Go update server proves too costly. Reversal cost: low for the OTA host (switching the update URL needs one store release); high for the framework (a rewrite).
**Not verified:** Apple's current Developer Program License Agreement wording on downloaded interpreted code (login-gated; the public guideline 2.5.2 is strict, so OTA changes stay small); the Android minimum API level of SDK 58; xprem's latest release date and exactly which features are `ee`-only; where EAS Update bundles are hosted.

## Decision

**Option A: Expo (React Native, TypeScript) with self-hosted OTA through `expo-updates` and xprem**, with iOS built on the boss's Mac, Android in a Linux GitLab runner, the OTA usage rule above, and minimum OS versions following Expo SDK 58, decided by the boss on 2026-11-08.

**Reasons (boss):** chose the recommended option; it matches the boss's requirement of a small store app updated from our own server, the TypeScript/React skills, and self-hosting on Swiss servers.

## Consequences

- **Positive:** UI and logic ship without store releases; one TypeScript code base for both platforms; update bundles stay on our servers; free code signing.
- **Negative and risks:** we operate the update server and re-check it with each Expo SDK upgrade; xprem is a small project (fallback: our own Go server on the documented protocol); Apple's review may object to large OTA changes, so new features that change the app's purpose ship as store releases.
- **Follow-ups:**
  - `constitution.md` → Platforms: minimum OS versions follow Expo SDK 58 (done in this decision).
  - Project setup (first baseline CR): Expo SDK 58 app with Continuous Native Generation, `expo-updates` pointed at our xprem server, code-signing key kept outside the repository, runtime-version policy, Android build job in GitLab, iOS build on the Mac.
  - Confirm SDK 58's Android minimum API level at project setup and write it into `constitution.md`.
  - Developer accounts (Apple, Google) are needed before the first build for testers; they depend on the legal-entity decision (`app.md` → Legal).
