/**
 * Example: Using Betting Rules
 *
 * This example demonstrates how to configure and use table betting rules
 * including minimum/maximum bets and bet unit denominations.
 */

import { Game } from "../src/modules/game/game";
import { RuleSet, getBettingLimits } from "../src/modules/game/rules";

console.log("=== Betting Rules Demo ===\n");

// Example 1: Default table limits
console.log("1. Default Table ($5-$10,000, $1 units):");
const defaultRules = new RuleSet().build();
const defaultLimits = getBettingLimits(defaultRules);
console.log(`   Min: $${defaultLimits.min}`);
console.log(`   Max: $${defaultLimits.max}`);
console.log(`   Unit: $${defaultLimits.unit}\n`);

// Example 2: Low-limit table
console.log("2. Low-Limit Table ($1-$100, $1 units):");
const lowLimitRules = new RuleSet().setTableLimits(1, 100, 1);
const lowLimitGame = new Game(6, 0.75, 1000000, lowLimitRules);
const lowLimits = getBettingLimits(lowLimitRules.build());
console.log(`   Min: $${lowLimits.min}`);
console.log(`   Max: $${lowLimits.max}`);
console.log(`   Unit: $${lowLimits.unit}`);

const player1 = lowLimitGame.addPlayer("Beginner Betty", 50);
lowLimitGame.startRound([{ playerId: player1.id, amount: 5 }]);
console.log("   ✓ Accepted $5 bet\n");

// Example 3: $5 table (typical casino)
console.log("3. Standard $5 Table ($5-$1,000, $5 units):");
const fiveRules = new RuleSet().setTableLimits(5, 1000, 5);
const fiveGame = new Game(6, 0.75, 1000000, fiveRules);
const fiveLimits = getBettingLimits(fiveRules.build());
console.log(`   Min: $${fiveLimits.min}`);
console.log(`   Max: $${fiveLimits.max}`);
console.log(`   Unit: $${fiveLimits.unit}`);

const player2 = fiveGame.addPlayer("Regular Rick", 500);
fiveGame.startRound([{ playerId: player2.id, amount: 25 }]);
console.log("   ✓ Accepted $25 bet (5 chips)\n");

// Example 4: $25 table
console.log("4. $25 Table ($25-$5,000, $25 units):");
const twentyFiveRules = new RuleSet().setTableLimits(25, 5000, 25);
const twentyFiveGame = new Game(6, 0.75, 1000000, twentyFiveRules);
const twentyFiveLimits = getBettingLimits(twentyFiveRules.build());
console.log(`   Min: $${twentyFiveLimits.min}`);
console.log(`   Max: $${twentyFiveLimits.max}`);
console.log(`   Unit: $${twentyFiveLimits.unit}`);

const player3 = twentyFiveGame.addPlayer("Mid-Roller Mike", 2000);
twentyFiveGame.startRound([{ playerId: player3.id, amount: 100 }]);
console.log("   ✓ Accepted $100 bet (4 chips)\n");

// Example 5: High-roller table
console.log("5. High-Roller Table ($100-$100,000, $100 units):");
const highRollerRules = new RuleSet().setTableLimits(100, 100000, 100);
const highRollerGame = new Game(6, 0.75, 10000000, highRollerRules);
const highRollerLimits = getBettingLimits(highRollerRules.build());
console.log(`   Min: $${highRollerLimits.min}`);
console.log(`   Max: $${highRollerLimits.max}`);
console.log(`   Unit: $${highRollerLimits.unit}`);

const player4 = highRollerGame.addPlayer("Whale Winston", 500000);
highRollerGame.startRound([{ playerId: player4.id, amount: 10000 }]);
console.log("   ✓ Accepted $10,000 bet (100 chips)\n");

// Example 6: Demonstrating validation errors
console.log("6. Validation Errors:");
const strictGame = new Game(6, 0.75, 1000000, fiveRules);
const player5 = strictGame.addPlayer("Test Player", 1000);

try {
  strictGame.startRound([{ playerId: player5.id, amount: 3 }]);
} catch (error) {
  console.log(`   ✗ $3 bet rejected: ${(error as Error).message}`);
}

const strictGame2 = new Game(6, 0.75, 1000000, fiveRules);
const player6 = strictGame2.addPlayer("Test Player 2", 10000);

try {
  strictGame2.startRound([{ playerId: player6.id, amount: 2000 }]);
} catch (error) {
  console.log(`   ✗ $2,000 bet rejected: ${(error as Error).message}`);
}

const strictGame3 = new Game(6, 0.75, 1000000, fiveRules);
const player7 = strictGame3.addPlayer("Test Player 3", 1000);

try {
  strictGame3.startRound([{ playerId: player7.id, amount: 12 }]);
} catch (error) {
  console.log(`   ✗ $12 bet rejected: ${(error as Error).message}`);
}

console.log("\n=== Demo Complete ===");
