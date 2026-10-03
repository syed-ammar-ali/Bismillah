import { getMilestoneDays, isMilestone, unseenCelebrations } from '../../core/milestones';
import { DayStatus, Journey } from '../../core/types';

describe('milestones', () => {
  const baseJourney: Journey = {
    id: 'journey-1',
    name: 'Ramadan 1448',
    calendarType: 'hijri',
    startInput: '1448-09-01',
    endInput: '1448-09-30',
    startDate: '2026-10-01',
    endDate: '2026-10-30',
    totalDays: 30,
    sortOrder: 0,
    createdAt: '2026-10-01T00:00:00.000Z',
    completionShownAt: null,
  };

  describe('isMilestone', () => {
    it('returns true for every 10th day', () => {
      expect(isMilestone(10, 40)).toBe(true);
      expect(isMilestone(20, 40)).toBe(true);
      expect(isMilestone(30, 40)).toBe(true);
      expect(isMilestone(40, 40)).toBe(true);
    });

    it('returns true for the final day even if not a multiple of 10', () => {
      expect(isMilestone(29, 29)).toBe(true);
      expect(isMilestone(35, 35)).toBe(true);
      expect(isMilestone(7, 7)).toBe(true);
    });

    it('returns false for non-milestone days and invalid inputs', () => {
      expect(isMilestone(1, 30)).toBe(false);
      expect(isMilestone(9, 30)).toBe(false);
      expect(isMilestone(11, 30)).toBe(false);
      expect(isMilestone(0, 30)).toBe(false);
      expect(isMilestone(-5, 30)).toBe(false);
    });
  });

  describe('getMilestoneDays', () => {
    it('returns list of milestone days up to totalDays', () => {
      expect(getMilestoneDays(25)).toEqual([10, 20, 25]);
      expect(getMilestoneDays(30)).toEqual([10, 20, 30]);
      expect(getMilestoneDays(9)).toEqual([9]);
      expect(getMilestoneDays(0)).toEqual([]);
    });
  });

  describe('unseenCelebrations', () => {
    it('returns milestone celebration for sealed milestone day not yet seen', () => {
      const dayStatuses: Record<number, DayStatus> = {
        10: 'sealed',
      };
      const celebrations = unseenCelebrations(baseJourney, dayStatuses, [], '2026-10-10');
      expect(celebrations).toEqual([
        {
          id: 'milestone-journey-1-10',
          type: 'milestone',
          journeyId: 'journey-1',
          dayNumber: 10,
        },
      ]);
    });

    it('ignores milestones that are already seen or not sealed', () => {
      const dayStatuses: Record<number, DayStatus> = {
        10: 'sealed',
        20: 'gap',
      };
      const celebrations = unseenCelebrations(baseJourney, dayStatuses, [10], '2026-10-20');
      expect(celebrations).toEqual([]);
    });

    it('returns completion celebration when final day is sealed and completionShownAt is null', () => {
      const dayStatuses: Record<number, DayStatus> = {
        30: 'sealed',
      };
      const celebrations = unseenCelebrations(baseJourney, dayStatuses, [30], '2026-10-30');
      expect(celebrations).toEqual([
        {
          id: 'completion-journey-1',
          type: 'completion',
          journeyId: 'journey-1',
        },
      ]);
    });

    it('returns completion celebration when today is past journey endDate', () => {
      const dayStatuses: Record<number, DayStatus> = {};
      const celebrations = unseenCelebrations(baseJourney, dayStatuses, [], '2026-10-31');
      expect(celebrations).toEqual([
        {
          id: 'completion-journey-1',
          type: 'completion',
          journeyId: 'journey-1',
        },
      ]);
    });

    it('does not return completion celebration if completionShownAt is already set', () => {
      const completedJourney: Journey = {
        ...baseJourney,
        completionShownAt: '2026-10-30T22:00:00.000Z',
      };
      const dayStatuses: Record<number, DayStatus> = {
        30: 'sealed',
      };
      const celebrations = unseenCelebrations(completedJourney, dayStatuses, [30], '2026-10-31');
      expect(celebrations).toEqual([]);
    });
  });
});
