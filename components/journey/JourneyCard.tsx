import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { GlowLevel, Journey } from '../../core/types';
import { colors } from '../../theme/colors';
import { radius, spacing } from '../../theme/spacing';
import { ProgressRing } from '../ring/ProgressRing';
import { Crescent } from '../ui/Crescent';
import { StreakBadge } from './StreakBadge';

export interface JourneyCardProps {
  journey: Journey;
  dayNumber?: number | null;
  progressFraction: number; // 0 to 1
  currentStreak: number;
  bestStreak: number;
  glowLevel: GlowLevel;
  todayDoneCount?: number;
  todayTotalCount?: number;
  isSealedToday?: boolean;
  deadlineCountdownText?: string | null;
  state?: 'upcoming' | 'active' | 'completed';
  onPress?: () => void;
}

export function JourneyCard({
  journey,
  dayNumber,
  progressFraction,
  currentStreak,
  glowLevel,
  todayDoneCount,
  todayTotalCount,
  isSealedToday,
  deadlineCountdownText,
  state = 'active',
  onPress,
}: JourneyCardProps) {
  const isCompleted = state === 'completed' || !!journey.completionShownAt;
  const isUpcoming = state === 'upcoming';

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`Journey ${journey.name}`}
      style={({ pressed }) => [
        styles.card,
        isCompleted && styles.cardCompleted,
        isUpcoming && styles.cardUpcoming,
        pressed && styles.pressed,
      ]}
    >
      {/* Top row: name and badges */}
      <View style={styles.topRow}>
        <View style={styles.titleContainer}>
          <Text numberOfLines={1} style={styles.name}>
            {journey.name}
          </Text>
          {deadlineCountdownText ? (
            <Text style={styles.deadline}>{deadlineCountdownText}</Text>
          ) : null}
        </View>

        <View style={styles.badges}>
          <View style={styles.calendarBadge}>
            <Text style={styles.calendarText}>
              {journey.calendarType === 'hijri' ? 'HIJRI' : 'GREGORIAN'}
            </Text>
          </View>
          {isCompleted ? (
            <View style={styles.completedBadge}>
              <Crescent size={12} color={colors.gold} />
            </View>
          ) : null}
        </View>
      </View>

      {/* Middle row: Ring, Stats, Streak */}
      <View style={styles.bodyRow}>
        <ProgressRing progress={progressFraction} size={54} strokeWidth={5}>
          <Text style={styles.ringPercent}>
            {Math.round(progressFraction * 100)}%
          </Text>
        </ProgressRing>

        <View style={styles.statsContainer}>
          <Text style={styles.dayProgress}>
            {dayNumber ? `Day ${dayNumber} of ${journey.totalDays}` : `${journey.totalDays} Days`}
          </Text>
          <View style={styles.statusChip}>
            <Text style={styles.statusChipText}>
              {isSealedToday
                ? 'Sealed Today'
                : todayTotalCount !== undefined
                  ? `${todayDoneCount ?? 0} of ${todayTotalCount} done`
                  : 'Active'}
            </Text>
          </View>
        </View>

        <View style={styles.streakWrapper}>
          <StreakBadge streak={currentStreak} glowLevel={glowLevel} size="small" />
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    gap: spacing.md,
  },
  cardCompleted: {
    borderColor: colors.goldDim,
    backgroundColor: colors.surfaceRaised,
  },
  cardUpcoming: {
    opacity: 0.6,
  },
  pressed: {
    transform: [{ scale: 0.99 }],
    opacity: 0.9,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  titleContainer: {
    flex: 1,
    marginRight: spacing.sm,
  },
  name: {
    fontFamily: 'CormorantGaramond_600SemiBold',
    fontSize: 22,
    color: colors.text,
  },
  deadline: {
    fontSize: 12,
    color: colors.goldSoft,
    marginTop: 2,
  },
  badges: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  calendarBadge: {
    backgroundColor: colors.surfaceRaised,
    borderRadius: radius.sm,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderWidth: 1,
    borderColor: colors.border,
  },
  calendarText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.textMuted,
    letterSpacing: 0.5,
  },
  completedBadge: {
    backgroundColor: colors.surfaceRaised,
    borderRadius: radius.full,
    padding: 4,
    borderWidth: 1,
    borderColor: colors.goldDim,
  },
  bodyRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ringPercent: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.goldSoft,
  },
  statsContainer: {
    flex: 1,
    marginLeft: spacing.md,
    justifyContent: 'center',
  },
  dayProgress: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  statusChip: {
    alignSelf: 'flex-start',
    backgroundColor: colors.surfaceRaised,
    borderRadius: radius.full,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginTop: 4,
    borderWidth: 1,
    borderColor: colors.border,
  },
  statusChipText: {
    fontSize: 11,
    color: colors.textMuted,
    fontWeight: '500',
  },
  streakWrapper: {
    marginLeft: spacing.sm,
  },
});
