import { Tabs } from 'expo-router';
import React from 'react';
import { FloatingTabBar } from '../../components/ui/FloatingTabBar';
import { colors } from '../../theme/colors';

export default function TabLayout() {
  return (
    <Tabs
      tabBar={(props) => <FloatingTabBar {...props} />}
      screenOptions={{
        headerShown: false,
        // Hide the default tab bar — our FloatingTabBar replaces it
        tabBarStyle: { display: 'none' },
        tabBarActiveTintColor: colors.gold,
        tabBarInactiveTintColor: 'rgba(255,255,255,0.35)',
      }}
    >
      <Tabs.Screen name="today" options={{ title: 'Today' }} />
      <Tabs.Screen name="journeys" options={{ title: 'Journeys' }} />
      <Tabs.Screen name="calendar" options={{ title: 'Calendar' }} />
      <Tabs.Screen name="settings" options={{ title: 'Settings' }} />
    </Tabs>
  );
}
