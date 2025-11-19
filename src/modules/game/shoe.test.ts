import { describe, expect, test } from "bun:test";
import { Shoe, newShoeStack } from "./shoe";
import type { Card, Stack } from "./cards";

describe("newShoeStack", () => {
  test("should create shoe with correct number of cards", () => {
    const shoeDeck = newShoeStack(6, 0.1);
    expect(shoeDeck.stack.length).toBe(312); // 6 decks * 52 cards
  });

  test("should set penetration", () => {
    const shoeDeck = newShoeStack(6, 0.25);
    expect(shoeDeck.penetration).toBe(0.25);
  });

  test("should use test stack when provided", () => {
    const testStack: Stack = [
      { rank: "A", suit: "hearts" },
      { rank: "K", suit: "diamonds" },
    ];
    const shoeDeck = newShoeStack(6, 0.1, testStack);
    expect(shoeDeck.stack).toEqual(testStack);
  });

  test("should handle single deck", () => {
    const shoeDeck = newShoeStack(1, 0.1);
    expect(shoeDeck.stack.length).toBe(52);
  });

  test("should handle 8 decks", () => {
    const shoeDeck = newShoeStack(8, 0.1);
    expect(shoeDeck.stack.length).toBe(416); // 8 decks * 52 cards
  });
});

describe("Shoe", () => {
  describe("constructor", () => {
    test("should initialize with correct number of cards", () => {
      const shoe = new Shoe(6, 0.1);
      expect(shoe.remainingCards).toBe(312);
    });

    test("should calculate correct stop position with 10% penetration", () => {
      const shoe = new Shoe(6, 0.1);
      const expectedStop = Math.floor(312 * 0.9); // 90% of cards
      expect(shoe.cutCardPosition).toBe(expectedStop);
    });

    test("should calculate correct stop position with 25% penetration", () => {
      const shoe = new Shoe(6, 0.25);
      const expectedStop = Math.floor(312 * 0.75); // 75% of cards
      expect(shoe.cutCardPosition).toBe(expectedStop);
    });

    test("should initialize with empty discard pile", () => {
      const shoe = new Shoe(6, 0.1);
      expect(shoe.discardedCards).toHaveLength(0);
    });

    test("should not be complete initially", () => {
      const shoe = new Shoe(6, 0.1);
      expect(shoe.isComplete).toBe(false);
    });
  });

  describe("drawCard", () => {
    test("should return a card", () => {
      const shoe = new Shoe(6, 0.1);
      const card = shoe.drawCard();
      expect(card).toHaveProperty("rank");
      expect(card).toHaveProperty("suit");
    });

    test("should reduce remaining cards", () => {
      const shoe = new Shoe(6, 0.1);
      const initialCount = shoe.remainingCards;
      shoe.drawCard();
      expect(shoe.remainingCards).toBe(initialCount - 1);
    });

    test("should draw cards in sequence", () => {
      const testStack: Stack = [
        { rank: "A", suit: "hearts" },
        { rank: "K", suit: "diamonds" },
        { rank: "Q", suit: "clubs" },
      ];
      const shoe = new Shoe(1, 0.1, testStack);
      expect(shoe.drawCard()).toEqual({ rank: "A", suit: "hearts" });
      expect(shoe.drawCard()).toEqual({ rank: "K", suit: "diamonds" });
      expect(shoe.drawCard()).toEqual({ rank: "Q", suit: "clubs" });
    });

    test("should mark shoe complete at stop position", () => {
      const testStack: Stack = [
        { rank: "A", suit: "hearts" },
        { rank: "K", suit: "diamonds" },
        { rank: "Q", suit: "clubs" },
        { rank: "J", suit: "spades" },
        { rank: "10", suit: "hearts" },
      ];
      const shoe = new Shoe(1, 0.4, testStack); // 40% penetration = stop at position 3
      expect(shoe.isComplete).toBe(false);
      shoe.drawCard();
      shoe.drawCard();
      shoe.drawCard();
      shoe.drawCard(); // This should trigger completion
      expect(shoe.isComplete).toBe(true);
    });
  });

  describe("deal", () => {
    test("should deal cards to single player and dealer", () => {
      const shoe = new Shoe(6, 0.1);
      const { playerHands, dealerHand } = shoe.deal(1);
      expect(playerHands).toHaveLength(1);
      expect(playerHands[0][0]).toHaveLength(2);
      expect(dealerHand).toHaveLength(2);
      expect(shoe.remainingCards).toBe(312 - 4); // 2 for player, 2 for dealer
    });

    test("should deal cards to multiple players", () => {
      const shoe = new Shoe(6, 0.1);
      const { playerHands, dealerHand } = shoe.deal(3);
      expect(playerHands).toHaveLength(3);
      for (const hand of playerHands) {
        expect(hand[0]).toHaveLength(2);
      }
      expect(dealerHand).toHaveLength(2);
      expect(shoe.remainingCards).toBe(312 - 8); // 6 for players, 2 for dealer
    });

    test("should deal from known test stack", () => {
      const testStack: Stack = [
        { rank: "A", suit: "hearts" }, // Player 1, card 1
        { rank: "K", suit: "diamonds" }, // Player 1, card 2
        { rank: "Q", suit: "clubs" }, // Dealer, card 1
        { rank: "J", suit: "spades" }, // Dealer, card 2
      ];
      const shoe = new Shoe(1, 0.1, testStack);
      const { playerHands, dealerHand } = shoe.deal(1);
      expect(playerHands[0][0][0]).toEqual({ rank: "A", suit: "hearts" });
      expect(playerHands[0][0][1]).toEqual({ rank: "K", suit: "diamonds" });
      expect(dealerHand[0]).toEqual({ rank: "Q", suit: "clubs" });
      expect(dealerHand[1]).toEqual({ rank: "J", suit: "spades" });
    });
  });

  describe("discard", () => {
    test("should add cards to discard pile", () => {
      const shoe = new Shoe(6, 0.1);
      const cards: Stack = [
        { rank: "7", suit: "hearts" },
        { rank: "8", suit: "diamonds" },
      ];
      shoe.discard(cards);
      expect(shoe.discardedCards).toHaveLength(2);
    });

    test("should accumulate discarded cards", () => {
      const shoe = new Shoe(6, 0.1);
      shoe.discard([{ rank: "7", suit: "hearts" }]);
      shoe.discard([{ rank: "8", suit: "diamonds" }]);
      expect(shoe.discardedCards).toHaveLength(2);
    });

    test("should not affect remaining cards count", () => {
      const shoe = new Shoe(6, 0.1);
      const initialRemaining = shoe.remainingCards;
      shoe.discard([{ rank: "7", suit: "hearts" }]);
      expect(shoe.remainingCards).toBe(initialRemaining);
    });
  });

  describe("stats and getters", () => {
    test("should return basic stats", () => {
      const shoe = new Shoe(6, 0.1);
      const stats = shoe.stats;
      expect(stats.remainingCards).toBe(312);
      expect(stats.isComplete).toBe(false);
      expect(stats.roundCompleted).toBeNull();
    });

    test("should return detailed stats", () => {
      const shoe = new Shoe(6, 0.1);
      shoe.drawCard();
      shoe.discard([{ rank: "7", suit: "hearts" }]);
      const stats = shoe.detailedStats;
      expect(stats.remainingCards).toBe(311);
      expect(stats.discardedCards).toBe(1);
      expect(stats.totalCards).toBe(312);
      expect(stats.isComplete).toBe(false);
      expect(stats.penetration).toBe(0.1);
      expect(stats.discardPile).toHaveLength(1);
    });

    test("should calculate total cards correctly", () => {
      const shoe = new Shoe(6, 0.1);
      shoe.drawCard();
      shoe.drawCard();
      shoe.discard([{ rank: "7", suit: "hearts" }]);
      expect(shoe.totalCards).toBe(311); // 310 remaining + 1 discarded (2 drawn but only 1 discarded)
    });

    test("should return copy of discard pile", () => {
      const shoe = new Shoe(6, 0.1);
      const card = { rank: "7" as const, suit: "hearts" as const };
      shoe.discard([card]);
      const discarded = shoe.discardedCards;
      discarded.push({ rank: "8", suit: "diamonds" });
      expect(shoe.discardedCards).toHaveLength(1); // Original not modified
    });
  });

  describe("round tracking", () => {
    test("should increment round on deal", () => {
      const shoe = new Shoe(6, 0.1);
      const initialStats = shoe.detailedStats;
      expect(initialStats.currentRound).toBe(0);
      shoe.deal(1);
      const afterDeal = shoe.detailedStats;
      expect(afterDeal.currentRound).toBe(1);
    });

    test("should track multiple rounds", () => {
      const shoe = new Shoe(6, 0.1);
      shoe.deal(1);
      shoe.deal(1);
      shoe.deal(1);
      const stats = shoe.detailedStats;
      expect(stats.currentRound).toBe(3);
    });
  });

  describe("shoe completion", () => {
    test("should allow drawing cards in same round after completion", () => {
      const testStack: Stack = Array(10)
        .fill(null)
        .map(() => ({ rank: "7" as const, suit: "hearts" as const }));
      const shoe = new Shoe(1, 0.5, testStack); // 50% penetration, stop at position 5

      // Start round and draw past stop position
      shoe.startNextRound();
      for (let i = 0; i < 6; i++) {
        shoe.drawCard();
      }
      expect(shoe.isComplete).toBe(true);

      // Should still be able to draw in same round
      expect(() => shoe.drawCard()).not.toThrow();
    });

    test("should prevent drawing cards in new round after completion", () => {
      const testStack: Stack = Array(10)
        .fill(null)
        .map(() => ({ rank: "7" as const, suit: "hearts" as const }));
      const shoe = new Shoe(1, 0.5, testStack);

      // Complete the shoe
      shoe.startNextRound();
      for (let i = 0; i < 6; i++) {
        shoe.drawCard();
      }
      expect(shoe.isComplete).toBe(true);

      // Start new round - should throw error
      shoe.startNextRound();
      expect(() => shoe.drawCard()).toThrow("Shoe is complete");
    });
  });
});
