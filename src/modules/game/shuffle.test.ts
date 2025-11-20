import { describe, expect, test } from "bun:test";
import type { Stack } from "./cards";
import { newDeck } from "./cards";
import {
  cutStackAtPenetration,
  overhandShuffleStack,
  randomInterleaveLen,
  riffleShuffleStack,
  shuffleShoe,
} from "./shuffle";

describe("randomInterleaveLen", () => {
  test("should return 0 for no remaining cards", () => {
    const result = randomInterleaveLen(0);
    expect(result).toBe(0);
  });

  test("should return between 1 and remaining cards", () => {
    for (let i = 0; i < 10; i++) {
      const result = randomInterleaveLen(5);
      expect(result).toBeGreaterThanOrEqual(1);
      expect(result).toBeLessThanOrEqual(5);
    }
  });

  test("should not exceed remaining cards", () => {
    const result = randomInterleaveLen(2);
    expect(result).toBeLessThanOrEqual(2);
  });

  test("should handle single card", () => {
    const result = randomInterleaveLen(1);
    expect(result).toBe(1);
  });
});

describe("cutStackAtPenetration", () => {
  const createTestStack = (size: number): Stack =>
    Array(size)
      .fill(null)
      .map((_, i) => ({
        rank: (i % 13).toString() as any,
        suit: "hearts" as const,
      }));

  test("should return same number of cards", () => {
    const stack = createTestStack(52);
    const result = cutStackAtPenetration({ stack, penetration: 50 });
    expect(result.stack.length).toBe(52);
  });

  test("should cut at 50% penetration", () => {
    const stack = createTestStack(52);
    const result = cutStackAtPenetration({ stack, penetration: 50 });
    expect(result.penetration).toBe(50);
    expect(result.cutPosition).toBe(26);
  });

  test("should cut at 0% penetration (no cut)", () => {
    const stack = createTestStack(52);
    const result = cutStackAtPenetration({ stack, penetration: 0 });
    expect(result.penetration).toBe(0);
    expect(result.cutPosition).toBe(0);
    expect(result.stack).toEqual(stack);
  });

  test("should cut at 100% penetration (full rotation)", () => {
    const stack = createTestStack(52);
    const result = cutStackAtPenetration({ stack, penetration: 100 });
    expect(result.penetration).toBe(100);
    expect(result.cutPosition).toBe(52);
  });

  test("should clamp negative penetration to 0", () => {
    const stack = createTestStack(52);
    const result = cutStackAtPenetration({ stack, penetration: -10 });
    expect(result.penetration).toBe(0);
  });

  test("should clamp penetration above 100", () => {
    const stack = createTestStack(52);
    const result = cutStackAtPenetration({ stack, penetration: 150 });
    expect(result.penetration).toBe(100);
  });

  test("should rotate stack correctly at 25%", () => {
    const stack = [
      { rank: "A", suit: "hearts" },
      { rank: "2", suit: "hearts" },
      { rank: "3", suit: "hearts" },
      { rank: "4", suit: "hearts" },
    ] as Stack;
    const result = cutStackAtPenetration({ stack, penetration: 25 });
    // Cut at position 1 (25% of 4)
    expect(result.stack[0]).toEqual({ rank: "2", suit: "hearts" });
    expect(result.stack[3]).toEqual({ rank: "A", suit: "hearts" });
  });

  test("should use random penetration when not specified", () => {
    const stack = createTestStack(52);
    const result = cutStackAtPenetration({ stack });
    expect(result.penetration).toBeGreaterThanOrEqual(0);
    expect(result.penetration).toBeLessThanOrEqual(100);
  });
});

describe("riffleShuffleStack", () => {
  test("should maintain all cards", () => {
    const deck = newDeck();
    const shuffled = riffleShuffleStack(deck);
    expect(shuffled.length).toBe(52);
  });

  test("should maintain card distribution", () => {
    const deck = newDeck();
    const shuffled = riffleShuffleStack(deck);

    // Count Aces before and after
    const acesBefore = deck.filter((c) => c.rank === "A").length;
    const acesAfter = shuffled.filter((c) => c.rank === "A").length;
    expect(acesAfter).toBe(acesBefore);

    // Count Kings before and after
    const kingsBefore = deck.filter((c) => c.rank === "K").length;
    const kingsAfter = shuffled.filter((c) => c.rank === "K").length;
    expect(kingsAfter).toBe(kingsBefore);
  });

  test("should change card order (probabilistically)", () => {
    const deck = newDeck();
    const shuffled = riffleShuffleStack(deck);

    // It's extremely unlikely that shuffle produces exact same order
    // Check that at least some cards are in different positions
    let differentPositions = 0;
    for (let i = 0; i < deck.length; i++) {
      if (
        deck[i].rank !== shuffled[i].rank ||
        deck[i].suit !== shuffled[i].suit
      ) {
        differentPositions++;
      }
    }
    expect(differentPositions).toBeGreaterThan(0);
  });

  test("should handle small stacks", () => {
    const stack: Stack = [
      { rank: "A", suit: "hearts" },
      { rank: "K", suit: "diamonds" },
    ];
    const shuffled = riffleShuffleStack(stack);
    expect(shuffled.length).toBe(2);
  });

  test("should handle single card", () => {
    const stack: Stack = [{ rank: "A", suit: "hearts" }];
    const shuffled = riffleShuffleStack(stack);
    expect(shuffled).toEqual(stack);
  });
});

describe("overhandShuffleStack", () => {
  test("should maintain all cards", () => {
    const deck = newDeck();
    const shuffled = overhandShuffleStack(deck);
    expect(shuffled.length).toBe(52);
  });

  test("should maintain card distribution", () => {
    const deck = newDeck();
    const shuffled = overhandShuffleStack(deck);

    // Count Aces before and after
    const acesBefore = deck.filter((c) => c.rank === "A").length;
    const acesAfter = shuffled.filter((c) => c.rank === "A").length;
    expect(acesAfter).toBe(acesBefore);
  });

  test("should change card order (probabilistically)", () => {
    const deck = newDeck();
    const shuffled = overhandShuffleStack(deck);

    // Check that at least some cards are in different positions
    let differentPositions = 0;
    for (let i = 0; i < deck.length; i++) {
      if (
        deck[i].rank !== shuffled[i].rank ||
        deck[i].suit !== shuffled[i].suit
      ) {
        differentPositions++;
      }
    }
    expect(differentPositions).toBeGreaterThan(0);
  });

  test("should handle small stacks", () => {
    const stack: Stack = [
      { rank: "A", suit: "hearts" },
      { rank: "K", suit: "diamonds" },
    ];
    const shuffled = overhandShuffleStack(stack);
    expect(shuffled.length).toBe(2);
  });

  test("should handle single card", () => {
    const stack: Stack = [{ rank: "A", suit: "hearts" }];
    const shuffled = overhandShuffleStack(stack);
    expect(shuffled).toEqual(stack);
  });
});

describe("shuffleShoe", () => {
  test("should maintain all cards in single deck", () => {
    const deck = newDeck();
    const shuffled = shuffleShoe(deck);
    expect(shuffled.length).toBe(52);
  });

  test("should maintain all cards in 6-deck shoe", () => {
    const shoe: Stack = [];
    for (let i = 0; i < 6; i++) {
      shoe.push(...newDeck());
    }
    const shuffled = shuffleShoe(shoe);
    expect(shuffled.length).toBe(312);
  });

  test("should maintain card distribution", () => {
    const deck = newDeck();
    const shuffled = shuffleShoe(deck);

    // Count Aces
    const acesBefore = deck.filter((c) => c.rank === "A").length;
    const acesAfter = shuffled.filter((c) => c.rank === "A").length;
    expect(acesAfter).toBe(acesBefore);

    // Count face cards
    const facesBefore = deck.filter((c) =>
      ["J", "Q", "K"].includes(c.rank),
    ).length;
    const facesAfter = shuffled.filter((c) =>
      ["J", "Q", "K"].includes(c.rank),
    ).length;
    expect(facesAfter).toBe(facesBefore);
  });

  test("should change card order significantly", () => {
    const deck = newDeck().concat(
      newDeck(),
      newDeck(),
      newDeck(),
      newDeck(),
      newDeck(),
    ); // 6-deck shoe
    const shuffled = shuffleShoe(deck);

    // Most cards should be in different positions after full shuffle
    let differentPositions = 0;
    for (let i = 0; i < deck.length; i++) {
      if (
        deck[i].rank !== shuffled[i].rank ||
        deck[i].suit !== shuffled[i].suit
      ) {
        differentPositions++;
      }
    }
    // Expect at least 90% of cards to be in different positions
    expect(differentPositions).toBeGreaterThan(47 * 6);
  });

  test("should handle 8-deck shoe", () => {
    const shoe: Stack = [];
    for (let i = 0; i < 8; i++) {
      shoe.push(...newDeck());
    }
    const shuffled = shuffleShoe(shoe);
    expect(shuffled.length).toBe(416);
  });
});
