import { ACTION_HIT, ACTION_STAND } from "./action";
import { Bank, House } from "./bank";
import { type PlayerRoundInfo, Round } from "./round";
import { RuleSet } from "./rules/index";
import { Shoe } from "./shoe";

console.log("=== Complete Blackjack Round Test ===\n");

// Setup
const rules = new RuleSet();
const shoe = new Shoe(6, 0.75); // 6 decks, 75% penetration
const house = new House(100000);

// Create players with banks
const player1Bank = new Bank("player1", 1000);
const player2Bank = new Bank("player2", 1000);

// Create player round info
const playerInfo: PlayerRoundInfo[] = [
  { userId: "player1", bank: player1Bank, bet: 100 },
  { userId: "player2", bank: player2Bank, bet: 50 },
];

// Start a new round
console.log("Starting new round...");
const round = new Round(1, playerInfo, shoe, rules);

console.log("\n--- Initial Deal ---");
console.log(
  `Player 1 hand: ${round.playerHands[0].cards.map((c) => `${c.rank}${c.suit[0]}`).join(", ")} = ${round.playerHands[0].handValue}`,
);
console.log(
  `Player 2 hand: ${round.playerHands[1].cards.map((c) => `${c.rank}${c.suit[0]}`).join(", ")} = ${round.playerHands[1].handValue}`,
);
console.log(
  `Dealer up card: ${round.dealerHand.upCard.rank}${round.dealerHand.upCard.suit[0]}`,
);
console.log(`Round state: ${round.state}`);

console.log("\n--- Player 1's Turn ---");
console.log(`Current hand index: ${round.currentHandIndex}`);
console.log(`Hand value: ${round.currentHand.handValue}`);
console.log(`Available actions: ${round.getAvailableActions().join(", ")}`);

// Player 1 decides to hit
console.log("\nPlayer 1 hits...");
round.playAction(ACTION_HIT);
console.log(
  `New hand: ${round.playerHands[0].cards.map((c) => `${c.rank}${c.suit[0]}`).join(", ")} = ${round.playerHands[0].handValue}`,
);
console.log(`Hand state: ${round.playerHands[0].state}`);

// If still active, player 1 stands
if (round.state === "player_turn" && round.currentHandIndex === 0) {
  console.log("\nPlayer 1 stands.");
  round.playAction(ACTION_STAND);
}

console.log("\n--- Player 2's Turn ---");
if (round.state === "player_turn") {
  console.log(`Current hand index: ${round.currentHandIndex}`);
  console.log(`Hand value: ${round.currentHand.handValue}`);
  console.log(`Available actions: ${round.getAvailableActions().join(", ")}`);

  // Player 2 stands
  console.log("\nPlayer 2 stands.");
  round.playAction(ACTION_STAND);
}

console.log("\n--- Dealer's Turn ---");
console.log(`Round state: ${round.state}`);
console.log(
  `Dealer hand before: ${round.dealerHand.cards.map((c) => `${c.rank}${c.suit[0]}`).join(", ")} = ${round.dealerHand.handValue}`,
);

// Dealer turn happens automatically when last player finishes
console.log(
  `Dealer hand after: ${round.dealerHand.cards.map((c) => `${c.rank}${c.suit[0]}`).join(", ")} = ${round.dealerHand.handValue}`,
);
console.log(`Dealer state: ${round.dealerHand.state}`);

console.log("\n--- Settlement ---");
console.log(`Round state: ${round.state}`);
const results = round.settle(house);

results.forEach((result, i) => {
  console.log(`\nPlayer ${i + 1}:`);
  console.log(`  Hand value: ${result.playerHandValue}`);
  console.log(`  Dealer value: ${result.dealerHandValue}`);
  console.log(`  Outcome: ${result.outcome}`);
  console.log(`  Payout: $${result.payout}`);
  console.log(`  Profit: $${result.profit}`);
  console.log(
    `  New balance: $${i === 0 ? player1Bank.balance : player2Bank.balance}`,
  );
});

console.log("\n--- Final Summary ---");
console.log(`Round complete: ${round.isComplete}`);
console.log(`Round state: ${round.state}`);
console.log(`Player 1 balance: $1000 -> $${player1Bank.balance}`);
console.log(`Player 2 balance: $1000 -> $${player2Bank.balance}`);
console.log(`House profit/loss: $${house.profitLoss}`);
console.log(`Shoe remaining cards: ${shoe.remainingCards}`);
