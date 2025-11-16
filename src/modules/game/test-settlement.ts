import { Bank, House } from "./bank";
import { newDeck } from "./cards";
import { DealerHand } from "./dealer-hand";
import { Hand } from "./hand";
import { RuleSet } from "./rules";
import { settleHand } from "./settlement";

// Create a standard ruleset
const rules = new RuleSet().build();

// Create house with initial bankroll
const house = new House(100000);

console.log("=== Blackjack Settlement Tests ===\n");

// Test 1: Player Blackjack vs Dealer 20
console.log("Test 1: Player Blackjack vs Dealer 20");
const playerBank1 = new Bank("player1", 1000);
const initialBalance1 = playerBank1.balance;
const playerHand1 = new Hand(
  new RuleSet(),
  "player1",
  playerBank1,
  100,
  { suit: "hearts", rank: "K" }, // dealer up card
  false,
  false,
  0,
);
playerHand1.start([
  { suit: "spades", rank: "A" },
  { suit: "hearts", rank: "K" },
]);

const dealerHand1 = new DealerHand(
  [
    { suit: "hearts", rank: "K" },
    { suit: "diamonds", rank: "10" },
  ],
  new RuleSet(),
);

const result1 = settleHand(playerHand1, dealerHand1, house, rules);
console.log(`  Outcome: ${result1.outcome}`);
console.log(`  Player hand: ${result1.playerHandValue}`);
console.log(`  Dealer hand: ${result1.dealerHandValue}`);
console.log(`  Payout: $${result1.payout}`);
console.log(`  Profit: $${result1.profit}`);
console.log(
  `  Player balance: $${initialBalance1} -> $${playerBank1.balance}`,
);
console.log(`  Expected: Blackjack, $250 payout (3:2), $150 profit\n`);

// Test 2: Player 20 vs Dealer 19 (Regular Win)
console.log("Test 2: Player 20 vs Dealer 19");
const playerBank2 = new Bank("player2", 1000);
const initialBalance2 = playerBank2.balance;
const playerHand2 = new Hand(
  new RuleSet(),
  "player2",
  playerBank2,
  100,
  { suit: "hearts", rank: "9" },
  false,
  false,
  0,
);
playerHand2.start([
  { suit: "spades", rank: "K" },
  { suit: "hearts", rank: "10" },
]);

const dealerHand2 = new DealerHand(
  [
    { suit: "hearts", rank: "9" },
    { suit: "diamonds", rank: "10" },
  ],
  new RuleSet(),
);

const result2 = settleHand(playerHand2, dealerHand2, house, rules);
console.log(`  Outcome: ${result2.outcome}`);
console.log(`  Payout: $${result2.payout}`);
console.log(`  Profit: $${result2.profit}`);
console.log(
  `  Player balance: $${initialBalance2} -> $${playerBank2.balance}`,
);
console.log(`  Expected: Win, $200 payout (1:1), $100 profit\n`);

// Test 3: Player 18 vs Dealer 20 (Loss)
console.log("Test 3: Player 18 vs Dealer 20");
const playerBank3 = new Bank("player3", 1000);
const initialBalance3 = playerBank3.balance;
const playerHand3 = new Hand(
  new RuleSet(),
  "player3",
  playerBank3,
  100,
  { suit: "hearts", rank: "K" },
  false,
  false,
  0,
);
playerHand3.start([
  { suit: "spades", rank: "8" },
  { suit: "hearts", rank: "10" },
]);

const dealerHand3 = new DealerHand(
  [
    { suit: "hearts", rank: "K" },
    { suit: "diamonds", rank: "10" },
  ],
  new RuleSet(),
);

const result3 = settleHand(playerHand3, dealerHand3, house, rules);
console.log(`  Outcome: ${result3.outcome}`);
console.log(`  Payout: $${result3.payout}`);
console.log(`  Profit: $${result3.profit}`);
console.log(
  `  Player balance: $${initialBalance3} -> $${playerBank3.balance}`,
);
console.log(`  Expected: Lose, $0 payout, -$100 profit\n`);

// Test 4: Player 19 vs Dealer 19 (Push)
console.log("Test 4: Player 19 vs Dealer 19");
const playerBank4 = new Bank("player4", 1000);
const initialBalance4 = playerBank4.balance;
const playerHand4 = new Hand(
  new RuleSet(),
  "player4",
  playerBank4,
  100,
  { suit: "hearts", rank: "9" },
  false,
  false,
  0,
);
playerHand4.start([
  { suit: "spades", rank: "9" },
  { suit: "hearts", rank: "10" },
]);

const dealerHand4 = new DealerHand(
  [
    { suit: "hearts", rank: "9" },
    { suit: "diamonds", rank: "10" },
  ],
  new RuleSet(),
);

const result4 = settleHand(playerHand4, dealerHand4, house, rules);
console.log(`  Outcome: ${result4.outcome}`);
console.log(`  Payout: $${result4.payout}`);
console.log(`  Profit: $${result4.profit}`);
console.log(
  `  Player balance: $${initialBalance4} -> $${playerBank4.balance}`,
);
console.log(`  Expected: Push, $100 payout, $0 profit\n`);

// Test 5: Player Bust
console.log("Test 5: Player Bust (25)");
const playerBank5 = new Bank("player5", 1000);
const initialBalance5 = playerBank5.balance;
const playerHand5 = new Hand(
  new RuleSet(),
  "player5",
  playerBank5,
  100,
  { suit: "hearts", rank: "9" },
  false,
  false,
  0,
);
playerHand5.start([
  { suit: "spades", rank: "K" },
  { suit: "hearts", rank: "10" },
]);
playerHand5.hit({ suit: "diamonds", rank: "5" }); // Bust with 25

const dealerHand5 = new DealerHand(
  [
    { suit: "hearts", rank: "9" },
    { suit: "diamonds", rank: "10" },
  ],
  new RuleSet(),
);

const result5 = settleHand(playerHand5, dealerHand5, house, rules);
console.log(`  Outcome: ${result5.outcome}`);
console.log(`  Payout: $${result5.payout}`);
console.log(`  Profit: $${result5.profit}`);
console.log(
  `  Player balance: $${initialBalance5} -> $${playerBank5.balance}`,
);
console.log(`  Expected: Lose, $0 payout, -$100 profit\n`);

console.log("=== House Summary ===");
console.log(`House Profit/Loss: $${house.profitLoss}`);
console.log(
  `Expected: -$50 (lost $150 on BJ, won $100, lost $100, won $100, won $100)`,
);
