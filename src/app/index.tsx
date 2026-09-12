import { useFocusEffect, useRouter } from "expo-router";
import { useSQLiteContext } from "expo-sqlite";
import { useCallback, useRef, useState } from "react";
import { FlatList, Pressable, Text, View } from "react-native";
import { AppScreen } from "../components/app-screen";
import type { Capture } from "../features/captures/capture";
import { listActiveCaptures } from "../features/captures/capture-repository";

export default function Index() {
  const db = useSQLiteContext();
  const router = useRouter();
  const [captures, setCaptures] = useState<Capture[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const focusGeneration = useRef(0);

  const load = useCallback(
    async (generation: number) => {
      if (focusGeneration.current !== generation) return;
      setLoading(true);
      setError(null);
      try {
        const rows = await listActiveCaptures(db);
        if (focusGeneration.current !== generation) return;
        setCaptures(rows);
      } catch {
        if (focusGeneration.current !== generation) return;
        setError("Failed to load captures.");
      } finally {
        if (focusGeneration.current === generation) setLoading(false);
      }
    },
    [db],
  );

  useFocusEffect(
    useCallback(() => {
      const generation = focusGeneration.current + 1;
      focusGeneration.current = generation;
      void load(generation);
      return () => {
        focusGeneration.current += 1;
      };
    }, [load]),
  );

  return (
    <AppScreen>
      <View className="flex-1 px-6 py-4">
        {/* Header */}
        <View className="pb-4">
          <Text className="font-sans-semibold text-2xl text-foreground">
            Inbox
          </Text>
          <View className="mt-3 border-t border-border" />
        </View>

        {/* Flexible content area */}
        <View className="flex-1">
          {loading ? (
            <View className="flex-1 items-start justify-center">
              <Text className="font-sans text-foreground-muted">Loading…</Text>
            </View>
          ) : error ? (
            <View className="flex-1 justify-center">
              <Text className="font-sans text-danger">{error}</Text>
              <Pressable
                onPress={() => void load(focusGeneration.current)}
                accessibilityRole="button"
                accessibilityLabel="Try again"
                className="mt-3 rounded-lg border border-border-strong px-4 py-3 active:bg-surface-muted"
              >
                <Text className="font-sans-medium text-foreground">
                  Try again
                </Text>
              </Pressable>
            </View>
          ) : captures.length === 0 ? (
            <View className="flex-1 items-start justify-center">
              <Text className="font-sans-semibold text-xl text-foreground mb-2">
                Nothing stowed yet
              </Text>
              <Text className="font-sans text-foreground-muted">
                Capture a thought now.
              </Text>
              <Text className="font-sans text-foreground-muted mt-1">
                You can sort it later.
              </Text>
            </View>
          ) : (
            <FlatList<Capture>
              data={captures}
              keyExtractor={(item) => String(item.id)}
              ItemSeparatorComponent={() => (
                <View className="border-t border-border" />
              )}
              renderItem={({ item }) => (
                <View className="py-5">
                  <Text
                    className="font-sans-medium text-lg text-foreground"
                    numberOfLines={3}
                    ellipsizeMode="tail"
                  >
                    {item.text}
                  </Text>
                  <Text className="mt-1.5 font-sans text-base text-foreground-muted">
                    Unsorted
                  </Text>
                </View>
              )}
            />
          )}
        </View>

        {/* Bottom action area: single primary action above safe area */}
        <View className="pt-4">
          <Pressable
            onPress={() => router.push("/capture")}
            accessibilityRole="button"
            accessibilityLabel="New capture"
            className="w-full h-16 rounded-2xl bg-accent items-center justify-center active:bg-accent-pressed shadow-md"
          >
            <Text className="font-sans-lg text-on-accent text-lg font-bold">
              + New capture
            </Text>
          </Pressable>
        </View>
      </View>
    </AppScreen>
  );
}
