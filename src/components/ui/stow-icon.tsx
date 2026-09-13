import {
  Bell,
  Check,
  ChevronDown,
  Camera,
  Inbox,
  Paperclip,
  Pencil,
  SquarePen,
  Trash2,
  X,
  type LucideIcon,
} from "lucide-react-native";
import type { ColorValue } from "react-native";

export type StowIconName =
  | "bell"
  | "camera"
  | "paperclip"
  | "close"
  | "square-pen"
  | "inbox"
  | "pencil"
  | "check"
  | "chevron-down"
  | "trash-2";

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
  "square-pen": SquarePen,
  inbox: Inbox,
  pencil: Pencil,
  check: Check,
  "chevron-down": ChevronDown,
  "trash-2": Trash2,
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
