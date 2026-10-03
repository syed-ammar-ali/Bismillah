import { addDaysToDate, daysBetween, isAfterDate, isBeforeDate } from './dates';

export function totalDays(startDate: string, endDate: string): number {
  if (isAfterDate(startDate, endDate)) {
    return 0;
  }
  return daysBetween(startDate, endDate) + 1;
}

export function dayNumberFor(
  journey: { startDate: string; endDate: string },
  date: string,
): number | null {
  if (isBeforeDate(date, journey.startDate) || isAfterDate(date, journey.endDate)) {
    return null;
  }
  return daysBetween(journey.startDate, date) + 1;
}

export function dateFor(
  journey: { startDate: string; totalDays: number },
  dayNumber: number,
): string | null {
  if (dayNumber < 1 || dayNumber > journey.totalDays) {
    return null;
  }
  return addDaysToDate(journey.startDate, dayNumber - 1);
}
