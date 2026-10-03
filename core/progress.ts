import { isTaskActiveOnDay } from './status';
import { DayStatus, ProgressInfo, Task, TaskCompletion, TaskWithCompletion } from './types';

export function journeyProgress(
  journey: { totalDays: number },
  dayStatuses: Record<number, DayStatus>,
): ProgressInfo {
  let sealedDays = 0;
  let madeUpDays = 0;
  let gapDays = 0;

  for (let day = 1; day <= journey.totalDays; day++) {
    const status = dayStatuses[day];
    if (status === 'sealed') {
      sealedDays++;
    } else if (status === 'madeUp') {
      madeUpDays++;
    } else if (status === 'gap') {
      gapDays++;
    }
  }

  const completedCount = sealedDays + madeUpDays;
  const progressFraction = journey.totalDays > 0 ? completedCount / journey.totalDays : 0;
  const progressPercent = Math.round(progressFraction * 100);

  return {
    totalDays: journey.totalDays,
    sealedDays,
    gapDays,
    madeUpDays,
    progressFraction,
    progressPercent,
  };
}

export function todayTasks(
  dayNumber: number,
  tasks: Task[],
  completions: TaskCompletion[],
): TaskWithCompletion[] {
  const activeDailyTasks = tasks.filter(
    (t) => t.kind === 'daily' && isTaskActiveOnDay(t, dayNumber),
  );

  const completedTaskIds = new Set(
    completions
      .filter((c) => c.dayNumber === dayNumber)
      .map((c) => c.taskId),
  );

  return activeDailyTasks
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map((task) => ({
      ...task,
      isCompleted: completedTaskIds.has(task.id),
    }));
}
