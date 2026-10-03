import React from 'react';
import type { WidgetTaskHandlerProps } from 'react-native-android-widget';
import { TodayWidget } from './TodayWidget';
import { getStoredCount, incrementStoredCount } from './snapshot';

export async function widgetTaskHandler(props: WidgetTaskHandlerProps): Promise<void> {
  let count = await getStoredCount();

  switch (props.widgetAction) {
    case 'WIDGET_CLICK':
      if (props.clickAction === 'INCREMENT') {
        count = await incrementStoredCount();
      }
      props.renderWidget(<TodayWidget counter={count} />);
      break;

    case 'WIDGET_ADDED':
    case 'WIDGET_UPDATE':
    case 'WIDGET_RESIZED':
    default:
      props.renderWidget(<TodayWidget counter={count} />);
      break;
  }
}
