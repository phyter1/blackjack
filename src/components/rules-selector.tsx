"use client";

import { useState } from "react";
import { RuleSet } from "@/modules/game/rules";
import { PresetService } from "@/services/preset-service";
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

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-0 sm:p-4">
      <Card className="bg-gray-900 border-green-500 max-w-3xl w-full h-full sm:h-auto sm:max-h-[90vh] flex flex-col sm:rounded-lg rounded-none border-0 sm:border">
        <CardHeader className="flex-shrink-0 pb-3 sm:pb-6">
          <CardTitle className="text-green-500 text-xl sm:text-2xl">
            Table Rules Configuration
          </CardTitle>
          <CardDescription className="text-sm sm:text-lg">
            Customize blackjack table rules for your game
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 sm:space-y-6 overflow-y-auto flex-1">
          {/* Preset Buttons */}
          <div>
            <Label className="text-white text-sm mb-1 sm:mb-2 block">
              Quick Presets
            </Label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-1.5 sm:gap-2">
              <Button
                onClick={() => loadPreset("default")}
                variant="outline"
                className="border-gray-700 text-gray-400 hover:text-white"
                size="sm"
              >
                Default
              </Button>
              <Button
                onClick={() => loadPreset("vegas-strip")}
                variant="outline"
                className="border-gray-700 text-gray-400 hover:text-white"
                size="sm"
              >
                Vegas Strip
              </Button>
              <Button
                onClick={() => loadPreset("atlantic-city")}
                variant="outline"
                className="border-gray-700 text-gray-400 hover:text-white"
                size="sm"
              >
                Atlantic City
              </Button>
              <Button
                onClick={() => loadPreset("single-deck")}
                variant="outline"
                className="border-gray-700 text-gray-400 hover:text-white"
                size="sm"
              >
                Single Deck
              </Button>
            </div>
          </div>

          {/* House Edge Display */}
          <div className="p-2 sm:p-4 bg-black rounded border border-gray-700">
            <div className="flex justify-between items-center">
              <span className="text-gray-400 text-sm sm:text-base">
                House Edge:
              </span>
              <span
                className={`text-xl sm:text-2xl font-bold ${
                  houseEdge <= 0.5
                    ? "text-green-500"
                    : houseEdge <= 1.0
                      ? "text-yellow-500"
                      : "text-red-500"
                }`}
              >
                {houseEdge.toFixed(2)}%
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-0.5 sm:mt-1">
              {houseEdge <= 0.5
                ? "Excellent player odds"
                : houseEdge <= 1.0
                  ? "Good player odds"
                  : "Unfavorable player odds"}
            </p>
          </div>

          {/* Table Limits */}
          <div className="space-y-2 sm:space-y-4">
            <h3 className="text-base sm:text-lg font-semibold text-white border-b border-gray-700 pb-1 sm:pb-2">
              Table Limits
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-4">
              <div>
                <Label htmlFor="minBet" className="text-white text-sm">
                  Minimum Bet
                </Label>
                <div className="flex items-center gap-1">
                  <span className="text-white text-sm">$</span>
                  <Input
                    id="minBet"
                    type="number"
                    min={1}
                    max={10000}
                    value={rules.minBet || 5}
                    onChange={(e) =>
                      updateRule("minBet", parseInt(e.target.value, 10) || 5)
                    }
                    className="bg-gray-800 text-white border-gray-700"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="maxBet" className="text-white text-sm">
                  Maximum Bet
                </Label>
                <div className="flex items-center gap-1">
                  <span className="text-white text-sm">$</span>
                  <Input
                    id="maxBet"
                    type="number"
                    min={10}
                    max={1000000}
                    value={rules.maxBet || 1000}
                    onChange={(e) =>
                      updateRule("maxBet", parseInt(e.target.value, 10) || 1000)
                    }
                    className="bg-gray-800 text-white border-gray-700"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="betUnit" className="text-white text-sm">
                  Bet Unit
                </Label>
                <div className="flex items-center gap-1">
                  <span className="text-white text-sm">$</span>
                  <Input
                    id="betUnit"
                    type="number"
                    min={1}
                    max={1000}
                    value={rules.betUnit || 5}
                    onChange={(e) =>
                      updateRule("betUnit", parseInt(e.target.value, 10) || 5)
                    }
                    className="bg-gray-800 text-white border-gray-700"
                  />
                </div>
              </div>
            </div>
            <p className="text-xs text-gray-500">
              All bets must be multiples of the bet unit and within the table limits
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-3 sm:gap-6">
            {/* Basic Rules */}
            <div className="space-y-2 sm:space-y-4">
              <h3 className="text-base sm:text-lg font-semibold text-white border-b border-gray-700 pb-1 sm:pb-2">
                Basic Rules
              </h3>

              <div>
                <Label htmlFor="deckCount" className="text-white text-sm">
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
                    className="bg-gray-800 text-white border-gray-700"
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
                <Label htmlFor="dealerStand" className="text-white text-sm">
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
                    className="bg-gray-800 text-white border-gray-700"
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
                <Label htmlFor="blackjackPayout" className="text-white text-sm">
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
                    className="bg-gray-800 text-white border-gray-700"
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
                <Label htmlFor="surrender" className="text-white text-sm">
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
                    className="bg-gray-800 text-white border-gray-700"
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
              <h3 className="text-base sm:text-lg font-semibold text-white border-b border-gray-700 pb-1 sm:pb-2">
                Advanced Rules
              </h3>

              <div>
                <Label
                  htmlFor="doubleRestriction"
                  className="text-white text-sm"
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
                    className="bg-gray-800 text-white border-gray-700"
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
                <Label htmlFor="maxSplits" className="text-white text-sm">
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
                    className="bg-gray-800 text-white border-gray-700"
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
                  className="text-white text-sm"
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
                    className="bg-gray-800 text-white border-gray-700"
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

              <div className="flex items-center justify-between p-2 sm:p-3 bg-black rounded">
                <Label htmlFor="das" className="text-white text-sm">
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

              <div className="flex items-center justify-between p-2 sm:p-3 bg-black rounded">
                <Label htmlFor="rsa" className="text-white text-sm">
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

              <div className="flex items-center justify-between p-2 sm:p-3 bg-black rounded">
                <Label htmlFor="hsa" className="text-white text-sm">
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
            <div className="space-y-3 pt-3 border-t border-gray-700">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-semibold text-white">
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
                    <Label htmlFor="presetName" className="text-white text-sm">
                      Preset Name *
                    </Label>
                    <Input
                      id="presetName"
                      value={presetName}
                      onChange={(e) => setPresetName(e.target.value)}
                      placeholder="e.g., My Favorite Table"
                      className="bg-gray-800 text-white border-gray-700"
                    />
                  </div>
                  <div>
                    <Label htmlFor="presetDesc" className="text-white text-sm">
                      Description
                    </Label>
                    <Input
                      id="presetDesc"
                      value={presetDescription}
                      onChange={(e) => setPresetDescription(e.target.value)}
                      placeholder="e.g., Player-friendly rules with low house edge"
                      className="bg-gray-800 text-white border-gray-700"
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
                className="flex-1 bg-cyan-600 hover:bg-cyan-700"
              >
                Save Preset & Start Game
              </Button>
            ) : (
              <Button
                onClick={handleSave}
                className="flex-1 bg-green-600 hover:bg-green-700"
              >
                {allowSaveAsPreset ? "Start Game" : "Save Rules"}
              </Button>
            )}
            <Button
              onClick={onCancel}
              variant="outline"
              className="flex-1 border-gray-700 text-gray-400 hover:text-white"
            >
              Cancel
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
