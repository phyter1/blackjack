import { beforeEach, describe, expect, test } from "bun:test";
import {
  ACTION_DOUBLE,
  ACTION_HIT,
  ACTION_STAND,
  ACTION_SURRENDER,
} from "./action";
import { Bank, House } from "./bank";
import type { Card } from "./cards";
import { Round, type PlayerRoundInfo } from "./round";
import { RuleSet } from "./rules";
import { Shoe } from "./shoe";

/**
 * Tests for Round orchestration and state machine
 *
 * IMPORTANT: Round automatically calls playDealerTurn() when all player hands are complete
 * This means state goes: player_turn → dealer_turn → settling (all automatic)
 *
 * Card order in test stacks:
 * - Cards 0-1: Player 1 hand
 * - Cards 2-3: Player 2 hand (if 2 players)
 * - Cards N-2, N-1: Dealer hand (N-2 is upCard)
 * - Additional cards: For hits, splits, dealer hits, etc.
 */

describe("Round Orchestration", () => {
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

  describe("Round State Transitions", () => {
    test("should auto-transition through dealer_turn to settling when player stands", () => {
      const playerInfo: PlayerRoundInfo[] = [{ userId, bank, bet: 100 }];

      const testStack: Card[] = [
        { rank: "10", suit: "diamonds" }, // Player 19
        { rank: "9", suit: "clubs" },
        { rank: "10", suit: "spades" }, // Dealer 17 (stands)
        { rank: "7", suit: "hearts" },
      ];
      const shoe = new Shoe(1, 0.75, testStack);
      const round = new Round(1, playerInfo, shoe, rules);

      expect(round.state).toBe("player_turn");

      // Player stands - this automatically triggers dealer turn
      round.playAction(ACTION_STAND);

      // Round auto-progresses through dealer_turn to settling
      expect(round.state).toBe("settling");
    });

    test("should transition to complete after settlement", () => {
      const playerInfo: PlayerRoundInfo[] = [{ userId, bank, bet: 100 }];

      const testStack: Card[] = [
        { rank: "10", suit: "diamonds" }, // Player 19
        { rank: "9", suit: "clubs" },
        { rank: "10", suit: "spades" }, // Dealer 17
        { rank: "7", suit: "hearts" },
      ];
      const shoe = new Shoe(1, 0.75, testStack);
      const round = new Round(1, playerInfo, shoe, rules);

      round.playAction(ACTION_STAND);
      expect(round.state).toBe("settling");

      round.settle(house);
      expect(round.state).toBe("complete");
      expect(round.isComplete).toBe(true);
    });

    test("should auto-complete dealer turn when all players bust", () => {
      const playerInfo: PlayerRoundInfo[] = [{ userId, bank, bet: 100 }];

      const testStack: Card[] = [
        { rank: "10", suit: "diamonds" }, // Player starts at 19
        { rank: "9", suit: "clubs" },
        { rank: "6", suit: "spades" }, // Dealer
        { rank: "K", suit: "hearts" },
        { rank: "K", suit: "spades" }, // Hit card - busts player to 29
      ];
      const shoe = new Shoe(1, 0.75, testStack);
      const round = new Round(1, playerInfo, shoe, rules);

      expect(round.state).toBe("player_turn");

      // Player hits and busts - should auto-progress to settling
      round.playAction(ACTION_HIT);

      expect(round.state).toBe("settling");
      // Dealer doesn't draw any cards when all players bust
    });

    test("should dealer hit until 17 when not all players bust", () => {
      const playerInfo: PlayerRoundInfo[] = [{ userId, bank, bet: 100 }];

      const testStack: Card[] = [
        { rank: "10", suit: "diamonds" }, // Player 19 (stands)
        { rank: "9", suit: "clubs" },
        { rank: "6", suit: "spades" }, // Dealer starts at 12
        { rank: "6", suit: "hearts" },
        { rank: "5", suit: "hearts" }, // Dealer hits to 17
      ];
      const shoe = new Shoe(1, 0.75, testStack);
      const round = new Round(1, playerInfo, shoe, rules);

      const initialDealerCards = round.dealerHand.cards.length;

      round.playAction(ACTION_STAND);

      expect(round.dealerHand.cards.length).toBe(initialDealerCards + 1);
      expect(round.dealerHand.handValue).toBe(17);
      expect(round.state).toBe("settling");
    });
  });

  describe("Player Turn Mechanics", () => {
    test("should track current hand index correctly", () => {
      const playerInfo: PlayerRoundInfo[] = [{ userId, bank, bet: 100 }];

      const testStack: Card[] = [
        { rank: "10", suit: "diamonds" },
        { rank: "9", suit: "clubs" },
        { rank: "6", suit: "spades" },
        { rank: "K", suit: "hearts" },
      ];
      const shoe = new Shoe(1, 0.75, testStack);
      const round = new Round(1, playerInfo, shoe, rules);

      expect(round.currentHandIndex).toBe(0);
      expect(round.currentHand).toBe(round.playerHands[0]);
    });

    test("should progress to next hand after current hand completes", () => {
      const bank2 = new Bank("player-2", 1000);
      const playerInfo: PlayerRoundInfo[] = [
        { userId: "player-1", bank, bet: 100 },
        { userId: "player-2", bank: bank2, bet: 100 },
      ];

      const testStack: Card[] = [
        { rank: "10", suit: "diamonds" }, // Player 1: 19
        { rank: "9", suit: "clubs" },
        { rank: "8", suit: "hearts" }, // Player 2: 15
        { rank: "7", suit: "spades" },
        { rank: "6", suit: "spades" }, // Dealer: 16
        { rank: "K", suit: "hearts" },
        { rank: "5", suit: "hearts" }, // Dealer hits to 21
      ];
      const shoe = new Shoe(1, 0.75, testStack);
      const round = new Round(1, playerInfo, shoe, rules);

      expect(round.currentHandIndex).toBe(0);

      // Player 1 stands
      round.playAction(ACTION_STAND);

      expect(round.currentHandIndex).toBe(1);
      expect(round.state).toBe("player_turn");

      // Player 2 stands - triggers dealer turn automatically
      round.playAction(ACTION_STAND);

      expect(round.state).toBe("settling");
    });

    test("should handle hit action correctly", () => {
      const playerInfo: PlayerRoundInfo[] = [{ userId, bank, bet: 100 }];

      const testStack: Card[] = [
        { rank: "10", suit: "diamonds" }, // Player starts at 14
        { rank: "4", suit: "clubs" },
        { rank: "6", suit: "spades" }, // Dealer
        { rank: "K", suit: "hearts" },
        { rank: "5", suit: "hearts" }, // Hit card -> 19
      ];
      const shoe = new Shoe(1, 0.75, testStack);
      const round = new Round(1, playerInfo, shoe, rules);

      const initialHandSize = round.currentHand.cards.length;

      round.playAction(ACTION_HIT);

      expect(round.currentHand.cards.length).toBe(initialHandSize + 1);
      expect(round.currentHand.handValue).toBe(19);
      expect(round.state).toBe("player_turn"); // Still player's turn
    });

    test("should handle double action correctly", () => {
      const playerInfo: PlayerRoundInfo[] = [{ userId, bank, bet: 100 }];

      const testStack: Card[] = [
        { rank: "5", suit: "diamonds" }, // Player starts at 11
        { rank: "6", suit: "clubs" },
        { rank: "6", suit: "spades" }, // Dealer starts at 16
        { rank: "K", suit: "hearts" },
        { rank: "10", suit: "hearts" }, // Double card -> 21
        { rank: "5", suit: "spades" }, // Dealer hits to 21
      ];
      const shoe = new Shoe(1, 0.75, testStack);
      const round = new Round(1, playerInfo, shoe, rules);

      const initialBet = round.currentHand.betAmount;
      const hand = round.playerHands[0]; // Store reference before action

      round.playAction(ACTION_DOUBLE);

      expect(hand.betAmount).toBe(initialBet * 2);
      expect(hand.handValue).toBe(21);
      expect(hand.state).toBe("stood");
      expect(round.state).toBe("settling"); // Auto-progressed to settling
    });

    test("should handle surrender action correctly", () => {
      const playerInfo: PlayerRoundInfo[] = [{ userId, bank, bet: 100 }];

      const testStack: Card[] = [
        { rank: "10", suit: "diamonds" }, // Player 16
        { rank: "6", suit: "clubs" },
        { rank: "10", suit: "spades" }, // Dealer 20
        { rank: "K", suit: "hearts" },
      ];
      const shoe = new Shoe(1, 0.75, testStack);
      const round = new Round(1, playerInfo, shoe, rules);

      const hand = round.playerHands[0]; // Store reference

      round.playAction(ACTION_SURRENDER);

      expect(hand.state).toBe("surrendered");
      expect(round.state).toBe("settling"); // Auto-progressed
    });

    test("should throw error when playing action not in player_turn state", () => {
      const playerInfo: PlayerRoundInfo[] = [{ userId, bank, bet: 100 }];

      const testStack: Card[] = [
        { rank: "10", suit: "diamonds" }, // Player 19
        { rank: "9", suit: "clubs" },
        { rank: "10", suit: "spades" }, // Dealer 17
        { rank: "7", suit: "hearts" },
      ];
      const shoe = new Shoe(1, 0.75, testStack);
      const round = new Round(1, playerInfo, shoe, rules);

      round.playAction(ACTION_STAND);
      expect(round.state).toBe("settling");

      expect(() => round.playAction(ACTION_HIT)).toThrow(
        "Cannot play action - not player's turn",
      );
    });
  });

  describe("Dealer Turn Mechanics", () => {
    test("should dealer stand on 17 with s17 rules", () => {
      const playerInfo: PlayerRoundInfo[] = [{ userId, bank, bet: 100 }];

      const testStack: Card[] = [
        { rank: "10", suit: "diamonds" }, // Player 19
        { rank: "9", suit: "clubs" },
        { rank: "10", suit: "spades" }, // Dealer has 17 already
        { rank: "7", suit: "hearts" },
      ];
      const shoe = new Shoe(1, 0.75, testStack);
      const round = new Round(1, playerInfo, shoe, rules);

      const dealerCardsBefore = round.dealerHand.cards.length;
      round.playAction(ACTION_STAND);

      expect(round.dealerHand.cards.length).toBe(dealerCardsBefore); // No hit
      expect(round.dealerHand.handValue).toBe(17);
    });

    test("should dealer bust when exceeding 21", () => {
      const playerInfo: PlayerRoundInfo[] = [{ userId, bank, bet: 100 }];

      const testStack: Card[] = [
        { rank: "10", suit: "diamonds" }, // Player 19
        { rank: "9", suit: "clubs" },
        { rank: "10", suit: "spades" }, // Dealer starts at 16
        { rank: "6", suit: "hearts" },
        { rank: "K", suit: "hearts" }, // Dealer hits to 26 - bust
      ];
      const shoe = new Shoe(1, 0.75, testStack);
      const round = new Round(1, playerInfo, shoe, rules);

      round.playAction(ACTION_STAND);

      expect(round.dealerHand.state).toBe("busted");
      expect(round.dealerHand.handValue).toBeGreaterThan(21);
    });

    test("should not draw cards for dealer when all players bust", () => {
      const playerInfo: PlayerRoundInfo[] = [{ userId, bank, bet: 100 }];

      const testStack: Card[] = [
        { rank: "10", suit: "diamonds" }, // Player
        { rank: "9", suit: "clubs" },
        { rank: "10", suit: "spades" }, // Dealer
        { rank: "7", suit: "hearts" },
        { rank: "K", suit: "clubs" }, // Player busts
      ];
      const shoe = new Shoe(1, 0.75, testStack);
      const round = new Round(1, playerInfo, shoe, rules);

      const dealerCardsBefore = round.dealerHand.cards.length;

      round.playAction(ACTION_HIT); // Player busts at 29

      expect(round.dealerHand.cards.length).toBe(dealerCardsBefore); // No cards drawn
      expect(round.state).toBe("settling");
    });

    test("should throw error when manually calling playDealerTurn outside dealer_turn state", () => {
      const playerInfo: PlayerRoundInfo[] = [{ userId, bank, bet: 100 }];

      const testStack: Card[] = [
        { rank: "10", suit: "diamonds" },
        { rank: "9", suit: "clubs" },
        { rank: "6", suit: "spades" },
        { rank: "K", suit: "hearts" },
      ];
      const shoe = new Shoe(1, 0.75, testStack);
      const round = new Round(1, playerInfo, shoe, rules);

      expect(round.state).toBe("player_turn");

      // Trying to manually call playDealerTurn in wrong state
      expect(() => round.playDealerTurn()).toThrow(
        "Cannot play dealer turn - not dealer's turn",
      );
    });
  });

  describe("Split Hand Mechanics", () => {
    test("should create split hand and insert after current hand", () => {
      const playerInfo: PlayerRoundInfo[] = [{ userId, bank, bet: 100 }];

      const testStack: Card[] = [
        { rank: "8", suit: "diamonds" }, // Player pair of 8s
        { rank: "8", suit: "clubs" },
        { rank: "6", suit: "spades" }, // Dealer starts at 16
        { rank: "K", suit: "hearts" },
        { rank: "5", suit: "hearts" }, // First split card
        { rank: "7", suit: "spades" }, // Second split card
        { rank: "5", suit: "diamonds" }, // Dealer hits to 21
      ];
      const shoe = new Shoe(1, 0.75, testStack);
      const round = new Round(1, playerInfo, shoe, rules);

      expect(round.playerHands.length).toBe(1);

      const splitAction = round.currentHand.availableActions.find(
        (a) => a === "split",
      );
      expect(splitAction).toBeDefined();

      round.playAction("split");

      expect(round.playerHands.length).toBe(2);
      expect(round.currentHandIndex).toBe(0); // Still on first hand
      expect(round.state).toBe("player_turn");
    });

    test("should progress through split hands in order", () => {
      const playerInfo: PlayerRoundInfo[] = [{ userId, bank, bet: 100 }];

      const testStack: Card[] = [
        { rank: "8", suit: "diamonds" },
        { rank: "8", suit: "clubs" },
        { rank: "10", suit: "spades" }, // Dealer 17
        { rank: "7", suit: "hearts" },
        { rank: "5", suit: "hearts" }, // Split card 1
        { rank: "7", suit: "spades" }, // Split card 2
      ];
      const shoe = new Shoe(1, 0.75, testStack);
      const round = new Round(1, playerInfo, shoe, rules);

      round.playAction("split");
      expect(round.playerHands.length).toBe(2);
      expect(round.currentHandIndex).toBe(0);

      // Stand on first hand
      round.playAction(ACTION_STAND);
      expect(round.currentHandIndex).toBe(1);
      expect(round.state).toBe("player_turn");

      // Stand on second hand - triggers dealer turn
      round.playAction(ACTION_STAND);
      expect(round.state).toBe("settling");
    });

    test("should track parent hand relationship for split hands", () => {
      const playerInfo: PlayerRoundInfo[] = [{ userId, bank, bet: 100 }];

      const testStack: Card[] = [
        { rank: "8", suit: "diamonds" },
        { rank: "8", suit: "clubs" },
        { rank: "6", suit: "spades" },
        { rank: "K", suit: "hearts" },
        { rank: "5", suit: "hearts" },
        { rank: "7", suit: "spades" },
      ];
      const shoe = new Shoe(1, 0.75, testStack);
      const round = new Round(1, playerInfo, shoe, rules);

      const originalHandId = round.currentHand.id;

      round.playAction("split");

      const originalHand = round.playerHands[0];
      const splitHand = round.playerHands[1];

      expect(originalHand.id).toBe(originalHandId);
      expect(splitHand.parentHandId).toBe(originalHandId);
      expect(splitHand.isSplit).toBe(true);
    });
  });

  describe("Blackjack Detection", () => {
    test("should detect player blackjack and auto-progress to settling", () => {
      const playerInfo: PlayerRoundInfo[] = [{ userId, bank, bet: 100 }];

      const testStack: Card[] = [
        { rank: "A", suit: "diamonds" }, // Player blackjack
        { rank: "K", suit: "clubs" },
        { rank: "6", suit: "spades" }, // Dealer 16
        { rank: "K", suit: "hearts" },
        { rank: "5", suit: "hearts" }, // Dealer hits to 21
      ];
      const shoe = new Shoe(1, 0.75, testStack);
      const round = new Round(1, playerInfo, shoe, rules);

      const hand = round.playerHands[0]; // Store reference
      expect(hand.state).toBe("blackjack");
      // Round auto-progresses to settling when player has blackjack
      expect(round.state).toBe("settling");
    });

    test("should detect dealer blackjack and enter insurance phase", () => {
      const playerInfo: PlayerRoundInfo[] = [{ userId, bank, bet: 100 }];

      const testStack: Card[] = [
        { rank: "10", suit: "diamonds" }, // Player
        { rank: "9", suit: "clubs" },
        { rank: "A", suit: "spades" }, // Dealer blackjack
        { rank: "K", suit: "hearts" },
      ];
      const shoe = new Shoe(1, 0.75, testStack);
      const round = new Round(1, playerInfo, shoe, rules);

      expect(round.dealerHand.state).toBe("blackjack");
      expect(round.dealerHand.handValue).toBe(21);
      expect(round.state).toBe("insurance"); // Offers insurance first
    });
  });

  describe("Settlement", () => {
    test("should settle round and return results", () => {
      const playerInfo: PlayerRoundInfo[] = [{ userId, bank, bet: 100 }];

      const testStack: Card[] = [
        { rank: "10", suit: "diamonds" }, // Player 19
        { rank: "9", suit: "clubs" },
        { rank: "10", suit: "spades" }, // Dealer 17
        { rank: "7", suit: "hearts" },
      ];
      const shoe = new Shoe(1, 0.75, testStack);
      const round = new Round(1, playerInfo, shoe, rules);

      round.playAction(ACTION_STAND);
      expect(round.state).toBe("settling");

      const results = round.settle(house);

      expect(results).toHaveLength(1);
      expect(results[0].outcome).toBe("win");
      expect(round.state).toBe("complete");
      expect(round.settlementResults).toBeDefined();
    });

    test("should throw error when settling not in settling state", () => {
      const playerInfo: PlayerRoundInfo[] = [{ userId, bank, bet: 100 }];

      const testStack: Card[] = [
        { rank: "10", suit: "diamonds" },
        { rank: "9", suit: "clubs" },
        { rank: "6", suit: "spades" },
        { rank: "K", suit: "hearts" },
      ];
      const shoe = new Shoe(1, 0.75, testStack);
      const round = new Round(1, playerInfo, shoe, rules);

      expect(round.state).toBe("player_turn");

      expect(() => round.settle(house)).toThrow(
        "Cannot settle - round not ready for settlement",
      );
    });
  });

  describe("Insurance State Flow", () => {
    test("should transition from insurance to player_turn when no blackjack", () => {
      const playerInfo: PlayerRoundInfo[] = [{ userId, bank, bet: 100 }];

      const testStack: Card[] = [
        { rank: "10", suit: "diamonds" }, // Player 19
        { rank: "9", suit: "clubs" },
        { rank: "A", suit: "spades" }, // Dealer shows Ace
        { rank: "6", suit: "hearts" }, // No blackjack
      ];
      const shoe = new Shoe(1, 0.75, testStack);
      const round = new Round(1, playerInfo, shoe, rules);

      expect(round.state).toBe("insurance");

      round.declineInsurance(0);
      round.resolveInsurance(house);

      expect(round.state).toBe("player_turn");
    });

    test("should transition from insurance to settling when dealer has blackjack", () => {
      const playerInfo: PlayerRoundInfo[] = [{ userId, bank, bet: 100 }];

      const testStack: Card[] = [
        { rank: "10", suit: "diamonds" }, // Player
        { rank: "9", suit: "clubs" },
        { rank: "A", suit: "spades" }, // Dealer blackjack
        { rank: "K", suit: "hearts" },
      ];
      const shoe = new Shoe(1, 0.75, testStack);
      const round = new Round(1, playerInfo, shoe, rules);

      expect(round.state).toBe("insurance");

      round.declineInsurance(0);
      round.resolveInsurance(house);

      expect(round.state).toBe("settling");
    });
  });

  describe("Multiple Players", () => {
    test("should handle multiple players in sequence", () => {
      const bank2 = new Bank("player-2", 1000);
      const bank3 = new Bank("player-3", 1000);
      const playerInfo: PlayerRoundInfo[] = [
        { userId: "player-1", bank, bet: 100 },
        { userId: "player-2", bank: bank2, bet: 100 },
        { userId: "player-3", bank: bank3, bet: 100 },
      ];

      const testStack: Card[] = [
        { rank: "10", suit: "diamonds" }, // Player 1: 19
        { rank: "9", suit: "clubs" },
        { rank: "8", suit: "hearts" }, // Player 2: 15
        { rank: "7", suit: "spades" },
        { rank: "6", suit: "diamonds" }, // Player 3: 11
        { rank: "5", suit: "clubs" },
        { rank: "10", suit: "spades" }, // Dealer: 17
        { rank: "7", suit: "hearts" },
      ];
      const shoe = new Shoe(1, 0.75, testStack);
      const round = new Round(1, playerInfo, shoe, rules);

      expect(round.playerHands.length).toBe(3);
      expect(round.currentHandIndex).toBe(0);

      // Player 1 stands
      round.playAction(ACTION_STAND);
      expect(round.currentHandIndex).toBe(1);

      // Player 2 stands
      round.playAction(ACTION_STAND);
      expect(round.currentHandIndex).toBe(2);

      // Player 3 stands - triggers dealer turn and settling
      round.playAction(ACTION_STAND);
      expect(round.state).toBe("settling");
    });

    test("should settle all player hands", () => {
      const bank2 = new Bank("player-2", 1000);
      const playerInfo: PlayerRoundInfo[] = [
        { userId: "player-1", bank, bet: 100 },
        { userId: "player-2", bank: bank2, bet: 100 },
      ];

      const testStack: Card[] = [
        { rank: "10", suit: "diamonds" }, // Player 1: 19 (wins)
        { rank: "9", suit: "clubs" },
        { rank: "10", suit: "hearts" }, // Player 2: 16 (loses)
        { rank: "6", suit: "spades" },
        { rank: "10", suit: "spades" }, // Dealer: 18
        { rank: "8", suit: "hearts" },
      ];
      const shoe = new Shoe(1, 0.75, testStack);
      const round = new Round(1, playerInfo, shoe, rules);

      round.playAction(ACTION_STAND);
      round.playAction(ACTION_STAND);

      const results = round.settle(house);

      expect(results).toHaveLength(2);
      expect(results[0].outcome).toBe("win");
      expect(results[1].outcome).toBe("lose");
    });
  });

  describe("Available Actions", () => {
    test("should return empty array when not in player_turn state", () => {
      const playerInfo: PlayerRoundInfo[] = [{ userId, bank, bet: 100 }];

      const testStack: Card[] = [
        { rank: "10", suit: "diamonds" }, // Player 19
        { rank: "9", suit: "clubs" },
        { rank: "10", suit: "spades" }, // Dealer 17
        { rank: "7", suit: "hearts" },
      ];
      const shoe = new Shoe(1, 0.75, testStack);
      const round = new Round(1, playerInfo, shoe, rules);

      round.playAction(ACTION_STAND);
      expect(round.state).toBe("settling");

      const actions = round.getAvailableActions();
      expect(actions).toEqual([]);
    });

    test("should return current hand's available actions in player_turn state", () => {
      const playerInfo: PlayerRoundInfo[] = [{ userId, bank, bet: 100 }];

      const testStack: Card[] = [
        { rank: "5", suit: "diamonds" }, // Player has 11
        { rank: "6", suit: "clubs" },
        { rank: "6", suit: "spades" },
        { rank: "K", suit: "hearts" },
      ];
      const shoe = new Shoe(1, 0.75, testStack);
      const round = new Round(1, playerInfo, shoe, rules);

      const actions = round.getAvailableActions();

      expect(actions.length).toBeGreaterThan(0);
      expect(actions).toContain(ACTION_HIT);
      expect(actions).toContain(ACTION_STAND);
      expect(actions).toContain(ACTION_DOUBLE);
    });
  });

  describe("Round ID and Metadata", () => {
    test("should generate unique round IDs", () => {
      const playerInfo: PlayerRoundInfo[] = [{ userId, bank, bet: 100 }];

      const testStack1: Card[] = [
        { rank: "10", suit: "diamonds" },
        { rank: "9", suit: "clubs" },
        { rank: "6", suit: "spades" },
        { rank: "K", suit: "hearts" },
      ];

      const testStack2: Card[] = [
        { rank: "8", suit: "hearts" },
        { rank: "7", suit: "spades" },
        { rank: "10", suit: "clubs" },
        { rank: "9", suit: "diamonds" },
      ];

      const shoe1 = new Shoe(1, 0.75, testStack1);
      const shoe2 = new Shoe(1, 0.75, testStack2);

      const round1 = new Round(1, playerInfo, shoe1, rules);
      const round2 = new Round(2, playerInfo, shoe2, rules);

      expect(round1.id).not.toBe(round2.id);
      expect(round1.id).toContain("round-");
      expect(round2.id).toContain("round-");
    });

    test("should track round number correctly", () => {
      const playerInfo: PlayerRoundInfo[] = [{ userId, bank, bet: 100 }];

      const testStack: Card[] = [
        { rank: "10", suit: "diamonds" },
        { rank: "9", suit: "clubs" },
        { rank: "6", suit: "spades" },
        { rank: "K", suit: "hearts" },
      ];

      const shoe = new Shoe(1, 0.75, testStack);
      const round = new Round(5, playerInfo, shoe, rules);

      expect(round.roundNumber).toBe(5);
    });
  });

  describe("getPlayerHand", () => {
    test("should retrieve player hand by index", () => {
      const bank2 = new Bank("player-2", 1000);
      const playerInfo: PlayerRoundInfo[] = [
        { userId: "player-1", bank, bet: 100 },
        { userId: "player-2", bank: bank2, bet: 100 },
      ];

      const testStack: Card[] = [
        { rank: "10", suit: "diamonds" },
        { rank: "9", suit: "clubs" },
        { rank: "8", suit: "hearts" },
        { rank: "7", suit: "spades" },
        { rank: "6", suit: "spades" },
        { rank: "K", suit: "hearts" },
      ];

      const shoe = new Shoe(1, 0.75, testStack);
      const round = new Round(1, playerInfo, shoe, rules);

      const hand0 = round.getPlayerHand(0);
      const hand1 = round.getPlayerHand(1);

      expect(hand0).toBe(round.playerHands[0]);
      expect(hand1).toBe(round.playerHands[1]);
      expect(hand0.id).not.toBe(hand1.id);
    });
  });
});
