import { Tabs } from 'expo-router';
import { CalendarDays, Layers, Settings, Sun } from 'lucide-react-native';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { colors } from '../../theme/colors';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarActiveTintColor: colors.gold,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarShowLabel: true,
        tabBarLabelStyle: styles.label,
      }}
    >
      <Tabs.Screen
        name="today"
        options={{
          title: 'Today',
          tabBarIcon: ({ color, focused }) => (
            <View style={styles.iconContainer}>
              <Sun size={22} color={color} strokeWidth={focused ? 2.2 : 1.75} />
              {focused ? <View style={styles.activeDot} /> : null}
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="journeys"
        options={{
          title: 'Journeys',
          tabBarIcon: ({ color, focused }) => (
            <View style={styles.iconContainer}>
              <Layers size={22} color={color} strokeWidth={focused ? 2.2 : 1.75} />
              {focused ? <View style={styles.activeDot} /> : null}
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="calendar"
        options={{
          title: 'Calendar',
          tabBarIcon: ({ color, focused }) => (
            <View style={styles.iconContainer}>
              <CalendarDays size={22} color={color} strokeWidth={focused ? 2.2 : 1.75} />
              {focused ? <View style={styles.activeDot} /> : null}
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color, focused }) => (
            <View style={styles.iconContainer}>
              <Settings size={22} color={color} strokeWidth={focused ? 2.2 : 1.75} />
              {focused ? <View style={styles.activeDot} /> : null}
            </View>
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: colors.bg,
    borderTopColor: colors.border,
    borderTopWidth: 1,
    height: 60,
    paddingBottom: 6,
    paddingTop: 6,
  },
  label: {
    fontSize: 11,
    fontWeight: '500',
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 28,
  },
  activeDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.gold,
    marginTop: 2,
  },
});
