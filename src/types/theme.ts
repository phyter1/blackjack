export interface ThemeColors {
  // Table colors
  tableFelt: {
    start: string;
    end: string;
  };
  tableEdge: string;
  tableEdgeAccent: string;

  // Dashboard colors
  dashboardBackground: string;
  dashboardCard: string;
  dashboardCardBorder: string;
  dashboardAccent: string;

  // UI element colors
  primary: string;
  primaryForeground: string;
  secondary: string;
  secondaryForeground: string;
  accent: string;
  accentForeground: string;

  // Status colors
  success: string;
  warning: string;
  error: string;

  // Text colors
  textPrimary: string;
  textSecondary: string;
  textMuted: string;

  // Border and background
  border: string;
  background: string;
  foreground: string;
}

export interface Theme {
  id: string;
  name: string;
  description: string;
  colors: ThemeColors;
  isCustom?: boolean;
}

export type ThemePresetId =
  | "classic-vegas"
  | "blue-ocean"
  | "red-velvet"
  | "midnight"
  | "emerald"
  | "custom";
