import * as Haptics from 'expo-haptics';
import React, { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  runOnJS,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Circle, Defs, RadialGradient, Stop } from 'react-native-svg';
import { Crescent } from '../ui/Crescent';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { fontFamilies } from '../../theme/typography';

export interface SealAnimationProps {
  dayNumber?: number;
  journeyName?: string;
  onFinish: () => void;
}

export function SealAnimation({ dayNumber, journeyName, onFinish }: SealAnimationProps) {
  const shouldReduceMotion = useReducedMotion();

  const containerOpacity = useSharedValue(0);
  const crescentScale = useSharedValue(shouldReduceMotion ? 1 : 0.4);
  const haloScale = useSharedValue(shouldReduceMotion ? 1 : 0.6);
  const haloOpacity = useSharedValue(0.7);
  const ringScale = useSharedValue(shouldReduceMotion ? 1 : 0.7);
  const ringOpacity = useSharedValue(0.9);

  useEffect(() => {
    // 1. Success haptic
    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    // 2. Animate container opacity (fade in quickly, stay, fade out at end)
    containerOpacity.value = withSequence(
      withTiming(1, { duration: 150, easing: Easing.out(Easing.quad) }),
      withDelay(
        550,
        withTiming(0, { duration: 200, easing: Easing.in(Easing.quad) }, (finished) => {
          if (finished) {
            runOnJS(onFinish)();
          }
        }),
      ),
    );

    if (!shouldReduceMotion) {
      // Crescent scale-in
      crescentScale.value = withTiming(1, {
        duration: 350,
        easing: Easing.out(Easing.back(1.5)),
      });

      // Expanding halo
      haloScale.value = withTiming(2.2, {
        duration: 750,
        easing: Easing.out(Easing.cubic),
      });
      haloOpacity.value = withTiming(0, {
        duration: 750,
        easing: Easing.out(Easing.quad),
      });

      // Ring pulse
      ringScale.value = withTiming(1.8, {
        duration: 700,
        easing: Easing.out(Easing.cubic),
      });
      ringOpacity.value = withTiming(0, {
        duration: 700,
        easing: Easing.out(Easing.quad),
      });
    }
  }, [containerOpacity, crescentScale, haloOpacity, haloScale, onFinish, ringOpacity, ringScale, shouldReduceMotion]);

  const animatedContainerStyle = useAnimatedStyle(() => ({
    opacity: containerOpacity.value,
  }));

  const animatedCrescentStyle = useAnimatedStyle(() => ({
    transform: [{ scale: crescentScale.value }],
  }));

  const animatedHaloStyle = useAnimatedStyle(() => ({
    transform: [{ scale: haloScale.value }],
    opacity: haloOpacity.value,
  }));

  const animatedRingStyle = useAnimatedStyle(() => ({
    transform: [{ scale: ringScale.value }],
    opacity: ringOpacity.value,
  }));

  return (
    <Animated.View style={[styles.overlay, animatedContainerStyle]} pointerEvents="box-none">
      <View style={styles.centerContainer}>
        {/* Expanding Halo */}
        <Animated.View style={[styles.haloContainer, animatedHaloStyle]} pointerEvents="none">
          <Svg width={200} height={200} viewBox="0 0 200 200">
            <Defs>
              <RadialGradient id="haloGrad" cx="50%" cy="50%" rx="50%" ry="50%">
                <Stop offset="0%" stopColor={colors.goldGlow} stopOpacity={0.8} />
                <Stop offset="60%" stopColor={colors.goldGlow} stopOpacity={0.25} />
                <Stop offset="100%" stopColor={colors.goldGlow} stopOpacity={0} />
              </RadialGradient>
            </Defs>
            <Circle cx={100} cy={100} r={90} fill="url(#haloGrad)" />
          </Svg>
        </Animated.View>

        {/* Ring Pulse */}
        <Animated.View style={[styles.ringContainer, animatedRingStyle]} pointerEvents="none">
          <Svg width={140} height={140} viewBox="0 0 140 140">
            <Circle
              cx={70}
              cy={70}
              r={60}
              stroke={colors.gold}
              strokeWidth={1.5}
              fill="none"
              strokeDasharray="4 4"
            />
          </Svg>
        </Animated.View>

        {/* Golden Crescent in Center */}
        <Animated.View style={[styles.crescentWrapper, animatedCrescentStyle]}>
          <Crescent size={64} color={colors.gold} />
        </Animated.View>

        {/* Text */}
        <View style={styles.textContainer}>
          <Text style={styles.title}>
            {dayNumber !== undefined ? `Day ${dayNumber} Sealed` : 'Day Sealed'}
          </Text>
          {journeyName ? (
            <Text style={styles.subtitle} numberOfLines={1}>
              {journeyName}
            </Text>
          ) : null}
        </View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(5, 7, 10, 0.72)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999,
  },
  centerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  haloContainer: {
    position: 'absolute',
    width: 200,
    height: 200,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ringContainer: {
    position: 'absolute',
    width: 140,
    height: 140,
    alignItems: 'center',
    justifyContent: 'center',
  },
  crescentWrapper: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(212, 168, 83, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(212, 168, 83, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  textContainer: {
    marginTop: spacing.md,
    alignItems: 'center',
  },
  title: {
    fontFamily: fontFamilies.display,
    fontSize: 22,
    color: colors.gold,
    letterSpacing: 0.5,
  },
  subtitle: {
    fontFamily: fontFamilies.body,
    fontSize: 13,
    color: colors.textMuted,
    marginTop: 2,
    maxWidth: 240,
    textAlign: 'center',
  },
});
