import "../global.css";

import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  useFonts,
} from "@expo-google-fonts/inter";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { SQLiteProvider } from "expo-sqlite";
import { StatusBar } from "expo-status-bar";
import { useCallback, useEffect, useState } from "react";
import {
  SafeAreaProvider,
  initialWindowMetrics,
} from "react-native-safe-area-context";
import { DATABASE_NAME, migrateIfNeeded } from "../data/database";
import {
  OnboardingStateProvider,
  readOnboardingComplete,
} from "../features/onboarding/onboarding-state";

SplashScreen.preventAutoHideAsync();

export const unstable_settings = {
  anchor: "index",
};

export default function RootLayout() {
  const [fontsLoaded, fontsError] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
  });

  // Wait for fonts to load before mounting the SQLiteProvider so we can
  // control the startup ordering: fonts -> migrations -> navigation mount.
  if (!fontsLoaded && !fontsError) {
    return null;
  }

  return (
    <SafeAreaProvider initialMetrics={initialWindowMetrics}>
      <SQLiteProvider databaseName={DATABASE_NAME} onInit={migrateIfNeeded}>
        <NavigationWrapper />
      </SQLiteProvider>
    </SafeAreaProvider>
  );
}

function NavigationWrapper() {
  const [onboardingComplete, setOnboardingComplete] = useState<
    boolean | null
  >(null);

  useEffect(() => {
    let mounted = true;
    void readOnboardingComplete()
      .catch((error) => {
        console.error("Unable to read onboarding completion.", error);
        return false;
      })
      .then((complete) => {
        if (mounted) setOnboardingComplete(complete);
      });
    return () => {
      mounted = false;
    };
  }, []);

  const markCompleted = useCallback(() => {
    setOnboardingComplete(true);
  }, []);

  useEffect(() => {
    if (onboardingComplete !== null) {
      // Call the documented synchronous SplashScreen.hide() for SDK 57.
      SplashScreen.hide();
    }
  }, [onboardingComplete]);

  if (onboardingComplete === null) {
    return null;
  }

  return (
    <OnboardingStateProvider
      completed={onboardingComplete}
      markCompleted={markCompleted}
    >
      <StatusBar style="auto" />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Protected guard={!onboardingComplete}>
          <Stack.Screen name="onboarding" />
        </Stack.Protected>
        <Stack.Protected guard={onboardingComplete}>
          <Stack.Screen name="index" />
          <Stack.Screen name="capture" options={{ presentation: "modal" }} />
        </Stack.Protected>
      </Stack>
    </OnboardingStateProvider>
  );
}
