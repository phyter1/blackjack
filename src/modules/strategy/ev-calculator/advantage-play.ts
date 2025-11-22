import type {
  EVCalculation,
  GameRules,
  BettingSpread,
  AdvantagePlayLevel,
} from "./types";
import {
  DEFAULT_RULES,
  CONSERVATIVE_SPREAD,
  AGGRESSIVE_SPREAD,
} from "./constants";
import {
  calculateBaseHouseEdge,
  adjustForStrategyAccuracy,
} from "./house-edge";
import { calculateAverageTrueCount } from "./counting";

/**
 * Get bet multiplier based on true count and spread
 */
function getBetMultiplier(trueCount: number, spread: BettingSpread): number {
  if (trueCount <= -2) return spread.spreadByCount["-2"] || 1;
  if (trueCount === -1) return spread.spreadByCount["-1"] || 1;
  if (trueCount === 0) return spread.spreadByCount["0"] || 1;
  if (trueCount === 1) return spread.spreadByCount["1"] || 2;
  if (trueCount === 2) return spread.spreadByCount["2"] || 3;
  if (trueCount === 3) return spread.spreadByCount["3"] || 4;
  if (trueCount >= 4) return spread.spreadByCount["4"] || spread.maxBet;
  return 1;
}

/**
 * Calculate EV with specific advantage play level
 */
export function calculateAdvantagePlayEV(params: {
  totalWagered: number;
  actualValue: number;
  level: AdvantagePlayLevel;
  strategyAccuracy?: number;
  decisionsData?: string;
  rules?: GameRules;
  averageBetSize?: number;
}): EVCalculation {
  const {
    totalWagered,
    actualValue,
    level,
    strategyAccuracy = 100,
    decisionsData,
    rules = DEFAULT_RULES,
    averageBetSize = totalWagered / 100,
  } = params;

  const baseHouseEdge = calculateBaseHouseEdge(rules);
  let adjustedHouseEdge = baseHouseEdge;
  let countAdvantage = 0;

  switch (level) {
    case "house-edge":
      adjustedHouseEdge = baseHouseEdge - 3.0;
      break;

    case "basic-strategy":
      adjustedHouseEdge = adjustForStrategyAccuracy(
        baseHouseEdge,
        strategyAccuracy,
      );
      break;

    case "card-counting-conservative": {
      const avgTrueCount = calculateAverageTrueCount(decisionsData);
      if (avgTrueCount !== null) {
        const betMultiplier = getBetMultiplier(
          Math.round(avgTrueCount),
          CONSERVATIVE_SPREAD,
        );
        countAdvantage = (avgTrueCount * 0.5 * betMultiplier) / 2;
        countAdvantage -= 0.2;
        const totalEdge = baseHouseEdge + countAdvantage;
        if (totalEdge < 0.65) {
          adjustedHouseEdge = 0.65;
          countAdvantage = 0;
        } else {
          adjustedHouseEdge = baseHouseEdge;
        }
      } else {
        adjustedHouseEdge = 0.65;
        countAdvantage = 0;
      }
      break;
    }

    case "card-counting-aggressive": {
      const avgTrueCount = calculateAverageTrueCount(decisionsData);
      if (avgTrueCount !== null) {
        const betMultiplier = getBetMultiplier(
          Math.round(avgTrueCount),
          AGGRESSIVE_SPREAD,
        );
        countAdvantage = (avgTrueCount * 0.5 * betMultiplier) / 1.5;
        countAdvantage -= 0.1;
        const totalEdge = baseHouseEdge + countAdvantage;
        if (totalEdge < 1.25) {
          adjustedHouseEdge = 1.25;
          countAdvantage = 0;
        } else {
          adjustedHouseEdge = baseHouseEdge;
        }
      } else {
        adjustedHouseEdge = 1.25;
        countAdvantage = 0;
      }
      break;
    }

    case "perfect-play": {
      const avgTrueCount = calculateAverageTrueCount(decisionsData);
      if (avgTrueCount !== null) {
        adjustedHouseEdge = 2.0;
        countAdvantage = Math.max(avgTrueCount * 0.8, 0) + 1.0;
      } else {
        adjustedHouseEdge = 3.0;
        countAdvantage = 0;
      }
      break;
    }
  }

  const finalEdge = adjustedHouseEdge + countAdvantage;
  const expectedValue = totalWagered * (finalEdge / 100);
  const variance = actualValue - expectedValue;
  const varanceInBB = averageBetSize > 0 ? variance / averageBetSize : 0;

  return {
    totalWagered,
    baseHouseEdge,
    adjustedHouseEdge,
    countAdvantage,
    finalEdge,
    expectedValue,
    actualValue,
    variance,
    varanceInBB,
  };
}

/**
 * Get description for advantage play level
 */
export function getAdvantagePlayDescription(level: AdvantagePlayLevel): string {
  switch (level) {
    case "house-edge":
      return "Typical recreational player with ~3% error rate (House Edge: ~3.5%)";
    case "basic-strategy":
      return "Perfect basic strategy play with no counting (House Edge: ~0.5%)";
    case "card-counting-conservative":
      return "Hi-Lo counting with 1-4 unit spread (Player Edge: ~0.65%)";
    case "card-counting-aggressive":
      return "Hi-Lo counting with 1-8 unit spread (Player Edge: ~1.25%)";
    case "perfect-play":
      return "Theoretical maximum with perfect information (Player Edge: ~3%)";
  }
}
