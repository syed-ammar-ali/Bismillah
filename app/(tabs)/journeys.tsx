import { useRouter } from 'expo-router';
import { Plus } from 'lucide-react-native';
import React, { useCallback, useMemo } from 'react';
import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { JourneyCard } from '../../components/journey/JourneyCard';
import { Crescent } from '../../components/ui/Crescent';
import { isAfterDate, isBeforeDate } from '../../core/dates';
import { journeyProgress, todayTasks } from '../../core/progress';
import { dayStatus } from '../../core/status';
import { computeStreakInfo } from '../../core/streak';
import { dayNumberFor } from '../../core/timeline';
import { DayStatus, GlowLevel, Journey } from '../../core/types';
import { useAppStore } from '../../stores/useAppStore';
import { useJourneyStore } from '../../stores/useJourneyStore';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { fontFamilies } from '../../theme/typography';

interface JourneyItemData {
  journey: Journey;
  dayNumber: number | null;
  progressFraction: number;
  currentStreak: number;
  bestStreak: number;
  glowLevel: GlowLevel;
  todayDoneCount?: number;
  todayTotalCount?: number;
  isSealedToday: boolean;
  state: 'upcoming' | 'active' | 'completed';
}

const JourneyRow = React.memo(function JourneyRow({
  item,
  onPress,
}: {
  item: JourneyItemData;
  onPress: (id: string) => void;
}) {
  const handlePress = useCallback(() => {
    onPress(item.journey.id);
  }, [item.journey.id, onPress]);

  return (
    <JourneyCard
      journey={item.journey}
      dayNumber={item.dayNumber}
      progressFraction={item.progressFraction}
      currentStreak={item.currentStreak}
      bestStreak={item.bestStreak}
      glowLevel={item.glowLevel}
      todayDoneCount={item.todayDoneCount}
      todayTotalCount={item.todayTotalCount}
      isSealedToday={item.isSealedToday}
      state={item.state}
      onPress={handlePress}
    />
  );
});

export default function JourneysScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const today = useAppStore((s) => s.today);
  const journeys = useJourneyStore((s) => s.journeys);
  const tasksRecord = useJourneyStore((s) => s.tasks);
  const completionsRecord = useJourneyStore((s) => s.completions);

  // Compute journey metadata and states
  const journeyItems = useMemo(() => {
    return journeys
      .filter((j) => !j.archivedAt)
      .map((journey) => {
        const tasks = tasksRecord[journey.id] ?? [];
        const completions = completionsRecord[journey.id] ?? [];

        const dayStatuses: Record<number, DayStatus> = {};
        for (let day = 1; day <= journey.totalDays; day++) {
          dayStatuses[day] = dayStatus(journey, day, today, tasks, completions);
        }

        const currentDayNumber = dayNumberFor(journey, today);
        const refDay = currentDayNumber ?? journey.totalDays;
        const streakInfo = computeStreakInfo(dayStatuses, refDay, journey.totalDays);
        const progress = journeyProgress(journey, dayStatuses);

        try {
          let state: 'upcoming' | 'active' | 'completed' = 'active';
          if (isBeforeDate(today, journey.startDate)) {
            state = 'upcoming';
          } else if (
            journey.completionShownAt ||
            dayStatuses[journey.totalDays] === 'sealed' ||
            isAfterDate(today, journey.endDate)
          ) {
            state = 'completed';
          }

          let todayDoneCount: number | undefined;
          let todayTotalCount: number | undefined;
          let isSealedToday = false;

          if (currentDayNumber !== null) {
            const tTasks = todayTasks(currentDayNumber, tasks, completions);
            todayDoneCount = tTasks.filter((t) => t.isCompleted).length;
            todayTotalCount = tTasks.length;
            isSealedToday = dayStatuses[currentDayNumber] === 'sealed';
          }


          return {
            journey,
            dayNumber: currentDayNumber,
            progressFraction: progress.progressFraction,
            currentStreak: streakInfo.currentStreak,
            bestStreak: streakInfo.bestStreak,
            glowLevel: streakInfo.glowLevel,
            todayDoneCount,
            todayTotalCount,
            isSealedToday,
            state,
          };
        } catch {
          // If a journey has corrupted date strings, fallback safely to prevent crash
          return {
            journey,
            dayNumber: null,
            progressFraction: 0,
            currentStreak: 0,
            bestStreak: 0,
            glowLevel: 0 as GlowLevel,
            isSealedToday: false,
            state: 'completed' as const,
          };
        }
      });
  }, [journeys, tasksRecord, completionsRecord, today]);

  const handlePressJourney = useCallback(
    (id: string) => {
      router.push(`/journey/${id}`);
    },
    [router],
  );

  const renderItem = useCallback(
    ({ item }: { item: JourneyItemData }) => (
      <JourneyRow item={item} onPress={handlePressJourney} />
    ),
    [handlePressJourney],
  );

  const keyExtractor = useCallback((item: JourneyItemData) => item.journey.id, []);

  const activeCount = journeyItems.filter((j) => j.state === 'active').length;
  const completedCount = journeyItems.filter((j) => j.state === 'completed').length;
  const upcomingCount = journeyItems.filter((j) => j.state === 'upcoming').length;

  const subtitleText = useMemo(() => {
    if (journeyItems.length === 0) return 'No journeys yet';
    const parts: string[] = [];
    if (activeCount > 0) parts.push(`${activeCount} in progress`);
    if (completedCount > 0) parts.push(`${completedCount} completed`);
    if (upcomingCount > 0) parts.push(`${upcomingCount} upcoming`);
    return parts.join(' · ') || `${journeyItems.length} total`;
  }, [journeyItems.length, activeCount, completedCount, upcomingCount]);

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Journeys</Text>
        <Text style={styles.headerSubtitle}>{subtitleText}</Text>
      </View>

      <FlatList
        data={journeyItems}
        keyExtractor={keyExtractor}
        contentContainerStyle={[
          styles.listContent,
          { paddingBottom: 160 + insets.bottom },
        ]}
        showsVerticalScrollIndicator={false}
        renderItem={renderItem}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Crescent size={64} opacity={0.25} />
            <Text style={styles.emptyTitle}>No Journeys Yet</Text>
            <Text style={styles.emptySubtitle}>
              Create your first spiritual journey to begin.
            </Text>
          </View>
        }
      />

      {/* Floating "+" Button - sits comfortably above the floating tab pill */}
      <Pressable
        style={[styles.fab, { bottom: 94 + insets.bottom }]}
        onPress={() => router.push('/journey/new')}
        accessibilityRole="button"
        accessibilityLabel="Create new journey"
      >
        <Plus size={26} color="#050505" strokeWidth={2.5} />
      </Pressable>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  header: {
    paddingHorizontal: spacing.screenPadding,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
  },
  headerTitle: {
    fontFamily: fontFamilies.display,
    fontSize: 30,
    letterSpacing: -0.8,
    color: colors.gold,
  },
  headerSubtitle: {
    fontFamily: fontFamilies.body,
    fontSize: 13,
    color: colors.textMuted,
    marginTop: 2,
  },
  listContent: {
    padding: spacing.screenPadding,
    paddingBottom: 110, // clear floating tab pill
    gap: spacing.lg,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
    gap: spacing.md,
  },
  emptyTitle: {
    fontFamily: fontFamilies.display,
    fontSize: 24,
    color: colors.text,
    letterSpacing: -0.5,
  },
  emptySubtitle: {
    fontFamily: fontFamilies.body,
    fontSize: 14,
    color: colors.textMuted,
    textAlign: 'center',
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 86, // Floats cleanly above the floating tab bar pill
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: colors.gold,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 5,
    shadowColor: colors.gold,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
  },
});
