"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { DEFAULT_SETTINGS, type GameSettings } from "@/types/settings";

const SETTINGS_STORAGE_KEY = "blackjack-settings";

interface SettingsContextValue {
  settings: GameSettings;
  updateSettings: (updates: Partial<GameSettings>) => void;
  updateAnimationSettings: (updates: Partial<GameSettings["animations"]>) => void;
  resetSettings: () => void;
}

const SettingsContext = createContext<SettingsContextValue | undefined>(undefined);

/**
 * Load settings from localStorage
 */
function loadSettings(): GameSettings {
  if (typeof window === "undefined") {
    return DEFAULT_SETTINGS;
  }

  try {
    const stored = localStorage.getItem(SETTINGS_STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored) as GameSettings;
      // Merge with defaults to ensure all properties exist
      return {
        ...DEFAULT_SETTINGS,
        ...parsed,
        animations: {
          ...DEFAULT_SETTINGS.animations,
          ...parsed.animations,
        },
      };
    }
  } catch (error) {
    console.error("Failed to load settings:", error);
  }

  return DEFAULT_SETTINGS;
}

/**
 * Save settings to localStorage
 */
function saveSettings(settings: GameSettings): void {
  if (typeof window === "undefined") {
    return;
  }

  try {
    localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
  } catch (error) {
    console.error("Failed to save settings:", error);
  }
}

/**
 * Settings provider component
 */
export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<GameSettings>(loadSettings);

  // Save to localStorage whenever settings change
  useEffect(() => {
    saveSettings(settings);
  }, [settings]);

  const updateSettings = (updates: Partial<GameSettings>) => {
    setSettings(prev => ({
      ...prev,
      ...updates,
    }));
  };

  const updateAnimationSettings = (updates: Partial<GameSettings["animations"]>) => {
    setSettings(prev => ({
      ...prev,
      animations: {
        ...prev.animations,
        ...updates,
      },
    }));
  };

  const resetSettings = () => {
    setSettings(DEFAULT_SETTINGS);
  };

  return (
    <SettingsContext.Provider
      value={{
        settings,
        updateSettings,
        updateAnimationSettings,
        resetSettings,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
}

/**
 * Hook to access game settings
 */
export function useSettings() {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error("useSettings must be used within a SettingsProvider");
  }
  return context;
}