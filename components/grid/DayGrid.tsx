import React from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { FadeIn, useReducedMotion } from 'react-native-reanimated';
import { DayStatus } from '../../core/types';
import { spacing } from '../../theme/spacing';
import { DayCircle } from './DayCircle';

export interface DayGridProps {
  totalDays: number;
  dayStatuses: Record<number, DayStatus>;
  onDayPress?: (dayNumber: number) => void;
}

const FIRST_SCREENFUL_LIMIT = 40;

export const DayGrid = React.memo(function DayGrid({
  totalDays,
  dayStatuses,
  onDayPress,
}: DayGridProps) {
  const reducedMotion = useReducedMotion();
  const days = Array.from({ length: totalDays }, (_, i) => i + 1);

  return (
    <View style={styles.grid}>
      {days.map((day, index) => {
        const circle = (
          <DayCircle
            dayNumber={day}
            status={dayStatuses[day] ?? 'future'}
            onPress={onDayPress}
          />
        );

        if (!reducedMotion && index < FIRST_SCREENFUL_LIMIT) {
          return (
            <Animated.View
              key={day}
              entering={FadeIn.delay(index * 10).duration(200)}
              style={styles.cellWrapper}
            >
              {circle}
            </Animated.View>
          );
        }

        return (
          <View key={day} style={styles.cellWrapper}>
            {circle}
          </View>
        );
      })}
    </View>
  );
});


const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    justifyContent: 'flex-start',
  },
  cellWrapper: {
    width: `${(100 - 7 * 2.5) / 8}%`,
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
