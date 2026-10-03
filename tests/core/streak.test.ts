import { bestStreak, computeStreakInfo, currentStreak, glowLevel } from '../../core/streak';
import { DayStatus } from '../../core/types';

describe('streak', () => {
  describe('glowLevel', () => {
    it('returns level 0 for streaks 0-2', () => {
      expect(glowLevel(0)).toBe(0);
      expect(glowLevel(1)).toBe(0);
      expect(glowLevel(2)).toBe(0);
    });

    it('returns level 1 for streaks 3-6', () => {
      expect(glowLevel(3)).toBe(1);
      expect(glowLevel(6)).toBe(1);
    });

    it('returns level 2 for streaks 7-13', () => {
      expect(glowLevel(7)).toBe(2);
      expect(glowLevel(13)).toBe(2);
    });

    it('returns level 3 for streaks 14-24', () => {
      expect(glowLevel(14)).toBe(3);
      expect(glowLevel(24)).toBe(3);
    });

    it('returns level 4 for streaks 25 and above', () => {
      expect(glowLevel(25)).toBe(4);
      expect(glowLevel(40)).toBe(4);
      expect(glowLevel(120)).toBe(4);
    });
  });

  describe('currentStreak', () => {
    it('counts consecutive sealed days up to today when today is sealed', () => {
      const statuses: Record<number, DayStatus> = {
        1: 'sealed',
        2: 'sealed',
        3: 'sealed',
        4: 'today',
      };
      // Day 3 is today and sealed
      expect(currentStreak(statuses, 3, 10)).toBe(3);
    });

    it('uses yesterday when today is unsealed', () => {
      const statuses: Record<number, DayStatus> = {
        1: 'sealed',
        2: 'sealed',
        3: 'sealed',
        4: 'today', // Day 4 is today, not yet sealed
      };
      expect(currentStreak(statuses, 4, 10)).toBe(3);
    });

    it('breaks the streak after a gap without moving dates', () => {
      const statuses: Record<number, DayStatus> = {
        1: 'sealed',
        2: 'gap', // missed
        3: 'sealed',
        4: 'today', // Day 4 is today
      };
      // Yesterday (Day 3) is sealed, Day 2 is gap -> current streak is 1
      expect(currentStreak(statuses, 4, 10)).toBe(1);
    });

    it('is 0 if yesterday was a gap and today is unsealed', () => {
      const statuses: Record<number, DayStatus> = {
        1: 'sealed',
        2: 'gap', // Day 2 was missed
        3: 'today', // Day 3 is today, unsealed
      };
      expect(currentStreak(statuses, 3, 10)).toBe(0);
    });

    it('does NOT restore streak when a gap is madeUp', () => {
      const statuses: Record<number, DayStatus> = {
        1: 'sealed',
        2: 'madeUp', // made up gap
        3: 'sealed',
        4: 'today',
      };
      // Day 2 is madeUp, not sealed -> streak is broken at Day 2
      expect(currentStreak(statuses, 4, 10)).toBe(1);
    });

    it('returns 0 before journey starts', () => {
      expect(currentStreak({}, 0, 10)).toBe(0);
    });

    it('counts backwards from final day after journey ends', () => {
      const statuses: Record<number, DayStatus> = {
        1: 'sealed',
        2: 'sealed',
        3: 'sealed',
      };
      // Today is past end (null)
      expect(currentStreak(statuses, null, 3)).toBe(3);
    });
  });

  describe('bestStreak', () => {
    it('computes the longest consecutive sealed run across days', () => {
      const statuses: Record<number, DayStatus> = {
        1: 'sealed',
        2: 'sealed',
        3: 'sealed',
        4: 'gap',
        5: 'sealed',
        6: 'sealed',
      };
      expect(bestStreak(statuses, 6)).toBe(3);
    });

    it('updates when a new run exceeds the previous best', () => {
      const statuses: Record<number, DayStatus> = {
        1: 'sealed',
        2: 'gap',
        3: 'sealed',
        4: 'sealed',
        5: 'sealed',
        6: 'sealed',
      };
      expect(bestStreak(statuses, 6)).toBe(4);
    });
  });

  describe('computeStreakInfo', () => {
    it('returns current, best, and glow level in one call', () => {
      const statuses: Record<number, DayStatus> = {
        1: 'sealed',
        2: 'sealed',
        3: 'sealed',
      };
      const info = computeStreakInfo(statuses, 3, 10);
      expect(info.currentStreak).toBe(3);
      expect(info.bestStreak).toBe(3);
      expect(info.glowLevel).toBe(1);
    });
  });
});
