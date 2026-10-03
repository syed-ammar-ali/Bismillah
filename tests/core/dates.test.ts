import {
  addDaysToDate,
  daysBetween,
  formatDisplayDate,
  formatDisplayDateShort,
  isAfterDate,
  isBeforeDate,
  isSameDate,
  isValidDateString,
  subDaysFromDate,
} from '../../core/dates';

describe('core/dates', () => {
  it('formats display dates correctly', () => {
    const formatted = formatDisplayDate('2026-10-04');
    expect(formatted).toBe('Sunday, 4 October 2026');

    const formattedShort = formatDisplayDateShort('2026-10-04');
    expect(formattedShort).toBe('4 Oct 2026');
  });

  it('validates date strings', () => {
    expect(isValidDateString('2026-10-04')).toBe(true);
    expect(isValidDateString('invalid-date')).toBe(false);
    expect(isValidDateString('2026-02-30')).toBe(false);
  });

  it('calculates days between dates correctly', () => {
    expect(daysBetween('2026-10-01', '2026-10-10')).toBe(9);
    expect(daysBetween('2026-10-10', '2026-10-01')).toBe(-9);
  });

  it('adds and subtracts days correctly', () => {
    expect(addDaysToDate('2026-10-01', 5)).toBe('2026-10-06');
    expect(subDaysFromDate('2026-10-06', 5)).toBe('2026-10-01');
  });

  it('compares dates accurately', () => {
    expect(isBeforeDate('2026-10-01', '2026-10-02')).toBe(true);
    expect(isAfterDate('2026-10-02', '2026-10-01')).toBe(true);
    expect(isSameDate('2026-10-01', '2026-10-01')).toBe(true);
    expect(isSameDate('2026-10-01', '2026-10-02')).toBe(false);
  });
});
