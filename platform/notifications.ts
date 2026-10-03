import { NotificationPort } from '../core/ports';
import { PermissionState, ScheduleDailySpec, ScheduleOnceSpec } from '../core/types';

export class RealNotificationPort implements NotificationPort {
  constructor() {
    try {
      const Notifications = require('expo-notifications');
      Notifications.setNotificationHandler({
        handleNotification: async () => ({
          shouldShowAlert: true,
          shouldPlaySound: true,
          shouldSetBadge: false,
          shouldShowBanner: true,
          shouldShowList: true,
        }),
      });
    } catch {
      // Lazy fallback
    }
  }

  async requestPermission(): Promise<PermissionState> {
    const Notifications = require('expo-notifications');
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus === 'granted') return 'granted';
    if (finalStatus === 'denied') return 'denied';
    return 'undetermined';
  }

  async scheduleDaily(spec: ScheduleDailySpec): Promise<void> {
    const Notifications = require('expo-notifications');
    await Notifications.setNotificationChannelAsync('daily-reminder', {
      name: 'Daily Reminder',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#D4AF37',
    });

    await Notifications.scheduleNotificationAsync({
      content: {
        title: spec.title,
        body: spec.body,
        sound: true,
      },
      trigger: {
        channelId: 'daily-reminder',
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        hour: spec.hour,
        minute: spec.minute,
      },
    });
  }

  async scheduleOnce(spec: ScheduleOnceSpec): Promise<void> {
    const Notifications = require('expo-notifications');
    await Notifications.scheduleNotificationAsync({
      content: {
        title: spec.title,
        body: spec.body,
        sound: true,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
        seconds: spec.triggerSeconds,
      },
    });
  }

  async cancelAll(): Promise<void> {
    const Notifications = require('expo-notifications');
    await Notifications.cancelAllScheduledNotificationsAsync();
  }
}
