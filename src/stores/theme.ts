"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";
import { DEFAULT_THEME, THEME_PRESETS } from "@/lib/theme-presets";
import type { Theme, ThemeColors } from "@/types/theme";

const THEME_STORAGE_KEY = "blackjack-theme";

export interface ThemeState {
  theme: Theme;
}

export interface ThemeActions {
  setTheme: (theme: Theme) => void;
  setThemeById: (themeId: string) => void;
  updateThemeColors: (colors: Partial<ThemeColors>) => void;
  createCustomTheme: (name: string, colors: Partial<ThemeColors>) => void;
  resetTheme: () => void;
}

export type ThemeStore = ThemeState & ThemeActions;

/**
 * Apply theme by setting CSS custom properties on document root
 */
const applyThemeToDOM = (theme: Theme) => {
  if (typeof window === "undefined") return;

  const root = document.documentElement;

  // Table colors
  root.style.setProperty(
    "--theme-table-felt-start",
    theme.colors.tableFelt.start,
  );
  root.style.setProperty("--theme-table-felt-end", theme.colors.tableFelt.end);
  root.style.setProperty("--theme-table-edge", theme.colors.tableEdge);
  root.style.setProperty(
    "--theme-table-edge-accent",
    theme.colors.tableEdgeAccent,
  );

  // Dashboard colors
  root.style.setProperty(
    "--theme-dashboard-bg",
    theme.colors.dashboardBackground,
  );
  root.style.setProperty(
    "--theme-dashboard-card",
    theme.colors.dashboardCard,
  );
  root.style.setProperty(
    "--theme-dashboard-card-border",
    theme.colors.dashboardCardBorder,
  );
  root.style.setProperty(
    "--theme-dashboard-accent",
    theme.colors.dashboardAccent,
  );

  // UI colors
  root.style.setProperty("--theme-primary", theme.colors.primary);
  root.style.setProperty(
    "--theme-primary-foreground",
    theme.colors.primaryForeground,
  );
  root.style.setProperty("--theme-secondary", theme.colors.secondary);
  root.style.setProperty(
    "--theme-secondary-foreground",
    theme.colors.secondaryForeground,
  );
  root.style.setProperty("--theme-accent", theme.colors.accent);
  root.style.setProperty(
    "--theme-accent-foreground",
    theme.colors.accentForeground,
  );

  // Status colors
  root.style.setProperty("--theme-success", theme.colors.success);
  root.style.setProperty("--theme-warning", theme.colors.warning);
  root.style.setProperty("--theme-error", theme.colors.error);

  // Text colors
  root.style.setProperty("--theme-text-primary", theme.colors.textPrimary);
  root.style.setProperty(
    "--theme-text-secondary",
    theme.colors.textSecondary,
  );
  root.style.setProperty("--theme-text-muted", theme.colors.textMuted);

  // Border and background
  root.style.setProperty("--theme-border", theme.colors.border);
  root.style.setProperty("--theme-background", theme.colors.background);
  root.style.setProperty("--theme-foreground", theme.colors.foreground);
};

/**
 * Theme store with localStorage persistence and CSS variable injection
 */
export const useThemeStore = create<ThemeStore>()(
  persist(
    immer((set) => ({
      // State
      theme: DEFAULT_THEME,

      // Actions
      setTheme: (theme) =>
        set((state) => {
          state.theme = theme;
          applyThemeToDOM(theme);
        }),

      setThemeById: (themeId) =>
        set((state) => {
          const selectedTheme = THEME_PRESETS[themeId];
          if (selectedTheme) {
            state.theme = selectedTheme;
            applyThemeToDOM(selectedTheme);
          }
        }),

      updateThemeColors: (colors) =>
        set((state) => {
          const updatedTheme = {
            ...state.theme,
            colors: {
              ...state.theme.colors,
              ...colors,
            },
            isCustom: true,
          };
          state.theme = updatedTheme;
          applyThemeToDOM(updatedTheme);
        }),

      createCustomTheme: (name, colors) =>
        set((state) => {
          const baseTheme = state.theme;
          const customTheme: Theme = {
            id: "custom",
            name,
            description: "Custom theme",
            colors: {
              ...baseTheme.colors,
              ...colors,
            },
            isCustom: true,
          };
          state.theme = customTheme;
          applyThemeToDOM(customTheme);
        }),

      resetTheme: () =>
        set((state) => {
          state.theme = DEFAULT_THEME;
          applyThemeToDOM(DEFAULT_THEME);
        }),
    })),
    {
      name: THEME_STORAGE_KEY,
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        theme: state.theme,
      }),
      // Apply theme to DOM after rehydration
      onRehydrateStorage: () => (state) => {
        if (state?.theme) {
          applyThemeToDOM(state.theme);
        }
      },
    },
  ),
);

// Selectors for optimized re-renders
export const selectTheme = (state: ThemeStore) => state.theme;
export const selectThemeColors = (state: ThemeStore) => state.theme.colors;
export const selectIsCustomTheme = (state: ThemeStore) =>
  state.theme.isCustom === true;
export const selectThemeName = (state: ThemeStore) => state.theme.name;

// Helper to get all available theme presets
export const getAvailableThemes = () => Object.values(THEME_PRESETS);
