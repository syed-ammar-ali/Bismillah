import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, Defs, RadialGradient, Stop } from 'react-native-svg';
import { GlowLevel, Journey } from '../../core/types';
import { colors } from '../../theme/colors';
import { glowLevels } from '../../theme/glow';
import { radius, spacing } from '../../theme/spacing';
import { ProgressRing } from '../ring/ProgressRing';
import { StreakBadge } from './StreakBadge';

export interface JourneyCardProps {
  journey: Journey;
  dayNumber?: number | null;
  progressFraction: number;
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
  const spec = glowLevels[glowLevel];

  const progressPercent = Math.round(progressFraction * 100);

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
      {/* Ambient glow bloom — visible on OLED black */}
      {glowLevel > 0 ? (
        <View style={styles.glowWrapper} pointerEvents="none">
          <Svg width="100%" height="100%" viewBox="0 0 300 120">
            <Defs>
              <RadialGradient id={`cardGlow-${journey.id}`} cx="15%" cy="50%" rx="40%" ry="100%">
                <Stop offset="0%" stopColor="#F59E0B" stopOpacity={String(spec.opacity * 0.6)} />
                <Stop offset="100%" stopColor="#F59E0B" stopOpacity="0" />
              </RadialGradient>
            </Defs>
            <Circle cx="45" cy="60" r="90" fill={`url(#cardGlow-${journey.id})`} />
          </Svg>
        </View>
      ) : null}

      {/* Top row: name and calendar type */}
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
              {journey.calendarType === 'hijri' ? 'HIJRI' : 'GREG'}
            </Text>
          </View>
          {isCompleted ? (
            <View style={styles.completedBadge}>
              <Text style={styles.completedText}>✦</Text>
            </View>
          ) : null}
        </View>
      </View>

      {/* Body row: Ring, progress, streak */}
      <View style={styles.bodyRow}>
        <ProgressRing progress={progressFraction} size={52} strokeWidth={4}>
          <Text style={styles.ringPercent}>{progressPercent}%</Text>
        </ProgressRing>

        <View style={styles.statsContainer}>
          <Text style={styles.dayProgress}>
            {dayNumber
              ? `Day ${dayNumber} of ${journey.totalDays}`
              : `${journey.totalDays} days total`}
          </Text>

          <View style={styles.statusRow}>
            {isSealedToday ? (
              <View style={[styles.statusChip, styles.statusChipSealed]}>
                <Text style={[styles.statusChipText, styles.statusChipTextSealed]}>Sealed ✦</Text>
              </View>
            ) : todayTotalCount !== undefined ? (
              <View style={styles.statusChip}>
                <Text style={styles.statusChipText}>
                  {todayDoneCount ?? 0}/{todayTotalCount} done
                </Text>
              </View>
            ) : isUpcoming ? (
              <View style={[styles.statusChip, styles.statusChipUpcoming]}>
                <Text style={styles.statusChipText}>Upcoming</Text>
              </View>
            ) : null}
          </View>
        </View>

        <StreakBadge streak={currentStreak} glowLevel={glowLevel} size="small" />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    padding: spacing.lg,
    gap: spacing.md,
    overflow: 'hidden',
    position: 'relative',
  },
  cardCompleted: {
    backgroundColor: 'rgba(245, 158, 11, 0.06)',
    borderColor: 'rgba(245, 158, 11, 0.20)',
  },
  cardUpcoming: {
    opacity: 0.55,
  },
  pressed: {
    transform: [{ scale: 0.985 }],
    opacity: 0.88,
  },
  glowWrapper: {
    ...StyleSheet.absoluteFill,
    overflow: 'hidden',
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
    fontFamily: 'Outfit_700Bold',
    fontSize: 20,
    letterSpacing: -0.4,
    color: colors.text,
  },
  deadline: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    color: colors.goldSoft,
    marginTop: 2,
    opacity: 0.75,
  },
  badges: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  calendarBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderRadius: radius.sm,
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  calendarText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 9,
    fontWeight: '700',
    color: 'rgba(255, 255, 255, 0.35)',
    letterSpacing: 1.2,
  },
  completedBadge: {
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    borderRadius: radius.full,
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.30)',
  },
  completedText: {
    fontSize: 10,
    color: colors.gold,
  },
  bodyRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ringPercent: {
    fontFamily: 'Outfit_600SemiBold',
    fontSize: 11,
    color: colors.goldSoft,
    letterSpacing: -0.3,
  },
  statsContainer: {
    flex: 1,
    marginLeft: spacing.md,
    justifyContent: 'center',
    gap: 5,
  },
  dayProgress: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 13,
    color: colors.text,
    letterSpacing: -0.1,
  },
  statusRow: {
    flexDirection: 'row',
  },
  statusChip: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderRadius: radius.full,
    paddingHorizontal: 9,
    paddingVertical: 3,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  statusChipSealed: {
    backgroundColor: 'rgba(245, 158, 11, 0.12)',
    borderColor: 'rgba(245, 158, 11, 0.25)',
  },
  statusChipUpcoming: {
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
  },
  statusChipText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.45)',
  },
  statusChipTextSealed: {
    color: colors.goldSoft,
  },
});
