import { Redirect } from 'expo-router';
import React from 'react';
import { useAppStore } from '../stores/useAppStore';

export default function Index() {
  const hydrated = useAppStore((s) => s.hydrated);
  const onboardingDone = useAppStore((s) => s.settings.onboardingDone);

  if (!hydrated) {
    return null;
  }

  if (!onboardingDone) {
    return <Redirect href="/onboarding" />;
  }

  return <Redirect href="/(tabs)/today" />;
}
