import * as Haptics from 'expo-haptics';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { DayCalendarInfo, DayJourneyMarker } from '../../core/calendar';
import { colors } from '../../theme/colors';
import { radius } from '../../theme/spacing';
import { fontFamilies } from '../../theme/typography';

export interface CalendarDayCellProps {
  dayInfo: DayCalendarInfo;
  isDisabled?: boolean;
  calendarMode?: 'gregorian' | 'hijri';
  onPress: (dateString: string) => void;
}

function renderDot(marker: DayJourneyMarker, index: number) {
  const { status, color } = marker;

  if (status === 'sealed') {
    return (
      <View
        key={`${marker.journeyId}-${index}`}
        style={[styles.dot, { backgroundColor: color }]}
      />
    );
  }

  if (status === 'gap') {
    return (
      <View
        key={`${marker.journeyId}-${index}`}
        style={[styles.dotHollow, { borderColor: color }]}
      />
    );
  }

  if (status === 'madeUp') {
    return (
      <View
        key={`${marker.journeyId}-${index}`}
        style={[styles.dotHollow, { borderColor: colors.gold }]}
      />
    );
  }

  // today or future
  return (
    <View
      key={`${marker.journeyId}-${index}`}
      style={[
        styles.dot,
        { backgroundColor: status === 'today' ? colors.gold : 'rgba(255, 255, 255, 0.25)' },
      ]}
    />
  );
}

export const CalendarDayCell = React.memo(function CalendarDayCell({
  dayInfo,
  isDisabled = false,
  calendarMode = 'gregorian',
  onPress,
}: CalendarDayCellProps) {
  const {
    dateString,
    gregorianDay,
    hijriDay,
    isToday,
    hasDeadline,
    markers,
  } = dayInfo;

  const isHijriMode = calendarMode === 'hijri';
  const primaryNumber = isHijriMode ? hijriDay : gregorianDay;
  const secondaryNumber = isHijriMode ? gregorianDay : hijriDay;

  const visibleMarkers = markers.slice(0, 4);
  const hasMoreMarkers = markers.length > 4;

  return (
    <Pressable
      onPress={() => {
        void Haptics.selectionAsync();
        onPress(dateString);
      }}
      accessibilityRole="button"
      accessibilityLabel={
        isHijriMode
          ? `Hijri day ${hijriDay}, Gregorian day ${gregorianDay}${isToday ? ', Today' : ''}${hasDeadline ? ', Deadline day' : ''}`
          : `Day ${gregorianDay}, Hijri day ${hijriDay}${isToday ? ', Today' : ''}${hasDeadline ? ', Deadline day' : ''}`
      }
      style={({ pressed }) => [
        styles.cell,
        isToday && styles.todayCell,
        isDisabled && styles.disabledCell,
        pressed && styles.pressed,
      ]}
    >
      {/* Top indicator: deadline flag */}
      {hasDeadline ? (
        <View style={styles.deadlineFlag}>
          <Text style={styles.flagIcon}>⚑</Text>
        </View>
      ) : null}

      {/* Primary Number */}
      <Text
        style={[
          styles.gregorianText,
          isToday && styles.todayText,
          isDisabled && styles.disabledText,
        ]}
      >
        {primaryNumber}
      </Text>

      {/* Secondary Number beneath */}
      <Text
        style={[
          styles.hijriText,
          isToday && styles.todayHijriText,
          isDisabled && styles.disabledText,
        ]}
      >
        {secondaryNumber}
      </Text>

      {/* Journey dots */}
      <View style={styles.dotsRow}>
        {visibleMarkers.map((marker, idx) => renderDot(marker, idx))}
        {hasMoreMarkers ? <Text style={styles.moreDotsText}>+</Text> : null}
      </View>
    </Pressable>
  );
});

const styles = StyleSheet.create({
  cell: {
    width: '100%',
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 2,
    position: 'relative',
    borderRadius: radius.sm,
  },
  todayCell: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 1,
    borderColor: colors.gold,
  },
  disabledCell: {
    opacity: 0.25,
  },
  pressed: {
    opacity: 0.7,
    transform: [{ scale: 0.96 }],
  },
  deadlineFlag: {
    position: 'absolute',
    top: 2,
    right: 4,
  },
  flagIcon: {
    fontSize: 9,
    color: colors.gold,
  },
  gregorianText: {
    fontFamily: fontFamilies.heading,
    fontSize: 14,
    color: colors.text,
    lineHeight: 18,
  },
  todayText: {
    color: colors.gold,
    fontWeight: '700',
  },
  disabledText: {
    color: colors.textMuted,
  },
  hijriText: {
    fontFamily: fontFamilies.body,
    fontSize: 9,
    color: colors.textMuted,
    lineHeight: 12,
  },
  todayHijriText: {
    color: colors.goldSoft,
  },
  dotsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
    height: 7,
    marginTop: 2,
  },
  dot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
  },
  dotHollow: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    borderWidth: 1,
    backgroundColor: 'transparent',
  },
  moreDotsText: {
    fontSize: 8,
    color: colors.gold,
    fontWeight: '700',
    lineHeight: 8,
  },
});
