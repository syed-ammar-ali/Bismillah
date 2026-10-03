import { SystemSettingsPort } from '../core/ports';

export class RealSystemSettingsPort implements SystemSettingsPort {
  async openBatterySettings(): Promise<void> {
    const IntentLauncher = require('expo-intent-launcher');
    await IntentLauncher.startActivityAsync(
      IntentLauncher.ActivityAction.IGNORE_BATTERY_OPTIMIZATION_SETTINGS
    );
  }

  async openExactAlarmSettings(): Promise<void> {
    const IntentLauncher = require('expo-intent-launcher');
    await IntentLauncher.startActivityAsync(
      'android.settings.REQUEST_SCHEDULE_EXACT_ALARM'
    );
  }
}
