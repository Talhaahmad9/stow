import { useRouter } from "expo-router";
import { useSQLiteContext } from "expo-sqlite";
import { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  Text,
  TextInput,
  View,
} from "react-native";
import { AppScreen } from "../components/app-screen";
import { createTextCapture } from "../features/captures/capture-repository";

export default function CaptureModal() {
  const router = useRouter();
  const db = useSQLiteContext();
  const [text, setText] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const trimmed = text.trim();

  async function onSave() {
    if (trimmed.length === 0 || saving) return;
    setSaving(true);
    setError(null);
    try {
      await createTextCapture(db, text);
      router.back();
    } catch {
      setError("Unable to save. Try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <AppScreen>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1 px-4 py-4"
      >
        <View className="flex-row items-center justify-between mb-4">
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Cancel"
            onPress={() => router.back()}
            className="rounded-lg px-3 py-3 active:bg-surface-muted"
          >
            <Text className="font-sans text-foreground">Cancel</Text>
          </Pressable>
          <Text className="font-sans-semibold text-foreground">
            New capture
          </Text>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Save"
            onPress={onSave}
            disabled={trimmed.length === 0 || saving}
            className="rounded-lg border border-border-strong bg-accent px-4 py-3 active:bg-accent-pressed disabled:opacity-40"
          >
            <Text className="font-sans-medium text-on-accent">Save</Text>
          </Pressable>
        </View>

        <View className="flex-1">
          <TextInput
            value={text}
            onChangeText={setText}
            multiline
            autoFocus
            textAlignVertical="top"
            placeholder="What do you want to remember?"
            accessibilityLabel="New capture text"
            className="flex-1 rounded-xl border border-border-strong bg-surface p-4 font-sans text-foreground"
            placeholderTextColorClassName="accent-foreground-muted"
            cursorColorClassName="accent-accent"
            selectionColorClassName="accent-accent"
            underlineColorAndroidClassName="accent-transparent"
          />
          {error ? (
            <Text className="mt-2 font-sans text-danger">{error}</Text>
          ) : null}
        </View>
      </KeyboardAvoidingView>
    </AppScreen>
  );
}
