import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, Pressable, SafeAreaView, StyleSheet, Text, View } from 'react-native';
import { JourneyForm, JourneyFormData } from '../../components/journey/JourneyForm';
import { useServices } from '../../services/ServicesContext';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';

export default function NewJourneyScreen() {
  const router = useRouter();
  const { journeyService } = useServices();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCreate = async (data: JourneyFormData) => {
    setIsSubmitting(true);
    try {
      const res = await journeyService.create({
        name: data.name,
        calendarType: data.calendarType,
        startInput: data.startInput,
        endInput: data.endInput,
        deadlineLabel: data.deadlineLabel,
        deadlineDate: data.deadlineDate,
        dailyTasks: data.dailyTasks.map((t) => ({
          title: t.title,
          note: t.note,
        })),
        makeupTasks: data.makeupTasks.map((t) => ({
          title: t.title,
          note: t.note,
        })),
      });

      if (!res.ok) {
        Alert.alert('Error', res.reason);
        return;
      }

      router.back();
    } catch (err) {
      Alert.alert('Error', String(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Pressable
          onPress={() => router.back()}
          style={styles.backBtn}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <Text style={styles.backText}>← Back</Text>
        </Pressable>
        <Text style={styles.title}>Create Journey</Text>
      </View>

      <JourneyForm onSubmit={handleCreate} isSubmitting={isSubmitting} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  header: {
    paddingHorizontal: spacing.screenPadding,
    paddingTop: spacing.sm,
    paddingBottom: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backBtn: {
    alignSelf: 'flex-start',
    paddingVertical: spacing.xs,
  },
  backText: {
    color: colors.gold,
    fontSize: 14,
    fontWeight: '600',
  },
  title: {
    fontFamily: 'CormorantGaramond_600SemiBold',
    fontSize: 28,
    color: colors.gold,
    marginTop: 2,
  },
});
