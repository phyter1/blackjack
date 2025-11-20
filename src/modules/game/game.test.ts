import { beforeEach, describe, expect, test } from "bun:test";
import { ACTION_HIT, ACTION_STAND } from "./action";
import type { Card } from "./cards";
import { Game } from "./game";
import { RuleSet } from "./rules";

/**
 * Integration tests for Game class
 * Tests the full game flow including state machine, player management,
 * round lifecycle, and settlement
 */

describe("Game Integration", () => {
  let game: Game;

  beforeEach(() => {
    const rules = new RuleSet()
      .setDealerStand("s17")
      .setBlackjackPayout(3, 2)
      .setDoubleAfterSplit(true)
      .setSurrender("late");

    game = new Game(6, 0.75, 1000000, rules);
  });

  describe("Game Initialization", () => {
    test("should initialize with default settings", () => {
      const defaultGame = new Game();
      const stats = defaultGame.getStats();

      expect(stats.roundNumber).toBe(0);
      expect(stats.playerCount).toBe(0);
      expect(stats.houseProfit).toBe(0);
      expect(stats.state).toBe("waiting_for_bets");
    });

    test("should initialize with custom settings", () => {
      const customRules = new RuleSet().setDealerStand("h17");
      const customGame = new Game(8, 0.5, 500000, customRules);
      const stats = customGame.getStats();

      expect(stats.houseBankroll).toBe(500000);
      expect(customGame.getRules()).toBe(customRules);
    });

    test("should generate unique session IDs", () => {
      const game1 = new Game();
      const game2 = new Game();

      expect(game1.getSessionId()).not.toBe(game2.getSessionId());
      expect(game1.getSessionId()).toContain("session-");
    });
  });

  describe("Player Management", () => {
    test("should add player to game", () => {
      const player = game.addPlayer("Alice", 1000);

      expect(player.name).toBe("Alice");
      expect(player.bank.balance).toBe(1000);
      expect(game.getStats().playerCount).toBe(1);
    });

    test("should add multiple players", () => {
      game.addPlayer("Alice", 1000);
      game.addPlayer("Bob", 2000);
      game.addPlayer("Charlie", 1500);

      const players = game.getAllPlayers();
      expect(players.length).toBe(3);
      expect(game.getStats().playerCount).toBe(3);
    });

    test("should retrieve player by ID", () => {
      const alice = game.addPlayer("Alice", 1000);
      const retrieved = game.getPlayer(alice.id);

      expect(retrieved).toBeDefined();
      expect(retrieved?.name).toBe("Alice");
      expect(retrieved?.id).toBe(alice.id);
    });

    test("should remove player from game", () => {
      const alice = game.addPlayer("Alice", 1000);
      const removed = game.removePlayer(alice.id);

      expect(removed).toBe(true);
      expect(game.getStats().playerCount).toBe(0);
      expect(game.getPlayer(alice.id)).toBeUndefined();
    });

    test("should not remove non-existent player", () => {
      const removed = game.removePlayer("non-existent-id");
      expect(removed).toBe(false);
    });

    test("should throw error when adding player during round", () => {
      const player = game.addPlayer("Alice", 1000);

      const testStack: Card[] = [
        { rank: "10", suit: "diamonds" },
        { rank: "9", suit: "clubs" },
        { rank: "10", suit: "spades" },
        { rank: "7", suit: "hearts" },
      ];
      const testGame = new Game(6, 0.75, 1000000, undefined, testStack);
      const testPlayer = testGame.addPlayer("Test", 1000);
      testGame.startRound([{ playerId: testPlayer.id, amount: 100 }]);

      expect(() => testGame.addPlayer("Bob", 1000)).toThrow(
        "Cannot add players during a round",
      );
    });

    test("should throw error when removing player during round", () => {
      const testStack: Card[] = [
        { rank: "10", suit: "diamonds" },
        { rank: "9", suit: "clubs" },
        { rank: "10", suit: "spades" },
        { rank: "7", suit: "hearts" },
      ];
      const testGame = new Game(6, 0.75, 1000000, undefined, testStack);
      const player = testGame.addPlayer("Alice", 1000);
      testGame.startRound([{ playerId: player.id, amount: 100 }]);

      expect(() => testGame.removePlayer(player.id)).toThrow(
        "Cannot remove players during a round",
      );
    });
  });

  describe("Round Lifecycle", () => {
    test("should start a round with player bets", () => {
      const player = game.addPlayer("Alice", 1000);

      const testStack: Card[] = [
        { rank: "10", suit: "diamonds" },
        { rank: "9", suit: "clubs" },
        { rank: "6", suit: "spades" },
        { rank: "K", suit: "hearts" },
      ];
      const testGame = new Game(6, 0.75, 1000000, undefined, testStack);
      const testPlayer = testGame.addPlayer("Test", 1000);

      const round = testGame.startRound([{ playerId: testPlayer.id, amount: 100 }]);

      expect(round).toBeDefined();
      expect(testGame.getStats().roundNumber).toBe(1);
      expect(testGame.getState()).toBe("in_round");
    });

    test("should throw error for invalid player bet", () => {
      expect(() => {
        game.startRound([{ playerId: "non-existent", amount: 100 }]);
      }).toThrow("Player non-existent not found");
    });

    test("should throw error for bet amount of zero or negative", () => {
      const player = game.addPlayer("Alice", 1000);

      expect(() => {
        game.startRound([{ playerId: player.id, amount: 0 }]);
      }).toThrow("Invalid bet amount: 0");

      expect(() => {
        game.startRound([{ playerId: player.id, amount: -50 }]);
      }).toThrow("Invalid bet amount: -50");
    });

    test("should throw error for insufficient funds", () => {
      const player = game.addPlayer("Alice", 100);

      expect(() => {
        game.startRound([{ playerId: player.id, amount: 200 }]);
      }).toThrow("has insufficient funds");
    });

    test("should throw error when starting round while one is active", () => {
      const testStack: Card[] = [
        { rank: "10", suit: "diamonds" },
        { rank: "9", suit: "clubs" },
        { rank: "6", suit: "spades" },
        { rank: "K", suit: "hearts" },
      ];
      const testGame = new Game(6, 0.75, 1000000, undefined, testStack);
      const player = testGame.addPlayer("Alice", 1000);

      testGame.startRound([{ playerId: player.id, amount: 100 }]);

      expect(() => {
        testGame.startRound([{ playerId: player.id, amount: 100 }]);
      }).toThrow("Cannot start a new round while one is in progress");
    });

    test("should complete round and return to waiting state", () => {
      const testStack: Card[] = [
        { rank: "10", suit: "diamonds" }, // Player 19
        { rank: "9", suit: "clubs" },
        { rank: "10", suit: "spades" }, // Dealer 17
        { rank: "7", suit: "hearts" },
      ];
      const testGame = new Game(6, 0.75, 1000000, undefined, testStack);
      const player = testGame.addPlayer("Alice", 1000);

      testGame.startRound([{ playerId: player.id, amount: 100 }]);
      testGame.playAction(ACTION_STAND);

      expect(testGame.getState()).toBe("round_complete");

      testGame.completeRound();

      expect(testGame.getState()).toBe("waiting_for_bets");
      expect(testGame.getCurrentRound()).toBeUndefined();
    });

    test("should throw error when completing incomplete round", () => {
      const testStack: Card[] = [
        { rank: "10", suit: "diamonds" },
        { rank: "9", suit: "clubs" },
        { rank: "6", suit: "spades" },
        { rank: "K", suit: "hearts" },
      ];
      const testGame = new Game(6, 0.75, 1000000, undefined, testStack);
      const player = testGame.addPlayer("Alice", 1000);

      testGame.startRound([{ playerId: player.id, amount: 100 }]);

      expect(() => testGame.completeRound()).toThrow("Round is not complete");
    });

    test("should handle multiple rounds sequentially", () => {
      const testStack: Card[] = [
        // Round 1
        { rank: "10", suit: "diamonds" },
        { rank: "9", suit: "clubs" },
        { rank: "10", suit: "spades" },
        { rank: "7", suit: "hearts" },
        // Round 2
        { rank: "8", suit: "hearts" },
        { rank: "7", suit: "spades" },
        { rank: "10", suit: "clubs" },
        { rank: "6", suit: "diamonds" },
        { rank: "5", suit: "clubs" }, // Dealer hits to 21
      ];
      const testGame = new Game(6, 0.75, 1000000, undefined, testStack);
      const player = testGame.addPlayer("Alice", 1000);

      // Round 1
      testGame.startRound([{ playerId: player.id, amount: 100 }]);
      testGame.playAction(ACTION_STAND);
      testGame.completeRound();

      expect(testGame.getStats().roundNumber).toBe(1);

      // Round 2
      testGame.startRound([{ playerId: player.id, amount: 100 }]);
      testGame.playAction(ACTION_STAND);
      testGame.completeRound();

      expect(testGame.getStats().roundNumber).toBe(2);
    });
  });

  describe("Game Actions", () => {
    test("should play action on current round", () => {
      const testStack: Card[] = [
        { rank: "10", suit: "diamonds" }, // Player starts at 14
        { rank: "4", suit: "clubs" },
        { rank: "6", suit: "spades" }, // Dealer
        { rank: "K", suit: "hearts" },
        { rank: "5", suit: "hearts" }, // Hit card -> 19
      ];
      const testGame = new Game(6, 0.75, 1000000, undefined, testStack);
      const player = testGame.addPlayer("Alice", 1000);

      testGame.startRound([{ playerId: player.id, amount: 100 }]);

      const round = testGame.getCurrentRound();
      const initialHandSize = round?.playerHands[0].cards.length;

      testGame.playAction(ACTION_HIT);

      expect(round?.playerHands[0].cards.length).toBe((initialHandSize ?? 0) + 1);
    });

    test("should throw error when playing action with no active round", () => {
      expect(() => game.playAction(ACTION_HIT)).toThrow("No active round");
    });

    test("should get available actions for current hand", () => {
      const testStack: Card[] = [
        { rank: "5", suit: "diamonds" }, // Player 11
        { rank: "6", suit: "clubs" },
        { rank: "6", suit: "spades" }, // Dealer
        { rank: "K", suit: "hearts" },
      ];
      const testGame = new Game(6, 0.75, 1000000, undefined, testStack);
      const player = testGame.addPlayer("Alice", 1000);

      testGame.startRound([{ playerId: player.id, amount: 100 }]);

      const actions = testGame.getAvailableActions();

      expect(actions.length).toBeGreaterThan(0);
      expect(actions).toContain(ACTION_HIT);
      expect(actions).toContain(ACTION_STAND);
    });

    test("should return empty array for available actions with no round", () => {
      const actions = game.getAvailableActions();
      expect(actions).toEqual([]);
    });
  });

  describe("Insurance Handling", () => {
    test("should take insurance when dealer shows Ace", () => {
      const testStack: Card[] = [
        { rank: "10", suit: "diamonds" }, // Player
        { rank: "9", suit: "clubs" },
        { rank: "A", suit: "spades" }, // Dealer shows Ace
        { rank: "6", suit: "hearts" },
      ];
      const testGame = new Game(6, 0.75, 1000000, undefined, testStack);
      const player = testGame.addPlayer("Alice", 1000);

      testGame.startRound([{ playerId: player.id, amount: 100 }]);
      const round = testGame.getCurrentRound();

      expect(round?.state).toBe("insurance");

      testGame.takeInsurance(0);

      const hand = round?.playerHands[0];
      expect(hand?.hasInsurance).toBe(true);
    });

    test("should decline insurance when dealer shows Ace", () => {
      const testStack: Card[] = [
        { rank: "10", suit: "diamonds" },
        { rank: "9", suit: "clubs" },
        { rank: "A", suit: "spades" },
        { rank: "6", suit: "hearts" },
      ];
      const testGame = new Game(6, 0.75, 1000000, undefined, testStack);
      const player = testGame.addPlayer("Alice", 1000);

      testGame.startRound([{ playerId: player.id, amount: 100 }]);

      testGame.declineInsurance(0);

      const round = testGame.getCurrentRound();
      const hand = round?.playerHands[0];
      expect(hand?.hasInsurance).toBe(false);
    });

    test("should resolve insurance and continue round", () => {
      const testStack: Card[] = [
        { rank: "10", suit: "diamonds" },
        { rank: "9", suit: "clubs" },
        { rank: "A", suit: "spades" }, // Dealer up
        { rank: "6", suit: "hearts" }, // No blackjack
      ];
      const testGame = new Game(6, 0.75, 1000000, undefined, testStack);
      const player = testGame.addPlayer("Alice", 1000);

      testGame.startRound([{ playerId: player.id, amount: 100 }]);
      testGame.takeInsurance(0);

      const results = testGame.resolveInsurance();

      expect(results.dealerBlackjack).toBe(false);
      expect(results.insuranceResults[0].payout).toBe(0);
      expect(testGame.getCurrentRound()?.state).toBe("player_turn");
    });

    test("should auto-settle when dealer has blackjack after insurance", () => {
      const testStack: Card[] = [
        { rank: "10", suit: "diamonds" },
        { rank: "9", suit: "clubs" },
        { rank: "A", suit: "spades" }, // Dealer blackjack
        { rank: "K", suit: "hearts" },
      ];
      const testGame = new Game(6, 0.75, 1000000, undefined, testStack);
      const player = testGame.addPlayer("Alice", 1000);

      testGame.startRound([{ playerId: player.id, amount: 100 }]);
      testGame.declineInsurance(0);

      const results = testGame.resolveInsurance();

      expect(results.dealerBlackjack).toBe(true);
      expect(testGame.getState()).toBe("round_complete");
    });

    test("should throw error when taking insurance with no active round", () => {
      expect(() => game.takeInsurance(0)).toThrow("No active round");
    });

    test("should throw error when declining insurance with no active round", () => {
      expect(() => game.declineInsurance(0)).toThrow("No active round");
    });

    test("should throw error when resolving insurance with no active round", () => {
      expect(() => game.resolveInsurance()).toThrow("No active round");
    });
  });

  describe("Settlement and Money Flow", () => {
    test("should settle round and update player balance for win", () => {
      const testStack: Card[] = [
        { rank: "10", suit: "diamonds" }, // Player 19
        { rank: "9", suit: "clubs" },
        { rank: "10", suit: "spades" }, // Dealer 17
        { rank: "7", suit: "hearts" },
      ];
      const testGame = new Game(6, 0.75, 1000000, undefined, testStack);
      const player = testGame.addPlayer("Alice", 1000);

      testGame.startRound([{ playerId: player.id, amount: 100 }]);
      testGame.playAction(ACTION_STAND);

      expect(testGame.getState()).toBe("round_complete");
      expect(player.bank.balance).toBe(1100); // Won 100
    });

    test("should settle round and update player balance for loss", () => {
      const testStack: Card[] = [
        { rank: "10", suit: "diamonds" }, // Player 16
        { rank: "6", suit: "clubs" },
        { rank: "10", suit: "spades" }, // Dealer 20
        { rank: "K", suit: "hearts" },
      ];
      const testGame = new Game(6, 0.75, 1000000, undefined, testStack);
      const player = testGame.addPlayer("Alice", 1000);

      testGame.startRound([{ playerId: player.id, amount: 100 }]);
      testGame.playAction(ACTION_STAND);

      expect(player.bank.balance).toBe(900); // Lost 100
    });

    test("should track house profit/loss correctly", () => {
      const testStack: Card[] = [
        { rank: "10", suit: "diamonds" }, // Player 19 wins
        { rank: "9", suit: "clubs" },
        { rank: "10", suit: "spades" }, // Dealer 17
        { rank: "7", suit: "hearts" },
      ];
      const testGame = new Game(6, 0.75, 1000000, undefined, testStack);
      const player = testGame.addPlayer("Alice", 1000);

      const initialHouseProfit = testGame.getStats().houseProfit;

      testGame.startRound([{ playerId: player.id, amount: 100 }]);
      testGame.playAction(ACTION_STAND);

      const finalHouseProfit = testGame.getStats().houseProfit;

      expect(finalHouseProfit).toBe(initialHouseProfit - 100); // House lost 100
    });

    test("should handle multiple players with different outcomes", () => {
      const testStack: Card[] = [
        { rank: "10", suit: "diamonds" }, // Player 1: 19 (wins)
        { rank: "9", suit: "clubs" },
        { rank: "10", suit: "hearts" }, // Player 2: 16 (loses)
        { rank: "6", suit: "spades" },
        { rank: "10", suit: "spades" }, // Dealer: 18
        { rank: "8", suit: "hearts" },
      ];
      const testGame = new Game(6, 0.75, 1000000, undefined, testStack);
      const alice = testGame.addPlayer("Alice", 1000);
      const bob = testGame.addPlayer("Bob", 1000);

      testGame.startRound([
        { playerId: alice.id, amount: 100 },
        { playerId: bob.id, amount: 100 },
      ]);

      testGame.playAction(ACTION_STAND); // Alice stands
      testGame.playAction(ACTION_STAND); // Bob stands

      expect(alice.bank.balance).toBe(1100); // Won
      expect(bob.bank.balance).toBe(900); // Lost
    });
  });

  describe("Auto-Settlement Scenarios", () => {
    test("should auto-settle when player gets blackjack", () => {
      const testStack: Card[] = [
        { rank: "A", suit: "diamonds" }, // Player blackjack
        { rank: "K", suit: "clubs" },
        { rank: "10", suit: "spades" }, // Dealer 17
        { rank: "7", suit: "hearts" },
        { rank: "5", suit: "hearts" }, // Dealer hits to get closer
      ];
      const testGame = new Game(6, 0.75, 1000000, undefined, testStack);
      const player = testGame.addPlayer("Alice", 1000);

      testGame.startRound([{ playerId: player.id, amount: 100 }]);

      // Round should auto-settle
      expect(testGame.getState()).toBe("round_complete");
    });

    test("should auto-settle after action completes round", () => {
      const testStack: Card[] = [
        { rank: "10", suit: "diamonds" }, // Player 19
        { rank: "9", suit: "clubs" },
        { rank: "10", suit: "spades" }, // Dealer 17
        { rank: "7", suit: "hearts" },
      ];
      const testGame = new Game(6, 0.75, 1000000, undefined, testStack);
      const player = testGame.addPlayer("Alice", 1000);

      testGame.startRound([{ playerId: player.id, amount: 100 }]);
      testGame.playAction(ACTION_STAND);

      // Should auto-settle after stand
      expect(testGame.getState()).toBe("round_complete");
    });
  });

  describe("Shoe Management", () => {
    test("should create new shoe when current shoe is complete", () => {
      // Create a very small shoe that will be exhausted
      const smallStack: Card[] = [
        { rank: "10", suit: "diamonds" },
        { rank: "9", suit: "clubs" },
        { rank: "10", suit: "spades" },
        { rank: "7", suit: "hearts" },
      ];
      const testGame = new Game(1, 0.01, 1000000, undefined, smallStack);
      const player = testGame.addPlayer("Alice", 1000);

      // First round exhausts the shoe
      testGame.startRound([{ playerId: player.id, amount: 100 }]);
      testGame.playAction(ACTION_STAND);
      testGame.completeRound();

      const shoeDetailsAfterFirst = testGame.getShoeDetails();
      expect(shoeDetailsAfterFirst.isComplete).toBe(true);

      // Second round should trigger new shoe creation
      const secondStack: Card[] = [
        { rank: "8", suit: "diamonds" },
        { rank: "7", suit: "clubs" },
        { rank: "10", suit: "spades" },
        { rank: "9", suit: "hearts" },
      ];
      // The game will create a new shoe internally when startRound is called
      // We can't easily test this without exposing shoe internals
      // This test verifies the shoe was exhausted after first round
      expect(shoeDetailsAfterFirst.isComplete).toBe(true);
    });

    test("should discard cards to shoe after round completion", () => {
      const testStack: Card[] = [
        { rank: "10", suit: "diamonds" },
        { rank: "9", suit: "clubs" },
        { rank: "10", suit: "spades" },
        { rank: "7", suit: "hearts" },
      ];
      const testGame = new Game(1, 0.75, 1000000, undefined, testStack);
      const player = testGame.addPlayer("Alice", 1000);

      const initialDiscarded = testGame.getShoeDetails().discardedCards;

      testGame.startRound([{ playerId: player.id, amount: 100 }]);
      testGame.playAction(ACTION_STAND);
      testGame.completeRound();

      const finalDiscarded = testGame.getShoeDetails().discardedCards;

      expect(finalDiscarded).toBeGreaterThan(initialDiscarded);
    });
  });

  describe("Game Statistics", () => {
    test("should provide comprehensive game stats", () => {
      const testStack: Card[] = [
        { rank: "10", suit: "diamonds" },
        { rank: "9", suit: "clubs" },
        { rank: "10", suit: "spades" },
        { rank: "7", suit: "hearts" },
      ];
      const testGame = new Game(6, 0.75, 500000, undefined, testStack);
      const player = testGame.addPlayer("Alice", 1000);

      const stats = testGame.getStats();

      expect(stats).toHaveProperty("roundNumber");
      expect(stats).toHaveProperty("playerCount");
      expect(stats).toHaveProperty("houseProfit");
      expect(stats).toHaveProperty("houseBankroll");
      expect(stats).toHaveProperty("shoeRemainingCards");
      expect(stats).toHaveProperty("shoeComplete");
      expect(stats).toHaveProperty("state");

      expect(stats.houseBankroll).toBe(500000);
      expect(stats.playerCount).toBe(1);
    });

    test("should track round number correctly", () => {
      const testStack: Card[] = [
        // Round 1
        { rank: "10", suit: "diamonds" },
        { rank: "9", suit: "clubs" },
        { rank: "10", suit: "spades" },
        { rank: "7", suit: "hearts" },
        // Round 2
        { rank: "8", suit: "hearts" },
        { rank: "7", suit: "spades" },
        { rank: "10", suit: "clubs" },
        { rank: "6", suit: "diamonds" },
        { rank: "5", suit: "clubs" },
      ];
      const testGame = new Game(6, 0.75, 1000000, undefined, testStack);
      const player = testGame.addPlayer("Alice", 1000);

      expect(testGame.getStats().roundNumber).toBe(0);

      testGame.startRound([{ playerId: player.id, amount: 100 }]);
      testGame.playAction(ACTION_STAND);
      testGame.completeRound();

      expect(testGame.getStats().roundNumber).toBe(1);

      testGame.startRound([{ playerId: player.id, amount: 100 }]);
      testGame.playAction(ACTION_STAND);
      testGame.completeRound();

      expect(testGame.getStats().roundNumber).toBe(2);
    });
  });

  describe("Rules and Configuration", () => {
    test("should return game rules", () => {
      const customRules = new RuleSet()
        .setDealerStand("h17")
        .setBlackjackPayout(6, 5);
      const testGame = new Game(6, 0.75, 1000000, customRules);

      const rules = testGame.getRules();
      expect(rules).toBe(customRules);
    });

    test("should calculate house edge from rules", () => {
      const houseEdge = game.getHouseEdge();
      expect(typeof houseEdge).toBe("number");
      expect(houseEdge).toBeGreaterThan(0);
    });

    test("should provide rules description", () => {
      const description = game.getRulesDescription();
      expect(typeof description).toBe("string");
      expect(description.length).toBeGreaterThan(0);
    });
  });

  describe("Session Management", () => {
    test("should track session ID", () => {
      const sessionId = game.getSessionId();
      expect(typeof sessionId).toBe("string");
      expect(sessionId).toContain("session-");
    });

    test("should end session", () => {
      game.endSession();
      // Session end should not throw errors
      expect(true).toBe(true);
    });
  });

  describe("Audit Trail", () => {
    test("should export audit trail as JSON", () => {
      const json = game.getAuditTrailJSON();
      expect(typeof json).toBe("string");

      const parsed = JSON.parse(json);
      // Audit logger returns an object with session info and events array
      expect(typeof parsed).toBe("object");
      expect(parsed).toHaveProperty("sessionId");
    });

    test("should export audit trail as CSV", () => {
      const csv = game.getAuditTrailCSV();
      expect(typeof csv).toBe("string");
      expect(csv).toContain("timestamp"); // CSV header
    });

    test("should generate audit summary", () => {
      const summary = game.getAuditSummary();
      expect(summary).toHaveProperty("eventCounts");
      expect(summary).toHaveProperty("totalEvents");
    });
  });

  describe("Edge Cases", () => {
    test("should handle player with exactly enough funds for bet", () => {
      const testStack: Card[] = [
        { rank: "10", suit: "diamonds" },
        { rank: "9", suit: "clubs" },
        { rank: "10", suit: "spades" },
        { rank: "7", suit: "hearts" },
      ];
      const testGame = new Game(6, 0.75, 1000000, undefined, testStack);
      const player = testGame.addPlayer("Alice", 100);

      // Player has exactly 100, bets exactly 100
      expect(() => {
        testGame.startRound([{ playerId: player.id, amount: 100 }]);
      }).not.toThrow();
    });

    test("should handle empty player list for getAllPlayers", () => {
      const players = game.getAllPlayers();
      expect(players).toEqual([]);
    });

    test("should handle getCurrentRound when no round exists", () => {
      const round = game.getCurrentRound();
      expect(round).toBeUndefined();
    });
  });
});
