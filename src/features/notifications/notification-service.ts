import { isRunningInExpoGo } from "expo";
import { Platform } from "react-native";

export type ReminderCapability =
  | { status: "supported" }
  | { status: "development-build-required" }
  | { status: "permission-denied" }
  | { status: "failed"; error: string };

export type ScheduleResult =
  | { status: "scheduled"; notificationId: string }
  | { status: "development-build-required" }
  | { status: "permission-denied" }
  | { status: "past-time" }
  | { status: "failed"; error: string };

let handlerInitialized = false;

async function requireNotifications() {
  const Notifications = await import("expo-notifications");
  return Notifications;
}

async function ensureHandlerAndChannel(): Promise<void> {
  if (handlerInitialized) return;
  const Notifications = await requireNotifications();
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });
  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("stow-reminders", {
      name: "Stow Reminders",
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#5B5BD6",
    });
  }
  handlerInitialized = true;
}

export async function requestReminderPermission(): Promise<ReminderCapability> {
  if (isRunningInExpoGo()) {
    return { status: "development-build-required" };
  }
  try {
    await ensureHandlerAndChannel();
    const Notifications = await requireNotifications();
    const { status } = await Notifications.requestPermissionsAsync();
    if (status === "granted") {
      return { status: "supported" };
    }
    return { status: "permission-denied" };
  } catch (err) {
    return {
      status: "failed",
      error: err instanceof Error ? err.message : "Unknown error",
    };
  }
}

export async function scheduleReminder(
  captureId: number,
  reminderAt: number,
  captureText: string | null,
  imageCount: number,
): Promise<ScheduleResult> {
  if (isRunningInExpoGo()) {
    return { status: "development-build-required" };
  }
  if (reminderAt <= Date.now()) {
    return { status: "past-time" };
  }
  try {
    await ensureHandlerAndChannel();
    const Notifications = await requireNotifications();

    const preview =
      captureText && captureText.length > 60
        ? captureText.substring(0, 60) + "\u2026"
        : (captureText ?? null);

    let body: string;
    if (preview && imageCount > 0) {
      body = `${preview} (+\u00a0${imageCount} ${imageCount === 1 ? "image" : "images"})`;
    } else if (preview) {
      body = preview;
    } else if (imageCount > 0) {
      body = `${imageCount} ${imageCount === 1 ? "image" : "images"}`;
    } else {
      body = "Your capture";
    }

    const notificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title: "Stow Reminder",
        body,
        data: { captureId: String(captureId) },
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: new Date(reminderAt),
        channelId: "stow-reminders",
      },
    });

    return { status: "scheduled", notificationId };
  } catch (err) {
    return {
      status: "failed",
      error: err instanceof Error ? err.message : "Scheduling failed",
    };
  }
}

export async function cancelReminder(notificationId: string): Promise<void> {
  if (isRunningInExpoGo()) return;
  try {
    const Notifications = await requireNotifications();
    await Notifications.cancelScheduledNotificationAsync(notificationId);
  } catch (error) {
    console.error("Unable to cancel reminder notification.", error);
  }
}
