"use client";

import { useState } from "react";
import { PresetService } from "@/services/preset-service";
import { ChipConfigService } from "@/services/chip-config-service";
import type { TableRules } from "@/types/user";
import { Button } from "../ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { ChipConfiguration } from "./chip-configuration";
import { TableLimits } from "./table-limits";
import { BasicRules } from "./basic-rules";
import { AdvancedRules } from "./advanced-rules";
import { useRulesForm } from "./use-rules-form";

interface RulesSelectorProps {
  initialRules?: TableRules;
  onSave: (rules: TableRules) => void;
  onCancel: () => void;
  allowSaveAsPreset?: boolean;
}

export function RulesSelector({
  initialRules,
  onSave,
  onCancel,
  allowSaveAsPreset = false,
}: RulesSelectorProps) {
  const {
    rules,
    chipDenominations,
    setChipDenominations,
    updateRule,
    loadPreset,
    calculateHouseEdge,
    resetChips,
  } = useRulesForm(initialRules);

  const [showSavePreset, setShowSavePreset] = useState(false);
  const [presetName, setPresetName] = useState("");
  const [presetDescription, setPresetDescription] = useState("");

  // Chip configuration state
  const [showChipConfig, setShowChipConfig] = useState(false);
  const [selectedDenom, setSelectedDenom] = useState<string>("");
  const [chipError, setChipError] = useState<string | null>(null);

  const houseEdge = calculateHouseEdge(rules);

  const handleSave = () => {
    // Save chip configuration if customized
    if (rules.minBet && rules.maxBet && rules.betUnit) {
      ChipConfigService.saveChipConfig(
        {
          minBet: rules.minBet,
          maxBet: rules.maxBet,
          betUnit: rules.betUnit,
        },
        { denominations: chipDenominations },
      );
    }

    onSave({ ...rules, houseEdge });
  };

  const handleSaveAsPreset = () => {
    if (!presetName.trim()) {
      alert("Please enter a preset name");
      return;
    }

    if (PresetService.presetNameExists(presetName.trim())) {
      alert("A preset with this name already exists");
      return;
    }

    PresetService.savePreset({
      name: presetName.trim(),
      description: presetDescription.trim() || "Custom table configuration",
      rules: { ...rules, houseEdge },
      isBuiltIn: false,
    });

    handleSave();
  };

  // Chip configuration handlers
  const handleAddChip = () => {
    if (!selectedDenom) {
      setChipError("Please select a denomination");
      return;
    }

    const value = Number.parseFloat(selectedDenom);
    if (Number.isNaN(value) || value <= 0) {
      setChipError("Please select a valid denomination");
      return;
    }

    if (chipDenominations.includes(value)) {
      setChipError("This denomination already exists");
      return;
    }

    if (chipDenominations.length >= 7) {
      setChipError("Maximum 7 chip denominations allowed");
      return;
    }

    const newDenominations = [...chipDenominations, value].sort(
      (a, b) => a - b,
    );
    setChipDenominations(newDenominations);
    setSelectedDenom("");
    setChipError(null);
  };

  const handleRemoveChip = (value: number) => {
    setChipDenominations(chipDenominations.filter((d) => d !== value));
    setChipError(null);
  };

  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-50 p-0 sm:p-4"
      style={{ background: "rgba(0, 0, 0, 0.8)" }}
    >
      <Card
        className="max-w-3xl w-full h-full sm:h-auto sm:max-h-[90vh] flex flex-col sm:rounded-lg rounded-none border-0 sm:border"
        style={{
          background: "var(--theme-dashboard-card)",
          borderColor: "var(--theme-accent)",
        }}
      >
        <CardHeader className="flex-shrink-0 pb-3 sm:pb-6">
          <CardTitle
            className="text-xl sm:text-2xl"
            style={{ color: "var(--theme-accent)" }}
          >
            Table Rules Configuration
          </CardTitle>
          <CardDescription
            className="text-sm sm:text-lg"
            style={{ color: "var(--theme-text-secondary)" }}
          >
            Customize blackjack table rules for your game
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 sm:space-y-6 overflow-y-auto flex-1">
          {/* Preset Buttons */}
          <div>
            <Label
              className="text-sm mb-1 sm:mb-2 block"
              style={{ color: "var(--theme-text-primary)" }}
            >
              Quick Presets
            </Label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-1.5 sm:gap-2">
              {["default", "vegas-strip", "atlantic-city", "single-deck"].map(
                (preset) => (
                  <Button
                    key={preset}
                    onClick={() => loadPreset(preset)}
                    variant="outline"
                    style={{
                      borderColor: "var(--theme-border)",
                      color: "var(--theme-text-muted)",
                    }}
                    className="hover:opacity-80"
                    size="sm"
                  >
                    {preset
                      .split("-")
                      .map(
                        (word) => word.charAt(0).toUpperCase() + word.slice(1),
                      )
                      .join(" ")}
                  </Button>
                ),
              )}
            </div>
          </div>

          {/* House Edge Display */}
          <div
            className="p-2 sm:p-4 rounded border"
            style={{
              background: "var(--theme-dashboard-bg)",
              borderColor: "var(--theme-border)",
            }}
          >
            <div className="flex justify-between items-center">
              <span
                className="text-sm sm:text-base"
                style={{ color: "var(--theme-text-secondary)" }}
              >
                House Edge:
              </span>
              <span
                className="text-xl sm:text-2xl font-bold"
                style={{
                  color:
                    houseEdge <= 0.5
                      ? "var(--theme-success)"
                      : houseEdge <= 1.0
                        ? "var(--theme-warning)"
                        : "var(--theme-error)",
                }}
              >
                {houseEdge.toFixed(2)}%
              </span>
            </div>
            <p
              className="text-xs mt-0.5 sm:mt-1"
              style={{ color: "var(--theme-text-muted)" }}
            >
              {houseEdge <= 0.5
                ? "Excellent player odds"
                : houseEdge <= 1.0
                  ? "Good player odds"
                  : "Unfavorable player odds"}
            </p>
          </div>

          <TableLimits rules={rules} onUpdateRule={updateRule} />

          <ChipConfiguration
            chipDenominations={chipDenominations}
            showChipConfig={showChipConfig}
            selectedDenom={selectedDenom}
            chipError={chipError}
            onToggleShow={() => setShowChipConfig(!showChipConfig)}
            onSelectedDenomChange={setSelectedDenom}
            onAddChip={handleAddChip}
            onRemoveChip={handleRemoveChip}
            onResetChips={resetChips}
          />

          <div className="grid md:grid-cols-2 gap-3 sm:gap-6">
            <BasicRules rules={rules} onUpdateRule={updateRule} />
            <AdvancedRules rules={rules} onUpdateRule={updateRule} />
          </div>

          {/* Save as Preset Section */}
          {allowSaveAsPreset && (
            <div
              className="space-y-3 pt-3 border-t"
              style={{ borderColor: "var(--theme-border)" }}
            >
              <div className="flex items-center justify-between">
                <h3
                  className="text-base font-semibold"
                  style={{ color: "var(--theme-text-primary)" }}
                >
                  Save as Preset (Optional)
                </h3>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowSavePreset(!showSavePreset)}
                  className="text-cyan-400 hover:text-cyan-300"
                >
                  {showSavePreset ? "Hide" : "Show"}
                </Button>
              </div>

              {showSavePreset && (
                <div className="space-y-3 p-3 bg-cyan-950/20 rounded border border-cyan-800">
                  <div>
                    <Label
                      htmlFor="presetName"
                      className="text-sm"
                      style={{ color: "var(--theme-text-primary)" }}
                    >
                      Preset Name *
                    </Label>
                    <Input
                      id="presetName"
                      value={presetName}
                      onChange={(e) => setPresetName(e.target.value)}
                      placeholder="e.g., My Favorite Table"
                      style={{
                        background: "var(--theme-background)",
                        color: "var(--theme-text-primary)",
                        borderColor: "var(--theme-border)",
                      }}
                    />
                  </div>
                  <div>
                    <Label
                      htmlFor="presetDesc"
                      className="text-sm"
                      style={{ color: "var(--theme-text-primary)" }}
                    >
                      Description
                    </Label>
                    <Input
                      id="presetDesc"
                      value={presetDescription}
                      onChange={(e) => setPresetDescription(e.target.value)}
                      placeholder="e.g., Player-friendly rules with low house edge"
                      style={{
                        background: "var(--theme-background)",
                        color: "var(--theme-text-primary)",
                        borderColor: "var(--theme-border)",
                      }}
                    />
                  </div>
                  <p className="text-xs text-cyan-300">
                    This preset will be saved and available for quick-start in
                    future games
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2 sm:gap-3 pt-3 sm:pt-4 border-t border-gray-700 flex-shrink-0">
            {allowSaveAsPreset && showSavePreset && presetName.trim() ? (
              <Button
                onClick={handleSaveAsPreset}
                style={{
                  background: "var(--theme-primary)",
                  color: "var(--theme-primary-foreground)",
                }}
                className="flex-1 hover:opacity-90"
              >
                Save Preset & Start Game
              </Button>
            ) : (
              <Button
                onClick={handleSave}
                style={{
                  background: "var(--theme-success)",
                  color: "var(--theme-text-primary)",
                }}
                className="flex-1 hover:opacity-90"
              >
                {allowSaveAsPreset ? "Start Game" : "Save Rules"}
              </Button>
            )}
            <Button
              onClick={onCancel}
              variant="outline"
              style={{
                borderColor: "var(--theme-border)",
                color: "var(--theme-text-muted)",
              }}
              className="flex-1 hover:opacity-80"
            >
              Cancel
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
