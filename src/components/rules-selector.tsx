"use client";

import { useState, useEffect } from "react";
import { RuleSet } from "@/modules/game/rules";
import { PresetService } from "@/services/preset-service";
import { ChipConfigService } from "@/services/chip-config-service";
import { CANONICAL_DENOMS } from "@/modules/chip";
import { getChipColor } from "@/components/casino-chip";
import { DenomChip } from "@/components/chips";
import {
  generateDefaultChips,
  validateChipDenominations,
} from "@/types/chip-config";
import type { TableRules } from "@/types/user";
import { Button } from "./ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Switch } from "./ui/switch";

interface RulesSelectorProps {
  initialRules?: TableRules;
  onSave: (rules: TableRules) => void;
  onCancel: () => void;
  allowSaveAsPreset?: boolean; // Allow saving configuration as a preset
}

const DEFAULT_RULES: TableRules = {
  deckCount: 6,
  dealerStand: "s17",
  blackjackPayout: "3:2",
  doubleAfterSplit: true,
  surrender: "none",
  doubleRestriction: "any",
  resplitAces: false,
  hitSplitAces: false,
  maxSplits: 3,
  maxPlayableHands: 5,
  minBet: 5,
  maxBet: 1000,
  betUnit: 5,
};

export function RulesSelector({
  initialRules,
  onSave,
  onCancel,
  allowSaveAsPreset = false,
}: RulesSelectorProps) {
  const [rules, setRules] = useState<TableRules>(initialRules || DEFAULT_RULES);
  const [showSavePreset, setShowSavePreset] = useState(false);
  const [presetName, setPresetName] = useState("");
  const [presetDescription, setPresetDescription] = useState("");

  // Chip configuration state
  const [chipDenominations, setChipDenominations] = useState<number[]>([]);
  const [showChipConfig, setShowChipConfig] = useState(false);
  const [selectedDenom, setSelectedDenom] = useState<string>("");
  const [chipError, setChipError] = useState<string | null>(null);

  // Load chip configuration when table limits change
  useEffect(() => {
    if (rules.minBet && rules.maxBet && rules.betUnit) {
      const config = ChipConfigService.getChipConfig({
        minBet: rules.minBet,
        maxBet: rules.maxBet,
        betUnit: rules.betUnit,
      });
      setChipDenominations(config.denominations);
    }
  }, [rules.minBet, rules.maxBet, rules.betUnit]);

  // Calculate house edge whenever rules change
  const calculateHouseEdge = (currentRules: TableRules): number => {
    const ruleSet = new RuleSet()
      .setDeckCount(currentRules.deckCount)
      .setDealerStand(currentRules.dealerStand)
      .setBlackjackPayout(
        currentRules.blackjackPayout === "3:2" ? 3 : 6,
        currentRules.blackjackPayout === "3:2" ? 2 : 5,
      )
      .setDoubleAfterSplit(currentRules.doubleAfterSplit)
      .setSurrender(currentRules.surrender)
      .setDoubleRestriction(currentRules.doubleRestriction);

    // Add other rules
    if (currentRules.resplitAces) {
      ruleSet.setRule({
        type: "resplit_aces",
        allowed: currentRules.resplitAces,
      });
    }
    if (currentRules.hitSplitAces) {
      ruleSet.setRule({
        type: "hit_split_aces",
        allowed: currentRules.hitSplitAces,
      });
    }
    ruleSet.setRule({
      type: "max_split",
      times: currentRules.maxSplits,
    });

    const builtRules = ruleSet.build();
    return builtRules.houseEdge;
  };

  const houseEdge = calculateHouseEdge(rules);

  const updateRule = <K extends keyof TableRules>(
    key: K,
    value: TableRules[K],
  ) => {
    setRules((prev) => ({ ...prev, [key]: value }));
  };

  const loadPreset = (preset: string) => {
    switch (preset) {
      case "vegas-strip":
        setRules({
          deckCount: 4,
          dealerStand: "s17",
          blackjackPayout: "3:2",
          doubleAfterSplit: true,
          surrender: "late",
          doubleRestriction: "any",
          resplitAces: false,
          hitSplitAces: false,
          maxSplits: 3,
          maxPlayableHands: 5,
          minBet: 25,
          maxBet: 5000,
          betUnit: 25,
        });
        break;
      case "atlantic-city":
        setRules({
          deckCount: 8,
          dealerStand: "s17",
          blackjackPayout: "3:2",
          doubleAfterSplit: true,
          surrender: "late",
          doubleRestriction: "any",
          resplitAces: false,
          hitSplitAces: false,
          maxSplits: 3,
          maxPlayableHands: 5,
          minBet: 10,
          maxBet: 2000,
          betUnit: 10,
        });
        break;
      case "single-deck":
        setRules({
          deckCount: 1,
          dealerStand: "h17",
          blackjackPayout: "3:2",
          doubleAfterSplit: false,
          surrender: "none",
          doubleRestriction: "10-11",
          resplitAces: false,
          hitSplitAces: false,
          maxSplits: 3,
          maxPlayableHands: 5,
          minBet: 5,
          maxBet: 500,
          betUnit: 5,
        });
        break;
      case "liberal":
        setRules({
          deckCount: 4,
          dealerStand: "s17",
          blackjackPayout: "3:2",
          doubleAfterSplit: true,
          surrender: "late",
          doubleRestriction: "any",
          resplitAces: true,
          hitSplitAces: false,
          maxSplits: 3,
          maxPlayableHands: 5,
          minBet: 5,
          maxBet: 1000,
          betUnit: 5,
        });
        break;
      default:
        setRules(DEFAULT_RULES);
    }
  };

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

    // Proceed with saving the rules and starting the game
    handleSave();
  };

  // Get available denominations for dropdown (excluding already selected ones)
  const getAvailableDenominations = () => {
    return CANONICAL_DENOMS.filter((denom) => !chipDenominations.includes(denom));
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

    const newDenominations = [...chipDenominations, value].sort((a, b) => a - b);
    setChipDenominations(newDenominations);
    setSelectedDenom("");
    setChipError(null);
  };

  const handleRemoveChip = (value: number) => {
    setChipDenominations(chipDenominations.filter((d) => d !== value));
    setChipError(null);
  };

  const handleResetChips = () => {
    if (rules.minBet && rules.maxBet && rules.betUnit) {
      const defaultChips = generateDefaultChips({
        minBet: rules.minBet,
        maxBet: rules.maxBet,
        betUnit: rules.betUnit,
      });
      setChipDenominations(defaultChips);
      setChipError(null);
    }
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
              <Button
                onClick={() => loadPreset("default")}
                variant="outline"
                style={{
                  borderColor: "var(--theme-border)",
                  color: "var(--theme-text-muted)",
                }}
                className="hover:opacity-80"
                size="sm"
              >
                Default
              </Button>
              <Button
                onClick={() => loadPreset("vegas-strip")}
                variant="outline"
                style={{
                  borderColor: "var(--theme-border)",
                  color: "var(--theme-text-muted)",
                }}
                className="hover:opacity-80"
                size="sm"
              >
                Vegas Strip
              </Button>
              <Button
                onClick={() => loadPreset("atlantic-city")}
                variant="outline"
                style={{
                  borderColor: "var(--theme-border)",
                  color: "var(--theme-text-muted)",
                }}
                className="hover:opacity-80"
                size="sm"
              >
                Atlantic City
              </Button>
              <Button
                onClick={() => loadPreset("single-deck")}
                variant="outline"
                style={{
                  borderColor: "var(--theme-border)",
                  color: "var(--theme-text-muted)",
                }}
                className="hover:opacity-80"
                size="sm"
              >
                Single Deck
              </Button>
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

          {/* Table Limits */}
          <div className="space-y-2 sm:space-y-4">
            <h3
              className="text-base sm:text-lg font-semibold border-b pb-1 sm:pb-2"
              style={{
                color: "var(--theme-text-primary)",
                borderColor: "var(--theme-border)",
              }}
            >
              Table Limits
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-4">
              <div>
                <Label
                  htmlFor="minBet"
                  className="text-sm"
                  style={{ color: "var(--theme-text-primary)" }}
                >
                  Minimum Bet
                </Label>
                <div className="flex items-center gap-1">
                  <span
                    className="text-sm"
                    style={{ color: "var(--theme-text-primary)" }}
                  >
                    $
                  </span>
                  <Input
                    id="minBet"
                    type="number"
                    min={1}
                    max={10000}
                    value={rules.minBet || 5}
                    onChange={(e) =>
                      updateRule("minBet", parseInt(e.target.value, 10) || 5)
                    }
                    style={{
                      background: "var(--theme-background)",
                      color: "var(--theme-text-primary)",
                      borderColor: "var(--theme-border)",
                    }}
                  />
                </div>
              </div>

              <div>
                <Label
                  htmlFor="maxBet"
                  className="text-sm"
                  style={{ color: "var(--theme-text-primary)" }}
                >
                  Maximum Bet
                </Label>
                <div className="flex items-center gap-1">
                  <span
                    className="text-sm"
                    style={{ color: "var(--theme-text-primary)" }}
                  >
                    $
                  </span>
                  <Input
                    id="maxBet"
                    type="number"
                    min={10}
                    max={1000000}
                    value={rules.maxBet || 1000}
                    onChange={(e) =>
                      updateRule("maxBet", parseInt(e.target.value, 10) || 1000)
                    }
                    style={{
                      background: "var(--theme-background)",
                      color: "var(--theme-text-primary)",
                      borderColor: "var(--theme-border)",
                    }}
                  />
                </div>
              </div>

              <div>
                <Label
                  htmlFor="betUnit"
                  className="text-sm"
                  style={{ color: "var(--theme-text-primary)" }}
                >
                  Bet Unit
                </Label>
                <div className="flex items-center gap-1">
                  <span
                    className="text-sm"
                    style={{ color: "var(--theme-text-primary)" }}
                  >
                    $
                  </span>
                  <Input
                    id="betUnit"
                    type="number"
                    min={1}
                    max={1000}
                    value={rules.betUnit || 5}
                    onChange={(e) =>
                      updateRule("betUnit", parseInt(e.target.value, 10) || 5)
                    }
                    style={{
                      background: "var(--theme-background)",
                      color: "var(--theme-text-primary)",
                      borderColor: "var(--theme-border)",
                    }}
                  />
                </div>
              </div>
            </div>
            <p className="text-xs" style={{ color: "var(--theme-text-muted)" }}>
              All bets must be multiples of the bet unit and within the table limits
            </p>
          </div>

          {/* Chip Denominations */}
          <div className="space-y-2 sm:space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-base sm:text-lg font-semibold text-white border-b border-gray-700 pb-1 sm:pb-2 flex-1">
                Chip Denominations
              </h3>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setShowChipConfig(!showChipConfig)}
                className="text-blue-400 hover:text-blue-300 ml-2"
              >
                {showChipConfig ? "Hide" : "Customize"}
              </Button>
            </div>

            {/* Show current chips */}
            <div className="flex flex-wrap gap-2">
              {chipDenominations.map((denom) => (
                <div
                  key={denom}
                  className="px-3 py-1.5 bg-gradient-to-br from-amber-600 to-amber-800 rounded-full text-white font-bold text-sm shadow-lg border-2 border-amber-400"
                >
                  ${denom}
                </div>
              ))}
            </div>

            {showChipConfig && (
              <div className="space-y-3 p-3 bg-blue-950/20 rounded border border-blue-800">
                <p className="text-xs text-blue-300">
                  Select from authentic casino chip denominations with exact color
                  matching. Only canonical denominations ($0.01, $0.05, $0.25, $0.50,
                  $1, $5, $25, $100, $500, $1000, $5000, $10000) are available.
                </p>

                <div className="flex gap-2">
                  <div className="flex-1">
                    <Label
                      htmlFor="chipValue"
                      className="text-sm"
                      style={{ color: "var(--theme-text-primary)" }}
                    >
                      Add Chip Denomination
                    </Label>
                    <div className="flex gap-2">
                      <Select
                        value={selectedDenom}
                        onValueChange={setSelectedDenom}
                      >
                        <SelectTrigger
                          id="chipValue"
                          className="bg-gray-800 text-white border-gray-700 flex-1"
                        >
                          <SelectValue placeholder="Select denomination..." />
                        </SelectTrigger>
                        <SelectContent className="bg-gray-800 border-gray-700">
                          {getAvailableDenominations().map((denom) => (
                            <SelectItem
                              key={denom}
                              value={denom.toString()}
                              className="text-white hover:bg-gray-700"
                            >
                              ${denom >= 1 ? denom.toString() : denom.toFixed(2)}
                            </SelectItem>
                          ))}
                          {getAvailableDenominations().length === 0 && (
                            <SelectItem
                              value="none"
                              disabled
                              className="text-gray-500"
                            >
                              No more denominations available
                            </SelectItem>
                          )}
                        </SelectContent>
                      </Select>
                      <Button
                        type="button"
                        onClick={handleAddChip}
                        size="sm"
                        className="bg-blue-600 hover:bg-blue-700"
                        disabled={!selectedDenom || getAvailableDenominations().length === 0}
                      >
                        Add
                      </Button>
                    </div>
                  </div>
                </div>

                {chipError && (
                  <div className="text-sm text-red-400 bg-red-950/30 px-3 py-2 rounded border border-red-800">
                    {chipError}
                  </div>
                )}

                {/* Current chips with remove buttons */}
                <div>
                  <Label className="text-white text-sm mb-2 block">
                    Current Chips ({chipDenominations.length}/7)
                  </Label>
                  <div className="flex flex-wrap gap-3">
                    {chipDenominations.map((denom) => {
                      const chipColors = getChipColor(denom);
                      return (
                        <div
                          key={denom}
                          className="relative group"
                          title="Click to remove"
                        >
                          <div
                            onClick={() => handleRemoveChip(denom)}
                            className="cursor-pointer transition-all group-hover:scale-110 group-hover:brightness-75"
                          >
                            <DenomChip
                              value={denom}
                              primary={chipColors.primary}
                              secondary={chipColors.secondary}
                              center={chipColors.center}
                              textColor={chipColors.textColor}
                              size={72}
                            />
                          </div>
                          <div className="absolute -top-1 -right-1 bg-red-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity shadow-lg">
                            ×
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    type="button"
                    onClick={handleResetChips}
                    variant="outline"
                    size="sm"
                    className="border-gray-600 text-gray-400 hover:text-white"
                  >
                    Reset to Defaults
                  </Button>
                </div>
              </div>
            )}
          </div>

          <div className="grid md:grid-cols-2 gap-3 sm:gap-6">
            {/* Basic Rules */}
            <div className="space-y-2 sm:space-y-4">
              <h3
                className="text-base sm:text-lg font-semibold border-b pb-1 sm:pb-2"
                style={{
                  color: "var(--theme-text-primary)",
                  borderColor: "var(--theme-border)",
                }}
              >
                Basic Rules
              </h3>

              <div>
                <Label
                  htmlFor="deckCount"
                  className="text-sm"
                  style={{ color: "var(--theme-text-primary)" }}
                >
                  Number of Decks
                </Label>
                <Select
                  value={rules.deckCount.toString()}
                  onValueChange={(value) =>
                    updateRule("deckCount", parseInt(value, 10))
                  }
                >
                  <SelectTrigger
                    id="deckCount"
                    style={{
                      background: "var(--theme-background)",
                      color: "var(--theme-text-primary)",
                      borderColor: "var(--theme-border)",
                    }}
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 Deck</SelectItem>
                    <SelectItem value="2">2 Decks</SelectItem>
                    <SelectItem value="4">4 Decks</SelectItem>
                    <SelectItem value="6">6 Decks</SelectItem>
                    <SelectItem value="8">8 Decks</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label
                  htmlFor="dealerStand"
                  className="text-sm"
                  style={{ color: "var(--theme-text-primary)" }}
                >
                  Dealer Stand Rule
                </Label>
                <Select
                  value={rules.dealerStand}
                  onValueChange={(value: "s17" | "h17") =>
                    updateRule("dealerStand", value)
                  }
                >
                  <SelectTrigger
                    id="dealerStand"
                    style={{
                      background: "var(--theme-background)",
                      color: "var(--theme-text-primary)",
                      borderColor: "var(--theme-border)",
                    }}
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="s17">S17 (Stand on Soft 17)</SelectItem>
                    <SelectItem value="h17">H17 (Hit on Soft 17)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label
                  htmlFor="blackjackPayout"
                  className="text-sm"
                  style={{ color: "var(--theme-text-primary)" }}
                >
                  Blackjack Payout
                </Label>
                <Select
                  value={rules.blackjackPayout}
                  onValueChange={(value: "3:2" | "6:5") =>
                    updateRule("blackjackPayout", value)
                  }
                >
                  <SelectTrigger
                    id="blackjackPayout"
                    style={{
                      background: "var(--theme-background)",
                      color: "var(--theme-text-primary)",
                      borderColor: "var(--theme-border)",
                    }}
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="3:2">3:2 (Standard)</SelectItem>
                    <SelectItem value="6:5">6:5 (Poor odds)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label
                  htmlFor="surrender"
                  className="text-sm"
                  style={{ color: "var(--theme-text-primary)" }}
                >
                  Surrender
                </Label>
                <Select
                  value={rules.surrender}
                  onValueChange={(value: "none" | "late" | "early") =>
                    updateRule("surrender", value)
                  }
                >
                  <SelectTrigger
                    id="surrender"
                    style={{
                      background: "var(--theme-background)",
                      color: "var(--theme-text-primary)",
                      borderColor: "var(--theme-border)",
                    }}
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Not Allowed</SelectItem>
                    <SelectItem value="late">Late Surrender</SelectItem>
                    <SelectItem value="early">Early Surrender</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Advanced Rules */}
            <div className="space-y-2 sm:space-y-4">
              <h3
                className="text-base sm:text-lg font-semibold border-b pb-1 sm:pb-2"
                style={{
                  color: "var(--theme-text-primary)",
                  borderColor: "var(--theme-border)",
                }}
              >
                Advanced Rules
              </h3>

              <div>
                <Label
                  htmlFor="doubleRestriction"
                  className="text-sm"
                  style={{ color: "var(--theme-text-primary)" }}
                >
                  Double Down Restriction
                </Label>
                <Select
                  value={rules.doubleRestriction}
                  onValueChange={(value: "any" | "9-11" | "10-11" | "11") =>
                    updateRule("doubleRestriction", value)
                  }
                >
                  <SelectTrigger
                    id="doubleRestriction"
                    style={{
                      background: "var(--theme-background)",
                      color: "var(--theme-text-primary)",
                      borderColor: "var(--theme-border)",
                    }}
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="any">Any Two Cards</SelectItem>
                    <SelectItem value="9-11">9, 10, or 11 Only</SelectItem>
                    <SelectItem value="10-11">10 or 11 Only</SelectItem>
                    <SelectItem value="11">11 Only</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label
                  htmlFor="maxSplits"
                  className="text-sm"
                  style={{ color: "var(--theme-text-primary)" }}
                >
                  Maximum Splits
                </Label>
                <Select
                  value={rules.maxSplits.toString()}
                  onValueChange={(value) =>
                    updateRule("maxSplits", parseInt(value, 10))
                  }
                >
                  <SelectTrigger
                    id="maxSplits"
                    style={{
                      background: "var(--theme-background)",
                      color: "var(--theme-text-primary)",
                      borderColor: "var(--theme-border)",
                    }}
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 Split (2 hands)</SelectItem>
                    <SelectItem value="2">2 Splits (3 hands)</SelectItem>
                    <SelectItem value="3">3 Splits (4 hands)</SelectItem>
                    <SelectItem value="4">4 Splits (5 hands)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label
                  htmlFor="maxPlayableHands"
                  className="text-sm"
                  style={{ color: "var(--theme-text-primary)" }}
                >
                  Max Playable Hands
                </Label>
                <Select
                  value={(rules.maxPlayableHands || 5).toString()}
                  onValueChange={(value) =>
                    updateRule("maxPlayableHands", parseInt(value, 10))
                  }
                >
                  <SelectTrigger
                    id="maxPlayableHands"
                    style={{
                      background: "var(--theme-background)",
                      color: "var(--theme-text-primary)",
                      borderColor: "var(--theme-border)",
                    }}
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 Hand</SelectItem>
                    <SelectItem value="2">2 Hands</SelectItem>
                    <SelectItem value="3">3 Hands</SelectItem>
                    <SelectItem value="4">4 Hands</SelectItem>
                    <SelectItem value="5">5 Hands</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div
                className="flex items-center justify-between p-2 sm:p-3 rounded"
                style={{ background: "var(--theme-dashboard-bg)" }}
              >
                <Label
                  htmlFor="das"
                  className="text-sm"
                  style={{ color: "var(--theme-text-primary)" }}
                >
                  Double After Split (DAS)
                </Label>
                <Switch
                  id="das"
                  checked={rules.doubleAfterSplit}
                  onCheckedChange={(checked) =>
                    updateRule("doubleAfterSplit", checked)
                  }
                />
              </div>

              <div
                className="flex items-center justify-between p-2 sm:p-3 rounded"
                style={{ background: "var(--theme-dashboard-bg)" }}
              >
                <Label
                  htmlFor="rsa"
                  className="text-sm"
                  style={{ color: "var(--theme-text-primary)" }}
                >
                  Resplit Aces
                </Label>
                <Switch
                  id="rsa"
                  checked={rules.resplitAces}
                  onCheckedChange={(checked) =>
                    updateRule("resplitAces", checked)
                  }
                />
              </div>

              <div
                className="flex items-center justify-between p-2 sm:p-3 rounded"
                style={{ background: "var(--theme-dashboard-bg)" }}
              >
                <Label
                  htmlFor="hsa"
                  className="text-sm"
                  style={{ color: "var(--theme-text-primary)" }}
                >
                  Hit Split Aces
                </Label>
                <Switch
                  id="hsa"
                  checked={rules.hitSplitAces}
                  onCheckedChange={(checked) =>
                    updateRule("hitSplitAces", checked)
                  }
                />
              </div>
            </div>
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
