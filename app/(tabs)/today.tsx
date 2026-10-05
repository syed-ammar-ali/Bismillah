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
import { Button } from '../../components/ui/Button';
import { Crescent } from '../../components/ui/Crescent';
import { StreakBadge } from '../../components/journey/StreakBadge';
import { useToday } from '../../hooks/useToday';
import { ActiveJourneyToday, useTodayViewModel } from '../../hooks/useTodayViewModel';
import { useServices } from '../../services/ServicesContext';
import { colors } from '../../theme/colors';
import { radius, spacing } from '../../theme/spacing';
import { fontFamilies } from '../../theme/typography';

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
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <View style={styles.headerContainer}>
            {/* Faint watermark crescent */}
            <View style={styles.watermark} pointerEvents="none">
              <Crescent size={150} color={colors.gold} opacity={0.05} />
            </View>

            {/* Date header */}
            <View style={styles.dateHeader}>
              <Text style={styles.todayDate}>{today.toUpperCase()}</Text>
              <Text style={styles.hijriDate}>{hijri.formatted}</Text>
            </View>

            {/* Overall progress ring */}
            {totalTasks > 0 ? (
              <View style={styles.ringWrapper}>
                <ProgressRing progress={progressFraction} size={156} strokeWidth={8}>
                  <Text style={styles.ringDoneText}>
                    {totalDone}<Text style={styles.ringTotalText}>/{totalTasks}</Text>
                  </Text>
                  <Text style={styles.ringSubText}>
                    {totalDone === totalTasks && totalTasks > 0 ? '✦ ALL SEALED' : 'TASKS COMPLETED'}
                  </Text>
                </ProgressRing>
              </View>
            ) : null}

            {/* Gap Alerts */}
            {gapAlerts.length > 0 ? (
              <View style={styles.gapAlertsContainer}>
                {gapAlerts.map((alert) => (
                  <View key={`${alert.journeyId}-${alert.dayNumber}`} style={styles.gapBanner}>
                    <Text style={styles.gapBannerTitle}>Notice</Text>
                    <Text style={styles.gapBannerText}>
                      Yesterday was missed in {alert.journeyName}. You can add a reason or make up missed tasks.
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
                  <Text style={styles.expandHint}>View tasks</Text>
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
            <Crescent size={64} opacity={0.25} />
            <Text style={styles.emptyTitle}>No Journeys Active</Text>
            <Text style={styles.emptySubtitle}>
              Begin your spiritual discipline with clear daily commitments.
            </Text>
            <Button
              title="Create your first journey"
              onPress={() => router.push('/journey/new')}
              style={styles.emptyButton}
            />
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
    paddingBottom: 110, // clear floating tab pill
    gap: spacing.xl,
  },
  headerContainer: {
    position: 'relative',
    gap: spacing.lg,
  },
  watermark: {
    position: 'absolute',
    top: -10,
    right: -10,
    zIndex: -1,
  },
  dateHeader: {
    marginTop: spacing.sm,
  },
  todayDate: {
    fontSize: 12,
    fontFamily: fontFamilies.labelStrong,
    color: colors.textMuted,
    letterSpacing: 1.2,
  },
  hijriDate: {
    fontFamily: fontFamilies.display,
    fontSize: 30,
    letterSpacing: -0.8,
    color: colors.gold,
    marginTop: 4,
  },
  ringWrapper: {
    alignItems: 'center',
    marginVertical: spacing.md,
  },
  ringDoneText: {
    fontFamily: fontFamilies.numeral,
    fontSize: 36,
    letterSpacing: -1,
    color: colors.gold,
  },
  ringTotalText: {
    fontFamily: fontFamilies.heading,
    fontSize: 22,
    color: colors.textMuted,
  },
  ringSubText: {
    fontFamily: fontFamilies.labelStrong,
    fontSize: 10,
    color: colors.textMuted,
    letterSpacing: 1.2,
    marginTop: 2,
  },
  gapAlertsContainer: {
    gap: spacing.sm,
  },
  gapBanner: {
    backgroundColor: colors.surfaceGlass,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.25)',
    padding: spacing.md,
  },
  gapBannerTitle: {
    fontFamily: fontFamilies.labelStrong,
    fontSize: 11,
    color: colors.danger,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  gapBannerText: {
    fontFamily: fontFamilies.body,
    color: colors.text,
    fontSize: 13,
    lineHeight: 18,
  },
  journeySection: {
    backgroundColor: colors.surfaceGlass,
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
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
    marginRight: spacing.sm,
  },
  journeyName: {
    fontFamily: fontFamilies.heading,
    fontSize: 19,
    letterSpacing: -0.3,
    color: colors.text,
  },
  dayNumberText: {
    fontFamily: fontFamilies.label,
    fontSize: 13,
    color: colors.goldSoft,
    marginTop: 2,
  },
  journeyHeaderRight: {
    marginLeft: spacing.sm,
  },
  taskList: {
    gap: spacing.sm,
  },
  sealedCollapseBanner: {
    backgroundColor: 'rgba(245, 158, 11, 0.08)',
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.22)',
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
    fontFamily: fontFamilies.labelStrong,
    color: colors.gold,
    fontSize: 14,
  },
  expandHint: {
    fontFamily: fontFamilies.label,
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
    fontFamily: fontFamilies.label,
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
    maxWidth: 280,
    lineHeight: 20,
  },
  emptyButton: {
    marginTop: spacing.md,
  },
});
