import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { colors } from '../../theme/colors';
import { radius, spacing } from '../../theme/spacing';

export interface GapReasonInputProps {
  initialReason: string;
  onSave: (reason: string) => Promise<void>;
}

export function GapReasonInput({ initialReason, onSave }: GapReasonInputProps) {
  const [reasonText, setReasonText] = useState(initialReason);
  const [isSaved, setIsSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    if (isSaving) return;
    setIsSaving(true);
    await onSave(reasonText);
    setIsSaving(false);
    setIsSaved(true);
  };

  return (
    <View>
      <TextInput
        value={reasonText}
        onChangeText={(text) => {
          setReasonText(text);
          setIsSaved(false);
        }}
        placeholder="Why was this day missed?"
        placeholderTextColor={colors.textMuted}
        multiline
        maxLength={200}
        style={styles.reasonInput}
      />

      <View style={styles.saveRow}>
        {isSaved ? (
          <Text style={styles.savedFeedback}>Reason saved ✓</Text>
        ) : (
          <View />
        )}
        <Pressable
          onPress={handleSave}
          disabled={isSaving}
          style={[styles.saveButton, isSaving && styles.saveButtonDisabled]}
          accessibilityRole="button"
          accessibilityLabel="Save gap reason"
        >
          <Text style={styles.saveButtonText}>
            {isSaving ? 'Saving...' : 'Save Reason'}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  reasonInput: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.md,
    color: colors.text,
    fontSize: 14,
    minHeight: 64,
    textAlignVertical: 'top',
  },
  saveRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  savedFeedback: {
    fontSize: 13,
    color: colors.gold,
    fontWeight: '500',
  },
  saveButton: {
    backgroundColor: colors.surfaceRaised,
    paddingVertical: spacing.xs + 2,
    paddingHorizontal: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.gold,
  },
  saveButtonDisabled: {
    opacity: 0.5,
  },
  saveButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.gold,
  },
});
