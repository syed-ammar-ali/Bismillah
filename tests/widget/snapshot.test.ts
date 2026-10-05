import { ClockPort } from '../../core/ports';
import { Journey } from '../../core/types';
import { buildWidgetSnapshot } from '../../widget/snapshot';
import {
  FakeCompletionRepo,
  FakeJourneyRepo,
  FakeSettingsRepo,
  FakeTaskRepo,
} from '../fakes/fakeRepos';

describe('widget snapshot', () => {
  let journeyRepo: FakeJourneyRepo;
  let taskRepo: FakeTaskRepo;
  let completionRepo: FakeCompletionRepo;
  let settingsRepo: FakeSettingsRepo;
  const fakeClock: ClockPort = {
    today: () => '2026-10-10',
  };

  const sampleJourney: Journey = {
    id: 'j-1',
    name: '40 Days of Fajr',
    calendarType: 'gregorian',
    startInput: '2026-10-01',
    endInput: '2026-11-09',
    startDate: '2026-10-01',
    endDate: '2026-11-09',
    totalDays: 40,
    sortOrder: 0,
    createdAt: '2026-10-01T00:00:00.000Z',
    completionShownAt: null,
  };

  beforeEach(() => {
    journeyRepo = new FakeJourneyRepo();
    taskRepo = new FakeTaskRepo();
    completionRepo = new FakeCompletionRepo();
    settingsRepo = new FakeSettingsRepo();
  });

  it('returns empty journeys list when no journeys exist', async () => {
    const snapshot = await buildWidgetSnapshot({
      journeyRepo,
      taskRepo,
      completionRepo,
      settingsRepo,
      clock: fakeClock,
    });

    expect(snapshot.date).toBe('2026-10-10');
    expect(snapshot.journeys).toHaveLength(0);
    expect(snapshot.hijriLabel).toBeDefined();
    expect(typeof snapshot.hijriLabel).toBe('string');
  });

  it('correctly calculates done, total, pending tasks and streak for active journey', async () => {
    await journeyRepo.create(sampleJourney);
    await taskRepo.createMany([
      {
        id: 't-1',
        journeyId: 'j-1',
        title: 'Fajr in congregation',
        kind: 'daily',
        sortOrder: 0,
        activeFromDay: 1,
      },
      {
        id: 't-2',
        journeyId: 'j-1',
        title: 'Morning Adhkar',
        kind: 'daily',
        sortOrder: 1,
        activeFromDay: 1,
      },
      {
        id: 't-3',
        journeyId: 'j-1',
        title: 'Quran reading',
        kind: 'daily',
        sortOrder: 2,
        activeFromDay: 1,
      },
    ]);

    // Complete 1 of the 3 tasks for Day 10 (today is 2026-10-10 -> Day 10)
    await completionRepo.add({
      id: 'c-1',
      journeyId: 'j-1',
      taskId: 't-1',
      dayNumber: 10,
      completedAt: '2026-10-10T06:00:00.000Z',
    });

    const snapshot = await buildWidgetSnapshot({
      journeyRepo,
      taskRepo,
      completionRepo,
      settingsRepo,
      clock: fakeClock,
    });

    expect(snapshot.journeys).toHaveLength(1);
    const jSummary = snapshot.journeys[0];
    expect(jSummary?.id).toBe('j-1');
    expect(jSummary?.dayNumber).toBe(10);
    expect(jSummary?.total).toBe(3);
    expect(jSummary?.done).toBe(1);
    expect(jSummary?.pendingTasks).toHaveLength(2);
    expect(jSummary?.pendingTasks[0]?.title).toBe('Morning Adhkar');
    expect(jSummary?.pendingTasks[1]?.title).toBe('Quran reading');
  });

  it('shows all tasks completed when all daily tasks are ticked', async () => {
    await journeyRepo.create(sampleJourney);
    await taskRepo.create({
      id: 't-only',
      journeyId: 'j-1',
      title: 'Fajr',
      kind: 'daily',
      sortOrder: 0,
      activeFromDay: 1,
    });

    await completionRepo.add({
      id: 'c-only',
      journeyId: 'j-1',
      taskId: 't-only',
      dayNumber: 10,
      completedAt: '2026-10-10T06:00:00.000Z',
    });

    const snapshot = await buildWidgetSnapshot({
      journeyRepo,
      taskRepo,
      completionRepo,
      settingsRepo,
      clock: fakeClock,
    });

    expect(snapshot.journeys).toHaveLength(1);
    const jSummary = snapshot.journeys[0];
    expect(jSummary?.done).toBe(1);
    expect(jSummary?.total).toBe(1);
    expect(jSummary?.pendingTasks).toHaveLength(0);
  });
});
