import { useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import {
  FlatList,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { ProgressRing } from '../../components/ring/ProgressRing';
import { TaskCard } from '../../components/tasks/TaskCard';
import { Crescent } from '../../components/ui/Crescent';
import { StreakBadge } from '../../components/journey/StreakBadge';
import { useToday } from '../../hooks/useToday';
import { ActiveJourneyToday, useTodayViewModel } from '../../hooks/useTodayViewModel';
import { useServices } from '../../services/ServicesContext';
import { colors } from '../../theme/colors';
import { radius, spacing } from '../../theme/spacing';

export default function TodayScreen() {
  const router = useRouter();
  const { today, hijri } = useToday();
  const { activeJourneys, totalDone, totalTasks, gapAlerts } = useTodayViewModel();
  const { tickService } = useServices();

  // Track manual expansion of sealed journeys (default is collapsed)
  const [expandedSealed, setExpandedSealed] = useState<Record<string, boolean>>({});

  const handleToggleSealedExpanded = (journeyId: string) => {
    setExpandedSealed((prev) => ({
      ...prev,
      [journeyId]: !prev[journeyId],
    }));
  };

  const handleToggleTask = useCallback(
    async (journeyId: string, taskId: string, dayNumber: number) => {
      await tickService.toggle(journeyId, taskId, dayNumber);
    },
    [tickService],
  );

  const progressFraction = totalTasks > 0 ? totalDone / totalTasks : 0;

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={activeJourneys}
        keyExtractor={(item) => item.journey.id}
        contentContainerStyle={styles.scrollContent}
        ListHeaderComponent={
          <View style={styles.headerContainer}>
            {/* Faint large crescent watermark */}
            <View style={styles.watermark}>
              <Crescent size={140} color={colors.gold} opacity={0.04} />
            </View>

            {/* Date header */}
            <View style={styles.dateHeader}>
              <Text style={styles.todayDate}>{today}</Text>
              <Text style={styles.hijriDate}>{hijri.formatted}</Text>
            </View>

            {/* Overall progress ring */}
            {totalTasks > 0 ? (
              <View style={styles.ringWrapper}>
                <ProgressRing progress={progressFraction} size={150} strokeWidth={9}>
                  <Text style={styles.ringDoneText}>
                    {totalDone} / {totalTasks}
                  </Text>
                  <Text style={styles.ringSubText}>
                    {totalDone === totalTasks && totalTasks > 0 ? 'All Sealed!' : 'Tasks Done'}
                  </Text>
                </ProgressRing>
              </View>
            ) : null}

            {/* Gap Alerts */}
            {gapAlerts.length > 0 ? (
              <View style={styles.gapAlertsContainer}>
                {gapAlerts.map((alert) => (
                  <View key={`${alert.journeyId}-${alert.dayNumber}`} style={styles.gapBanner}>
                    <Text style={styles.gapBannerText}>
                      Yesterday was missed in {alert.journeyName}. Add a reason or make up.
                    </Text>
                  </View>
                ))}
              </View>
            ) : null}
          </View>
        }
        renderItem={({ item: aj }: { item: ActiveJourneyToday }) => {
          const isCollapsed = aj.isSealed && !expandedSealed[aj.journey.id];

          return (
            <View style={styles.journeySection}>
              {/* Journey Header */}
              <View style={styles.journeyHeader}>
                <View style={styles.journeyTitleCol}>
                  <Text style={styles.journeyName}>{aj.journey.name}</Text>
                  <Text style={styles.dayNumberText}>
                    Day {aj.dayNumber} of {aj.journey.totalDays}
                  </Text>
                </View>

                <View style={styles.journeyHeaderRight}>
                  <StreakBadge streak={aj.streak} glowLevel={aj.glowLevel} size="small" />
                </View>
              </View>

              {/* Collapsed state when sealed */}
              {isCollapsed ? (
                <Pressable
                  onPress={() => handleToggleSealedExpanded(aj.journey.id)}
                  style={styles.sealedCollapseBanner}
                  accessibilityRole="button"
                  accessibilityLabel={`${aj.journey.name} is sealed. Tap to show tasks.`}
                >
                  <View style={styles.sealedIndicator}>
                    <Text style={styles.sealedCheck}>✓</Text>
                    <Text style={styles.sealedCollapseText}>Sealed for today</Text>
                  </View>
                  <Text style={styles.expandHint}>Tap to view</Text>
                </Pressable>
              ) : (
                <View style={styles.taskList}>
                  {aj.tasks.map((task) => (
                    <TaskCard
                      key={task.id}
                      title={task.title}
                      note={task.note}
                      isCompleted={task.isCompleted}
                      onToggle={() => handleToggleTask(aj.journey.id, task.id, aj.dayNumber)}
                    />
                  ))}
                  {aj.isSealed ? (
                    <Pressable
                      onPress={() => handleToggleSealedExpanded(aj.journey.id)}
                      style={styles.collapseHintButton}
                      accessibilityRole="button"
                      accessibilityLabel="Collapse completed journey"
                    >
                      <Text style={styles.collapseHintText}>Collapse section</Text>
                    </Pressable>
                  ) : null}
                </View>
              )}
            </View>
          );
        }}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Crescent size={64} opacity={0.3} />
            <Text style={styles.emptyTitle}>No journeys today</Text>
            <Text style={styles.emptySubtitle}>
              Begin your first spiritual challenge with daily tasks.
            </Text>
            <Pressable
              style={styles.createButton}
              onPress={() => router.push('/journey/new')}
              accessibilityRole="button"
              accessibilityLabel="Create journey"
            >
              <Text style={styles.createButtonText}>Create a Journey</Text>
            </Pressable>
          </View>
        }
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
    padding: spacing.screenPadding,
    paddingBottom: 40,
    gap: spacing.xl,
  },
  headerContainer: {
    position: 'relative',
    gap: spacing.lg,
  },
  watermark: {
    position: 'absolute',
    top: -20,
    right: -10,
    zIndex: -1,
  },
  dateHeader: {
    marginTop: spacing.sm,
  },
  todayDate: {
    fontSize: 14,
    color: colors.textMuted,
    fontWeight: '500',
  },
  hijriDate: {
    fontFamily: 'CormorantGaramond_600SemiBold',
    fontSize: 28,
    color: colors.gold,
    marginTop: 2,
  },
  ringWrapper: {
    alignItems: 'center',
    marginVertical: spacing.md,
  },
  ringDoneText: {
    fontFamily: 'CormorantGaramond_600SemiBold',
    fontSize: 34,
    color: colors.gold,
  },
  ringSubText: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 2,
  },
  gapAlertsContainer: {
    gap: spacing.xs,
  },
  gapBanner: {
    backgroundColor: colors.surfaceRaised,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.gap,
    padding: spacing.md,
  },
  gapBannerText: {
    color: colors.text,
    fontSize: 13,
  },
  journeySection: {
    backgroundColor: colors.surface,
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    gap: spacing.md,
  },
  journeyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  journeyTitleCol: {
    flex: 1,
  },
  journeyName: {
    fontFamily: 'CormorantGaramond_600SemiBold',
    fontSize: 22,
    color: colors.text,
  },
  dayNumberText: {
    fontSize: 13,
    color: colors.textMuted,
    marginTop: 2,
  },
  journeyHeaderRight: {
    marginLeft: spacing.sm,
  },
  taskList: {
    gap: spacing.sm,
  },
  sealedCollapseBanner: {
    backgroundColor: colors.surfaceRaised,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.goldDim,
    padding: spacing.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sealedIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sealedCheck: {
    color: colors.gold,
    fontSize: 16,
    fontWeight: '700',
  },
  sealedCollapseText: {
    color: colors.goldSoft,
    fontSize: 14,
    fontWeight: '600',
  },
  expandHint: {
    fontSize: 12,
    color: colors.textMuted,
  },
  collapseHintButton: {
    alignSelf: 'center',
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    marginTop: spacing.xs,
  },
  collapseHintText: {
    color: colors.textMuted,
    fontSize: 12,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
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
    maxWidth: 260,
  },
  createButton: {
    marginTop: spacing.md,
    backgroundColor: colors.gold,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    borderRadius: radius.md,
  },
  createButtonText: {
    color: colors.bg,
    fontSize: 15,
    fontWeight: '700',
  },
});
