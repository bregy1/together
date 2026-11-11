// The app's own checks on SCR-onb-about, only to save a round trip and to show the age
// for confirmation: the server decides every rule. "Today" is the date in Switzerland
// (Europe/Zurich); turning 18 today counts as 18.
// spec: ONB-009, ONB-010, ONB-011
export const FIRST_NAME_MAX = 30;
export const MINIMUM_AGE = 18;

/** Letters (with accents, also as combining marks), spaces, hyphens and apostrophes. */
const FIRST_NAME_PATTERN = /^[\p{L}\p{M} '’-]+$/u;

export type FirstNameCheck = 'ok' | 'required' | 'invalid';

export function checkFirstName(value: string): FirstNameCheck {
  if (value.trim() === '') return 'required';
  if (Array.from(value).length > FIRST_NAME_MAX || !FIRST_NAME_PATTERN.test(value)) return 'invalid';
  return 'ok';
}

export type CalendarDate = { year: number; month: number; day: number };

/** Today's calendar date in Switzerland. */
export function todayInSwitzerland(now: Date = new Date(Date.now())): CalendarDate {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Europe/Zurich',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(now);
  const part = (type: Intl.DateTimeFormatPartTypes) => Number(parts.find((p) => p.type === type)?.value);
  return { year: part('year'), month: part('month'), day: part('day') };
}

/** Whole years from `birth` to `today`. */
export function ageOn(birth: CalendarDate, today: CalendarDate): number {
  const hadBirthday = today.month > birth.month || (today.month === birth.month && today.day >= birth.day);
  return today.year - birth.year - (hadBirthday ? 0 : 1);
}

export type BirthDateCheck = { kind: 'ok'; iso: string; age: number } | { kind: 'invalid' };

function compare(a: CalendarDate, b: CalendarDate): number {
  return a.year - b.year || a.month - b.month || a.day - b.day;
}

const pad = (n: number, width: number) => String(n).padStart(width, '0');

/** Checks the three fields: the date must exist and must not lie in the future. */
export function checkBirthDate(day: string, month: string, year: string, today: CalendarDate): BirthDateCheck {
  if (!/^\d{1,2}$/.test(day) || !/^\d{1,2}$/.test(month) || !/^\d{4}$/.test(year)) return { kind: 'invalid' };
  const date = { year: Number(year), month: Number(month), day: Number(day) };
  if (date.month < 1 || date.month > 12 || date.day < 1) return { kind: 'invalid' };
  // Day 0 of the next month is the last day of this month.
  const daysInMonth = new Date(Date.UTC(date.year, date.month, 0)).getUTCDate();
  if (date.day > daysInMonth) return { kind: 'invalid' };
  if (compare(date, today) > 0) return { kind: 'invalid' };
  return {
    kind: 'ok',
    iso: `${pad(date.year, 4)}-${pad(date.month, 2)}-${pad(date.day, 2)}`,
    age: ageOn(date, today),
  };
}

/** Splits a saved `YYYY-MM-DD` into the three fields. */
export function splitIsoDate(iso: string | undefined): { day: string; month: string; year: string } {
  const match = iso ? /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso) : null;
  return match ? { year: match[1], month: match[2], day: match[3] } : { day: '', month: '', year: '' };
}
