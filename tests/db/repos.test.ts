import {
  FakeCompletionRepo,
  FakeGapNoteRepo,
  FakeJourneyRepo,
  FakeMilestoneRepo,
  FakeSettingsRepo,
  FakeTaskRepo,
} from '../fakes/fakeRepos';

describe('repositories contract', () => {
  describe('JourneyRepo', () => {
    it('creates, reads, updates, archives and deletes journeys', async () => {
      const repo = new FakeJourneyRepo();
      const journey = {
        id: 'j-1',
        name: '40 Days',
        calendarType: 'gregorian' as const,
        startInput: '2026-10-01',
        endInput: '2026-11-09',
        startDate: '2026-10-01',
        endDate: '2026-11-09',
        totalDays: 40,
        sortOrder: 1,
        createdAt: '2026-10-01T00:00:00.000Z',
      };

      await repo.create(journey);
      expect(await repo.getById('j-1')).toEqual(journey);

      const all = await repo.getAll();
      expect(all).toHaveLength(1);

      await repo.update({ id: 'j-1', name: '40 Days Habit' });
      const updated = await repo.getById('j-1');
      expect(updated?.name).toBe('40 Days Habit');

      await repo.archive('j-1', '2026-10-15T00:00:00.000Z');
      expect(await repo.getAll()).toHaveLength(0);
      expect(await repo.getAllIncludingArchived()).toHaveLength(1);

      await repo.delete('j-1');
      expect(await repo.getAllIncludingArchived()).toHaveLength(0);
    });

    it('replaces all journeys in atomic operation', async () => {
      const repo = new FakeJourneyRepo();
      await repo.create({
        id: 'j-old',
        name: 'Old',
        calendarType: 'gregorian',
        startInput: '2026-01-01',
        endInput: '2026-01-10',
        startDate: '2026-01-01',
        endDate: '2026-01-10',
        totalDays: 10,
        sortOrder: 0,
        createdAt: '2026-01-01T00:00:00.000Z',
      });

      const newJourneys = [
        {
          id: 'j-new',
          name: 'New',
          calendarType: 'gregorian' as const,
          startInput: '2026-02-01',
          endInput: '2026-02-10',
          startDate: '2026-02-01',
          endDate: '2026-02-10',
          totalDays: 10,
          sortOrder: 0,
          createdAt: '2026-02-01T00:00:00.000Z',
        },
      ];

      await repo.replaceAll(newJourneys);
      const all = await repo.getAll();
      expect(all).toHaveLength(1);
      expect(all[0]?.id).toBe('j-new');
    });
  });

  describe('TaskRepo', () => {
    it('manages tasks for a journey ordered by sortOrder', async () => {
      const repo = new FakeTaskRepo();
      await repo.createMany([
        {
          id: 't-2',
          journeyId: 'j-1',
          title: 'Second',
          kind: 'daily',
          sortOrder: 2,
          activeFromDay: 1,
        },
        {
          id: 't-1',
          journeyId: 'j-1',
          title: 'First',
          kind: 'daily',
          sortOrder: 1,
          activeFromDay: 1,
        },
      ]);

      const tasks = await repo.getByJourney('j-1');
      expect(tasks).toHaveLength(2);
      expect(tasks[0]?.id).toBe('t-1');
      expect(tasks[1]?.id).toBe('t-2');

      await repo.update({ id: 't-1', title: 'Updated First' });
      expect((await repo.getById('t-1'))?.title).toBe('Updated First');

      await repo.delete('t-2');
      expect(await repo.getByJourney('j-1')).toHaveLength(1);
    });
  });

  describe('CompletionRepo', () => {
    it('handles adding, querying, and removing completions', async () => {
      const repo = new FakeCompletionRepo();
      await repo.add({
        id: 'c-1',
        journeyId: 'j-1',
        taskId: 't-1',
        dayNumber: 5,
        completedAt: '2026-10-05T12:00:00.000Z',
      });
      await repo.add({
        id: 'c-2',
        journeyId: 'j-1',
        taskId: 't-2',
        dayNumber: 5,
        completedAt: '2026-10-05T13:00:00.000Z',
      });

      const day5Comps = await repo.getByDay('j-1', 5);
      expect(day5Comps).toHaveLength(2);

      await repo.remove('t-1', 5);
      expect(await repo.getByDay('j-1', 5)).toHaveLength(1);

      await repo.removeByJourneyAndDay('j-1', 5);
      expect(await repo.getByDay('j-1', 5)).toHaveLength(0);
    });
  });

  describe('GapNoteRepo', () => {
    it('stores, updates, and deletes notes when cleared', async () => {
      const repo = new FakeGapNoteRepo();
      await repo.setNote('j-1', 3, 'Fever');
      expect(await repo.getNote('j-1', 3)).toBe('Fever');

      await repo.setNote('j-1', 3, 'Mild fever');
      expect(await repo.getNote('j-1', 3)).toBe('Mild fever');

      await repo.setNote('j-1', 3, null);
      expect(await repo.getNote('j-1', 3)).toBeNull();
    });
  });

  describe('MilestoneRepo', () => {
    it('tracks seen milestone days', async () => {
      const repo = new FakeMilestoneRepo();
      await repo.markSeen('j-1', 10, '2026-10-10T20:00:00.000Z');
      await repo.markSeen('j-1', 20, '2026-10-20T20:00:00.000Z');

      const seen = await repo.getSeen('j-1');
      expect(seen).toEqual([10, 20]);
    });
  });

  describe('SettingsRepo', () => {
    it('reads defaults, updates individual and multiple keys', async () => {
      const repo = new FakeSettingsRepo();
      expect(await repo.get('reminderTime')).toBe('05:00');
      expect(await repo.get('hijriAdjustment')).toBe(0);

      await repo.set('reminderTime', '06:30');
      expect(await repo.get('reminderTime')).toBe('06:30');

      await repo.setMany({ hijriAdjustment: 1, reminderEnabled: false });
      const all = await repo.getAll();
      expect(all.hijriAdjustment).toBe(1);
      expect(all.reminderEnabled).toBe(false);
      expect(all.reminderTime).toBe('06:30');
    });
  });
});
