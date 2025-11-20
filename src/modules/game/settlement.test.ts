import { beforeEach, describe, expect, test } from "bun:test";
import { Bank, House } from "./bank";
import type { Card } from "./cards";
import { DealerHand } from "./dealer-hand";
import { Hand } from "./hand";
import { RuleSet } from "./rules";
import {
  calculatePayout,
  calculateProfit,
  compareHands,
  determineOutcome,
  settleHand,
  settleRound,
} from "./settlement";

describe("Settlement Module", () => {
  let rules: RuleSet;
  const userId = "test-user";
  const dealerUpCard: Card = { rank: "6", suit: "hearts" };

  beforeEach(() => {
    rules = new RuleSet()
      .setDealerStand("s17")
      .setBlackjackPayout(3, 2)
      .setDoubleAfterSplit(true)
      .setSurrender("late");
  });

  describe("compareHands", () => {
    test("should return 'player' when player value higher", () => {
      const bank = new Bank(userId, 1000);
      const playerHand = new Hand(rules, userId, bank, 100, dealerUpCard);
      playerHand.start([
        { rank: "10", suit: "hearts" },
        { rank: "9", suit: "diamonds" },
      ]);

      const dealerHand = new DealerHand(
        [
          { rank: "10", suit: "clubs" },
          { rank: "7", suit: "spades" },
        ],
        rules,
      );

      expect(compareHands(playerHand, dealerHand)).toBe("player");
    });

    test("should return 'dealer' when dealer value higher", () => {
      const bank = new Bank(userId, 1000);
      const playerHand = new Hand(rules, userId, bank, 100, dealerUpCard);
      playerHand.start([
        { rank: "10", suit: "hearts" },
        { rank: "7", suit: "diamonds" },
      ]);

      const dealerHand = new DealerHand(
        [
          { rank: "10", suit: "clubs" },
          { rank: "9", suit: "spades" },
        ],
        rules,
      );

      expect(compareHands(playerHand, dealerHand)).toBe("dealer");
    });

    test("should return 'push' when values equal", () => {
      const bank = new Bank(userId, 1000);
      const playerHand = new Hand(rules, userId, bank, 100, dealerUpCard);
      playerHand.start([
        { rank: "10", suit: "hearts" },
        { rank: "8", suit: "diamonds" },
      ]);

      const dealerHand = new DealerHand(
        [
          { rank: "K", suit: "clubs" },
          { rank: "8", suit: "spades" },
        ],
        rules,
      );

      expect(compareHands(playerHand, dealerHand)).toBe("push");
    });

    test("should return 'dealer' when player busts", () => {
      const bank = new Bank(userId, 1000);
      const playerHand = new Hand(rules, userId, bank, 100, dealerUpCard);
      playerHand.start([
        { rank: "10", suit: "hearts" },
        { rank: "9", suit: "diamonds" },
      ]);
      playerHand.hit({ rank: "5", suit: "clubs" }); // Bust at 24

      const dealerHand = new DealerHand(
        [
          { rank: "10", suit: "clubs" },
          { rank: "7", suit: "spades" },
        ],
        rules,
      );

      expect(compareHands(playerHand, dealerHand)).toBe("dealer");
    });

    test("should return 'player' when dealer busts", () => {
      const bank = new Bank(userId, 1000);
      const playerHand = new Hand(rules, userId, bank, 100, dealerUpCard);
      playerHand.start([
        { rank: "10", suit: "hearts" },
        { rank: "8", suit: "diamonds" },
      ]);

      const dealerHand = new DealerHand(
        [
          { rank: "10", suit: "clubs" },
          { rank: "9", suit: "spades" },
        ],
        rules,
      );
      dealerHand.hit({ rank: "5", suit: "hearts" }); // Bust at 24

      expect(compareHands(playerHand, dealerHand)).toBe("player");
    });
  });

  describe("calculatePayout", () => {
    test("should calculate blackjack payout (3:2)", () => {
      const betAmount = 100;
      const payout = calculatePayout(betAmount, "blackjack", rules.build());
      expect(payout).toBe(250); // Bet 100, win 150, total 250
    });

    test("should calculate blackjack payout (6:5)", () => {
      const poorRules = new RuleSet().setBlackjackPayout(6, 5).build();
      const betAmount = 100;
      const payout = calculatePayout(betAmount, "blackjack", poorRules);
      expect(payout).toBe(220); // Bet 100, win 120, total 220
    });

    test("should calculate win payout (1:1)", () => {
      const betAmount = 100;
      const payout = calculatePayout(betAmount, "win", rules.build());
      expect(payout).toBe(200); // Bet 100, win 100, total 200
    });

    test("should calculate push payout (return bet)", () => {
      const betAmount = 100;
      const payout = calculatePayout(betAmount, "push", rules.build());
      expect(payout).toBe(100);
    });

    test("should calculate surrender payout (half bet)", () => {
      const betAmount = 100;
      const payout = calculatePayout(betAmount, "surrender", rules.build());
      expect(payout).toBe(50);
    });

    test("should calculate lose payout (zero)", () => {
      const betAmount = 100;
      const payout = calculatePayout(betAmount, "lose", rules.build());
      expect(payout).toBe(0);
    });
  });

  describe("calculateProfit", () => {
    test("should calculate profit for win", () => {
      expect(calculateProfit(100, 200)).toBe(100);
    });

    test("should calculate profit for blackjack", () => {
      expect(calculateProfit(100, 250)).toBe(150);
    });

    test("should calculate zero profit for push", () => {
      expect(calculateProfit(100, 100)).toBe(0);
    });

    test("should calculate loss", () => {
      expect(calculateProfit(100, 0)).toBe(-100);
    });

    test("should calculate loss for surrender", () => {
      expect(calculateProfit(100, 50)).toBe(-50);
    });
  });

  describe("settleHand - Money Transfer", () => {
    let house: House;
    let bank: Bank;

    beforeEach(() => {
      house = new House(1000000);
      bank = new Bank(userId, 1000);
    });

    test("should transfer money correctly for player win", () => {
      const playerHand = new Hand(rules, userId, bank, 100, dealerUpCard);
      playerHand.start([
        { rank: "10", suit: "hearts" },
        { rank: "9", suit: "diamonds" },
      ]);

      const dealerHand = new DealerHand(
        [
          { rank: "10", suit: "clubs" },
          { rank: "7", suit: "spades" },
        ],
        rules,
      );

      const result = settleHand(playerHand, dealerHand, house, rules.build());

      expect(result.outcome).toBe("win");
      expect(result.payout).toBe(200);
      expect(result.profit).toBe(100);
      expect(bank.balance).toBe(1100); // 1000 - 100 (bet) + 200 (payout)
      expect(house.balance).toBe(999800); // 1000000 - 200
      expect(house.profitLoss).toBe(-100);
    });

    test("should transfer money correctly for player loss", () => {
      const playerHand = new Hand(rules, userId, bank, 100, dealerUpCard);
      playerHand.start([
        { rank: "10", suit: "hearts" },
        { rank: "7", suit: "diamonds" },
      ]);

      const dealerHand = new DealerHand(
        [
          { rank: "10", suit: "clubs" },
          { rank: "9", suit: "spades" },
        ],
        rules,
      );

      const result = settleHand(playerHand, dealerHand, house, rules.build());

      expect(result.outcome).toBe("lose");
      expect(result.payout).toBe(0);
      expect(result.profit).toBe(-100);
      expect(bank.balance).toBe(900); // 1000 - 100 (bet)
      expect(house.balance).toBe(1000100); // 1000000 + 100
      expect(house.profitLoss).toBe(100);
    });

    test("should transfer money correctly for push", () => {
      const playerHand = new Hand(rules, userId, bank, 100, dealerUpCard);
      playerHand.start([
        { rank: "10", suit: "hearts" },
        { rank: "8", suit: "diamonds" },
      ]);

      const dealerHand = new DealerHand(
        [
          { rank: "K", suit: "clubs" },
          { rank: "8", suit: "spades" },
        ],
        rules,
      );

      const result = settleHand(playerHand, dealerHand, house, rules.build());

      expect(result.outcome).toBe("push");
      expect(result.payout).toBe(100);
      expect(result.profit).toBe(0);
      expect(bank.balance).toBe(1000); // 1000 - 100 + 100
      expect(house.balance).toBe(1000000); // No change
      expect(house.profitLoss).toBe(0);
    });

    test("should transfer money correctly for blackjack", () => {
      const playerHand = new Hand(rules, userId, bank, 100, dealerUpCard);
      playerHand.start([
        { rank: "A", suit: "hearts" },
        { rank: "K", suit: "diamonds" },
      ]);

      const dealerHand = new DealerHand(
        [
          { rank: "10", suit: "clubs" },
          { rank: "7", suit: "spades" },
        ],
        rules,
      );

      const result = settleHand(playerHand, dealerHand, house, rules.build());

      expect(result.outcome).toBe("blackjack");
      expect(result.payout).toBe(250);
      expect(result.profit).toBe(150);
      expect(bank.balance).toBe(1150); // 1000 - 100 + 250
      expect(house.balance).toBe(999750); // 1000000 - 250
      expect(house.profitLoss).toBe(-150);
    });

    test("should transfer money correctly for surrender", () => {
      const playerHand = new Hand(rules, userId, bank, 100, dealerUpCard);
      playerHand.start([
        { rank: "10", suit: "hearts" },
        { rank: "6", suit: "diamonds" },
      ]);
      playerHand.surrender();

      const dealerHand = new DealerHand(
        [
          { rank: "10", suit: "clubs" },
          { rank: "7", suit: "spades" },
        ],
        rules,
      );

      const result = settleHand(playerHand, dealerHand, house, rules.build());

      expect(result.outcome).toBe("surrender");
      expect(result.payout).toBe(50);
      expect(result.profit).toBe(-50);
      expect(bank.balance).toBe(950); // 1000 - 100 + 50
      expect(house.balance).toBe(999950); // 1000000 - 50 (house pays half bet back)
      expect(house.profitLoss).toBe(50);
    });
  });

  describe("settleRound - Multiple Hands", () => {
    test("should settle multiple hands correctly", () => {
      const house = new House(1000000);
      const bank = new Bank(userId, 1000);

      const hand1 = new Hand(rules, userId, bank, 100, dealerUpCard);
      hand1.start([
        { rank: "10", suit: "hearts" },
        { rank: "9", suit: "diamonds" },
      ]);

      const hand2 = new Hand(rules, userId, bank, 50, dealerUpCard);
      hand2.start([
        { rank: "10", suit: "spades" },
        { rank: "6", suit: "clubs" },
      ]);

      const dealerHand = new DealerHand(
        [
          { rank: "10", suit: "clubs" },
          { rank: "8", suit: "spades" },
        ],
        rules,
      );

      const results = settleRound(
        [hand1, hand2],
        dealerHand,
        house,
        rules.build(),
      );

      expect(results).toHaveLength(2);
      expect(results[0].outcome).toBe("win");
      expect(results[1].outcome).toBe("lose");
      expect(bank.balance).toBe(1050); // 1000 - 150 + 200
      expect(house.profitLoss).toBe(-50); // Won 100 from hand1, lost 50 from hand2
    });
  });
});
