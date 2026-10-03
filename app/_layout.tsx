import { Stack } from 'expo-router';
import React from 'react';

export default function RootLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: '#0B0F1A',
        },
        headerTintColor: '#D4AF37',
        contentStyle: {
          backgroundColor: '#0B0F1A',
        },
      }}
    >
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="spike" options={{ title: 'Native Spike' }} />
    </Stack>
  );
}
