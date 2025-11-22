"use client";

import { useEffect } from "react";
import { useThemeStore } from "@/stores/theme";

/**
 * Client component that initializes the theme store on mount.
 * This ensures the CSS variables are applied on initial page load.
 */
export function ThemeInitializer() {
  const theme = useThemeStore((state) => state.theme);

  useEffect(() => {
    // The theme will be applied via the store's onRehydrateStorage callback,
    // but this ensures it happens even if there's no stored theme
    const root = document.documentElement;

    // Apply theme CSS variables
    root.style.setProperty(
      "--theme-table-felt-start",
      theme.colors.tableFelt.start,
    );
    root.style.setProperty(
      "--theme-table-felt-end",
      theme.colors.tableFelt.end,
    );
    root.style.setProperty("--theme-table-edge", theme.colors.tableEdge);
    root.style.setProperty(
      "--theme-table-edge-accent",
      theme.colors.tableEdgeAccent,
    );
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
    root.style.setProperty("--theme-success", theme.colors.success);
    root.style.setProperty("--theme-warning", theme.colors.warning);
    root.style.setProperty("--theme-error", theme.colors.error);
    root.style.setProperty("--theme-text-primary", theme.colors.textPrimary);
    root.style.setProperty(
      "--theme-text-secondary",
      theme.colors.textSecondary,
    );
    root.style.setProperty("--theme-text-muted", theme.colors.textMuted);
    root.style.setProperty("--theme-border", theme.colors.border);
    root.style.setProperty("--theme-background", theme.colors.background);
    root.style.setProperty("--theme-foreground", theme.colors.foreground);
  }, [theme]);

  return null;
}
