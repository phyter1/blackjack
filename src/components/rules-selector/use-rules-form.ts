import { useState, useEffect, useCallback } from "react";
import { RuleSet } from "@/modules/game/rules";
import { ChipConfigService } from "@/services/chip-config-service";
import { generateDefaultChips } from "@/types/chip-config";
import type { TableRules } from "@/types/user";
import { PRESET_RULES } from "./constants";

export function useRulesForm(initialRules?: TableRules) {
  const [rules, setRules] = useState<TableRules>(
    initialRules || PRESET_RULES.default,
  );
  const [chipDenominations, setChipDenominations] = useState<number[]>([]);

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

  const calculateHouseEdge = useCallback((currentRules: TableRules): number => {
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
  }, []);

  const updateRule = useCallback(
    <K extends keyof TableRules>(key: K, value: TableRules[K]) => {
      setRules((prev) => ({ ...prev, [key]: value }));
    },
    [],
  );

  const loadPreset = useCallback((preset: string) => {
    const presetRules = PRESET_RULES[preset];
    if (presetRules) {
      setRules(presetRules);
    }
  }, []);

  const resetChips = useCallback(() => {
    if (rules.minBet && rules.maxBet && rules.betUnit) {
      const defaultChips = generateDefaultChips({
        minBet: rules.minBet,
        maxBet: rules.maxBet,
        betUnit: rules.betUnit,
      });
      setChipDenominations(defaultChips);
    }
  }, [rules.minBet, rules.maxBet, rules.betUnit]);

  return {
    rules,
    chipDenominations,
    setChipDenominations,
    updateRule,
    loadPreset,
    calculateHouseEdge,
    resetChips,
  };
}
