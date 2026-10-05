import React, { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { CompletionView } from './CompletionView';
import { MilestoneOverlay } from './MilestoneOverlay';
import { SealAnimation } from './SealAnimation';
import { dayStatus } from '../../core/status';
import { computeStreakInfo } from '../../core/streak';
import { dayNumberFor } from '../../core/timeline';
import { DayStatus } from '../../core/types';
import { useAppStore } from '../../stores/useAppStore';
import { useJourneyStore } from '../../stores/useJourneyStore';
import { useUiStore } from '../../stores/useUiStore';

export function CelebrationHost() {
  const activeCelebration = useUiStore((s) => s.activeCelebration);
  const dismissActiveCelebration = useUiStore((s) => s.dismissActiveCelebration);

  const today = useAppStore((s) => s.today);
  const journeys = useJourneyStore((s) => s.journeys);
  const tasksRecord = useJourneyStore((s) => s.tasks);
  const completionsRecord = useJourneyStore((s) => s.completions);

  const activeJourney = useMemo(() => {
    if (!activeCelebration) return null;
    return journeys.find((j) => j.id === activeCelebration.journeyId) ?? null;
  }, [activeCelebration, journeys]);

  // Compute streak for milestone overlay
  const streak = useMemo(() => {
    if (!activeJourney) return 0;
    const tasks = tasksRecord[activeJourney.id] ?? [];
    const completions = completionsRecord[activeJourney.id] ?? [];
    const dayStatuses: Record<number, DayStatus> = {};
    for (let d = 1; d <= activeJourney.totalDays; d++) {
      dayStatuses[d] = dayStatus(activeJourney, d, today, tasks, completions);
    }
    const todayDayNumber = dayNumberFor(activeJourney, today);
    return computeStreakInfo(dayStatuses, todayDayNumber, activeJourney.totalDays).currentStreak;
  }, [activeJourney, completionsRecord, tasksRecord, today]);

  if (!activeCelebration || !activeJourney) {
    return null;
  }

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
      {activeCelebration.type === 'seal' && (
        <SealAnimation
          key={activeCelebration.id}
          dayNumber={activeCelebration.dayNumber}
          journeyName={activeJourney.name}
          onFinish={dismissActiveCelebration}
        />
      )}

      {activeCelebration.type === 'milestone' && (
        <MilestoneOverlay
          key={activeCelebration.id}
          dayNumber={activeCelebration.dayNumber ?? 10}
          journeyName={activeJourney.name}
          streak={streak}
          onDismiss={dismissActiveCelebration}
        />
      )}

      {activeCelebration.type === 'completion' && (
        <CompletionView
          key={activeCelebration.id}
          journey={activeJourney}
          isOverlay
          onDone={() => dismissActiveCelebration()}
        />
      )}
    </View>
  );
}
