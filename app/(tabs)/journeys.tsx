import { useRouter } from 'expo-router';
import { Plus } from 'lucide-react-native';
import React, { useMemo } from 'react';
import {
  FlatList,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { JourneyCard } from '../../components/journey/JourneyCard';
import { Crescent } from '../../components/ui/Crescent';
import { daysBetween, isAfterDate, isBeforeDate } from '../../core/dates';
import { journeyProgress, todayTasks } from '../../core/progress';
import { dayStatus } from '../../core/status';
import { computeStreakInfo } from '../../core/streak';
import { dayNumberFor } from '../../core/timeline';
import { DayStatus } from '../../core/types';
import { useAppStore } from '../../stores/useAppStore';
import { useJourneyStore } from '../../stores/useJourneyStore';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';

export default function JourneysScreen() {
  const router = useRouter();
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

        let deadlineText: string | null = null;
        if (journey.deadlineLabel && journey.deadlineDate) {
          const left = daysBetween(today, journey.deadlineDate);
          deadlineText = `${journey.deadlineLabel} · ${Math.max(0, left)} days left`;
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
          deadlineText,
          state,
        };
      });
  }, [journeys, tasksRecord, completionsRecord, today]);

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Journeys</Text>
        <Text style={styles.headerSubtitle}>
          {journeyItems.length} {journeyItems.length === 1 ? 'journey' : 'journeys'} in progress
        </Text>
      </View>

      <FlatList
        data={journeyItems}
        keyExtractor={(item) => item.journey.id}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
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
            deadlineCountdownText={item.deadlineText}
            state={item.state}
            onPress={() => router.push(`/journey/${item.journey.id}`)}
          />
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Crescent size={64} opacity={0.3} />
            <Text style={styles.emptyTitle}>No Journeys</Text>
            <Text style={styles.emptySubtitle}>
              Create your first spiritual journey to begin.
            </Text>
          </View>
        }
      />

      {/* Floating "+" Button */}
      <Pressable
        style={styles.fab}
        onPress={() => router.push('/journey/new')}
        accessibilityRole="button"
        accessibilityLabel="Create new journey"
      >
        <Plus size={26} color={colors.bg} strokeWidth={2.5} />
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
    fontFamily: 'CormorantGaramond_600SemiBold',
    fontSize: 32,
    color: colors.gold,
  },
  headerSubtitle: {
    fontSize: 13,
    color: colors.textMuted,
    marginTop: 2,
  },
  listContent: {
    padding: spacing.screenPadding,
    paddingBottom: 90,
    gap: spacing.lg,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
    gap: spacing.md,
  },
  emptyTitle: {
    fontFamily: 'CormorantGaramond_600SemiBold',
    fontSize: 26,
    color: colors.gold,
  },
  emptySubtitle: {
    fontSize: 14,
    color: colors.textMuted,
    textAlign: 'center',
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.gold,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: colors.gold,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
});
