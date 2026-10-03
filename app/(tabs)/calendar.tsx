import React from 'react';
import { SafeAreaView, StyleSheet, Text, View } from 'react-native';
import { Crescent } from '../../components/ui/Crescent';
import { colors } from '../../theme/colors';
import { fontFamilies } from '../../theme/typography';

export default function CalendarTab() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Crescent size={56} opacity={0.25} />
        <Text style={styles.title}>Calendar</Text>
        <Text style={styles.subtitle}>Unified calendar and Hijri alignment</Text>
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
    gap: 8,
  },
  title: {
    fontFamily: fontFamilies.display,
    fontSize: 26,
    letterSpacing: -0.6,
    color: colors.gold,
    marginTop: 8,
  },
  subtitle: {
    fontFamily: fontFamilies.body,
    fontSize: 14,
    color: colors.textMuted,
    textAlign: 'center',
  },
});
