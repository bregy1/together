# ADR-0010 Maps and place search

- **Status:** accepted · **Date:** 2026-11-10
- **Decided by:** the boss · **Prepared by:** Claude, consulted: architect-reviewer
- **Affected spec IDs:** PLAN-006, PLAN-007, PLAN-023, FEED-003 (region and radius), ADR-0001, ADR-0003, ADR-0009
- **Supersedes:** — · **Superseded by:** —

## Context

Hosts pick a plan's place on a map, by searching or by dropping a pin; the plan's public region is the Swiss municipality taken from that point; accepted participants see the place on a map (PLAN-006, PLAN-007). The map must also run in the browser preview (ADR-0009). Map-tile and search requests reveal which area someone looks at and what they search, which touches ADR-0001. This ADR decides the map data, the renderer, place search and the municipality lookup. "Open in maps" (PLAN-023) hands the place to the phone's own maps app and is not affected.

## Decision

**Option B1: swisstopo (geo.admin.ch) with the tiles on our own server and search through our backend**, decided by the boss on 2026-11-10. It includes the renderers named in the option: `@maplibre/maplibre-react-native` on iOS and Android, and `maplibre-gl` with the `pmtiles` add-on in the browser preview. Place search covers places, addresses, stations, lifts, lakes and mountains; businesses are not searchable in the MVP, a pin covers the gaps. The backend takes the municipality (BFS number) from the stored point through geo.admin.ch and never accepts one sent by the app.
**Reasons (boss):** chose the recommended option ("Yes, swisstopo"): free, official Swiss data, and no map traffic from the app to third parties.

## Consequences

- **Positive:** no cost; official Swiss maps with local names; the app sends map and search requests only to our own servers; one renderer and one style for iOS, Android and the browser preview.
- **Negative and risks:**
  - Search finds no businesses and not every informal name; if members miss it, an OpenStreetMap search (Photon, option C) can be added behind the same backend search endpoint.
  - We host one tile file (about 900 MB) and refresh it a few times a year.
  - geo.admin.ch receives the search text and the picked point from our server (not the member's IP); the service runs on AWS with best-effort availability, so search and the municipality lookup need a clear error state.
  - `@maplibre/maplibre-react-native` cannot run in Expo Go; a development build is needed (already the case, ADR-0009).
- **Follow-ups:**
  - Local prototype (M0): load the tiles straight from geo.admin.ch; switch to our own PMTiles file before the pilot (a URL change).
  - Project setup (first baseline CR): the map component with its web path, the backend endpoints for place search and the municipality lookup, the attribution "© swisstopo" on every map.
  - Check before the pilot: the licence of the font in swisstopo's style (replace it with an open font if unclear); whether the base map shows hiking trails; the New Architecture and minimum React Native version the current MapLibre library needs.
  - Privacy policy (`app.md` → Legal): name geo.admin.ch as the receiver of search texts and picked points, sent from our server.
  - A requirement for the map's error and offline states and for the attribution is still missing in PLAN (`/spec-write PLAN`).
