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
import { useEffect } from "react";
import {
  SafeAreaProvider,
  initialWindowMetrics,
} from "react-native-safe-area-context";
import { DATABASE_NAME, migrateIfNeeded } from "../data/database";

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
  useEffect(() => {
    // Call the documented synchronous SplashScreen.hide() for SDK 57.
    SplashScreen.hide();
  }, []);

  return (
    <>
      <StatusBar style="auto" />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="capture" options={{ presentation: "modal" }} />
      </Stack>
    </>
  );
}
