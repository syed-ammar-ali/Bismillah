import { SystemSettingsPort } from '../core/ports';

export class RealSystemSettingsPort implements SystemSettingsPort {
  async openBatterySettings(): Promise<void> {
    try {
      const IntentLauncher = require('expo-intent-launcher');
      await IntentLauncher.startActivityAsync(
        IntentLauncher.ActivityAction.IGNORE_BATTERY_OPTIMIZATION_SETTINGS,
      );
    } catch {
      try {
        const IntentLauncher = require('expo-intent-launcher');
        await IntentLauncher.startActivityAsync(
          IntentLauncher.ActivityAction.APPLICATION_DETAILS_SETTINGS,
          { data: 'package:com.bismillah.app' },
        );
      } catch {
        // Fallback noop
      }
    }
  }

  async openExactAlarmSettings(): Promise<void> {
    try {
      const IntentLauncher = require('expo-intent-launcher');
      await IntentLauncher.startActivityAsync('android.settings.REQUEST_SCHEDULE_EXACT_ALARM', {
        data: 'package:com.bismillah.app',
      });
    } catch {
      try {
        const IntentLauncher = require('expo-intent-launcher');
        await IntentLauncher.startActivityAsync(
          IntentLauncher.ActivityAction.APPLICATION_DETAILS_SETTINGS,
          { data: 'package:com.bismillah.app' },
        );
      } catch {
        // Fallback noop
      }
    }
  }
}
