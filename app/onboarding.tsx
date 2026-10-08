import { useRouter } from 'expo-router';
import {
  Bell,
  Check,
  Compass,
  HeartHandshake,
  ShieldCheck,
  Sliders,
  Sparkles,
} from 'lucide-react-native';
import React, { useState } from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '../components/ui/Button';
import { Crescent } from '../components/ui/Crescent';
import { GlassCard } from '../components/ui/GlassCard';
import { PermissionState } from '../core/types';
import { useServices } from '../services/ServicesContext';
import { useAppStore } from '../stores/useAppStore';
import { colors } from '../theme/colors';
import { radius, spacing } from '../theme/spacing';
import { fontFamilies } from '../theme/typography';

export default function OnboardingScreen() {
  const router = useRouter();
  const { settingsService } = useServices();
  const settings = useAppStore((s) => s.settings);

  const [step, setStep] = useState<1 | 2>(1);
  const [permissionState, setPermissionState] = useState<PermissionState>('undetermined');
  const [submitting, setSubmitting] = useState(false);

  // Screen 2 handlers
  const handleRequestPermission = async () => {
    try {
      const state = await settingsService.requestNotificationPermission();
      setPermissionState(state);
    } catch {
      Alert.alert('Notice', 'Notification permissions are simulated in Expo Go.');
    }
  };

  const handleOpenBattery = async () => {
    try {
      await settingsService.openBatterySettings();
    } catch {
      Alert.alert('Notice', 'Available in the installed release APK.');
    }
  };

  const handleOpenExactAlarm = async () => {
    try {
      await settingsService.openExactAlarmSettings();
    } catch {
      Alert.alert('Notice', 'Available in the installed release APK.');
    }
  };

  const handleToggleBatteryChecklist = async () => {
    await settingsService.toggleBatteryChecklist(!settings.batteryChecklistDone);
  };

  const handleFinishOnboarding = async () => {
    if (submitting) return;
    setSubmitting(true);
    await settingsService.updateSettings({ onboardingDone: true });
    setSubmitting(false);
    router.replace('/(tabs)/today');
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {step === 1 ? (
          /* ─── Screen 1: App Intro & Philosophy ─── */
          <View style={styles.stepContainer}>
            {/* Hero Motif */}
            <View style={styles.heroBox}>
              <View style={styles.crescentGlow}>
                <Crescent size={72} color={colors.gold} />
              </View>
              <Text style={styles.appTitle}>Bismillah</Text>
              <Text style={styles.appSubtitle}>Discipline with Grace</Text>
            </View>

            {/* Core Pillars */}
            <View style={styles.featuresList}>
              <GlassCard style={styles.featureCard}>
                <View style={styles.iconCircle}>
                  <Compass size={20} color={colors.gold} />
                </View>
                <View style={styles.featureTextCol}>
                  <Text style={styles.featureTitle}>Steadfast Commitments</Text>
                  <Text style={styles.featureDesc}>
                    Fixed day counts and daily routines. Journey timelines remain locked to cultivate real discipline.
                  </Text>
                </View>
              </GlassCard>

              <GlassCard style={styles.featureCard}>
                <View style={styles.iconCircle}>
                  <HeartHandshake size={20} color={colors.gold} />
                </View>
                <View style={styles.featureTextCol}>
                  <Text style={styles.featureTitle}>Grace Over Guilt</Text>
                  <Text style={styles.featureDesc}>
                    No red failure markers or shame. Gaps are opportunities to pause, reflect with notes, and make up.
                  </Text>
                </View>
              </GlassCard>

              <GlassCard style={styles.featureCard}>
                <View style={styles.iconCircle}>
                  <ShieldCheck size={20} color={colors.gold} />
                </View>
                <View style={styles.featureTextCol}>
                  <Text style={styles.featureTitle}>100% Offline & Private</Text>
                  <Text style={styles.featureDesc}>
                    No tracking, no analytics, no accounts. All intentions and progress live securely on your device.
                  </Text>
                </View>
              </GlassCard>
            </View>

            {/* Bottom Actions */}
            <View style={styles.bottomBar}>
              <View style={styles.stepIndicatorRow}>
                <View style={[styles.stepDot, styles.stepDotActive]} />
                <View style={styles.stepDot} />
              </View>
              <Button
                title="Continue to Setup"
                onPress={() => setStep(2)}
                style={styles.actionBtn}
              />
            </View>
          </View>
        ) : (
          /* ─── Screen 2: Android Reliability Setup ─── */
          <View style={styles.stepContainer}>
            <View style={styles.header}>
              <View style={styles.badgeRow}>
                <Sparkles size={14} color={colors.gold} />
                <Text style={styles.badgeText}>SETUP & RELIABILITY</Text>
              </View>
              <Text style={styles.screenTitle}>Ensure Reliable Reminders</Text>
              <Text style={styles.screenSubtitle}>
                Android aggressively kills background tasks. Configure these settings to keep your daily reminders on time.
              </Text>
            </View>

            {/* Action Cards */}
            <View style={styles.featuresList}>
              {/* Notifications */}
              <GlassCard style={styles.setupCard}>
                <View style={styles.setupHeaderRow}>
                  <View style={styles.setupIconBox}>
                    <Bell size={20} color={colors.gold} />
                  </View>
                  <View style={styles.setupTitleCol}>
                    <Text style={styles.setupTitle}>Notifications</Text>
                    <Text style={styles.setupDesc}>
                      Required for morning reminders and optional evening nudges.
                    </Text>
                  </View>
                </View>
                <Button
                  title={
                    permissionState === 'granted'
                      ? 'Permission Granted ✓'
                      : 'Enable Notifications'
                  }
                  variant={permissionState === 'granted' ? 'ghost' : 'primary'}
                  onPress={handleRequestPermission}
                  style={styles.setupActionBtn}
                />
              </GlassCard>

              {/* Exact Alarms */}
              <GlassCard style={styles.setupCard}>
                <View style={styles.setupHeaderRow}>
                  <View style={styles.setupIconBox}>
                    <Sliders size={20} color={colors.gold} />
                  </View>
                  <View style={styles.setupTitleCol}>
                    <Text style={styles.setupTitle}>Exact Alarms</Text>
                    <Text style={styles.setupDesc}>
                      Allows alarms to fire precisely at your chosen time without drift.
                    </Text>
                  </View>
                </View>
                <Button
                  title="Configure Exact Alarms"
                  variant="ghost"
                  onPress={handleOpenExactAlarm}
                  style={styles.setupActionBtn}
                />
              </GlassCard>

              {/* Battery Optimization */}
              <GlassCard style={styles.setupCard}>
                <View style={styles.setupHeaderRow}>
                  <View style={styles.setupIconBox}>
                    <ShieldCheck size={20} color={colors.gold} />
                  </View>
                  <View style={styles.setupTitleCol}>
                    <Text style={styles.setupTitle}>Battery Optimization</Text>
                    <Text style={styles.setupDesc}>
                      {"Set Bismillah battery usage to 'Unrestricted'"}
                    </Text>
                  </View>
                </View>
                <Button
                  title="Open Battery Settings"
                  variant="ghost"
                  onPress={handleOpenBattery}
                  style={styles.setupActionBtn}
                />

                {/* User Acknowledgement Checkbox */}
                <Pressable
                  onPress={handleToggleBatteryChecklist}
                  accessibilityRole="checkbox"
                  accessibilityState={{ checked: settings.batteryChecklistDone }}
                  accessibilityLabel="Confirm battery set to unrestricted"
                  style={styles.checklistRow}
                >
                  <View style={styles.checkboxSquare}>
                    {settings.batteryChecklistDone ? (
                      <Check size={16} color={colors.gold} />
                    ) : null}
                  </View>
                  <Text style={styles.checklistLabel}>
                    {'I have set Battery to "Unrestricted"'}
                  </Text>
                </Pressable>
              </GlassCard>
            </View>

            {/* Bottom Actions */}
            <View style={styles.bottomBar}>
              <View style={styles.stepIndicatorRow}>
                <View style={styles.stepDot} />
                <View style={[styles.stepDot, styles.stepDotActive]} />
              </View>
              <Button
                title="Begin Journey"
                onPress={handleFinishOnboarding}
                loading={submitting}
                style={styles.actionBtn}
              />
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
    paddingBottom: spacing.xxl,
  },
  stepContainer: {
    gap: spacing.xl,
  },
  heroBox: {
    alignItems: 'center',
    paddingVertical: spacing.lg,
  },
  crescentGlow: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: 'rgba(212, 168, 83, 0.08)',
    borderWidth: 1.5,
    borderColor: 'rgba(212, 168, 83, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
    shadowColor: colors.gold,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 18,
    elevation: 8,
  },
  appTitle: {
    fontFamily: fontFamilies.display,
    fontSize: 34,
    color: colors.text,
  },
  appSubtitle: {
    fontFamily: fontFamilies.heading,
    fontSize: 16,
    color: colors.gold,
    marginTop: 4,
  },
  header: {
    paddingTop: spacing.md,
    gap: 6,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(212, 168, 83, 0.1)',
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: radius.full,
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: 'rgba(212, 168, 83, 0.2)',
    marginBottom: 4,
  },
  badgeText: {
    fontFamily: fontFamilies.labelStrong,
    fontSize: 10,
    color: colors.gold,
    letterSpacing: 1.2,
  },
  screenTitle: {
    fontFamily: fontFamilies.display,
    fontSize: 26,
    color: colors.text,
  },
  screenSubtitle: {
    fontFamily: fontFamilies.body,
    fontSize: 14,
    color: colors.textMuted,
    lineHeight: 20,
    marginTop: 2,
  },
  featuresList: {
    gap: spacing.md,
  },
  featureCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
    padding: spacing.lg,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(212, 168, 83, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(212, 168, 83, 0.2)',
  },
  featureTextCol: {
    flex: 1,
    gap: 4,
  },
  featureTitle: {
    fontFamily: fontFamilies.heading,
    fontSize: 16,
    color: colors.text,
  },
  featureDesc: {
    fontFamily: fontFamilies.body,
    fontSize: 13,
    color: colors.textMuted,
    lineHeight: 19,
  },
  setupCard: {
    padding: spacing.lg,
    gap: spacing.md,
  },
  setupHeaderRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
  },
  setupIconBox: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(212, 168, 83, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  setupTitleCol: {
    flex: 1,
    gap: 2,
  },
  setupTitle: {
    fontFamily: fontFamilies.heading,
    fontSize: 16,
    color: colors.text,
  },
  setupDesc: {
    fontFamily: fontFamilies.body,
    fontSize: 12,
    color: colors.textMuted,
    lineHeight: 17,
  },
  setupActionBtn: {
    width: '100%',
  },
  checklistRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingTop: spacing.xs,
  },
  checkboxSquare: {
    width: 22,
    height: 22,
    borderRadius: radius.xs,
    borderWidth: 1.5,
    borderColor: colors.gold,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(212, 168, 83, 0.08)',
  },
  checklistLabel: {
    fontFamily: fontFamilies.body,
    fontSize: 13,
    color: colors.textSecondary,
    flex: 1,
  },
  bottomBar: {
    marginTop: spacing.md,
    gap: spacing.md,
  },
  stepIndicatorRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  stepDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
  },
  stepDotActive: {
    width: 24,
    backgroundColor: colors.gold,
  },
  actionBtn: {
    width: '100%',
  },
});
