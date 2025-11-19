import { describe, expect, test, beforeEach } from "bun:test";
import { Hand } from "./hand";
import { Bank } from "./bank";
import { RuleSet } from "./rules";
import type { Card } from "./cards";

describe("Hand", () => {
  let bank: Bank;
  let rules: RuleSet;
  const userId = "test-user-123";
  const dealerUpCard: Card = { rank: "6", suit: "hearts" };

  beforeEach(() => {
    bank = new Bank(userId, 1000);
    rules = new RuleSet()
      .setDealerStand("s17")
      .setBlackjackPayout(3, 2)
      .setDoubleAfterSplit(true)
      .setSurrender("late");
  });

  describe("constructor", () => {
    test("should create hand with valid bet", () => {
      const hand = new Hand(rules, userId, bank, 100, dealerUpCard);
      expect(hand.betAmount).toBe(100);
      expect(bank.balance).toBe(900); // 1000 - 100
      expect(hand.state).toBe("active");
    });

    test("should throw error if bet exceeds balance", () => {
      expect(() => {
        new Hand(rules, userId, bank, 1500, dealerUpCard);
      }).toThrow("Insufficient funds to place bet");
    });

    test("should generate unique hand ID", () => {
      const hand1 = new Hand(rules, userId, bank, 50, dealerUpCard);
      const hand2 = new Hand(rules, userId, bank, 50, dealerUpCard);
      expect(hand1.id).not.toBe(hand2.id);
    });

    test("should track split properties correctly", () => {
      const hand = new Hand(
        rules,
        userId,
        bank,
        100,
        dealerUpCard,
        true, // isSplit
        true, // isSplitAce
        2, // splitCount
        1, // originalHandIndex
        "parent-hand-id",
      );
      expect(hand.isSplit).toBe(true);
      expect(hand.isSplitAce).toBe(true);
      expect(hand.originalHandIndex).toBe(1);
      expect(hand.parentHandId).toBe("parent-hand-id");
    });
  });

  describe("handValue", () => {
    test("should calculate simple hand value", () => {
      const hand = new Hand(rules, userId, bank, 100, dealerUpCard);
      hand.start([
        { rank: "7", suit: "hearts" },
        { rank: "8", suit: "diamonds" },
      ]);
      expect(hand.handValue).toBe(15);
    });

    test("should count face cards as 10", () => {
      const hand = new Hand(rules, userId, bank, 100, dealerUpCard);
      hand.start([
        { rank: "K", suit: "hearts" },
        { rank: "Q", suit: "diamonds" },
      ]);
      expect(hand.handValue).toBe(20);
    });

    test("should count Ace as 11 when possible", () => {
      const hand = new Hand(rules, userId, bank, 100, dealerUpCard);
      hand.start([
        { rank: "A", suit: "hearts" },
        { rank: "8", suit: "diamonds" },
      ]);
      expect(hand.handValue).toBe(19);
    });

    test("should count Ace as 1 when 11 would bust", () => {
      const hand = new Hand(rules, userId, bank, 100, dealerUpCard);
      hand.start([
        { rank: "A", suit: "hearts" },
        { rank: "8", suit: "diamonds" },
        { rank: "9", suit: "clubs" },
      ]);
      expect(hand.handValue).toBe(18); // A=1, 8, 9
    });

    test("should handle multiple Aces correctly", () => {
      const hand = new Hand(rules, userId, bank, 100, dealerUpCard);
      hand.start([
        { rank: "A", suit: "hearts" },
        { rank: "A", suit: "diamonds" },
      ]);
      expect(hand.handValue).toBe(12); // One Ace = 11, one Ace = 1
    });

    test("should handle multiple Aces with bust scenario", () => {
      const hand = new Hand(rules, userId, bank, 100, dealerUpCard);
      hand.start([
        { rank: "A", suit: "hearts" },
        { rank: "A", suit: "diamonds" },
        { rank: "A", suit: "clubs" },
        { rank: "8", suit: "spades" },
      ]);
      expect(hand.handValue).toBe(21); // One Ace = 11, two Aces = 1 each, 8 = 11+1+1+8=21
    });
  });

  describe("start", () => {
    test("should deal initial cards and assess hand", () => {
      const hand = new Hand(rules, userId, bank, 100, dealerUpCard);
      const actions = hand.start([
        { rank: "7", suit: "hearts" },
        { rank: "8", suit: "diamonds" },
      ]);
      expect(hand.cards.length).toBe(2);
      expect(hand.handValue).toBe(15);
      expect(actions.length).toBeGreaterThan(0); // Should have available actions
    });

    test("should recognize blackjack (Ace + 10 value)", () => {
      const hand = new Hand(rules, userId, bank, 100, dealerUpCard);
      hand.start([
        { rank: "A", suit: "hearts" },
        { rank: "K", suit: "diamonds" },
      ]);
      expect(hand.state).toBe("blackjack");
      expect(hand.handValue).toBe(21);
      expect(hand.availableActions).toHaveLength(0);
    });

    test("should not recognize 21 with 3 cards as blackjack", () => {
      const hand = new Hand(rules, userId, bank, 100, dealerUpCard);
      hand.start([
        { rank: "7", suit: "hearts" },
        { rank: "7", suit: "diamonds" },
      ]);
      hand.hit({ rank: "7", suit: "clubs" });
      expect(hand.state).toBe("active");
      expect(hand.handValue).toBe(21);
    });

    test("should handle single card deal", () => {
      const hand = new Hand(rules, userId, bank, 100, dealerUpCard);
      hand.start({ rank: "7", suit: "hearts" });
      expect(hand.cards.length).toBe(1);
      expect(hand.handValue).toBe(7);
    });
  });

  describe("hit", () => {
    test("should add card to hand", () => {
      const hand = new Hand(rules, userId, bank, 100, dealerUpCard);
      hand.start([
        { rank: "7", suit: "hearts" },
        { rank: "8", suit: "diamonds" },
      ]);
      hand.hit({ rank: "5", suit: "clubs" });
      expect(hand.cards.length).toBe(3);
      expect(hand.handValue).toBe(20);
    });

    test("should bust when going over 21", () => {
      const hand = new Hand(rules, userId, bank, 100, dealerUpCard);
      hand.start([
        { rank: "10", suit: "hearts" },
        { rank: "8", suit: "diamonds" },
      ]);
      hand.hit({ rank: "5", suit: "clubs" });
      expect(hand.state).toBe("busted");
      expect(hand.availableActions).toHaveLength(0);
    });

    test("should remain active when not bust", () => {
      const hand = new Hand(rules, userId, bank, 100, dealerUpCard);
      hand.start([
        { rank: "7", suit: "hearts" },
        { rank: "8", suit: "diamonds" },
      ]);
      hand.hit({ rank: "2", suit: "clubs" });
      expect(hand.state).toBe("active");
      expect(hand.handValue).toBe(17);
    });
  });

  describe("stand", () => {
    test("should set state to stood and clear actions", () => {
      const hand = new Hand(rules, userId, bank, 100, dealerUpCard);
      hand.start([
        { rank: "10", suit: "hearts" },
        { rank: "7", suit: "diamonds" },
      ]);
      hand.stand();
      expect(hand.state).toBe("stood");
      expect(hand.availableActions).toHaveLength(0);
    });
  });

  describe("double", () => {
    test("should double bet and add one card", () => {
      const hand = new Hand(rules, userId, bank, 100, dealerUpCard);
      hand.start([
        { rank: "5", suit: "hearts" },
        { rank: "6", suit: "diamonds" },
      ]);
      hand.double({ rank: "9", suit: "clubs" });
      expect(hand.betAmount).toBe(200);
      expect(hand.state).toBe("stood");
      expect(hand.handValue).toBe(20);
      expect(bank.balance).toBe(800); // 1000 - 100 - 100
    });

    test("should throw error if insufficient funds", () => {
      const poorBank = new Bank(userId, 150);
      const hand = new Hand(rules, userId, poorBank, 100, dealerUpCard);
      hand.start([
        { rank: "5", suit: "hearts" },
        { rank: "6", suit: "diamonds" },
      ]);
      expect(() => {
        hand.double({ rank: "9", suit: "clubs" });
      }).toThrow("Insufficient funds to double down");
    });
  });

  describe("surrender", () => {
    test("should surrender with two cards", () => {
      const hand = new Hand(rules, userId, bank, 100, dealerUpCard);
      hand.start([
        { rank: "10", suit: "hearts" },
        { rank: "6", suit: "diamonds" },
      ]);
      hand.surrender();
      expect(hand.state).toBe("surrendered");
      expect(hand.availableActions).toHaveLength(0);
    });

    test("should throw error if not exactly two cards", () => {
      const hand = new Hand(rules, userId, bank, 100, dealerUpCard);
      hand.start([
        { rank: "5", suit: "hearts" },
        { rank: "6", suit: "diamonds" },
      ]);
      hand.hit({ rank: "2", suit: "clubs" });
      expect(() => {
        hand.surrender();
      }).toThrow("Can only surrender on first two cards");
    });
  });

  describe("split", () => {
    test("should split pair into two hands", () => {
      const hand = new Hand(rules, userId, bank, 100, dealerUpCard);
      hand.start([
        { rank: "8", suit: "hearts" },
        { rank: "8", suit: "diamonds" },
      ]);
      const result = hand.split(
        { rank: "5", suit: "clubs" },
        { rank: "7", suit: "spades" },
      );
      expect(result.splitHand).toBeDefined();
      expect(result.originalHand.cards.length).toBe(2); // Original hand: 8 + 5
      expect(result.splitHand.cards.length).toBe(2); // Split hand: 8 + 7
      expect(hand.isSplit).toBe(true);
      expect(result.splitHand.isSplit).toBe(true);
      expect(bank.balance).toBe(800); // 1000 - 100 - 100
    });

    test("should mark split Aces correctly", () => {
      const hand = new Hand(rules, userId, bank, 100, dealerUpCard);
      hand.start([
        { rank: "A", suit: "hearts" },
        { rank: "A", suit: "diamonds" },
      ]);
      const result = hand.split(
        { rank: "5", suit: "clubs" },
        { rank: "7", suit: "spades" },
      );
      expect(hand.isSplitAce).toBe(true);
      expect(result.splitHand.isSplitAce).toBe(true);
    });

    test("should throw error if insufficient funds", () => {
      const poorBank = new Bank(userId, 150);
      const hand = new Hand(rules, userId, poorBank, 100, dealerUpCard);
      hand.start([
        { rank: "8", suit: "hearts" },
        { rank: "8", suit: "diamonds" },
      ]);
      expect(() => {
        hand.split({ rank: "5", suit: "clubs" }, { rank: "7", suit: "spades" });
      }).toThrow("Insufficient funds to split hand");
    });

    test("should maintain parent-child relationship", () => {
      const hand = new Hand(rules, userId, bank, 100, dealerUpCard);
      hand.start([
        { rank: "8", suit: "hearts" },
        { rank: "8", suit: "diamonds" },
      ]);
      const result = hand.split(
        { rank: "5", suit: "clubs" },
        { rank: "7", suit: "spades" },
      );
      expect(result.splitHand.parentHandId).toBe(hand.id);
    });
  });

  describe("insurance", () => {
    const dealerAceCard: Card = { rank: "A", suit: "spades" };

    test("should take insurance bet (half of original)", () => {
      const hand = new Hand(rules, userId, bank, 100, dealerAceCard);
      hand.start([
        { rank: "10", suit: "hearts" },
        { rank: "7", suit: "diamonds" },
      ]);
      hand.takeInsurance();
      expect(hand.hasInsurance).toBe(true);
      expect(hand.insuranceAmount).toBe(50);
      expect(bank.balance).toBe(850); // 1000 - 100 - 50
    });

    test("should throw error if insurance already taken", () => {
      const hand = new Hand(rules, userId, bank, 100, dealerAceCard);
      hand.start([
        { rank: "10", suit: "hearts" },
        { rank: "7", suit: "diamonds" },
      ]);
      hand.takeInsurance();
      expect(() => {
        hand.takeInsurance();
      }).toThrow("Insurance already taken");
    });

    test("should throw error if insufficient funds for insurance", () => {
      const poorBank = new Bank(userId, 120);
      const hand = new Hand(rules, userId, poorBank, 100, dealerAceCard);
      hand.start([
        { rank: "10", suit: "hearts" },
        { rank: "7", suit: "diamonds" },
      ]);
      expect(() => {
        hand.takeInsurance();
      }).toThrow("Insufficient funds for insurance");
    });

    test("should decline insurance", () => {
      const hand = new Hand(rules, userId, bank, 100, dealerAceCard);
      hand.insuranceOffered = true;
      hand.start([
        { rank: "10", suit: "hearts" },
        { rank: "7", suit: "diamonds" },
      ]);
      hand.declineInsurance();
      expect(hand.insuranceOffered).toBe(false);
      expect(hand.hasInsurance).toBe(false);
    });
  });

  describe("getters", () => {
    test("should return copy of cards array", () => {
      const hand = new Hand(rules, userId, bank, 100, dealerUpCard);
      hand.start([
        { rank: "10", suit: "hearts" },
        { rank: "7", suit: "diamonds" },
      ]);
      const cards = hand.cards;
      cards.push({ rank: "5", suit: "clubs" });
      expect(hand.cards.length).toBe(2); // Original should not be modified
    });

    test("should return correct bet amount", () => {
      const hand = new Hand(rules, userId, bank, 100, dealerUpCard);
      expect(hand.betAmount).toBe(100);
    });

    test("should return escrow object", () => {
      const hand = new Hand(rules, userId, bank, 100, dealerUpCard);
      const escrow = hand.escrow;
      expect(escrow.balance).toBe(100);
    });
  });
});
