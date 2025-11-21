"use client";

import { Check } from "lucide-react";
import { getAvailableThemes, useThemeStore } from "@/stores/theme";
import { cn } from "@/lib/utils";
import { Button } from "../ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";

export function ThemeSelector() {
  const theme = useThemeStore((state) => state.theme);
  const setThemeById = useThemeStore((state) => state.setThemeById);
  const availableThemes = getAvailableThemes();

  return (
    <Card className="bg-[var(--theme-dashboard-card)] border-[var(--theme-dashboard-card-border)]">
      <CardHeader>
        <CardTitle className="text-[var(--theme-text-primary)]">
          Theme Selection
        </CardTitle>
        <CardDescription className="text-[var(--theme-text-muted)]">
          Choose a theme for your casino experience
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {availableThemes.map((availableTheme) => (
            <button
              key={availableTheme.id}
              type="button"
              onClick={() => setThemeById(availableTheme.id)}
              className={cn(
                "relative p-4 rounded-lg border-2 transition-all",
                "hover:scale-105 cursor-pointer",
                theme.id === availableTheme.id
                  ? "border-[var(--theme-primary)] bg-[var(--theme-primary)]/10"
                  : "border-[var(--theme-border)] hover:border-[var(--theme-primary)]/50",
              )}
            >
              {/* Theme preview */}
              <div className="mb-3 h-24 rounded-md overflow-hidden border border-gray-700">
                {/* Table felt preview */}
                <div
                  className="h-16"
                  style={{
                    background: `radial-gradient(ellipse at center, ${availableTheme.colors.tableFelt.start}, ${availableTheme.colors.tableFelt.end})`,
                  }}
                />
                {/* Accent bar */}
                <div
                  className="h-8 flex items-center justify-center gap-2"
                  style={{
                    background: availableTheme.colors.dashboardCard,
                  }}
                >
                  <div
                    className="w-4 h-4 rounded-full"
                    style={{ background: availableTheme.colors.primary }}
                  />
                  <div
                    className="w-4 h-4 rounded-full"
                    style={{ background: availableTheme.colors.accent }}
                  />
                  <div
                    className="w-4 h-4 rounded-full"
                    style={{ background: availableTheme.colors.secondary }}
                  />
                </div>
              </div>

              {/* Theme name and description */}
              <div className="text-left">
                <div className="font-semibold text-[var(--theme-text-primary)] flex items-center justify-between">
                  {availableTheme.name}
                  {theme.id === availableTheme.id && (
                    <Check
                      className="h-5 w-5"
                      style={{ color: "var(--theme-primary)" }}
                    />
                  )}
                </div>
                <div className="text-sm text-[var(--theme-text-muted)] mt-1">
                  {availableTheme.description}
                </div>
              </div>
            </button>
          ))}
        </div>

        {theme.isCustom && (
          <div className="mt-4 p-3 rounded-md bg-[var(--theme-primary)]/10 border border-[var(--theme-primary)]/30">
            <p className="text-sm text-[var(--theme-text-secondary)]">
              You are using a custom theme: <strong>{theme.name}</strong>
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
