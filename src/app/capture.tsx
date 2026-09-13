import { useFocusEffect, useRouter } from "expo-router";
import { useSQLiteContext } from "expo-sqlite";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  Alert,
  BackHandler,
  Image as RNImage,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  Text,
  TextInput,
  View,
} from "react-native";
import { AppScreen } from "../components/app-screen";
import { AttachmentPreviewRail } from "../components/composer/attachment-preview-rail";
import { ComposerToolbar } from "../components/composer/composer-toolbar";
import { ReminderSheet } from "../components/composer/reminder-sheet";
import { useDraftAttachments } from "../hooks/useDraftAttachments";
import { useCssVariables } from "../hooks/useCssVariables";
import {
  createCapture,
  updateCaptureReminder,
} from "../features/captures/capture-repository";
import type { Capture } from "../features/captures/capture";
import {
  processAndStoreImage,
  deleteStoredImage,
  cleanupTempImages,
} from "../features/images/image-processor";
import type { ProcessedImage } from "../features/images/image-processor";
import {
  launchCamera,
  pickImageFile,
  recoverPendingCameraResult,
} from "../features/images/image-acquisition";
import {
  requestReminderPermission,
  scheduleReminder,
  cancelReminder,
} from "../features/notifications/notification-service";
import { formatReminderTime } from "../features/reminders/reminder-utils";

export default function CaptureModal() {
  const router = useRouter();
  const db = useSQLiteContext();
  const colors = useCssVariables();

  const [text, setText] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const mediaLaunchInProgressRef = useRef(false);

  // Draft reminder: only a timestamp stored in state.
  // Notifications are only scheduled after capture is created.
  const [draftReminderAt, setDraftReminderAt] = useState<number | null>(null);

  const [showReminderSheet, setShowReminderSheet] = useState(false);
  const [showDiscardConfirm, setShowDiscardConfirm] = useState(false);

  const { images, addImages, removeImage, markStored, clearAll, canAddImages } =
    useDraftAttachments();

  const trimmed = text.trim();
  const hasContent = trimmed.length > 0 || images.length > 0;
  const hasDraft = hasContent || draftReminderAt !== null;
  const saveEnabled = hasContent && !saving;

  useEffect(() => {
    let mounted = true;

    void recoverPendingCameraResult()
      .then((asset) => {
        if (mounted && asset) addImages([asset]);
      })
      .catch((error) => {
        console.error("Unable to recover the pending camera result.", error);
      });

    return () => {
      mounted = false;
    };
  }, [addImages]);

  // BackHandler using useFocusEffect so subscription is tied to screen focus
  // and is always cleaned up on blur/unmount.
  const hasDraftRef = useRef(hasDraft);
  hasDraftRef.current = hasDraft;

  useFocusEffect(
    useCallback(() => {
      const sub = BackHandler.addEventListener("hardwareBackPress", () => {
        if (hasDraftRef.current) {
          setShowDiscardConfirm(true);
          return true;
        }
        return false;
      });
      return () => sub.remove();
    }, []),
  );

  const handleCancel = useCallback(() => {
    if (hasDraft) {
      setShowDiscardConfirm(true);
    } else {
      router.back();
    }
  }, [hasDraft, router]);

  const handleConfirmDiscard = useCallback(async () => {
    setShowDiscardConfirm(false);
    await clearAll();
    router.back();
  }, [clearAll, router]);

  // --- Media acquisition ---

  const handleTakePhoto = useCallback(async () => {
    if (!canAddImages || mediaLaunchInProgressRef.current) return;
    mediaLaunchInProgressRef.current = true;
    try {
      const asset = await launchCamera();
      if (asset) addImages([asset]);
    } catch (error) {
      console.error("Unable to open the camera.", error);
      Alert.alert("Camera unavailable", "Unable to open the camera. Please try again.");
    } finally {
      mediaLaunchInProgressRef.current = false;
    }
  }, [canAddImages, addImages]);

  const handlePickFile = useCallback(async () => {
    if (!canAddImages || mediaLaunchInProgressRef.current) return;
    mediaLaunchInProgressRef.current = true;
    try {
      const asset = await pickImageFile();
      if (asset) {
        if (asset.width === 0 || asset.height === 0) {
          RNImage.getSize(
            asset.uri,
            (w, h) => addImages([{ ...asset, width: w, height: h }]),
            () => addImages([asset]),
          );
        } else {
          addImages([asset]);
        }
      }
    } catch (error) {
      console.error("Unable to open Files.", error);
      Alert.alert("Files unavailable", "Unable to open Files. Please try again.");
    } finally {
      mediaLaunchInProgressRef.current = false;
    }
  }, [canAddImages, addImages]);

  // --- Reminder ---

  const handleConfirmReminder = useCallback(
    async (selectedAt: number): Promise<void> => {
      if (selectedAt <= Date.now()) return;

      const capability = await requestReminderPermission();

      if (capability.status === "development-build-required") {
        Alert.alert(
          "Development build required",
          "Reminders require a Stow development build on this device. No reminder was added.",
          [{ text: "OK" }],
        );
        setShowReminderSheet(false);
        return;
      }

      if (capability.status === "permission-denied") {
        Alert.alert(
          "Notifications disabled",
          "Enable notifications for Stow in Settings so reminders can be delivered. You can still save the capture without a reminder.",
          [{ text: "OK" }],
        );
        return;
      }

      if (capability.status === "failed") {
        Alert.alert("Error", `Could not set up reminders: ${capability.error}`);
        return;
      }

      // Permission granted - store the timestamp; notification is scheduled after save.
      setDraftReminderAt(selectedAt);
      setShowReminderSheet(false);
    },
    [],
  );

  const handleRemoveReminder = useCallback(() => {
    // No notification to cancel - nothing has been scheduled yet at draft stage.
    setDraftReminderAt(null);
  }, []);

  // --- Save ---

  const onSave = useCallback(async () => {
    if (!saveEnabled) return;
    setSaving(true);
    setError(null);

    const permanentImages: ProcessedImage[] = [];
    const storedUris: string[] = [];
    const temporaryUris = images
      .filter((image) => !image.isStored)
      .map((image) => image.uri);

    try {
      for (const img of images) {
        const stored = await processAndStoreImage(img.uri, img.width, img.height);
        storedUris.push(stored.uri);
        permanentImages.push(stored);
      }
    } catch (err) {
      await Promise.all(storedUris.map((uri) => deleteStoredImage(uri)));
      setError(
        err instanceof Error ? err.message : "Unable to prepare images. Please try again.",
      );
      setSaving(false);
      return;
    }

    let capture: Capture;
    try {
      capture = await createCapture(
        db,
        trimmed.length > 0 ? trimmed : null,
        permanentImages,
        null,
        null,
      );
    } catch (err) {
      await Promise.all(storedUris.map((uri) => deleteStoredImage(uri)));
      setError(
        err instanceof Error ? err.message : "Unable to save. Please try again.",
      );
      setSaving(false);
      return;
    }

    images.forEach((image, index) => markStored(image.id, permanentImages[index]));
    await cleanupTempImages(temporaryUris);

    if (draftReminderAt !== null && draftReminderAt > Date.now()) {
      const result = await scheduleReminder(
        capture.id,
        draftReminderAt,
        capture.text,
        capture.images.length,
      );

      switch (result.status) {
        case "scheduled":
          try {
            await updateCaptureReminder(
              db,
              capture.id,
              draftReminderAt,
              result.notificationId,
            );
          } catch (error) {
            await cancelReminder(result.notificationId);
            console.error("Unable to persist reminder metadata.", error);
            Alert.alert(
              "Reminder not set",
              "The capture was saved without a reminder.",
            );
          }
          break;
        case "permission-denied":
        case "development-build-required":
          Alert.alert(
            "Reminder not set",
            "The capture was saved without a reminder.",
          );
          break;
        case "past-time":
          Alert.alert(
            "Reminder not set",
            "The capture was saved without a reminder because the selected time has passed.",
          );
          break;
        case "failed":
          Alert.alert(
            "Reminder not set",
            "The capture was saved without a reminder.",
          );
          break;
      }
    }

    setSaving(false);
    router.back();
  }, [
    saveEnabled,
    images,
    trimmed,
    draftReminderAt,
    db,
    markStored,
    router,
  ]);

  return (
    <AppScreen>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        {/* Header */}
        <View className="flex-row items-center justify-between px-4 py-3">
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Cancel"
            onPress={handleCancel}
            className="min-h-11 rounded-xl px-3 py-2 active:bg-surface-muted"
          >
            <Text className="font-sans text-foreground">Cancel</Text>
          </Pressable>
          <Text className="font-sans-semibold text-foreground">New capture</Text>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Save capture"
            onPress={onSave}
            disabled={!saveEnabled}
            className="min-h-11 rounded-xl border border-border-strong bg-accent px-4 py-2 active:bg-accent-pressed disabled:opacity-40"
          >
            <Text className="font-sans-medium text-on-accent">Save</Text>
          </Pressable>
        </View>

        {/* Editor */}
        <View className="mx-4 flex-1 overflow-hidden rounded-xl border border-border-strong bg-surface">
          <TextInput
            value={text}
            onChangeText={setText}
            multiline
            autoFocus
            textAlignVertical="top"
            placeholder="What do you want to remember?"
            placeholderTextColor={colors["foreground-muted"]}
            accessibilityLabel="Capture text"
            className="flex-1 p-4 font-sans text-foreground"
          />
        </View>

        {/* Draft reminder badge */}
        {draftReminderAt !== null && (
          <Pressable
            onPress={() => setShowReminderSheet(true)}
            accessibilityRole="button"
            accessibilityLabel={`Reminder: ${formatReminderTime(draftReminderAt)}. Tap to edit.`}
            className="mx-4 mt-2 flex-row items-center gap-2 rounded-xl bg-accent-soft px-4 py-2 active:opacity-80"
          >
            <Text className="flex-1 font-sans-medium text-sm text-accent" numberOfLines={1}>
              {formatReminderTime(draftReminderAt)}
            </Text>
            <Text className="font-sans text-sm text-accent">Edit</Text>
          </Pressable>
        )}

        {/* Attachment rail */}
        {images.length > 0 && (
          <AttachmentPreviewRail
            images={images.map((img) => ({ id: img.id, uri: img.uri }))}
            onRemoveImage={removeImage}
          />
        )}

        {error !== null && (
          <Text className="mx-4 mt-2 font-sans text-sm text-danger">{error}</Text>
        )}

        {/* Toolbar */}
        <ComposerToolbar
          reminderAt={draftReminderAt}
          onSetReminder={() => setShowReminderSheet(true)}
          onCamera={handleTakePhoto}
          onAttachment={handlePickFile}
          canAddImages={canAddImages}
        />

        {/* Reminder sheet */}
        <ReminderSheet
          visible={showReminderSheet}
          currentReminder={draftReminderAt}
          onConfirm={handleConfirmReminder}
          onRemove={handleRemoveReminder}
          onDismiss={() => setShowReminderSheet(false)}
        />

        {/* Discard confirmation */}
        <Modal
          visible={showDiscardConfirm}
          transparent
          animationType="fade"
          onRequestClose={() => setShowDiscardConfirm(false)}
        >
          <View className="flex-1 items-center justify-center bg-black/50">
            <View className="mx-6 rounded-2xl bg-surface px-6 py-6">
              <Text className="mb-2 font-sans-semibold text-lg text-foreground">
                Discard draft?
              </Text>
              <Text className="mb-6 font-sans text-foreground-muted">
                Your text, images, and reminder will not be saved.
              </Text>
              <View className="flex-row gap-3">
                <Pressable
                  onPress={() => setShowDiscardConfirm(false)}
                  accessibilityRole="button"
                  accessibilityLabel="Keep editing"
                  className="flex-1 min-h-12 items-center justify-center rounded-xl border border-border-strong active:bg-surface-muted"
                >
                  <Text className="font-sans-medium text-foreground">
                    Keep editing
                  </Text>
                </Pressable>
                <Pressable
                  onPress={handleConfirmDiscard}
                  accessibilityRole="button"
                  accessibilityLabel="Discard draft"
                  className="flex-1 min-h-12 items-center justify-center rounded-xl bg-danger active:opacity-80"
                >
                  <Text className="font-sans-medium text-on-danger">
                    Discard
                  </Text>
                </Pressable>
              </View>
            </View>
          </View>
        </Modal>
      </KeyboardAvoidingView>
    </AppScreen>
  );
}
