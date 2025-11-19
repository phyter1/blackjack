"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Button } from "./ui/button";
import { Label } from "./ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Switch } from "./ui/switch";
import type { TableRules } from "@/types/user";
import { RuleSet } from "@/modules/game/rules";

interface RulesSelectorProps {
  initialRules?: TableRules;
  onSave: (rules: TableRules) => void;
  onCancel: () => void;
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
};

export function RulesSelector({
  initialRules,
  onSave,
  onCancel,
}: RulesSelectorProps) {
  const [rules, setRules] = useState<TableRules>(initialRules || DEFAULT_RULES);

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
        });
        break;
      default:
        setRules(DEFAULT_RULES);
    }
  };

  const handleSave = () => {
    onSave({ ...rules, houseEdge });
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <Card className="bg-gray-900 border-green-500 max-w-3xl w-full my-8">
        <CardHeader>
          <CardTitle className="text-green-500 text-2xl">
            Table Rules Configuration
          </CardTitle>
          <CardDescription className="text-lg">
            Customize blackjack table rules for your game
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Preset Buttons */}
          <div>
            <Label className="text-white mb-2 block">Quick Presets</Label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
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
          <div className="p-4 bg-black rounded border border-gray-700">
            <div className="flex justify-between items-center">
              <span className="text-gray-400">House Edge:</span>
              <span
                className={`text-2xl font-bold ${
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
            <p className="text-xs text-gray-500 mt-1">
              {houseEdge <= 0.5
                ? "Excellent player odds"
                : houseEdge <= 1.0
                  ? "Good player odds"
                  : "Unfavorable player odds"}
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Basic Rules */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white border-b border-gray-700 pb-2">
                Basic Rules
              </h3>

              <div>
                <Label htmlFor="deckCount" className="text-white">
                  Number of Decks
                </Label>
                <Select
                  value={rules.deckCount.toString()}
                  onValueChange={(value) =>
                    updateRule("deckCount", parseInt(value))
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
                <Label htmlFor="dealerStand" className="text-white">
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
                <Label htmlFor="blackjackPayout" className="text-white">
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
                <Label htmlFor="surrender" className="text-white">
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
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white border-b border-gray-700 pb-2">
                Advanced Rules
              </h3>

              <div>
                <Label htmlFor="doubleRestriction" className="text-white">
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
                <Label htmlFor="maxSplits" className="text-white">
                  Maximum Splits
                </Label>
                <Select
                  value={rules.maxSplits.toString()}
                  onValueChange={(value) =>
                    updateRule("maxSplits", parseInt(value))
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

              <div className="flex items-center justify-between p-3 bg-black rounded">
                <Label htmlFor="das" className="text-white">
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

              <div className="flex items-center justify-between p-3 bg-black rounded">
                <Label htmlFor="rsa" className="text-white">
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

              <div className="flex items-center justify-between p-3 bg-black rounded">
                <Label htmlFor="hsa" className="text-white">
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

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4 border-t border-gray-700">
            <Button
              onClick={handleSave}
              className="flex-1 bg-green-600 hover:bg-green-700"
            >
              Save Rules
            </Button>
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
