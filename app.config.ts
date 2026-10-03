import { ExpoConfig } from 'expo/config';

const config: ExpoConfig = {
  name: 'Bismillah',
  slug: 'bismillah',
  scheme: 'bismillah',
  version: '1.0.0',
  orientation: 'portrait',
  userInterfaceStyle: 'dark',
  android: {
    package: 'com.bismillah.app',
    versionCode: Number(process.env.VERSION_CODE ?? 1),
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
            label: 'Today',
            minWidth: '110dp',
            minHeight: '110dp',
            targetCellWidth: 2,
            targetCellHeight: 2,
            updatePeriodMillis: 1800000,
          },
        ],
      },
    ],
  ],
};

export default config;
