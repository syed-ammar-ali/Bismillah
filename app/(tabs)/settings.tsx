import { useRouter } from 'expo-router';
import React from 'react';
import { Pressable, SafeAreaView, StyleSheet, Text, View } from 'react-native';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';

export default function SettingsTab() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Settings</Text>
        <Text style={styles.subtitle}>Settings screen will be implemented in Step 10</Text>

        <Pressable
          style={styles.galleryButton}
          onPress={() => router.push('/gallery')}
          accessibilityRole="button"
          accessibilityLabel="Open Design System Gallery"
        >
          <Text style={styles.galleryButtonText}>Open Design System Gallery →</Text>
        </Pressable>

        <Pressable
          style={styles.spikeButton}
          onPress={() => router.push('/spike')}
          accessibilityRole="button"
          accessibilityLabel="Open Native Spike Screen"
        >
          <Text style={styles.spikeButtonText}>View Native Spike Screen →</Text>
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
    gap: spacing.md,
  },
  title: {
    fontFamily: 'CormorantGaramond_600SemiBold',
    fontSize: 28,
    color: colors.gold,
  },
  subtitle: {
    fontSize: 14,
    color: colors.textMuted,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  galleryButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    backgroundColor: colors.surfaceRaised,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.gold,
  },
  galleryButtonText: {
    color: colors.goldSoft,
    fontSize: 14,
    fontWeight: '600',
  },
  spikeButton: {
    paddingVertical: 10,
    paddingHorizontal: 18,
    backgroundColor: colors.surface,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  spikeButtonText: {
    color: colors.textMuted,
    fontSize: 13,
  },
});
