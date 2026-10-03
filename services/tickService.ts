import { dayStatus } from '../core/status';
import { dayNumberFor } from '../core/timeline';
import { ClockPort, CompletionRepo, JourneyRepo, TaskRepo } from '../core/ports';
import { Result, TaskCompletion } from '../core/types';
import { useJourneyStore } from '../stores/useJourneyStore';
import { AfterWriteOrchestrator } from './afterWrite';
import { CelebrationService } from './celebrationService';

export interface TickResult {
  sealed: boolean;
  toggledOn: boolean;
}

export class TickService {
  constructor(
    private readonly journeyRepo: JourneyRepo,
    private readonly taskRepo: TaskRepo,
    private readonly completionRepo: CompletionRepo,
    private readonly clockPort: ClockPort,
    private readonly celebrationService: CelebrationService,
    private readonly afterWrite: AfterWriteOrchestrator,
  ) {}

  async toggle(
    journeyId: string,
    taskId: string,
    dayNumber: number,
  ): Promise<Result<TickResult, string>> {
    const journey = await this.journeyRepo.getById(journeyId);
    if (!journey) {
      return { ok: false, reason: 'Journey not found' };
    }

    const today = this.clockPort.today();
    const todayDayNumber = dayNumberFor(journey, today);

    // Only today is editable
    if (dayNumber !== todayDayNumber) {
      return { ok: false, reason: 'Past or future days cannot be ticked' };
    }

    const tasks = await this.taskRepo.getByJourney(journeyId);
    const task = tasks.find((t) => t.id === taskId);
    if (!task) {
      return { ok: false, reason: 'Task not found' };
    }

    const currentCompletions = await this.completionRepo.getByDay(journeyId, dayNumber);
    const existingComp = currentCompletions.find((c) => c.taskId === taskId);

    const statusBefore = dayStatus(journey, dayNumber, today, tasks, currentCompletions);

    let toggledOn = false;
    let nextCompletions: TaskCompletion[];

    if (existingComp) {
      // Untick
      await this.completionRepo.remove(taskId, dayNumber);
      useJourneyStore.getState().removeCompletion(taskId, dayNumber);
      nextCompletions = currentCompletions.filter((c) => c.taskId !== taskId);
      toggledOn = false;
    } else {
      // Tick
      const newCompletion: TaskCompletion = {
        id: `comp-${journeyId}-${taskId}-${dayNumber}`,
        journeyId,
        taskId,
        dayNumber,
        completedAt: new Date().toISOString(),
      };
      await this.completionRepo.add(newCompletion);
      useJourneyStore.getState().addCompletion(newCompletion);
      nextCompletions = [...currentCompletions, newCompletion];
      toggledOn = true;
    }

    const statusAfter = dayStatus(journey, dayNumber, today, tasks, nextCompletions);

    // Detect seal event
    if (statusBefore !== 'sealed' && statusAfter === 'sealed') {
      await this.celebrationService.handleSealEvent(journey, dayNumber);
    }

    await this.afterWrite.execute();

    return {
      ok: true,
      value: {
        sealed: statusAfter === 'sealed',
        toggledOn,
      },
    };
  }
}
