"use client";

import { useState } from "react";
import { PresetService } from "@/services/preset-service";
import type { RulesPreset } from "@/types/preset";
import type { TableRules } from "@/types/user";
import { Button } from "./ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";

interface PresetSelectorProps {
  onSelectPreset: (rules: TableRules) => void;
  onCustomGame: () => void;
  onCancel: () => void;
}

export function PresetSelector({
  onSelectPreset,
  onCustomGame,
  onCancel,
}: PresetSelectorProps) {
  const [presets] = useState<RulesPreset[]>(PresetService.getAllPresets());

  const handleSelectPreset = (preset: RulesPreset) => {
    onSelectPreset(preset.rules);
  };

  const getPresetColor = (preset: RulesPreset) => {
    const minBet = preset.rules.minBet || 5;
    if (minBet >= 100) return "border-purple-500 bg-purple-950/20";
    if (minBet >= 25) return "border-yellow-500 bg-yellow-950/20";
    if (minBet >= 10) return "border-blue-500 bg-blue-950/20";
    return "border-green-500 bg-green-950/20";
  };

  const builtInPresets = presets.filter((p) => p.isBuiltIn);
  const customPresets = presets.filter((p) => !p.isBuiltIn);

  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-50 p-4"
      style={{ background: "rgba(0, 0, 0, 0.8)" }}
    >
      <Card
        className="max-w-4xl w-full max-h-[90vh] flex flex-col"
        style={{
          background: "var(--theme-dashboard-card)",
          borderColor: "var(--theme-accent)",
        }}
      >
        <CardHeader className="flex-shrink-0">
          <CardTitle
            className="text-2xl"
            style={{ color: "var(--theme-accent)" }}
          >
            Select Table Rules
          </CardTitle>
          <CardDescription
            className="text-lg"
            style={{ color: "var(--theme-text-secondary)" }}
          >
            Choose a preset to quick-start your game
          </CardDescription>
        </CardHeader>

        <CardContent className="overflow-y-auto flex-1 space-y-6">
          {/* Built-in Presets */}
          <div>
            <h3
              className="text-lg font-semibold mb-3"
              style={{ color: "var(--theme-text-primary)" }}
            >
              Standard Tables
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {builtInPresets.map((preset) => (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => handleSelectPreset(preset)}
                  className={`text-left p-4 rounded-lg border-2 transition-all hover:scale-105 ${getPresetColor(preset)} hover:shadow-lg`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <h4
                      className="font-bold text-lg"
                      style={{ color: "var(--theme-text-primary)" }}
                    >
                      {preset.name}
                    </h4>
                    <div
                      className="text-xs"
                      style={{ color: "var(--theme-text-muted)" }}
                    >
                      {preset.rules.deckCount}D •{" "}
                      {preset.rules.dealerStand.toUpperCase()}
                    </div>
                  </div>
                  <p
                    className="text-sm mb-3"
                    style={{ color: "var(--theme-text-secondary)" }}
                  >
                    {preset.description}
                  </p>
                  <div
                    className="flex items-center gap-2 text-xs"
                    style={{ color: "var(--theme-text-muted)" }}
                  >
                    <span
                      className="px-2 py-1 rounded"
                      style={{ background: "rgba(0, 0, 0, 0.3)" }}
                    >
                      ${preset.rules.minBet}-${preset.rules.maxBet}
                    </span>
                    <span
                      className="px-2 py-1 rounded"
                      style={{ background: "rgba(0, 0, 0, 0.3)" }}
                    >
                      {preset.rules.blackjackPayout} BJ
                    </span>
                    {preset.rules.surrender !== "none" && (
                      <span
                        className="px-2 py-1 rounded"
                        style={{ background: "rgba(0, 0, 0, 0.3)" }}
                      >
                        {preset.rules.surrender === "late" ? "LS" : "ES"}
                      </span>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Custom Presets */}
          {customPresets.length > 0 && (
            <div>
              <h3
                className="text-lg font-semibold mb-3"
                style={{ color: "var(--theme-text-primary)" }}
              >
                My Custom Tables
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {customPresets.map((preset) => (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => handleSelectPreset(preset)}
                    className="text-left p-4 rounded-lg border-2 border-cyan-500 bg-cyan-950/20 transition-all hover:scale-105 hover:shadow-lg relative"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h4
                        className="font-bold text-lg"
                        style={{ color: "var(--theme-text-primary)" }}
                      >
                        {preset.name}
                      </h4>
                      <div className="text-xs text-cyan-400">CUSTOM</div>
                    </div>
                    <p
                      className="text-sm mb-3"
                      style={{ color: "var(--theme-text-secondary)" }}
                    >
                      {preset.description}
                    </p>
                    <div
                      className="flex items-center gap-2 text-xs"
                      style={{ color: "var(--theme-text-muted)" }}
                    >
                      <span
                        className="px-2 py-1 rounded"
                        style={{ background: "rgba(0, 0, 0, 0.3)" }}
                      >
                        ${preset.rules.minBet}-${preset.rules.maxBet}
                      </span>
                      <span
                        className="px-2 py-1 rounded"
                        style={{ background: "rgba(0, 0, 0, 0.3)" }}
                      >
                        {preset.rules.deckCount}D
                      </span>
                      <span
                        className="px-2 py-1 rounded"
                        style={{ background: "rgba(0, 0, 0, 0.3)" }}
                      >
                        {preset.rules.blackjackPayout} BJ
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Custom Game Button */}
          <div
            className="pt-4 border-t"
            style={{ borderColor: "var(--theme-border)" }}
          >
            <Button
              onClick={onCustomGame}
              style={{
                background: `linear-gradient(to right, var(--theme-primary), var(--theme-secondary))`,
                color: "var(--theme-text-primary)",
              }}
              className="w-full font-bold py-6 text-lg hover:opacity-90"
            >
              🎨 Create Custom Game
            </Button>
            <p
              className="text-center text-sm mt-2"
              style={{ color: "var(--theme-text-muted)" }}
            >
              Configure your own table rules and save as a preset
            </p>
          </div>
        </CardContent>

        {/* Footer */}
        <div
          className="flex-shrink-0 p-6 border-t"
          style={{ borderColor: "var(--theme-border)" }}
        >
          <Button
            onClick={onCancel}
            variant="outline"
            style={{
              borderColor: "var(--theme-border)",
              color: "var(--theme-text-muted)",
            }}
            className="w-full hover:opacity-80"
          >
            Cancel
          </Button>
        </div>
      </Card>
    </div>
  );
}
