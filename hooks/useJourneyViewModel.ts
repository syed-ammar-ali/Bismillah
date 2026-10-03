import { useMemo } from 'react';
import { daysBetween, isAfterDate } from '../core/dates';
import { journeyProgress, todayTasks } from '../core/progress';
import { dayStatus } from '../core/status';
import { computeStreakInfo } from '../core/streak';
import { dayNumberFor } from '../core/timeline';
import { DayStatus } from '../core/types';
import { useAppStore } from '../stores/useAppStore';
import { useJourneyStore } from '../stores/useJourneyStore';

export function useJourneyViewModel(journeyId: string) {
  const today = useAppStore((s) => s.today);
  const journey = useJourneyStore((s) => s.journeys.find((j) => j.id === journeyId) ?? null);
  const tasks = useJourneyStore((s) => s.tasks[journeyId] ?? []);
  const completions = useJourneyStore((s) => s.completions[journeyId] ?? []);

  return useMemo(() => {
    if (!journey) {
      return null;
    }

    const dayStatuses: Record<number, DayStatus> = {};
    for (let day = 1; day <= journey.totalDays; day++) {
      dayStatuses[day] = dayStatus(journey, day, today, tasks, completions);
    }

    const todayDayNumber = dayNumberFor(journey, today);
    const streakInfo = computeStreakInfo(dayStatuses, todayDayNumber, journey.totalDays);
    const progressInfo = journeyProgress(journey, dayStatuses);

    const todayTaskList = todayDayNumber
      ? todayTasks(todayDayNumber, tasks, completions)
      : [];

    let deadlineDaysLeft: number | null = null;
    if (journey.deadlineDate) {
      if (isAfterDate(journey.deadlineDate, today)) {
        deadlineDaysLeft = daysBetween(today, journey.deadlineDate);
      } else {
        deadlineDaysLeft = 0;
      }
    }

    return {
      journey,
      tasks,
      completions,
      dayStatuses,
      streakInfo,
      progressInfo,
      todayDayNumber,
      todayTasksList: todayTaskList,
      deadlineDaysLeft,
    };
  }, [journey, tasks, completions, today]);
}
