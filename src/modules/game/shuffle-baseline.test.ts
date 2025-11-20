import { describe, expect, test } from "bun:test";
import { newDeck } from "./cards";
import { fisherYatesShuffle } from "./shuffle";

/**
 * Baseline tests using Fisher-Yates shuffle to establish expected randomness
 * This helps us understand if our expectations in the statistical tests are reasonable
 */

describe("Fisher-Yates Baseline", () => {
  test("should show flush rate with perfect Fisher-Yates shuffle", () => {
    const trials = 100;
    let shoesWithFlushPotential = 0;
    const flushCounts: number[] = [];

    for (let trial = 0; trial < trials; trial++) {
      // Create 6-deck shoe and Fisher-Yates shuffle it
      let shoe = [];
      for (let i = 0; i < 6; i++) {
        shoe.push(...newDeck());
      }
      shoe = fisherYatesShuffle(shoe);

      const first15 = shoe.slice(0, 15);
      const suitCounts: Record<string, number> = {
        hearts: 0,
        diamonds: 0,
        clubs: 0,
        spades: 0,
      };

      for (const card of first15) {
        suitCounts[card.suit]++;
      }

      const maxSuitCount = Math.max(...Object.values(suitCounts));
      flushCounts.push(maxSuitCount);

      if (maxSuitCount >= 5) {
        shoesWithFlushPotential++;
      }
    }

    const flushRate = (shoesWithFlushPotential / trials) * 100;
    const avgMaxSuit =
      flushCounts.reduce((a, b) => a + b, 0) / flushCounts.length;

    console.log("\n=== BASELINE: Fisher-Yates Perfect Shuffle ===");
    console.log(
      `Shoes with 5+ cards of same suit in first 15: ${shoesWithFlushPotential}/${trials} (${flushRate.toFixed(1)}%)`,
    );
    console.log(
      `Average max suit count in first 15 cards: ${avgMaxSuit.toFixed(2)}`,
    );

    // Count distribution
    const distribution: Record<number, number> = {};
    for (const count of flushCounts) {
      distribution[count] = (distribution[count] || 0) + 1;
    }

    console.log("Distribution of max suit count in first 15 cards:");
    for (let i = 3; i <= 10; i++) {
      const count = distribution[i] || 0;
      const percent = ((count / trials) * 100).toFixed(1);
      if (count > 0) {
        console.log(`  ${i} cards: ${count} times (${percent}%)`);
      }
    }

    // This establishes our baseline - what to expect from perfect randomness
    // We don't assert here, just log the results
  });

  test("should show suit distribution with perfect Fisher-Yates shuffle", () => {
    const trials = 100;
    const suitCounts: Record<string, number> = {
      hearts: 0,
      diamonds: 0,
      clubs: 0,
      spades: 0,
    };

    for (let trial = 0; trial < trials; trial++) {
      let shoe = [];
      for (let i = 0; i < 6; i++) {
        shoe.push(...newDeck());
      }
      shoe = fisherYatesShuffle(shoe);

      const first20 = shoe.slice(0, 20);
      for (const card of first20) {
        suitCounts[card.suit]++;
      }
    }

    const totalCards = trials * 20;
    console.log("\n=== BASELINE: Suit Distribution (First 20 cards) ===");
    for (const suit of ["hearts", "diamonds", "clubs", "spades"]) {
      const count = suitCounts[suit];
      const percentage = (count / totalCards) * 100;
      console.log(`${suit}: ${count} cards (${percentage.toFixed(1)}%)`);
    }
  });

  test("should show consecutive same-suit runs with perfect Fisher-Yates", () => {
    const trials = 100;
    let total3PlusRuns = 0;
    let total4PlusRuns = 0;
    let total5PlusRuns = 0;

    for (let trial = 0; trial < trials; trial++) {
      let shoe = [];
      for (let i = 0; i < 6; i++) {
        shoe.push(...newDeck());
      }
      shoe = fisherYatesShuffle(shoe);

      const first100 = shoe.slice(0, 100);
      let currentRun = 1;
      let currentSuit = first100[0].suit;

      for (let i = 1; i < first100.length; i++) {
        if (first100[i].suit === currentSuit) {
          currentRun++;
        } else {
          if (currentRun >= 3) total3PlusRuns++;
          if (currentRun >= 4) total4PlusRuns++;
          if (currentRun >= 5) total5PlusRuns++;
          currentRun = 1;
          currentSuit = first100[i].suit;
        }
      }

      // Check final run
      if (currentRun >= 3) total3PlusRuns++;
      if (currentRun >= 4) total4PlusRuns++;
      if (currentRun >= 5) total5PlusRuns++;
    }

    console.log(
      "\n=== BASELINE: Consecutive Same-Suit Runs (First 100 cards) ===",
    );
    console.log(`  3+ consecutive: ${total3PlusRuns}`);
    console.log(`  4+ consecutive: ${total4PlusRuns}`);
    console.log(`  5+ consecutive: ${total5PlusRuns}`);
  });
});
