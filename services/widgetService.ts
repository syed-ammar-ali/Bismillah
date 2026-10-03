import { WidgetPort } from '../core/ports';
import { log } from './logger';

export class WidgetService {
  constructor(private readonly widgetPort: WidgetPort) {}

  async refresh(): Promise<void> {
    try {
      await this.widgetPort.refresh();
      log('info', 'widget', 'Widget refreshed successfully');
    } catch (err) {
      log('error', 'widget', `Failed to refresh widget: ${String(err)}`);
    }
  }
}
