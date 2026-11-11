/**
 * @spec NFR-INTL-001
 * The German source texts for sign-up and sign-in (CR-0001.T06): every key the
 * onboarding requirements, NFR-SEC-002, the sign-up screens and MOD-008 name
 * exists in de.json with a German text, resolved through i18next exactly as the
 * app resolves it. German texts use Swiss spelling (no "ß"). The legal texts are
 * marked as placeholders.
 */
import de from '../src/i18n/locales/de.json';
import legalDe from '../src/i18n/legal/de.json';
import { i18n } from '../src/i18n';

/** Keys the spec names (ONB-001 … ONB-018, ONB-020, NFR-SEC-002, screens.md, MOD-008). */
const SPEC_KEYS = [
  // SCR-onb-phone (ONB-001, ONB-002, ONB-003, NFR-SEC-002)
  'onb.phone.hint',
  'onb.phone.privacy',
  'onb.phone.send',
  'onb.phone.error.notSwiss',
  'onb.phone.error.invalid',
  'onb.phone.error.sendFailed',
  'onb.phone.error.tooMany',
  'onb.phone.error.unavailable',
  // SCR-onb-code (ONB-004, ONB-005, ONB-006)
  'onb.code.error.expired',
  'onb.code.resend',
  'onb.code.changeNumber',
  // SCR-onb-about, SCR-onb-age-stop (ONB-009 … ONB-012)
  'onb.about.firstName',
  'onb.about.error.firstNameRequired',
  'onb.about.error.firstNameInvalid',
  'onb.about.confirmAge',
  'onb.about.region',
  'onb.about.region.noMatch',
  'onb.about.error.regionRequired',
  'onb.age.stop',
  // SCR-onb-interests (ONB-013)
  'onb.interests.limit',
  'onb.interests.noMatch',
  // SCR-onb-photos (ONB-014, ONB-015)
  'onb.photos.error.portraitRequired',
  'onb.photos.permissionDenied',
  // SCR-onb-rules (ONB-016, ONB-017, ONB-018)
  'onb.rules.accept',
  'onb.rules.notDating',
  'onb.error.offline',
  // generic error (direction.md → microcopy)
  'onb.error.generic',
  // Spielregeln (MOD-008)
  'mod.rules.1.title',
  'mod.rules.1.text',
  'mod.rules.2.title',
  'mod.rules.2.text',
  'mod.rules.3.title',
  'mod.rules.3.text',
  'mod.rules.4.title',
  'mod.rules.4.text',
  'mod.rules.5.title',
  'mod.rules.5.text',
  'mod.rules.6.title',
  'mod.rules.6.text',
  'mod.rules.adultsOnly',
] as const;

/** Spec keys with a count, so they come as i18next plurals (_one / _other). */
const SPEC_PLURAL_KEYS = ['onb.code.error.wrong', 'onb.code.resendIn'] as const;

/** Keys the screens need but the spec leaves open (wording drafted by the UX writer). */
const ADDED_KEYS = [
  'onb.step',
  'onb.action.continue',
  'onb.action.back',
  'onb.action.change',
  'onb.action.confirm',
  'onb.action.retry',
  'onb.phone.title',
  'onb.phone.label',
  'onb.phone.placeholder',
  'onb.phone.countryCodeA11y',
  'onb.code.title',
  'onb.code.label',
  'onb.code.placeholder',
  'onb.code.sentTo',
  'onb.about.title',
  'onb.about.firstNamePlaceholder',
  'onb.about.birthDate.label',
  'onb.about.birthDate.day',
  'onb.about.birthDate.month',
  'onb.about.birthDate.year',
  'onb.about.birthDate.dayPlaceholder',
  'onb.about.birthDate.monthPlaceholder',
  'onb.about.birthDate.yearPlaceholder',
  'onb.about.error.birthDateInvalid',
  'onb.about.regionSearch',
  'onb.age.title',
  'onb.interests.title',
  'onb.interests.hint',
  'onb.interests.search',
  'onb.interests.counter',
  'onb.photos.title',
  'onb.photos.hint',
  'onb.photos.portrait',
  'onb.photos.camera',
  'onb.photos.library',
  'onb.photos.remove',
  'onb.photos.openSettings',
  'onb.photos.uploading',
  'onb.photos.error.uploadFailed',
  'onb.photos.a11y.camera',
  'onb.photos.a11y.library',
  'onb.photos.a11y.remove',
  'onb.rules.title',
  'onb.rules.termsLink',
  'onb.rules.privacyLink',
  'onb.rules.finish',
] as const;

/** Keys that existed before this task and must stay. */
const SHELL_KEYS = ['tabs.discover.title', 'tabs.myPlans.title', 'tabs.profile.title', 'shell.notFound.title', 'shell.notFound.backToDiscover'] as const;

const t = i18n.getFixedT('de');

/** Resolves a key through i18next; returns undefined when it is missing or not a string. */
function resolve(key: string, options: Record<string, unknown> = {}): string | undefined {
  if (!i18n.exists(key, { lng: 'de', ...options })) return undefined;
  const value: unknown = t(key as never, { ...options, returnObjects: false } as never);
  return typeof value === 'string' && value.trim() !== '' && value !== key ? value : undefined;
}

function allStrings(value: unknown): string[] {
  if (typeof value === 'string') return [value];
  if (Array.isArray(value)) return value.flatMap(allStrings);
  if (value && typeof value === 'object') return Object.values(value).flatMap(allStrings);
  return [];
}

describe('@spec NFR-INTL-001 German texts for sign-up and sign-in', () => {
  it.each([...SPEC_KEYS, ...ADDED_KEYS, ...SHELL_KEYS])('%s has a German text', (key) => {
    expect(resolve(key)).toBeDefined();
  });

  it.each(SPEC_PLURAL_KEYS)('%s has German plural forms', (key) => {
    const one = resolve(key, { count: 1 });
    const other = resolve(key, { count: 3 });
    expect(one).toBeDefined();
    expect(other).toBeDefined();
    expect(one).toContain('1');
    expect(other).toContain('3');
    expect(one).not.toEqual(other?.replace('3', '1'));
  });

  it('uses the wordings the spec quotes', () => {
    expect(t('onb.phone.send')).toBe('Code senden');
    expect(t('onb.about.confirmAge', { age: 29 })).toBe('Du bist 29. Stimmt das?');
    expect(t('onb.about.region')).toBe('Wo möchtest du etwas unternehmen?');
    expect(t('onb.step', { current: 1, total: 5 })).toBe('Schritt 1 von 5');
    expect(t('onb.error.generic')).toBe('Das hat nicht geklappt. Nochmal?');
    expect(t('mod.rules.1.title')).toBe('Keine Dating-App.');
    expect(t('mod.rules.6.text')).toBe('Wenn etwas nicht okay ist, melde es oder blockiere die Person.');
  });

  it('writes no "ß" (Swiss spelling)', () => {
    const offending = [...allStrings(de), ...allStrings(legalDe)].filter((text) => text.includes('ß'));
    expect(offending).toEqual([]);
  });

  it('marks the legal texts as placeholders', () => {
    for (const doc of [legalDe.terms, legalDe.privacy]) {
      expect(doc.title.trim()).not.toBe('');
      expect(doc.placeholderNotice).toBe('Platzhalter: Der endgültige Text folgt.');
      expect(doc.sections.length).toBeGreaterThan(0);
    }
    expect(legalDe.terms.title).toBe('Nutzungsbedingungen');
    expect(legalDe.privacy.title).toBe('Datenschutzerklärung');
  });
});
