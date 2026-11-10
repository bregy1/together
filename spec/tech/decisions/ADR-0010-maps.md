# ADR-0010 Maps and place search

- **Status:** proposed · **Date:** 2026-11-10
- **Decided by:** the boss · **Prepared by:** Claude, consulted: architect-reviewer
- **Affected spec IDs:** PLAN-006, PLAN-007, PLAN-023, FEED-003 (region and radius), ADR-0001, ADR-0003, ADR-0009
- **Supersedes:** — · **Superseded by:** —

## Context

Hosts pick a plan's place on a map, by searching or by dropping a pin; the plan's public region is the Swiss municipality taken from that point; accepted participants see the place on a map (PLAN-006, PLAN-007). The map must also run in the browser preview (ADR-0009). Map-tile and search requests reveal which area someone looks at and what they search, which touches ADR-0001. This ADR decides the map data, the renderer, place search and the municipality lookup. "Open in maps" (PLAN-023) hands the place to the phone's own maps app and is not affected.

## Decision drivers

1. Privacy and data residency: as little map traffic to third parties as possible, nothing to big US platforms (ADR-0001; `constitution.md` → Privacy)
2. Works in Expo SDK 58 on iOS and Android, plus the browser preview (ADR-0003, ADR-0009)
3. Near-zero cost (boss, 2026-11-08; `vision.md` → Budget)
4. Light operations on our Swiss Docker servers (ADR-0004)
5. Map quality for Switzerland and local names (pilot in Oberwallis)
6. Low lock-in; licence and attribution we can meet

Assumed scale: about 500 active members, about 10,000 map views and 1,000 searches a month; 10 times that for the growth check.

## Options

### A) The phones' maps (Apple Maps on iOS, Google Maps on Android)
Via `expo-maps` or `react-native-maps`; Google Maps JS in the browser preview; search through Google Places.
- **Pros:** familiar look; place search finds businesses.
- **Cons:** tiles and searches go to Apple and Google (US); neither library has place search, so iOS needs native code or Google Places on both; no web support, so a separate web component; Google's terms allow caching coordinates from Places for 30 days only, which clashes with storing a plan's place; billing must be enabled.
- **Cost and effort:** free at our scale; about USD 0–150 a month at 10 times (estimate); medium effort.
- **Sources:** docs.expo.dev/versions/latest/sdk/maps · github.com/react-native-maps/react-native-maps · developers.google.com/maps/billing-and-pricing/pricing · cloud.google.com/maps-platform/terms/maps-service-terms · apple.com/legal/privacy/data/en/apple-maps (all checked 2026-11-10 by architect-reviewer)

### B1) swisstopo (geo.admin.ch), tiles self-hosted, search through our backend
The official swisstopo vector base map, downloaded and served as one PMTiles file from our Swiss server; MapLibre renders it (`@maplibre/maplibre-react-native` on iOS and Android, `maplibre-gl` with the `pmtiles` add-on in the browser preview, one shared style); place search and the municipality lookup go through the Go backend to the geo.admin.ch search and identify APIs, so the member's IP never leaves our servers, only the query text.
- **Pros:** official Swiss data with local names; free, no key, no registration; no runtime map traffic from the app to third parties; the backend computes the municipality (BFS number) from the stored point and never trusts one sent by the app.
- **Cons:** search finds places, addresses, stations, lifts, lakes and mountains, but no businesses (restaurants, shops), and not every informal name (a test for "Talstation Blatten" found only the bus stop "Blatten b. Naters, Luftseilbahn"; "Belalp" and "Bettmersee" were found); the tile file must be refreshed now and then; geo.admin.ch runs on AWS (Frankfurt, with edges including Zurich), with best-effort availability.
- **Cost and effort:** free; one file of about 900 MB on our server, refreshed a few times a year; the search proxy is a small backend endpoint.
- **Sources:** geo.admin.ch/en/general-terms-of-use-fsdi (free, no registration, fair use up to about 20,000 users a day in web apps; checked by Claude 2026-11-10) · docs.geo.admin.ch/visualize-data/vector-tiles.html · api3.geo.admin.ch/rest/services/api/SearchServer · docs.geo.admin.ch/access-data/identify-features.html · maplibre.org/maplibre-react-native/docs/setup/expo (config plugin, no Expo Go; checked by Claude 2026-11-10) · github.com/maplibre/maplibre-gl-js/releases (checked 2026-11-10 by architect-reviewer)

### B1-direct) swisstopo, straight from geo.admin.ch
As B1, but the app loads tiles directly from geo.admin.ch.
- **Pros:** nothing to host.
- **Cons:** every map view sends the member's IP and the viewed area to geo.admin.ch (federal office, AWS-hosted).
- **Cost and effort:** free; least effort. Suits development and the local prototype.

### C) Self-hosted OpenStreetMap
A Switzerland extract of OpenStreetMap as PMTiles on our server, plus a self-hosted geocoder (Photon, Java) for search and reverse lookup.
- **Pros:** fully private; search probably finds more informal names and some businesses.
- **Cons:** the heaviest operations: a Java service and regular data refreshes; OpenStreetMap quality in the Alps is good but not official.
- **Cost and effort:** free apart from server capacity; most effort.
- **Sources:** docs.protomaps.com/basemaps/downloads · github.com/komoot/photon (checked 2026-11-10 by architect-reviewer)

MapTiler (a Swiss company) was also checked and left out: its free plan is for testing and non-commercial use and pauses at its limits, the paid plan costs about USD 30 a month at our scale and about USD 400 at 10 times, and its EU endpoint is paid-only (maptiler.com/cloud/pricing, checked 2026-11-10 by architect-reviewer).

### Comparison

| Driver | A | B1 | B1-direct | C |
|---|---|---|---|---|
| Privacy / residency | fails: Apple and Google | meets | partly: IP and area to geo.admin.ch | meets |
| Expo 58 + browser preview | partly: separate web component, iOS search needs native code | meets | meets | meets |
| Cost at our scale / 10x | meets / partly | meets / meets | meets / meets | meets / meets |
| Operations | meets | partly: one file, refreshed a few times a year | meets | partly: Java service and refreshes |
| Swiss map quality | partly (not verified) | meets: official data | meets | meets |
| Place search | meets, incl. businesses | partly: no businesses, some informal names missing | partly | probably better (not verified) |
| Lock-in / licence | fails: 30-day coordinate cache | meets | meets | meets |

**Recommendation (Claude):** B1, because it is the only option that is free, uses official Swiss data and sends no map traffic from the app to third parties. Development and the local prototype can load tiles straight from geo.admin.ch (B1-direct); switching to our own tile file before the pilot is a URL change. Would change if members must find businesses by name (then add Photon from C behind the same backend search, or accept A's privacy cost) or if there is no time at all for a yearly file refresh (then B1-direct). Reversal cost: low between B1 and C (same renderer, style format and stored data: coordinates plus the BFS number); medium to high to or from A.
**Not verified:** whether the current `@maplibre/maplibre-react-native` requires React Native's New Architecture and which minimum version (reported by architect-reviewer, not confirmed on the setup page); the self-hosting licence of the font in swisstopo's style (an open font can replace it); whether the base map shows hiking trails; the size of a Swiss PMTiles extract and Photon's disk and RAM needs; Apple's data handling for MapKit in third-party apps; geo.admin.ch's current logging.

## Decision

<Pending the boss's choice.>

## Consequences

- **Follow-ups:** to be written with the decision.
