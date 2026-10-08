import { CheckCircle2, Circle } from 'lucide-react-native';
import React from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { formatDisplayDate } from '../../core/dates';
import { toHijri } from '../../core/hijri';
import { dayStatus, isTaskActiveOnDay } from '../../core/status';
import { dateFor } from '../../core/timeline';
import { DayStatus, Journey, Task } from '../../core/types';
import { useServices } from '../../services/ServicesContext';
import { useAppStore } from '../../stores/useAppStore';
import { useJourneyStore } from '../../stores/useJourneyStore';
import { colors } from '../../theme/colors';
import { radius, spacing } from '../../theme/spacing';
import { fontFamilies } from '../../theme/typography';
import { Sheet } from '../ui/Sheet';
import { GapReasonInput } from './GapReasonInput';

export interface DaySheetProps {
  visible: boolean;
  onClose: () => void;
  journey: Journey;
  dayNumber: number | null;
}

const STATUS_LABELS: Record<DayStatus, string> = {
  sealed: 'Sealed',
  madeUp: 'Made Up',
  gap: 'Gap',
  today: 'Today',
  future: 'Upcoming',
};

const EMPTY_ARRAY: any[] = [];

export function DaySheet({ visible, onClose, journey, dayNumber }: DaySheetProps) {
  const today = useAppStore((s) => s.today);
  const hijriAdjustment = useAppStore((s) => s.settings.hijriAdjustment);
  const tasks = useJourneyStore((s) => s.tasks[journey.id]) ?? EMPTY_ARRAY;
  const completions = useJourneyStore((s) => s.completions[journey.id]) ?? EMPTY_ARRAY;
  const dayLogs = useJourneyStore((s) => s.dayLogs[journey.id]) ?? EMPTY_ARRAY;

  const { gapService, tickService } = useServices();

  if (dayNumber === null) {
    return null;
  }

  const existingReason =
    dayLogs.find((l) => l.dayNumber === dayNumber)?.gapReason ?? '';


  const dayDate = dateFor(journey, dayNumber);
  const formattedGregorian = dayDate ? formatDisplayDate(dayDate) : '';
  const hijri = dayDate ? toHijri(dayDate, hijriAdjustment) : null;
  const formattedHijri = hijri?.formatted ?? '';

  const status = dayStatus(journey, dayNumber, today, tasks, completions);

  const dailyTasks = tasks.filter(
    (t) => t.kind === 'daily' && isTaskActiveOnDay(t, dayNumber),
  );
  const makeupTasks = tasks.filter(
    (t) => t.kind === 'makeup' && isTaskActiveOnDay(t, dayNumber),
  );

  const completedTaskIds = new Set(
    completions.filter((c) => c.dayNumber === dayNumber).map((c) => c.taskId),
  );

  const handleToggleMakeup = async (taskId: string) => {
    if (dayNumber === null) return;
    await gapService.toggleMakeup(journey.id, taskId, dayNumber);
  };

  const handleToggleDaily = async (taskId: string) => {
    if (dayNumber === null || status !== 'today') return;
    await tickService.toggle(journey.id, taskId, dayNumber);
  };

  const isGapOrMadeUp = status === 'gap' || status === 'madeUp';

  return (
    <Sheet visible={visible} onClose={onClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={styles.scrollContent}
        >
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.titleRow}>
              <Text style={styles.dayTitle}>Day {dayNumber}</Text>
              <View style={[styles.statusBadge, statusBadgeStyles[status]]}>
                <Text style={[styles.statusText, statusTextStyles[status]]}>
                  {STATUS_LABELS[status]}
                </Text>
              </View>
            </View>

            <Text style={styles.dateGregorian}>{formattedGregorian}</Text>
            <Text style={styles.dateHijri}>{formattedHijri}</Text>
          </View>

          {/* Daily Tasks Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              {status === 'today' ? "Today's Tasks" : 'Daily Tasks'}
            </Text>
            <Text style={styles.sectionSubtitle}>
              {status === 'today'
                ? 'Tap to complete tasks for today'
                : status === 'sealed'
                  ? 'All tasks completed and sealed'
                  : status === 'future'
                    ? 'Scheduled tasks'
                    : 'Tasks recorded on this day'}
            </Text>

            <View style={styles.taskList}>
              {dailyTasks.map((task: Task) => {
                const isDone = completedTaskIds.has(task.id);
                const isInteractive = status === 'today';

                return (
                  <Pressable
                    key={task.id}
                    onPress={() => isInteractive && handleToggleDaily(task.id)}
                    disabled={!isInteractive}
                    style={[
                      styles.taskCard,
                      isDone && styles.taskCardDone,
                      !isInteractive && styles.taskCardReadOnly,
                    ]}
                    accessibilityRole={isInteractive ? 'checkbox' : 'text'}
                    accessibilityState={isInteractive ? { checked: isDone } : undefined}
                    accessibilityLabel={`${task.title}, ${isDone ? 'completed' : 'not completed'}`}
                  >
                    <View style={styles.taskIconWrapper}>
                      {isDone ? (
                        <CheckCircle2 size={20} color={colors.gold} />
                      ) : (
                        <Circle size={20} color={colors.border} />
                      )}
                    </View>
                    <View style={styles.taskTextWrapper}>
                      <Text style={[styles.taskTitle, isDone && styles.taskTitleDone]}>
                        {task.title}
                      </Text>
                      {task.note ? (
                        <Text style={styles.taskNote}>{task.note}</Text>
                      ) : null}
                    </View>
                  </Pressable>
                );
              })}
            </View>
          </View>

          {/* Gap Reason and Make-up Tasks Section */}
          {isGapOrMadeUp ? (
            <View style={styles.section}>
              <View style={styles.divider} />

              {/* Gap Reason field */}
              <Text style={styles.sectionTitle}>Reason for Gap</Text>
              <Text style={styles.sectionSubtitle}>
                Add a calm note (e.g. sick, travel, rest). Optional.
              </Text>

              <GapReasonInput
                key={dayNumber}
                initialReason={existingReason}
                onSave={async (reason) => {
                  await gapService.setReason(journey.id, dayNumber, reason);
                }}
              />

              {/* Make-up tasks */}
              <View style={styles.makeupSection}>
                <Text style={styles.sectionTitle}>Make-up Tasks</Text>
                <Text style={styles.sectionSubtitle}>
                  Complete these tasks to mark this day Made Up. Streak remains broken.
                </Text>

                {makeupTasks.length > 0 ? (
                  <View style={styles.taskList}>
                    {makeupTasks.map((task: Task) => {
                      const isDone = completedTaskIds.has(task.id);

                      return (
                        <Pressable
                          key={task.id}
                          onPress={() => handleToggleMakeup(task.id)}
                          style={[styles.taskCard, isDone && styles.taskCardDone]}
                          accessibilityRole="checkbox"
                          accessibilityState={{ checked: isDone }}
                          accessibilityLabel={`Make up ${task.title}, ${isDone ? 'completed' : 'pending'}`}
                        >
                          <View style={styles.taskIconWrapper}>
                            {isDone ? (
                              <CheckCircle2 size={20} color={colors.gold} />
                            ) : (
                              <Circle size={20} color={colors.goldSoft} />
                            )}
                          </View>
                          <View style={styles.taskTextWrapper}>
                            <Text
                              style={[
                                styles.taskTitle,
                                isDone && styles.taskTitleDone,
                              ]}
                            >
                              {task.title}
                            </Text>
                            {task.note ? (
                              <Text style={styles.taskNote}>{task.note}</Text>
                            ) : null}
                          </View>
                        </Pressable>
                      );
                    })}
                  </View>
                ) : (
                  <Text style={styles.noMakeupText}>
                    No make-up tasks configured for this journey.
                  </Text>
                )}
              </View>
            </View>
          ) : null}
        </ScrollView>
      </KeyboardAvoidingView>
    </Sheet>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingBottom: spacing.xl,
  },
  header: {
    marginBottom: spacing.md,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  dayTitle: {
    fontFamily: fontFamilies.display,
    fontSize: 24,
    letterSpacing: -0.5,
    color: colors.gold,
  },
  statusBadge: {
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: spacing.xs,
    borderRadius: radius.full,
    borderWidth: 1,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  dateGregorian: {
    fontSize: 14,
    color: colors.text,
    marginTop: 2,
  },
  dateHijri: {
    fontSize: 13,
    color: colors.goldSoft,
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.lg,
  },
  section: {
    marginTop: spacing.md,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 2,
  },
  sectionSubtitle: {
    fontSize: 12,
    color: colors.textMuted,
    marginBottom: spacing.sm,
  },
  taskList: {
    gap: spacing.sm,
  },
  taskCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  taskCardDone: {
    borderColor: colors.gold,
    backgroundColor: colors.surfaceRaised,
  },
  taskCardReadOnly: {
    opacity: 0.9,
  },
  taskIconWrapper: {
    marginRight: spacing.sm,
  },
  taskTextWrapper: {
    flex: 1,
  },
  taskTitle: {
    fontSize: 14,
    color: colors.text,
    fontWeight: '500',
  },
  taskTitleDone: {
    color: colors.goldSoft,
  },
  taskNote: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 2,
  },
  makeupSection: {
    marginTop: spacing.lg,
  },
  noMakeupText: {
    fontSize: 13,
    color: colors.textMuted,
    fontStyle: 'italic',
    paddingVertical: spacing.xs,
  },
});

const statusBadgeStyles = StyleSheet.create({
  sealed: {
    backgroundColor: colors.gold,
    borderColor: colors.gold,
  },
  madeUp: {
    backgroundColor: 'transparent',
    borderColor: colors.gold,
  },
  gap: {
    backgroundColor: 'transparent',
    borderColor: colors.gap,
  },
  today: {
    backgroundColor: 'transparent',
    borderColor: colors.gold,
  },
  future: {
    backgroundColor: 'transparent',
    borderColor: colors.border,
  },
});

const statusTextStyles = StyleSheet.create({
  sealed: {
    color: colors.bg,
  },
  madeUp: {
    color: colors.gold,
  },
  gap: {
    color: colors.gap,
  },
  today: {
    color: colors.gold,
  },
  future: {
    color: colors.textMuted,
  },
});
