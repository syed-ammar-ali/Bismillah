import {
  CapabilitiesPort,
  ClockPort,
  NotificationPort,
  StoragePort,
  SystemSettingsPort,
  WidgetPort,
} from '../core/ports';
import { PermissionState, ScheduleDailySpec, ScheduleOnceSpec } from '../core/types';

export class NoopClockPort implements ClockPort {
  today(): string {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
}

export class NoopWidgetPort implements WidgetPort {
  async refresh(): Promise<void> {
    // In Expo Go, widget updates are a no-op
  }
}

export class NoopNotificationPort implements NotificationPort {
  async requestPermission(): Promise<PermissionState> {
    return 'undetermined';
  }

  async scheduleDaily(_spec: ScheduleDailySpec): Promise<void> {
    // No-op in Expo Go
  }

  async scheduleOnce(_spec: ScheduleOnceSpec): Promise<void> {
    // No-op in Expo Go
  }

  async cancelAll(): Promise<void> {
    // No-op in Expo Go
  }
}

export class NoopSystemSettingsPort implements SystemSettingsPort {
  async openBatterySettings(): Promise<void> {
    // No-op in Expo Go
  }

  async openExactAlarmSettings(): Promise<void> {
    // No-op in Expo Go
  }
}

export class NoopStoragePort implements StoragePort {
  async writeBackupFile(filename: string, _content: string): Promise<string> {
    return `file:///cache/${filename}`;
  }

  async shareFile(): Promise<void> {
    // No-op
  }

  async pickBackupFile(): Promise<{ uri: string; content: string; name: string } | null> {
    return null;
  }
}

export const noopCapabilities: CapabilitiesPort = {
  isExpoGo: true,
  supportsWidget: false,
};

