import React from "react";
import { Pressable, Text, View } from "react-native";
import { StowIcon } from "../ui/stow-icon";
import { useCssVariables } from "../../hooks/useCssVariables";
import { formatReminderTime } from "../../features/reminders/reminder-utils";

export interface ComposerToolbarProps {
  reminderAt: number | null;
  onSetReminder: () => void;
  onCamera: () => void;
  onAttachment: () => void;
  canAddImages: boolean;
}

export function ComposerToolbar({
  reminderAt,
  onSetReminder,
  onCamera,
  onAttachment,
  canAddImages,
}: ComposerToolbarProps) {
  const colors = useCssVariables();
  const accentColor = colors["accent"];

  const reminderLabel =
    reminderAt !== null ? formatReminderTime(reminderAt) : "Set reminder";

  return (
    <View className="flex-row items-center justify-between border-t border-border px-2 py-2">
      <Pressable
        onPress={onSetReminder}
        hitSlop={8}
        accessibilityRole="button"
        accessibilityLabel={reminderLabel}
        className="min-h-11 min-w-11 flex-row items-center gap-2 rounded-xl px-3 py-2 active:bg-accent-soft"
      >
        <StowIcon name="bell" size={22} color={accentColor} />
        <Text className="font-sans text-sm text-accent" numberOfLines={1}>
          {reminderLabel}
        </Text>
      </Pressable>

      <View className="flex-row items-center gap-2">
        <Pressable
          onPress={onCamera}
          hitSlop={8}
          android_ripple={{ color: colors["accent-soft"] }}
          disabled={!canAddImages}
          accessibilityRole="button"
          accessibilityLabel="Take photo"
          className="min-h-11 min-w-11 items-center justify-center rounded-xl bg-accent-soft px-3 py-2 active:opacity-70 disabled:opacity-40"
        >
          <StowIcon name="camera" size={22} color={accentColor} />
        </Pressable>
        <Pressable
          onPress={onAttachment}
          hitSlop={8}
          android_ripple={{ color: colors["accent-soft"] }}
          disabled={!canAddImages}
          accessibilityRole="button"
          accessibilityLabel="Add attachment"
          className="min-h-11 min-w-11 items-center justify-center rounded-xl bg-accent-soft px-3 py-2 active:opacity-70 disabled:opacity-40"
        >
          <StowIcon name="paperclip" size={22} color={accentColor} />
        </Pressable>
      </View>
    </View>
  );
}
