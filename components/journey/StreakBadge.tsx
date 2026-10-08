import React, { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useReducedMotion,
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
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    if (spec.hasPulse && !shouldReduceMotion) {
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
  }, [spec, pulseOpacity, shouldReduceMotion]);

  const animatedGlowStyle = useAnimatedStyle(() => ({
    opacity: pulseOpacity.value,
  }));

  const reactId = React.useId();
  const gradId = `streak-grad-${reactId.replace(/:/g, '')}-${streak}`;
  const glowDimension = size === 'small' ? 68 : 88;
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
              <RadialGradient id={gradId} cx="50%" cy="50%" rx="50%" ry="50%">
                <Stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.25" />
                <Stop offset="55%" stopColor="#FFFFFF" stopOpacity="0.08" />
                <Stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
              </RadialGradient>
            </Defs>
            <Circle cx="50" cy="50" r="50" fill={`url(#${gradId})`} />
            {spec.hasSecondHalo ? (
              <Circle
                cx="50"
                cy="50"
                r="46"
                stroke={colors.goldSoft}
                strokeWidth="0.8"
                strokeOpacity="0.35"
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
