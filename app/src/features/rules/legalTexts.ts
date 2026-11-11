// The placeholder terms of use and privacy policy, per language. Only German exists so far;
// a language without its own legal texts gets the German ones.
// spec: ONB-001, ONB-016
import legalDe from '../../i18n/legal/de.json';

export type LegalDoc = 'terms' | 'privacy';
export type LegalText = (typeof legalDe)[LegalDoc];

const legalTexts: Record<string, typeof legalDe> = { de: legalDe };

export function legalText(doc: LegalDoc, language: string): LegalText {
  return (legalTexts[language] ?? legalDe)[doc];
}

/** The document a link asks for; anything else than `terms` opens the privacy policy. */
export function legalDocFrom(param: string | string[] | undefined): LegalDoc {
  const value = Array.isArray(param) ? param[0] : param;
  return value === 'terms' ? 'terms' : 'privacy';
}
