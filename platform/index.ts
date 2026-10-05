import Constants, { ExecutionEnvironment } from 'expo-constants';
import {
  CapabilitiesPort,
  ClockPort,
  NotificationPort,
  StoragePort,
  SystemSettingsPort,
  WidgetPort,
} from '../core/ports';
import {
  NoopClockPort,
  NoopNotificationPort,
  NoopSystemSettingsPort,
  NoopWidgetPort,
  noopCapabilities,
} from './noop';
import { RealNotificationPort } from './notifications';
import { RealStoragePort } from './storage';
import { RealSystemSettingsPort } from './systemSettings';
import { RealWidgetPort } from './widget';

const isExpoGo = Constants.executionEnvironment === ExecutionEnvironment.StoreClient;

export interface PlatformAdapters {
  clock: ClockPort;
  widget: WidgetPort;
  notifications: NotificationPort;
  systemSettings: SystemSettingsPort;
  storage: StoragePort;
  capabilities: CapabilitiesPort;
}

export function getPlatformAdapters(): PlatformAdapters {
  const clock = new NoopClockPort();
  const storage = new RealStoragePort();

  if (isExpoGo) {
    return {
      clock,
      widget: new NoopWidgetPort(),
      notifications: new NoopNotificationPort(),
      systemSettings: new NoopSystemSettingsPort(),
      storage,
      capabilities: noopCapabilities,
    };
  }

  return {
    clock,
    widget: new RealWidgetPort(),
    notifications: new RealNotificationPort(),
    systemSettings: new RealSystemSettingsPort(),
    storage,
    capabilities: {
      isExpoGo: false,
      supportsWidget: true,
    },
  };
}

export function setupNotificationResponseListener(onTap: () => void): () => void {
  if (isExpoGo) {
    return () => {};
  }
  const { setupNotificationResponseListener: realSetup } = require('./notifications');
  return realSetup(onTap);
}

