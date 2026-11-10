// Every JSON file in ./locales is a language (de.json, fr.json, en.json …).
// Metro bundles them through require.context (enabled by Expo's Metro config),
// so a new language ships by adding its file; no code changes.
// spec: NFR-INTL-001, ADR-0007
export const localeFiles = require.context('./locales', false, /\.json$/);
