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
import { dayNumberFor } from '../../core/timeline';
import { DayStatus, Journey, Task } from '../../core/types';
import { useServices } from '../../services/ServicesContext';
import { useAppStore } from '../../stores/useAppStore';
import { useJourneyStore } from '../../stores/useJourneyStore';
import { colors } from '../../theme/colors';
import { radius, spacing } from '../../theme/spacing';
import { fontFamilies } from '../../theme/typography';
import { Sheet } from '../ui/Sheet';
import { GapReasonInput } from './GapReasonInput';

export interface CalendarDaySheetProps {
  visible: boolean;
  onClose: () => void;
  dateString: string | null;
  journeyColorMap: Record<string, string>;
}

const STATUS_LABELS: Record<DayStatus, string> = {
  sealed: 'Sealed',
  madeUp: 'Made Up',
  gap: 'Gap',
  today: 'Today',
  future: 'Upcoming',
};

export function CalendarDaySheet({
  visible,
  onClose,
  dateString,
  journeyColorMap,
}: CalendarDaySheetProps) {
  const today = useAppStore((s) => s.today);
  const hijriAdjustment = useAppStore((s) => s.settings.hijriAdjustment);
  const journeys = useJourneyStore((s) => s.journeys);
  const tasksRecord = useJourneyStore((s) => s.tasks);
  const completionsRecord = useJourneyStore((s) => s.completions);
  const dayLogsRecord = useJourneyStore((s) => s.dayLogs);

  const { tickService, gapService } = useServices();

  if (!dateString) {
    return null;
  }

  const formattedGregorian = formatDisplayDate(dateString);
  const hijri = toHijri(dateString, hijriAdjustment);
  const formattedHijri = hijri.formatted;

  // Active journeys on this day
  const activeEntries = journeys
    .filter((j) => !j.archivedAt)
    .map((journey) => {
      const dayNumber = dayNumberFor(journey, dateString);
      if (dayNumber === null) return null;

      const tasks = tasksRecord[journey.id] ?? [];
      const completions = completionsRecord[journey.id] ?? [];
      const dayLogs = dayLogsRecord[journey.id] ?? [];
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

      const existingReason =
        dayLogs.find((l) => l.dayNumber === dayNumber)?.gapReason ?? '';

      const isDeadline = journey.deadlineDate === dateString;

      return {
        journey,
        dayNumber,
        status,
        dailyTasks,
        makeupTasks,
        completedTaskIds,
        existingReason,
        isDeadline,
        color: journeyColorMap[journey.id] ?? colors.gold,
      };
    })
    .filter((e): e is NonNullable<typeof e> => e !== null);

  const handleToggleDaily = async (journey: Journey, taskId: string, dayNumber: number) => {
    await tickService.toggle(journey.id, taskId, dayNumber);
  };

  const handleToggleMakeup = async (journey: Journey, taskId: string, dayNumber: number) => {
    await gapService.toggleMakeup(journey.id, taskId, dayNumber);
  };

  const handleSaveReason = async (journey: Journey, dayNumber: number, reason: string) => {
    await gapService.setReason(journey.id, dayNumber, reason);
  };

  return (
    <Sheet visible={visible} onClose={onClose}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={styles.scrollContent}
        >
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.dateGregorian}>{formattedGregorian}</Text>
            <Text style={styles.dateHijri}>{formattedHijri}</Text>
          </View>

          {/* Active journeys list */}
          {activeEntries.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>
                No journeys were active on this date.
              </Text>
            </View>
          ) : (
            activeEntries.map((entry) => {
              const {
                journey,
                dayNumber,
                status,
                dailyTasks,
                makeupTasks,
                completedTaskIds,
                existingReason,
                isDeadline,
                color,
              } = entry;

              const isInteractive = status === 'today';
              const isGapOrMadeUp = status === 'gap' || status === 'madeUp';

              return (
                <View key={journey.id} style={styles.journeyCard}>
                  {/* Journey header */}
                  <View style={styles.journeyHeader}>
                    <View style={styles.journeyTitleRow}>
                      <View style={[styles.journeyDot, { backgroundColor: color }]} />
                      <Text style={styles.journeyName}>{journey.name}</Text>
                    </View>

                    <View style={styles.journeyBadgeRow}>
                      <Text style={styles.dayProgressText}>
                        Day {dayNumber} of {journey.totalDays}
                      </Text>
                      <View style={[styles.statusBadge, statusBadgeStyles[status]]}>
                        <Text style={[styles.statusText, statusTextStyles[status]]}>
                          {STATUS_LABELS[status]}
                        </Text>
                      </View>
                    </View>
                  </View>

                  {/* Deadline Notice if on this day */}
                  {isDeadline ? (
                    <View style={styles.deadlineNotice}>
                      <Text style={styles.deadlineNoticeText}>
                        ⚑ Deadline: {journey.deadlineLabel ?? 'Journey Target'}
                      </Text>
                    </View>
                  ) : null}

                  {/* Daily Tasks */}
                  <View style={styles.taskSection}>
                    <Text style={styles.sectionHeading}>
                      {status === 'today' ? "Today's Tasks" : 'Tasks'}
                    </Text>

                    <View style={styles.taskList}>
                      {dailyTasks.map((task: Task) => {
                        const isDone = completedTaskIds.has(task.id);

                        return (
                          <Pressable
                            key={task.id}
                            onPress={() =>
                              isInteractive &&
                              handleToggleDaily(journey, task.id, dayNumber)
                            }
                            disabled={!isInteractive}
                            style={[
                              styles.taskRow,
                              isDone && styles.taskRowDone,
                              !isInteractive && styles.taskRowReadOnly,
                            ]}
                            accessibilityRole={isInteractive ? 'checkbox' : 'text'}
                            accessibilityState={isInteractive ? { checked: isDone } : undefined}
                            accessibilityLabel={`${task.title}, ${isDone ? 'completed' : 'not completed'}`}
                          >
                            <View style={styles.taskIconWrapper}>
                              {isDone ? (
                                <CheckCircle2 size={18} color={colors.gold} />
                              ) : (
                                <Circle size={18} color={colors.borderSubtle} />
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
                  </View>

                  {/* Gap reason & make-up tasks */}
                  {isGapOrMadeUp ? (
                    <View style={styles.gapSection}>
                      <View style={styles.divider} />
                      <Text style={styles.sectionHeading}>Reason for Gap</Text>
                      <GapReasonInput
                        key={`${journey.id}-${dayNumber}`}
                        initialReason={existingReason}
                        onSave={(reason) =>
                          handleSaveReason(journey, dayNumber, reason)
                        }
                      />

                      {makeupTasks.length > 0 ? (
                        <View style={styles.makeupSection}>
                          <Text style={styles.sectionHeading}>Make-up Tasks</Text>
                          <Text style={styles.makeupSubtitle}>
                            Complete all to mark this day Made Up
                          </Text>

                          <View style={styles.taskList}>
                            {makeupTasks.map((task: Task) => {
                              const isDone = completedTaskIds.has(task.id);

                              return (
                                <Pressable
                                  key={task.id}
                                  onPress={() =>
                                    handleToggleMakeup(journey, task.id, dayNumber)
                                  }
                                  style={[
                                    styles.taskRow,
                                    isDone && styles.taskRowDone,
                                  ]}
                                  accessibilityRole="checkbox"
                                  accessibilityState={{ checked: isDone }}
                                  accessibilityLabel={`Make-up task: ${task.title}, ${isDone ? 'completed' : 'not completed'}`}
                                >
                                  <View style={styles.taskIconWrapper}>
                                    {isDone ? (
                                      <CheckCircle2 size={18} color={colors.gold} />
                                    ) : (
                                      <Circle size={18} color={colors.borderSubtle} />
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
                        </View>
                      ) : null}
                    </View>
                  ) : null}
                </View>
              );
            })
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </Sheet>
  );
}

const statusBadgeStyles = StyleSheet.create({
  sealed: {
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    borderColor: 'rgba(245, 158, 11, 0.35)',
  },
  madeUp: {
    backgroundColor: 'rgba(245, 158, 11, 0.10)',
    borderColor: colors.gold,
  },
  gap: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderColor: colors.gap,
  },
  today: {
    backgroundColor: 'rgba(245, 158, 11, 0.12)',
    borderColor: colors.gold,
  },
  future: {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderColor: colors.borderSubtle,
  },
});

const statusTextStyles = StyleSheet.create({
  sealed: {
    color: colors.gold,
  },
  madeUp: {
    color: colors.goldSoft,
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

const styles = StyleSheet.create({
  scrollContent: {
    paddingBottom: spacing.xxl,
    gap: spacing.lg,
  },
  header: {
    marginBottom: spacing.xs,
  },
  dateGregorian: {
    fontFamily: fontFamilies.display,
    fontSize: 22,
    letterSpacing: -0.4,
    color: colors.text,
  },
  dateHijri: {
    fontFamily: fontFamilies.heading,
    fontSize: 15,
    color: colors.gold,
    marginTop: 2,
  },
  emptyState: {
    paddingVertical: spacing.xl,
    alignItems: 'center',
  },
  emptyStateText: {
    fontFamily: fontFamilies.body,
    fontSize: 14,
    color: colors.textMuted,
  },
  journeyCard: {
    backgroundColor: colors.surfaceGlass,
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    padding: spacing.md,
    gap: spacing.md,
  },
  journeyHeader: {
    gap: spacing.xs,
  },
  journeyTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  journeyDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  journeyName: {
    fontFamily: fontFamilies.heading,
    fontSize: 16,
    color: colors.text,
    letterSpacing: -0.2,
  },
  journeyBadgeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 2,
  },
  dayProgressText: {
    fontFamily: fontFamilies.label,
    fontSize: 12,
    color: colors.goldSoft,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: radius.full,
    borderWidth: 1,
  },
  statusText: {
    fontFamily: fontFamilies.labelStrong,
    fontSize: 11,
  },
  deadlineNotice: {
    backgroundColor: 'rgba(245, 158, 11, 0.08)',
    borderRadius: radius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.2)',
  },
  deadlineNoticeText: {
    fontFamily: fontFamilies.label,
    fontSize: 12,
    color: colors.goldSoft,
  },
  taskSection: {
    gap: spacing.xs,
  },
  sectionHeading: {
    fontFamily: fontFamilies.labelStrong,
    fontSize: 13,
    color: colors.gold,
    marginBottom: 2,
  },
  taskList: {
    gap: 6,
  },
  taskRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
    gap: spacing.sm,
  },
  taskRowDone: {
    backgroundColor: 'rgba(245, 158, 11, 0.06)',
    borderColor: 'rgba(245, 158, 11, 0.20)',
  },
  taskRowReadOnly: {
    opacity: 0.9,
  },
  taskIconWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  taskTextWrapper: {
    flex: 1,
  },
  taskTitle: {
    fontFamily: fontFamilies.body,
    fontSize: 13,
    color: colors.text,
  },
  taskTitleDone: {
    color: colors.goldSoft,
    textDecorationLine: 'line-through',
  },
  taskNote: {
    fontFamily: fontFamilies.body,
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 1,
  },
  gapSection: {
    gap: spacing.sm,
  },
  divider: {
    height: 1,
    backgroundColor: colors.borderSubtle,
    marginVertical: spacing.xs,
  },
  makeupSection: {
    gap: spacing.xs,
    marginTop: spacing.xs,
  },
  makeupSubtitle: {
    fontFamily: fontFamilies.body,
    fontSize: 11,
    color: colors.textMuted,
    marginBottom: 4,
  },
});
