import umalqura from '@umalqura/core';
import { addDaysToDate, formatISODate, parseISODate, subDaysFromDate } from './dates';

export const HIJRI_MONTH_NAMES = [
  'Muharram',
  'Safar',
  "Rabi' al-Awwal",
  "Rabi' al-Thani",
  'Jumada al-Ula',
  'Jumada al-Thaniyah',
  'Rajab',
  "Sha'ban",
  'Ramadan',
  'Shawwal',
  "Dhu al-Qi'dah",
  'Dhu al-Hijjah',
] as const;

export interface HijriDate {
  year: number;
  month: number;
  day: number;
  monthName: string;
  formatted: string;
}

export function toHijri(gregorianDate: string, adjustment: -1 | 0 | 1 = 0): HijriDate {
  const adjustedGregorian =
    adjustment === 0
      ? gregorianDate
      : adjustment > 0
        ? addDaysToDate(gregorianDate, adjustment)
        : subDaysFromDate(gregorianDate, Math.abs(adjustment));

  const parsedDate = parseISODate(adjustedGregorian);
  const u = umalqura(parsedDate);

  const monthIndex = u.hm - 1;
  const monthName = HIJRI_MONTH_NAMES[monthIndex] ?? `Month ${u.hm}`;
  const formatted = `${u.hd} ${monthName} ${u.hy}`;

  return {
    year: u.hy,
    month: u.hm,
    day: u.hd,
    monthName,
    formatted,
  };
}

export function fromHijri(
  hy: number,
  hm: number,
  hd: number,
  adjustment: -1 | 0 | 1 = 0,
): { gregorianDate: string } {
  const u = umalqura(hy, hm, hd);
  const baseGregorian = formatISODate(u.date);

  const gregorianDate =
    adjustment === 0
      ? baseGregorian
      : adjustment > 0
        ? subDaysFromDate(baseGregorian, adjustment)
        : addDaysToDate(baseGregorian, Math.abs(adjustment));

  return { gregorianDate };
}

export function getHijriDaysInMonth(hy: number, hm: number): number {
  return umalqura.$.getDaysInMonth(hy, hm);
}

export interface HijriGridDay {
  year: number;
  month: number;
  day: number;
  hijriDateString: string;
  gregorianDateString: string;
  gregorianDay: number;
  weekday: number;
}

export interface HijriMonthGrid {
  year: number;
  month: number;
  monthName: string;
  totalDays: number;
  firstDayWeekday: number;
  days: HijriGridDay[];
}

export function getHijriMonthGrid(
  hy: number,
  hm: number,
  adjustment: -1 | 0 | 1 = 0,
): HijriMonthGrid {
  const totalDays = getHijriDaysInMonth(hy, hm);
  const monthIndex = hm - 1;
  const monthName = HIJRI_MONTH_NAMES[monthIndex] ?? `Month ${hm}`;

  const firstDayGreg = fromHijri(hy, hm, 1, adjustment).gregorianDate;
  const firstParsed = parseISODate(firstDayGreg);
  const firstDayWeekday = firstParsed.getDay();

  const days: HijriGridDay[] = [];
  const pad = (n: number) => n.toString().padStart(2, '0');

  for (let d = 1; d <= totalDays; d++) {
    const greg = fromHijri(hy, hm, d, adjustment).gregorianDate;
    const gregParsed = parseISODate(greg);
    days.push({
      year: hy,
      month: hm,
      day: d,
      hijriDateString: `${hy}-${pad(hm)}-${pad(d)}`,
      gregorianDateString: greg,
      gregorianDay: gregParsed.getDate(),
      weekday: gregParsed.getDay(),
    });
  }

  return {
    year: hy,
    month: hm,
    monthName,
    totalDays,
    firstDayWeekday,
    days,
  };
}
