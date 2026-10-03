import { registerWidgetTaskHandler } from 'react-native-android-widget';
import { widgetTaskHandler } from './widgetHandler';

export function registerWidget(): void {
  registerWidgetTaskHandler(widgetTaskHandler);
}
