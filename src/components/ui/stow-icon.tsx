import {
  Bell,
  Camera,
  Paperclip,
  X,
  type LucideIcon,
} from "lucide-react-native";
import type { ColorValue } from "react-native";

export type StowIconName = "bell" | "camera" | "paperclip" | "close";

interface StowIconProps {
  name: StowIconName;
  size?: number;
  color: ColorValue;
}

const ICONS: Record<StowIconName, LucideIcon> = {
  bell: Bell,
  camera: Camera,
  paperclip: Paperclip,
  close: X,
};

export function StowIcon({ name, size = 24, color }: StowIconProps) {
  const Icon = ICONS[name];

  return (
    <Icon
      size={size}
      color={String(color)}
      strokeWidth={2}
      pointerEvents="none"
    />
  );
}
