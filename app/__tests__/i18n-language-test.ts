/**
 * @spec NFR-INTL-001.S2
 * The language comes from the device's preferred languages and falls back to
 * German, the source language; the list of languages comes from the files.
 */
import { pickLanguage, SOURCE_LANGUAGE, supportedLanguages } from '../src/i18n';

describe('@spec NFR-INTL-001.S2 language selection', () => {
  it('uses German as the source language and finds it among the locale files', () => {
    expect(SOURCE_LANGUAGE).toBe('de');
    expect(supportedLanguages).toContain('de');
  });

  it('takes the first preferred device language that has a translation', () => {
    expect(pickLanguage([{ languageCode: 'it' }, { languageCode: 'fr' }, { languageCode: 'de' }], ['de', 'fr'])).toBe('fr');
  });

  it('falls back to German when no device language has a translation', () => {
    expect(pickLanguage([{ languageCode: 'it' }, { languageCode: null }], ['de'])).toBe('de');
    expect(pickLanguage([], ['de'])).toBe('de');
  });
});
