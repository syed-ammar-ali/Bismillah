import { ArrowDown, ArrowUp, Plus, Trash2 } from 'lucide-react-native';
import React, { useMemo, useState } from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { fromHijri } from '../../core/hijri';
import { totalDays } from '../../core/timeline';
import { CalendarType, Journey, Task } from '../../core/types';
import { useAppStore } from '../../stores/useAppStore';
import { colors } from '../../theme/colors';
import { layout, radius, spacing } from '../../theme/spacing';
import { Button } from '../ui/Button';
import { Chip } from '../ui/Chip';

export interface TaskInputItem {
  id?: string;
  title: string;
  note?: string | null;
  kind: 'daily' | 'makeup';
  sortOrder: number;
}

export interface JourneyFormData {
  name: string;
  calendarType: CalendarType;
  startInput: string;
  endInput: string;
  deadlineLabel?: string | null;
  deadlineDate?: string | null;
  closingNote?: string | null;
  dailyTasks: TaskInputItem[];
  makeupTasks: TaskInputItem[];
}

export interface JourneyFormProps {
  initialJourney?: Journey;
  initialTasks?: Task[];
  isStarted?: boolean;
  onSubmit: (data: JourneyFormData) => Promise<void>;
  onArchive?: () => Promise<void>;
  onDelete?: () => Promise<void>;
  isSubmitting?: boolean;
}

export function JourneyForm({
  initialJourney,
  initialTasks = [],
  isStarted = false,
  onSubmit,
  onArchive,
  onDelete,
  isSubmitting = false,
}: JourneyFormProps) {
  const today = useAppStore((s) => s.today);
  const hijriAdjustment = useAppStore((s) => s.settings.hijriAdjustment);

  const [name, setName] = useState(initialJourney?.name ?? '');
  const [calendarType, setCalendarType] = useState<CalendarType>(
    initialJourney?.calendarType ?? 'gregorian',
  );
  const [startInput, setStartInput] = useState(initialJourney?.startInput ?? today);
  const [endInput, setEndInput] = useState(initialJourney?.endInput ?? today);
  const [deadlineLabel, setDeadlineLabel] = useState(initialJourney?.deadlineLabel ?? '');
  const [deadlineDate, setDeadlineDate] = useState(initialJourney?.deadlineDate ?? '');
  const [closingNote, setClosingNote] = useState(initialJourney?.closingNote ?? '');

  const [dailyTasks, setDailyTasks] = useState<TaskInputItem[]>(() => {
    const daily = initialTasks.filter((t) => t.kind === 'daily');
    if (daily.length > 0) {
      return daily.map((t) => ({
        id: t.id,
        title: t.title,
        note: t.note,
        kind: 'daily',
        sortOrder: t.sortOrder,
      }));
    }
    return [{ title: '', kind: 'daily', sortOrder: 0 }];
  });

  const [makeupTasks, setMakeupTasks] = useState<TaskInputItem[]>(() => {
    const makeup = initialTasks.filter((t) => t.kind === 'makeup');
    return makeup.map((t) => ({
      id: t.id,
      title: t.title,
      note: t.note,
      kind: 'makeup',
      sortOrder: t.sortOrder,
    }));
  });

  const [deleteConfirmationText, setDeleteConfirmationText] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Live calculation of resolved Gregorian dates and total days
  const { resolvedStart, resolvedEnd, computedDays } = useMemo(() => {
    try {
      let sDate = startInput;
      let eDate = endInput;

      if (calendarType === 'hijri') {
        const [sy, sm, sd] = startInput.split('-').map((v) => parseInt(v, 10));
        const [ey, em, ed] = endInput.split('-').map((v) => parseInt(v, 10));
        if (sy && sm && sd && ey && em && ed) {
          sDate = fromHijri(sy, sm, sd, hijriAdjustment).gregorianDate;
          eDate = fromHijri(ey, em, ed, hijriAdjustment).gregorianDate;
        }
      }

      const days = totalDays(sDate, eDate);
      return { resolvedStart: sDate, resolvedEnd: eDate, computedDays: days };
    } catch {
      return { resolvedStart: startInput, resolvedEnd: endInput, computedDays: 0 };
    }
  }, [calendarType, startInput, endInput, hijriAdjustment]);

  const handleAddDailyTask = () => {
    setDailyTasks((prev) => [
      ...prev,
      { title: '', kind: 'daily', sortOrder: prev.length },
    ]);
  };

  const handleAddMakeupTask = () => {
    setMakeupTasks((prev) => [
      ...prev,
      { title: '', kind: 'makeup', sortOrder: prev.length },
    ]);
  };

  const handleMoveDailyTask = (index: number, direction: 'up' | 'down') => {
    setDailyTasks((prev) => {
      const copy = [...prev];
      const targetIndex = direction === 'up' ? index - 1 : index + 1;
      if (targetIndex < 0 || targetIndex >= copy.length) return prev;
      const temp = copy[index];
      const target = copy[targetIndex];
      if (!temp || !target) return prev;
      copy[index] = target;
      copy[targetIndex] = temp;
      return copy.map((t, idx) => ({ ...t, sortOrder: idx }));
    });
  };

  const handleRemoveDailyTask = (index: number) => {
    if (dailyTasks.length <= 1) {
      Alert.alert('Required', 'At least one daily task is required.');
      return;
    }
    setDailyTasks((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleRemoveMakeupTask = (index: number) => {
    setMakeupTasks((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleSubmit = async () => {
    if (!name.trim()) {
      Alert.alert('Required', 'Please enter a journey name.');
      return;
    }

    if (computedDays <= 0) {
      Alert.alert('Invalid Dates', 'End date must be on or after start date.');
      return;
    }

    const validDaily = dailyTasks.filter((t) => t.title.trim().length > 0);
    if (validDaily.length === 0) {
      Alert.alert('Required', 'Please add at least one daily task with a title.');
      return;
    }

    const validMakeup = makeupTasks.filter((t) => t.title.trim().length > 0);

    await onSubmit({
      name: name.trim(),
      calendarType,
      startInput: startInput.trim(),
      endInput: endInput.trim(),
      deadlineLabel: deadlineLabel.trim() || null,
      deadlineDate: deadlineDate.trim() || null,
      closingNote: closingNote.trim() || null,
      dailyTasks: validDaily,
      makeupTasks: validMakeup,
    });
  };

  const handleDelete = async () => {
    if (deleteConfirmationText.trim() !== initialJourney?.name) {
      Alert.alert('Name mismatch', 'Please type the exact journey name to confirm deletion.');
      return;
    }
    if (onDelete) {
      await onDelete();
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
      {/* 1. Journey Name */}
      <View style={styles.field}>
        <Text style={styles.label}>Journey Name *</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. 40 Days of Fajr"
          placeholderTextColor={colors.textMuted}
          value={name}
          onChangeText={setName}
          autoFocus={!initialJourney}
        />
      </View>

      {/* 2. Calendar Type */}
      <View style={styles.field}>
        <Text style={styles.label}>Calendar Mode</Text>
        <View style={styles.row}>
          <Chip
            label="Gregorian"
            selected={calendarType === 'gregorian'}
            onPress={() => !isStarted && setCalendarType('gregorian')}
          />
          <Chip
            label="Hijri"
            selected={calendarType === 'hijri'}
            onPress={() => !isStarted && setCalendarType('hijri')}
          />
        </View>
        {isStarted ? (
          <Text style={styles.hintLocked}>Calendar type is fixed once started</Text>
        ) : null}
      </View>

      {/* 3. Dates */}
      <View style={styles.field}>
        <Text style={styles.label}>
          {calendarType === 'hijri' ? 'Hijri Dates (YYYY-MM-DD)' : 'Gregorian Dates (YYYY-MM-DD)'} *
        </Text>
        {isStarted ? (
          <View style={styles.lockedBox}>
            <Text style={styles.lockedText}>
              {startInput} to {endInput} ({computedDays} days)
            </Text>
            <Text style={styles.hintLocked}>
              Timeline is fixed once started. Dates cannot be modified.
            </Text>
          </View>
        ) : (
          <View style={styles.dateInputsRow}>
            <View style={styles.flexOne}>
              <Text style={styles.subLabel}>Start Date</Text>
              <TextInput
                style={styles.input}
                placeholder="YYYY-MM-DD"
                placeholderTextColor={colors.textMuted}
                value={startInput}
                onChangeText={setStartInput}
              />
            </View>
            <View style={styles.flexOne}>
              <Text style={styles.subLabel}>End Date</Text>
              <TextInput
                style={styles.input}
                placeholder="YYYY-MM-DD"
                placeholderTextColor={colors.textMuted}
                value={endInput}
                onChangeText={setEndInput}
              />
            </View>
          </View>
        )}

        {/* Live Preview */}
        <View style={styles.previewBox}>
          {calendarType === 'hijri' ? (
            <Text style={styles.previewText}>
              Resolves to Gregorian: {resolvedStart} → {resolvedEnd}
            </Text>
          ) : null}
          <Text style={styles.totalDaysHighlight}>
            {computedDays > 0 ? `${computedDays} days total` : 'Invalid date range'}
          </Text>
        </View>
      </View>

      {/* 4. Optional Deadline */}
      <View style={styles.field}>
        <Text style={styles.label}>Goal / Deadline (Optional)</Text>
        <TextInput
          style={styles.input}
          placeholder="Label (e.g. Before Ramadan)"
          placeholderTextColor={colors.textMuted}
          value={deadlineLabel}
          onChangeText={setDeadlineLabel}
        />
        <TextInput
          style={[styles.input, styles.marginTopSm]}
          placeholder="Deadline Date (YYYY-MM-DD)"
          placeholderTextColor={colors.textMuted}
          value={deadlineDate}
          onChangeText={setDeadlineDate}
        />
      </View>

      {/* Optional Closing Note (Edit Mode) */}
      {initialJourney ? (
        <View style={styles.field}>
          <Text style={styles.label}>Closing Note (Optional)</Text>
          <TextInput
            style={styles.input}
            placeholder="Reflection upon completing this journey"
            placeholderTextColor={colors.textMuted}
            value={closingNote}
            onChangeText={setClosingNote}
          />
        </View>
      ) : null}

      {/* 5. Daily Tasks */}
      <View style={styles.field}>
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.label}>Daily Tasks *</Text>
          <Pressable
            onPress={handleAddDailyTask}
            style={styles.addMiniButton}
            accessibilityRole="button"
            accessibilityLabel="Add daily task"
          >
            <Plus size={16} color={colors.gold} />
            <Text style={styles.addMiniText}>Add Task</Text>
          </Pressable>
        </View>

        {dailyTasks.map((task, index) => (
          <View key={`daily-${index}`} style={styles.taskInputRow}>
            <View style={styles.taskInputs}>
              <TextInput
                style={styles.taskTitleInput}
                placeholder={`Task ${index + 1} Title`}
                placeholderTextColor={colors.textMuted}
                value={task.title}
                onChangeText={(text) => {
                  setDailyTasks((prev) => {
                    const copy = [...prev];
                    const item = copy[index];
                    if (item) {
                      copy[index] = { ...item, title: text };
                    }
                    return copy;
                  });
                }}
              />
              <TextInput
                style={styles.taskNoteInput}
                placeholder="Optional detail/note"
                placeholderTextColor={colors.textMuted}
                value={task.note ?? ''}
                onChangeText={(text) => {
                  setDailyTasks((prev) => {
                    const copy = [...prev];
                    const item = copy[index];
                    if (item) {
                      copy[index] = { ...item, note: text };
                    }
                    return copy;
                  });
                }}
              />
            </View>

            <View style={styles.taskActions}>
              {index > 0 ? (
                <Pressable
                  onPress={() => handleMoveDailyTask(index, 'up')}
                  style={styles.iconBtn}
                  accessibilityRole="button"
                  accessibilityLabel="Move task up"
                >
                  <ArrowUp size={16} color={colors.textMuted} />
                </Pressable>
              ) : null}
              {index < dailyTasks.length - 1 ? (
                <Pressable
                  onPress={() => handleMoveDailyTask(index, 'down')}
                  style={styles.iconBtn}
                  accessibilityRole="button"
                  accessibilityLabel="Move task down"
                >
                  <ArrowDown size={16} color={colors.textMuted} />
                </Pressable>
              ) : null}
              <Pressable
                onPress={() => handleRemoveDailyTask(index)}
                style={styles.iconBtn}
                accessibilityRole="button"
                accessibilityLabel="Remove task"
              >
                <Trash2 size={16} color={colors.danger} />
              </Pressable>
            </View>
          </View>
        ))}
      </View>

      {/* 6. Make-up Tasks */}
      <View style={styles.field}>
        <View style={styles.sectionHeaderRow}>
          <View>
            <Text style={styles.label}>Make-up Tasks (Optional)</Text>
            <Text style={styles.subNote}>Available to complete missed gap days</Text>
          </View>
          <Pressable
            onPress={handleAddMakeupTask}
            style={styles.addMiniButton}
            accessibilityRole="button"
            accessibilityLabel="Add make-up task"
          >
            <Plus size={16} color={colors.gold} />
            <Text style={styles.addMiniText}>Add</Text>
          </Pressable>
        </View>

        {makeupTasks.map((task, index) => (
          <View key={`makeup-${index}`} style={styles.taskInputRow}>
            <View style={styles.taskInputs}>
              <TextInput
                style={styles.taskTitleInput}
                placeholder="e.g. Fast 1 make-up day"
                placeholderTextColor={colors.textMuted}
                value={task.title}
                onChangeText={(text) => {
                  setMakeupTasks((prev) => {
                    const copy = [...prev];
                    const item = copy[index];
                    if (item) {
                      copy[index] = { ...item, title: text };
                    }
                    return copy;
                  });
                }}
              />
            </View>

            <Pressable
              onPress={() => handleRemoveMakeupTask(index)}
              style={styles.iconBtn}
              accessibilityRole="button"
              accessibilityLabel="Remove make-up task"
            >
              <Trash2 size={16} color={colors.danger} />
            </Pressable>
          </View>
        ))}
      </View>

      {/* Submit Button */}
      <View style={styles.submitSection}>
        <Button
          title={initialJourney ? 'Save Changes' : 'Create Journey'}
          variant="primary"
          onPress={handleSubmit}
          loading={isSubmitting}
        />
      </View>

      {/* Edit Extras: Archive and Delete */}
      {initialJourney ? (
        <View style={styles.dangerZone}>
          <Text style={styles.dangerHeader}>Journey Management</Text>
          {onArchive ? (
            <Button
              title="Archive Journey"
              variant="secondary"
              onPress={onArchive}
            />
          ) : null}

          {onDelete ? (
            showDeleteConfirm ? (
              <View style={styles.deleteConfirmBox}>
                <Text style={styles.deleteWarning}>
                  To delete permanently, type &quot;{initialJourney.name}&quot; below:
                </Text>
                <TextInput
                  style={[styles.input, styles.marginTopSm]}
                  placeholder={initialJourney.name}
                  placeholderTextColor={colors.textMuted}
                  value={deleteConfirmationText}
                  onChangeText={setDeleteConfirmationText}
                />
                <View style={styles.rowDelete}>
                  <Button
                    title="Confirm Delete"
                    variant="danger"
                    onPress={handleDelete}
                  />
                  <Button
                    title="Cancel"
                    variant="ghost"
                    onPress={() => setShowDeleteConfirm(false)}
                  />
                </View>
              </View>
            ) : (
              <Button
                title="Delete Journey..."
                variant="danger"
                onPress={() => setShowDeleteConfirm(true)}
              />
            )
          ) : null}
        </View>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: spacing.screenPadding,
    gap: spacing.lg,
    paddingBottom: 60,
  },
  field: {
    gap: spacing.xs,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.gold,
  },
  subLabel: {
    fontSize: 12,
    color: colors.textMuted,
    marginBottom: 4,
  },
  subNote: {
    fontSize: 12,
    color: colors.textMuted,
  },
  input: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
    color: colors.text,
    fontSize: 15,
    minHeight: layout.minTouchTarget,
  },
  marginTopSm: {
    marginTop: spacing.sm,
  },
  row: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.xs,
  },
  dateInputsRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  flexOne: {
    flex: 1,
  },
  previewBox: {
    backgroundColor: colors.surfaceRaised,
    borderRadius: radius.md,
    padding: spacing.md,
    marginTop: spacing.xs,
    gap: 4,
    borderWidth: 1,
    borderColor: colors.border,
  },
  previewText: {
    fontSize: 12,
    color: colors.textMuted,
  },
  totalDaysHighlight: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.gold,
  },
  lockedBox: {
    backgroundColor: colors.surfaceRaised,
    borderRadius: radius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  lockedText: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
  },
  hintLocked: {
    fontSize: 12,
    color: colors.goldSoft,
    marginTop: 4,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  addMiniButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: radius.sm,
    backgroundColor: colors.surfaceRaised,
    borderWidth: 1,
    borderColor: colors.border,
  },
  addMiniText: {
    fontSize: 12,
    color: colors.gold,
    fontWeight: '600',
  },
  taskInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.sm,
    gap: spacing.sm,
  },
  taskInputs: {
    flex: 1,
    gap: 4,
  },
  taskTitleInput: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '500',
    paddingVertical: 4,
  },
  taskNoteInput: {
    color: colors.textMuted,
    fontSize: 12,
    paddingVertical: 2,
  },
  taskActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  iconBtn: {
    padding: 6,
  },
  submitSection: {
    marginTop: spacing.md,
  },
  dangerZone: {
    marginTop: spacing.xl,
    paddingTop: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    gap: spacing.md,
  },
  dangerHeader: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textMuted,
  },
  deleteConfirmBox: {
    backgroundColor: colors.surfaceRaised,
    borderRadius: radius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.danger,
    gap: spacing.sm,
  },
  deleteWarning: {
    fontSize: 13,
    color: colors.danger,
  },
  rowDelete: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.xs,
  },
});
