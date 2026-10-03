import { dateFor, dayNumberFor, totalDays } from '../../core/timeline';

describe('timeline', () => {
  const journey = {
    startDate: '2026-10-01',
    endDate: '2026-10-10',
    totalDays: 10,
  };

  describe('totalDays', () => {
    it('computes inclusive day count correctly', () => {
      expect(totalDays('2026-10-01', '2026-10-10')).toBe(10);
      expect(totalDays('2026-10-01', '2026-10-01')).toBe(1);
      expect(totalDays('2026-02-01', '2026-02-28')).toBe(28);
      expect(totalDays('2026-10-01', '2026-11-09')).toBe(40);
    });

    it('returns 0 if end date is before start date', () => {
      expect(totalDays('2026-10-10', '2026-10-01')).toBe(0);
    });
  });

  describe('dayNumberFor', () => {
    it('returns 1 for start date and totalDays for end date', () => {
      expect(dayNumberFor(journey, '2026-10-01')).toBe(1);
      expect(dayNumberFor(journey, '2026-10-05')).toBe(5);
      expect(dayNumberFor(journey, '2026-10-10')).toBe(10);
    });

    it('returns null for dates before start or after end', () => {
      expect(dayNumberFor(journey, '2026-09-30')).toBeNull();
      expect(dayNumberFor(journey, '2026-10-11')).toBeNull();
      expect(dayNumberFor(journey, '2025-01-01')).toBeNull();
    });
  });

  describe('dateFor', () => {
    it('returns the exact Gregorian date for 1..N', () => {
      expect(dateFor(journey, 1)).toBe('2026-10-01');
      expect(dateFor(journey, 5)).toBe('2026-10-05');
      expect(dateFor(journey, 10)).toBe('2026-10-10');
    });

    it('returns null for invalid day numbers', () => {
      expect(dateFor(journey, 0)).toBeNull();
      expect(dateFor(journey, -1)).toBeNull();
      expect(dateFor(journey, 11)).toBeNull();
    });
  });
});
