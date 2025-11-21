import type { Theme } from "@/types/theme";

export const THEME_PRESETS: Record<string, Theme> = {
  "classic-vegas": {
    id: "classic-vegas",
    name: "Classic Vegas",
    description: "Traditional green felt with gold accents",
    colors: {
      // Table colors
      tableFelt: {
        start: "#1a472a",
        end: "#0f2f1a",
      },
      tableEdge: "#78350f",
      tableEdgeAccent: "#b45309",

      // Dashboard colors
      dashboardBackground: "#000000",
      dashboardCard: "#1a1a1a",
      dashboardCardBorder: "#333333",
      dashboardAccent: "#22c55e",

      // UI element colors
      primary: "#22c55e",
      primaryForeground: "#ffffff",
      secondary: "#78350f",
      secondaryForeground: "#ffffff",
      accent: "#f59e0b",
      accentForeground: "#000000",

      // Status colors
      success: "#22c55e",
      warning: "#f59e0b",
      error: "#ef4444",

      // Text colors
      textPrimary: "#ffffff",
      textSecondary: "#d1d5db",
      textMuted: "#9ca3af",

      // Border and background
      border: "#333333",
      background: "#000000",
      foreground: "#ffffff",
    },
  },
  "blue-ocean": {
    id: "blue-ocean",
    name: "Blue Ocean",
    description: "Cool blue felt with silver accents",
    colors: {
      // Table colors
      tableFelt: {
        start: "#1e3a5f",
        end: "#0f1d2e",
      },
      tableEdge: "#475569",
      tableEdgeAccent: "#94a3b8",

      // Dashboard colors
      dashboardBackground: "#0a0f1a",
      dashboardCard: "#1e293b",
      dashboardCardBorder: "#334155",
      dashboardAccent: "#3b82f6",

      // UI element colors
      primary: "#3b82f6",
      primaryForeground: "#ffffff",
      secondary: "#475569",
      secondaryForeground: "#ffffff",
      accent: "#60a5fa",
      accentForeground: "#000000",

      // Status colors
      success: "#10b981",
      warning: "#f59e0b",
      error: "#ef4444",

      // Text colors
      textPrimary: "#f1f5f9",
      textSecondary: "#cbd5e1",
      textMuted: "#94a3b8",

      // Border and background
      border: "#334155",
      background: "#0a0f1a",
      foreground: "#f1f5f9",
    },
  },
  "red-velvet": {
    id: "red-velvet",
    name: "Red Velvet",
    description: "Luxurious red felt with gold trim",
    colors: {
      // Table colors
      tableFelt: {
        start: "#7f1d1d",
        end: "#450a0a",
      },
      tableEdge: "#78350f",
      tableEdgeAccent: "#fbbf24",

      // Dashboard colors
      dashboardBackground: "#0a0000",
      dashboardCard: "#1a0a0a",
      dashboardCardBorder: "#4a1a1a",
      dashboardAccent: "#dc2626",

      // UI element colors
      primary: "#dc2626",
      primaryForeground: "#ffffff",
      secondary: "#78350f",
      secondaryForeground: "#ffffff",
      accent: "#fbbf24",
      accentForeground: "#000000",

      // Status colors
      success: "#22c55e",
      warning: "#f59e0b",
      error: "#dc2626",

      // Text colors
      textPrimary: "#fef2f2",
      textSecondary: "#fecaca",
      textMuted: "#fca5a5",

      // Border and background
      border: "#4a1a1a",
      background: "#0a0000",
      foreground: "#fef2f2",
    },
  },
  midnight: {
    id: "midnight",
    name: "Midnight",
    description: "Dark purple felt with violet accents",
    colors: {
      // Table colors
      tableFelt: {
        start: "#3b0764",
        end: "#1e1b4b",
      },
      tableEdge: "#4c1d95",
      tableEdgeAccent: "#7c3aed",

      // Dashboard colors
      dashboardBackground: "#0a0014",
      dashboardCard: "#1a0f2e",
      dashboardCardBorder: "#312e81",
      dashboardAccent: "#8b5cf6",

      // UI element colors
      primary: "#8b5cf6",
      primaryForeground: "#ffffff",
      secondary: "#4c1d95",
      secondaryForeground: "#ffffff",
      accent: "#a78bfa",
      accentForeground: "#000000",

      // Status colors
      success: "#22c55e",
      warning: "#f59e0b",
      error: "#ef4444",

      // Text colors
      textPrimary: "#faf5ff",
      textSecondary: "#e9d5ff",
      textMuted: "#c4b5fd",

      // Border and background
      border: "#312e81",
      background: "#0a0014",
      foreground: "#faf5ff",
    },
  },
  emerald: {
    id: "emerald",
    name: "Emerald Night",
    description: "Deep emerald felt with teal highlights",
    colors: {
      // Table colors
      tableFelt: {
        start: "#064e3b",
        end: "#022c22",
      },
      tableEdge: "#0f766e",
      tableEdgeAccent: "#14b8a6",

      // Dashboard colors
      dashboardBackground: "#000a08",
      dashboardCard: "#0a1a17",
      dashboardCardBorder: "#134e4a",
      dashboardAccent: "#14b8a6",

      // UI element colors
      primary: "#14b8a6",
      primaryForeground: "#ffffff",
      secondary: "#0f766e",
      secondaryForeground: "#ffffff",
      accent: "#2dd4bf",
      accentForeground: "#000000",

      // Status colors
      success: "#10b981",
      warning: "#f59e0b",
      error: "#ef4444",

      // Text colors
      textPrimary: "#f0fdfa",
      textSecondary: "#ccfbf1",
      textMuted: "#99f6e4",

      // Border and background
      border: "#134e4a",
      background: "#000a08",
      foreground: "#f0fdfa",
    },
  },
  "pearl-white": {
    id: "pearl-white",
    name: "Pearl White",
    description: "Elegant white felt with gold trim",
    colors: {
      // Table colors
      tableFelt: {
        start: "#f8fafc",
        end: "#e2e8f0",
      },
      tableEdge: "#b45309",
      tableEdgeAccent: "#f59e0b",

      // Dashboard colors
      dashboardBackground: "#ffffff",
      dashboardCard: "#f8fafc",
      dashboardCardBorder: "#e2e8f0",
      dashboardAccent: "#d97706",

      // UI element colors
      primary: "#d97706",
      primaryForeground: "#ffffff",
      secondary: "#64748b",
      secondaryForeground: "#ffffff",
      accent: "#f59e0b",
      accentForeground: "#ffffff",

      // Status colors
      success: "#16a34a",
      warning: "#ea580c",
      error: "#dc2626",

      // Text colors
      textPrimary: "#0f172a",
      textSecondary: "#475569",
      textMuted: "#64748b",

      // Border and background
      border: "#cbd5e1",
      background: "#ffffff",
      foreground: "#0f172a",
    },
  },
  "mint-fresh": {
    id: "mint-fresh",
    name: "Mint Fresh",
    description: "Light mint green with teal accents",
    colors: {
      // Table colors
      tableFelt: {
        start: "#d1fae5",
        end: "#a7f3d0",
      },
      tableEdge: "#0d9488",
      tableEdgeAccent: "#14b8a6",

      // Dashboard colors
      dashboardBackground: "#f0fdfa",
      dashboardCard: "#ccfbf1",
      dashboardCardBorder: "#99f6e4",
      dashboardAccent: "#0f766e",

      // UI element colors
      primary: "#0d9488",
      primaryForeground: "#ffffff",
      secondary: "#059669",
      secondaryForeground: "#ffffff",
      accent: "#14b8a6",
      accentForeground: "#ffffff",

      // Status colors
      success: "#16a34a",
      warning: "#ea580c",
      error: "#dc2626",

      // Text colors
      textPrimary: "#064e3b",
      textSecondary: "#065f46",
      textMuted: "#047857",

      // Border and background
      border: "#5eead4",
      background: "#f0fdfa",
      foreground: "#064e3b",
    },
  },
  "sunset-sky": {
    id: "sunset-sky",
    name: "Sunset Sky",
    description: "Warm peach and cream with coral highlights",
    colors: {
      // Table colors
      tableFelt: {
        start: "#fff7ed",
        end: "#fed7aa",
      },
      tableEdge: "#c2410c",
      tableEdgeAccent: "#ea580c",

      // Dashboard colors
      dashboardBackground: "#fffbeb",
      dashboardCard: "#fef3c7",
      dashboardCardBorder: "#fde68a",
      dashboardAccent: "#d97706",

      // UI element colors
      primary: "#ea580c",
      primaryForeground: "#ffffff",
      secondary: "#d97706",
      secondaryForeground: "#ffffff",
      accent: "#f59e0b",
      accentForeground: "#ffffff",

      // Status colors
      success: "#16a34a",
      warning: "#ea580c",
      error: "#dc2626",

      // Text colors
      textPrimary: "#78350f",
      textSecondary: "#92400e",
      textMuted: "#b45309",

      // Border and background
      border: "#fbbf24",
      background: "#fffbeb",
      foreground: "#78350f",
    },
  },
};

export const DEFAULT_THEME = THEME_PRESETS["classic-vegas"];
