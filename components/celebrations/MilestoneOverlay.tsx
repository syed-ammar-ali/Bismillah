import * as Haptics from 'expo-haptics';
import { Flame, Sparkles } from 'lucide-react-native';
import React, { useEffect, useRef } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  FadeIn,
  FadeOut,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Circle, Defs, RadialGradient, Stop } from 'react-native-svg';
import { GlassCard } from '../ui/GlassCard';
import { colors } from '../../theme/colors';
import { radius, spacing } from '../../theme/spacing';
import { fontFamilies } from '../../theme/typography';

export interface MilestoneOverlayProps {
  dayNumber: number;
  journeyName: string;
  streak: number;
  onDismiss: () => void;
}

export function MilestoneOverlay({
  dayNumber,
  journeyName,
  streak,
  onDismiss,
}: MilestoneOverlayProps) {
  const shouldReduceMotion = useReducedMotion();
  const dismissedRef = useRef(false);

  const glowScale = useSharedValue(shouldReduceMotion ? 1 : 0.7);
  const glowOpacity = useSharedValue(shouldReduceMotion ? 0.6 : 0.2);
  const cardScale = useSharedValue(shouldReduceMotion ? 1 : 0.85);

  const handleDismiss = () => {
    if (dismissedRef.current) return;
    dismissedRef.current = true;
    onDismiss();
  };

  useEffect(() => {
    // 1. Milestone haptics: Success notification then Heavy impact
    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    const hapticTimer = setTimeout(() => {
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    }, 180);

    // 2. Animate glow burst and card entrance
    if (!shouldReduceMotion) {
      glowScale.value = withSequence(
        withTiming(1.6, { duration: 400, easing: Easing.out(Easing.quad) }),
        withTiming(1.2, { duration: 800, easing: Easing.inOut(Easing.quad) }),
      );
      glowOpacity.value = withSequence(
        withTiming(0.9, { duration: 300 }),
        withTiming(0.5, { duration: 900 }),
      );
      cardScale.value = withSpring(1, { damping: 14, stiffness: 180 });
    }

    // 3. Auto-dismiss after 2.5 seconds
    const dismissTimer = setTimeout(() => {
      handleDismiss();
    }, 2500);

    return () => {
      clearTimeout(hapticTimer);
      clearTimeout(dismissTimer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const animatedGlowStyle = useAnimatedStyle(() => ({
    transform: [{ scale: glowScale.value }],
    opacity: glowOpacity.value,
  }));

  const animatedCardStyle = useAnimatedStyle(() => ({
    transform: [{ scale: cardScale.value }],
  }));

  return (
    <Animated.View
      entering={FadeIn.duration(200)}
      exiting={FadeOut.duration(200)}
      style={styles.backdrop}
    >
      <Pressable style={styles.pressableArea} onPress={handleDismiss}>
        {/* Glow burst behind card */}
        <Animated.View style={[styles.glowBurst, animatedGlowStyle]} pointerEvents="none">
          <Svg width={300} height={300} viewBox="0 0 300 300">
            <Defs>
              <RadialGradient id="milestoneBurst" cx="50%" cy="50%" rx="50%" ry="50%">
                <Stop offset="0%" stopColor={colors.goldGlow} stopOpacity={0.9} />
                <Stop offset="50%" stopColor={colors.goldGlow} stopOpacity={0.3} />
                <Stop offset="100%" stopColor={colors.goldGlow} stopOpacity={0} />
              </RadialGradient>
            </Defs>
            <Circle cx={150} cy={150} r={140} fill="url(#milestoneBurst)" />
          </Svg>
        </Animated.View>

        {/* Milestone Card */}
        <Animated.View style={[styles.cardWrapper, animatedCardStyle]}>
          <GlassCard style={styles.card}>
            {/* Top Badge */}
            <View style={styles.badgeRow}>
              <Sparkles size={16} color={colors.gold} />
              <Text style={styles.badgeText}>MILESTONE REACHED</Text>
            </View>

            {/* Day Number Display */}
            <View style={styles.dayCircle}>
              <Text style={styles.dayNumberText}>{dayNumber}</Text>
              <Text style={styles.dayLabel}>DAYS</Text>
            </View>

            {/* Main Title */}
            <Text style={styles.title}>Day {dayNumber} Sealed</Text>
            <Text style={styles.journeyName} numberOfLines={1}>
              {journeyName}
            </Text>

            {/* Streak Chip */}
            <View style={styles.streakChip}>
              <Flame size={16} color={colors.gold} fill={colors.gold} />
              <Text style={styles.streakText}>{streak} Day Streak</Text>
            </View>

            {/* Tap to dismiss hint */}
            <Text style={styles.dismissHint}>Tap anywhere to continue</Text>
          </GlassCard>
        </Animated.View>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(5, 7, 10, 0.82)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999,
  },
  pressableArea: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  glowBurst: {
    position: 'absolute',
    width: 300,
    height: 300,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardWrapper: {
    width: '100%',
    maxWidth: 320,
  },
  card: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.card,
    borderColor: 'rgba(212, 168, 83, 0.4)',
    borderWidth: 1.5,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(212, 168, 83, 0.12)',
    paddingHorizontal: spacing.md,
    paddingVertical: 5,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: 'rgba(212, 168, 83, 0.25)',
    marginBottom: spacing.lg,
  },
  badgeText: {
    fontFamily: fontFamilies.labelStrong,
    fontSize: 11,
    color: colors.gold,
    letterSpacing: 1.2,
  },
  dayCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: 'rgba(212, 168, 83, 0.1)',
    borderWidth: 2,
    borderColor: colors.gold,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
    shadowColor: colors.gold,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 18,
    elevation: 8,
  },
  dayNumberText: {
    fontFamily: fontFamilies.numeral,
    fontSize: 36,
    color: colors.gold,
    lineHeight: 40,
  },
  dayLabel: {
    fontFamily: fontFamilies.labelStrong,
    fontSize: 10,
    color: colors.goldSoft,
    letterSpacing: 1,
  },
  title: {
    fontFamily: fontFamilies.display,
    fontSize: 24,
    color: colors.text,
    textAlign: 'center',
  },
  journeyName: {
    fontFamily: fontFamilies.body,
    fontSize: 13,
    color: colors.textMuted,
    marginTop: 4,
    textAlign: 'center',
  },
  streakChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.surfaceGlass,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    marginTop: spacing.md,
  },
  streakText: {
    fontFamily: fontFamilies.numeral,
    fontSize: 14,
    color: colors.gold,
  },
  dismissHint: {
    fontFamily: fontFamilies.body,
    fontSize: 11,
    color: colors.textMuted,
    marginTop: spacing.lg,
  },
});
