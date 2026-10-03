import { MILESTONE_INTERVAL } from './constants';
import { isAfterDate } from './dates';
import { CelebrationItem, DayStatus, Journey } from './types';

export function isMilestone(dayNumber: number, totalDays: number): boolean {
  if (dayNumber < 1) {
    return false;
  }
  const isTenth = dayNumber % MILESTONE_INTERVAL === 0;
  const isFinal = dayNumber === totalDays && totalDays > 0;
  return isTenth || isFinal;
}

export function getMilestoneDays(totalDays: number): number[] {
  const milestones: number[] = [];
  for (let day = 1; day <= totalDays; day++) {
    if (isMilestone(day, totalDays)) {
      milestones.push(day);
    }
  }
  return milestones;
}

export function unseenCelebrations(
  journey: Journey,
  dayStatuses: Record<number, DayStatus>,
  milestonesSeen: number[],
  today: string,
): CelebrationItem[] {
  const celebrations: CelebrationItem[] = [];
  const seenSet = new Set(milestonesSeen);

  // 1. Unseen sealed milestones
  const milestones = getMilestoneDays(journey.totalDays);
  for (const day of milestones) {
    if (dayStatuses[day] === 'sealed' && !seenSet.has(day)) {
      celebrations.push({
        id: `milestone-${journey.id}-${day}`,
        type: 'milestone',
        journeyId: journey.id,
        dayNumber: day,
      });
    }
  }

  // 2. Journey completion (final day is sealed OR today is past journey.endDate)
  const finalDaySealed = dayStatuses[journey.totalDays] === 'sealed';
  const hasEnded = isAfterDate(today, journey.endDate);
  const isCompleted = finalDaySealed || hasEnded;

  if (isCompleted && !journey.completionShownAt) {
    celebrations.push({
      id: `completion-${journey.id}`,
      type: 'completion',
      journeyId: journey.id,
    });
  }

  return celebrations;
}
