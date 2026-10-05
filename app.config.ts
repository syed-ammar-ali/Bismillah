import { ExpoConfig } from 'expo/config';

const config: ExpoConfig = {
  name: 'Bismillah',
  slug: 'bismillah',
  scheme: 'bismillah',
  version: '1.0.0',
  orientation: 'portrait',
  userInterfaceStyle: 'dark',
  icon: './assets/icon.png',
  android: {
    package: 'com.bismillah.app',
    versionCode: Number(process.env.VERSION_CODE ?? 1),
    adaptiveIcon: {
      foregroundImage: './assets/adaptive-icon.png',
      backgroundColor: '#060709',
    },
    permissions: [
      'POST_NOTIFICATIONS',
      'SCHEDULE_EXACT_ALARM',
      'RECEIVE_BOOT_COMPLETED',
      'VIBRATE',
    ],
  },
  plugins: [
    'expo-router',
    'expo-sqlite',
    'expo-notifications',
    'expo-font',
    'expo-sharing',
    [
      'expo-splash-screen',
      {
        image: './assets/splash.png',
        resizeMode: 'contain',
        backgroundColor: '#060709',
      },
    ],
    [
      'expo-build-properties',
      {
        android: {},
      },
    ],
    [
      'react-native-android-widget',
      {
        widgets: [
          {
            name: 'TodayWidget',
            label: 'Today (Small 2x2)',
            minWidth: '110dp',
            minHeight: '110dp',
            targetCellWidth: 2,
            targetCellHeight: 2,
            maxResizeWidth: '220dp',
            maxResizeHeight: '220dp',
            resizeMode: 'horizontal|vertical',
            updatePeriodMillis: 1800000,
          },
          {
            name: 'TodayWidgetMedium',
            label: 'Today (Medium 4x2)',
            minWidth: '220dp',
            minHeight: '110dp',
            targetCellWidth: 4,
            targetCellHeight: 2,
            maxResizeWidth: '340dp',
            maxResizeHeight: '220dp',
            resizeMode: 'horizontal|vertical',
            updatePeriodMillis: 1800000,
          },
        ],
      },
    ],
  ],
};

export default config;
