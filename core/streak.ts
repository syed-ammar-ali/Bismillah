import { GLOW_THRESHOLDS } from './constants';
import { DayStatus, GlowLevel, StreakInfo } from './types';

export function glowLevel(streak: number): GlowLevel {
  if (streak <= GLOW_THRESHOLDS.LEVEL_0_MAX) {
    return 0;
  }
  if (streak <= GLOW_THRESHOLDS.LEVEL_1_MAX) {
    return 1;
  }
  if (streak <= GLOW_THRESHOLDS.LEVEL_2_MAX) {
    return 2;
  }
  if (streak <= GLOW_THRESHOLDS.LEVEL_3_MAX) {
    return 3;
  }
  return 4;
}

export function currentStreak(
  dayStatuses: Record<number, DayStatus>,
  todayDayNumber: number | null,
  totalDays: number,
): number {
  if (todayDayNumber === null) {
    // If today is after the journey end, evaluate backwards from the final day
    return calculateBackwardsStreak(dayStatuses, totalDays);
  }

  if (todayDayNumber < 1) {
    // Journey has not started yet
    return 0;
  }

  const todayStatus = dayStatuses[todayDayNumber];
  const startDay = todayStatus === 'sealed' ? todayDayNumber : todayDayNumber - 1;

  return calculateBackwardsStreak(dayStatuses, startDay);
}

function calculateBackwardsStreak(
  dayStatuses: Record<number, DayStatus>,
  startDay: number,
): number {
  let streak = 0;
  for (let day = startDay; day >= 1; day--) {
    if (dayStatuses[day] === 'sealed') {
      streak++;
    } else {
      break;
    }
  }
  return streak;
}

export function bestStreak(
  dayStatuses: Record<number, DayStatus>,
  upToDayNumber: number,
): number {
  let maxStreak = 0;
  let currentRun = 0;

  for (let day = 1; day <= upToDayNumber; day++) {
    if (dayStatuses[day] === 'sealed') {
      currentRun++;
      if (currentRun > maxStreak) {
        maxStreak = currentRun;
      }
    } else {
      currentRun = 0;
    }
  }

  return maxStreak;
}

export function computeStreakInfo(
  dayStatuses: Record<number, DayStatus>,
  todayDayNumber: number | null,
  totalDays: number,
): StreakInfo {
  const current = currentStreak(dayStatuses, todayDayNumber, totalDays);
  const evaluationLimit = todayDayNumber !== null ? Math.min(todayDayNumber, totalDays) : totalDays;
  const best = bestStreak(dayStatuses, evaluationLimit);

  return {
    currentStreak: current,
    bestStreak: Math.max(best, current),
    glowLevel: glowLevel(current),
  };
}
