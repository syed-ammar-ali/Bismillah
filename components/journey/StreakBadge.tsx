import React, { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Circle, Defs, RadialGradient, Stop } from 'react-native-svg';
import { GlowLevel } from '../../core/types';
import { colors } from '../../theme/colors';
import { glowLevels } from '../../theme/glow';
import { radius, spacing } from '../../theme/spacing';
import { Crescent } from '../ui/Crescent';

export interface StreakBadgeProps {
  streak: number;
  glowLevel?: GlowLevel;
  size?: 'small' | 'medium';
}

export function StreakBadge({
  streak,
  glowLevel = 0,
  size = 'small',
}: StreakBadgeProps) {
  const spec = glowLevels[glowLevel];
  const pulseOpacity = useSharedValue(spec.opacity);

  useEffect(() => {
    if (spec.hasPulse) {
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
  }, [spec, pulseOpacity]);

  const animatedGlowStyle = useAnimatedStyle(() => ({
    opacity: pulseOpacity.value,
  }));

  const glowDimension = size === 'small' ? 56 : 72;
  const crescentSize = size === 'small' ? 14 : 18;

  return (
    <View style={styles.wrapper}>
      {/* Background static SVG radial gradient glow layer */}
      {glowLevel > 0 ? (
        <Animated.View
          style={[
            styles.glowContainer,
            { width: glowDimension, height: glowDimension },
            animatedGlowStyle,
          ]}
        >
          <Svg
            width={glowDimension}
            height={glowDimension}
            viewBox="0 0 100 100"
          >
            <Defs>
              <RadialGradient id="streakGlowGrad" cx="50%" cy="50%" rx="50%" ry="50%">
                <Stop offset="0%" stopColor={colors.goldSoft} stopOpacity="1" />
                <Stop offset="60%" stopColor={colors.gold} stopOpacity="0.5" />
                <Stop offset="100%" stopColor={colors.gold} stopOpacity="0" />
              </RadialGradient>
            </Defs>
            <Circle cx="50" cy="50" r="50" fill="url(#streakGlowGrad)" />
            {spec.hasSecondHalo ? (
              <Circle
                cx="50"
                cy="50"
                r="45"
                stroke={colors.goldSoft}
                strokeWidth="1"
                strokeOpacity="0.6"
                fill="none"
              />
            ) : null}
          </Svg>
        </Animated.View>
      ) : null}

      {/* Badge content */}
      <View style={[styles.badge, size === 'medium' && styles.badgeMedium]}>
        <Crescent size={crescentSize} color={colors.gold} />
        <Text style={[styles.number, size === 'medium' && styles.numberMedium]}>
          {streak}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  glowContainer: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceRaised,
    borderRadius: radius.full,
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: spacing.xs,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 4,
  },
  badgeMedium: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
  },
  number: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 13,
    color: colors.goldSoft,
  },
  numberMedium: {
    fontSize: 16,
  },
});
