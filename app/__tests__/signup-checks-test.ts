/**
 * The app's own checks on SCR-onb-about: first-name format, birth-date existence and the
 * age on today's date in Switzerland. The server decides; these only save a round trip.
 * spec: ONB-009, ONB-010, ONB-011
 */
import { checkBirthDate, checkFirstName, todayInSwitzerland } from '../src/features/signup/aboutChecks';

describe('first name', () => {
  it.each(['Zoë-Marie', "D'Arcy", 'Anna Lena', 'Zoë’s', 'Ångström', 'x'.repeat(30)])('accepts %s', (name) => {
    expect(checkFirstName(name)).toBe('ok');
  });
  it.each(['Anna2', 'Anna😀', 'Anna_', 'x'.repeat(31)])('refuses %s as invalid', (name) => {
    expect(checkFirstName(name)).toBe('invalid');
  });
  it.each(['', '   '])('treats %p as missing', (name) => {
    expect(checkFirstName(name)).toBe('required');
  });
});

describe('birth date', () => {
  const today = { year: 2026, month: 11, day: 11 };

  it('refuses dates that do not exist, incomplete dates and dates in the future', () => {
    for (const [d, m, y] of [
      ['31', '02', '1990'],
      ['29', '02', '2001'],
      ['00', '01', '1990'],
      ['01', '13', '1990'],
      ['1', '1', '90'],
      ['', '', ''],
      ['12', '11', '2026'],
    ]) {
      expect(checkBirthDate(d, m, y, today)).toEqual({ kind: 'invalid' });
    }
  });

  it('accepts a leap day and computes the age, counting a birthday today', () => {
    expect(checkBirthDate('29', '02', '2000', today)).toEqual({ kind: 'ok', iso: '2000-02-29', age: 26 });
    expect(checkBirthDate('11', '11', '2008', today)).toEqual({ kind: 'ok', iso: '2008-11-11', age: 18 });
    expect(checkBirthDate('12', '11', '2008', today)).toEqual({ kind: 'ok', iso: '2008-11-12', age: 17 });
    expect(checkBirthDate('5', '3', '1997', today)).toEqual({ kind: 'ok', iso: '1997-03-05', age: 29 });
  });

  it('takes today in Switzerland, not on the device clock', () => {
    // 23:30 UTC on 10 November is already 11 November in Zurich (UTC+1 in winter).
    expect(todayInSwitzerland(new Date('2026-11-10T23:30:00Z'))).toEqual({ year: 2026, month: 11, day: 11 });
    // 22:30 UTC on 30 June is already 1 July in Zurich (UTC+2 in summer).
    expect(todayInSwitzerland(new Date('2026-06-30T22:30:00Z'))).toEqual({ year: 2026, month: 7, day: 1 });
  });
});
