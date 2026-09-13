import { useCallback, useState } from "react";
import type { ProcessedImage } from "../features/images/image-processor";
import { cleanupTempImages } from "../features/images/image-processor";

export interface DraftImage {
  id: string;
  uri: string;
  width: number;
  height: number;
  mimeType: string;
  isStored: boolean;
}

const MAX_IMAGES = 5;

export function useDraftAttachments() {
  const [images, setImages] = useState<DraftImage[]>([]);

  const initializeImages = useCallback((initial: DraftImage[]) => {
    setImages(initial);
  }, []);

  const addImages = useCallback(
    (incoming: Array<{ uri: string; width: number; height: number }>) => {
      setImages((current) => {
        const slots = MAX_IMAGES - current.length;
        if (slots <= 0) return current;
        const toAdd = incoming.slice(0, slots);
        return [
          ...current,
          ...toAdd.map((img, i) => ({
            id: `${Date.now()}-${current.length + i}`,
            uri: img.uri,
            width: img.width,
            height: img.height,
            mimeType: "image/jpeg",
            isStored: false,
          })),
        ];
      });
    },
    [],
  );

  const removeImage = useCallback((imageId: string) => {
    const image = images.find((candidate) => candidate.id === imageId);
    setImages((current) => current.filter((img) => img.id !== imageId));
    if (image && !image.isStored) {
      void cleanupTempImages([image.uri]).catch((error) => {
        console.error("Unable to clean up removed draft image.", error);
      });
    }
  }, [images]);

  const markStored = useCallback(
    (imageId: string, stored: ProcessedImage) => {
      setImages((current) =>
        current.map((img) =>
          img.id === imageId
            ? {
                ...img,
                uri: stored.uri,
                width: stored.width,
                height: stored.height,
                mimeType: stored.mimeType,
                isStored: true,
              }
            : img,
        ),
      );
    },
    [],
  );

  const clearAll = useCallback(async () => {
    const tempUris = images
      .filter((img) => !img.isStored)
      .map((img) => img.uri);
    await cleanupTempImages(tempUris);
    setImages([]);
  }, [images]);

  const canAddImages = images.length < MAX_IMAGES;

  return { images, addImages, removeImage, markStored, clearAll, canAddImages, initializeImages };
}
