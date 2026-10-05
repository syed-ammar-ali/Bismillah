import { WidgetPort } from '../core/ports';

export class RealWidgetPort implements WidgetPort {
  async refresh(): Promise<void> {
    try {
      const { buildWidgetSnapshot, setWidgetSnapshot } = require('../widget/snapshot');
      const { createRepositories } = require('../db/repos');
      const { db } = require('../db/client');
      const { getToday } = require('../core/dates');
      const { requestWidgetUpdate } = require('react-native-android-widget');
      const React = require('react');
      const { TodayWidget } = require('../widget/TodayWidget');

      const repos = createRepositories(db);
      const clock = { today: () => getToday() };

      const snapshot = await buildWidgetSnapshot({
        journeyRepo: repos.journeyRepo,
        taskRepo: repos.taskRepo,
        completionRepo: repos.completionRepo,
        settingsRepo: repos.settingsRepo,
        clock,
      });

      await setWidgetSnapshot(snapshot);

      await requestWidgetUpdate({
        widgetName: 'TodayWidget',
        renderWidget: (info: unknown) =>
          React.createElement(TodayWidget, { snapshot, widgetInfo: info }),
        widgetNotFound: () => {},
      });

      await requestWidgetUpdate({
        widgetName: 'TodayWidgetMedium',
        renderWidget: (info: unknown) =>
          React.createElement(TodayWidget, { snapshot, widgetInfo: info }),
        widgetNotFound: () => {},
      });
    } catch {
      // Guard against environment differences outside native APK
    }
  }
}
