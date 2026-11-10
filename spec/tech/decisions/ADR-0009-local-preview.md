# ADR-0009 Local preview: phone emulator and browser

- **Status:** accepted · **Date:** 2026-11-10
- **Decided by:** the boss · **Prepared by:** Claude, consulted: architect-reviewer (web support of the app's modules)
- **Affected spec IDs:** `product/features.md` → Milestones (M0 local prototype); ADR-0003 (app framework); ADR-0010 (maps: the map needs a web path); `constitution.md` → Platforms (unchanged: iOS and Android are the shipped targets)
- **Supersedes:** — · **Superseded by:** —

## Context

The boss wants to build a local prototype first (M0) and "test it on the computer with phone view", before the domain, the app ID, the legal entity and the store questions are decided (boss, 2026-11-10). ADR-0003 targets iOS and Android only. This ADR decides how the app is run on the computer during development. It does not add a shipped platform: Yaruno ships for iOS and Android only.

## Decision drivers

1. Test the app on the computer in a phone-sized view during M0 (boss, 2026-11-10)
2. Behave like the real app on a phone, so the prototype proves the real thing (ADR-0003)
3. Fast feedback while building screens (boss, 2026-11-10)
4. No extra technology in the shipped app; nothing the stores or the privacy rules would see changes (`constitution.md`, ADR-0001)

## Options

### A) Phone emulator only
The real app in the Android emulator on the Windows PC and the iOS Simulator on the boss's Mac, from an Expo development build against the local backend.
- **Pros:** no new technology; maps, secure storage and later push behave as on a phone.
- **Cons:** slower to start; the emulator needs Android Studio and a capable PC.
- **Cost and effort:** setup only.

### B) Browser only
Expo's web target (react-native-web) in a phone-sized browser window.
- **Pros:** fastest to open and to reload.
- **Cons:** a platform outside ADR-0003; native modules without web support need stand-ins; it does not prove the native app.
- **Cost and effort:** web stand-ins for the native parts.

### C) Both
The emulator for the real behaviour, the browser for quick looks at screens.
- **Pros:** real behaviour and fast feedback.
- **Cons:** the most setup; stand-ins for the web preview must be kept apart from the native code.
- **Cost and effort:** A plus B.

### Comparison

| Driver | A | B | C |
|---|---|---|---|
| Phone view on the computer | meets (emulator) | meets (browser) | meets |
| Behaves like the real app | meets | partly: native parts are stand-ins | meets (emulator) |
| Fast feedback | slower | meets | meets (browser) |
| Nothing extra in the shipped app | meets | meets if stand-ins are web-only | meets if stand-ins are web-only |

**Recommendation (Claude):** A, because it needs no new technology and proves the real app. Would change if quick looks in a browser matter more than setup effort. Reversal cost: low; the web preview can be dropped at any time.
**Not verified:** none beyond the module list in *Follow-ups*, which comes from the Expo SDK 58 module docs as read by architect-reviewer.

## Decision

**Option C: both** — the Android emulator (and the iOS Simulator on the Mac) for the real behaviour, and Expo's web target in a phone-sized browser window for quick looks, decided by the boss on 2026-11-10.
**Reasons (boss):** "We want first to build a prototype locally and test it on the computer with phone view."

## Consequences

- **Positive:** quick looks at screens in the browser; the real behaviour is still checked in the emulator.
- **Negative and risks:**
  - The web preview is a development tool only: it is never published, and it runs only against the local backend with test data.
  - Modules without web support need small web-only stand-ins (`*.web.tsx` files or a platform check) that never reach the native build; the map needs a web path (ADR-0010).
  - Login sessions in the web preview are not stored as securely as on the phone; acceptable only for local test data.
  - Maestro tests run on the emulator, not in the browser (ADR-0008).
- **Follow-ups:**
  - Project setup (first baseline CR): Expo development build for the Android emulator and the iOS Simulator; the web target with phone-sized preview; web stand-ins for the modules listed below.
  - Modules that need a web stand-in in the preview (Expo SDK 58 docs, checked 2026-11-10 by architect-reviewer): `expo-secure-store` (no web; a development-only stand-in), `expo-notifications` (no web; a stub), `expo-updates` (no web; a no-op), the native map library (no web; the browser uses `maplibre-gl` or the equivalent web component, ADR-0010). `expo-image-picker` works on the web through a file picker, opened from a user action; `expo-localization` works on the web, with time zone and region possibly empty.
