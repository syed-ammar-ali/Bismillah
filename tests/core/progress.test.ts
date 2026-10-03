import { journeyProgress, todayTasks } from '../../core/progress';
import { DayStatus, Task, TaskCompletion } from '../../core/types';

describe('progress', () => {
  describe('journeyProgress', () => {
    it('computes fraction and percentage correctly combining sealed and madeUp days', () => {
      const dayStatuses: Record<number, DayStatus> = {
        1: 'sealed',
        2: 'sealed',
        3: 'gap',
        4: 'madeUp',
        5: 'today',
      };

      const result = journeyProgress({ totalDays: 10 }, dayStatuses);

      expect(result).toEqual({
        totalDays: 10,
        sealedDays: 2,
        gapDays: 1,
        madeUpDays: 1,
        progressFraction: 0.3,
        progressPercent: 30,
      });
    });

    it('handles 0 total days gracefully', () => {
      const result = journeyProgress({ totalDays: 0 }, {});

      expect(result).toEqual({
        totalDays: 0,
        sealedDays: 0,
        gapDays: 0,
        madeUpDays: 0,
        progressFraction: 0,
        progressPercent: 0,
      });
    });

    it('computes 100% when all days are sealed or made up', () => {
      const dayStatuses: Record<number, DayStatus> = {
        1: 'sealed',
        2: 'madeUp',
        3: 'sealed',
      };

      const result = journeyProgress({ totalDays: 3 }, dayStatuses);

      expect(result.progressFraction).toBe(1);
      expect(result.progressPercent).toBe(100);
      expect(result.sealedDays).toBe(2);
      expect(result.madeUpDays).toBe(1);
      expect(result.gapDays).toBe(0);
    });
  });

  describe('todayTasks', () => {
    const tasks: Task[] = [
      {
        id: 'task-1',
        journeyId: 'journey-1',
        title: 'Fajr on time',
        kind: 'daily',
        activeFromDay: 1,
        activeToDay: null,
        sortOrder: 0,
      },
      {
        id: 'task-2',
        journeyId: 'journey-1',
        title: 'Dhuhr on time',
        kind: 'daily',
        activeFromDay: 1,
        activeToDay: 5,
        sortOrder: 1,
      },
      {
        id: 'task-3',
        journeyId: 'journey-1',
        title: 'Make-up fast',
        kind: 'makeup',
        activeFromDay: 2,
        activeToDay: null,
        sortOrder: 2,
      },
      {
        id: 'task-4',
        journeyId: 'journey-1',
        title: 'Read Quran 10 pages',
        kind: 'daily',
        activeFromDay: 6,
        activeToDay: null,
        sortOrder: 3,
      },
    ];

    it('returns only active daily tasks sorted by sortOrder with completion status', () => {
      const completions: TaskCompletion[] = [
        {
          id: 'comp-1',
          journeyId: 'journey-1',
          taskId: 'task-1',
          dayNumber: 3,
          completedAt: '2026-10-03T10:00:00.000Z',
        },
      ];

      const result = todayTasks(3, tasks, completions);

      // task-1 is active (activeFrom 1, to null) and completed
      // task-2 is active (activeFrom 1, to 5) and NOT completed
      // task-3 is kind 'makeup', so excluded from todayTasks
      // task-4 is activeFrom 6, so inactive on day 3
      expect(result).toHaveLength(2);
      expect(result[0]?.id).toBe('task-1');
      expect(result[0]?.isCompleted).toBe(true);
      expect(result[1]?.id).toBe('task-2');
      expect(result[1]?.isCompleted).toBe(false);
    });

    it('returns empty array when no daily tasks are active', () => {
      const result = todayTasks(10, [tasks[1]!], []);
      expect(result).toEqual([]);
    });
  });
});
