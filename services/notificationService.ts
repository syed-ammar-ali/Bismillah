import { ClockPort, NotificationPort, SettingsRepo } from '../core/ports';
import { log } from './logger';

export class NotificationService {
  constructor(
    private readonly settingsRepo: SettingsRepo,
    private readonly notificationPort: NotificationPort,
    private readonly _clockPort: ClockPort,
  ) {}

  async refresh(pendingTaskSummary?: { dayProgressText: string; pendingCount: number }): Promise<void> {
    try {
      const settings = await this.settingsRepo.getAll();
      if (!settings.reminderEnabled) {
        await this.notificationPort.cancelAll();
        log('info', 'notification', 'Cancelled all reminders (reminders disabled)');
        return;
      }

      const [hourStr, minuteStr] = settings.reminderTime.split(':');
      const hour = parseInt(hourStr ?? '5', 10);
      const minute = parseInt(minuteStr ?? '0', 10);

      const body = pendingTaskSummary
        ? `${pendingTaskSummary.dayProgressText} · ${pendingTaskSummary.pendingCount} tasks waiting`
        : 'Spiritual journey check-in';

      await this.notificationPort.scheduleDaily({
        hour,
        minute,
        title: 'Bismillah',
        body,
      });

      log('info', 'notification', `Scheduled daily reminder for ${settings.reminderTime}`);
    } catch (err) {
      log('error', 'notification', `Failed to refresh notifications: ${String(err)}`);
    }
  }
}
