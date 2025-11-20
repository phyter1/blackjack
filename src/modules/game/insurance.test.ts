import { beforeEach, describe, expect, test } from "bun:test";
import { Bank, House } from "./bank";
import type { Card } from "./cards";
import { Round, type PlayerRoundInfo } from "./round";
import { RuleSet } from "./rules";
import { Shoe } from "./shoe";

/**
 * IMPORTANT: Card order in test stacks
 * When shoe.deal(players) is called with 1 player:
 * - Cards 0-1: Player hand
 * - Cards 2-3: Dealer hand (card 2 is upCard, card 3 is hole card)
 */

describe("Insurance Resolution", () => {
  let rules: RuleSet;
  let house: House;
  let bank: Bank;
  const userId = "test-user";

  beforeEach(() => {
    rules = new RuleSet()
      .setDealerStand("s17")
      .setBlackjackPayout(3, 2)
      .setDoubleAfterSplit(true)
      .setSurrender("late");

    house = new House(1000000);
    bank = new Bank(userId, 1000);
  });

  describe("Insurance Phase Detection", () => {
    test("should enter insurance phase when dealer shows Ace", () => {
      const playerInfo: PlayerRoundInfo[] = [{ userId, bank, bet: 100 }];

      const testStack: Card[] = [
        { rank: "10", suit: "diamonds" }, // Player card 1
        { rank: "9", suit: "clubs" }, // Player card 2
        { rank: "A", suit: "spades" }, // Dealer up card (SHOWS ACE)
        { rank: "6", suit: "hearts" }, // Dealer hole card (no blackjack)
      ];
      const controlledShoe = new Shoe(1, 0.75, testStack);

      const round = new Round(1, playerInfo, controlledShoe, rules);

      expect(round.state).toBe("insurance");
      expect(round.playerHands[0].insuranceOffered).toBe(true);
    });

    test("should skip insurance phase when dealer does not show Ace", () => {
      const playerInfo: PlayerRoundInfo[] = [{ userId, bank, bet: 100 }];

      const testStack: Card[] = [
        { rank: "10", suit: "diamonds" }, // Player
        { rank: "9", suit: "clubs" },
        { rank: "6", suit: "spades" }, // Dealer up (NOT ACE)
        { rank: "K", suit: "hearts" },
      ];
      const controlledShoe = new Shoe(1, 0.75, testStack);

      const round = new Round(1, playerInfo, controlledShoe, rules);

      expect(round.state).toBe("player_turn");
      expect(round.playerHands[0].insuranceOffered).toBe(false);
    });
  });

  describe("Taking Insurance", () => {
    test("should allow player to take insurance", () => {
      const playerInfo: PlayerRoundInfo[] = [{ userId, bank, bet: 100 }];

      const testStack: Card[] = [
        { rank: "10", suit: "diamonds" },
        { rank: "9", suit: "clubs" },
        { rank: "A", suit: "spades" }, // Dealer shows Ace
        { rank: "6", suit: "hearts" },
      ];
      const controlledShoe = new Shoe(1, 0.75, testStack);
      const round = new Round(1, playerInfo, controlledShoe, rules);

      expect(round.state).toBe("insurance");

      round.takeInsurance(0);

      const hand = round.getPlayerHand(0);
      expect(hand.hasInsurance).toBe(true);
      expect(hand.insuranceAmount).toBe(50); // Half of 100 bet
      expect(bank.balance).toBe(850); // 1000 - 100 (bet) - 50 (insurance)
    });

    test("should throw error when taking insurance outside insurance phase", () => {
      const playerInfo: PlayerRoundInfo[] = [{ userId, bank, bet: 100 }];

      const testStack: Card[] = [
        { rank: "10", suit: "diamonds" },
        { rank: "9", suit: "clubs" },
        { rank: "6", suit: "spades" }, // No Ace, no insurance phase
        { rank: "K", suit: "hearts" },
      ];
      const controlledShoe = new Shoe(1, 0.75, testStack);
      const round = new Round(1, playerInfo, controlledShoe, rules);

      expect(() => round.takeInsurance(0)).toThrow(
        "Can only take insurance during insurance phase",
      );
    });

    test("should throw error for invalid hand index", () => {
      const playerInfo: PlayerRoundInfo[] = [{ userId, bank, bet: 100 }];

      const testStack: Card[] = [
        { rank: "10", suit: "diamonds" },
        { rank: "9", suit: "clubs" },
        { rank: "A", suit: "spades" },
        { rank: "K", suit: "hearts" },
      ];
      const controlledShoe = new Shoe(1, 0.75, testStack);
      const round = new Round(1, playerInfo, controlledShoe, rules);

      expect(() => round.takeInsurance(5)).toThrow("Hand index 5 out of range");
    });
  });

  describe("Declining Insurance", () => {
    test("should allow player to decline insurance", () => {
      const playerInfo: PlayerRoundInfo[] = [{ userId, bank, bet: 100 }];

      const testStack: Card[] = [
        { rank: "10", suit: "diamonds" },
        { rank: "9", suit: "clubs" },
        { rank: "A", suit: "spades" },
        { rank: "6", suit: "hearts" },
      ];
      const controlledShoe = new Shoe(1, 0.75, testStack);
      const round = new Round(1, playerInfo, controlledShoe, rules);

      round.declineInsurance(0);

      const hand = round.getPlayerHand(0);
      expect(hand.hasInsurance).toBe(false);
      expect(hand.insuranceOffered).toBe(false);
    });

    test("should throw error when declining insurance outside insurance phase", () => {
      const playerInfo: PlayerRoundInfo[] = [{ userId, bank, bet: 100 }];

      const testStack: Card[] = [
        { rank: "10", suit: "diamonds" },
        { rank: "9", suit: "clubs" },
        { rank: "6", suit: "spades" },
        { rank: "K", suit: "hearts" },
      ];
      const controlledShoe = new Shoe(1, 0.75, testStack);
      const round = new Round(1, playerInfo, controlledShoe, rules);

      expect(() => round.declineInsurance(0)).toThrow(
        "Can only decline insurance during insurance phase",
      );
    });
  });

  describe("Insurance Resolution - Dealer Blackjack", () => {
    test("should pay 2:1 on insurance when dealer has blackjack", () => {
      const playerInfo: PlayerRoundInfo[] = [{ userId, bank, bet: 100 }];

      // Dealer gets A♠ + K♥ = Blackjack
      const testStack: Card[] = [
        { rank: "10", suit: "diamonds" }, // Player
        { rank: "9", suit: "clubs" },
        { rank: "A", suit: "spades" }, // Dealer up
        { rank: "K", suit: "hearts" }, // Dealer hole = BLACKJACK
      ];
      const controlledShoe = new Shoe(1, 0.75, testStack);
      const round = new Round(1, playerInfo, controlledShoe, rules);

      round.takeInsurance(0);
      const balanceBefore = bank.balance;

      const result = round.resolveInsurance(house);

      expect(result.dealerBlackjack).toBe(true);
      expect(result.insuranceResults[0].hadInsurance).toBe(true);
      expect(result.insuranceResults[0].payout).toBe(150); // 50 * 3 (bet back + 2:1 win)
      expect(bank.balance).toBe(balanceBefore + 150); // Gets insurance payout
      expect(house.profitLoss).toBe(-100); // Lost 2x the 50 insurance bet
      expect(round.state).toBe("settling"); // Round goes directly to settling
    });

    test("should not pay insurance when dealer has blackjack but player declined", () => {
      const playerInfo: PlayerRoundInfo[] = [{ userId, bank, bet: 100 }];

      const testStack: Card[] = [
        { rank: "10", suit: "diamonds" },
        { rank: "9", suit: "clubs" },
        { rank: "A", suit: "spades" },
        { rank: "K", suit: "hearts" }, // Blackjack
      ];
      const controlledShoe = new Shoe(1, 0.75, testStack);
      const round = new Round(1, playerInfo, controlledShoe, rules);

      round.declineInsurance(0);
      const balanceBefore = bank.balance;

      const result = round.resolveInsurance(house);

      expect(result.dealerBlackjack).toBe(true);
      expect(result.insuranceResults[0].hadInsurance).toBe(false);
      expect(result.insuranceResults[0].payout).toBe(0);
      expect(bank.balance).toBe(balanceBefore); // No change
      expect(house.profitLoss).toBe(0); // No insurance bet to win
    });
  });

  describe("Insurance Resolution - No Dealer Blackjack", () => {
    test("should lose insurance bet when dealer does not have blackjack", () => {
      const playerInfo: PlayerRoundInfo[] = [{ userId, bank, bet: 100 }];

      // Dealer gets A♠ + 6♥ = 17 (not blackjack)
      const testStack: Card[] = [
        { rank: "10", suit: "diamonds" },
        { rank: "9", suit: "clubs" },
        { rank: "A", suit: "spades" }, // Dealer up
        { rank: "6", suit: "hearts" }, // Dealer hole = NO blackjack
      ];
      const controlledShoe = new Shoe(1, 0.75, testStack);
      const round = new Round(1, playerInfo, controlledShoe, rules);

      round.takeInsurance(0);
      const balanceBefore = bank.balance; // Already has insurance deducted

      const result = round.resolveInsurance(house);

      expect(result.dealerBlackjack).toBe(false);
      expect(result.insuranceResults[0].hadInsurance).toBe(true);
      expect(result.insuranceResults[0].payout).toBe(0);
      expect(bank.balance).toBe(balanceBefore); // Insurance already deducted, stays same
      expect(house.profitLoss).toBe(50); // Won the 50 insurance bet
      expect(round.state).toBe("player_turn"); // Round continues to player turn
    });

    test("should continue to player turn when no blackjack and insurance declined", () => {
      const playerInfo: PlayerRoundInfo[] = [{ userId, bank, bet: 100 }];

      const testStack: Card[] = [
        { rank: "10", suit: "diamonds" },
        { rank: "9", suit: "clubs" },
        { rank: "A", suit: "spades" },
        { rank: "6", suit: "hearts" },
      ];
      const controlledShoe = new Shoe(1, 0.75, testStack);
      const round = new Round(1, playerInfo, controlledShoe, rules);

      round.declineInsurance(0);

      const result = round.resolveInsurance(house);

      expect(result.dealerBlackjack).toBe(false);
      expect(round.state).toBe("player_turn");
    });
  });

  describe("Insurance Resolution - Multiple Hands", () => {
    test("should resolve insurance for multiple hands correctly", () => {
      const bank2 = new Bank("player-2", 1000);
      const playerInfo: PlayerRoundInfo[] = [
        { userId: "player-1", bank, bet: 100 },
        { userId: "player-2", bank: bank2, bet: 200 },
      ];

      // Dealer has blackjack
      const testStack: Card[] = [
        { rank: "10", suit: "diamonds" }, // Player 1 card 1
        { rank: "9", suit: "clubs" }, // Player 1 card 2
        { rank: "8", suit: "hearts" }, // Player 2 card 1
        { rank: "7", suit: "spades" }, // Player 2 card 2
        { rank: "A", suit: "spades" }, // Dealer up
        { rank: "K", suit: "hearts" }, // Dealer hole = BLACKJACK
      ];
      const controlledShoe = new Shoe(1, 0.75, testStack);
      const round = new Round(1, playerInfo, controlledShoe, rules);

      // Player 1 takes insurance, Player 2 declines
      round.takeInsurance(0);
      round.declineInsurance(1);

      const balance1Before = bank.balance;
      const balance2Before = bank2.balance;

      const result = round.resolveInsurance(house);

      expect(result.dealerBlackjack).toBe(true);
      expect(result.insuranceResults).toHaveLength(2);

      // Player 1 gets insurance payout
      expect(result.insuranceResults[0].hadInsurance).toBe(true);
      expect(result.insuranceResults[0].payout).toBe(150); // 50 * 3
      expect(bank.balance).toBe(balance1Before + 150);

      // Player 2 gets nothing (declined insurance)
      expect(result.insuranceResults[1].hadInsurance).toBe(false);
      expect(result.insuranceResults[1].payout).toBe(0);
      expect(bank2.balance).toBe(balance2Before);

      expect(house.profitLoss).toBe(-100); // Lost 2x the 50 insurance from player 1
    });

    test("should handle mixed insurance outcomes when dealer does not have blackjack", () => {
      const bank2 = new Bank("player-2", 1000);
      const playerInfo: PlayerRoundInfo[] = [
        { userId: "player-1", bank, bet: 100 },
        { userId: "player-2", bank: bank2, bet: 200 },
      ];

      // Dealer does not have blackjack
      const testStack: Card[] = [
        { rank: "10", suit: "diamonds" },
        { rank: "9", suit: "clubs" },
        { rank: "8", suit: "hearts" },
        { rank: "7", suit: "spades" },
        { rank: "A", suit: "spades" }, // Dealer up
        { rank: "6", suit: "hearts" }, // Dealer hole = NO blackjack
      ];
      const controlledShoe = new Shoe(1, 0.75, testStack);
      const round = new Round(1, playerInfo, controlledShoe, rules);

      // Both players take insurance
      round.takeInsurance(0);
      round.takeInsurance(1);

      const balance1Before = bank.balance;
      const balance2Before = bank2.balance;

      const result = round.resolveInsurance(house);

      expect(result.dealerBlackjack).toBe(false);

      // Both players lose insurance
      expect(result.insuranceResults[0].payout).toBe(0);
      expect(result.insuranceResults[1].payout).toBe(0);
      expect(bank.balance).toBe(balance1Before); // No change (already deducted)
      expect(bank2.balance).toBe(balance2Before); // No change (already deducted)
      expect(house.profitLoss).toBe(150); // Won 50 from player 1 + 100 from player 2
      expect(round.state).toBe("player_turn");
    });
  });

  describe("Insurance Resolution - Error Cases", () => {
    test("should throw error when resolving insurance outside insurance phase", () => {
      const playerInfo: PlayerRoundInfo[] = [{ userId, bank, bet: 100 }];

      const testStack: Card[] = [
        { rank: "10", suit: "diamonds" },
        { rank: "9", suit: "clubs" },
        { rank: "6", suit: "spades" }, // No insurance phase
        { rank: "K", suit: "hearts" },
      ];
      const controlledShoe = new Shoe(1, 0.75, testStack);
      const round = new Round(1, playerInfo, controlledShoe, rules);

      expect(() => round.resolveInsurance(house)).toThrow(
        "Cannot resolve insurance - not in insurance phase",
      );
    });
  });

  describe("Insurance with Player Blackjack", () => {
    test("should handle insurance when player also has blackjack", () => {
      const playerInfo: PlayerRoundInfo[] = [{ userId, bank, bet: 100 }];

      // Both dealer and player have blackjack
      const testStack: Card[] = [
        { rank: "A", suit: "diamonds" }, // Player card 1
        { rank: "K", suit: "clubs" }, // Player card 2 = BLACKJACK
        { rank: "A", suit: "spades" }, // Dealer up
        { rank: "K", suit: "hearts" }, // Dealer hole = BLACKJACK
      ];
      const controlledShoe = new Shoe(1, 0.75, testStack);
      const round = new Round(1, playerInfo, controlledShoe, rules);

      round.takeInsurance(0);
      const balanceBefore = bank.balance;

      const result = round.resolveInsurance(house);

      // Player gets insurance payout
      expect(result.dealerBlackjack).toBe(true);
      expect(result.insuranceResults[0].payout).toBe(150);
      expect(bank.balance).toBe(balanceBefore + 150);

      // Round should go to settling where player-dealer blackjack push will be handled
      expect(round.state).toBe("settling");
    });
  });

  describe("Insurance Money Flow Verification", () => {
    test("should verify complete money flow for insurance win", () => {
      const playerInfo: PlayerRoundInfo[] = [{ userId, bank, bet: 100 }];

      const testStack: Card[] = [
        { rank: "10", suit: "diamonds" },
        { rank: "9", suit: "clubs" },
        { rank: "A", suit: "spades" },
        { rank: "K", suit: "hearts" }, // Blackjack
      ];
      const controlledShoe = new Shoe(1, 0.75, testStack);
      const round = new Round(1, playerInfo, controlledShoe, rules);

      // Initial state
      expect(bank.balance).toBe(900); // 1000 - 100 (bet)

      round.takeInsurance(0);
      expect(bank.balance).toBe(850); // 900 - 50 (insurance)

      const houseBalanceBefore = house.balance;
      round.resolveInsurance(house);

      // After resolution
      expect(bank.balance).toBe(1000); // 850 + 150 (insurance payout)
      expect(house.balance).toBe(houseBalanceBefore - 150);
    });

    test("should verify complete money flow for insurance loss", () => {
      const playerInfo: PlayerRoundInfo[] = [{ userId, bank, bet: 100 }];

      const testStack: Card[] = [
        { rank: "10", suit: "diamonds" },
        { rank: "9", suit: "clubs" },
        { rank: "A", suit: "spades" },
        { rank: "6", suit: "hearts" }, // No blackjack
      ];
      const controlledShoe = new Shoe(1, 0.75, testStack);
      const round = new Round(1, playerInfo, controlledShoe, rules);

      expect(bank.balance).toBe(900);

      round.takeInsurance(0);
      expect(bank.balance).toBe(850);

      const houseBalanceBefore = house.balance;
      round.resolveInsurance(house);

      // After resolution - insurance bet stays with house
      expect(bank.balance).toBe(850); // No change
      expect(house.balance).toBe(houseBalanceBefore + 50);
      expect(house.profitLoss).toBe(50);
    });
  });
});
