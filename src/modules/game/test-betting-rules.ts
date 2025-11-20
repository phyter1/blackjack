/**
 * Test script for betting rules functionality
 *
 * Tests:
 * - Table min/max bet validation
 * - Bet unit/denomination validation
 * - Integration with Game class
 * - RuleSet builder methods
 */

import { Game } from "./game";
import {
  type BetValidationResult,
  getBettingLimits,
  RuleSet,
  validateBet,
} from "./rules/index";

// ANSI color codes for terminal output
const GREEN = "\x1b[32m";
const RED = "\x1b[31m";
const BLUE = "\x1b[34m";
const RESET = "\x1b[0m";
const BOLD = "\x1b[1m";

function logTest(name: string) {
  console.log(`\n${BOLD}${BLUE}[TEST]${RESET} ${name}`);
}

function logPass(message: string) {
  console.log(`  ${GREEN}✓${RESET} ${message}`);
}

function logFail(message: string) {
  console.log(`  ${RED}✗${RESET} ${message}`);
  throw new Error(`Test failed: ${message}`);
}

function assertEqual<T>(actual: T, expected: T, message: string) {
  if (actual === expected) {
    logPass(message);
  } else {
    logFail(`${message} (expected: ${expected}, got: ${actual})`);
  }
}

function assertValidationError(
  result: BetValidationResult,
  expectedError: string,
) {
  if (!result.valid && result.error?.includes(expectedError)) {
    logPass(`Validation correctly rejected: ${result.error}`);
  } else {
    logFail(
      `Expected error containing "${expectedError}", got: ${result.error}`,
    );
  }
}

function assertValidationSuccess(result: BetValidationResult) {
  if (result.valid) {
    logPass("Validation passed");
  } else {
    logFail(`Expected validation to pass, got error: ${result.error}`);
  }
}

// Test 1: Default betting rules
logTest("Default Betting Rules");
const defaultRules = new RuleSet().build();
assertEqual(defaultRules.tableMinBet.amount, 5, "Default min bet is $5");
assertEqual(
  defaultRules.tableMaxBet.amount,
  10000,
  "Default max bet is $10,000",
);
assertEqual(defaultRules.betUnit.unit, 1, "Default bet unit is $1");

// Test 2: Bet validation with default rules
logTest("Bet Validation - Default Rules");
assertValidationSuccess(validateBet(5, defaultRules));
assertValidationSuccess(validateBet(100, defaultRules));
assertValidationSuccess(validateBet(10000, defaultRules));
assertValidationError(validateBet(4, defaultRules), "below table minimum");
assertValidationError(
  validateBet(10001, defaultRules),
  "exceeds table maximum",
);
assertValidationError(validateBet(0, defaultRules), "greater than zero");
assertValidationError(validateBet(-10, defaultRules), "greater than zero");

// Test 3: Custom table limits
logTest("Custom Table Limits");
const highRollerRules = new RuleSet()
  .setTableMinBet(100)
  .setTableMaxBet(50000)
  .setBetUnit(25)
  .build();

assertEqual(highRollerRules.tableMinBet.amount, 100, "Min bet is $100");
assertEqual(highRollerRules.tableMaxBet.amount, 50000, "Max bet is $50,000");
assertEqual(highRollerRules.betUnit.unit, 25, "Bet unit is $25");

// Test 4: Bet unit validation
logTest("Bet Unit Validation");
assertValidationSuccess(validateBet(100, highRollerRules));
assertValidationSuccess(validateBet(500, highRollerRules));
assertValidationSuccess(validateBet(1000, highRollerRules));
assertValidationError(validateBet(110, highRollerRules), "multiple of $25");
assertValidationError(validateBet(237, highRollerRules), "multiple of $25");

// Test 5: setTableLimits convenience method
logTest("setTableLimits Convenience Method");
const pennySlotsRules = new RuleSet().setTableLimits(1, 100, 1).build();

assertEqual(pennySlotsRules.tableMinBet.amount, 1, "Min bet is $1");
assertEqual(pennySlotsRules.tableMaxBet.amount, 100, "Max bet is $100");
assertEqual(pennySlotsRules.betUnit.unit, 1, "Bet unit is $1");

// Test 6: getBettingLimits utility
logTest("getBettingLimits Utility");
const limits = getBettingLimits(highRollerRules);
assertEqual(limits.min, 100, "Limits min is $100");
assertEqual(limits.max, 50000, "Limits max is $50,000");
assertEqual(limits.unit, 25, "Limits unit is $25");

// Test 7: Game integration - valid bets
logTest("Game Integration - Valid Bets");
const lowLimitRules1 = new RuleSet().setTableLimits(5, 500, 5);
const game1 = new Game(6, 0.75, 1000000, lowLimitRules1);
const player1 = game1.addPlayer("Alice", 1000);

try {
  game1.startRound([{ playerId: player1.id, amount: 10 }]);
  logPass("Game accepted valid bet of $10");
} catch (error) {
  logFail(`Game rejected valid bet: ${(error as Error).message}`);
}

// Test 8: Game integration - bet below minimum
logTest("Game Integration - Bet Below Minimum");
const lowLimitRules2 = new RuleSet().setTableLimits(5, 500, 5);
const game2 = new Game(6, 0.75, 1000000, lowLimitRules2);
const player2 = game2.addPlayer("Bob", 1000);

try {
  game2.startRound([{ playerId: player2.id, amount: 3 }]);
  logFail("Game should have rejected bet below minimum");
} catch (error) {
  const message = (error as Error).message;
  if (message.includes("below table minimum")) {
    logPass(`Game correctly rejected bet below minimum: ${message}`);
  } else {
    logFail(`Unexpected error: ${message}`);
  }
}

// Test 9: Game integration - bet above maximum
logTest("Game Integration - Bet Above Maximum");
const lowLimitRules3 = new RuleSet().setTableLimits(5, 500, 5);
const game3 = new Game(6, 0.75, 1000000, lowLimitRules3);
const player3 = game3.addPlayer("Charlie", 1000);

try {
  game3.startRound([{ playerId: player3.id, amount: 600 }]);
  logFail("Game should have rejected bet above maximum");
} catch (error) {
  const message = (error as Error).message;
  if (message.includes("exceeds table maximum")) {
    logPass(`Game correctly rejected bet above maximum: ${message}`);
  } else {
    logFail(`Unexpected error: ${message}`);
  }
}

// Test 10: Game integration - invalid bet unit
logTest("Game Integration - Invalid Bet Unit");
const lowLimitRules4 = new RuleSet().setTableLimits(5, 500, 5);
const game4 = new Game(6, 0.75, 1000000, lowLimitRules4);
const player4 = game4.addPlayer("Diana", 1000);

try {
  game4.startRound([{ playerId: player4.id, amount: 12 }]);
  logFail("Game should have rejected bet not matching unit");
} catch (error) {
  const message = (error as Error).message;
  if (message.includes("multiple of")) {
    logPass(`Game correctly rejected invalid bet unit: ${message}`);
  } else {
    logFail(`Unexpected error: ${message}`);
  }
}

// Test 11: Multiple different table configurations
logTest("Multiple Table Configurations");
const configs = [
  { name: "Penny Table", min: 1, max: 50, unit: 1 },
  { name: "$5 Table", min: 5, max: 1000, unit: 5 },
  { name: "$25 Table", min: 25, max: 5000, unit: 25 },
  { name: "High Roller", min: 100, max: 100000, unit: 100 },
];

for (const config of configs) {
  const rules = new RuleSet()
    .setTableLimits(config.min, config.max, config.unit)
    .build();

  // Test min bet
  assertValidationSuccess(validateBet(config.min, rules));

  // Test max bet
  assertValidationSuccess(validateBet(config.max, rules));

  // Test below min
  if (config.min > 1) {
    const result = validateBet(config.min - 1, rules);
    if (result.valid) {
      logFail(`${config.name}: Should reject bet below minimum`);
    } else {
      logPass(`${config.name}: Correctly rejects bet below minimum`);
    }
  }

  // Test above max
  const aboveMaxResult = validateBet(config.max + config.unit, rules);
  if (aboveMaxResult.valid) {
    logFail(`${config.name}: Should reject bet above maximum`);
  } else {
    logPass(`${config.name}: Correctly rejects bet above maximum`);
  }
}

// Test 12: Edge cases
logTest("Edge Cases");

// Zero bet
assertValidationError(validateBet(0, defaultRules), "greater than zero");

// Negative bet
assertValidationError(validateBet(-100, defaultRules), "greater than zero");

// Very large bet
const ultraHighRollerRules = new RuleSet()
  .setTableLimits(1000, 1000000, 1000)
  .build();
assertValidationSuccess(validateBet(1000000, ultraHighRollerRules));

// Floating point bet with unit of 1
const floatingRules = new RuleSet().setTableLimits(1, 1000, 0.01).build();
assertValidationSuccess(validateBet(10.5, floatingRules));

console.log(
  `\n${GREEN}${BOLD}✓ All tests passed!${RESET} Betting rules implementation is working correctly.\n`,
);
