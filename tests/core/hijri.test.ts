import { fromHijri, getHijriDaysInMonth, HIJRI_MONTH_NAMES, toHijri } from '../../core/hijri';

describe('hijri', () => {
  it('has 12 Hijri month names', () => {
    expect(HIJRI_MONTH_NAMES).toHaveLength(12);
    expect(HIJRI_MONTH_NAMES[0]).toBe('Muharram');
    expect(HIJRI_MONTH_NAMES[8]).toBe('Ramadan');
    expect(HIJRI_MONTH_NAMES[11]).toBe('Dhu al-Hijjah');
  });

  describe('daysInMonth', () => {
    it('returns either 29 or 30 days for any month', () => {
      for (let m = 1; m <= 12; m++) {
        const days = getHijriDaysInMonth(1448, m);
        expect(days === 29 || days === 30).toBe(true);
      }
    });
  });

  describe('toHijri and fromHijri', () => {
    it('converts Gregorian to Hijri accurately', () => {
      const h = toHijri('2026-10-03', 0);
      expect(h.year).toBe(1448);
      expect(h.month).toBe(4);
      expect(h.day).toBe(22);
      expect(h.monthName).toBe("Rabi' al-Thani");
      expect(h.formatted).toBe("22 Rabi' al-Thani 1448");
    });

    it('round-trips between fromHijri and toHijri with 0 adjustment', () => {
      const originalGregorian = '2026-10-03';
      const hijri = toHijri(originalGregorian, 0);
      const converted = fromHijri(hijri.year, hijri.month, hijri.day, 0);
      expect(converted.gregorianDate).toBe(originalGregorian);
    });

    it('respects +1 adjustment correctly', () => {
      const base = toHijri('2026-10-03', 0);
      const plusOne = toHijri('2026-10-03', 1);
      // Adding 1 day forward in Gregorian yields 1 day forward in Hijri
      expect(plusOne.day).toBe(base.day + 1);

      // Invertibility with +1 adjustment
      const resolved = fromHijri(plusOne.year, plusOne.month, plusOne.day, 1);
      expect(resolved.gregorianDate).toBe('2026-10-03');
    });

    it('respects -1 adjustment correctly', () => {
      const base = toHijri('2026-10-03', 0);
      const minusOne = toHijri('2026-10-03', -1);
      expect(minusOne.day).toBe(base.day - 1);

      // Invertibility with -1 adjustment
      const resolved = fromHijri(minusOne.year, minusOne.month, minusOne.day, -1);
      expect(resolved.gregorianDate).toBe('2026-10-03');
    });

    it('handles month boundaries properly with adjustments', () => {
      // 1st of Ramadan 1448
      const gFirst = fromHijri(1448, 9, 1, 0).gregorianDate;
      const hNormal = toHijri(gFirst, 0);
      expect(hNormal.month).toBe(9);
      expect(hNormal.day).toBe(1);

      // With -1 adjustment on the 1st of Ramadan, it should be the last day of Sha'ban (month 8)
      const hPrev = toHijri(gFirst, -1);
      expect(hPrev.month).toBe(8);
      const daysInShaban = getHijriDaysInMonth(1448, 8);
      expect(hPrev.day).toBe(daysInShaban);
    });
  });
});
