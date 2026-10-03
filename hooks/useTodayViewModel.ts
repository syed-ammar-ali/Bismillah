import { useMemo } from 'react';
import { subDaysFromDate } from '../core/dates';
import { todayTasks } from '../core/progress';
import { dayStatus } from '../core/status';
import { computeStreakInfo } from '../core/streak';
import { dayNumberFor } from '../core/timeline';
import { DayStatus, GlowLevel, Journey, TaskWithCompletion } from '../core/types';
import { useAppStore } from '../stores/useAppStore';
import { useJourneyStore } from '../stores/useJourneyStore';

export interface ActiveJourneyToday {
  journey: Journey;
  dayNumber: number;
  tasks: TaskWithCompletion[];
  isSealed: boolean;
  streak: number;
  glowLevel: GlowLevel;
  doneCount: number;
  totalCount: number;
}

export interface GapAlert {
  journeyId: string;
  journeyName: string;
  dayNumber: number;
}

export function useTodayViewModel() {
  const today = useAppStore((s) => s.today);
  const journeys = useJourneyStore((s) => s.journeys);
  const tasksRecord = useJourneyStore((s) => s.tasks);
  const completionsRecord = useJourneyStore((s) => s.completions);

  return useMemo(() => {
    const yesterday = subDaysFromDate(today, 1);
    const activeJourneys: ActiveJourneyToday[] = [];
    const gapAlerts: GapAlert[] = [];

    let totalDone = 0;
    let totalTasks = 0;

    for (const journey of journeys) {
      if (journey.archivedAt) continue;

      const dayNumber = dayNumberFor(journey, today);
      if (dayNumber === null) continue; // Not active today

      const tasks = tasksRecord[journey.id] ?? [];
      const completions = completionsRecord[journey.id] ?? [];

      const todayTaskList = todayTasks(dayNumber, tasks, completions);
      const doneCount = todayTaskList.filter((t) => t.isCompleted).length;
      const taskCount = todayTaskList.length;

      totalDone += doneCount;
      totalTasks += taskCount;

      // Compute streak
      const dayStatuses: Record<number, DayStatus> = {};
      for (let d = 1; d <= dayNumber; d++) {
        dayStatuses[d] = dayStatus(journey, d, today, tasks, completions);
      }
      const streakInfo = computeStreakInfo(dayStatuses, dayNumber, journey.totalDays);
      const isSealed = dayStatuses[dayNumber] === 'sealed';

      activeJourneys.push({
        journey,
        dayNumber,
        tasks: todayTaskList,
        isSealed,
        streak: streakInfo.currentStreak,
        glowLevel: streakInfo.glowLevel,
        doneCount,
        totalCount: taskCount,
      });

      // Gap alert check for yesterday
      const yesterdayDayNumber = dayNumberFor(journey, yesterday);
      if (yesterdayDayNumber !== null) {
        const yStatus = dayStatus(journey, yesterdayDayNumber, today, tasks, completions);
        if (yStatus === 'gap') {
          gapAlerts.push({
            journeyId: journey.id,
            journeyName: journey.name,
            dayNumber: yesterdayDayNumber,
          });
        }
      }
    }

    return {
      activeJourneys,
      totalDone,
      totalTasks,
      gapAlerts,
    };
  }, [today, journeys, tasksRecord, completionsRecord]);
}
