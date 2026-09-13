import { Modal, Pressable, Text, View } from "react-native";
import { CLASSIFICATION_OPTIONS, type Classification } from "../../features/captures/capture";
import { StowIcon } from "../ui/stow-icon";
import { useCssVariables } from "../../hooks/useCssVariables";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface ClassificationSheetProps {
  visible: boolean;
  selected: Classification;
  onSelect: (classification: Classification) => void;
  onDismiss: () => void;
}

export function ClassificationSheet({
  visible,
  selected,
  onSelect,
  onDismiss,
}: ClassificationSheetProps) {
  const colors = useCssVariables();
  const insets = useSafeAreaInsets();
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onDismiss}>
      <Pressable
        className="absolute inset-0 bg-black/40"
        onPress={onDismiss}
        accessibilityLabel="Close classification sheet"
      />
      <View
        className="mt-auto rounded-t-3xl bg-surface"
        style={{ paddingBottom: Math.max(insets.bottom, 24) }}
      >
        <Text className="border-b border-border px-5 py-4 text-center font-sans-semibold text-lg text-foreground">
          Move to
        </Text>
        {CLASSIFICATION_OPTIONS.map((option) => {
          const isSelected = option.value === selected;
          return (
            <Pressable
              key={option.value}
              onPress={() => onSelect(option.value)}
              accessibilityRole="radio"
              accessibilityState={{ selected: isSelected }}
              className="min-h-12 flex-row items-center justify-between px-5 py-3 active:bg-accent-soft"
            >
              <Text className={isSelected ? "font-sans-medium text-accent" : "font-sans text-foreground"}>
                {option.label}
              </Text>
              {isSelected && <StowIcon name="check" size={20} color={colors.accent} />}
            </Pressable>
          );
        })}
      </View>
    </Modal>
  );
}
