import { BackupData, CURRENT_SCHEMA_VERSION } from '../../core/backup';
import { DEFAULT_SETTINGS } from '../../core/constants';
import { BackupRepo } from '../../core/ports';
import { AppSettings, Journey } from '../../core/types';
import { AppDatabase } from '../client';
import {
  dayLogs,
  journeys,
  milestonesSeen,
  settings,
  taskCompletions,
  tasks,
} from '../schema';

export class DrizzleBackupRepo implements BackupRepo {
  constructor(private readonly db: AppDatabase) {}

  async exportAll(): Promise<BackupData> {
    const rawJourneys = await this.db.select().from(journeys);
    const rawTasks = await this.db.select().from(tasks);
    const rawCompletions = await this.db.select().from(taskCompletions);
    const rawDayLogs = await this.db.select().from(dayLogs);
    const rawMilestones = await this.db.select().from(milestonesSeen);
    const rawSettings = await this.db.select().from(settings);

    const parsedSettings: Partial<AppSettings> = {};
    for (const row of rawSettings) {
      const k = row.key as keyof AppSettings;
      try {
        parsedSettings[k] = JSON.parse(row.value);
      } catch {
        // Fallback to default
      }
    }

    const exportedSettings: AppSettings = {
      ...DEFAULT_SETTINGS,
      ...parsedSettings,
    };

    const formattedJourneys: Journey[] = rawJourneys.map((j) => ({
      id: j.id,
      name: j.name,
      calendarType: j.calendarType,
      startInput: j.startInput,
      endInput: j.endInput,
      startDate: j.startDate,
      endDate: j.endDate,
      totalDays: j.totalDays,
      deadlineLabel: j.deadlineLabel ?? null,
      deadlineDate: j.deadlineDate ?? null,
      closingNote: j.closingNote ?? null,
      completionShownAt: j.completionShownAt ?? null,
      sortOrder: j.sortOrder,
      createdAt: j.createdAt,
      archivedAt: j.archivedAt ?? null,
    }));

    return {
      schemaVersion: CURRENT_SCHEMA_VERSION,
      exportedAt: new Date().toISOString(),
      journeys: formattedJourneys,
      tasks: rawTasks.map((t) => ({
        id: t.id,
        journeyId: t.journeyId,
        title: t.title,
        note: t.note ?? null,
        kind: t.kind,
        sortOrder: t.sortOrder,
        activeFromDay: t.activeFromDay,
        activeToDay: t.activeToDay ?? null,
      })),
      task_completions: rawCompletions.map((c) => ({
        id: c.id,
        journeyId: c.journeyId,
        taskId: c.taskId,
        dayNumber: c.dayNumber,
        completedAt: c.completedAt,
      })),
      day_logs: rawDayLogs.map((l) => ({
        id: l.id,
        journeyId: l.journeyId,
        dayNumber: l.dayNumber,
        gapReason: l.gapReason ?? null,
        updatedAt: l.updatedAt,
      })),
      milestones_seen: rawMilestones.map((m) => ({
        journeyId: m.journeyId,
        dayNumber: m.dayNumber,
        shownAt: m.shownAt,
      })),
      settings: exportedSettings,
    };
  }

  async replaceAll(data: BackupData): Promise<void> {
    await this.db.transaction(async (tx) => {
      // 1. Delete in reverse dependency order
      await tx.delete(milestonesSeen);
      await tx.delete(dayLogs);
      await tx.delete(taskCompletions);
      await tx.delete(tasks);
      await tx.delete(journeys);
      await tx.delete(settings);

      // 2. Insert journeys
      if (data.journeys.length > 0) {
        await tx.insert(journeys).values(
          data.journeys.map((j) => ({
            id: j.id,
            name: j.name,
            calendarType: j.calendarType,
            startInput: j.startInput,
            endInput: j.endInput,
            startDate: j.startDate,
            endDate: j.endDate,
            totalDays: j.totalDays,
            deadlineLabel: j.deadlineLabel ?? null,
            deadlineDate: j.deadlineDate ?? null,
            closingNote: j.closingNote ?? null,
            completionShownAt: j.completionShownAt ?? null,
            sortOrder: j.sortOrder,
            createdAt: j.createdAt,
            archivedAt: j.archivedAt ?? null,
          })),
        );
      }

      // 3. Insert tasks
      if (data.tasks.length > 0) {
        await tx.insert(tasks).values(
          data.tasks.map((t) => ({
            id: t.id,
            journeyId: t.journeyId,
            title: t.title,
            note: t.note ?? null,
            kind: t.kind,
            sortOrder: t.sortOrder,
            activeFromDay: t.activeFromDay,
            activeToDay: t.activeToDay ?? null,
          })),
        );
      }

      // 4. Insert task completions
      if (data.task_completions.length > 0) {
        await tx.insert(taskCompletions).values(
          data.task_completions.map((c) => ({
            id: c.id,
            journeyId: c.journeyId,
            taskId: c.taskId,
            dayNumber: c.dayNumber,
            completedAt: c.completedAt,
          })),
        );
      }

      // 5. Insert day logs
      if (data.day_logs.length > 0) {
        await tx.insert(dayLogs).values(
          data.day_logs.map((l) => ({
            id: l.id,
            journeyId: l.journeyId,
            dayNumber: l.dayNumber,
            gapReason: l.gapReason ?? null,
            updatedAt: l.updatedAt,
          })),
        );
      }

      // 6. Insert milestones seen
      if (data.milestones_seen.length > 0) {
        await tx.insert(milestonesSeen).values(
          data.milestones_seen.map((m) => ({
            journeyId: m.journeyId,
            dayNumber: m.dayNumber,
            shownAt: m.shownAt,
          })),
        );
      }

      // 7. Insert settings
      for (const [k, v] of Object.entries(data.settings)) {
        if (v !== undefined) {
          await tx.insert(settings).values({
            key: k,
            value: JSON.stringify(v),
          });
        }
      }
    });
  }
}
