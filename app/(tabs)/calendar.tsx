import React from 'react';
import { SafeAreaView, StyleSheet, Text, View } from 'react-native';
import { colors } from '../../theme/colors';

export default function CalendarTab() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Calendar</Text>
        <Text style={styles.subtitle}>Calendar view will be implemented in Step 9</Text>
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
    color: colors.textMuted,
    textAlign: 'center',
  },
});
