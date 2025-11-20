import { describe, expect, test } from "bun:test";
import type { Card, Stack } from "./cards";
import { newDeck } from "./cards";
import { newShoeStack } from "./shoe";
import { shuffleShoe } from "./shuffle";

/**
 * Statistical tests for shuffle quality
 * These tests check for randomness, suit distribution, and card clustering
 */

describe("Shuffle Statistical Analysis", () => {
  describe("Suit Distribution in Early Cards", () => {
    test("should have relatively even suit distribution in first 20 cards across multiple shoes", () => {
      const trials = 100;
      const suitCounts: Record<string, number> = {
        hearts: 0,
        diamonds: 0,
        clubs: 0,
        spades: 0,
      };

      for (let trial = 0; trial < trials; trial++) {
        const shoe = newShoeStack(6, 0.75);
        const first20 = shoe.stack.slice(0, 20);

        for (const card of first20) {
          suitCounts[card.suit]++;
        }
      }

      const totalCards = trials * 20;
      const expectedPerSuit = totalCards / 4; // 25% each suit
      const tolerance = expectedPerSuit * 0.15; // 15% tolerance

      // Each suit should appear roughly 25% of the time (±15%)
      for (const suit of ["hearts", "diamonds", "clubs", "spades"]) {
        const count = suitCounts[suit];
        const percentage = (count / totalCards) * 100;
        console.log(
          `${suit}: ${count} cards (${percentage.toFixed(1)}% of ${totalCards})`,
        );

        expect(count).toBeGreaterThanOrEqual(expectedPerSuit - tolerance);
        expect(count).toBeLessThanOrEqual(expectedPerSuit + tolerance);
      }
    });

    test("should have even suit distribution in first 52 cards across multiple shoes", () => {
      const trials = 50;
      const suitCounts: Record<string, number> = {
        hearts: 0,
        diamonds: 0,
        clubs: 0,
        spades: 0,
      };

      for (let trial = 0; trial < trials; trial++) {
        const shoe = newShoeStack(6, 0.75);
        const first52 = shoe.stack.slice(0, 52);

        for (const card of first52) {
          suitCounts[card.suit]++;
        }
      }

      const totalCards = trials * 52;
      const expectedPerSuit = totalCards / 4;
      const tolerance = expectedPerSuit * 0.12; // 12% tolerance

      for (const suit of ["hearts", "diamonds", "clubs", "spades"]) {
        const count = suitCounts[suit];
        const percentage = (count / totalCards) * 100;
        console.log(
          `First 52 - ${suit}: ${count} cards (${percentage.toFixed(1)}%)`,
        );

        expect(count).toBeGreaterThanOrEqual(expectedPerSuit - tolerance);
        expect(count).toBeLessThanOrEqual(expectedPerSuit + tolerance);
      }
    });
  });

  describe("Same-Suit Clustering", () => {
    /**
     * Measures how often we see multiple cards of the same suit within a window.
     * High clustering indicates poor shuffle quality.
     */
    test("should not have excessive same-suit clustering in early cards", () => {
      const trials = 100;
      const windowSize = 5; // Look at 5-card windows
      let totalWindows = 0;
      let clusteredWindows = 0; // Windows with 4+ cards of same suit

      for (let trial = 0; trial < trials; trial++) {
        const shoe = newShoeStack(6, 0.75);
        const first50 = shoe.stack.slice(0, 50);

        // Check each 5-card window
        for (let i = 0; i <= first50.length - windowSize; i++) {
          const window = first50.slice(i, i + windowSize);
          const suitCounts: Record<string, number> = {};

          for (const card of window) {
            suitCounts[card.suit] = (suitCounts[card.suit] || 0) + 1;
          }

          totalWindows++;

          // Check if any suit appears 4+ times in this window
          const maxSuitCount = Math.max(...Object.values(suitCounts));
          if (maxSuitCount >= 4) {
            clusteredWindows++;
          }
        }
      }

      const clusteringRate = (clusteredWindows / totalWindows) * 100;
      console.log(
        `Same-suit clustering: ${clusteredWindows}/${totalWindows} windows (${clusteringRate.toFixed(2)}%)`,
      );

      // For a truly random shuffle, we'd expect about 5-10% of windows to have 4+ of same suit
      // If we see significantly more, there's a problem
      expect(clusteringRate).toBeLessThan(15); // Should be well under 15%
    });

    test("should rarely have 3+ consecutive cards of same suit", () => {
      const trials = 100;
      let total3PlusRuns = 0;
      let total4PlusRuns = 0;
      let total5PlusRuns = 0;

      for (let trial = 0; trial < trials; trial++) {
        const shoe = newShoeStack(6, 0.75);
        const first100 = shoe.stack.slice(0, 100);

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
        `Consecutive same-suit runs in first 100 cards (${trials} trials):`,
      );
      console.log(`  3+ consecutive: ${total3PlusRuns}`);
      console.log(`  4+ consecutive: ${total4PlusRuns}`);
      console.log(`  5+ consecutive: ${total5PlusRuns}`);

      // For truly random shuffle, 4+ consecutive same-suit should be very rare
      expect(total4PlusRuns).toBeLessThan(trials * 2); // Less than 2 per shoe on average
      expect(total5PlusRuns).toBeLessThan(trials * 0.5); // Very rare
    });
  });

  describe("Rank Distribution", () => {
    test("should have even rank distribution in first 52 cards", () => {
      const trials = 50;
      const rankCounts: Record<string, number> = {};

      // Initialize counts for all ranks
      for (const rank of [
        "A",
        "2",
        "3",
        "4",
        "5",
        "6",
        "7",
        "8",
        "9",
        "10",
        "J",
        "Q",
        "K",
      ]) {
        rankCounts[rank] = 0;
      }

      for (let trial = 0; trial < trials; trial++) {
        const shoe = newShoeStack(6, 0.75);
        const first52 = shoe.stack.slice(0, 52);

        for (const card of first52) {
          rankCounts[card.rank]++;
        }
      }

      const totalCards = trials * 52;
      const expectedPerRank = totalCards / 13;
      const tolerance = expectedPerRank * 0.25; // 25% tolerance (wider for ranks)

      let maxDeviation = 0;
      for (const rank of Object.keys(rankCounts)) {
        const count = rankCounts[rank];
        const deviation = Math.abs(count - expectedPerRank);
        maxDeviation = Math.max(maxDeviation, deviation);

        expect(count).toBeGreaterThanOrEqual(expectedPerRank - tolerance);
        expect(count).toBeLessThanOrEqual(expectedPerRank + tolerance);
      }

      console.log(
        `Max rank deviation from expected: ${maxDeviation.toFixed(1)} cards`,
      );
    });
  });

  describe("Cross-Deck Mixing", () => {
    /**
     * This test checks if cards from different original decks are well-mixed.
     * We create a shoe with marked decks and check if the first N cards
     * come from different original decks.
     */
    test("should mix cards from different original decks", () => {
      const trials = 50;
      let wellMixedCount = 0;

      for (let trial = 0; trial < trials; trial++) {
        // Create a 6-deck shoe where we can track which deck each card came from
        const markedShoe: (Card & { deckId: number })[] = [];
        for (let deckId = 0; deckId < 6; deckId++) {
          const deck = newDeck();
          for (const card of deck) {
            markedShoe.push({ ...card, deckId });
          }
        }

        // Shuffle using the actual shuffle function
        const shuffled = shuffleShoe(markedShoe as Stack) as (Card & {
          deckId: number;
        })[];

        // Check first 52 cards - should have cards from multiple original decks
        const first52 = shuffled.slice(0, 52);
        const decksSeen = new Set(first52.map((c) => c.deckId));

        // If shuffle is good, first 52 cards should contain cards from at least 4 different original decks
        if (decksSeen.size >= 4) {
          wellMixedCount++;
        }

        if (trial < 5) {
          // Log first few trials
          console.log(
            `Trial ${trial + 1}: First 52 cards from ${decksSeen.size} different original decks`,
          );
        }
      }

      const mixingRate = (wellMixedCount / trials) * 100;
      console.log(
        `Well-mixed shoes: ${wellMixedCount}/${trials} (${mixingRate.toFixed(1)}%)`,
      );

      // At least 80% of shoes should have good cross-deck mixing
      expect(wellMixedCount).toBeGreaterThanOrEqual(trials * 0.8);
    });

    test("should have cards from multiple decks in first 20 cards", () => {
      const trials = 100;
      const deckCountDistribution: Record<number, number> = {};

      for (let trial = 0; trial < trials; trial++) {
        const markedShoe: (Card & { deckId: number })[] = [];
        for (let deckId = 0; deckId < 6; deckId++) {
          const deck = newDeck();
          for (const card of deck) {
            markedShoe.push({ ...card, deckId });
          }
        }

        const shuffled = shuffleShoe(markedShoe as Stack) as (Card & {
          deckId: number;
        })[];
        const first20 = shuffled.slice(0, 20);
        const decksSeen = new Set(first20.map((c) => c.deckId));

        deckCountDistribution[decksSeen.size] =
          (deckCountDistribution[decksSeen.size] || 0) + 1;
      }

      console.log("Distribution of original decks in first 20 cards:");
      for (let i = 1; i <= 6; i++) {
        const count = deckCountDistribution[i] || 0;
        console.log(
          `  ${i} decks: ${count} times (${(count / trials) * 100}%)`,
        );
      }

      // First 20 cards should come from at least 2 different original decks most of the time
      const goodMixing = Object.entries(deckCountDistribution)
        .filter(([numDecks]) => Number.parseInt(numDecks) >= 2)
        .reduce((sum, [, count]) => sum + count, 0);

      expect(goodMixing).toBeGreaterThanOrEqual(trials * 0.8); // 80% should have 2+ decks
    });
  });

  describe("Chi-Square Test for Suit Uniformity", () => {
    /**
     * Chi-square test to determine if suit distribution is uniform
     */
    test("should pass chi-square test for suit uniformity in samples", () => {
      const trials = 100;
      const sampleSize = 40; // Cards per sample
      let chiSquareSum = 0;

      for (let trial = 0; trial < trials; trial++) {
        const shoe = newShoeStack(6, 0.75);
        const sample = shoe.stack.slice(0, sampleSize);

        const suitCounts: Record<string, number> = {
          hearts: 0,
          diamonds: 0,
          clubs: 0,
          spades: 0,
        };

        for (const card of sample) {
          suitCounts[card.suit]++;
        }

        // Expected count for each suit
        const expected = sampleSize / 4;

        // Calculate chi-square statistic for this sample
        let chiSquare = 0;
        for (const suit of ["hearts", "diamonds", "clubs", "spades"]) {
          const observed = suitCounts[suit];
          chiSquare += (observed - expected) ** 2 / expected;
        }

        chiSquareSum += chiSquare;
      }

      const avgChiSquare = chiSquareSum / trials;

      console.log(`Average chi-square statistic: ${avgChiSquare.toFixed(2)}`);
      console.log(
        `(For 3 degrees of freedom, critical value at 95% confidence is 7.815)`,
      );

      // For 3 degrees of freedom (4 suits - 1), critical value at 95% is 7.815
      // Average should be around 3 for truly random distribution
      // We'll allow up to 6 as that's still reasonable
      expect(avgChiSquare).toBeLessThan(8);
    });
  });

  describe("Positional Bias", () => {
    /**
     * Check if certain ranks or suits are biased toward certain positions
     */
    test("should not have positional bias for aces in early positions", () => {
      const trials = 200;
      const positions = 20; // Check first 20 positions
      const acePositions: number[] = [];

      for (let trial = 0; trial < trials; trial++) {
        const shoe = newShoeStack(6, 0.75);

        for (let pos = 0; pos < positions; pos++) {
          if (shoe.stack[pos].rank === "A") {
            acePositions.push(pos);
          }
        }
      }

      // Calculate average position of aces in first 20 cards
      const avgPosition =
        acePositions.reduce((sum, pos) => sum + pos, 0) / acePositions.length;

      console.log(
        `Found ${acePositions.length} aces in first ${positions} positions across ${trials} trials`,
      );
      console.log(`Average ace position: ${avgPosition.toFixed(2)}`);

      // Should be roughly in the middle (around position 10)
      // Allow for some variance
      expect(avgPosition).toBeGreaterThan(5);
      expect(avgPosition).toBeLessThan(15);
    });
  });

  describe("Suited Flush Detection", () => {
    /**
     * This test specifically checks for the issue you reported:
     * Multiple cards of the same suit appearing within the first 10-15 cards
     */
    test("should not frequently have 5+ cards of same suit in first 15 cards", () => {
      const trials = 100;
      let shoesWithFlushPotential = 0;
      const flushCounts: number[] = [];

      for (let trial = 0; trial < trials; trial++) {
        const shoe = newShoeStack(6, 0.75);
        const first15 = shoe.stack.slice(0, 15);

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
          if (shoesWithFlushPotential <= 10) {
            // Log first 10 occurrences
            console.log(
              `Trial ${trial + 1}: ${maxSuitCount} cards of same suit in first 15`,
            );
            console.log(`  Suit distribution:`, suitCounts);
          }
        }
      }

      const flushRate = (shoesWithFlushPotential / trials) * 100;
      const avgMaxSuit =
        flushCounts.reduce((a, b) => a + b, 0) / flushCounts.length;

      console.log(
        `Shoes with 5+ cards of same suit in first 15: ${shoesWithFlushPotential}/${trials} (${flushRate.toFixed(1)}%)`,
      );
      console.log(
        `Average max suit count in first 15 cards: ${avgMaxSuit.toFixed(2)}`,
      );

      // CORRECTED: Based on Fisher-Yates baseline tests, 5+ cards of same suit
      // in first 15 occurs ~96% of the time with perfect randomness!
      // This is statistically normal. We expect 85-100% here.
      expect(flushRate).toBeGreaterThan(80); // Should be high (85-100%)
      expect(flushRate).toBeLessThan(100); // But not literally 100%
    });

    test("should have reasonable distribution of max suit counts in first 15 cards", () => {
      const trials = 100;
      const distribution: Record<number, number> = {};

      for (let trial = 0; trial < trials; trial++) {
        const shoe = newShoeStack(6, 0.75);
        const first15 = shoe.stack.slice(0, 15);

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
        distribution[maxSuitCount] = (distribution[maxSuitCount] || 0) + 1;
      }

      console.log("Distribution of max suit count in first 15 cards:");
      for (let i = 3; i <= 10; i++) {
        const count = distribution[i] || 0;
        const percent = ((count / trials) * 100).toFixed(1);
        if (count > 0) {
          console.log(`  ${i} cards: ${count} times (${percent}%)`);
        }
      }

      // Most common should be 4-5 cards of same suit
      // Having 7+ cards of same suit should be very rare
      const sevenPlusRate =
        Object.entries(distribution)
          .filter(([count]) => Number.parseInt(count) >= 7)
          .reduce((sum, [, freq]) => sum + freq, 0) / trials;

      // CORRECTED: Based on Fisher-Yates baseline, 7+ occurs ~25% of the time
      // This is normal for random distribution
      expect(sevenPlusRate).toBeLessThan(0.35); // Less than 35% (baseline was ~25%)
    });
  });
});
