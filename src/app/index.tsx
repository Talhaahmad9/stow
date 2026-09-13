import { useFocusEffect, useRouter } from "expo-router";
import { useSQLiteContext } from "expo-sqlite";
import { useCallback, useRef, useState } from "react";
import { FlatList, Pressable, Text, View } from "react-native";
import { Image } from "expo-image";
import { AppScreen } from "../components/app-screen";
import { StowIcon } from "../components/ui/stow-icon";
import { useCssVariables } from "../hooks/useCssVariables";
import type { Capture } from "../features/captures/capture";
import { listActiveCaptures } from "../features/captures/capture-repository";
import { formatReminderTime } from "../features/reminders/reminder-utils";

function ReminderLine({ reminderAt }: { reminderAt: number }) {
  const colors = useCssVariables();
  return (
    <View className="mt-1.5 flex-row items-center gap-1.5">
      <StowIcon name="bell" size={13} color={colors["accent"]} />
      <Text className="font-sans text-sm text-accent">
        {formatReminderTime(reminderAt)}
      </Text>
    </View>
  );
}

function EditButton({ onPress }: { onPress: () => void }) {
  const colors = useCssVariables();
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel="Edit capture"
      hitSlop={8}
      className="absolute right-0 top-0 h-11 w-11 items-center justify-center rounded-xl active:bg-accent-soft"
    >
      <StowIcon name="pencil" size={20} color={colors.accent} />
    </Pressable>
  );
}

function CaptureRow({ item, onEdit }: { item: Capture; onEdit: (id: number) => void }) {
  const hasText = item.text !== null && item.text.trim().length > 0;
  const hasImages = item.images.length > 0;
  const imageCount = item.images.length;
  const imageLabel = imageCount === 1 ? "1 image" : `${imageCount} images`;

  if (hasText && !hasImages) {
    return (
      <View className="relative py-5 pr-12">
        <EditButton onPress={() => onEdit(item.id)} />
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
        {item.reminderAt !== null && (
          <ReminderLine reminderAt={item.reminderAt} />
        )}
      </View>
    );
  }

  if (hasText && hasImages) {
    const firstImage = item.images[0];
    return (
      <View className="relative flex-row gap-4 py-5 pr-12">
        <EditButton onPress={() => onEdit(item.id)} />
        <View>
          <Image
            source={{ uri: firstImage.uri }}
            style={{ width: 104, height: 104 }}
            className="rounded-xl bg-surface-muted"
            contentFit="cover"
            accessibilityLabel="Capture image"
          />
          {imageCount > 1 && (
            <View
              style={{
                position: "absolute",
                bottom: 0,
                right: 0,
                backgroundColor: "rgba(0,0,0,0.50)",
                borderTopLeftRadius: 8,
                borderBottomRightRadius: 12,
                paddingHorizontal: 6,
                paddingVertical: 2,
              }}
            >
              <Text className="font-sans-medium text-sm text-white">
                +{imageCount - 1}
              </Text>
            </View>
          )}
        </View>
        <View className="flex-1">
          <Text
            className="font-sans-medium text-lg text-foreground"
            numberOfLines={3}
            ellipsizeMode="tail"
          >
            {item.text}
          </Text>
          <Text className="mt-1.5 font-sans text-base text-foreground-muted">
            Unsorted{"\u00a0\u00b7\u00a0"}{imageLabel}
          </Text>
          {item.reminderAt !== null && (
            <ReminderLine reminderAt={item.reminderAt} />
          )}
        </View>
      </View>
    );
  }

  if (!hasText && hasImages) {
    const showCount = Math.min(2, imageCount);
    const remainder = imageCount - showCount;
    return (
      <View className="relative py-5 pr-12">
        <EditButton onPress={() => onEdit(item.id)} />
        <View className="flex-row gap-2">
          {item.images.slice(0, showCount).map((img, idx) => (
            <View key={img.id} style={{ position: "relative" }}>
              <Image
                source={{ uri: img.uri }}
                style={{ width: showCount === 1 ? 160 : 104, height: showCount === 1 ? 160 : 104 }}
                className="rounded-xl bg-surface-muted"
                contentFit="cover"
                accessibilityLabel="Capture image"
              />
              {remainder > 0 && idx === showCount - 1 && (
                <View
                  style={{
                    position: "absolute",
                    inset: 0,
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: "rgba(0,0,0,0.45)",
                    borderRadius: 12,
                  }}
                >
                  <Text className="font-sans-semibold text-xl text-white">
                    +{remainder}
                  </Text>
                </View>
              )}
            </View>
          ))}
        </View>
        <Text className="mt-3 font-sans text-base text-foreground-muted">
          Unsorted{"\u00a0\u00b7\u00a0"}{imageLabel}
        </Text>
        {item.reminderAt !== null && (
          <ReminderLine reminderAt={item.reminderAt} />
        )}
      </View>
    );
  }

  return null;
}

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

        {/* Content */}
        <View className="flex-1">
          {loading ? (
            <View className="flex-1 items-start justify-center">
              <Text className="font-sans text-foreground-muted">
                Loading\u2026
              </Text>
            </View>
          ) : error ? (
            <View className="flex-1 justify-center">
              <Text className="font-sans text-danger">{error}</Text>
              <Pressable
                onPress={() => void load(focusGeneration.current)}
                accessibilityRole="button"
                accessibilityLabel="Try again"
                className="mt-3 rounded-xl border border-border-strong px-4 py-3 active:bg-surface-muted"
              >
                <Text className="font-sans-medium text-foreground">
                  Try again
                </Text>
              </Pressable>
            </View>
          ) : captures.length === 0 ? (
            <View className="flex-1 items-start justify-center">
              <Text className="mb-2 font-sans-semibold text-xl text-foreground">
                Nothing stowed yet
              </Text>
              <Text className="font-sans text-foreground-muted">
                Capture a thought now.
              </Text>
              <Text className="mt-1 font-sans text-foreground-muted">
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
                <CaptureRow item={item} onEdit={(id) => router.push({ pathname: "/capture", params: { id: String(id) } })} />
              )}
            />
          )}
        </View>

        {/* Bottom action — protected exact content */}
        <View className="pt-4">
          <Pressable
            onPress={() => router.push("/capture")}
            accessibilityRole="button"
            accessibilityLabel="New capture"
            className="h-16 w-full items-center justify-center rounded-2xl bg-accent shadow-md active:bg-accent-pressed"
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
