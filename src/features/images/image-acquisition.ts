import * as ImagePicker from "expo-image-picker";
import * as DocumentPicker from "expo-document-picker";

export interface ImageAsset {
  uri: string;
  width: number;
  height: number;
}

function toImageAsset(asset: { uri: string; width?: number; height?: number }): ImageAsset {
  return {
    uri: asset.uri,
    width: asset.width ?? 0,
    height: asset.height ?? 0,
  };
}

/**
 * Recover a camera result left by Android activity recreation.
 * This should run once when the capture screen mounts, not on button press.
 */
export async function recoverPendingCameraResult(): Promise<ImageAsset | null> {
  const pendingResult = await ImagePicker.getPendingResultAsync();
  if (
    pendingResult &&
    "canceled" in pendingResult &&
    !pendingResult.canceled &&
    "assets" in pendingResult
  ) {
    return toImageAsset(pendingResult.assets[0]);
  }

  return null;
}

/**
 * Request camera permissions and launch camera.
 */
export async function launchCamera(): Promise<ImageAsset | null> {
  const { status } = await ImagePicker.requestCameraPermissionsAsync();
  if (status !== "granted") {
    return null;
  }

  const result = await ImagePicker.launchCameraAsync({
    mediaTypes: ["images"],
    allowsEditing: false,
    quality: 1,
  });

  if (result.canceled) {
    return null;
  }

  return toImageAsset(result.assets[0]);
}

/**
 * Request library permissions and launch image gallery.
 * Allows multiple selection up to a limit.
 */
export async function launchGallery(maxCount: number = 5): Promise<ImageAsset[]> {
  const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (status !== "granted") {
    return [];
  }

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ["images"],
    allowsEditing: false,
    allowsMultipleSelection: true,
    quality: 1,
  });

  if (result.canceled) {
    return [];
  }

  return result.assets.slice(0, maxCount).map((asset) => ({
    uri: asset.uri,
    width: asset.width ?? 0,
    height: asset.height ?? 0,
  }));
}

/**
 * Launch document picker for image files only.
 */
export async function pickImageFile(): Promise<ImageAsset | null> {
  const result = await DocumentPicker.getDocumentAsync({
    type: "image/*",
    copyToCacheDirectory: true,
  });

  if (result.canceled) {
    return null;
  }

  const asset = result.assets[0];
  // For documents, we don't have width/height; they'll be 0 initially
  return {
    uri: asset.uri,
    width: 0,
    height: 0,
  };
}
