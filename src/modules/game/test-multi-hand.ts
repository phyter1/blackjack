/**
 * Integration test for multi-hand gameplay
 * Demonstrates a player playing multiple hands simultaneously
 */

import { Game } from "./game";
import { RuleSet } from "./rules";
import { ACTION_HIT, ACTION_STAND } from "./action";

console.log("=== Multi-Hand Blackjack Test ===\n");

// Create a game
const rules = new RuleSet();
const game = new Game(6, 0.75, 1000000, rules);

// Add a player with sufficient bankroll for multiple bets
const player = game.addPlayer("Alice", 1000);
console.log(`Player added: ${player.name} with $${player.bank.balance}\n`);

// Test Case 1: Player places 3 bets (3 hands)
console.log("--- Test Case 1: Playing 3 Hands Simultaneously ---\n");

const bets = [
  { playerId: player.id, amount: 100 }, // Hand 1
  { playerId: player.id, amount: 50 }, // Hand 2
  { playerId: player.id, amount: 75 }, // Hand 3
];

const round = game.startRound(bets);
console.log(`Round started with ${round.playerHands.length} hands`);
console.log(`Player balance after bets: $${player.bank.balance}\n`);

// Display all hands
round.playerHands.forEach((hand, index) => {
  console.log(`Hand ${index + 1} (Index ${hand.originalHandIndex}):`);
  console.log(`  - Bet: $${hand.betAmount}`);
  console.log(
    `  - Cards: ${hand.cards.map((c) => `${c.rank}${c.suit}`).join(", ")}`,
  );
  console.log(`  - Value: ${hand.handValue}`);
  console.log(`  - State: ${hand.state}`);
  console.log(`  - Is Split: ${hand.isSplit}`);
  console.log(`  - Parent Hand ID: ${hand.parentHandId ?? "None"}`);
  console.log();
});

console.log(
  `Dealer's up card: ${round.dealerHand.upCard.rank}${round.dealerHand.upCard.suit}\n`,
);

// Skip insurance phase if offered
if (round.state === "insurance") {
  console.log("Insurance offered - declining for all hands\n");
  round.playerHands.forEach((_, index) => {
    game.declineInsurance(index);
  });
  game.resolveInsurance();
}

// Play each hand
if (round.state === "player_turn") {
  console.log("--- Playing Hands ---\n");

  while (round.state === "player_turn") {
    const currentHand = round.currentHand;
    const handNumber = round.currentHandIndex + 1;

    console.log(
      `Playing Hand ${handNumber} (Original Index ${currentHand.originalHandIndex}):`,
    );
    console.log(`  Current value: ${currentHand.handValue}`);
    console.log(
      `  Available actions: ${currentHand.availableActions.join(", ")}`,
    );

    // Simple strategy: stand on 17+, hit otherwise
    if (currentHand.handValue >= 17) {
      console.log(`  Action: STAND`);
      game.playAction(ACTION_STAND);
    } else {
      console.log(`  Action: HIT`);
      game.playAction(ACTION_HIT);

      // Show updated hand if still active
      if (currentHand.state === "active") {
        console.log(`  New value: ${currentHand.handValue}`);
        console.log(
          `  New cards: ${
            currentHand.cards.map((c) => `${c.rank}${c.suit}`).join(", ")
          }`,
        );
      } else {
        console.log(`  Hand state: ${currentHand.state}`);
      }
    }
    console.log();
  }
}

// Display dealer's hand
console.log("--- Dealer's Turn ---\n");
console.log(
  `Dealer's final hand: ${
    round.dealerHand.cards.map((c) => `${c.rank}${c.suit}`).join(", ")
  }`,
);
console.log(`Dealer's value: ${round.dealerHand.handValue}`);
console.log(`Dealer's state: ${round.dealerHand.state}\n`);

// Display settlement results
if (round.settlementResults) {
  console.log("--- Settlement Results ---\n");
  round.settlementResults.forEach((result, index) => {
    console.log(`Hand ${index + 1}:`);
    console.log(`  Outcome: ${result.outcome}`);
    console.log(`  Payout: $${result.payout}`);
    console.log(`  Profit/Loss: $${result.profit}`);
    console.log();
  });
}

console.log(`Player's final balance: $${player.bank.balance}`);
console.log(`Balance change: $${player.bank.balance - 1000}\n`);

// Complete the round
game.completeRound();

// Test Case 2: Mix of single and multi-hand rounds
console.log("--- Test Case 2: Single Hand Round ---\n");

const singleBet = [{ playerId: player.id, amount: 100 }];
const round2 = game.startRound(singleBet);

console.log(`Round started with ${round2.playerHands.length} hand(s)`);
console.log(
  `Hand 1 (Index ${round2.playerHands[0].originalHandIndex}): ${
    round2.playerHands[0].cards.map((c) => `${c.rank}${c.suit}`).join(", ")
  }\n`,
);

// Play out the round quickly
if (round2.state === "insurance") {
  game.declineInsurance(0);
  game.resolveInsurance();
}

while (round2.state === "player_turn") {
  const currentHand = round2.currentHand;
  if (currentHand.handValue >= 17) {
    game.playAction(ACTION_STAND);
  } else {
    game.playAction(ACTION_HIT);
  }
}

game.completeRound();

console.log("--- Summary ---\n");
console.log(`Total rounds played: ${game.getStats().roundNumber}`);
console.log(`Player final balance: $${player.bank.balance}`);
console.log(`Total profit/loss: $${player.bank.balance - 1000}`);

// Get audit summary
const auditSummary = game.getAuditTrailJSON();
console.log("\nAudit Trail Summary:");
console.log(auditSummary);

game.endSession();

console.log("\n=== Multi-Hand Test Complete ===");
