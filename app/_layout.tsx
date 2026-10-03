import {
  Outfit_600SemiBold,
  Outfit_700Bold,
  Outfit_800ExtraBold,
} from '@expo-google-fonts/outfit';
import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
} from '@expo-google-fonts/inter';
import { useMigrations } from 'drizzle-orm/expo-sqlite/migrator';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import React, { useEffect, useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { db } from '../db/client';
import migrations from '../db/migrations/migrations';
import { createRepositories } from '../db/repos';
import { seedDatabase } from '../db/seed';
import { getPlatformAdapters } from '../platform';
import { createServices } from '../services/createServices';
import { ServicesProvider } from '../services/ServicesContext';
import { colors } from '../theme/colors';

void SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    Outfit_600SemiBold,
    Outfit_700Bold,
    Outfit_800ExtraBold,
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
  });

  const { success: migrationsSuccess, error: migrationsError } = useMigrations(db, migrations);
  const [seeded, setSeeded] = useState(!__DEV__);

  const services = useMemo(() => {
    const repos = createRepositories(db);
    const platform = getPlatformAdapters();
    return createServices({
      repos,
      ...platform,
    });
  }, []);

  useEffect(() => {
    if (migrationsSuccess && __DEV__) {
      const repos = createRepositories(db);
      void seedDatabase(repos).then(() => {
        setSeeded(true);
      });
    }
  }, [migrationsSuccess]);

  useEffect(() => {
    if (migrationsSuccess && seeded) {
      void services.rolloverService.reconcile();
    }
  }, [migrationsSuccess, seeded, services]);

  useEffect(() => {
    if ((fontsLoaded || fontError) && (migrationsSuccess || migrationsError) && seeded) {
      void SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError, migrationsSuccess, migrationsError, seeded]);

  if (migrationsError) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorTitle}>Database Initialization Failed</Text>
        <Text style={styles.errorMessage}>{migrationsError.message}</Text>
      </View>
    );
  }

  if ((!fontsLoaded && !fontError) || !migrationsSuccess || !seeded) {
    return null;
  }

  return (
    <ServicesProvider services={services}>
      <Stack
        screenOptions={{
          headerStyle: {
            backgroundColor: colors.bg,
          },
          headerTintColor: colors.gold,
          contentStyle: {
            backgroundColor: colors.bg,
          },
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="journey/[id]" options={{ headerShown: false }} />
        <Stack.Screen name="journey/[id]/edit" options={{ headerShown: false }} />
        <Stack.Screen name="journey/new" options={{ headerShown: false }} />
        <Stack.Screen name="gallery" options={{ headerShown: false }} />
        <Stack.Screen name="spike" options={{ title: 'Native Spike' }} />
      </Stack>
    </ServicesProvider>
  );
}

const styles = StyleSheet.create({
  errorContainer: {
    flex: 1,
    backgroundColor: colors.bg,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  errorTitle: {
    color: colors.gold,
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 12,
  },
  errorMessage: {
    color: colors.textMuted,
    fontSize: 14,
    textAlign: 'center',
  },
});
