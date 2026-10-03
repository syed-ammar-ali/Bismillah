import {
  addDays,
  differenceInCalendarDays,
  format,
  isAfter,
  isBefore,
  isEqual,
  isValid,
  parse,
  subDays,
} from 'date-fns';
import { ClockPort } from './ports';

const DATE_FORMAT = 'yyyy-MM-dd';

export function parseISODate(dateString: string): Date {
  const parsed = parse(dateString, DATE_FORMAT, new Date());
  if (!isValid(parsed)) {
    throw new Error(`Invalid date string: "${dateString}". Expected format: ${DATE_FORMAT}`);
  }
  return parsed;
}

export function formatISODate(date: Date): string {
  return format(date, DATE_FORMAT);
}

export function isValidDateString(dateString: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
    return false;
  }
  const parsed = parse(dateString, DATE_FORMAT, new Date());
  return isValid(parsed);
}

export function getToday(clock?: ClockPort): string {
  if (clock) {
    return clock.today();
  }
  return formatISODate(new Date());
}

export function daysBetween(startDate: string, endDate: string): number {
  const start = parseISODate(startDate);
  const end = parseISODate(endDate);
  return differenceInCalendarDays(end, start);
}

export function addDaysToDate(dateString: string, days: number): string {
  const date = parseISODate(dateString);
  return formatISODate(addDays(date, days));
}

export function subDaysFromDate(dateString: string, days: number): string {
  const date = parseISODate(dateString);
  return formatISODate(subDays(date, days));
}

export function isBeforeDate(dateA: string, dateB: string): boolean {
  return isBefore(parseISODate(dateA), parseISODate(dateB));
}

export function isAfterDate(dateA: string, dateB: string): boolean {
  return isAfter(parseISODate(dateA), parseISODate(dateB));
}

export function isSameDate(dateA: string, dateB: string): boolean {
  return isEqual(parseISODate(dateA), parseISODate(dateB));
}

export function formatDisplayDate(dateString: string): string {
  const date = parseISODate(dateString);
  return format(date, 'EEEE, d MMMM yyyy');
}

export function formatDisplayDateShort(dateString: string): string {
  const date = parseISODate(dateString);
  return format(date, 'd MMM yyyy');
}

