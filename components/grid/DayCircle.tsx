import React, { useEffect } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { DayStatus } from '../../core/types';
import { colors } from '../../theme/colors';
import { layout } from '../../theme/spacing';
import { fontFamilies } from '../../theme/typography';

export interface DayCircleProps {
  dayNumber: number;
  status: DayStatus;
  onPress?: (dayNumber: number) => void;
}

export const DayCircle = React.memo(function DayCircle({
  dayNumber,
  status,
  onPress,
}: DayCircleProps) {
  const pulseScale = useSharedValue(1);

  useEffect(() => {
    if (status === 'today') {
      pulseScale.value = withRepeat(
        withTiming(1.08, { duration: 800, easing: Easing.inOut(Easing.ease) }),
        -1,
        true,
      );
    } else {
      pulseScale.value = 1;
    }
  }, [status, pulseScale]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseScale.value }],
  }));

  const content = (
    <View style={[styles.circle, circleStyles[status]]}>
      {status === 'gap' ? (
        <Text style={styles.gapDash}>-</Text>
      ) : (
        <Text style={[styles.number, numberStyles[status]]}>{dayNumber}</Text>
      )}
    </View>
  );

  return (
    <Pressable
      onPress={() => onPress?.(dayNumber)}
      hitSlop={6}
      accessibilityRole="button"
      accessibilityLabel={`Day ${dayNumber}, ${status}`}
      style={styles.pressable}
    >
      {status === 'today' ? (
        <Animated.View style={animatedStyle}>{content}</Animated.View>
      ) : (
        content
      )}
    </Pressable>
  );
});

const styles = StyleSheet.create({
  pressable: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  circle: {
    width: layout.dayCircleSize,
    height: layout.dayCircleSize,
    borderRadius: layout.dayCircleSize / 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  number: {
    fontSize: 12,
    fontFamily: fontFamilies.numeral,
  },
  gapDash: {
    color: colors.gap,
    fontSize: 14,
    fontFamily: fontFamilies.numeral,
  },
});

const circleStyles = StyleSheet.create({
  sealed: {
    backgroundColor: colors.gold,
    shadowColor: colors.gold,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.35,
    shadowRadius: 4,
    elevation: 2,
  },
  gap: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.gap,
  },
  madeUp: {
    backgroundColor: 'rgba(245, 158, 11, 0.08)',
    borderWidth: 1.5,
    borderColor: colors.gold,
  },
  today: {
    backgroundColor: 'rgba(245, 158, 11, 0.12)',
    borderWidth: 2,
    borderColor: colors.gold,
  },
  future: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.borderSubtle,
  },
});

const numberStyles = StyleSheet.create({
  sealed: {
    color: '#050505',
    fontWeight: '800',
  },
  gap: {
    color: colors.gap,
  },
  madeUp: {
    color: colors.gold,
  },
  today: {
    color: colors.gold,
  },
  future: {
    color: colors.textMuted,
  },
});
