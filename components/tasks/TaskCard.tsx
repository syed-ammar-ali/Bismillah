import * as Haptics from 'expo-haptics';
import React, { useCallback, useEffect } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import Svg, { Circle, Defs, LinearGradient, Stop } from 'react-native-svg';
import { colors } from '../../theme/colors';
import { layout, radius, spacing } from '../../theme/spacing';

export interface TaskCardProps {
  title: string;
  note?: string | null;
  isCompleted: boolean;
  onToggle: () => void;
  disabled?: boolean;
}

export const TaskCard = React.memo(function TaskCard({
  title,
  note,
  isCompleted,
  onToggle,
  disabled = false,
}: TaskCardProps) {
  const checkScale = useSharedValue(isCompleted ? 1 : 0);

  useEffect(() => {
    checkScale.value = withSpring(isCompleted ? 1 : 0, {
      damping: 14,
      stiffness: 180,
    });
  }, [isCompleted, checkScale]);

  const animatedCheckStyle = useAnimatedStyle(() => ({
    transform: [{ scale: checkScale.value }],
    opacity: checkScale.value,
  }));

  const handlePress = useCallback(() => {
    if (disabled) return;
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onToggle();
  }, [disabled, onToggle]);

  return (
    <Pressable
      onPress={handlePress}
      disabled={disabled}
      accessibilityRole="checkbox"
      accessibilityState={{ checked: isCompleted }}
      accessibilityLabel={`${title}${note ? `, ${note}` : ''}`}
      style={({ pressed }) => [
        styles.card,
        isCompleted && styles.cardCompleted,
        pressed && !disabled && styles.pressed,
        disabled && styles.disabled,
      ]}
    >
      {/* Check circle with SVG arc border */}
      <View style={styles.checkboxWrapper}>
        {isCompleted ? (
          <Animated.View style={[styles.checkboxFilled, animatedCheckStyle]}>
            <Svg width={28} height={28} viewBox="0 0 28 28">
              <Defs>
                <LinearGradient id={`checkGrad-${title}`} x1="0" y1="0" x2="1" y2="1">
                  <Stop offset="0%" stopColor="#F59E0B" />
                  <Stop offset="100%" stopColor="#FCD34D" />
                </LinearGradient>
              </Defs>
              <Circle cx="14" cy="14" r="13" fill={`url(#checkGrad-${title})`} />
            </Svg>
            <Text style={styles.checkMark}>✓</Text>
          </Animated.View>
        ) : (
          <View style={styles.checkboxEmpty}>
            <Svg width={28} height={28} viewBox="0 0 28 28">
              <Circle
                cx="14"
                cy="14"
                r="13"
                fill="none"
                stroke="rgba(255,255,255,0.15)"
                strokeWidth="1.5"
              />
            </Svg>
          </View>
        )}
      </View>

      <View style={styles.textContainer}>
        <Text
          numberOfLines={1}
          style={[styles.title, isCompleted && styles.titleCompleted]}
        >
          {title}
        </Text>
        {note ? (
          <Text numberOfLines={1} style={styles.note}>
            {note}
          </Text>
        ) : null}
      </View>

      {/* Completion indicator strip on the right */}
      {isCompleted ? <View style={styles.completedStrip} /> : null}
    </Pressable>
  );
});

const styles = StyleSheet.create({
  card: {
    height: layout.taskCardHeight,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.07)',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    overflow: 'hidden',
  },
  cardCompleted: {
    backgroundColor: 'rgba(245, 158, 11, 0.07)',
    borderColor: 'rgba(245, 158, 11, 0.20)',
  },
  pressed: {
    transform: [{ scale: 0.98 }],
    backgroundColor: 'rgba(255, 255, 255, 0.07)',
  },
  disabled: {
    opacity: 0.4,
  },
  checkboxWrapper: {
    width: 28,
    height: 28,
    marginRight: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxEmpty: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxFilled: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  checkMark: {
    position: 'absolute',
    color: '#000000',
    fontSize: 14,
    fontWeight: '800',
  },
  textContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    fontFamily: 'Inter_500Medium',
    fontSize: 15,
    color: colors.text,
    letterSpacing: -0.1,
  },
  titleCompleted: {
    color: 'rgba(255,255,255,0.4)',
  },
  note: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 2,
  },
  completedStrip: {
    width: 3,
    height: 28,
    backgroundColor: colors.gold,
    borderRadius: 2,
    marginLeft: spacing.sm,
    opacity: 0.6,
  },
});
