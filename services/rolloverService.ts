import { unseenCelebrations } from '../core/milestones';
import { dayStatus } from '../core/status';
import {
  ClockPort,
  CompletionRepo,
  GapNoteRepo,
  JourneyRepo,
  MilestoneRepo,
  SettingsRepo,
  TaskRepo,
} from '../core/ports';
import { CelebrationItem, DayLog, DayStatus, Task, TaskCompletion } from '../core/types';
import { useAppStore } from '../stores/useAppStore';
import { useJourneyStore } from '../stores/useJourneyStore';
import { AfterWriteOrchestrator } from './afterWrite';
import { CelebrationService } from './celebrationService';

export class RolloverService {
  constructor(
    private readonly journeyRepo: JourneyRepo,
    private readonly taskRepo: TaskRepo,
    private readonly completionRepo: CompletionRepo,
    private readonly gapNoteRepo: GapNoteRepo,
    private readonly milestoneRepo: MilestoneRepo,
    private readonly settingsRepo: SettingsRepo,
    private readonly clockPort: ClockPort,
    private readonly celebrationService: CelebrationService,
    private readonly afterWrite: AfterWriteOrchestrator,
  ) {}

  async reconcile(): Promise<CelebrationItem[]> {
    const today = this.clockPort.today();
    useAppStore.getState().setToday(today);

    // 1. Reload settings from database
    const settings = await this.settingsRepo.getAll();
    useAppStore.getState().setSettings(settings);

    // 2. Reload all journeys, tasks, completions, dayLogs, milestones from database
    const journeys = await this.journeyRepo.getAll();
    const tasksRecord: Record<string, Task[]> = {};
    const completionsRecord: Record<string, TaskCompletion[]> = {};
    const dayLogsRecord: Record<string, DayLog[]> = {};
    const milestonesRecord: Record<string, number[]> = {};

    for (const journey of journeys) {
      tasksRecord[journey.id] = await this.taskRepo.getByJourney(journey.id);
      completionsRecord[journey.id] = await this.completionRepo.getByJourney(journey.id);
      dayLogsRecord[journey.id] = await this.gapNoteRepo.getByJourney(journey.id);
      milestonesRecord[journey.id] = await this.milestoneRepo.getSeen(journey.id);
    }

    useJourneyStore.getState().setAll({
      journeys,
      tasks: tasksRecord,
      completions: completionsRecord,
      dayLogs: dayLogsRecord,
      milestonesSeen: milestonesRecord,
    });
    useAppStore.getState().setHydrated(true);

    // 3. Compute unseen celebrations
    const allUnseenCelebrations: CelebrationItem[] = [];

    for (const journey of journeys) {
      const journeyTasks = tasksRecord[journey.id] ?? [];
      const journeyCompletions = completionsRecord[journey.id] ?? [];
      const seenMilestones = milestonesRecord[journey.id] ?? [];

      const dayStatuses: Record<number, DayStatus> = {};
      for (let day = 1; day <= journey.totalDays; day++) {
        dayStatuses[day] = dayStatus(
          journey,
          day,
          today,
          journeyTasks,
          journeyCompletions,
        );
      }

      const unseen = unseenCelebrations(journey, dayStatuses, seenMilestones, today);
      allUnseenCelebrations.push(...unseen);

      // Record any newly detected sealed milestones as seen so they don't replay
      for (const item of unseen) {
        if (item.type === 'milestone' && item.dayNumber) {
          const now = new Date().toISOString();
          await this.milestoneRepo.markSeen(journey.id, item.dayNumber, now);
          useJourneyStore.getState().markMilestoneSeen(journey.id, item.dayNumber);
        }
      }
    }

    if (allUnseenCelebrations.length > 0) {
      this.celebrationService.queueCelebrations(allUnseenCelebrations);
    }

    // 4. Trigger afterWrite
    await this.afterWrite.execute();

    return allUnseenCelebrations;
  }
}
