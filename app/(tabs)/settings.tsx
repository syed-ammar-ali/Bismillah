import { useRouter } from 'expo-router';
import {
  AlertCircle,
  Bell,
  CheckCircle2,
  Clock,
  ExternalLink,
  Info,
  Layers,
  Moon,
  ShieldCheck,
} from 'lucide-react-native';
import React, { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { TimePickerSheet } from '../../components/settings/TimePickerSheet';
import { Button } from '../../components/ui/Button';
import { GlassCard } from '../../components/ui/GlassCard';
import { daysBetween, formatDisplayDate } from '../../core/dates';
import { toHijri } from '../../core/hijri';
import { PermissionState } from '../../core/types';
import { useServices } from '../../services/ServicesContext';
import { useAppStore } from '../../stores/useAppStore';
import { colors } from '../../theme/colors';
import { radius, spacing } from '../../theme/spacing';
import { fontFamilies } from '../../theme/typography';

export default function SettingsTab() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const today = useAppStore((s) => s.today);
  const settings = useAppStore((s) => s.settings);
  const { settingsService, backupService } = useServices();

  const [permissionState, setPermissionState] = useState<PermissionState>('undetermined');
  const [activeTimePicker, setActiveTimePicker] = useState<'reminder' | 'nudge' | null>(null);
  const [exporting, setExporting] = useState(false);
  const [importing, setImporting] = useState(false);

  useEffect(() => {
    void settingsService.getNotificationPermission().then(setPermissionState);
  }, [settingsService]);

  // Hijri adjustment handler
  const handleSelectAdjustment = useCallback(
    (newVal: -1 | 0 | 1) => {
      if (newVal === settings.hijriAdjustment) return;

      Alert.alert(
        'Re-resolve Active Hijri Journeys?',
        'Would you like to recalculate Gregorian start and end dates for active Hijri journeys using the new adjustment?',
        [
          {
            text: 'Keep Current Dates',
            style: 'cancel',
            onPress: () => {
              void settingsService.updateSettings({ hijriAdjustment: newVal });
            },
          },
          {
            text: 'Re-resolve Dates',
            onPress: () => {
              void (async () => {
                const res = await settingsService.reResolveHijriJourneys(newVal);
                if (res.ok && res.value > 0) {
                  Alert.alert(
                    'Journeys Updated',
                    `Successfully re-resolved dates for ${res.value} active Hijri journey(s).`,
                  );
                }
              })();
            },
          },
        ],
      );
    },
    [settings.hijriAdjustment, settingsService],
  );

  // Reminders handlers
  const handleToggleReminder = useCallback(
    (val: boolean) => {
      void settingsService.updateSettings({ reminderEnabled: val });
    },
    [settingsService],
  );

  const handleToggleEveningNudge = useCallback(
    (val: boolean) => {
      void settingsService.updateSettings({ eveningNudgeEnabled: val });
    },
    [settingsService],
  );

  const handleSaveReminderTime = useCallback(
    (time: string) => {
      void settingsService.updateSettings({ reminderTime: time });
    },
    [settingsService],
  );

  const handleSaveEveningNudgeTime = useCallback(
    (time: string) => {
      void settingsService.updateSettings({ eveningNudgeTime: time });
    },
    [settingsService],
  );

  const handleTestNotification = useCallback(async () => {
    await settingsService.testNotification();
    Alert.alert(
      'Notification Test',
      'Test notification triggered. In Expo Go, native notifications are simulated and logged to Diagnostics.',
    );
  }, [settingsService]);

  // Android reliability handlers
  const handleRequestPermission = useCallback(async () => {
    const res = await settingsService.requestNotificationPermission();
    setPermissionState(res);
  }, [settingsService]);

  const handleOpenBattery = useCallback(async () => {
    try {
      await settingsService.openBatterySettings();
    } catch {
      Alert.alert('Notice', 'Available in the installed release APK.');
    }
  }, [settingsService]);

  const handleOpenExactAlarm = useCallback(async () => {
    try {
      await settingsService.openExactAlarmSettings();
    } catch {
      Alert.alert('Notice', 'Available in the installed release APK.');
    }
  }, [settingsService]);

  const handleToggleBatteryChecklist = useCallback(() => {
    void settingsService.updateSettings({
      batteryChecklistDone: !settings.batteryChecklistDone,
    });
  }, [settings.batteryChecklistDone, settingsService]);

  // Backup handlers
  const handleExportBackup = useCallback(async () => {
    setExporting(true);
    const res = await backupService.exportBackup();
    setExporting(false);
    if (!res.ok) {
      Alert.alert('Export Failed', res.reason);
    }
  }, [backupService]);

  const handleImportBackup = useCallback(() => {
    Alert.alert(
      'Overwrite Existing Data?',
      'Importing a backup will replace all current journeys, tasks, and settings with the contents of the backup file. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Choose Backup File',
          style: 'destructive',
          onPress: async () => {
            setImporting(true);
            const res = await backupService.importBackup();
            setImporting(false);
            if (res.ok) {
              Alert.alert('Import Complete', `Successfully restored ${res.value.journeysCount} journey(s).`);
            } else if (res.reason !== 'Import cancelled') {
              Alert.alert('Import Failed', res.reason);
            }
          },
        },
      ],
    );
  }, [backupService]);

  // Live Hijri Preview
  const previewHijri = toHijri(today, settings.hijriAdjustment);

  // Backup status
  const isBackupStale =
    !settings.lastBackupAt || daysBetween(settings.lastBackupAt, today) > 30;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: 130 + insets.bottom },
        ]}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.screenTitle}>Settings</Text>
          <Text style={styles.screenSubtitle}>
            Preferences, Reminders & System Reliability
          </Text>
        </View>

        {/* ── Section 1: Hijri Calendar ── */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Moon size={16} color={colors.gold} />
            <Text style={styles.sectionTitle}>HIJRI CALENDAR</Text>
          </View>

          <GlassCard style={styles.card}>
            <Text style={styles.cardLabel}>Moon Sighting Adjustment</Text>
            <Text style={styles.cardDesc}>
              Adjust the Islamic calendar by -1, 0, or +1 day to align with local crescent observation.
            </Text>

            {/* Segmented Selector */}
            <View style={styles.segmentRow}>
              {([-1, 0, 1] as const).map((adj) => {
                const isSelected = settings.hijriAdjustment === adj;
                const label = adj === 0 ? '0 (Default)' : adj > 0 ? '+1 Day' : '-1 Day';
                return (
                  <Pressable
                    key={adj}
                    onPress={() => handleSelectAdjustment(adj)}
                    accessibilityRole="button"
                    accessibilityState={{ selected: isSelected }}
                    accessibilityLabel={`Set Hijri adjustment ${label}`}
                    style={[styles.segmentBtn, isSelected && styles.segmentBtnActive]}
                  >
                    <Text
                      style={[
                        styles.segmentText,
                        isSelected && styles.segmentTextActive,
                      ]}
                    >
                      {label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            {/* Live Preview Box */}
            <View style={styles.previewBox}>
              <Text style={styles.previewLabel}>LIVE PREVIEW FOR TODAY</Text>
              <Text style={styles.previewDateText}>{previewHijri.formatted}</Text>
              <Text style={styles.previewSubText}>
                Gregorian: {formatDisplayDate(today)}
              </Text>
            </View>
          </GlassCard>
        </View>

        {/* ── Section 2: Reminders & Nudges ── */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Bell size={16} color={colors.gold} />
            <Text style={styles.sectionTitle}>REMINDERS & NUDGES</Text>
          </View>

          <GlassCard style={styles.card}>
            {/* Daily Reminder */}
            <View style={styles.settingRow}>
              <View style={styles.settingTextCol}>
                <Text style={styles.settingTitle}>Daily Reminder</Text>
                <Text style={styles.settingDesc}>
                  Morning reminder showing tasks waiting for today
                </Text>
              </View>
              <Switch
                value={settings.reminderEnabled}
                onValueChange={handleToggleReminder}
                trackColor={{ false: 'rgba(255, 255, 255, 0.1)', true: colors.gold }}
                thumbColor={colors.text}
              />
            </View>

            {settings.reminderEnabled ? (
              <Pressable
                onPress={() => setActiveTimePicker('reminder')}
                accessibilityRole="button"
                accessibilityLabel={`Reminder time: ${settings.reminderTime}. Tap to change.`}
                style={styles.timeSelectRow}
              >
                <View style={styles.timeIconText}>
                  <Clock size={16} color={colors.gold} />
                  <Text style={styles.timeLabel}>Reminder Time</Text>
                </View>
                <View style={styles.timeBadge}>
                  <Text style={styles.timeBadgeText}>{settings.reminderTime}</Text>
                </View>
              </Pressable>
            ) : null}

            <View style={styles.divider} />

            {/* Evening Nudge */}
            <View style={styles.settingRow}>
              <View style={styles.settingTextCol}>
                <Text style={styles.settingTitle}>Evening Nudge</Text>
                <Text style={styles.settingDesc}>
                  Gentle reminder sent only if today is not yet sealed
                </Text>
              </View>
              <Switch
                value={settings.eveningNudgeEnabled}
                onValueChange={handleToggleEveningNudge}
                trackColor={{ false: 'rgba(255, 255, 255, 0.1)', true: colors.gold }}
                thumbColor={colors.text}
              />
            </View>

            {settings.eveningNudgeEnabled ? (
              <Pressable
                onPress={() => setActiveTimePicker('nudge')}
                accessibilityRole="button"
                accessibilityLabel={`Evening nudge time: ${settings.eveningNudgeTime}. Tap to change.`}
                style={styles.timeSelectRow}
              >
                <View style={styles.timeIconText}>
                  <Clock size={16} color={colors.gold} />
                  <Text style={styles.timeLabel}>Nudge Time</Text>
                </View>
                <View style={styles.timeBadge}>
                  <Text style={styles.timeBadgeText}>{settings.eveningNudgeTime}</Text>
                </View>
              </Pressable>
            ) : null}

            <View style={styles.divider} />

            <Button
              title="Send Test Notification"
              variant="secondary"
              onPress={handleTestNotification}
              style={styles.testBtn}
            />
          </GlassCard>
        </View>

        {/* ── Section 3: Android Reliability ── */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <ShieldCheck size={16} color={colors.gold} />
            <Text style={styles.sectionTitle}>ANDROID RELIABILITY</Text>
          </View>

          <GlassCard style={styles.card}>
            <Text style={styles.cardDesc}>
              Budget Motorola devices aggressively kill background services. Follow these steps so your reminders and widgets run without interruption.
            </Text>

            {/* Notification Permission Card */}
            <View style={styles.statusBox}>
              <View style={styles.statusBoxHeader}>
                <Text style={styles.statusBoxTitle}>Notification Permission</Text>
                <View
                  style={[
                    styles.statusBadge,
                    permissionState === 'granted'
                      ? styles.badgeGranted
                      : styles.badgeWarning,
                  ]}
                >
                  <Text
                    style={[
                      styles.statusBadgeText,
                      permissionState === 'granted'
                        ? styles.badgeTextGranted
                        : styles.badgeTextWarning,
                    ]}
                  >
                    {permissionState === 'granted' ? 'GRANTED' : 'NOT GRANTED'}
                  </Text>
                </View>
              </View>

              {permissionState !== 'granted' ? (
                <Button
                  title="Enable Notifications"
                  variant="secondary"
                  onPress={handleRequestPermission}
                  style={styles.actionBtn}
                />
              ) : null}
            </View>

            {/* Exact Alarm Setting */}
            <View style={styles.settingActionRow}>
              <View style={styles.settingTextCol}>
                <Text style={styles.settingTitle}>Exact Alarms (Android 12+)</Text>
                <Text style={styles.settingDesc}>
                  Allows scheduling notifications at exact minutes
                </Text>
              </View>
              <Button
                title="Open Settings"
                variant="ghost"
                onPress={handleOpenExactAlarm}
              />
            </View>

            <View style={styles.divider} />

            {/* Battery Optimization Setting */}
            <View style={styles.settingActionRow}>
              <View style={styles.settingTextCol}>
                <Text style={styles.settingTitle}>Battery Optimization</Text>
                <Text style={styles.settingDesc}>
                  {"Set Bismillah battery usage to 'Unrestricted'"}
                </Text>
              </View>
              <Button
                title="Open Settings"
                variant="ghost"
                onPress={handleOpenBattery}
              />
            </View>

            {/* User confirmation checklist */}
            <Pressable
              onPress={handleToggleBatteryChecklist}
              accessibilityRole="checkbox"
              accessibilityState={{ checked: settings.batteryChecklistDone }}
              accessibilityLabel="Confirm battery set to unrestricted"
              style={styles.checklistRow}
            >
              <View style={styles.checkIcon}>
                {settings.batteryChecklistDone ? (
                  <CheckCircle2 size={20} color={colors.gold} />
                ) : (
                  <View style={styles.emptyCircle} />
                )}
              </View>
              <Text style={styles.checklistText}>
                {'I have set Battery to "Unrestricted" in system settings'}
              </Text>
            </Pressable>
          </GlassCard>
        </View>

        {/* ── Section 4: Home Screen Widget ── */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Layers size={16} color={colors.gold} />
            <Text style={styles.sectionTitle}>HOME SCREEN WIDGET</Text>
          </View>

          <GlassCard style={styles.card}>
            <Text style={styles.widgetStep}>
              <Text style={styles.widgetStepNum}>1. </Text>
              {"Long-press any empty area on your phone's home screen."}
            </Text>
            <Text style={styles.widgetStep}>
              <Text style={styles.widgetStepNum}>2. </Text>Tap <Text style={styles.boldText}>Widgets</Text> and scroll to <Text style={styles.boldText}>Bismillah</Text>.
            </Text>
            <Text style={styles.widgetStep}>
              <Text style={styles.widgetStepNum}>3. </Text>Drag the <Text style={styles.boldText}>Small (2x2)</Text> or <Text style={styles.boldText}>Medium (4x2)</Text> widget to your home screen.
            </Text>
            <View style={styles.infoBox}>
              <Info size={14} color={colors.goldSoft} />
              <Text style={styles.infoText}>
                Widgets update instantly upon every task tick and daily midnight rollover. (Available in installed APK).
              </Text>
            </View>
          </GlassCard>
        </View>

        {/* ── Section 5: Data Backup ── */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <AlertCircle size={16} color={colors.gold} />
            <Text style={styles.sectionTitle}>DATA BACKUP</Text>
          </View>

          <GlassCard style={styles.card}>
            <View style={styles.backupHeader}>
              <View style={styles.settingTextCol}>
                <Text style={styles.settingTitle}>Offline JSON Backup</Text>
                <Text style={styles.settingDesc}>
                  Last backup: {settings.lastBackupAt ? formatDisplayDate(settings.lastBackupAt) : 'Never'}
                </Text>
              </View>
              {isBackupStale ? (
                <View style={styles.backupWarningBadge}>
                  <Text style={styles.backupWarningText}>BACKUP DUE</Text>
                </View>
              ) : null}
            </View>

            <View style={styles.backupBtnRow}>
              <Button
                title="Export JSON"
                variant="secondary"
                onPress={handleExportBackup}
                loading={exporting}
                style={styles.halfBtn}
              />
              <Button
                title="Import JSON"
                variant="ghost"
                onPress={handleImportBackup}
                loading={importing}
                style={styles.halfBtn}
              />
            </View>
          </GlassCard>
        </View>

        {/* ── Section 6: About & Diagnostics ── */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Info size={16} color={colors.gold} />
            <Text style={styles.sectionTitle}>ABOUT</Text>
          </View>

          <GlassCard style={styles.card}>
            <View style={styles.aboutRow}>
              <Text style={styles.appName}>Bismillah</Text>
              <Text style={styles.appVersion}>Version 1.0.0 (Build 1)</Text>
            </View>

            <Text style={styles.appMeta}>
              100% Offline · Zero Trackers · Local SQLite Storage
            </Text>

            <View style={styles.divider} />

            <Pressable
              onPress={() => router.push('/diagnostics')}
              accessibilityRole="button"
              accessibilityLabel="Open Diagnostics Screen"
              style={styles.navLinkRow}
            >
              <Text style={styles.navLinkText}>View Diagnostics Log (Ring Buffer)</Text>
              <ExternalLink size={16} color={colors.gold} />
            </Pressable>

            {__DEV__ ? (
              <Pressable
                onPress={() => router.push('/gallery')}
                accessibilityRole="button"
                accessibilityLabel="Open Design Gallery"
                style={styles.navLinkRow}
              >
                <Text style={styles.navLinkText}>Design System Gallery (DEV)</Text>
                <ExternalLink size={16} color={colors.gold} />
              </Pressable>
            ) : null}
          </GlassCard>
        </View>
      </ScrollView>

      {/* Time Picker Sheet */}
      <TimePickerSheet
        visible={Boolean(activeTimePicker)}
        onClose={() => setActiveTimePicker(null)}
        initialTime={
          activeTimePicker === 'reminder'
            ? settings.reminderTime
            : settings.eveningNudgeTime
        }
        title={
          activeTimePicker === 'reminder'
            ? 'Set Reminder Time'
            : 'Set Evening Nudge Time'
        }
        isEvening={activeTimePicker === 'nudge'}
        onSelectTime={
          activeTimePicker === 'reminder'
            ? handleSaveReminderTime
            : handleSaveEveningNudgeTime
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  scrollContent: {
    paddingHorizontal: spacing.screenPadding,
    paddingTop: spacing.lg,
    paddingBottom: 110, // clear floating tab pill
    gap: spacing.xl,
  },
  header: {
    marginBottom: spacing.xs,
  },
  screenTitle: {
    fontFamily: fontFamilies.display,
    fontSize: 30,
    letterSpacing: -0.8,
    color: colors.gold,
  },
  screenSubtitle: {
    fontFamily: fontFamilies.body,
    fontSize: 13,
    color: colors.textMuted,
    marginTop: 2,
  },
  section: {
    gap: spacing.sm,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 2,
  },
  sectionTitle: {
    fontFamily: fontFamilies.labelStrong,
    fontSize: 11,
    color: colors.gold,
    letterSpacing: 1.2,
  },
  card: {
    padding: spacing.lg,
    gap: spacing.md,
  },
  cardLabel: {
    fontFamily: fontFamilies.heading,
    fontSize: 15,
    color: colors.text,
  },
  cardDesc: {
    fontFamily: fontFamilies.body,
    fontSize: 13,
    color: colors.textMuted,
    lineHeight: 18,
  },
  segmentRow: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderRadius: radius.md,
    padding: 3,
    gap: 3,
  },
  segmentBtn: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.sm,
  },
  segmentBtnActive: {
    backgroundColor: 'rgba(245, 158, 11, 0.18)',
    borderWidth: 1,
    borderColor: colors.gold,
  },
  segmentText: {
    fontFamily: fontFamilies.label,
    fontSize: 12,
    color: colors.textMuted,
  },
  segmentTextActive: {
    fontFamily: fontFamilies.labelStrong,
    color: colors.gold,
  },
  previewBox: {
    backgroundColor: 'rgba(245, 158, 11, 0.06)',
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.20)',
    padding: spacing.md,
    gap: 4,
  },
  previewLabel: {
    fontFamily: fontFamilies.labelStrong,
    fontSize: 10,
    color: colors.goldSoft,
    letterSpacing: 0.8,
  },
  previewDateText: {
    fontFamily: fontFamilies.heading,
    fontSize: 17,
    color: colors.gold,
  },
  previewSubText: {
    fontFamily: fontFamilies.body,
    fontSize: 12,
    color: colors.textMuted,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  settingTextCol: {
    flex: 1,
    gap: 2,
  },
  settingTitle: {
    fontFamily: fontFamilies.heading,
    fontSize: 14,
    color: colors.text,
  },
  settingDesc: {
    fontFamily: fontFamilies.body,
    fontSize: 12,
    color: colors.textMuted,
    lineHeight: 16,
  },
  timeSelectRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
  },
  timeIconText: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  timeLabel: {
    fontFamily: fontFamilies.label,
    fontSize: 13,
    color: colors.text,
  },
  timeBadge: {
    backgroundColor: 'rgba(245, 158, 11, 0.12)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.3)',
  },
  timeBadgeText: {
    fontFamily: fontFamilies.labelStrong,
    fontSize: 14,
    color: colors.gold,
  },
  divider: {
    height: 1,
    backgroundColor: colors.borderSubtle,
    marginVertical: spacing.xs,
  },
  testBtn: {
    marginTop: spacing.xs,
  },
  statusBox: {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    padding: spacing.md,
    gap: spacing.sm,
  },
  statusBoxHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  statusBoxTitle: {
    fontFamily: fontFamilies.heading,
    fontSize: 13,
    color: colors.text,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: radius.pill,
    borderWidth: 1,
  },
  badgeGranted: {
    backgroundColor: 'rgba(52, 211, 153, 0.12)',
    borderColor: 'rgba(52, 211, 153, 0.35)',
  },
  badgeWarning: {
    backgroundColor: 'rgba(245, 158, 11, 0.12)',
    borderColor: 'rgba(245, 158, 11, 0.35)',
  },
  statusBadgeText: {
    fontFamily: fontFamilies.labelStrong,
    fontSize: 10,
    letterSpacing: 0.5,
  },
  badgeTextGranted: {
    color: '#34D399',
  },
  badgeTextWarning: {
    color: colors.gold,
  },
  actionBtn: {
    marginTop: spacing.xs,
  },
  settingActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  checklistRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: 'rgba(245, 158, 11, 0.05)',
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.15)',
    padding: spacing.md,
  },
  checkIcon: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: colors.borderSubtle,
  },
  checklistText: {
    flex: 1,
    fontFamily: fontFamilies.body,
    fontSize: 13,
    color: colors.text,
    lineHeight: 18,
  },
  widgetStep: {
    fontFamily: fontFamilies.body,
    fontSize: 13,
    color: colors.text,
    lineHeight: 19,
  },
  widgetStepNum: {
    fontFamily: fontFamilies.labelStrong,
    color: colors.gold,
  },
  boldText: {
    fontFamily: fontFamilies.labelStrong,
    color: colors.text,
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: radius.md,
    padding: spacing.sm,
    marginTop: spacing.xs,
  },
  infoText: {
    flex: 1,
    fontFamily: fontFamilies.body,
    fontSize: 11,
    color: colors.textMuted,
    lineHeight: 15,
  },
  backupHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backupWarningBadge: {
    backgroundColor: 'rgba(239, 68, 68, 0.12)',
    borderColor: 'rgba(239, 68, 68, 0.3)',
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.pill,
  },
  backupWarningText: {
    fontFamily: fontFamilies.labelStrong,
    fontSize: 9,
    color: colors.danger,
    letterSpacing: 0.5,
  },
  backupBtnRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  halfBtn: {
    flex: 1,
  },
  aboutRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
  },
  appName: {
    fontFamily: fontFamilies.display,
    fontSize: 20,
    color: colors.gold,
  },
  appVersion: {
    fontFamily: fontFamilies.label,
    fontSize: 12,
    color: colors.textMuted,
  },
  appMeta: {
    fontFamily: fontFamilies.body,
    fontSize: 12,
    color: colors.textMuted,
  },
  navLinkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.xs,
  },
  navLinkText: {
    fontFamily: fontFamilies.label,
    fontSize: 13,
    color: colors.goldSoft,
  },
});
