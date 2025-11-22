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

      // Card theme
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

      // Card theme
      cards: {
        stock: {
          color: "#1e293b",
        },
        back: {
          design: "geometric-hexagons",
          gradient: {
            start: "#1e3a8a",
            middle: "#1e40af",
            end: "#1e3a8a",
          },
          border: "#475569",
          patternColor: "#93c5fd",
          medallionBorder: "#93c5fd",
          medallionBackground: "#1e40af",
          medallionSymbol: "#bfdbfe",
        },
        face: {
          background: "#f0f9ff",
          border: "#334155",
          fontFamily: "serif",
        },
      },
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

      // Card theme
      cards: {
        stock: {
          color: "#1a1a1a",
        },
        back: {
          design: "art-deco-sunburst",
          gradient: {
            start: "#7f1d1d",
            middle: "#991b1b",
            end: "#7f1d1d",
          },
          border: "#78350f",
          patternColor: "#fbbf24",
          medallionBorder: "#fbbf24",
          medallionBackground: "#991b1b",
          medallionSymbol: "#fde68a",
        },
        face: {
          background: "#fffbeb",
          border: "#78350f",
          fontFamily: "serif",
        },
      },
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

      // Card theme
      cards: {
        stock: {
          color: "#0a0a0a",
        },
        back: {
          design: "minimal-dots",
          gradient: {
            start: "#4c1d95",
            middle: "#6d28d9",
            end: "#4c1d95",
          },
          border: "#7c3aed",
          patternColor: "#c4b5fd",
          medallionBorder: "#c4b5fd",
          medallionBackground: "#5b21b6",
          medallionSymbol: "#e9d5ff",
        },
        face: {
          background: "#faf5ff",
          border: "#4c1d95",
          fontFamily: "serif",
        },
      },
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

      // Card theme
      cards: {
        stock: {
          color: "#064e3b",
        },
        back: {
          design: "chevron",
          gradient: {
            start: "#115e59",
            middle: "#0f766e",
            end: "#115e59",
          },
          border: "#14b8a6",
          patternColor: "#5eead4",
          medallionBorder: "#5eead4",
          medallionBackground: "#0d9488",
          medallionSymbol: "#99f6e4",
        },
        face: {
          background: "#f0fdfa",
          border: "#0f766e",
          fontFamily: "serif",
        },
      },
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

      // Card theme
      cards: {
        stock: {
          color: "#f5f5f4",
        },
        back: {
          design: "solid",
          gradient: {
            start: "#cbd5e1",
            middle: "#94a3b8",
            end: "#cbd5e1",
          },
          border: "#64748b",
          patternColor: "#f59e0b",
          medallionBorder: "#f59e0b",
          medallionBackground: "#e2e8f0",
          medallionSymbol: "#d97706",
        },
        face: {
          background: "#ffffff",
          border: "#64748b",
          fontFamily: "serif",
        },
      },
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

      // Card theme
      cards: {
        stock: {
          color: "#ecfdf5",
        },
        back: {
          design: "geometric-hexagons",
          gradient: {
            start: "#99f6e4",
            middle: "#5eead4",
            end: "#99f6e4",
          },
          border: "#0d9488",
          patternColor: "#0f766e",
          medallionBorder: "#0f766e",
          medallionBackground: "#ccfbf1",
          medallionSymbol: "#0d9488",
        },
        face: {
          background: "#f0fdfa",
          border: "#0d9488",
          fontFamily: "serif",
        },
      },
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

      // Card theme
      cards: {
        stock: {
          color: "#1a1a1a",
        },
        back: {
          design: "art-deco-sunburst",
          gradient: {
            start: "#fed7aa",
            middle: "#fdba74",
            end: "#fed7aa",
          },
          border: "#c2410c",
          patternColor: "#ea580c",
          medallionBorder: "#ea580c",
          medallionBackground: "#fef3c7",
          medallionSymbol: "#c2410c",
        },
        face: {
          background: "#fffbeb",
          border: "#c2410c",
          fontFamily: "serif",
        },
      },
    },
  },
  "royal-blue": {
    id: "royal-blue",
    name: "Royal Blue",
    description: "Classic blue card back with ornate design",
    colors: {
      // Table colors
      tableFelt: {
        start: "#1e3a8a",
        end: "#1e40af",
      },
      tableEdge: "#1e40af",
      tableEdgeAccent: "#3b82f6",

      // Dashboard colors
      dashboardBackground: "#0a0f1a",
      dashboardCard: "#1e293b",
      dashboardCardBorder: "#334155",
      dashboardAccent: "#3b82f6",

      // UI element colors
      primary: "#3b82f6",
      primaryForeground: "#ffffff",
      secondary: "#1e40af",
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

      // Card theme
      cards: {
        stock: {
          color: "#1e3a8a",
        },
        back: {
          design: "svg-01",
          gradient: {
            start: "#1e3a8a",
            middle: "#1e40af",
            end: "#1e3a8a",
          },
          border: "#1e40af",
          patternColor: "#3b82f6",
          medallionBorder: "#3b82f6",
          medallionBackground: "#1e40af",
          medallionSymbol: "#60a5fa",
        },
        face: {
          background: "#ffffff",
          border: "#1e40af",
          fontFamily: "serif",
        },
      },
    },
  },
  "crimson-red": {
    id: "crimson-red",
    name: "Crimson Red",
    description: "Bold red card back with classic pattern",
    colors: {
      // Table colors
      tableFelt: {
        start: "#7f1d1d",
        end: "#450a0a",
      },
      tableEdge: "#991b1b",
      tableEdgeAccent: "#dc2626",

      // Dashboard colors
      dashboardBackground: "#0a0000",
      dashboardCard: "#1a0a0a",
      dashboardCardBorder: "#4a1a1a",
      dashboardAccent: "#dc2626",

      // UI element colors
      primary: "#dc2626",
      primaryForeground: "#ffffff",
      secondary: "#991b1b",
      secondaryForeground: "#ffffff",
      accent: "#ef4444",
      accentForeground: "#ffffff",

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

      // Card theme
      cards: {
        stock: {
          color: "#7f1d1d",
        },
        back: {
          design: "svg-02",
          gradient: {
            start: "#7f1d1d",
            middle: "#991b1b",
            end: "#7f1d1d",
          },
          border: "#991b1b",
          patternColor: "#dc2626",
          medallionBorder: "#dc2626",
          medallionBackground: "#991b1b",
          medallionSymbol: "#ef4444",
        },
        face: {
          background: "#ffffff",
          border: "#991b1b",
          fontFamily: "serif",
        },
      },
    },
  },
  "forest-green": {
    id: "forest-green",
    name: "Forest Green",
    description: "Traditional green card back design",
    colors: {
      // Table colors
      tableFelt: {
        start: "#14532d",
        end: "#052e16",
      },
      tableEdge: "#166534",
      tableEdgeAccent: "#16a34a",

      // Dashboard colors
      dashboardBackground: "#000a05",
      dashboardCard: "#0a1a0f",
      dashboardCardBorder: "#14532d",
      dashboardAccent: "#16a34a",

      // UI element colors
      primary: "#16a34a",
      primaryForeground: "#ffffff",
      secondary: "#166534",
      secondaryForeground: "#ffffff",
      accent: "#22c55e",
      accentForeground: "#ffffff",

      // Status colors
      success: "#22c55e",
      warning: "#f59e0b",
      error: "#ef4444",

      // Text colors
      textPrimary: "#f0fdf4",
      textSecondary: "#dcfce7",
      textMuted: "#bbf7d0",

      // Border and background
      border: "#14532d",
      background: "#000a05",
      foreground: "#f0fdf4",

      // Card theme
      cards: {
        stock: {
          color: "#14532d",
        },
        back: {
          design: "svg-05",
          gradient: {
            start: "#14532d",
            middle: "#166534",
            end: "#14532d",
          },
          border: "#166534",
          patternColor: "#16a34a",
          medallionBorder: "#16a34a",
          medallionBackground: "#166534",
          medallionSymbol: "#22c55e",
        },
        face: {
          background: "#ffffff",
          border: "#166534",
          fontFamily: "serif",
        },
      },
    },
  },
};

export const DEFAULT_THEME = THEME_PRESETS["classic-vegas"];
