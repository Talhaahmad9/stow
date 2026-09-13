import React from "react";
import { FlatList, Pressable, View } from "react-native";
import { Image } from "expo-image";
import { StowIcon } from "../ui/stow-icon";
import { useCssVariables } from "../../hooks/useCssVariables";

interface ThumbnailProps {
  id: string;
  uri: string;
  onRemove: (id: string) => void;
}

function Thumbnail({ id, uri, onRemove }: ThumbnailProps) {
  const colors = useCssVariables();
  return (
    <View>
      <Image
        source={{ uri }}
        style={{ width: 96, height: 96 }}
        className="rounded-xl bg-surface-muted"
        contentFit="cover"
        accessibilityLabel="Draft image"
      />
      <Pressable
        onPress={() => onRemove(id)}
        accessibilityRole="button"
        accessibilityLabel="Remove image"
        style={{ position: "absolute", top: -6, right: -6 }}
        className="h-7 w-7 items-center justify-center rounded-full bg-danger active:opacity-80"
      >
        <StowIcon name="close" size={14} color={colors["on-danger"]} />
      </Pressable>
    </View>
  );
}

export interface AttachmentPreviewRailProps {
  images: Array<{ id: string; uri: string }>;
  onRemoveImage: (id: string) => void;
}

export function AttachmentPreviewRail({
  images,
  onRemoveImage,
}: AttachmentPreviewRailProps) {
  if (images.length === 0) return null;

  return (
    <FlatList
      data={images}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <View className="mr-3 mt-3">
          <Thumbnail id={item.id} uri={item.uri} onRemove={onRemoveImage} />
        </View>
      )}
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ paddingHorizontal: 16 }}
    />
  );
}
