import { useRouter } from 'expo-router';
import React from 'react';
import { SafeAreaView, StyleSheet, Text, View } from 'react-native';
import { Button } from '../../components/ui/Button';
import { Crescent } from '../../components/ui/Crescent';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { fontFamilies } from '../../theme/typography';

export default function SettingsTab() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Crescent size={56} opacity={0.25} />
        <Text style={styles.title}>Settings</Text>
        <Text style={styles.subtitle}>Preferences, Reminders & Data Backup</Text>

        <View style={styles.buttonStack}>
          <Button
            title="Design System Gallery →"
            variant="secondary"
            onPress={() => router.push('/gallery')}
          />

          <Button
            title="Native Spike Screen →"
            variant="ghost"
            onPress={() => router.push('/spike')}
          />
        </View>
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
    gap: spacing.sm,
  },
  title: {
    fontFamily: fontFamilies.display,
    fontSize: 28,
    letterSpacing: -0.6,
    color: colors.gold,
    marginTop: 8,
  },
  subtitle: {
    fontFamily: fontFamilies.body,
    fontSize: 14,
    color: colors.textMuted,
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  buttonStack: {
    gap: spacing.md,
    width: '100%',
    maxWidth: 280,
  },
});
