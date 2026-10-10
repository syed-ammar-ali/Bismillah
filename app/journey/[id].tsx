import { useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowLeft, Pencil } from 'lucide-react-native';
import React, { useCallback, useEffect, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, {
  Easing,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Circle, Defs, RadialGradient, Stop } from 'react-native-svg';
import { DayGrid } from '../../components/grid/DayGrid';
import { StreakBadge } from '../../components/journey/StreakBadge';
import { ProgressRing } from '../../components/ring/ProgressRing';
import { DaySheet } from '../../components/sheets/DaySheet';
import { TaskCard } from '../../components/tasks/TaskCard';
import { daysBetween, isAfterDate } from '../../core/dates';
import { useJourneyViewModel } from '../../hooks/useJourneyViewModel';
import { useServices } from '../../services/ServicesContext';
import { useAppStore } from '../../stores/useAppStore';
import { colors } from '../../theme/colors';
import { glowLevels } from '../../theme/glow';
import { radius, spacing } from '../../theme/spacing';
import { fontFamilies } from '../../theme/typography';

export default function JourneyDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const today = useAppStore((s) => s.today);
  const vm = useJourneyViewModel(id ?? '');
  const { tickService } = useServices();

  const [selectedDayNumber, setSelectedDayNumber] = useState<number | null>(null);

  const reducedMotion = useReducedMotion();
  const glowLevel = vm?.streakInfo.glowLevel ?? 0;
  const spec = glowLevels[glowLevel];

  const pulseOpacity = useSharedValue(spec.opacity);

  useEffect(() => {
    if (!reducedMotion && spec.hasPulse) {
      pulseOpacity.value = withRepeat(
        withTiming(spec.opacity * 0.4, {
          duration: 1500,
          easing: Easing.inOut(Easing.ease),
        }),
        -1,
        true,
      );
    } else {
      pulseOpacity.value = spec.opacity;
    }
  }, [spec, reducedMotion, pulseOpacity]);

  const animatedGlowStyle = useAnimatedStyle(() => ({
    opacity: pulseOpacity.value,
  }));

  const handleToggleTask = useCallback(
    async (journeyId: string, taskId: string, dayNumber: number) => {
      await tickService.toggle(journeyId, taskId, dayNumber);
    },
    [tickService],
  );


  if (!vm) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.notFoundContainer}>
          <Text style={styles.notFoundTitle}>Journey Not Found</Text>
          <Text style={styles.notFoundText}>
            This journey may have been deleted or does not exist.
          </Text>
          <Pressable
            style={styles.backButton}
            onPress={() => router.back()}
            accessibilityRole="button"
            accessibilityLabel="Go back"
          >
            <Text style={styles.backButtonText}>← Go Back</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  const { journey, dayStatuses, streakInfo, progressInfo, todayDayNumber, todayTasksList } = vm;

  const isUpcoming = isAfterDate(journey.startDate, today);
  const daysUntilStart = isUpcoming ? daysBetween(today, journey.startDate) : 0;
  const remainingDays = journey.totalDays - (progressInfo.sealedDays + progressInfo.madeUpDays);
  const isCompleted = remainingDays === 0 || (!isUpcoming && todayDayNumber === null);

  const progressFraction = journey.totalDays > 0 ? progressInfo.sealedDays / journey.totalDays : 0;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Top Header */}
        <View style={styles.header}>
          <Pressable
            onPress={() => router.back()}
            style={styles.iconButton}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel="Go back"
          >
            <ArrowLeft size={22} color={colors.text} />
          </Pressable>

          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle} numberOfLines={1}>
              {journey.name}
            </Text>
            {journey.archivedAt ? (
              <View style={styles.archivedBadge}>
                <Text style={styles.archivedBadgeText}>Archived</Text>
              </View>
            ) : null}
          </View>

          <View style={styles.headerActions}>
            <Pressable
              onPress={() => router.push(`/journey/${journey.id}/edit`)}
              style={styles.iconButton}
              hitSlop={8}
              accessibilityRole="button"
              accessibilityLabel="Edit journey"
            >
              <Pencil size={20} color={colors.gold} />
            </Pressable>
          </View>
        </View>

        {/* Hero Section: Progress Ring with Glow and Streak */}
        <View style={styles.heroSection}>
          {glowLevel > 0 ? (
            <Animated.View style={[styles.heroGlowWrapper, animatedGlowStyle]}>
              <Svg width={230} height={230} viewBox="0 0 100 100">
                <Defs>
                  <RadialGradient id="heroGlowGrad" cx="50%" cy="50%" rx="50%" ry="50%">
                    <Stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.22" />
                    <Stop offset="55%" stopColor="#FFFFFF" stopOpacity="0.06" />
                    <Stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
                  </RadialGradient>
                </Defs>
                <Circle cx="50" cy="50" r="50" fill="url(#heroGlowGrad)" />
                {spec.hasSecondHalo ? (
                  <Circle
                    cx="50"
                    cy="50"
                    r="47"
                    stroke={colors.goldSoft}
                    strokeWidth="0.8"
                    strokeOpacity="0.35"
                    fill="none"
                  />
                ) : null}
              </Svg>
            </Animated.View>
          ) : null}

          <ProgressRing progress={progressFraction} size={180} strokeWidth={11}>
            <View style={styles.ringInnerContent}>
              <Text style={styles.ringDayText}>
                {isUpcoming
                  ? `Starts in ${daysUntilStart}d`
                  : isCompleted
                    ? 'Completed'
                    : `Day ${todayDayNumber ?? progressInfo.sealedDays} of ${journey.totalDays}`}
              </Text>

              <StreakBadge
                streak={streakInfo.currentStreak}
                glowLevel={0}
                size="medium"
              />
            </View>
          </ProgressRing>
        </View>

        {/* Stats Row: Sealed, Gaps, Made Up, Best Streak */}
        <View style={styles.statsContainer}>
          <View style={styles.statBox}>
            <Text style={styles.statNumberGold}>{progressInfo.sealedDays}</Text>
            <Text style={styles.statLabel}>Sealed</Text>
          </View>

          <View style={styles.statDivider} />

          <View style={styles.statBox}>
            <Text style={styles.statNumberMuted}>{progressInfo.gapDays}</Text>
            <Text style={styles.statLabel}>Gaps</Text>
          </View>

          <View style={styles.statDivider} />

          <View style={styles.statBox}>
            <Text style={styles.statNumberSoft}>{progressInfo.madeUpDays}</Text>
            <Text style={styles.statLabel}>Made Up</Text>
          </View>

          <View style={styles.statDivider} />

          <View style={styles.statBox}>
            <Text style={styles.statNumberGold}>{streakInfo.bestStreak}</Text>
            <Text style={styles.statLabel}>Best Streak</Text>
          </View>
        </View>



        {/* Today's Tasks Section (if active today) */}
        {todayDayNumber !== null && todayTasksList.length > 0 ? (
          <View style={styles.sectionContainer}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>{"Today's Tasks"}</Text>
              <Text style={styles.sectionSubtitle}>Day {todayDayNumber}</Text>
            </View>

            <View style={styles.tasksList}>
              {todayTasksList.map((item) => (
                <TaskCard
                  key={item.id}
                  title={item.title}
                  note={item.note}
                  isCompleted={item.isCompleted}
                  onToggle={() =>
                    handleToggleTask(journey.id, item.id, todayDayNumber)
                  }
                />
              ))}
            </View>
          </View>
        ) : isUpcoming ? (
          <View style={styles.statusNotice}>
            <Text style={styles.statusNoticeTitle}>Upcoming Journey</Text>
            <Text style={styles.statusNoticeText}>
              Starts on {journey.startDate} ({daysUntilStart} days remaining).
            </Text>
          </View>
        ) : isCompleted ? (
          <View style={styles.statusNotice}>
            <Text style={styles.statusNoticeTitle}>Journey Complete</Text>
            <Text style={styles.statusNoticeText}>
              All {journey.totalDays} days completed. Review your timeline below.
            </Text>
          </View>
        ) : null}

        {/* Full Day Grid Section */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Timeline</Text>
            <Text style={styles.sectionSubtitle}>
              {journey.totalDays} Days · Tap a day to view details
            </Text>
          </View>

          {/* Timeline legend */}
          <View style={styles.legendContainer}>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, styles.legendSealed]} />
              <Text style={styles.legendLabel}>Sealed</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, styles.legendMadeUp]} />
              <Text style={styles.legendLabel}>Made up</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, styles.legendGap]}>
                <Text style={styles.legendGapDash}>-</Text>
              </View>
              <Text style={styles.legendLabel}>Gap</Text>
            </View>
            {!isCompleted && todayDayNumber !== null ? (
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, styles.legendToday]} />
                <Text style={styles.legendLabel}>Today</Text>
              </View>
            ) : null}
          </View>

          {/* Day Grid */}
          <View style={styles.gridCard}>
            <DayGrid
              totalDays={journey.totalDays}
              dayStatuses={dayStatuses}
              onDayPress={(day) => setSelectedDayNumber(day)}
            />
          </View>
        </View>
      </ScrollView>

      {/* Day Sheet modal */}
      <DaySheet
        visible={selectedDayNumber !== null}
        onClose={() => setSelectedDayNumber(null)}
        journey={journey}
        dayNumber={selectedDayNumber}
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
    paddingBottom: spacing.xxl,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
  },
  headerCenter: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.sm,
    gap: spacing.xs,
  },
  headerTitle: {
    fontFamily: fontFamilies.heading,
    fontSize: 18,
    letterSpacing: -0.3,
    color: colors.text,
    textAlign: 'center',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconButton: {
    width: 38,
    height: 38,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceGlass,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    alignItems: 'center',
    justifyContent: 'center',
  },
  archivedBadge: {
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.xs + 2,
    paddingVertical: 2,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  archivedBadgeText: {
    fontSize: 10,
    color: colors.textMuted,
    fontWeight: '600',
  },
  heroSection: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: spacing.lg,
  },
  heroGlowWrapper: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    width: 230,
    height: 230,
  },
  ringInnerContent: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
  },
  ringDayText: {
    fontFamily: fontFamilies.heading,
    fontSize: 18,
    letterSpacing: -0.2,
    color: colors.gold,
  },
  statsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceGlass,
    marginHorizontal: spacing.lg,
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statDivider: {
    width: 1,
    height: 28,
    backgroundColor: colors.border,
  },
  statNumberGold: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 18,
    color: colors.gold,
  },
  statNumberMuted: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 18,
    color: colors.gap,
  },
  statNumberSoft: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 18,
    color: colors.goldSoft,
  },
  statLabel: {
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 2,
  },

  sectionContainer: {
    marginHorizontal: spacing.lg,
    marginTop: spacing.xl,
  },
  sectionHeader: {
    marginBottom: spacing.sm,
  },
  sectionTitle: {
    fontFamily: fontFamilies.heading,
    fontSize: 18,
    letterSpacing: -0.2,
    color: colors.gold,
  },
  sectionSubtitle: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 1,
  },
  tasksList: {
    gap: spacing.sm,
  },
  statusNotice: {
    marginHorizontal: spacing.lg,
    marginTop: spacing.xl,
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
  },
  statusNoticeTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.goldSoft,
    marginBottom: 2,
  },
  statusNoticeText: {
    fontSize: 12,
    color: colors.textMuted,
    textAlign: 'center',
  },
  legendContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.xs,
    marginBottom: spacing.sm,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  legendDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    alignItems: 'center',
    justifyContent: 'center',
  },
  legendSealed: {
    backgroundColor: colors.gold,
  },
  legendMadeUp: {
    borderWidth: 1.5,
    borderColor: colors.gold,
  },
  legendGap: {
    borderWidth: 1,
    borderColor: colors.gap,
  },
  legendGapDash: {
    fontSize: 9,
    color: colors.gap,
    fontWeight: '700',
    lineHeight: 11,
  },
  legendToday: {
    borderWidth: 1.5,
    borderColor: colors.gold,
  },
  legendLabel: {
    fontSize: 11,
    color: colors.textMuted,
  },
  gridCard: {
    backgroundColor: colors.surfaceGlass,
    padding: spacing.md,
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
  },
  footerActions: {
    alignItems: 'center',
    marginTop: spacing.xl,
    paddingHorizontal: spacing.lg,
  },
  archiveActionButton: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
  },
  archiveActionText: {
    fontSize: 13,
    color: colors.textMuted,
    textDecorationLine: 'underline',
  },
  notFoundContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  notFoundTitle: {
    fontFamily: fontFamilies.display,
    fontSize: 24,
    color: colors.gold,
    marginBottom: spacing.sm,
  },
  notFoundText: {
    fontSize: 14,
    color: colors.textMuted,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  backButton: {
    backgroundColor: colors.surfaceRaised,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  backButtonText: {
    fontSize: 14,
    color: colors.gold,
    fontWeight: '600',
  },
});
