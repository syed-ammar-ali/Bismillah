import * as Haptics from 'expo-haptics';
import { ChevronLeft, ChevronRight } from 'lucide-react-native';
import React, { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { getHijriMonthGrid, HijriGridDay } from '../../core/hijri';
import { colors } from '../../theme/colors';
import { radius, spacing } from '../../theme/spacing';
import { fontFamilies } from '../../theme/typography';

const WEEKDAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'] as const;

export interface HijriCalendarGridProps {
  initialYear: number;
  initialMonth: number;
  hijriAdjustment?: -1 | 0 | 1;
  startDate?: string;
  endDate?: string;
  onSelectDate: (hijriDateString: string) => void;
}

export function HijriCalendarGrid({
  initialYear,
  initialMonth,
  hijriAdjustment = 0,
  startDate,
  endDate,
  onSelectDate,
}: HijriCalendarGridProps) {
  const [currentYear, setCurrentYear] = useState(initialYear);
  const [currentMonth, setCurrentMonth] = useState(initialMonth);

  const gridData = useMemo(() => {
    return getHijriMonthGrid(currentYear, currentMonth, hijriAdjustment);
  }, [currentYear, currentMonth, hijriAdjustment]);

  const handlePrevMonth = () => {
    void Haptics.selectionAsync();
    if (currentMonth === 1) {
      setCurrentYear((y) => y - 1);
      setCurrentMonth(12);
    } else {
      setCurrentMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    void Haptics.selectionAsync();
    if (currentMonth === 12) {
      setCurrentYear((y) => y + 1);
      setCurrentMonth(1);
    } else {
      setCurrentMonth((m) => m + 1);
    }
  };

  return (
    <View style={styles.container}>
      {/* Month Navigation Header */}
      <View style={styles.headerRow}>
        <View style={styles.titleCol}>
          <Text style={styles.monthTitle}>
            {gridData.monthName} {gridData.year} AH
          </Text>
          <Text style={styles.monthSubTitle}>
            {gridData.totalDays} Days · Umm al-Qura
          </Text>
        </View>

        <View style={styles.navButtonsRow}>
          <Pressable
            onPress={handlePrevMonth}
            style={styles.navButton}
            accessibilityRole="button"
            accessibilityLabel="Previous Hijri month"
          >
            <ChevronLeft size={18} color={colors.gold} />
          </Pressable>
          <Pressable
            onPress={handleNextMonth}
            style={styles.navButton}
            accessibilityRole="button"
            accessibilityLabel="Next Hijri month"
          >
            <ChevronRight size={18} color={colors.gold} />
          </Pressable>
        </View>
      </View>

      {/* Weekday Headers */}
      <View style={styles.weekdaysRow}>
        {WEEKDAYS.map((w) => (
          <View key={w} style={styles.weekdayCell}>
            <Text style={styles.weekdayText}>{w}</Text>
          </View>
        ))}
      </View>

      {/* Days 7-column Grid */}
      <View style={styles.daysGrid}>
        {/* Leading empty cells for offset */}
        {Array.from({ length: gridData.firstDayWeekday }).map((_, idx) => (
          <View key={`empty-${idx}`} style={styles.emptyCell} />
        ))}

        {/* Days of the month */}
        {gridData.days.map((day: HijriGridDay) => {
          const isStart = startDate ? day.hijriDateString === startDate : false;
          const isEnd = endDate ? day.hijriDateString === endDate : false;
          const inRange =
            startDate && endDate && startDate < endDate
              ? day.hijriDateString >= startDate && day.hijriDateString <= endDate
              : false;

          const isBoundary = isStart || isEnd;

          return (
            <Pressable
              key={day.hijriDateString}
              onPress={() => {
                void Haptics.selectionAsync();
                onSelectDate(day.hijriDateString);
              }}
              accessibilityRole="button"
              accessibilityLabel={`Hijri day ${day.day}, Gregorian day ${day.gregorianDay}`}
              style={[
                styles.dayCell,
                inRange && styles.dayCellInRange,
                isBoundary && styles.dayCellBoundary,
              ]}
            >
              <Text
                style={[
                  styles.hijriDayText,
                  inRange && styles.hijriDayTextInRange,
                  isBoundary && styles.hijriDayTextBoundary,
                ]}
              >
                {day.day}
              </Text>
              <Text
                style={[
                  styles.gregorianDayText,
                  inRange && styles.gregorianDayTextInRange,
                  isBoundary && styles.gregorianDayTextBoundary,
                ]}
              >
                {day.gregorianDay}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surfaceRaised,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    gap: spacing.sm,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  titleCol: {
    flex: 1,
  },
  monthTitle: {
    fontFamily: fontFamilies.heading,
    fontSize: 16,
    color: colors.gold,
  },
  monthSubTitle: {
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 2,
  },
  navButtonsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  navButton: {
    width: 32,
    height: 32,
    borderRadius: radius.full,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  weekdaysRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.06)',
    paddingBottom: 6,
  },
  weekdayCell: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  weekdayText: {
    fontFamily: fontFamilies.labelStrong,
    fontSize: 11,
    color: colors.textMuted,
  },
  daysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  emptyCell: {
    width: '14.285%',
    height: 48,
  },
  dayCell: {
    width: '14.285%',
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.sm,
    paddingVertical: 2,
  },
  dayCellInRange: {
    backgroundColor: colors.goldDim,
    borderRadius: 0,
  },
  dayCellBoundary: {
    backgroundColor: colors.gold,
    borderRadius: radius.sm,
  },
  hijriDayText: {
    fontFamily: fontFamilies.heading,
    fontSize: 14,
    color: colors.text,
  },
  hijriDayTextInRange: {
    color: colors.goldSoft,
    fontWeight: '700',
  },
  hijriDayTextBoundary: {
    color: '#08090E',
    fontWeight: '800',
  },
  gregorianDayText: {
    fontSize: 9,
    color: colors.textMuted,
    marginTop: 1,
  },
  gregorianDayTextInRange: {
    color: colors.goldSoft,
    opacity: 0.8,
  },
  gregorianDayTextBoundary: {
    color: '#08090E',
    opacity: 0.8,
    fontWeight: '600',
  },
});
