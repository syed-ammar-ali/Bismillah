import { isBeforeDate } from '../core/dates';
import { dayStatus } from '../core/status';
import { dateFor } from '../core/timeline';
import { ClockPort, CompletionRepo, GapNoteRepo, JourneyRepo, TaskRepo } from '../core/ports';
import { Result, TaskCompletion } from '../core/types';
import { useJourneyStore } from '../stores/useJourneyStore';
import { AfterWriteOrchestrator } from './afterWrite';

export class GapService {
  constructor(
    private readonly journeyRepo: JourneyRepo,
    private readonly taskRepo: TaskRepo,
    private readonly completionRepo: CompletionRepo,
    private readonly gapNoteRepo: GapNoteRepo,
    private readonly clockPort: ClockPort,
    private readonly afterWrite: AfterWriteOrchestrator,
  ) {}

  async setReason(
    journeyId: string,
    dayNumber: number,
    reason: string | null,
  ): Promise<Result<void, string>> {
    await this.gapNoteRepo.setNote(journeyId, dayNumber, reason);
    useJourneyStore.getState().setDayLog(journeyId, dayNumber, reason?.trim() || null);
    await this.afterWrite.execute();
    return { ok: true, value: undefined };
  }

  async toggleMakeup(
    journeyId: string,
    taskId: string,
    dayNumber: number,
  ): Promise<Result<{ madeUp: boolean }, string>> {
    const journey = await this.journeyRepo.getById(journeyId);
    if (!journey) {
      return { ok: false, reason: 'Journey not found' };
    }

    const today = this.clockPort.today();
    const dayDate = dateFor(journey, dayNumber);
    if (!dayDate || !isBeforeDate(dayDate, today)) {
      return { ok: false, reason: 'Make-up tasks can only be applied to past gap days' };
    }

    const tasks = await this.taskRepo.getByJourney(journeyId);
    const task = tasks.find((t) => t.id === taskId);
    if (!task || task.kind !== 'makeup') {
      return { ok: false, reason: 'Task is not a make-up task' };
    }

    const currentCompletions = await this.completionRepo.getByDay(journeyId, dayNumber);
    const existingComp = currentCompletions.find((c) => c.taskId === taskId);

    let nextCompletions: TaskCompletion[];
    if (existingComp) {
      await this.completionRepo.remove(taskId, dayNumber);
      useJourneyStore.getState().removeCompletion(taskId, dayNumber);
      nextCompletions = currentCompletions.filter((c) => c.taskId !== taskId);
    } else {
      const newComp: TaskCompletion = {
        id: `comp-makeup-${journeyId}-${taskId}-${dayNumber}`,
        journeyId,
        taskId,
        dayNumber,
        completedAt: new Date().toISOString(),
      };
      await this.completionRepo.add(newComp);
      useJourneyStore.getState().addCompletion(newComp);
      nextCompletions = [...currentCompletions, newComp];
    }

    const statusAfter = dayStatus(journey, dayNumber, today, tasks, nextCompletions);
    await this.afterWrite.execute();

    return {
      ok: true,
      value: {
        madeUp: statusAfter === 'madeUp',
      },
    };
  }
}
