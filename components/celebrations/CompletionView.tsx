import * as Haptics from 'expo-haptics';
import { Award, Calendar, CheckCircle2, Flame, ShieldAlert, Sparkles } from 'lucide-react-native';
import React, { useEffect, useMemo, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Circle, Defs, RadialGradient, Stop } from 'react-native-svg';
import { Button } from '../ui/Button';
import { Crescent } from '../ui/Crescent';
import { GlassCard } from '../ui/GlassCard';
import { formatDisplayDate } from '../../core/dates';
import { journeyProgress } from '../../core/progress';
import { dayStatus } from '../../core/status';
import { computeStreakInfo } from '../../core/streak';
import { dayNumberFor } from '../../core/timeline';
import { DayStatus, Journey } from '../../core/types';
import { useServices } from '../../services/ServicesContext';
import { useAppStore } from '../../stores/useAppStore';
import { useJourneyStore } from '../../stores/useJourneyStore';
import { colors } from '../../theme/colors';
import { radius, spacing } from '../../theme/spacing';
import { fontFamilies } from '../../theme/typography';

export interface CompletionViewProps {
  journey: Journey;
  onDone: (closingNote?: string | null) => void;
  isOverlay?: boolean;
}

export function CompletionView({ journey, onDone, isOverlay = false }: CompletionViewProps) {
  const { journeyService } = useServices();
  const today = useAppStore((s) => s.today);
  const tasks = useJourneyStore((s) => s.tasks[journey.id]) ?? [];
  const completions = useJourneyStore((s) => s.completions[journey.id]) ?? [];

  const [closingNote, setClosingNote] = useState(journey.closingNote ?? '');
  const [submitting, setSubmitting] = useState(false);

  const shouldReduceMotion = useReducedMotion();

  // Animations
  const crescentTranslateY = useSharedValue(shouldReduceMotion ? 0 : 36);
  const crescentOpacity = useSharedValue(shouldReduceMotion ? 1 : 0);
  const dotsScale = useSharedValue(shouldReduceMotion ? 1 : 0.6);
  const dotsOpacity = useSharedValue(shouldReduceMotion ? 0 : 1);
  const haloOpacity = useSharedValue(shouldReduceMotion ? 0.3 : 0);

  // Compute stats
  const { streakInfo, progressInfo } = useMemo(() => {
    const dayStatuses: Record<number, DayStatus> = {};
    for (let d = 1; d <= journey.totalDays; d++) {
      dayStatuses[d] = dayStatus(journey, d, today, tasks, completions);
    }
    const todayDayNumber = dayNumberFor(journey, today);
    const streak = computeStreakInfo(dayStatuses, todayDayNumber, journey.totalDays);
    const progress = journeyProgress(journey, dayStatuses);
    return { streakInfo: streak, progressInfo: progress };
  }, [journey, today, tasks, completions]);

  useEffect(() => {
    // 1. Success haptic on completion presentation
    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    // 2. Animate crescent rising into place
    if (!shouldReduceMotion) {
      crescentTranslateY.value = withTiming(0, {
        duration: 800,
        easing: Easing.out(Easing.back(1.2)),
      });
      crescentOpacity.value = withTiming(1, { duration: 600 });

      // Halo expanding gently
      haloOpacity.value = withTiming(0.4, { duration: 700 });

      // Ring of 12 dots fading outward
      dotsScale.value = withTiming(1.35, {
        duration: 850,
        easing: Easing.out(Easing.cubic),
      });
      dotsOpacity.value = withTiming(0, {
        duration: 850,
        easing: Easing.out(Easing.quad),
      });
    }
  }, [crescentOpacity, crescentTranslateY, dotsOpacity, dotsScale, haloOpacity, shouldReduceMotion]);

  const animatedCrescentStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: crescentTranslateY.value }],
    opacity: crescentOpacity.value,
  }));

  const animatedHaloStyle = useAnimatedStyle(() => ({
    opacity: haloOpacity.value,
  }));

  const animatedDotsStyle = useAnimatedStyle(() => ({
    transform: [{ scale: dotsScale.value }],
    opacity: dotsOpacity.value,
  }));

  const handleDone = async () => {
    if (submitting) return;
    setSubmitting(true);
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const trimmed = closingNote.trim() || null;
    await journeyService.markCompletionShown(journey.id, trimmed);
    setSubmitting(false);
    onDone(trimmed);
  };

  // 12 dots symmetrically around center (radius: 72)
  const dots = useMemo(() => {
    const list = [];
    const count = 12;
    const radiusPx = 72;
    for (let i = 0; i < count; i++) {
      const angle = (i * 2 * Math.PI) / count - Math.PI / 2;
      const cx = 100 + radiusPx * Math.cos(angle);
      const cy = 100 + radiusPx * Math.sin(angle);
      list.push({ cx, cy, key: i });
    }
    return list;
  }, []);

  return (
    <SafeAreaView style={[styles.container, isOverlay && styles.overlayContainer]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardView}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Hero Section */}
          <View style={styles.heroSection}>
            <View style={styles.crescentHeroBox}>
              {/* Expanding 12 gold dots ring */}
              <Animated.View style={[styles.dotsContainer, animatedDotsStyle]} pointerEvents="none">
                <Svg width={200} height={200} viewBox="0 0 200 200">
                  {dots.map((d) => (
                    <Circle key={d.key} cx={d.cx} cy={d.cy} r={3.5} fill={colors.gold} />
                  ))}
                </Svg>
              </Animated.View>

              {/* Glowing Halo */}
              <Animated.View style={[styles.haloContainer, animatedHaloStyle]} pointerEvents="none">
                <Svg width={220} height={220} viewBox="0 0 220 220">
                  <Defs>
                    <RadialGradient id="completionHalo" cx="50%" cy="50%" rx="50%" ry="50%">
                      <Stop offset="0%" stopColor={colors.goldGlow} stopOpacity={0.9} />
                      <Stop offset="55%" stopColor={colors.goldGlow} stopOpacity={0.25} />
                      <Stop offset="100%" stopColor={colors.goldGlow} stopOpacity={0} />
                    </RadialGradient>
                  </Defs>
                  <Circle cx={110} cy={110} r={100} fill="url(#completionHalo)" />
                </Svg>
              </Animated.View>

              {/* Rising Crescent */}
              <Animated.View style={[styles.crescentCenter, animatedCrescentStyle]}>
                <Crescent size={72} color={colors.gold} />
              </Animated.View>
            </View>

            {/* Completion Heading */}
            <View style={styles.headingBadge}>
              <Award size={14} color={colors.gold} />
              <Text style={styles.headingBadgeText}>JOURNEY COMPLETED</Text>
            </View>
            <Text style={styles.headline}>Day {journey.totalDays} Complete</Text>
            <Text style={styles.journeyTitle}>{journey.name}</Text>
          </View>

          {/* Stats Grid */}
          <View style={styles.statsSection}>
            <Text style={styles.sectionHeader}>FINAL STATS</Text>
            <View style={styles.statsGrid}>
              <GlassCard style={styles.statCard}>
                <View style={styles.statIconRow}>
                  <CheckCircle2 size={16} color={colors.gold} />
                  <Text style={styles.statLabel}>SEALED</Text>
                </View>
                <Text style={styles.statValue}>{progressInfo.sealedDays}</Text>
                <Text style={styles.statSub}>of {journey.totalDays} days</Text>
              </GlassCard>

              <GlassCard style={styles.statCard}>
                <View style={styles.statIconRow}>
                  <Flame size={16} color={colors.gold} />
                  <Text style={styles.statLabel}>BEST STREAK</Text>
                </View>
                <Text style={styles.statValue}>{streakInfo.bestStreak}</Text>
                <Text style={styles.statSub}>consecutive days</Text>
              </GlassCard>

              <GlassCard style={styles.statCard}>
                <View style={styles.statIconRow}>
                  <Sparkles size={16} color={colors.goldSoft} />
                  <Text style={styles.statLabel}>MADE UP</Text>
                </View>
                <Text style={styles.statValue}>{progressInfo.madeUpDays}</Text>
                <Text style={styles.statSub}>restored days</Text>
              </GlassCard>

              <GlassCard style={styles.statCard}>
                <View style={styles.statIconRow}>
                  <ShieldAlert size={16} color={colors.textSecondary} />
                  <Text style={styles.statLabel}>GAPS</Text>
                </View>
                <Text style={styles.statValue}>{progressInfo.gapDays}</Text>
                <Text style={styles.statSub}>unsealed days</Text>
              </GlassCard>
            </View>

            {/* Dates Card */}
            <GlassCard style={styles.datesCard}>
              <Calendar size={16} color={colors.gold} />
              <Text style={styles.datesText}>
                {formatDisplayDate(journey.startDate)} — {formatDisplayDate(journey.endDate)}
              </Text>
            </GlassCard>
          </View>

          {/* Optional Closing Note Input */}
          <View style={styles.noteSection}>
            <Text style={styles.sectionHeader}>PERSONAL REFLECTION (OPTIONAL)</Text>
            <GlassCard style={styles.noteCard}>
              <TextInput
                multiline
                numberOfLines={3}
                placeholder="What did you learn or gain from completing this journey?"
                placeholderTextColor={colors.textMuted}
                value={closingNote}
                onChangeText={setClosingNote}
                style={styles.noteInput}
              />
            </GlassCard>
          </View>

          {/* Done Button */}
          <View style={styles.buttonContainer}>
            <Button
              title="Done"
              onPress={handleDone}
              loading={submitting}
              style={styles.doneButton}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  overlayContainer: {
    ...StyleSheet.absoluteFill,
    backgroundColor: colors.bg,
    zIndex: 9999,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
    paddingBottom: spacing.xxl,
    gap: spacing.xl,
  },
  heroSection: {
    alignItems: 'center',
    paddingTop: spacing.md,
  },
  crescentHeroBox: {
    width: 220,
    height: 180,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dotsContainer: {
    position: 'absolute',
    width: 200,
    height: 200,
    alignItems: 'center',
    justifyContent: 'center',
  },
  haloContainer: {
    position: 'absolute',
    width: 220,
    height: 220,
    alignItems: 'center',
    justifyContent: 'center',
  },
  crescentCenter: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: 'rgba(212, 168, 83, 0.08)',
    borderWidth: 1.5,
    borderColor: 'rgba(212, 168, 83, 0.35)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(212, 168, 83, 0.12)',
    paddingHorizontal: spacing.md,
    paddingVertical: 4,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: 'rgba(212, 168, 83, 0.25)',
    marginTop: spacing.md,
    marginBottom: spacing.xs,
  },
  headingBadgeText: {
    fontFamily: fontFamilies.labelStrong,
    fontSize: 11,
    color: colors.gold,
    letterSpacing: 1.2,
  },
  headline: {
    fontFamily: fontFamilies.display,
    fontSize: 32,
    color: colors.text,
    textAlign: 'center',
    marginTop: 4,
  },
  journeyTitle: {
    fontFamily: fontFamilies.body,
    fontSize: 15,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: 4,
    maxWidth: 280,
  },
  statsSection: {
    gap: spacing.sm,
  },
  sectionHeader: {
    fontFamily: fontFamilies.labelStrong,
    fontSize: 11,
    color: colors.textSecondary,
    letterSpacing: 1.2,
    marginBottom: spacing.xs,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  statCard: {
    flex: 1,
    minWidth: '46%',
    padding: spacing.md,
  },
  statIconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  statLabel: {
    fontFamily: fontFamilies.labelStrong,
    fontSize: 10,
    color: colors.textMuted,
    letterSpacing: 1,
  },
  statValue: {
    fontFamily: fontFamilies.numeral,
    fontSize: 26,
    color: colors.gold,
  },
  statSub: {
    fontFamily: fontFamilies.body,
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 2,
  },
  datesCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    marginTop: spacing.xs,
  },
  datesText: {
    fontFamily: fontFamilies.body,
    fontSize: 13,
    color: colors.textMuted,
  },
  noteSection: {
    gap: spacing.sm,
  },
  noteCard: {
    padding: spacing.md,
  },
  noteInput: {
    fontFamily: fontFamilies.body,
    fontSize: 14,
    color: colors.text,
    minHeight: 70,
    textAlignVertical: 'top',
  },
  buttonContainer: {
    marginTop: spacing.sm,
  },
  doneButton: {
    width: '100%',
  },
});
