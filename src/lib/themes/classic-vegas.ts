import type { Theme } from "@/types/theme";

export const classicVegas: Theme = {
  id: "classic-vegas",
  name: "Classic Vegas",
  description: "Traditional green felt with gold accents",
  colors: {
    tableFelt: {
      start: "#1a472a",
      end: "#0f2f1a",
    },
    tableEdge: "#78350f",
    tableEdgeAccent: "#b45309",
    dashboardBackground: "#000000",
    dashboardCard: "#1a1a1a",
    dashboardCardBorder: "#333333",
    dashboardAccent: "#22c55e",
    primary: "#22c55e",
    primaryForeground: "#ffffff",
    secondary: "#78350f",
    secondaryForeground: "#ffffff",
    accent: "#f59e0b",
    accentForeground: "#000000",
    success: "#22c55e",
    warning: "#f59e0b",
    error: "#ef4444",
    textPrimary: "#ffffff",
    textSecondary: "#d1d5db",
    textMuted: "#9ca3af",
    border: "#333333",
    background: "#000000",
    foreground: "#ffffff",
    cards: {
      stock: {
        color: "#1a1a1a",
      },
      back: {
        design: "bicycle-classic",
        gradient: {
          start: "#7C2D12",
          middle: "#991B1B",
          end: "#7C2D12",
        },
        border: "#78350f",
        patternColor: "#fbbf24",
        medallionBorder: "#fbbf24",
        medallionBackground: "#78350f",
        medallionSymbol: "#fbbf24",
      },
      face: {
        background: "#fffbeb",
        border: "#78350f",
        fontFamily: "serif",
      },
    },
  },
};
