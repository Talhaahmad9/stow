import { useColorScheme } from "react-native";

const LIGHT_COLORS = {
  background: "#F5F7FF",
  surface: "#FFFFFF",
  "surface-muted": "#EEF0FA",
  foreground: "#111827",
  "foreground-muted": "#626B7D",
  border: "#DDE1EE",
  "border-strong": "#778098",
  accent: "#5B5BD6",
  "accent-pressed": "#4848B8",
  "accent-soft": "#ECECFF",
  "on-accent": "#FFFFFF",
  danger: "#C43D4F",
  "danger-soft": "#FEEFF1",
  "on-danger": "#FFFFFF",
};

const DARK_COLORS = {
  background: "#0B1020",
  surface: "#12182A",
  "surface-muted": "#1A2238",
  foreground: "#F5F7FF",
  "foreground-muted": "#AAB3C5",
  border: "#2A344D",
  "border-strong": "#6A7695",
  accent: "#9896FF",
  "accent-pressed": "#8583E8",
  "accent-soft": "#25264A",
  "on-accent": "#0B1020",
  danger: "#FF7A8A",
  "danger-soft": "#3A1D29",
  "on-danger": "#1A0810",
};

/**
 * Get CSS variable values for use in native icon components.
 * Returns hex color values based on current theme.
 */
export function useCssVariables(): Record<string, string> {
  const scheme = useColorScheme();
  return scheme === "dark" ? DARK_COLORS : LIGHT_COLORS;
}
