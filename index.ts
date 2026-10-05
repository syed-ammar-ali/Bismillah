import 'expo-router/entry';
import Constants, { ExecutionEnvironment } from 'expo-constants';

const isExpoGo =
  Constants.executionEnvironment === ExecutionEnvironment.StoreClient ||
  Constants.appOwnership === 'expo';

if (!isExpoGo) {
  try {
    const { registerWidget } = require('./widget/register');
    registerWidget();
  } catch {
    // Guard against environment issues outside Expo Go
  }
}
