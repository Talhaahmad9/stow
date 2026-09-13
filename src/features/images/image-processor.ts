import { ImageManipulator, SaveFormat } from "expo-image-manipulator";
import { Directory, File, Paths } from "expo-file-system";

const COMPRESSION_QUALITY = 0.82;
const MAX_DIMENSION = 2048;

export interface ProcessedImage {
  uri: string;
  width: number;
  height: number;
  mimeType: "image/jpeg";
}

export async function processAndStoreImage(
  sourceUri: string,
  originalWidth: number,
  originalHeight: number,
): Promise<ProcessedImage> {
  const longestEdge = Math.max(originalWidth, originalHeight);
  const needsResize = longestEdge > MAX_DIMENSION;

  const ctx = ImageManipulator.manipulate(sourceUri);

  if (needsResize) {
    if (originalWidth >= originalHeight) {
      ctx.resize({ width: MAX_DIMENSION });
    } else {
      ctx.resize({ height: MAX_DIMENSION });
    }
  }

  const imageRef = await ctx.renderAsync();
  const result = await imageRef.saveAsync({
    format: SaveFormat.JPEG,
    compress: COMPRESSION_QUALITY,
  });

  const permanentUri = await moveToPermanentStorage(result.uri);

  const scale = needsResize ? MAX_DIMENSION / longestEdge : 1;
  return {
    uri: permanentUri,
    width: Math.round(originalWidth * scale),
    height: Math.round(originalHeight * scale),
    mimeType: "image/jpeg",
  };
}

async function moveToPermanentStorage(tempUri: string): Promise<string> {
  const imagesDir = new Directory(Paths.document, "images");
  if (!imagesDir.exists) {
    imagesDir.create({ intermediates: true });
  }

  const filename = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}.jpg`;
  const destFile = new File(imagesDir, filename);

  const tempFile = new File(tempUri);
  await tempFile.move(destFile);

  return destFile.uri;
}

export async function deleteStoredImage(uri: string): Promise<void> {
  try {
    const file = new File(uri);
    if (file.exists) {
      file.delete();
    }
  } catch (error) {
    console.error("Unable to delete stored image.", error);
  }
}

export async function cleanupTempImages(uris: string[]): Promise<void> {
  const cachePrefix = Paths.cache.uri;
  for (const uri of uris) {
    if (uri.startsWith(cachePrefix)) {
      try {
        const file = new File(uri);
        if (file.exists) {
          file.delete();
        }
      } catch (error) {
        console.error("Unable to clean up temporary image.", error);
      }
    }
  }
}
