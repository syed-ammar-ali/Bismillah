import { dayStatus, detectSealTransition } from '../../core/status';
import { Task, TaskCompletion } from '../../core/types';

describe('status', () => {
  const journey = {
    startDate: '2026-10-01',
    totalDays: 10,
  };

  const today = '2026-10-05'; // Day 5 is today

  const dailyTask1: Task = {
    id: 'task-1',
    journeyId: 'j1',
    title: 'Fajr on time',
    kind: 'daily',
    sortOrder: 1,
    activeFromDay: 1,
    activeToDay: null,
  };

  const dailyTask2: Task = {
    id: 'task-2',
    journeyId: 'j1',
    title: 'Read Quran',
    kind: 'daily',
    sortOrder: 2,
    activeFromDay: 1,
    activeToDay: null,
  };

  const makeupTask: Task = {
    id: 'makeup-1',
    journeyId: 'j1',
    title: '100 Astaghfirullah',
    kind: 'makeup',
    sortOrder: 1,
    activeFromDay: 1,
    activeToDay: null,
  };

  it('marks days after today as future', () => {
    const status = dayStatus(journey, 6, today, [dailyTask1], []);
    expect(status).toBe('future');
  });

  it('marks today as today when unsealed', () => {
    const status = dayStatus(journey, 5, today, [dailyTask1, dailyTask2], []);
    expect(status).toBe('today');
  });

  it('marks today as sealed when all daily tasks are completed', () => {
    const completions: TaskCompletion[] = [
      { id: 'c1', journeyId: 'j1', taskId: 'task-1', dayNumber: 5, completedAt: '2026-10-05T10:00:00Z' },
      { id: 'c2', journeyId: 'j1', taskId: 'task-2', dayNumber: 5, completedAt: '2026-10-05T12:00:00Z' },
    ];
    const status = dayStatus(journey, 5, today, [dailyTask1, dailyTask2], completions);
    expect(status).toBe('sealed');
  });

  it('marks past day as sealed if completed', () => {
    const completions: TaskCompletion[] = [
      { id: 'c1', journeyId: 'j1', taskId: 'task-1', dayNumber: 1, completedAt: '2026-10-01T10:00:00Z' },
    ];
    const status = dayStatus(journey, 1, today, [dailyTask1], completions);
    expect(status).toBe('sealed');
  });

  it('marks past unsealed day as gap if no makeup tasks completed', () => {
    const status = dayStatus(journey, 2, today, [dailyTask1], []);
    expect(status).toBe('gap');
  });

  it('marks past gap day as madeUp when all makeup tasks are completed', () => {
    const completions: TaskCompletion[] = [
      { id: 'c1', journeyId: 'j1', taskId: 'makeup-1', dayNumber: 3, completedAt: '2026-10-05T14:00:00Z' },
    ];
    const status = dayStatus(journey, 3, today, [dailyTask1, makeupTask], completions);
    expect(status).toBe('madeUp');
  });

  it('remains gap if journey has no makeup tasks even if someone tries', () => {
    const status = dayStatus(journey, 3, today, [dailyTask1], []);
    expect(status).toBe('gap');
  });

  describe('mid-journey task modifications', () => {
    it('handles tasks added mid-journey (activeFromDay)', () => {
      const addedTask: Task = {
        id: 'task-3',
        journeyId: 'j1',
        title: 'Evening Dhikr',
        kind: 'daily',
        sortOrder: 3,
        activeFromDay: 4, // Added on Day 4
        activeToDay: null,
      };

      const tasks = [dailyTask1, addedTask];

      // On Day 3 (past), addedTask was not active yet, so only task-1 was required
      const day3Completions: TaskCompletion[] = [
        { id: 'c1', journeyId: 'j1', taskId: 'task-1', dayNumber: 3, completedAt: '2026-10-03T10:00:00Z' },
      ];
      expect(dayStatus(journey, 3, today, tasks, day3Completions)).toBe('sealed');

      // On Day 4, addedTask IS active, so both task-1 and task-3 are required
      expect(dayStatus(journey, 4, today, tasks, day3Completions)).toBe('gap');
    });

    it('handles tasks removed mid-journey (activeToDay)', () => {
      const removedTask: Task = {
        id: 'task-old',
        journeyId: 'j1',
        title: 'Old Task',
        kind: 'daily',
        sortOrder: 1,
        activeFromDay: 1,
        activeToDay: 3, // Stopped counting after Day 3
      };

      const tasks = [dailyTask1, removedTask];

      // On Day 4, removedTask is not active, only dailyTask1 is required
      const day4Completions: TaskCompletion[] = [
        { id: 'c1', journeyId: 'j1', taskId: 'task-1', dayNumber: 4, completedAt: '2026-10-04T10:00:00Z' },
      ];
      expect(dayStatus(journey, 4, today, tasks, day4Completions)).toBe('sealed');

      // On Day 2, removedTask was active, so completing only task-1 was not enough
      expect(dayStatus(journey, 2, today, tasks, day4Completions)).toBe('gap');
    });
  });

  describe('detectSealTransition', () => {
    it('detects newly sealed transition', () => {
      const transition = detectSealTransition('today', 'sealed');
      expect(transition.isNewlySealed).toBe(true);
      expect(transition.isUnsealed).toBe(false);
    });

    it('detects unsealed transition when unticking', () => {
      const transition = detectSealTransition('sealed', 'today');
      expect(transition.isNewlySealed).toBe(false);
      expect(transition.isUnsealed).toBe(true);
    });

    it('returns false when status does not cross sealed threshold', () => {
      const transition = detectSealTransition('gap', 'madeUp');
      expect(transition.isNewlySealed).toBe(false);
      expect(transition.isUnsealed).toBe(false);
    });
  });
});
