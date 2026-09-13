import React, { useCallback, useEffect, useState } from "react";
import {
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { getDefaultReminderTime, formatReminderTime } from "../../features/reminders/reminder-utils";
import { useCssVariables } from "../../hooks/useCssVariables";

export interface ReminderSheetProps {
  visible: boolean;
  currentReminder: number | null;
  onConfirm: (reminderAt: number) => Promise<void>;
  onRemove: () => void;
  onDismiss: () => void;
}

function buildInitialDate(currentReminder: number | null): Date {
  return new Date(currentReminder ?? getDefaultReminderTime());
}

function sanitizeTimeInput(value: string): string {
  return value.replace(/\D/g, "").slice(0, 2);
}

function padTimeInputOnBlur(value: string, maximum: number): string {
  const digits = sanitizeTimeInput(value);
  if (digits.length === 1 && Number(digits) <= maximum) {
    return digits.padStart(2, "0");
  }
  return digits;
}

type Period = "AM" | "PM";

export function ReminderSheet({
  visible,
  currentReminder,
  onConfirm,
  onRemove,
  onDismiss,
}: ReminderSheetProps) {
  const [selectedDate, setSelectedDate] = useState<Date>(() =>
    buildInitialDate(currentReminder),
  );
  const [hourInput, setHourInput] = useState("");
  const [minuteInput, setMinuteInput] = useState("");
  const [period, setPeriod] = useState<Period>("AM");
  const [focusedInput, setFocusedInput] = useState<"hour" | "minute" | null>(
    null,
  );
  const [confirming, setConfirming] = useState(false);

  const colors = useCssVariables();

  // Reset state each time the sheet opens
  useEffect(() => {
    if (visible) {
      const initial = buildInitialDate(currentReminder);
      const hours24 = initial.getHours();
      const hours12 = hours24 % 12 || 12;

      setSelectedDate(initial);
      setHourInput(String(hours12));
      setMinuteInput(String(initial.getMinutes()).padStart(2, "0"));
      setPeriod(hours24 >= 12 ? "PM" : "AM");
      setFocusedInput(null);
      setConfirming(false);
    }
  }, [visible, currentReminder]);

  const composedTimestamp = useCallback((): number | null => {
    const hour = Number(hourInput);
    const minute = Number(minuteInput);
    if (
      hourInput.length === 0 ||
      minuteInput.length === 0 ||
      hour < 1 ||
      hour > 12 ||
      minute < 0 ||
      minute > 59
    ) {
      return null;
    }

    const d = new Date(selectedDate);
    const hour24 =
      period === "AM"
        ? hour === 12
          ? 0
          : hour
        : hour === 12
          ? 12
          : hour + 12;
    d.setHours(hour24, minute, 0, 0);
    return d.getTime();
  }, [hourInput, minuteInput, period, selectedDate]);

  const timestamp = composedTimestamp();
  const isInvalid = timestamp === null;
  const isPast = timestamp !== null && timestamp <= Date.now();

  const handleConfirm = useCallback(async () => {
    const ts = composedTimestamp();
    if (ts === null || ts <= Date.now()) return;
    setConfirming(true);
    try {
      await onConfirm(ts);
    } finally {
      setConfirming(false);
    }
  }, [composedTimestamp, onConfirm]);

  const summary =
    timestamp !== null ? formatReminderTime(timestamp) : "Select a valid time";
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Lazy-require picker so it's only imported when actually rendered (Android only)
  let DatePicker: React.ComponentType<{
    displayedComponents: "date";
    initialDate: string;
    onDateSelected: (d: Date) => void;
    variant?: "picker";
    showVariantToggle?: boolean;
    selectableDates?: { start: Date };
    elementColors?: Record<string, string>;
  }> | null = null;

  let Host: React.ComponentType<{
    matchContents: { vertical: boolean } | boolean;
    style?: object;
    children: React.ReactNode;
  }> | null = null;

  if (Platform.OS === "android") {
    try {
      const jc = require("@expo/ui/jetpack-compose");
      DatePicker = jc.DateTimePicker;
      Host = jc.Host;
    } catch {
      // Not available
    }
  }

  const accentColor = colors["accent"];
  const surfaceColor = colors["surface"];
  const foregroundColor = colors["foreground"];
  const foregroundMutedColor = colors["foreground-muted"];
  const borderColor = colors["border"];

  const pickerColors = {
    containerColor: surfaceColor,
    selectedDayContainerColor: accentColor,
    selectedDayContentColor: colors["on-accent"],
    todayContentColor: accentColor,
    todayDateBorderColor: accentColor,
    dayContentColor: foregroundColor,
    weekdayContentColor: foregroundMutedColor,
    navigationContentColor: foregroundColor,
    subheadContentColor: foregroundColor,
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onDismiss}
    >
      {/* Backdrop: separate Pressable so touches inside the sheet are not caught */}
      <Pressable
        style={{ position: "absolute", inset: 0, backgroundColor: "rgba(0,0,0,0.40)" }}
        onPress={onDismiss}
        accessibilityLabel="Close reminder sheet"
      />

      <View style={{ flex: 1, justifyContent: "flex-end", pointerEvents: "box-none" }}>
        <View className="rounded-t-3xl bg-surface">
          {/* Header */}
          <View className="flex-row items-center justify-between border-b border-border px-4 py-4">
            <Pressable
              onPress={onDismiss}
              accessibilityRole="button"
              accessibilityLabel="Close"
              className="min-h-11 rounded-lg px-3 py-2 active:bg-surface-muted"
            >
              <Text className="font-sans text-foreground">Close</Text>
            </Pressable>
            <Text className="font-sans-semibold text-foreground">
              Set reminder
            </Text>
            <View style={{ width: 64 }} />
          </View>

          <ScrollView className="px-4 py-4" keyboardShouldPersistTaps="handled">
            {/* Date picker */}
            {Platform.OS === "android" && DatePicker && Host ? (
              <>
                <Text className="mb-2 font-sans text-sm text-foreground-muted">
                  Date
                </Text>
                <View className="mb-4 overflow-hidden rounded-xl">
                  <Host
                    matchContents={{ vertical: true }}
                    style={{ width: "100%" }}
                  >
                    <DatePicker
                      displayedComponents="date"
                      initialDate={selectedDate.toISOString()}
                      onDateSelected={setSelectedDate}
                      variant="picker"
                      showVariantToggle={false}
                      selectableDates={{ start: today }}
                      elementColors={pickerColors}
                    />
                  </Host>
                </View>

                <Text className="mb-2 font-sans text-sm text-foreground-muted">
                  Time
                </Text>
                <View className="mb-4 flex-row items-center justify-center gap-3">
                  <TextInput
                    value={hourInput}
                    onChangeText={(value) => setHourInput(sanitizeTimeInput(value))}
                    onFocus={() => setFocusedInput("hour")}
                    onBlur={() => {
                      setHourInput((value) => padTimeInputOnBlur(value, 12));
                      setFocusedInput(null);
                    }}
                    maxLength={2}
                    inputMode="numeric"
                    selectTextOnFocus
                    multiline={false}
                    keyboardType="number-pad"
                    accessibilityLabel="Reminder hour"
                    className={`h-14 w-20 rounded-xl border bg-surface px-2 text-center font-sans-semibold text-2xl text-foreground ${
                      focusedInput === "hour"
                        ? "border-accent"
                        : "border-border-strong"
                    }`}
                  />
                  <Text className="font-sans-semibold text-2xl text-foreground">
                    :
                  </Text>
                  <TextInput
                    value={minuteInput}
                    onChangeText={(value) =>
                      setMinuteInput(sanitizeTimeInput(value))
                    }
                    onFocus={() => setFocusedInput("minute")}
                    onBlur={() => {
                      setMinuteInput((value) => padTimeInputOnBlur(value, 59));
                      setFocusedInput(null);
                    }}
                    maxLength={2}
                    inputMode="numeric"
                    selectTextOnFocus
                    multiline={false}
                    keyboardType="number-pad"
                    accessibilityLabel="Reminder minute"
                    className={`h-14 w-20 rounded-xl border bg-surface px-2 text-center font-sans-semibold text-2xl text-foreground ${
                      focusedInput === "minute"
                        ? "border-accent"
                        : "border-border-strong"
                    }`}
                  />
                  <View className="flex-row overflow-hidden rounded-xl">
                    <Pressable
                        onPress={() => setPeriod("AM")}
                        accessibilityRole="radio"
                        accessibilityState={{ selected: period === "AM" }}
                        className={`min-h-11 min-w-11 items-center justify-center px-3 ${
                          period === "AM" ? "bg-accent" : "bg-accent-soft"
                        }`}
                    >
                        <Text
                          className={`font-sans-medium ${
                            period === "AM" ? "text-on-accent" : "text-accent"
                          }`}
                        >
                          AM
                        </Text>
                    </Pressable>
                    <Pressable
                        onPress={() => setPeriod("PM")}
                        accessibilityRole="radio"
                        accessibilityState={{ selected: period === "PM" }}
                        className={`min-h-11 min-w-11 items-center justify-center px-3 ${
                          period === "PM" ? "bg-accent" : "bg-accent-soft"
                        }`}
                    >
                        <Text
                          className={`font-sans-medium ${
                            period === "PM" ? "text-on-accent" : "text-accent"
                          }`}
                        >
                          PM
                        </Text>
                    </Pressable>
                  </View>
                </View>
                {isInvalid && (
                  <Text className="mb-4 font-sans text-sm text-danger">
                    Enter a valid time.
                  </Text>
                )}
              </>
            ) : (
              <View className="mb-4 rounded-xl border border-border bg-surface-muted p-4">
                <Text className="font-sans text-sm text-foreground-muted">
                  Native date/time picker is only available on Android in this build.
                </Text>
              </View>
            )}

            {/* Summary */}
            <View className="mb-4 rounded-xl bg-accent-soft px-4 py-3">
              <Text className="font-sans text-sm text-foreground-muted">
                Reminder scheduled for
              </Text>
              <Text className="mt-1 font-sans-semibold text-lg text-accent">
                {summary}
              </Text>
              {!isInvalid && isPast && (
                <Text className="mt-1 font-sans text-sm text-danger">
                  Selected time is in the past. Choose a future time.
                </Text>
              )}
            </View>

            {currentReminder !== null && (
              <Pressable
                onPress={onRemove}
                accessibilityRole="button"
                accessibilityLabel="Remove reminder"
                className="mb-4 rounded-xl border border-danger bg-danger-soft px-4 py-3 active:opacity-80"
              >
                <Text className="text-center font-sans-medium text-danger">
                  Remove reminder
                </Text>
              </Pressable>
            )}
          </ScrollView>

          {/* Actions */}
          <View className="flex-row gap-3 border-t border-border px-4 py-4">
            <Pressable
              onPress={onDismiss}
              accessibilityRole="button"
              accessibilityLabel="Cancel"
              className="flex-1 min-h-12 items-center justify-center rounded-xl border border-border-strong px-4 active:bg-surface-muted"
            >
              <Text className="font-sans-medium text-foreground">Cancel</Text>
            </Pressable>
            <Pressable
              onPress={handleConfirm}
              disabled={confirming || isInvalid || isPast}
              accessibilityRole="button"
              accessibilityLabel="Set reminder"
              className="flex-1 min-h-12 items-center justify-center rounded-xl bg-accent px-4 active:bg-accent-pressed disabled:opacity-40"
            >
              <Text className="font-sans-medium text-on-accent">
                {confirming ? "Saving\u2026" : "Set reminder"}
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}
