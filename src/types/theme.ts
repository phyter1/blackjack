import type { CardBackDesign } from "@/lib/cards";

export interface CardTheme {
  // Card stock (outer edge visible on both front and back)
  stock: {
    color: string; // Outer border color visible around the card
  };
  // Card back design
  back: {
    design: CardBackDesign;
    gradient: {
      start: string;
      middle: string;
      end: string;
    };
    border: string;
    patternColor: string;
    medallionBorder: string;
    medallionBackground: string;
    medallionSymbol: string;
  };
  // Card face design
  face: {
    background: string;
    border: string;
    fontFamily: string;
  };
}

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

  // Card theme
  cards: CardTheme;
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
