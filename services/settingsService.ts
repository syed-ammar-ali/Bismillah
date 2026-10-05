import { CapabilitiesPort, NotificationPort, SettingsRepo, SystemSettingsPort } from '../core/ports';
import { AppSettings, PermissionState, Result } from '../core/types';
import { useAppStore } from '../stores/useAppStore';
import { AfterWriteOrchestrator } from './afterWrite';
import { JourneyService } from './journeyService';
import { log } from './logger';

export class SettingsService {
  constructor(
    private readonly settingsRepo: SettingsRepo,
    private readonly journeyService: JourneyService,
    private readonly notificationPort: NotificationPort,
    private readonly systemSettingsPort: SystemSettingsPort,
    private readonly capabilitiesPort: CapabilitiesPort,
    private readonly afterWrite: AfterWriteOrchestrator,
  ) {}

  async updateSettings(patch: Partial<AppSettings>): Promise<Result<void, string>> {
    await this.settingsRepo.setMany(patch);
    useAppStore.getState().updateSettings(patch);
    await this.afterWrite.execute();
    return { ok: true, value: undefined };
  }

  async reResolveHijriJourneys(newAdjustment: -1 | 0 | 1): Promise<Result<number, string>> {
    await this.updateSettings({ hijriAdjustment: newAdjustment });
    const res = await this.journeyService.reResolveHijriJourneys(newAdjustment);
    log('info', 'system', `Re-resolved active Hijri journeys: ${res.ok ? res.value : 0} updated`);
    return res;
  }

  async openBatterySettings(): Promise<void> {
    await this.systemSettingsPort.openBatterySettings();
  }

  async openExactAlarmSettings(): Promise<void> {
    await this.systemSettingsPort.openExactAlarmSettings();
  }

  async toggleBatteryChecklist(done: boolean): Promise<Result<void, string>> {
    return this.updateSettings({ batteryChecklistDone: done });
  }

  async getNotificationPermission(): Promise<PermissionState> {
    return this.notificationPort.requestPermission();
  }

  async requestNotificationPermission(): Promise<PermissionState> {
    return this.notificationPort.requestPermission();
  }

  async testNotification(): Promise<void> {
    if (this.capabilitiesPort.isExpoGo) {
      log('info', 'notification', 'Test notification triggered in Expo Go (simulated)');
      return;
    }
    await this.notificationPort.scheduleOnce({
      title: 'Bismillah',
      body: 'Test notification: Your reminders are working.',
      triggerSeconds: 1,
    });
    log('info', 'notification', 'Test notification scheduled for 1s');
  }
}
