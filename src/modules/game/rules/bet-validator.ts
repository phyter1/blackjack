/**
 * Bet validation utilities
 *
 * This module provides functions to validate bets against table rules
 * including minimum, maximum, and unit denomination requirements.
 */

import type { CompleteRuleSet } from "./types";

/**
 * Result of bet validation
 */
export type BetValidationResult = {
  valid: boolean;
  error?: string;
};

/**
 * Validate a bet amount against table rules
 *
 * Checks:
 * - Bet is greater than zero
 * - Bet meets table minimum
 * - Bet does not exceed table maximum
 * - Bet is a multiple of the bet unit
 *
 * @param amount - The bet amount to validate
 * @param rules - The complete ruleset containing betting rules
 * @returns Validation result with error message if invalid
 *
 * @example
 * ```typescript
 * const rules = new RuleSet()
 *   .setTableLimits(5, 1000, 5)
 *   .build();
 *
 * validateBet(10, rules); // { valid: true }
 * validateBet(3, rules);  // { valid: false, error: "Bet amount ($3) is below table minimum ($5)" }
 * validateBet(7, rules);  // { valid: false, error: "Bet amount ($7) must be a multiple of $5" }
 * ```
 */
export function validateBet(
  amount: number,
  rules: CompleteRuleSet,
): BetValidationResult {
  // Check if bet is positive
  if (amount <= 0) {
    return {
      valid: false,
      error: `Bet amount must be greater than zero (got $${amount})`,
    };
  }

  // Check table minimum
  const minBet = rules.tableMinBet.amount;
  if (amount < minBet) {
    return {
      valid: false,
      error: `Bet amount ($${amount}) is below table minimum ($${minBet})`,
    };
  }

  // Check table maximum
  const maxBet = rules.tableMaxBet.amount;
  if (amount > maxBet) {
    return {
      valid: false,
      error: `Bet amount ($${amount}) exceeds table maximum ($${maxBet})`,
    };
  }

  // Check bet unit (denomination)
  const unit = rules.betUnit.unit;
  if (unit > 0) {
    // Use tolerance for floating point comparison to avoid precision issues
    const remainder = amount % unit;
    const tolerance = 0.0001;
    if (remainder > tolerance && remainder < unit - tolerance) {
      return {
        valid: false,
        error: `Bet amount ($${amount}) must be a multiple of $${unit}`,
      };
    }
  }

  return { valid: true };
}

/**
 * Check if a bet is valid (boolean shorthand)
 *
 * @param amount - The bet amount to validate
 * @param rules - The complete ruleset containing betting rules
 * @returns true if bet is valid, false otherwise
 */
export function isValidBet(amount: number, rules: CompleteRuleSet): boolean {
  return validateBet(amount, rules).valid;
}

/**
 * Get betting limits summary from rules
 *
 * @param rules - The complete ruleset
 * @returns Object with min, max, and unit
 */
export function getBettingLimits(rules: CompleteRuleSet) {
  return {
    min: rules.tableMinBet.amount,
    max: rules.tableMaxBet.amount,
    unit: rules.betUnit.unit,
  };
}
