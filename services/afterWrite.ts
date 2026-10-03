import { NotificationService } from './notificationService';
import { WidgetService } from './widgetService';

export class AfterWriteOrchestrator {
  constructor(
    private readonly widgetService: WidgetService,
    private readonly notificationService: NotificationService,
  ) {}

  async execute(): Promise<void> {
    await Promise.allSettled([
      this.widgetService.refresh(),
      this.notificationService.refresh(),
    ]);
  }
}
