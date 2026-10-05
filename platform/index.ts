import Constants, { ExecutionEnvironment } from 'expo-constants';
import {
  CapabilitiesPort,
  ClockPort,
  NotificationPort,
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
import { RealSystemSettingsPort } from './systemSettings';
import { RealWidgetPort } from './widget';

const isExpoGo = Constants.executionEnvironment === ExecutionEnvironment.StoreClient;

export interface PlatformAdapters {
  clock: ClockPort;
  widget: WidgetPort;
  notifications: NotificationPort;
  systemSettings: SystemSettingsPort;
  capabilities: CapabilitiesPort;
}

export function getPlatformAdapters(): PlatformAdapters {
  const clock = new NoopClockPort();

  if (isExpoGo) {
    return {
      clock,
      widget: new NoopWidgetPort(),
      notifications: new NoopNotificationPort(),
      systemSettings: new NoopSystemSettingsPort(),
      capabilities: noopCapabilities,
    };
  }

  return {
    clock,
    widget: new RealWidgetPort(),
    notifications: new RealNotificationPort(),
    systemSettings: new RealSystemSettingsPort(),
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

