import { useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import {
  FlatList,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { ProgressRing } from '../../components/ring/ProgressRing';
import { TaskCard } from '../../components/tasks/TaskCard';
import { Button } from '../../components/ui/Button';
import { Crescent } from '../../components/ui/Crescent';
import { StreakBadge } from '../../components/journey/StreakBadge';
import { formatDisplayDateHeader } from '../../core/dates';
import { useToday } from '../../hooks/useToday';
import { ActiveJourneyToday, useTodayViewModel } from '../../hooks/useTodayViewModel';
import { useServices } from '../../services/ServicesContext';
import { colors } from '../../theme/colors';
import { radius, spacing } from '../../theme/spacing';
import { fontFamilies } from '../../theme/typography';

const TodayTaskItem = React.memo(function TodayTaskItem({
  task,
  journeyId,
  dayNumber,
  onToggleTask,
}: {
  task: ActiveJourneyToday['tasks'][number];
  journeyId: string;
  dayNumber: number;
  onToggleTask: (journeyId: string, taskId: string, dayNumber: number) => void;
}) {
  const handleToggle = useCallback(() => {
    onToggleTask(journeyId, task.id, dayNumber);
  }, [journeyId, task.id, dayNumber, onToggleTask]);

  return (
    <TaskCard
      title={task.title}
      note={task.note}
      isCompleted={task.isCompleted}
      onToggle={handleToggle}
    />
  );
});

interface TodayJourneySectionProps {
  item: ActiveJourneyToday;
  isExpanded: boolean;
  onToggleExpand: (journeyId: string) => void;
  onToggleTask: (journeyId: string, taskId: string, dayNumber: number) => void;
}

const TodayJourneySection = React.memo(function TodayJourneySection({
  item: aj,
  isExpanded,
  onToggleExpand,
  onToggleTask,
}: TodayJourneySectionProps) {
  const isCollapsed = aj.isSealed && !isExpanded;
  const handleToggleExpand = useCallback(() => {
    onToggleExpand(aj.journey.id);
  }, [onToggleExpand, aj.journey.id]);

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
          onPress={handleToggleExpand}
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
            <TodayTaskItem
              key={task.id}
              task={task}
              journeyId={aj.journey.id}
              dayNumber={aj.dayNumber}
              onToggleTask={onToggleTask}
            />
          ))}
          {aj.isSealed ? (
            <Pressable
              onPress={handleToggleExpand}
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
});

export default function TodayScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { today, hijri } = useToday();
  const { activeJourneys, totalDone, totalTasks, gapAlerts } = useTodayViewModel();
  const { tickService } = useServices();

  // Track manual expansion of sealed journeys (default is collapsed)
  const [expandedSealed, setExpandedSealed] = useState<Record<string, boolean>>({});

  const handleToggleSealedExpanded = useCallback((journeyId: string) => {
    setExpandedSealed((prev) => ({
      ...prev,
      [journeyId]: !prev[journeyId],
    }));
  }, []);

  const handleToggleTask = useCallback(
    async (journeyId: string, taskId: string, dayNumber: number) => {
      await tickService.toggle(journeyId, taskId, dayNumber);
    },
    [tickService],
  );

  const renderItem = useCallback(
    ({ item }: { item: ActiveJourneyToday }) => (
      <TodayJourneySection
        item={item}
        isExpanded={Boolean(expandedSealed[item.journey.id])}
        onToggleExpand={handleToggleSealedExpanded}
        onToggleTask={handleToggleTask}
      />
    ),
    [expandedSealed, handleToggleSealedExpanded, handleToggleTask],
  );

  const keyExtractor = useCallback((item: ActiveJourneyToday) => item.journey.id, []);

  const progressFraction = totalTasks > 0 ? totalDone / totalTasks : 0;

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={activeJourneys}
        keyExtractor={keyExtractor}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: 150 + insets.bottom },
        ]}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <View style={styles.headerContainer}>
            {/* Faint watermark crescent */}
            <View style={styles.watermark} pointerEvents="none">
              <Crescent size={130} color={colors.gold} opacity={0.035} />
            </View>

            {/* Date header */}
            <View style={styles.dateHeader}>
              <Text style={styles.todayDate}>{formatDisplayDateHeader(today).toUpperCase()}</Text>
              <Text style={styles.hijriDate}>{hijri.formatted}</Text>
            </View>

            {/* Overall progress ring */}
            {totalTasks > 0 ? (
              <View style={styles.ringWrapper}>
                <ProgressRing progress={progressFraction} size={168} strokeWidth={9}>
                  <View style={styles.ringCenterContainer}>
                    <View style={styles.ringNumberRow}>
                      <Text style={styles.ringDoneText}>{totalDone}</Text>
                      <Text style={styles.ringSlashText}>/</Text>
                      <Text style={styles.ringTotalText}>{totalTasks}</Text>
                    </View>
                    <Text style={styles.ringSubText}>
                      {totalDone === totalTasks && totalTasks > 0 ? '✦ ALL SEALED' : 'TASKS DONE'}
                    </Text>
                  </View>
                </ProgressRing>
              </View>
            ) : null}

            {/* Gap Alerts: Peaceful, subtle horizontal carousel */}
            {gapAlerts.length > 0 ? (
              <View style={styles.gapAlertsContainer}>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.gapScrollContent}
                >
                  {gapAlerts.map((alert) => (
                    <Pressable
                      key={`${alert.journeyId}-${alert.dayNumber}`}
                      onPress={() => router.push(`/journey/${alert.journeyId}`)}
                      style={styles.gapBanner}
                      accessibilityRole="button"
                      accessibilityLabel={`Missed day in ${alert.journeyName}. Tap to make up.`}
                    >
                      <View style={styles.gapHeaderRow}>
                        <View style={styles.gapDot} />
                        <Text style={styles.gapBannerTitle} numberOfLines={1}>
                          Missed Day · {alert.journeyName}
                        </Text>
                      </View>
                      <Text style={styles.gapBannerText} numberOfLines={2}>
                        Tap to add a reason or make up missed tasks →
                      </Text>
                    </Pressable>
                  ))}
                </ScrollView>
              </View>
            ) : null}
          </View>
        }
        renderItem={renderItem}
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
    gap: spacing.xl,
  },
  headerContainer: {
    position: 'relative',
    gap: spacing.lg,
  },
  watermark: {
    position: 'absolute',
    top: 0,
    right: 0,
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
  ringCenterContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  ringNumberRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'center',
  },
  ringDoneText: {
    fontFamily: fontFamilies.numeral,
    fontSize: 34,
    letterSpacing: -0.5,
    color: colors.gold,
  },
  ringSlashText: {
    fontFamily: fontFamilies.heading,
    fontSize: 26,
    color: 'rgba(255, 255, 255, 0.40)',
    marginHorizontal: 3,
  },
  ringTotalText: {
    fontFamily: fontFamilies.numeral,
    fontSize: 32,
    color: 'rgba(255, 255, 255, 0.85)',
  },
  ringSubText: {
    fontFamily: fontFamilies.labelStrong,
    fontSize: 10,
    color: colors.goldSoft,
    letterSpacing: 1.2,
    marginTop: 2,
    opacity: 0.85,
    textAlign: 'center',
  },
  gapAlertsContainer: {
    marginTop: spacing.xs,
  },
  gapScrollContent: {
    gap: spacing.sm,
    paddingRight: spacing.sm,
  },
  gapBanner: {
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.10)',
    paddingVertical: spacing.md - 2,
    paddingHorizontal: spacing.md,
    width: 290,
  },
  gapHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    marginBottom: 4,
  },
  gapDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.50)',
  },
  gapBannerTitle: {
    fontFamily: fontFamilies.labelStrong,
    fontSize: 12,
    color: colors.goldSoft,
    letterSpacing: 0.5,
  },
  gapBannerText: {
    fontFamily: fontFamilies.body,
    color: colors.textMuted,
    fontSize: 12,
    lineHeight: 16,
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
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
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
