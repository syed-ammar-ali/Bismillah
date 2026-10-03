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
