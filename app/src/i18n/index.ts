// i18n setup: i18next + react-i18next, language from the device, German as the
// source language and fallback.
// spec: NFR-INTL-001, ADR-0007
import { getLocales } from 'expo-localization';
import { createInstance, type Resource } from 'i18next';
import { initReactI18next } from 'react-i18next';

import { localeFiles } from './localeFiles';

export const SOURCE_LANGUAGE = 'de';
export const NAMESPACE = 'translation';

/** Builds the i18next resources from the locale files: `./fr.json` becomes language `fr`. */
function resourcesFromFiles(files: { (key: string): unknown; keys(): string[] }): Resource {
  return Object.fromEntries(
    files.keys().map((key) => {
      const language = key.replace(/^.*\//, '').replace(/\.json$/, '');
      const content = files(key) as { default?: unknown } | Record<string, unknown>;
      const messages = (content as { default?: unknown }).default ?? content;
      return [language, { [NAMESPACE]: messages as Record<string, unknown> }];
    }),
  );
}

export const resources = resourcesFromFiles(localeFiles);
export const supportedLanguages = Object.keys(resources);

/** The first preferred device language that has a translation, else German. */
export function pickLanguage(
  deviceLocales: readonly { languageCode: string | null }[],
  available: readonly string[] = supportedLanguages,
): string {
  const match = deviceLocales.find((locale) => locale.languageCode && available.includes(locale.languageCode));
  return match?.languageCode ?? SOURCE_LANGUAGE;
}

export const i18n = createInstance();

void i18n.use(initReactI18next).init({
  resources,
  lng: pickLanguage(getLocales()),
  fallbackLng: SOURCE_LANGUAGE,
  ns: [NAMESPACE],
  defaultNS: NAMESPACE,
  interpolation: { escapeValue: false },
  initAsync: false,
});

// Typed keys: the German source file defines which keys exist.
declare module 'i18next' {
  interface CustomTypeOptions {
    defaultNS: typeof NAMESPACE;
    resources: { [NAMESPACE]: typeof import('./locales/de.json') };
  }
}
