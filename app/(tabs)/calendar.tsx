import React, { useCallback, useMemo, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Calendar, DateData } from 'react-native-calendars';
import { CalendarDayCell } from '../../components/calendar/CalendarDayCell';
import { CalendarFilterChips } from '../../components/calendar/CalendarFilterChips';
import { CalendarDaySheet } from '../../components/sheets/CalendarDaySheet';
import { GlassCard } from '../../components/ui/GlassCard';
import { getCalendarDayInfo, getMonthDualHeader } from '../../core/calendar';
import { useAppStore } from '../../stores/useAppStore';
import { useJourneyStore } from '../../stores/useJourneyStore';
import { colors, journeyColors } from '../../theme/colors';
import { radius, spacing } from '../../theme/spacing';
import { fontFamilies } from '../../theme/typography';

export default function CalendarTab() {
  const insets = useSafeAreaInsets();
  const today = useAppStore((s) => s.today);
  const hijriAdjustment = useAppStore((s) => s.settings.hijriAdjustment);
  const journeys = useJourneyStore((s) => s.journeys);
  const tasksRecord = useJourneyStore((s) => s.tasks);
  const completionsRecord = useJourneyStore((s) => s.completions);

  // Parse today's year and month
  const todayParts = useMemo(() => {
    const parts = today.split('-');
    return {
      year: parseInt(parts[0] ?? '2026', 10),
      month: parseInt(parts[1] ?? '10', 10),
    };
  }, [today]);

  const [currentYearMonth, setCurrentYearMonth] = useState({
    year: todayParts.year,
    month: todayParts.month,
  });

  const [calendarMode, setCalendarMode] = useState<'gregorian' | 'hijri'>('gregorian');
  const [selectedJourneyId, setSelectedJourneyId] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const activeJourneys = useMemo(
    () => journeys.filter((j) => !j.archivedAt),
    [journeys],
  );

  const journeyColorMap = useMemo(() => {
    const map: Record<string, string> = {};
    activeJourneys.forEach((j, index) => {
      map[j.id] = journeyColors[index % journeyColors.length] ?? colors.gold;
    });
    return map;
  }, [activeJourneys]);

  const handleDayPress = useCallback((dateString: string) => {
    setSelectedDate(dateString);
  }, []);

  const handleMonthChange = useCallback((monthData: DateData) => {
    setCurrentYearMonth({
      year: monthData.year,
      month: monthData.month,
    });
  }, []);

  const renderDay = useCallback(
    ({ date, state }: { date?: DateData; state?: string }) => {
      if (!date) return null;

      const dayInfo = getCalendarDayInfo(
        date.dateString,
        today,
        activeJourneys,
        tasksRecord,
        completionsRecord,
        hijriAdjustment,
        selectedJourneyId,
        journeyColorMap,
      );

      return (
        <CalendarDayCell
          dayInfo={dayInfo}
          isDisabled={state === 'disabled'}
          calendarMode={calendarMode}
          onPress={handleDayPress}
        />
      );
    },
    [
      today,
      activeJourneys,
      tasksRecord,
      completionsRecord,
      hijriAdjustment,
      selectedJourneyId,
      journeyColorMap,
      calendarMode,
      handleDayPress,
    ],
  );

  const headerTitle = useMemo(() => {
    return getMonthDualHeader(
      currentYearMonth.year,
      currentYearMonth.month,
      hijriAdjustment,
    );
  }, [currentYearMonth.year, currentYearMonth.month, hijriAdjustment]);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: 150 + insets.bottom },
        ]}
      >
        {/* Screen Title & Calendar Mode Toggle */}
        <View style={styles.header}>
          <View style={styles.headerTitleRow}>
            <View>
              <Text style={styles.screenTitle}>Calendar</Text>
              <Text style={styles.screenSubtitle}>
                {calendarMode === 'hijri' ? 'Hijri timeline & months' : 'Unified Gregorian & Hijri timeline'}
              </Text>
            </View>

            {/* Mode Switcher: Gregorian vs Hijri */}
            <View style={styles.modeTogglePill}>
              <Pressable
                onPress={() => setCalendarMode('gregorian')}
                style={[styles.modeButton, calendarMode === 'gregorian' && styles.modeButtonActive]}
                accessibilityRole="button"
                accessibilityLabel="Switch to Gregorian mode"
              >
                <Text
                  style={[
                    styles.modeButtonText,
                    calendarMode === 'gregorian' && styles.modeButtonTextActive,
                  ]}
                >
                  Gregorian
                </Text>
              </Pressable>
              <Pressable
                onPress={() => setCalendarMode('hijri')}
                style={[styles.modeButton, calendarMode === 'hijri' && styles.modeButtonActive]}
                accessibilityRole="button"
                accessibilityLabel="Switch to Hijri mode"
              >
                <Text
                  style={[
                    styles.modeButtonText,
                    calendarMode === 'hijri' && styles.modeButtonTextActive,
                  ]}
                >
                  Hijri
                </Text>
              </Pressable>
            </View>
          </View>
        </View>

        {/* Journey Filter Chips */}
        {activeJourneys.length > 0 ? (
          <CalendarFilterChips
            journeys={activeJourneys}
            journeyColorMap={journeyColorMap}
            selectedJourneyId={selectedJourneyId}
            onSelectJourney={setSelectedJourneyId}
          />
        ) : null}

        {/* Dual Month Header Banner */}
        <View style={styles.dualHeaderContainer}>
          <Text style={styles.dualHeaderText}>{headerTitle}</Text>
        </View>

        {/* Calendar Card */}
        <GlassCard style={styles.calendarGlassCard}>
          <Calendar
            current={today}
            enableSwipeMonths
            hideExtraDays={false}
            onMonthChange={handleMonthChange}
            dayComponent={renderDay}
            renderArrow={(direction: 'left' | 'right') => (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={
                  direction === 'left' ? 'Previous month' : 'Next month'
                }
                style={styles.arrowButton}
              >
                <Text style={styles.arrowText}>
                  {direction === 'left' ? '‹' : '›'}
                </Text>
              </Pressable>
            )}
            theme={{
              backgroundColor: 'transparent',
              calendarBackground: 'transparent',
              textSectionTitleColor: colors.textMuted,
              arrowColor: colors.gold,
              monthTextColor: colors.gold,
              textDayHeaderFontFamily: fontFamilies.labelStrong,
              textDayHeaderFontSize: 11,
            }}
          />
        </GlassCard>

        {/* Legend */}
        <View style={styles.legendContainer}>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, styles.legendSealed]} />
            <Text style={styles.legendText}>Sealed</Text>
          </View>

          <View style={styles.legendItem}>
            <View style={[styles.legendDot, styles.legendGap]} />
            <Text style={styles.legendText}>Gap</Text>
          </View>

          <View style={styles.legendItem}>
            <View style={[styles.legendDot, styles.legendMadeUp]} />
            <Text style={styles.legendText}>Made Up</Text>
          </View>

          <View style={styles.legendItem}>
            <Text style={styles.legendFlag}>⚑</Text>
            <Text style={styles.legendText}>Deadline</Text>
          </View>
        </View>
      </ScrollView>

      {/* Day details bottom sheet */}
      <CalendarDaySheet
        visible={Boolean(selectedDate)}
        onClose={() => setSelectedDate(null)}
        dateString={selectedDate}
        journeyColorMap={journeyColorMap}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  scrollContent: {
    paddingHorizontal: spacing.screenPadding,
    paddingTop: spacing.lg,
    paddingBottom: 110, // clear floating tab pill
    gap: spacing.md,
  },
  header: {
    marginBottom: spacing.xs,
  },
  headerTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modeTogglePill: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderRadius: radius.full,
    padding: 3,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.10)',
  },
  modeButton: {
    paddingVertical: 5,
    paddingHorizontal: 12,
    borderRadius: radius.full,
  },
  modeButtonActive: {
    backgroundColor: colors.gold,
  },
  modeButtonText: {
    fontFamily: fontFamilies.labelStrong,
    fontSize: 11,
    color: colors.textMuted,
  },
  modeButtonTextActive: {
    color: '#060709',
  },
  screenTitle: {
    fontFamily: fontFamilies.display,
    fontSize: 30,
    letterSpacing: -0.8,
    color: colors.gold,
  },
  screenSubtitle: {
    fontFamily: fontFamilies.body,
    fontSize: 13,
    color: colors.textMuted,
    marginTop: 2,
  },
  dualHeaderContainer: {
    backgroundColor: colors.surfaceGlass,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dualHeaderText: {
    fontFamily: fontFamilies.heading,
    fontSize: 14,
    color: colors.gold,
    letterSpacing: -0.2,
    textAlign: 'center',
  },
  calendarGlassCard: {
    padding: spacing.xs,
    overflow: 'hidden',
  },
  arrowButton: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.full,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  arrowText: {
    fontSize: 22,
    color: colors.gold,
    lineHeight: 24,
    fontWeight: '600',
  },
  legendContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.surfaceGlass,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    marginTop: spacing.xs,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendSealed: {
    backgroundColor: colors.gold,
  },
  legendGap: {
    borderWidth: 1,
    borderColor: colors.gap,
    backgroundColor: 'transparent',
  },
  legendMadeUp: {
    borderWidth: 1.5,
    borderColor: colors.gold,
    backgroundColor: 'transparent',
  },
  legendFlag: {
    fontSize: 11,
    color: colors.gold,
  },
  legendText: {
    fontFamily: fontFamilies.label,
    fontSize: 11,
    color: colors.textMuted,
  },
});
