import { useMemo } from 'react';

import { journeyProgress, todayTasks } from '../core/progress';
import { dayStatus } from '../core/status';
import { computeStreakInfo } from '../core/streak';
import { dayNumberFor } from '../core/timeline';
import { DayStatus } from '../core/types';
import { useAppStore } from '../stores/useAppStore';
import { useJourneyStore } from '../stores/useJourneyStore';

const EMPTY_ARRAY: any[] = [];

export function useJourneyViewModel(journeyId: string) {
  const today = useAppStore((s) => s.today);
  const journey = useJourneyStore((s) => s.journeys.find((j) => j.id === journeyId) ?? null);
  const tasks = useJourneyStore((s) => s.tasks[journeyId]) ?? EMPTY_ARRAY;
  const completions = useJourneyStore((s) => s.completions[journeyId]) ?? EMPTY_ARRAY;

  return useMemo(() => {
    if (!journey) {
      return null;
    }

    try {
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
    } catch {
      return null;
    }
  }, [journey, tasks, completions, today]);
}
