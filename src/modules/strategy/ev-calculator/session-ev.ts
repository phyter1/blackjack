import type { EVCalculation, GameRules } from "./types";
import { DEFAULT_RULES } from "./constants";
import { calculateBaseHouseEdge, adjustForStrategyAccuracy } from "./house-edge";
import { calculateCountAdvantage, calculateAverageTrueCount } from "./counting";

/**
 * Calculate expected value for a session
 */
export function calculateSessionEV(params: {
  totalWagered: number;
  actualValue: number;
  strategyAccuracy?: number;
  decisionsData?: string;
  rules?: GameRules;
}): EVCalculation {
  const {
    totalWagered,
    actualValue,
    strategyAccuracy = 100,
    decisionsData,
    rules = DEFAULT_RULES,
  } = params;

  // Calculate base house edge
  const baseHouseEdge = calculateBaseHouseEdge(rules);

  // Adjust for strategy accuracy
  const adjustedHouseEdge = adjustForStrategyAccuracy(
    baseHouseEdge,
    strategyAccuracy,
  );

  // Calculate count advantage if data available
  const averageTrueCount = calculateAverageTrueCount(decisionsData);
  const countAdvantage =
    averageTrueCount !== null ? calculateCountAdvantage(averageTrueCount) : 0;

  // Final edge (negative = house edge, positive = player edge)
  const finalEdge = adjustedHouseEdge + countAdvantage;

  // Expected value = total wagered × edge
  const expectedValue = totalWagered * (finalEdge / 100);

  // Variance = actual - expected
  const variance = actualValue - expectedValue;

  // Variance in big bets (assuming average bet = totalWagered / roundsPlayed)
  // Standard blackjack variance is approximately 1.15 bets per hand
  const varanceInBB = totalWagered > 0 ? variance / (totalWagered / 100) : 0;

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
