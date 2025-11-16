import { ACTION_HIT, ACTION_STAND } from "./action";
import { Game } from "./game";
import { COMMON_RULESETS } from "./rules";

console.log("=== Blackjack Game Example ===\n");

// Create a game with Vegas Strip rules
const game = new Game(
  6, // 6 decks
  0.75, // 75% penetration
  1000000, // House bankroll
  COMMON_RULESETS.vegasStrip(), // Vegas Strip rules
);

console.log("Game initialized:");
console.log(`  Rules: ${game.getRulesDescription()}`);
console.log(`  House edge: ${game.getHouseEdge().toFixed(2)}%`);
console.log(`  Initial stats: ${JSON.stringify(game.getStats(), null, 2)}\n`);

// Add some players
console.log("Adding players...");
const player1 = game.addPlayer("Alice", 1000);
const player2 = game.addPlayer("Bob", 1500);
const player3 = game.addPlayer("Charlie", 500);

console.log(`  ${player1.name} joined with $${player1.bank.balance}`);
console.log(`  ${player2.name} joined with $${player2.bank.balance}`);
console.log(`  ${player3.name} joined with $${player3.bank.balance}\n`);

// Play a few rounds
for (let i = 1; i <= 3; i++) {
  console.log(`\n${"=".repeat(60)}`);
  console.log(`ROUND ${i}`);
  console.log("=".repeat(60));

  // Place bets
  console.log("\n--- Betting ---");
  const bets = [
    { playerId: player1.id, amount: 100 },
    { playerId: player2.id, amount: 50 },
    { playerId: player3.id, amount: 25 },
  ];

  console.log(`  ${player1.name} bets $100`);
  console.log(`  ${player2.name} bets $50`);
  console.log(`  ${player3.name} bets $25`);

  // Start round
  const round = game.startRound(bets);

  console.log("\n--- Initial Deal ---");
  round.playerHands.forEach((hand, idx) => {
    const player = game.getAllPlayers()[idx];
    console.log(
      `  ${player.name}: ${hand.cards.map((c) => `${c.rank}${c.suit[0]}`).join(", ")} = ${hand.handValue}`,
    );
  });
  console.log(
    `  Dealer: ${round.dealerHand.upCard.rank}${round.dealerHand.upCard.suit[0]} + ?`,
  );

  // Play each hand (simple strategy: stand on 17+, hit otherwise)
  console.log("\n--- Player Actions ---");
  while (round.state === "player_turn") {
    const currentHand = round.currentHand;
    const currentPlayer = game.getAllPlayers()[round.currentHandIndex];
    const handValue = currentHand.handValue;
    const availableActions = game.getAvailableActions();

    console.log(
      `\n  ${currentPlayer.name}'s turn (hand value: ${handValue})`,
    );
    console.log(`    Available: ${availableActions.join(", ")}`);

    // Simple strategy: stand on 17+, otherwise hit
    if (handValue >= 17) {
      console.log(`    Decision: STAND`);
      game.playAction(ACTION_STAND);
    } else {
      console.log(`    Decision: HIT`);
      game.playAction(ACTION_HIT);

      // Show new hand if still active
      if (currentHand.state === "active") {
        console.log(
          `    New hand: ${currentHand.cards.map((c) => `${c.rank}${c.suit[0]}`).join(", ")} = ${currentHand.handValue}`,
        );
      } else if (currentHand.state === "busted") {
        console.log(`    BUSTED! (${currentHand.handValue})`);
      }
    }
  }

  // Dealer's turn happens automatically
  console.log("\n--- Dealer's Turn ---");
  console.log(
    `  Dealer hand: ${round.dealerHand.cards.map((c) => `${c.rank}${c.suit[0]}`).join(", ")} = ${round.dealerHand.handValue}`,
  );
  console.log(`  Dealer ${round.dealerHand.state}`);

  // Results
  console.log("\n--- Results ---");
  if (round.settlementResults) {
    round.settlementResults.forEach((result, idx) => {
      const player = game.getAllPlayers()[idx];
      const profitStr =
        result.profit > 0
          ? `+$${result.profit}`
          : result.profit < 0
          ? `-$${Math.abs(result.profit)}`
          : "$0";

      console.log(
        `  ${player.name}: ${result.playerHandValue} vs ${result.dealerHandValue} = ${result.outcome.toUpperCase()} (${profitStr})`,
      );
      console.log(
        `    New balance: $${player.bank.balance}`,
      );
    });
  }

  // Complete the round
  game.completeRound();

  // Show stats
  const stats = game.getStats();
  console.log("\n--- Round Summary ---");
  console.log(`  House profit this round: $${stats.houseProfit}`);
  console.log(`  Remaining cards in shoe: ${stats.shoeRemainingCards}`);
}

// Final summary
console.log("\n\n" + "=".repeat(60));
console.log("FINAL SUMMARY");
console.log("=".repeat(60));

game.getAllPlayers().forEach((player) => {
  const netChange = player.bank.balance -
    (player.name === "Alice" ? 1000 : player.name === "Bob" ? 1500 : 500);
  const changeStr =
    netChange > 0
      ? `+$${netChange}`
      : netChange < 0
      ? `-$${Math.abs(netChange)}`
      : "$0";

  console.log(`${player.name}: $${player.bank.balance} (${changeStr})`);
});

const stats = game.getStats();
console.log(`\nHouse: $${stats.houseBankroll} (profit: $${stats.houseProfit})`);
console.log(`\nTotal rounds played: ${stats.roundNumber}`);
console.log(`Shoe status: ${stats.shoeComplete ? "Complete (needs reshuffle)" : `${stats.shoeRemainingCards} cards remaining`}`);
