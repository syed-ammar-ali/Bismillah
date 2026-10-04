import { format, getDaysInMonth, parse } from 'date-fns';
import { isSameDate } from './dates';
import { toHijri } from './hijri';
import { dayStatus } from './status';
import { dayNumberFor } from './timeline';
import { DayStatus, Journey, Task, TaskCompletion } from './types';

export interface DayJourneyMarker {
  journeyId: string;
  journeyName: string;
  color: string;
  status: DayStatus;
  dayNumber: number;
  totalDays: number;
  isDeadline: boolean;
  deadlineLabel?: string | null;
}

export interface DayCalendarInfo {
  dateString: string;
  gregorianDay: number;
  hijriDay: number;
  hijriMonthName: string;
  isToday: boolean;
  hasDeadline: boolean;
  deadlineLabels: string[];
  markers: DayJourneyMarker[];
}

/**
 * Returns a dual header string showing Gregorian month and corresponding Hijri month(s).
 * Example: "October 2026 · Rabi' al-Awwal / Rabi' al-Thani"
 */
export function getMonthDualHeader(
  year: number,
  month: number, // 1..12
  hijriAdjustment: -1 | 0 | 1 = 0,
): string {
  const monthPadded = String(month).padStart(2, '0');
  const baseDateString = `${year}-${monthPadded}-01`;
  const parsedDate = parse(baseDateString, 'yyyy-MM-dd', new Date());
  const gregorianTitle = format(parsedDate, 'MMMM yyyy');

  const daysInMonth = getDaysInMonth(parsedDate);
  const uniqueHijriMonths: string[] = [];

  for (let d = 1; d <= daysInMonth; d++) {
    const dayPadded = String(d).padStart(2, '0');
    const dateStr = `${year}-${monthPadded}-${dayPadded}`;
    const h = toHijri(dateStr, hijriAdjustment);
    if (!uniqueHijriMonths.includes(h.monthName)) {
      uniqueHijriMonths.push(h.monthName);
    }
  }

  const hijriPart = uniqueHijriMonths.join(' / ');
  return `${gregorianTitle} · ${hijriPart}`;
}

/**
 * Computes calendar cell information for a given date, including Hijri day,
 * whether it is today, active journey markers, and deadline flags.
 */
export function getCalendarDayInfo(
  dateString: string,
  today: string,
  journeys: Journey[],
  tasksRecord: Record<string, Task[]>,
  completionsRecord: Record<string, TaskCompletion[]>,
  hijriAdjustment: -1 | 0 | 1 = 0,
  filterJourneyId?: string | null,
  journeyColorMap: Record<string, string> = {},
): DayCalendarInfo {
  const hijri = toHijri(dateString, hijriAdjustment);
  const parts = dateString.split('-');
  const gregorianDay = parseInt(parts[2] ?? '1', 10);
  const isToday = isSameDate(dateString, today);

  const targetJourneys = filterJourneyId
    ? journeys.filter((j) => j.id === filterJourneyId && !j.archivedAt)
    : journeys.filter((j) => !j.archivedAt);

  const markers: DayJourneyMarker[] = [];
  const deadlineLabels: string[] = [];

  for (const journey of targetJourneys) {
    const isDeadline = journey.deadlineDate === dateString;
    if (isDeadline && journey.deadlineLabel) {
      deadlineLabels.push(journey.deadlineLabel);
    }

    const dayNumber = dayNumberFor(journey, dateString);
    if (dayNumber !== null) {
      const tasks = tasksRecord[journey.id] ?? [];
      const completions = completionsRecord[journey.id] ?? [];
      const status = dayStatus(journey, dayNumber, today, tasks, completions);
      const color = journeyColorMap[journey.id] ?? '#F59E0B';

      markers.push({
        journeyId: journey.id,
        journeyName: journey.name,
        color,
        status,
        dayNumber,
        totalDays: journey.totalDays,
        isDeadline,
        deadlineLabel: isDeadline ? journey.deadlineLabel : null,
      });
    }
  }

  return {
    dateString,
    gregorianDay,
    hijriDay: hijri.day,
    hijriMonthName: hijri.monthName,
    isToday,
    hasDeadline: deadlineLabels.length > 0 || markers.some((m) => m.isDeadline),
    deadlineLabels,
    markers,
  };
}
