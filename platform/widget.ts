import { WidgetPort } from '../core/ports';

export class RealWidgetPort implements WidgetPort {
  async refresh(): Promise<void> {
    const { requestWidgetUpdate } = require('react-native-android-widget');
    const React = require('react');
    const { TodayWidget } = require('../widget/TodayWidget');
    const { getStoredCount } = require('../widget/snapshot');

    const count = await getStoredCount();
    await requestWidgetUpdate({
      widgetName: 'TodayWidget',
      renderWidget: () => React.createElement(TodayWidget, { counter: count }),
      widgetNotFound: () => {
        // Widget not currently pinned on home screen
      },
    });
  }
}
