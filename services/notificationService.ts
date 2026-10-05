import { isAfterDate, isBeforeDate } from '../core/dates';
import {
  ClockPort,
  CompletionRepo,
  JourneyRepo,
  NotificationPort,
  SettingsRepo,
  TaskRepo,
} from '../core/ports';
import { isTaskActiveOnDay } from '../core/status';
import { dayNumberFor } from '../core/timeline';
import { Journey, Task, TaskCompletion } from '../core/types';
import { log } from './logger';

export class NotificationService {
  constructor(
    private readonly journeyRepo: JourneyRepo,
    private readonly taskRepo: TaskRepo,
    private readonly completionRepo: CompletionRepo,
    private readonly settingsRepo: SettingsRepo,
    private readonly notificationPort: NotificationPort,
    private readonly clockPort: ClockPort,
  ) {}

  async refresh(): Promise<void> {
    try {
      // 1. Idempotently cancel all scheduled notifications
      await this.notificationPort.cancelAll();

      const settings = await this.settingsRepo.getAll();
      const today = this.clockPort.today();

      // 2. Fetch all active journeys and their tasks/completions for today
      const allJourneys = await this.journeyRepo.getAll();
      const activeJourneys = allJourneys.filter(
        (j) =>
          !j.archivedAt &&
          !j.completionShownAt &&
          !isBeforeDate(today, j.startDate) &&
          !isAfterDate(today, j.endDate),
      );

      // Find pending tasks across active journeys for today
      let firstUnsealedJourney: Journey | null = null;
      let firstUnsealedPendingCount = 0;
      let totalActiveJourneys = activeJourneys.length;
      let allSealed = totalActiveJourneys > 0;

      for (const journey of activeJourneys) {
        const dayNum = dayNumberFor(journey, today);
        if (dayNum === null) continue;

        const tasks: Task[] = await this.taskRepo.getByJourney(journey.id);
        const dailyTasks = tasks.filter(
          (t) => t.kind === 'daily' && isTaskActiveOnDay(t, dayNum),
        );
        const completions: TaskCompletion[] = await this.completionRepo.getByDay(
          journey.id,
          dayNum,
        );
        const completedIds = new Set(completions.map((c) => c.taskId));
        const pendingCount = dailyTasks.filter((t) => !completedIds.has(t.id)).length;

        if (pendingCount > 0) {
          allSealed = false;
          if (!firstUnsealedJourney) {
            firstUnsealedJourney = journey;
            firstUnsealedPendingCount = pendingCount;
          }
        }
      }

      // 3. Schedule Daily Morning/Day Reminder
      if (settings.reminderEnabled) {
        let reminderBody = 'Spiritual journey check-in';
        if (firstUnsealedJourney) {
          const dayNum = dayNumberFor(firstUnsealedJourney, today) ?? 1;
          reminderBody = `Day ${dayNum} of ${firstUnsealedJourney.totalDays} · ${firstUnsealedPendingCount} tasks waiting`;
        } else if (allSealed) {
          reminderBody = 'All journeys sealed today. Keep the glow alive!';
        } else {
          reminderBody = 'No active journeys today. Tap to plan a new journey.';
        }

        const [hourStr, minuteStr] = settings.reminderTime.split(':');
        const hour = parseInt(hourStr ?? '5', 10);
        const minute = parseInt(minuteStr ?? '0', 10);

        await this.notificationPort.scheduleDaily({
          hour,
          minute,
          title: 'Bismillah',
          body: reminderBody,
        });

        log('info', 'notification', `Scheduled daily reminder for ${settings.reminderTime}: "${reminderBody}"`);
      } else {
        log('info', 'notification', 'Daily reminders disabled in settings');
      }

      // 4. Schedule Evening Nudge (if enabled and today is unsealed)
      if (settings.eveningNudgeEnabled) {
        if (!allSealed && firstUnsealedJourney) {
          const nudgeBody = `${firstUnsealedPendingCount} tasks left in ${firstUnsealedJourney.name}`;
          const [nudgeHourStr, nudgeMinuteStr] = settings.eveningNudgeTime.split(':');
          const nudgeHour = parseInt(nudgeHourStr ?? '21', 10);
          const nudgeMinute = parseInt(nudgeMinuteStr ?? '0', 10);

          // Calculate remaining seconds until nudge time today
          const now = new Date();
          const target = new Date();
          target.setHours(nudgeHour, nudgeMinute, 0, 0);

          const diffMs = target.getTime() - now.getTime();
          const triggerSeconds = Math.floor(diffMs / 1000);

          if (triggerSeconds > 10) {
            await this.notificationPort.scheduleOnce({
              triggerSeconds,
              title: 'Bismillah',
              body: nudgeBody,
            });
            log('info', 'notification', `Scheduled evening nudge for tonight in ${triggerSeconds}s: "${nudgeBody}"`);
          } else {
            log('info', 'notification', `Evening nudge time (${settings.eveningNudgeTime}) has already passed for today`);
          }
        } else {
          log('info', 'notification', 'Evening nudge skipped: all journeys are sealed for today');
        }
      }
    } catch (err) {
      log('error', 'notification', `Failed to refresh notifications: ${String(err)}`);
    }
  }
}
