import React from 'react';
import { StyleSheet, View } from 'react-native';
import { DayStatus } from '../../core/types';
import { spacing } from '../../theme/spacing';
import { DayCircle } from './DayCircle';

export interface DayGridProps {
  totalDays: number;
  dayStatuses: Record<number, DayStatus>;
  onDayPress?: (dayNumber: number) => void;
}

export const DayGrid = React.memo(function DayGrid({
  totalDays,
  dayStatuses,
  onDayPress,
}: DayGridProps) {
  const days = Array.from({ length: totalDays }, (_, i) => i + 1);

  return (
    <View style={styles.grid}>
      {days.map((day) => (
        <View key={day} style={styles.cellWrapper}>
          <DayCircle
            dayNumber={day}
            status={dayStatuses[day] ?? 'future'}
            onPress={onDayPress}
          />
        </View>
      ))}
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
