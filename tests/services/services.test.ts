import {
  CapabilitiesPort,
  ClockPort,
  NotificationPort,
  SystemSettingsPort,
  WidgetPort,
} from '../../core/ports';
import { Journey } from '../../core/types';
import { createServices } from '../../services/createServices';
import { useJourneyStore } from '../../stores/useJourneyStore';
import { useUiStore } from '../../stores/useUiStore';
import {
  FakeCompletionRepo,
  FakeGapNoteRepo,
  FakeJourneyRepo,
  FakeMilestoneRepo,
  FakeSettingsRepo,
  FakeTaskRepo,
} from '../fakes/fakeRepos';

describe('services', () => {
  let currentDate = '2026-10-10';
  const fakeClock: ClockPort = {
    today: () => currentDate,
  };

  const fakeNotifications: NotificationPort = {
    requestPermission: jest.fn().mockResolvedValue('granted'),
    scheduleDaily: jest.fn().mockResolvedValue(undefined),
    scheduleOnce: jest.fn().mockResolvedValue(undefined),
    cancelAll: jest.fn().mockResolvedValue(undefined),
  };

  const fakeWidget: WidgetPort = {
    refresh: jest.fn().mockResolvedValue(undefined),
  };

  const fakeSystemSettings: SystemSettingsPort = {
    openBatterySettings: jest.fn().mockResolvedValue(undefined),
    openExactAlarmSettings: jest.fn().mockResolvedValue(undefined),
  };

  const fakeCapabilities: CapabilitiesPort = {
    isExpoGo: true,
    supportsWidget: false,
  };

  let repos: {
    journeyRepo: FakeJourneyRepo;
    taskRepo: FakeTaskRepo;
    completionRepo: FakeCompletionRepo;
    gapNoteRepo: FakeGapNoteRepo;
    milestoneRepo: FakeMilestoneRepo;
    settingsRepo: FakeSettingsRepo;
  };

  let services: ReturnType<typeof createServices>;

  const sampleJourney: Journey = {
    id: 'j-1',
    name: '40 Days',
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
    currentDate = '2026-10-10'; // day 10 of sampleJourney
    useUiStore.getState().clearCelebrations();

    repos = {
      journeyRepo: new FakeJourneyRepo(),
      taskRepo: new FakeTaskRepo(),
      completionRepo: new FakeCompletionRepo(),
      gapNoteRepo: new FakeGapNoteRepo(),
      milestoneRepo: new FakeMilestoneRepo(),
      settingsRepo: new FakeSettingsRepo(),
    };

    services = createServices({
      repos,
      clock: fakeClock,
      notifications: fakeNotifications,
      widget: fakeWidget,
      systemSettings: fakeSystemSettings,
      capabilities: fakeCapabilities,
    });
  });

  describe('tickService', () => {
    beforeEach(async () => {
      await repos.journeyRepo.create(sampleJourney);
      await repos.taskRepo.createMany([
        {
          id: 't-1',
          journeyId: 'j-1',
          title: 'Fajr',
          kind: 'daily',
          sortOrder: 0,
          activeFromDay: 1,
        },
        {
          id: 't-2',
          journeyId: 'j-1',
          title: 'Quran',
          kind: 'daily',
          sortOrder: 1,
          activeFromDay: 1,
        },
      ]);
    });

    it('ticking a task records completion and unticking removes it', async () => {
      // Tick task 1 on today (day 10)
      const res1 = await services.tickService.toggle('j-1', 't-1', 10);
      expect(res1.ok).toBe(true);
      if (res1.ok) {
        expect(res1.value.toggledOn).toBe(true);
        expect(res1.value.sealed).toBe(false);
      }

      const comps = await repos.completionRepo.getByDay('j-1', 10);
      expect(comps).toHaveLength(1);

      // Untick task 1 on today
      const res2 = await services.tickService.toggle('j-1', 't-1', 10);
      expect(res2.ok).toBe(true);
      if (res2.ok) {
        expect(res2.value.toggledOn).toBe(false);
        expect(res2.value.sealed).toBe(false);
      }

      const compsAfter = await repos.completionRepo.getByDay('j-1', 10);
      expect(compsAfter).toHaveLength(0);
    });

    it('detects seal event and milestone on day 10', async () => {
      // Complete first task
      await services.tickService.toggle('j-1', 't-1', 10);
      expect(useUiStore.getState().activeCelebration).toBeNull();

      // Complete second task (day becomes sealed on milestone day 10)
      const res = await services.tickService.toggle('j-1', 't-2', 10);
      expect(res.ok).toBe(true);
      if (res.ok) {
        expect(res.value.sealed).toBe(true);
      }

      // Check celebrations queued: seal animation, followed by milestone 10
      const active = useUiStore.getState().activeCelebration;
      expect(active?.type).toBe('seal');
      expect(useUiStore.getState().celebrationQueue[0]?.type).toBe('milestone');
      expect(useUiStore.getState().celebrationQueue[0]?.dayNumber).toBe(10);
    });

    it('locks past and future days from ticking', async () => {
      // Trying to tick day 5 when today is day 10
      const resPast = await services.tickService.toggle('j-1', 't-1', 5);
      expect(resPast.ok).toBe(false);
      if (!resPast.ok) {
        expect(resPast.reason).toContain('cannot be ticked');
      }

      // Trying to tick day 15 when today is day 10
      const resFuture = await services.tickService.toggle('j-1', 't-1', 15);
      expect(resFuture.ok).toBe(false);
    });
  });

  describe('gapService', () => {
    beforeEach(async () => {
      await repos.journeyRepo.create(sampleJourney);
      await repos.taskRepo.createMany([
        {
          id: 't-daily',
          journeyId: 'j-1',
          title: 'Daily Prayer',
          kind: 'daily',
          sortOrder: 0,
          activeFromDay: 1,
        },
        {
          id: 't-makeup',
          journeyId: 'j-1',
          title: 'Fast 1 Day',
          kind: 'makeup',
          sortOrder: 1,
          activeFromDay: 1,
        },
      ]);
    });

    it('sets and clears a gap reason on a missed day', async () => {
      const res = await services.gapService.setReason('j-1', 5, 'Travel day');
      expect(res.ok).toBe(true);
      expect(await repos.gapNoteRepo.getNote('j-1', 5)).toBe('Travel day');

      await services.gapService.setReason('j-1', 5, null);
      expect(await repos.gapNoteRepo.getNote('j-1', 5)).toBeNull();
    });

    it('completing a makeup task marks a past gap day as madeUp', async () => {
      // Day 5 is past (no daily completion -> gap)
      const res = await services.gapService.toggleMakeup('j-1', 't-makeup', 5);
      expect(res.ok).toBe(true);
      if (res.ok) {
        expect(res.value.madeUp).toBe(true);
      }
    });

    it('rejects makeup task on today or future days', async () => {
      // Today is day 10
      const res = await services.gapService.toggleMakeup('j-1', 't-makeup', 10);
      expect(res.ok).toBe(false);
      if (!res.ok) {
        expect(res.reason).toContain('past gap days');
      }
    });
  });

  describe('journeyService', () => {
    it('creates a new journey and resolves totalDays', async () => {
      const res = await services.journeyService.create({
        name: 'Ramadan Prep',
        calendarType: 'gregorian',
        startInput: '2026-11-01',
        endInput: '2026-11-30',
        dailyTasks: [{ title: 'Dhikr' }],
      });

      expect(res.ok).toBe(true);
      if (res.ok) {
        expect(res.value.totalDays).toBe(30);
        expect(await repos.journeyRepo.getById(res.value.id)).not.toBeNull();
        const tasks = await repos.taskRepo.getByJourney(res.value.id);
        expect(tasks).toHaveLength(1);
      }
    });

    it('locks dates after journey has started', async () => {
      await repos.journeyRepo.create(sampleJourney); // started 2026-10-01, today is 2026-10-10

      const updateRes = await services.journeyService.update({
        id: 'j-1',
        startInput: '2026-10-05',
      });

      expect(updateRes.ok).toBe(false);
      if (!updateRes.ok) {
        expect(updateRes.reason).toContain('Dates cannot be changed once a journey has started');
      }
    });

    it('mid-journey added task has activeFromDay set to today', async () => {
      await repos.journeyRepo.create(sampleJourney);
      await repos.taskRepo.create({
        id: 't-orig',
        journeyId: 'j-1',
        title: 'Original',
        kind: 'daily',
        sortOrder: 0,
        activeFromDay: 1,
      });

      // Add new task today (day 10)
      const res = await services.journeyService.update({
        id: 'j-1',
        tasks: [
          { id: 't-orig', title: 'Original', kind: 'daily', sortOrder: 0 },
          { title: 'New Mid Journey Task', kind: 'daily', sortOrder: 1 },
        ],
      });

      expect(res.ok).toBe(true);
      const allTasks = await repos.taskRepo.getByJourney('j-1');
      expect(allTasks).toHaveLength(2);
      const newTask = allTasks.find((t) => t.title === 'New Mid Journey Task');
      expect(newTask?.activeFromDay).toBe(10);
    });
  });

  describe('rolloverService', () => {
    it('reconciles store and detects unseen celebrations from foreground', async () => {
      await repos.journeyRepo.create(sampleJourney);
      await repos.taskRepo.create({
        id: 't-single',
        journeyId: 'j-1',
        title: 'Only Task',
        kind: 'daily',
        sortOrder: 0,
        activeFromDay: 1,
      });

      // Simulate day 10 was completed in the background/widget
      await repos.completionRepo.add({
        id: 'comp-bg',
        journeyId: 'j-1',
        taskId: 't-single',
        dayNumber: 10,
        completedAt: '2026-10-10T08:00:00.000Z',
      });

      // Milestone 10 is NOT in milestonesSeen
      expect(await repos.milestoneRepo.getSeen('j-1')).toEqual([]);

      // Foreground reconcile runs
      const unseen = await services.rolloverService.reconcile();
      expect(unseen).toHaveLength(1);
      expect(unseen[0]?.type).toBe('milestone');
      expect(unseen[0]?.dayNumber).toBe(10);

      // Now marked seen in repository
      expect(await repos.milestoneRepo.getSeen('j-1')).toEqual([10]);
      // Store was hydrated
      expect(useJourneyStore.getState().journeys).toHaveLength(1);
    });
  });

  describe('settingsService', () => {
    it('updates settings and refreshes notifications and widget', async () => {
      const res = await services.settingsService.updateSettings({
        reminderEnabled: true,
        reminderTime: '07:30',
      });

      expect(res.ok).toBe(true);
      const updated = await repos.settingsRepo.getAll();
      expect(updated.reminderEnabled).toBe(true);
      expect(updated.reminderTime).toBe('07:30');
      expect(fakeNotifications.scheduleDaily).toHaveBeenCalled();
      expect(fakeWidget.refresh).toHaveBeenCalled();
    });

    it('toggles battery checklist acknowledgement', async () => {
      expect((await repos.settingsRepo.getAll()).batteryChecklistDone).toBe(false);

      const res = await services.settingsService.toggleBatteryChecklist(true);
      expect(res.ok).toBe(true);
      expect((await repos.settingsRepo.getAll()).batteryChecklistDone).toBe(true);
    });

    it('re-resolves active Hijri journeys when hijriAdjustment changes', async () => {
      const hijriJourney: Journey = {
        id: 'j-hijri',
        name: 'Ramadan Journey',
        calendarType: 'hijri',
        startInput: '1448-09-01',
        endInput: '1448-09-30',
        startDate: '2027-02-08',
        endDate: '2027-03-09',
        totalDays: 30,
        sortOrder: 1,
        createdAt: '2026-10-01T00:00:00.000Z',
        completionShownAt: null,
      };

      await repos.journeyRepo.create(hijriJourney);

      // Re-resolve with adjustment = 1
      const res = await services.settingsService.reResolveHijriJourneys(1);
      expect(res.ok).toBe(true);

      const settings = await repos.settingsRepo.getAll();
      expect(settings.hijriAdjustment).toBe(1);

      const updatedJourney = await repos.journeyRepo.getById('j-hijri');
      expect(updatedJourney).toBeDefined();
      // Notice fromHijri with adjustment > 0 shifts gregorianDate earlier by 1 day
      expect(updatedJourney?.startDate).not.toBe('2027-02-08');
    });

    it('leaves gregorian journeys unaffected during Hijri re-resolution', async () => {
      await repos.journeyRepo.create(sampleJourney);

      const res = await services.settingsService.reResolveHijriJourneys(-1);
      expect(res.ok).toBe(true);

      const unchanged = await repos.journeyRepo.getById('j-1');
      expect(unchanged?.startDate).toBe(sampleJourney.startDate);
      expect(unchanged?.endDate).toBe(sampleJourney.endDate);
      expect(unchanged?.totalDays).toBe(sampleJourney.totalDays);
    });
  });

  describe('celebrationService', () => {
    it('enqueues seal only on regular non-milestone days', async () => {
      useUiStore.getState().clearCelebrations();

      const items = await services.celebrationService.handleSealEvent(sampleJourney, 5);
      expect(items).toHaveLength(1);
      expect(items[0]?.type).toBe('seal');
      expect(useUiStore.getState().activeCelebration?.type).toBe('seal');
    });

    it('enqueues seal and milestone on milestone days (e.g. Day 10)', async () => {
      useUiStore.getState().clearCelebrations();

      const items = await services.celebrationService.handleSealEvent(sampleJourney, 10);
      expect(items).toHaveLength(2);
      expect(items[0]?.type).toBe('seal');
      expect(items[1]?.type).toBe('milestone');

      // Milestone is marked seen in repository
      const seen = await repos.milestoneRepo.getSeen('j-1');
      expect(seen).toContain(10);
    });

    it('enqueues seal, milestone, and completion on the final day in order', async () => {
      useUiStore.getState().clearCelebrations();

      const items = await services.celebrationService.handleSealEvent(sampleJourney, 40);
      expect(items).toHaveLength(3);
      expect(items[0]?.type).toBe('seal');
      expect(items[1]?.type).toBe('milestone');
      expect(items[2]?.type).toBe('completion');

      expect(useUiStore.getState().activeCelebration?.type).toBe('seal');
      useUiStore.getState().dismissActiveCelebration();
      expect(useUiStore.getState().activeCelebration?.type).toBe('milestone');
      useUiStore.getState().dismissActiveCelebration();
      expect(useUiStore.getState().activeCelebration?.type).toBe('completion');
    });
  });

  describe('journeyService.markCompletionShown', () => {
    it('sets completionShownAt and saves closingNote', async () => {
      await repos.journeyRepo.create(sampleJourney);

      const res = await services.journeyService.markCompletionShown(
        'j-1',
        'Alhamdulillah for completing 40 days.',
      );
      expect(res.ok).toBe(true);
      if (!res.ok) throw new Error(res.reason);
      expect(res.value.completionShownAt).toBe('2026-10-10');
      expect(res.value.closingNote).toBe('Alhamdulillah for completing 40 days.');

      const inRepo = await repos.journeyRepo.getById('j-1');
      expect(inRepo?.completionShownAt).toBe('2026-10-10');
      expect(inRepo?.closingNote).toBe('Alhamdulillah for completing 40 days.');
    });
  });

  describe('notificationService', () => {
    beforeEach(async () => {
      await repos.journeyRepo.create(sampleJourney);
      await repos.taskRepo.createMany([
        {
          id: 't-1',
          journeyId: 'j-1',
          title: 'Daily Prayer',
          kind: 'daily',
          sortOrder: 0,
          activeFromDay: 1,
        },
        {
          id: 't-2',
          journeyId: 'j-1',
          title: 'Quran Reading',
          kind: 'daily',
          sortOrder: 1,
          activeFromDay: 1,
        },
      ]);
      (fakeNotifications.scheduleDaily as jest.Mock).mockClear();
      (fakeNotifications.scheduleOnce as jest.Mock).mockClear();
      (fakeNotifications.cancelAll as jest.Mock).mockClear();
    });

    it('cancels all and reschedules daily reminder with live pending text', async () => {
      await repos.settingsRepo.setMany({
        reminderEnabled: true,
        reminderTime: '06:00',
      });

      // Day 10 of sampleJourney, 0 completed so 2 tasks waiting
      await services.notificationService.refresh();

      expect(fakeNotifications.cancelAll).toHaveBeenCalled();
      expect(fakeNotifications.scheduleDaily).toHaveBeenCalledWith(
        expect.objectContaining({
          hour: 6,
          minute: 0,
          title: 'Bismillah',
          body: expect.stringContaining('2 tasks waiting'),
        }),
      );
    });

    it('updates reminder body text when tasks are completed today', async () => {
      await repos.settingsRepo.setMany({
        reminderEnabled: true,
        reminderTime: '06:00',
      });

      // Complete 1 of the 2 tasks for Day 10
      await repos.completionRepo.add({
        id: 'comp-1',
        journeyId: 'j-1',
        taskId: 't-1',
        dayNumber: 10,
        completedAt: '2026-10-10T08:00:00.000Z',
      });

      await services.notificationService.refresh();

      expect(fakeNotifications.scheduleDaily).toHaveBeenCalledWith(
        expect.objectContaining({
          body: expect.stringContaining('1 tasks waiting'),
        }),
      );
    });

    it('cancels evening nudge when all journeys are sealed today', async () => {
      await repos.settingsRepo.setMany({
        reminderEnabled: true,
        eveningNudgeEnabled: true,
        eveningNudgeTime: '23:59',
      });

      // Complete both tasks
      await repos.completionRepo.add({
        id: 'comp-1',
        journeyId: 'j-1',
        taskId: 't-1',
        dayNumber: 10,
        completedAt: '2026-10-10T08:00:00.000Z',
      });
      await repos.completionRepo.add({
        id: 'comp-2',
        journeyId: 'j-1',
        taskId: 't-2',
        dayNumber: 10,
        completedAt: '2026-10-10T08:00:00.000Z',
      });

      await services.notificationService.refresh();

      // scheduleOnce for evening nudge must NOT be called because day is sealed!
      expect(fakeNotifications.scheduleOnce).not.toHaveBeenCalled();
      expect(fakeNotifications.scheduleDaily).toHaveBeenCalledWith(
        expect.objectContaining({
          body: 'All journeys sealed today. Keep the glow alive!',
        }),
      );
    });
  });
});



