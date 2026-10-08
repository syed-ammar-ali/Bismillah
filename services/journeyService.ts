import { isAfterDate } from '../core/dates';
import { fromHijri } from '../core/hijri';
import { dayNumberFor, totalDays } from '../core/timeline';
import { ClockPort, JourneyRepo, SettingsRepo, TaskRepo } from '../core/ports';
import { CalendarType, Journey, Result, Task } from '../core/types';
import { useJourneyStore } from '../stores/useJourneyStore';
import { AfterWriteOrchestrator } from './afterWrite';

export interface CreateJourneyInput {
  name: string;
  calendarType: CalendarType;
  startInput: string;
  endInput: string;
  deadlineLabel?: string | null;
  deadlineDate?: string | null;
  dailyTasks: { title: string; note?: string | null }[];
  makeupTasks?: { title: string; note?: string | null }[];
}

export interface UpdateJourneyInput {
  id: string;
  name?: string;
  startInput?: string;
  endInput?: string;
  deadlineLabel?: string | null;
  deadlineDate?: string | null;
  closingNote?: string | null;
  tasks?: {
    id?: string;
    title: string;
    note?: string | null;
    kind: 'daily' | 'makeup';
    sortOrder: number;
  }[];
}

export class JourneyService {
  constructor(
    private readonly journeyRepo: JourneyRepo,
    private readonly taskRepo: TaskRepo,
    private readonly settingsRepo: SettingsRepo,
    private readonly clockPort: ClockPort,
    private readonly afterWrite: AfterWriteOrchestrator,
  ) {}

  async create(input: CreateJourneyInput): Promise<Result<Journey, string>> {
    const trimmedName = input.name.trim();
    if (!trimmedName) {
      return { ok: false, reason: 'Journey name is required' };
    }

    const dailyTasksList =
      input.dailyTasks && input.dailyTasks.length > 0
        ? input.dailyTasks
        : [{ title: 'Daily Check-in' }];

    let startDate: string;
    let endDate: string;

    if (input.calendarType === 'hijri') {
      const adjustment = await this.settingsRepo.get('hijriAdjustment');
      const [sy, sm, sd] = input.startInput.split('-').map((v) => parseInt(v, 10));
      const [ey, em, ed] = input.endInput.split('-').map((v) => parseInt(v, 10));

      if (!sy || !sm || !sd || !ey || !em || !ed) {
        return { ok: false, reason: 'Invalid Hijri date format' };
      }

      startDate = fromHijri(sy, sm, sd, adjustment).gregorianDate;
      endDate = fromHijri(ey, em, ed, adjustment).gregorianDate;
    } else {
      startDate = input.startInput;
      endDate = input.endInput;
    }

    const count = totalDays(startDate, endDate);
    if (count <= 0) {
      return { ok: false, reason: 'End date must be on or after start date' };
    }

    const allJourneys = await this.journeyRepo.getAll();
    const sortOrder = allJourneys.length;

    const journeyId = `journey-${Date.now()}`;
    const journey: Journey = {
      id: journeyId,
      name: trimmedName,
      calendarType: input.calendarType,
      startInput: input.startInput,
      endInput: input.endInput,
      startDate,
      endDate,
      totalDays: count,
      deadlineLabel: input.deadlineLabel ?? null,
      deadlineDate: input.deadlineDate ?? null,
      sortOrder,
      createdAt: new Date().toISOString(),
      completionShownAt: null,
      archivedAt: null,
    };

    await this.journeyRepo.create(journey);

    const tasksToInsert: Task[] = [];
    let order = 0;

    for (const dt of dailyTasksList) {
      tasksToInsert.push({
        id: `task-${journeyId}-${order}`,
        journeyId,
        title: dt.title.trim(),
        note: dt.note?.trim() || null,
        kind: 'daily',
        sortOrder: order++,
        activeFromDay: 1,
        activeToDay: null,
      });
    }

    if (input.makeupTasks) {
      for (const mt of input.makeupTasks) {
        tasksToInsert.push({
          id: `task-${journeyId}-${order}`,
          journeyId,
          title: mt.title.trim(),
          note: mt.note?.trim() || null,
          kind: 'makeup',
          sortOrder: order++,
          activeFromDay: 1,
          activeToDay: null,
        });
      }
    }

    await this.taskRepo.createMany(tasksToInsert);

    // Update store
    useJourneyStore.getState().setJourneys([...allJourneys, journey]);
    useJourneyStore.getState().setTasks(journeyId, tasksToInsert);

    await this.afterWrite.execute();
    return { ok: true, value: journey };
  }

  async update(input: UpdateJourneyInput): Promise<Result<Journey, string>> {
    const existing = await this.journeyRepo.getById(input.id);
    if (!existing) {
      return { ok: false, reason: 'Journey not found' };
    }

    const today = this.clockPort.today();
    const hasStarted = !isAfterDate(existing.startDate, today);

    // If dates changed and journey has started, forbid
    if (hasStarted) {
      if (
        (input.startInput && input.startInput !== existing.startInput) ||
        (input.endInput && input.endInput !== existing.endInput)
      ) {
        return { ok: false, reason: 'Dates cannot be changed once a journey has started' };
      }
    }

    const currentDay = dayNumberFor(existing, today) ?? 1;

    // Handle task modifications mid-journey
    if (input.tasks) {
      const existingTasks = await this.taskRepo.getByJourney(input.id);
      const incomingIds = new Set(input.tasks.map((t) => t.id).filter(Boolean));

      // 1. Soft-deactivate or delete tasks that were removed
      for (const oldTask of existingTasks) {
        if (!incomingIds.has(oldTask.id)) {
          if (!hasStarted) {
            await this.taskRepo.delete(oldTask.id);
          } else if (oldTask.activeToDay == null || oldTask.activeToDay >= currentDay) {
            await this.taskRepo.update({
              id: oldTask.id,
              activeToDay: Math.max(0, currentDay - 1),
            });
          }
        }
      }

      // 2. Add or update incoming tasks
      for (const taskInput of input.tasks) {
        if (taskInput.id) {
          await this.taskRepo.update({
            id: taskInput.id,
            title: taskInput.title,
            note: taskInput.note,
            sortOrder: taskInput.sortOrder,
          });
        } else {
          // New task added mid-journey starts from today
          const newTaskId = `task-${existing.id}-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
          await this.taskRepo.create({
            id: newTaskId,
            journeyId: existing.id,
            title: taskInput.title,
            note: taskInput.note,
            kind: taskInput.kind,
            sortOrder: taskInput.sortOrder,
            activeFromDay: hasStarted ? currentDay : 1,
            activeToDay: null,
          });
        }
      }
    }

    const updatedJourney: Journey = {
      ...existing,
      name: input.name?.trim() || existing.name,
      deadlineLabel: input.deadlineLabel !== undefined ? input.deadlineLabel : existing.deadlineLabel,
      deadlineDate: input.deadlineDate !== undefined ? input.deadlineDate : existing.deadlineDate,
      closingNote: input.closingNote !== undefined ? input.closingNote : existing.closingNote,
    };

    await this.journeyRepo.update(updatedJourney);

    // Refresh store
    const all = await this.journeyRepo.getAll();
    const updatedTasks = await this.taskRepo.getByJourney(existing.id);
    useJourneyStore.getState().setJourneys(all);
    useJourneyStore.getState().setTasks(existing.id, updatedTasks);

    await this.afterWrite.execute();
    return { ok: true, value: updatedJourney };
  }

  async archive(id: string): Promise<Result<void, string>> {
    const existing = await this.journeyRepo.getById(id);
    if (!existing) {
      return { ok: false, reason: 'Journey not found' };
    }
    const archivedAt = new Date().toISOString();
    await this.journeyRepo.archive(id, archivedAt);

    const all = await this.journeyRepo.getAll();
    useJourneyStore.getState().setJourneys(all);

    await this.afterWrite.execute();
    return { ok: true, value: undefined };
  }

  async delete(id: string): Promise<Result<void, string>> {
    await this.journeyRepo.delete(id);

    const all = await this.journeyRepo.getAll();
    useJourneyStore.getState().setJourneys(all);

    await this.afterWrite.execute();
    return { ok: true, value: undefined };
  }

  async reResolveHijriJourneys(newAdjustment: -1 | 0 | 1): Promise<Result<number, string>> {
    const allJourneys = await this.journeyRepo.getAll();
    const hijriJourneys = allJourneys.filter(
      (j) => j.calendarType === 'hijri' && !j.archivedAt && !j.completionShownAt,
    );

    let updatedCount = 0;
    const updatedJourneys = [...allJourneys];

    for (const journey of hijriJourneys) {
      const [sy, sm, sd] = journey.startInput.split('-').map((v) => parseInt(v, 10));
      const [ey, em, ed] = journey.endInput.split('-').map((v) => parseInt(v, 10));

      if (sy && sm && sd && ey && em && ed) {
        const startDate = fromHijri(sy, sm, sd, newAdjustment).gregorianDate;
        const endDate = fromHijri(ey, em, ed, newAdjustment).gregorianDate;
        const count = totalDays(startDate, endDate);

        const updated: Journey = {
          ...journey,
          startDate,
          endDate,
          totalDays: count,
        };

        await this.journeyRepo.update(updated);
        const idx = updatedJourneys.findIndex((j) => j.id === journey.id);
        if (idx !== -1) {
          updatedJourneys[idx] = updated;
        }
        updatedCount++;
      }
    }

    if (updatedCount > 0) {
      useJourneyStore.getState().setJourneys(updatedJourneys);
      await this.afterWrite.execute();
    }

    return { ok: true, value: updatedCount };
  }

  async markCompletionShown(
    id: string,
    closingNote?: string | null,
  ): Promise<Result<Journey, string>> {
    const existing = await this.journeyRepo.getById(id);
    if (!existing) {
      return { ok: false, reason: 'Journey not found' };
    }
    const today = this.clockPort.today();
    const patch: Partial<Journey> & { id: string } = {
      id,
      completionShownAt: existing.completionShownAt ?? today,
    };
    if (closingNote !== undefined) {
      patch.closingNote = closingNote;
    }
    await this.journeyRepo.update(patch);
    const updated = await this.journeyRepo.getById(id);
    const all = await this.journeyRepo.getAll();
    useJourneyStore.getState().setJourneys(all);
    await this.afterWrite.execute();
    return { ok: true, value: updated ?? existing };
  }
}

