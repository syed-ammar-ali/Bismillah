import { CormorantGaramond_600SemiBold } from '@expo-google-fonts/cormorant-garamond';
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
import { Stack, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import React, { useEffect, useMemo, useState } from 'react';
import { AppState, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { CelebrationHost } from '../components/celebrations/CelebrationHost';
import { ErrorBoundary } from '../components/ui/ErrorBoundary';
import { ToastHost } from '../components/ui/ToastHost';
import { msUntilNextMidnight } from '../core/dates';
import { db } from '../db/client';
import migrations from '../db/migrations/migrations';
import { createRepositories } from '../db/repos';
import { seedDatabase } from '../db/seed';
import { getPlatformAdapters, setupNotificationResponseListener } from '../platform';
import { createServices } from '../services/createServices';
import { ServicesProvider } from '../services/ServicesContext';
import { colors } from '../theme/colors';
import { fontFamilies } from '../theme/typography';

void SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    Outfit_600SemiBold,
    Outfit_700Bold,
    Outfit_800ExtraBold,
    CormorantGaramond_600SemiBold,
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

  // Seed dev database if in development
  useEffect(() => {
    if (migrationsSuccess && __DEV__) {
      const repos = createRepositories(db);
      void seedDatabase(repos).then(() => {
        setSeeded(true);
      });
    }
  }, [migrationsSuccess]);

  // Initial reconcile
  useEffect(() => {
    if (migrationsSuccess && seeded) {
      void services.rolloverService.reconcile();
    }
  }, [migrationsSuccess, seeded, services]);

  // AppState listener: reload store on every foreground (handling widget writes / date change)
  useEffect(() => {
    if (!migrationsSuccess || !seeded) return;

    const subscription = AppState.addEventListener('change', (nextState) => {
      if (nextState === 'active') {
        void services.rolloverService.reconcile();
      }
    });

    return () => {
      subscription.remove();
    };
  }, [migrationsSuccess, seeded, services]);

  // Midnight timer: automatically trigger rollover at next midnight
  useEffect(() => {
    if (!migrationsSuccess || !seeded) return;

    let timerId: ReturnType<typeof setTimeout> | null = null;

    const scheduleNextMidnight = () => {
      const ms = msUntilNextMidnight();

      timerId = setTimeout(() => {
        void services.rolloverService.reconcile();
        scheduleNextMidnight();
      }, ms);
    };

    scheduleNextMidnight();

    return () => {
      if (timerId) clearTimeout(timerId);
    };
  }, [migrationsSuccess, seeded, services]);

  // Splash screen dismissal
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
        <Pressable
          onPress={() => {
            void SplashScreen.preventAutoHideAsync();
            // Retry
          }}
          accessibilityRole="button"
          accessibilityLabel="Retry database connection"
          style={styles.retryBtn}
        >
          <Text style={styles.retryBtnText}>Retry Connection</Text>
        </Pressable>
      </View>
    );
  }

  if ((!fontsLoaded && !fontError) || !migrationsSuccess || !seeded) {
    return null;
  }

  return (
    <SafeAreaProvider style={{ flex: 1, backgroundColor: colors.bg }}>
      <StatusBar style="light" />
      <ErrorBoundary>
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
            <Stack.Screen name="onboarding" options={{ headerShown: false }} />
            <Stack.Screen name="journey/[id]" options={{ headerShown: false }} />
            <Stack.Screen name="journey/[id]/edit" options={{ headerShown: false }} />
            <Stack.Screen
              name="journey/[id]/complete"
              options={{ headerShown: false, presentation: 'fullScreenModal' }}
            />
            <Stack.Screen name="journey/new" options={{ headerShown: false }} />
            <Stack.Screen name="gallery" options={{ headerShown: false }} />
            <Stack.Screen name="spike" options={{ title: 'Native Spike' }} />
          </Stack>
          <NotificationResponseHandler />
          <CelebrationHost />
          <ToastHost />
        </ServicesProvider>
      </ErrorBoundary>
    </SafeAreaProvider>
  );
}

function NotificationResponseHandler() {
  const router = useRouter();
  useEffect(() => {
    return setupNotificationResponseListener(() => {
      router.replace('/(tabs)/today');
    });
  }, [router]);
  return null;
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
    fontFamily: fontFamilies.display,
    color: colors.gold,
    fontSize: 22,
    marginBottom: 12,
    textAlign: 'center',
  },
  errorMessage: {
    fontFamily: fontFamilies.body,
    color: colors.textMuted,
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  retryBtn: {
    backgroundColor: colors.gold,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
  },
  retryBtnText: {
    fontFamily: fontFamilies.labelStrong,
    fontSize: 14,
    color: '#060709',
  },
});
