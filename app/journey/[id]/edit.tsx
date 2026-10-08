import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { JourneyForm, JourneyFormData } from '../../../components/journey/JourneyForm';
import { isAfterDate } from '../../../core/dates';
import { dayNumberFor } from '../../../core/timeline';
import { useServices } from '../../../services/ServicesContext';
import { useAppStore } from '../../../stores/useAppStore';
import { useJourneyStore } from '../../../stores/useJourneyStore';
import { colors } from '../../../theme/colors';
import { spacing } from '../../../theme/spacing';
import { fontFamilies } from '../../../theme/typography';

export default function EditJourneyScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const today = useAppStore((s) => s.today);
  const journey = useJourneyStore((s) => s.journeys.find((j) => j.id === id));
  const tasks = useJourneyStore((s) => s.tasks[id ?? '']) ?? [];
  const { journeyService } = useServices();

  const [isSubmitting, setIsSubmitting] = useState(false);

  const currentDay = journey ? dayNumberFor(journey, today) ?? 1 : 1;
  const activeTasks = useMemo(() => {
    return tasks.filter(
      (t) => t.activeToDay === null || t.activeToDay === undefined || t.activeToDay >= currentDay,
    );
  }, [tasks, currentDay]);

  if (!journey) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.notFound}>
          <Text style={styles.title}>Journey not found</Text>
          <Pressable onPress={() => router.back()} style={styles.backBtn}>
            <Text style={styles.backText}>← Go Back</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  const isStarted = !isAfterDate(journey.startDate, today);

  const handleUpdate = async (data: JourneyFormData) => {
    setIsSubmitting(true);
    try {
      const allTasks = [...data.dailyTasks, ...data.makeupTasks];
      const res = await journeyService.update({
        id: journey.id,
        name: data.name,
        startInput: data.startInput,
        endInput: data.endInput,
        deadlineLabel: data.deadlineLabel,
        deadlineDate: data.deadlineDate,
        closingNote: data.closingNote,
        tasks: allTasks.map((t, idx) => ({
          id: t.id,
          title: t.title,
          note: t.note,
          kind: t.kind,
          sortOrder: idx,
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

  const handleDelete = async () => {
    try {
      const res = await journeyService.delete(journey.id);
      if (!res.ok) {
        Alert.alert('Error', res.reason);
        return;
      }
      router.replace('/(tabs)/journeys');
    } catch (err) {
      Alert.alert('Error', String(err));
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
        <Text style={styles.title}>Edit Journey</Text>
      </View>

      <JourneyForm
        initialJourney={journey}
        initialTasks={activeTasks}
        isStarted={isStarted}
        onSubmit={handleUpdate}
        onDelete={handleDelete}
        isSubmitting={isSubmitting}
      />
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
    fontFamily: fontFamilies.display,
    fontSize: 26,
    letterSpacing: -0.6,
    color: colors.gold,
    marginTop: 2,
  },
  notFound: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
});
