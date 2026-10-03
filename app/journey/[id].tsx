import { useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import { Pressable, SafeAreaView, StyleSheet, Text, View } from 'react-native';
import { colors } from '../../theme/colors';

export default function JourneyDetailPlaceholder() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Journey Detail</Text>
        <Text style={styles.subtitle}>ID: {id}</Text>
        <Text style={styles.desc}>Journey detail screen will be implemented in Step 8</Text>
        <Pressable
          style={styles.backButton}
          onPress={() => router.back()}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <Text style={styles.backButtonText}>← Back</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  title: {
    fontFamily: 'CormorantGaramond_600SemiBold',
    fontSize: 28,
    color: colors.gold,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: colors.goldSoft,
    marginBottom: 8,
  },
  desc: {
    fontSize: 14,
    color: colors.textMuted,
    marginBottom: 24,
  },
  backButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: colors.surfaceRaised,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  backButtonText: {
    color: colors.gold,
    fontWeight: '600',
  },
});
