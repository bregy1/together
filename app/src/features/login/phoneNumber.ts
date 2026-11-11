// The app's own format check of a phone number, only to save a round trip: the server
// decides whether a number is accepted. After normalising, a number must be exactly
// `+41` and nine digits; another country code is "not Swiss", anything else "invalid".
// The field accepts spaces, a leading 0, `+41` and `0041`.
// spec: ONB-001, ONB-002

export type PhoneCheck = { kind: 'ok'; e164: string } | { kind: 'invalid' } | { kind: 'notSwiss' };

export const SWISS_COUNTRY_CODE = '+41';
const NATIONAL_DIGITS = 9;

/** Keeps only what a phone number can contain while typing: digits, spaces and `+`. */
export function sanitizePhoneInput(text: string): string {
  return text.replace(/[^\d+ ]/g, '');
}

export function checkPhoneNumber(input: string): PhoneCheck {
  let compact = input.replace(/\s+/g, '');
  if (compact.startsWith('00')) compact = `+${compact.slice(2)}`;

  let national = compact;
  if (compact.startsWith('+')) {
    if (compact.startsWith(SWISS_COUNTRY_CODE)) {
      national = compact.slice(SWISS_COUNTRY_CODE.length);
    } else if (SWISS_COUNTRY_CODE.startsWith(compact)) {
      // Only "+" or "+4" so far: too short to tell the country.
      return { kind: 'invalid' };
    } else {
      return { kind: 'notSwiss' };
    }
  }
  // The trunk prefix 0 is not part of the international form ("079…" → "+4179…").
  national = national.replace(/^0/, '');

  if (!/^\d+$/.test(national) || national.length !== NATIONAL_DIGITS) return { kind: 'invalid' };
  return { kind: 'ok', e164: `${SWISS_COUNTRY_CODE}${national}` };
}

/** The Swiss grouping of a `+41` number: "79 123 45 67" and "+41 79 123 45 67". */
export function formatSwissNumber(e164: string): { national: string; international: string } {
  const digits = e164.slice(SWISS_COUNTRY_CODE.length);
  const national = [digits.slice(0, 2), digits.slice(2, 5), digits.slice(5, 7), digits.slice(7)].filter(Boolean).join(' ');
  return { national, international: `${SWISS_COUNTRY_CODE} ${national}` };
}
