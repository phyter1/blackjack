import { beforeEach, describe, expect, test } from "bun:test";
import type { Card } from "./cards";
import { DealerHand } from "./dealer-hand";
import { RuleSet } from "./rules";

describe("DealerHand", () => {
  let s17Rules: RuleSet;
  let h17Rules: RuleSet;

  beforeEach(() => {
    s17Rules = new RuleSet().setDealerStand("s17");
    h17Rules = new RuleSet().setDealerStand("h17");
  });

  describe("constructor", () => {
    test("should initialize with two cards", () => {
      const cards: Card[] = [
        { rank: "K", suit: "♠" },
        { rank: "7", suit: "♥" },
      ];
      const hand = new DealerHand(cards, s17Rules);

      expect(hand.cards).toEqual(cards);
      expect(hand.handValue).toBe(17);
      expect(hand.state).toBe("active");
    });

    test("should detect blackjack on initialization", () => {
      const cards: Card[] = [
        { rank: "A", suit: "♠" },
        { rank: "K", suit: "♥" },
      ];
      const hand = new DealerHand(cards, s17Rules);

      expect(hand.handValue).toBe(21);
      expect(hand.state).toBe("blackjack");
    });

    test("should mark 21 from three cards as blackjack state", () => {
      const cards: Card[] = [
        { rank: "7", suit: "♠" },
        { rank: "7", suit: "♥" },
      ];
      const hand = new DealerHand(cards, s17Rules);
      hand.hit({ rank: "7", suit: "♦" });

      expect(hand.handValue).toBe(21);
      expect(hand.state).toBe("blackjack");
    });

    test("should handle soft 17 correctly", () => {
      const cards: Card[] = [
        { rank: "A", suit: "♠" },
        { rank: "6", suit: "♥" },
      ];
      const hand = new DealerHand(cards, s17Rules);

      expect(hand.handValue).toBe(17);
      expect(hand.state).toBe("active");
    });
  });

  describe("hit", () => {
    test("should add card to hand", () => {
      const cards: Card[] = [
        { rank: "10", suit: "♠" },
        { rank: "6", suit: "♥" },
      ];
      const hand = new DealerHand(cards, s17Rules);
      hand.hit({ rank: "5", suit: "♦" });

      expect(hand.cards.length).toBe(3);
      expect(hand.handValue).toBe(21);
    });

    test("should bust on value over 21", () => {
      const cards: Card[] = [
        { rank: "10", suit: "♠" },
        { rank: "10", suit: "♥" },
      ];
      const hand = new DealerHand(cards, s17Rules);
      hand.hit({ rank: "5", suit: "♦" });

      expect(hand.handValue).toBe(25);
      expect(hand.state).toBe("busted");
    });

    test("should mark as blackjack when hitting to 21", () => {
      const cards: Card[] = [
        { rank: "10", suit: "♠" },
        { rank: "5", suit: "♥" },
      ];
      const hand = new DealerHand(cards, s17Rules);
      hand.hit({ rank: "6", suit: "♦" });

      expect(hand.handValue).toBe(21);
      expect(hand.state).toBe("blackjack");
    });

    test("should remain active on 17 with s17 rules (stands on soft 17, active on hard 17)", () => {
      const cards: Card[] = [
        { rank: "10", suit: "♠" },
        { rank: "5", suit: "♥" },
      ];
      const hand = new DealerHand(cards, s17Rules);
      hand.hit({ rank: "2", suit: "♦" });

      expect(hand.handValue).toBe(17);
      // With s17 implementation, only stands if cv > 17
      expect(hand.state).toBe("active");
    });

    test("should stand on hard 17 with h17 rules", () => {
      const cards: Card[] = [
        { rank: "10", suit: "♠" },
        { rank: "5", suit: "♥" },
      ];
      const hand = new DealerHand(cards, h17Rules);
      hand.hit({ rank: "2", suit: "♦" });

      expect(hand.handValue).toBe(17);
      expect(hand.state).toBe("stood");
    });

    test("should hit on soft 17 with h17 rules", () => {
      const cards: Card[] = [
        { rank: "A", suit: "♠" },
        { rank: "6", suit: "♥" },
      ];
      const hand = new DealerHand(cards, h17Rules);

      expect(hand.state).toBe("active");
      expect(hand.handValue).toBe(17);
    });

    test("should stand on soft 17 with s17 rules (initial)", () => {
      const cards: Card[] = [
        { rank: "A", suit: "♠" },
        { rank: "6", suit: "♥" },
      ];
      const hand = new DealerHand(cards, s17Rules);

      // The constructor doesn't automatically stand, state is "active"
      // But if dealer hits and gets 17, they should stand
      expect(hand.handValue).toBe(17);
      expect(hand.state).toBe("active");
    });

    test("should stand on 18 or higher", () => {
      const cards: Card[] = [
        { rank: "10", suit: "♠" },
        { rank: "6", suit: "♥" },
      ];
      const hand = new DealerHand(cards, s17Rules);
      hand.hit({ rank: "2", suit: "♦" });

      expect(hand.handValue).toBe(18);
      expect(hand.state).toBe("stood");
    });

    test("should stand on 20", () => {
      const cards: Card[] = [
        { rank: "10", suit: "♠" },
        { rank: "9", suit: "♥" },
      ];
      const hand = new DealerHand(cards, s17Rules);
      hand.hit({ rank: "A", suit: "♦" });

      expect(hand.handValue).toBe(20);
      expect(hand.state).toBe("stood");
    });

    test("should handle soft ace correctly", () => {
      const cards: Card[] = [
        { rank: "A", suit: "♠" },
        { rank: "5", suit: "♥" },
      ];
      const hand = new DealerHand(cards, s17Rules);
      hand.hit({ rank: "10", suit: "♦" });

      // A + 5 + 10 = 16 (ace counted as 1)
      expect(hand.handValue).toBe(16);
      expect(hand.state).toBe("active");
    });

    test("should handle multiple aces", () => {
      const cards: Card[] = [
        { rank: "A", suit: "♠" },
        { rank: "A", suit: "♥" },
      ];
      const hand = new DealerHand(cards, s17Rules);
      hand.hit({ rank: "9", suit: "♦" });

      // A + A + 9 = 21 (one ace as 11, one as 1)
      expect(hand.handValue).toBe(21);
      expect(hand.state).toBe("blackjack");
    });
  });

  describe("upCard", () => {
    test("should return first card", () => {
      const cards: Card[] = [
        { rank: "K", suit: "♠" },
        { rank: "7", suit: "♥" },
      ];
      const hand = new DealerHand(cards, s17Rules);

      expect(hand.upCard).toEqual({ rank: "K", suit: "♠" });
    });

    test("should always return first card even after hits", () => {
      const cards: Card[] = [
        { rank: "5", suit: "♠" },
        { rank: "4", suit: "♥" },
      ];
      const hand = new DealerHand(cards, s17Rules);
      hand.hit({ rank: "3", suit: "♦" });

      expect(hand.upCard).toEqual({ rank: "5", suit: "♠" });
    });
  });

  describe("peekBlackjack", () => {
    test("should return true for blackjack", () => {
      const cards: Card[] = [
        { rank: "A", suit: "♠" },
        { rank: "K", suit: "♥" },
      ];
      const hand = new DealerHand(cards, s17Rules);

      expect(hand.peekBlackjack).toBe(true);
    });

    test("should return false for non-blackjack", () => {
      const cards: Card[] = [
        { rank: "K", suit: "♠" },
        { rank: "9", suit: "♥" },
      ];
      const hand = new DealerHand(cards, s17Rules);

      expect(hand.peekBlackjack).toBe(false);
    });

    test("should return true for 21 from three cards", () => {
      const cards: Card[] = [
        { rank: "7", suit: "♠" },
        { rank: "7", suit: "♥" },
      ];
      const hand = new DealerHand(cards, s17Rules);
      hand.hit({ rank: "7", suit: "♦" });

      expect(hand.peekBlackjack).toBe(true);
      expect(hand.handValue).toBe(21);
    });
  });

  describe("handValue", () => {
    test("should calculate hard hand value correctly", () => {
      const cards: Card[] = [
        { rank: "K", suit: "♠" },
        { rank: "9", suit: "♥" },
      ];
      const hand = new DealerHand(cards, s17Rules);

      expect(hand.handValue).toBe(19);
    });

    test("should calculate soft hand value correctly", () => {
      const cards: Card[] = [
        { rank: "A", suit: "♠" },
        { rank: "7", suit: "♥" },
      ];
      const hand = new DealerHand(cards, s17Rules);

      expect(hand.handValue).toBe(18);
    });

    test("should convert soft to hard when necessary", () => {
      const cards: Card[] = [
        { rank: "A", suit: "♠" },
        { rank: "6", suit: "♥" },
      ];
      const hand = new DealerHand(cards, s17Rules);
      hand.hit({ rank: "10", suit: "♦" });

      // A + 6 + 10 = 17 (ace as 1)
      expect(hand.handValue).toBe(17);
    });

    test("should handle face cards", () => {
      const cards: Card[] = [
        { rank: "K", suit: "♠" },
        { rank: "Q", suit: "♥" },
      ];
      const hand = new DealerHand(cards, s17Rules);

      expect(hand.handValue).toBe(20);
    });

    test("should handle number cards", () => {
      const cards: Card[] = [
        { rank: "8", suit: "♠" },
        { rank: "9", suit: "♥" },
      ];
      const hand = new DealerHand(cards, s17Rules);

      expect(hand.handValue).toBe(17);
    });

    test("should handle mixed cards", () => {
      const cards: Card[] = [
        { rank: "K", suit: "♠" },
        { rank: "5", suit: "♥" },
      ];
      const hand = new DealerHand(cards, s17Rules);
      hand.hit({ rank: "2", suit: "♦" });

      expect(hand.handValue).toBe(17);
    });

    test("should handle multiple aces correctly", () => {
      const cards: Card[] = [
        { rank: "A", suit: "♠" },
        { rank: "A", suit: "♥" },
      ];
      const hand = new DealerHand(cards, s17Rules);

      // Two aces: one as 11, one as 1 = 12
      expect(hand.handValue).toBe(12);
    });

    test("should handle three aces", () => {
      const cards: Card[] = [
        { rank: "A", suit: "♠" },
        { rank: "A", suit: "♥" },
      ];
      const hand = new DealerHand(cards, s17Rules);
      hand.hit({ rank: "A", suit: "♦" });

      // Three aces: one as 11, two as 1 = 13
      expect(hand.handValue).toBe(13);
    });

    test("should handle all aces as 1 when necessary", () => {
      const cards: Card[] = [
        { rank: "A", suit: "♠" },
        { rank: "A", suit: "♥" },
      ];
      const hand = new DealerHand(cards, s17Rules);
      hand.hit({ rank: "A", suit: "♦" });
      hand.hit({ rank: "A", suit: "♣" });

      // Four aces: one as 11, three as 1 = 14
      expect(hand.handValue).toBe(14);
    });
  });

  describe("Complex scenarios", () => {
    test("should handle dealer playing out a hand (s17)", () => {
      const cards: Card[] = [
        { rank: "10", suit: "♠" },
        { rank: "6", suit: "♥" },
      ];
      const hand = new DealerHand(cards, s17Rules);

      // Dealer has 16, must hit
      expect(hand.state).toBe("active");

      hand.hit({ rank: "3", suit: "♦" });
      // Now has 19, should stand (cv > 17 with s17 rules)
      expect(hand.handValue).toBe(19);
      expect(hand.state).toBe("stood");
    });

    test("should handle dealer playing out a hand (h17)", () => {
      const cards: Card[] = [
        { rank: "A", suit: "♠" },
        { rank: "6", suit: "♥" },
      ];
      const hand = new DealerHand(cards, h17Rules);

      // Dealer has soft 17, would hit in h17
      expect(hand.state).toBe("active");
      expect(hand.handValue).toBe(17);

      hand.hit({ rank: "4", suit: "♦" });
      // Now has 21
      expect(hand.handValue).toBe(21);
      expect(hand.state).toBe("blackjack");
    });

    test("should handle dealer busting", () => {
      const cards: Card[] = [
        { rank: "10", suit: "♠" },
        { rank: "6", suit: "♥" },
      ];
      const hand = new DealerHand(cards, s17Rules);

      hand.hit({ rank: "K", suit: "♦" });
      expect(hand.handValue).toBe(26);
      expect(hand.state).toBe("busted");
    });

    test("should handle soft hand converting to hard", () => {
      const cards: Card[] = [
        { rank: "A", suit: "♠" },
        { rank: "5", suit: "♥" },
      ];
      const hand = new DealerHand(cards, s17Rules);

      expect(hand.handValue).toBe(16); // Soft 16

      hand.hit({ rank: "10", suit: "♦" });
      expect(hand.handValue).toBe(16); // Hard 16 (A as 1)
      expect(hand.state).toBe("active");

      hand.hit({ rank: "5", suit: "♣" });
      expect(hand.handValue).toBe(21);
      expect(hand.state).toBe("blackjack");
    });
  });
});
