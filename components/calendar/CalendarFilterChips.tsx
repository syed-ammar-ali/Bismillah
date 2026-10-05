import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Journey } from '../../core/types';
import { colors } from '../../theme/colors';
import { radius, spacing } from '../../theme/spacing';
import { fontFamilies } from '../../theme/typography';

export interface CalendarFilterChipsProps {
  journeys: Journey[];
  journeyColorMap: Record<string, string>;
  selectedJourneyId: string | null; // null means 'All'
  onSelectJourney: (journeyId: string | null) => void;
}

export function CalendarFilterChips({
  journeys,
  journeyColorMap,
  selectedJourneyId,
  onSelectJourney,
}: CalendarFilterChipsProps) {
  const isAllSelected = selectedJourneyId === null;

  return (
    <View style={styles.wrapper}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContainer}
      >
        {/* 'All' chip */}
        <Pressable
          onPress={() => onSelectJourney(null)}
          accessibilityRole="button"
          accessibilityState={{ selected: isAllSelected }}
          accessibilityLabel="Filter all journeys"
          hitSlop={10}
          style={({ pressed }) => [
            styles.chip,
            isAllSelected && styles.chipActive,
            pressed && styles.pressed,
          ]}
        >
          <Text
            style={[
              styles.chipText,
              isAllSelected && styles.chipTextActive,
            ]}
          >
            All Journeys ({journeys.length})
          </Text>
        </Pressable>

        {/* Individual journey chips */}
        {journeys.map((journey) => {
          const isSelected = selectedJourneyId === journey.id;
          const color = journeyColorMap[journey.id] ?? colors.gold;

          return (
            <Pressable
              key={journey.id}
              onPress={() => onSelectJourney(journey.id)}
              accessibilityRole="button"
              accessibilityState={{ selected: isSelected }}
              accessibilityLabel={`Filter journey ${journey.name}`}
              hitSlop={10}
              style={({ pressed }) => [
                styles.chip,
                isSelected && styles.chipActive,
                pressed && styles.pressed,
              ]}
            >
              <View style={[styles.dot, { backgroundColor: color }]} />
              <Text
                numberOfLines={1}
                style={[
                  styles.chipText,
                  isSelected && styles.chipTextActive,
                ]}
              >
                {journey.name}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginVertical: spacing.sm,
  },
  scrollContainer: {
    paddingHorizontal: spacing.screenPadding,
    gap: spacing.sm,
    alignItems: 'center',
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: radius.pill,
    backgroundColor: colors.surfaceGlass,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    gap: 6,
  },
  chipActive: {
    backgroundColor: 'rgba(245, 158, 11, 0.12)',
    borderColor: colors.gold,
  },
  pressed: {
    opacity: 0.75,
    transform: [{ scale: 0.97 }],
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  chipText: {
    fontFamily: fontFamilies.label,
    fontSize: 12,
    color: colors.textMuted,
  },
  chipTextActive: {
    fontFamily: fontFamilies.labelStrong,
    color: colors.gold,
  },
});
