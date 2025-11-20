import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";
import { DEFAULT_SETTINGS, type GameSettings } from "@/types/settings";

const SETTINGS_STORAGE_KEY = "blackjack-settings";

export interface SettingsState {
  settings: GameSettings;
}

export interface SettingsActions {
  updateSettings: (updates: Partial<GameSettings>) => void;
  updateAnimationSettings: (
    updates: Partial<GameSettings["animations"]>,
  ) => void;
  updateTableLimits: (updates: Partial<GameSettings["tableLimits"]>) => void;
  resetSettings: () => void;
}

export type SettingsStore = SettingsState & SettingsActions;

/**
 * Settings store with localStorage persistence
 * Replaces the SettingsProvider context
 */
export const useSettingsStore = create<SettingsStore>()(
  persist(
    immer((set) => ({
      // State
      settings: DEFAULT_SETTINGS,

      // Actions
      updateSettings: (updates) =>
        set((state) => {
          state.settings = {
            ...state.settings,
            ...updates,
          };
        }),

      updateAnimationSettings: (updates) =>
        set((state) => {
          state.settings.animations = {
            ...state.settings.animations,
            ...updates,
          };
        }),

      updateTableLimits: (updates) =>
        set((state) => {
          state.settings.tableLimits = {
            ...state.settings.tableLimits,
            ...updates,
          };
        }),

      resetSettings: () =>
        set((state) => {
          state.settings = DEFAULT_SETTINGS;
        }),
    })),
    {
      name: SETTINGS_STORAGE_KEY,
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        settings: state.settings,
      }),
      // Migration function to handle old settings without tableLimits
      migrate: (persistedState: unknown, version: number) => {
        const state = persistedState as SettingsState;

        // If tableLimits is missing, add it from defaults
        if (state?.settings && !state.settings.tableLimits) {
          return {
            ...state,
            settings: {
              ...state.settings,
              tableLimits: DEFAULT_SETTINGS.tableLimits,
            },
          };
        }

        return state as SettingsState;
      },
      version: 1,
    },
  ),
);

// Selectors for optimized re-renders
export const selectSettings = (state: SettingsStore) => state.settings;
export const selectAnimationSettings = (state: SettingsStore) =>
  state.settings.animations;
export const selectEnableAnimations = (state: SettingsStore) =>
  state.settings.animations.enableAnimations;
export const selectDealingSpeed = (state: SettingsStore) =>
  state.settings.animations.dealingSpeed;
export const selectTableLimits = (state: SettingsStore) =>
  state.settings.tableLimits;
