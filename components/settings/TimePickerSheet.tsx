import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors } from '../../theme/colors';
import { radius, spacing } from '../../theme/spacing';
import { fontFamilies } from '../../theme/typography';
import { Button } from '../ui/Button';
import { Sheet } from '../ui/Sheet';

export interface TimePickerSheetProps {
  visible: boolean;
  onClose: () => void;
  initialTime: string; // "HH:mm"
  onSelectTime: (time: string) => void;
  title: string;
  isEvening?: boolean;
}

const MORNING_PRESETS = ['04:30', '05:00', '05:30', '06:00', '06:30'];
const EVENING_PRESETS = ['20:00', '20:30', '21:00', '21:30', '22:00'];

function parseTime(timeStr: string, fallbackH: number, fallbackM: number) {
  if (timeStr && timeStr.includes(':')) {
    const parts = timeStr.split(':');
    const h = parseInt(parts[0] ?? `${fallbackH}`, 10);
    const m = parseInt(parts[1] ?? `${fallbackM}`, 10);
    return {
      hour: !isNaN(h) ? Math.min(23, Math.max(0, h)) : fallbackH,
      minute: !isNaN(m) ? Math.min(59, Math.max(0, m)) : fallbackM,
    };
  }
  return { hour: fallbackH, minute: fallbackM };
}

interface TimePickerBodyProps {
  initialTime: string;
  isEvening: boolean;
  onSelectTime: (time: string) => void;
  onClose: () => void;
}

function TimePickerBody({ initialTime, isEvening, onSelectTime, onClose }: TimePickerBodyProps) {
  const initial = parseTime(initialTime, isEvening ? 20 : 5, 0);
  const [hour, setHour] = useState(initial.hour);
  const [minute, setMinute] = useState(initial.minute);

  const handleIncrementHour = () => {
    setHour((prev) => (prev + 1) % 24);
  };

  const handleDecrementHour = () => {
    setHour((prev) => (prev - 1 + 24) % 24);
  };

  const handleIncrementMinute = () => {
    setMinute((prev) => (prev + 5) % 60);
  };

  const handleDecrementMinute = () => {
    setMinute((prev) => (prev - 5 + 60) % 60);
  };

  const handleSelectPreset = (preset: string) => {
    const [h, m] = preset.split(':').map((v) => parseInt(v, 10));
    if (h !== undefined && m !== undefined) {
      setHour(h);
      setMinute(m);
    }
  };

  const handleSave = () => {
    const formatted = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
    onSelectTime(formatted);
    onClose();
  };

  const presets = isEvening ? EVENING_PRESETS : MORNING_PRESETS;
  const currentFormatted = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;

  return (
    <View style={styles.container}>

        {/* Time Steppers Row */}
        <View style={styles.stepperRow}>
          {/* Hour Stepper */}
          <View style={styles.unitColumn}>
            <Pressable
              onPress={handleIncrementHour}
              accessibilityRole="button"
              accessibilityLabel="Increase hour"
              style={styles.unitButton}
            >
              <Text style={styles.arrowText}>▲</Text>
            </Pressable>
            <View style={styles.numberBox}>
              <Text style={styles.numberText}>{String(hour).padStart(2, '0')}</Text>
            </View>
            <Pressable
              onPress={handleDecrementHour}
              accessibilityRole="button"
              accessibilityLabel="Decrease hour"
              style={styles.unitButton}
            >
              <Text style={styles.arrowText}>▼</Text>
            </Pressable>
            <Text style={styles.unitLabel}>HOUR</Text>
          </View>

          {/* Colon Separator */}
          <Text style={styles.colon}>:</Text>

          {/* Minute Stepper */}
          <View style={styles.unitColumn}>
            <Pressable
              onPress={handleIncrementMinute}
              accessibilityRole="button"
              accessibilityLabel="Increase minute"
              style={styles.unitButton}
            >
              <Text style={styles.arrowText}>▲</Text>
            </Pressable>
            <View style={styles.numberBox}>
              <Text style={styles.numberText}>{String(minute).padStart(2, '0')}</Text>
            </View>
            <Pressable
              onPress={handleDecrementMinute}
              accessibilityRole="button"
              accessibilityLabel="Decrease minute"
              style={styles.unitButton}
            >
              <Text style={styles.arrowText}>▼</Text>
            </Pressable>
            <Text style={styles.unitLabel}>MINUTE</Text>
          </View>
        </View>

        {/* Quick Preset Pills */}
        <View style={styles.presetsSection}>
          <Text style={styles.presetHeading}>QUICK PRESETS</Text>
          <View style={styles.presetPills}>
            {presets.map((p) => {
              const isSelected = p === currentFormatted;
              return (
                <Pressable
                  key={p}
                  onPress={() => handleSelectPreset(p)}
                  accessibilityRole="button"
                  accessibilityState={{ selected: isSelected }}
                  accessibilityLabel={`Select preset ${p}`}
                  style={[styles.presetPill, isSelected && styles.presetPillActive]}
                >
                  <Text
                    style={[
                      styles.presetText,
                      isSelected && styles.presetTextActive,
                    ]}
                  >
                    {p}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* Confirm Button */}
        <Button title="Set Time" onPress={handleSave} style={styles.saveButton} />
      </View>
  );
}

export function TimePickerSheet({
  visible,
  onClose,
  initialTime,
  onSelectTime,
  title,
  isEvening = false,
}: TimePickerSheetProps) {
  return (
    <Sheet visible={visible} onClose={onClose} title={title}>
      {visible ? (
        <TimePickerBody
          key={`${initialTime}-${visible}`}
          initialTime={initialTime}
          isEvening={isEvening}
          onSelectTime={onSelectTime}
          onClose={onClose}
        />
      ) : null}
    </Sheet>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: spacing.sm,
    gap: spacing.lg,
  },
  stepperRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
  },
  unitColumn: {
    alignItems: 'center',
    gap: 6,
  },
  unitButton: {
    width: 44,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.sm,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  arrowText: {
    fontSize: 12,
    color: colors.gold,
  },
  numberBox: {
    width: 72,
    height: 64,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceGlass,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    alignItems: 'center',
    justifyContent: 'center',
  },
  numberText: {
    fontFamily: fontFamilies.numeral,
    fontSize: 32,
    color: colors.text,
  },
  colon: {
    fontFamily: fontFamilies.display,
    fontSize: 32,
    color: colors.gold,
    marginBottom: 20,
  },
  unitLabel: {
    fontFamily: fontFamilies.label,
    fontSize: 10,
    color: colors.textMuted,
    letterSpacing: 1,
    marginTop: 2,
  },
  presetsSection: {
    gap: spacing.xs,
  },
  presetHeading: {
    fontFamily: fontFamilies.labelStrong,
    fontSize: 11,
    color: colors.textMuted,
    letterSpacing: 0.8,
  },
  presetPills: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  presetPill: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: radius.pill,
    backgroundColor: colors.surfaceGlass,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
  },
  presetPillActive: {
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    borderColor: colors.gold,
  },
  presetText: {
    fontFamily: fontFamilies.label,
    fontSize: 12,
    color: colors.textMuted,
  },
  presetTextActive: {
    fontFamily: fontFamilies.labelStrong,
    color: colors.gold,
  },
  saveButton: {
    marginTop: spacing.xs,
  },
});
