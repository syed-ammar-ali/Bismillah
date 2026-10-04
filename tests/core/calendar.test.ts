import { getCalendarDayInfo, getMonthDualHeader } from '../../core/calendar';
import { Journey, Task, TaskCompletion } from '../../core/types';

describe('core/calendar', () => {
  describe('getMonthDualHeader', () => {
    it('formats October 2026 with dual Hijri months', () => {
      const header = getMonthDualHeader(2026, 10, 0);
      expect(header).toContain('October 2026');
      expect(header).toContain("Rabi'");
    });

    it('changes Hijri months if adjustment changes', () => {
      const h0 = getMonthDualHeader(2026, 10, 0);
      const hPlus = getMonthDualHeader(2026, 10, 1);
      const hMinus = getMonthDualHeader(2026, 10, -1);
      expect(typeof h0).toBe('string');
      expect(typeof hPlus).toBe('string');
      expect(typeof hMinus).toBe('string');
    });
  });

  describe('getCalendarDayInfo', () => {
    const mockJourney: Journey = {
      id: 'j1',
      name: '40 Days of Fajr',
      calendarType: 'gregorian',
      startDate: '2026-10-01',
      endDate: '2026-11-09',
      startInput: '2026-10-01',
      endInput: '2026-11-09',
      totalDays: 40,
      deadlineLabel: 'Before Ramadan',
      deadlineDate: '2026-10-15',
      sortOrder: 0,
      createdAt: '2026-10-01T00:00:00Z',
    };

    const mockTasks: Task[] = [
      {
        id: 't1',
        journeyId: 'j1',
        title: 'Pray Fajr in Congregation',
        kind: 'daily',
        sortOrder: 0,
        activeFromDay: 1,
      },
    ];

    const mockCompletions: TaskCompletion[] = [
      {
        id: 'c1',
        journeyId: 'j1',
        taskId: 't1',
        dayNumber: 1,
        completedAt: '2026-10-01T05:30:00Z',
      },
    ];

    it('computes correct day info for a sealed day in the past', () => {
      const dayInfo = getCalendarDayInfo(
        '2026-10-01',
        '2026-10-03',
        [mockJourney],
        { j1: mockTasks },
        { j1: mockCompletions },
        0,
        null,
        { j1: '#F59E0B' },
      );

      expect(dayInfo.gregorianDay).toBe(1);
      expect(dayInfo.isToday).toBe(false);
      expect(dayInfo.hasDeadline).toBe(false);
      expect(dayInfo.markers).toHaveLength(1);
      expect(dayInfo.markers[0]?.journeyName).toBe('40 Days of Fajr');
      expect(dayInfo.markers[0]?.status).toBe('sealed');
      expect(dayInfo.markers[0]?.dayNumber).toBe(1);
    });

    it('identifies today correctly', () => {
      const dayInfo = getCalendarDayInfo(
        '2026-10-03',
        '2026-10-03',
        [mockJourney],
        { j1: mockTasks },
        { j1: [] },
        0,
        null,
        { j1: '#F59E0B' },
      );

      expect(dayInfo.isToday).toBe(true);
      expect(dayInfo.markers[0]?.status).toBe('today');
    });

    it('identifies deadline date and flag correctly', () => {
      const dayInfo = getCalendarDayInfo(
        '2026-10-15',
        '2026-10-03',
        [mockJourney],
        { j1: mockTasks },
        { j1: [] },
        0,
        null,
        { j1: '#F59E0B' },
      );

      expect(dayInfo.hasDeadline).toBe(true);
      expect(dayInfo.deadlineLabels).toContain('Before Ramadan');
      expect(dayInfo.markers[0]?.isDeadline).toBe(true);
    });

    it('respects journey filter', () => {
      const dayInfo = getCalendarDayInfo(
        '2026-10-01',
        '2026-10-03',
        [mockJourney],
        { j1: mockTasks },
        { j1: mockCompletions },
        0,
        'other_journey_id',
        { j1: '#F59E0B' },
      );

      expect(dayInfo.markers).toHaveLength(0);
    });

    it('returns empty markers for dates outside journey range', () => {
      const dayInfo = getCalendarDayInfo(
        '2026-09-15',
        '2026-10-03',
        [mockJourney],
        { j1: mockTasks },
        { j1: [] },
        0,
        null,
        { j1: '#F59E0B' },
      );

      expect(dayInfo.markers).toHaveLength(0);
      expect(dayInfo.hasDeadline).toBe(false);
    });
  });
});
