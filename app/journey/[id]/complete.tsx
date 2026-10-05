import { useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { CompletionView } from '../../../components/celebrations/CompletionView';
import { useJourneyStore } from '../../../stores/useJourneyStore';
import { colors } from '../../../theme/colors';

export default function JourneyCompleteScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  const journey = useJourneyStore((s) => s.journeys.find((j) => j.id === id));

  if (!journey) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Journey not found.</Text>
      </View>
    );
  }

  return (
    <CompletionView
      journey={journey}
      onDone={() => {
        router.back();
      }}
    />
  );
}

const styles = StyleSheet.create({
  errorContainer: {
    flex: 1,
    backgroundColor: colors.bg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorText: {
    color: colors.textMuted,
    fontSize: 14,
  },
});
