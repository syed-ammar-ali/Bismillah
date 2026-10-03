import { isAfterDate, isBeforeDate } from './dates';
import { dateFor } from './timeline';
import { DayStatus, Journey, Task, TaskCompletion } from './types';

export function isTaskActiveOnDay(task: Task, dayNumber: number): boolean {
  if (task.activeFromDay > dayNumber) {
    return false;
  }
  if (task.activeToDay !== null && task.activeToDay !== undefined && task.activeToDay < dayNumber) {
    return false;
  }
  return true;
}

export function areAllTasksCompleted(
  tasks: Task[],
  completions: TaskCompletion[],
  dayNumber: number,
): boolean {
  if (tasks.length === 0) {
    return false;
  }
  const completedTaskIds = new Set(
    completions
      .filter((c) => c.dayNumber === dayNumber)
      .map((c) => c.taskId),
  );
  return tasks.every((t) => completedTaskIds.has(t.id));
}

type DateTemporalCategory = 'future' | 'today' | 'past';

function categorizeDate(dayDate: string, today: string): DateTemporalCategory {
  if (isAfterDate(dayDate, today)) {
    return 'future';
  }
  if (isBeforeDate(dayDate, today)) {
    return 'past';
  }
  return 'today';
}

interface StatusEvaluationContext {
  isDailyDone: boolean;
  isMakeupDone: boolean;
}

type StatusRule = (ctx: StatusEvaluationContext) => DayStatus;

const STATUS_RULE_LOOKUP: Record<DateTemporalCategory, StatusRule> = {
  future: () => 'future',
  today: (ctx) => (ctx.isDailyDone ? 'sealed' : 'today'),
  past: (ctx) => {
    if (ctx.isDailyDone) {
      return 'sealed';
    }
    if (ctx.isMakeupDone) {
      return 'madeUp';
    }
    return 'gap';
  },
};

export function dayStatus(
  journey: Pick<Journey, 'startDate' | 'totalDays'>,
  dayNumber: number,
  today: string,
  tasks: Task[],
  completions: TaskCompletion[],
): DayStatus {
  const dayDate = dateFor(journey, dayNumber);
  if (!dayDate) {
    return 'future';
  }

  const category = categorizeDate(dayDate, today);

  const activeDailyTasks = tasks.filter(
    (t) => t.kind === 'daily' && isTaskActiveOnDay(t, dayNumber),
  );
  const activeMakeupTasks = tasks.filter(
    (t) => t.kind === 'makeup' && isTaskActiveOnDay(t, dayNumber),
  );

  const isDailyDone = areAllTasksCompleted(activeDailyTasks, completions, dayNumber);
  const isMakeupDone = areAllTasksCompleted(activeMakeupTasks, completions, dayNumber);

  const rule = STATUS_RULE_LOOKUP[category];
  return rule({ isDailyDone, isMakeupDone });
}

export function detectSealTransition(
  statusBefore: DayStatus,
  statusAfter: DayStatus,
): { isNewlySealed: boolean; isUnsealed: boolean } {
  return {
    isNewlySealed: statusBefore !== 'sealed' && statusAfter === 'sealed',
    isUnsealed: statusBefore === 'sealed' && statusAfter !== 'sealed',
  };
}
