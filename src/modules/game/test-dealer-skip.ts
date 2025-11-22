/**
 * Test script to verify dealer skips playing when all player hands bust or surrender
 */

import { ACTION_HIT, ACTION_SURRENDER } from "./action";
import { Bank, House } from "./bank";
import { type PlayerRoundInfo, Round } from "./round";
import { RuleSet } from "./rules/index";
import { Shoe } from "./shoe";
import { createCard } from "./test-deck-builder";
import type { Stack } from "./cards";

console.log("=== Dealer Skip Tests ===\n");

// Test 1: All players bust - dealer should skip playing
function testDealerSkipsWhenAllPlayersBust() {
  console.log("Test 1: Dealer skips when all players bust");

  // Create a deterministic deck
  // Deal order: P1 card1, P1 card2, P2 card1, P2 card2, Dealer card1, Dealer card2
  const testDeck: Stack = [
    createCard("10", "hearts"), // Player 1 card 1
    createCard("7", "clubs"), // Player 1 card 2 (17 total)
    createCard("10", "diamonds"), // Player 2 card 1
    createCard("6", "hearts"), // Player 2 card 2 (16 total)
    createCard("6", "diamonds"), // Dealer card 1
    createCard("5", "spades"), // Dealer card 2
    // Player actions
    createCard("10", "spades"), // Player 1 hits -> 27 (bust)
    createCard("9", "clubs"), // Player 2 hits -> 25 (bust)
  ];

  const shoe = new Shoe(1, 0.75, testDeck);
  const house = new House(100000);
  const rules = new RuleSet();

  const player1Bank = new Bank("player1", 1000);
  const player2Bank = new Bank("player2", 1000);

  const playerInfo: PlayerRoundInfo[] = [
    { userId: "player1", bank: player1Bank, bet: 100 },
    { userId: "player2", bank: player2Bank, bet: 100 },
  ];

  const round = new Round(1, playerInfo, shoe, rules);

  console.log(`  Initial dealer cards: ${round.dealerHand.cards.length}`);
  console.log(
    `  Player 1: ${round.playerHands[0].cards.map((c) => c.rank).join(",")} = ${round.playerHands[0].handValue}`,
  );
  console.log(
    `  Player 2: ${round.playerHands[1].cards.map((c) => c.rank).join(",")} = ${round.playerHands[1].handValue}`,
  );

  // Player 1 hits and busts
  round.playAction(ACTION_HIT);
  console.log(
    `  Player 1 after hit: ${round.playerHands[0].cards.map((c) => c.rank).join(",")} = ${round.playerHands[0].handValue} (${round.playerHands[0].state})`,
  );

  // Player 2 hits and busts
  round.playAction(ACTION_HIT);
  console.log(
    `  Player 2 after hit: ${round.playerHands[1].cards.map((c) => c.rank).join(",")} = ${round.playerHands[1].handValue} (${round.playerHands[1].state})`,
  );

  console.log(`  Round state: ${round.state}`);
  console.log(
    `  Dealer cards after all busts: ${round.dealerHand.cards.length}`,
  );

  // Verify dealer didn't draw additional cards (should still have 2)
  if (round.dealerHand.cards.length === 2) {
    console.log("  ✓ PASS: Dealer correctly skipped playing (2 cards)\n");
  } else {
    console.log(
      `  ✗ FAIL: Dealer drew extra cards (${round.dealerHand.cards.length} cards)\n`,
    );
  }

  // Verify round is in settling state
  if (round.state === "settling") {
    console.log("  ✓ PASS: Round moved to settling state\n");
  } else {
    console.log(`  ✗ FAIL: Round in wrong state: ${round.state}\n`);
  }
}

// Test 2: All players surrender - dealer should skip playing
function testDealerSkipsWhenAllPlayersSurrender() {
  console.log("Test 2: Dealer skips when all players surrender");

  const testDeck: Stack = [
    createCard("9", "hearts"), // Player 1 first card
    createCard("8", "diamonds"), // Player 2 first card
    createCard("5", "spades"), // Dealer hole card
    createCard("7", "clubs"), // Player 1 second card (16)
    createCard("6", "hearts"), // Player 2 second card (14)
    createCard("10", "diamonds"), // Dealer up card
  ];

  const shoe = new Shoe(1, 0.75, testDeck);
  const house = new House(100000);
  const rules = new RuleSet().setSurrender("late");

  const player1Bank = new Bank("player1", 1000);
  const player2Bank = new Bank("player2", 1000);

  const playerInfo: PlayerRoundInfo[] = [
    { userId: "player1", bank: player1Bank, bet: 100 },
    { userId: "player2", bank: player2Bank, bet: 100 },
  ];

  const round = new Round(1, playerInfo, shoe, rules);

  console.log(`  Initial dealer cards: ${round.dealerHand.cards.length}`);
  console.log(
    `  Player 1: ${round.playerHands[0].cards.map((c) => c.rank).join(",")} = ${round.playerHands[0].handValue}`,
  );
  console.log(
    `  Player 2: ${round.playerHands[1].cards.map((c) => c.rank).join(",")} = ${round.playerHands[1].handValue}`,
  );

  // Player 1 surrenders
  round.playAction(ACTION_SURRENDER);
  console.log(`  Player 1 surrendered (${round.playerHands[0].state})`);

  // Player 2 surrenders
  round.playAction(ACTION_SURRENDER);
  console.log(`  Player 2 surrendered (${round.playerHands[1].state})`);

  console.log(`  Round state: ${round.state}`);
  console.log(
    `  Dealer cards after all surrenders: ${round.dealerHand.cards.length}`,
  );

  // Verify dealer didn't draw additional cards (should still have 2)
  if (round.dealerHand.cards.length === 2) {
    console.log("  ✓ PASS: Dealer correctly skipped playing (2 cards)\n");
  } else {
    console.log(
      `  ✗ FAIL: Dealer drew extra cards (${round.dealerHand.cards.length} cards)\n`,
    );
  }

  // Verify round is in settling state
  if (round.state === "settling") {
    console.log("  ✓ PASS: Round moved to settling state\n");
  } else {
    console.log(`  ✗ FAIL: Round in wrong state: ${round.state}\n`);
  }
}

// Test 3: Mixed bust and surrender - dealer should still skip
function testDealerSkipsMixedBustAndSurrender() {
  console.log("Test 3: Dealer skips when players bust and surrender");

  const testDeck: Stack = [
    createCard("10", "hearts"), // Player 1 first card
    createCard("9", "diamonds"), // Player 2 first card
    createCard("5", "spades"), // Dealer hole card
    createCard("7", "clubs"), // Player 1 second card (17)
    createCard("6", "hearts"), // Player 2 second card (15)
    createCard("10", "diamonds"), // Dealer up card
    createCard("10", "spades"), // Player 1 hits -> 27 (bust)
  ];

  const shoe = new Shoe(1, 0.75, testDeck);
  const house = new House(100000);
  const rules = new RuleSet().setSurrender("late");

  const player1Bank = new Bank("player1", 1000);
  const player2Bank = new Bank("player2", 1000);

  const playerInfo: PlayerRoundInfo[] = [
    { userId: "player1", bank: player1Bank, bet: 100 },
    { userId: "player2", bank: player2Bank, bet: 100 },
  ];

  const round = new Round(1, playerInfo, shoe, rules);

  console.log(`  Initial dealer cards: ${round.dealerHand.cards.length}`);

  // Player 1 hits and busts
  round.playAction(ACTION_HIT);
  console.log(`  Player 1 busted (${round.playerHands[0].state})`);

  // Player 2 surrenders
  round.playAction(ACTION_SURRENDER);
  console.log(`  Player 2 surrendered (${round.playerHands[1].state})`);

  console.log(`  Round state: ${round.state}`);
  console.log(`  Dealer cards: ${round.dealerHand.cards.length}`);

  // Verify dealer didn't draw additional cards (should still have 2)
  if (round.dealerHand.cards.length === 2) {
    console.log("  ✓ PASS: Dealer correctly skipped playing (2 cards)\n");
  } else {
    console.log(
      `  ✗ FAIL: Dealer drew extra cards (${round.dealerHand.cards.length} cards)\n`,
    );
  }
}

// Test 4: All players have blackjack - dealer should skip
function testDealerSkipsWhenAllPlayersHaveBlackjack() {
  console.log("Test 4: Dealer skips when all players have blackjack");

  const testDeck: Stack = [
    createCard("A", "hearts"), // Player 1 card 1
    createCard("K", "clubs"), // Player 1 card 2 (blackjack!)
    createCard("A", "diamonds"), // Player 2 card 1
    createCard("Q", "hearts"), // Player 2 card 2 (blackjack!)
    createCard("6", "diamonds"), // Dealer card 1 (non-ace, non-10)
    createCard("5", "spades"), // Dealer card 2
  ];

  const shoe = new Shoe(1, 0.75, testDeck);
  const house = new House(100000);
  const rules = new RuleSet();

  const player1Bank = new Bank("player1", 1000);
  const player2Bank = new Bank("player2", 1000);

  const playerInfo: PlayerRoundInfo[] = [
    { userId: "player1", bank: player1Bank, bet: 100 },
    { userId: "player2", bank: player2Bank, bet: 100 },
  ];

  const round = new Round(1, playerInfo, shoe, rules);

  console.log(`  Initial dealer cards: ${round.dealerHand.cards.length}`);
  console.log(
    `  Player 1: ${round.playerHands[0].cards.map((c) => c.rank).join(",")} = ${round.playerHands[0].handValue} (${round.playerHands[0].state})`,
  );
  console.log(
    `  Player 2: ${round.playerHands[1].cards.map((c) => c.rank).join(",")} = ${round.playerHands[1].handValue} (${round.playerHands[1].state})`,
  );

  console.log(`  Round state: ${round.state}`);
  console.log(`  Dealer cards: ${round.dealerHand.cards.length}`);

  // Verify dealer didn't draw additional cards (should still have 2)
  if (round.dealerHand.cards.length === 2) {
    console.log("  ✓ PASS: Dealer correctly skipped playing (2 cards)\n");
  } else {
    console.log(
      `  ✗ FAIL: Dealer drew extra cards (${round.dealerHand.cards.length} cards)\n`,
    );
  }

  // Verify round is in settling state
  if (round.state === "settling") {
    console.log("  ✓ PASS: Round moved to settling state\n");
  } else {
    console.log(`  ✗ FAIL: Round in wrong state: ${round.state}\n`);
  }
}

// Test 5: Mixed blackjack, bust, and surrender
function testDealerSkipsMixedScenarios() {
  console.log("Test 5: Dealer skips with mixed blackjack, bust, and surrender");

  const testDeck: Stack = [
    createCard("A", "hearts"), // Player 1 card 1
    createCard("K", "clubs"), // Player 1 card 2 (blackjack!)
    createCard("10", "diamonds"), // Player 2 card 1
    createCard("6", "hearts"), // Player 2 card 2 (16 total)
    createCard("9", "spades"), // Player 3 card 1
    createCard("7", "clubs"), // Player 3 card 2 (16 total)
    createCard("6", "diamonds"), // Dealer card 1
    createCard("5", "hearts"), // Dealer card 2
    createCard("10", "spades"), // Player 2 hits -> 26 (bust)
  ];

  const shoe = new Shoe(1, 0.75, testDeck);
  const house = new House(100000);
  const rules = new RuleSet().setSurrender("late");

  const player1Bank = new Bank("player1", 1000);
  const player2Bank = new Bank("player2", 1000);
  const player3Bank = new Bank("player3", 1000);

  const playerInfo: PlayerRoundInfo[] = [
    { userId: "player1", bank: player1Bank, bet: 100 },
    { userId: "player2", bank: player2Bank, bet: 100 },
    { userId: "player3", bank: player3Bank, bet: 100 },
  ];

  const round = new Round(1, playerInfo, shoe, rules);

  console.log(
    `  Player 1: ${round.playerHands[0].state} (${round.playerHands[0].handValue})`,
  );
  console.log(
    `  Player 2: ${round.playerHands[1].state} (${round.playerHands[1].handValue})`,
  );
  console.log(
    `  Player 3: ${round.playerHands[2].state} (${round.playerHands[2].handValue})`,
  );

  // Player 1 has blackjack (automatically progressed)
  // Player 2 hits and busts
  round.playAction(ACTION_HIT);
  console.log(`  Player 2 busted`);

  // Player 3 surrenders
  round.playAction(ACTION_SURRENDER);
  console.log(`  Player 3 surrendered`);

  console.log(`  Round state: ${round.state}`);
  console.log(`  Dealer cards: ${round.dealerHand.cards.length}`);

  // Verify dealer didn't draw additional cards (should still have 2)
  if (round.dealerHand.cards.length === 2) {
    console.log("  ✓ PASS: Dealer correctly skipped playing (2 cards)\n");
  } else {
    console.log(
      `  ✗ FAIL: Dealer drew extra cards (${round.dealerHand.cards.length} cards)\n`,
    );
  }
}

// Run all tests
testDealerSkipsWhenAllPlayersBust();
testDealerSkipsWhenAllPlayersSurrender();
testDealerSkipsMixedBustAndSurrender();
testDealerSkipsWhenAllPlayersHaveBlackjack();
testDealerSkipsMixedScenarios();

console.log("=== All tests complete ===");
