import * as Haptics from 'expo-haptics';
import React, { useCallback, useEffect } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { colors } from '../../theme/colors';
import { layout, radius, spacing } from '../../theme/spacing';

export interface TaskCardProps {
  title: string;
  note?: string | null;
  isCompleted: boolean;
  onToggle: () => void;
  disabled?: boolean;
}

export function TaskCard({
  title,
  note,
  isCompleted,
  onToggle,
  disabled = false,
}: TaskCardProps) {
  const checkScale = useSharedValue(isCompleted ? 1 : 0);

  useEffect(() => {
    checkScale.value = withSpring(isCompleted ? 1 : 0, {
      damping: 12,
      stiffness: 150,
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
      <View style={[styles.checkbox, isCompleted && styles.checkboxCompleted]}>
        <Animated.Text style={[styles.checkMark, animatedCheckStyle]}>
          ✓
        </Animated.Text>
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
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    height: layout.taskCardHeight,
    backgroundColor: colors.surface,
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
  },
  cardCompleted: {
    borderColor: colors.goldDim,
    backgroundColor: colors.surfaceRaised,
  },
  pressed: {
    transform: [{ scale: 0.98 }],
    opacity: 0.9,
  },
  disabled: {
    opacity: 0.5,
  },
  checkbox: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  checkboxCompleted: {
    backgroundColor: colors.gold,
    borderColor: colors.gold,
  },
  checkMark: {
    color: colors.bg,
    fontSize: 16,
    fontWeight: '800',
  },
  textContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    fontSize: 15,
    fontWeight: '500',
    color: colors.text,
  },
  titleCompleted: {
    color: colors.textMuted,
  },
  note: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 2,
  },
});
