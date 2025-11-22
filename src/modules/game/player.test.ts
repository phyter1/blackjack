import { beforeEach, describe, expect, test } from "bun:test";
import { PlayerManager } from "./player";

describe("PlayerManager", () => {
  let manager: PlayerManager;

  beforeEach(() => {
    manager = new PlayerManager();
  });

  describe("initialization", () => {
    test("should start with no players", () => {
      expect(manager.playerCount).toBe(0);
      expect(manager.getAllPlayers()).toEqual([]);
    });
  });

  describe("addPlayer", () => {
    test("should add a player with valid data", () => {
      const player = manager.addPlayer("Alice", 1000);

      expect(player.name).toBe("Alice");
      expect(player.bank.balance).toBe(1000);
      expect(player.id).toBeDefined();
      expect(typeof player.id).toBe("string");
    });

    test("should generate unique IDs for each player", () => {
      const player1 = manager.addPlayer("Alice", 1000);
      const player2 = manager.addPlayer("Bob", 500);

      expect(player1.id).not.toBe(player2.id);
    });

    test("should increment player count", () => {
      expect(manager.playerCount).toBe(0);

      manager.addPlayer("Alice", 1000);
      expect(manager.playerCount).toBe(1);

      manager.addPlayer("Bob", 500);
      expect(manager.playerCount).toBe(2);
    });

    test("should allow multiple players with same name", () => {
      const player1 = manager.addPlayer("Alice", 1000);
      const player2 = manager.addPlayer("Alice", 500);

      expect(player1.id).not.toBe(player2.id);
      expect(manager.playerCount).toBe(2);
    });

    test("should create player with zero bankroll", () => {
      const player = manager.addPlayer("Broke", 0);
      expect(player.bank.balance).toBe(0);
    });

    test("should create player with large bankroll", () => {
      const player = manager.addPlayer("Whale", 1000000);
      expect(player.bank.balance).toBe(1000000);
    });
  });

  describe("getPlayer", () => {
    test("should retrieve player by ID", () => {
      const player = manager.addPlayer("Alice", 1000);
      const retrieved = manager.getPlayer(player.id);

      expect(retrieved).toBeDefined();
      expect(retrieved?.id).toBe(player.id);
      expect(retrieved?.name).toBe("Alice");
    });

    test("should return undefined for non-existent player", () => {
      const player = manager.getPlayer("non-existent-id");
      expect(player).toBeUndefined();
    });

    test("should retrieve correct player among multiple", () => {
      const alice = manager.addPlayer("Alice", 1000);
      const bob = manager.addPlayer("Bob", 500);
      const charlie = manager.addPlayer("Charlie", 750);

      const retrieved = manager.getPlayer(bob.id);
      expect(retrieved?.name).toBe("Bob");
      expect(retrieved?.bank.balance).toBe(500);
    });
  });

  describe("getAllPlayers", () => {
    test("should return empty array when no players", () => {
      expect(manager.getAllPlayers()).toEqual([]);
    });

    test("should return all players", () => {
      const alice = manager.addPlayer("Alice", 1000);
      const bob = manager.addPlayer("Bob", 500);

      const players = manager.getAllPlayers();
      expect(players).toHaveLength(2);
      expect(players).toContainEqual(alice);
      expect(players).toContainEqual(bob);
    });

    test("should return new array (not internal reference)", () => {
      manager.addPlayer("Alice", 1000);

      const players1 = manager.getAllPlayers();
      const players2 = manager.getAllPlayers();

      expect(players1).not.toBe(players2);
      expect(players1).toEqual(players2);
    });
  });

  describe("removePlayer", () => {
    test("should remove player by ID", () => {
      const player = manager.addPlayer("Alice", 1000);
      expect(manager.playerCount).toBe(1);

      const removed = manager.removePlayer(player.id);
      expect(removed).toBe(true);
      expect(manager.playerCount).toBe(0);
      expect(manager.getPlayer(player.id)).toBeUndefined();
    });

    test("should return false when removing non-existent player", () => {
      const removed = manager.removePlayer("non-existent-id");
      expect(removed).toBe(false);
    });

    test("should only remove specified player", () => {
      const alice = manager.addPlayer("Alice", 1000);
      const bob = manager.addPlayer("Bob", 500);
      const charlie = manager.addPlayer("Charlie", 750);

      manager.removePlayer(bob.id);

      expect(manager.playerCount).toBe(2);
      expect(manager.getPlayer(alice.id)).toBeDefined();
      expect(manager.getPlayer(bob.id)).toBeUndefined();
      expect(manager.getPlayer(charlie.id)).toBeDefined();
    });

    test("should allow removing and re-adding", () => {
      const player1 = manager.addPlayer("Alice", 1000);
      manager.removePlayer(player1.id);

      const player2 = manager.addPlayer("Alice", 2000);
      expect(manager.playerCount).toBe(1);
      expect(player2.id).not.toBe(player1.id);
      expect(player2.bank.balance).toBe(2000);
    });
  });

  describe("hasPlayer", () => {
    test("should return true for existing player", () => {
      const player = manager.addPlayer("Alice", 1000);
      expect(manager.hasPlayer(player.id)).toBe(true);
    });

    test("should return false for non-existent player", () => {
      expect(manager.hasPlayer("non-existent-id")).toBe(false);
    });

    test("should return false after player is removed", () => {
      const player = manager.addPlayer("Alice", 1000);
      expect(manager.hasPlayer(player.id)).toBe(true);

      manager.removePlayer(player.id);
      expect(manager.hasPlayer(player.id)).toBe(false);
    });
  });

  describe("getPlayerByName", () => {
    test("should find player by name", () => {
      const alice = manager.addPlayer("Alice", 1000);
      manager.addPlayer("Bob", 500);

      const found = manager.getPlayerByName("Alice");
      expect(found).toBeDefined();
      expect(found?.id).toBe(alice.id);
    });

    test("should return undefined for non-existent name", () => {
      manager.addPlayer("Alice", 1000);
      const found = manager.getPlayerByName("Bob");
      expect(found).toBeUndefined();
    });

    test("should return first match when multiple players have same name", () => {
      const alice1 = manager.addPlayer("Alice", 1000);
      const alice2 = manager.addPlayer("Alice", 500);

      const found = manager.getPlayerByName("Alice");
      expect(found?.id).toBe(alice1.id);
    });

    test("should be case-sensitive", () => {
      manager.addPlayer("Alice", 1000);
      const found = manager.getPlayerByName("alice");
      expect(found).toBeUndefined();
    });

    test("should handle empty string", () => {
      manager.addPlayer("Alice", 1000);
      const found = manager.getPlayerByName("");
      expect(found).toBeUndefined();
    });
  });

  describe("playerCount", () => {
    test("should reflect correct count", () => {
      expect(manager.playerCount).toBe(0);

      manager.addPlayer("Alice", 1000);
      expect(manager.playerCount).toBe(1);

      manager.addPlayer("Bob", 500);
      expect(manager.playerCount).toBe(2);

      manager.addPlayer("Charlie", 750);
      expect(manager.playerCount).toBe(3);
    });

    test("should decrease when players removed", () => {
      const alice = manager.addPlayer("Alice", 1000);
      const bob = manager.addPlayer("Bob", 500);
      expect(manager.playerCount).toBe(2);

      manager.removePlayer(alice.id);
      expect(manager.playerCount).toBe(1);

      manager.removePlayer(bob.id);
      expect(manager.playerCount).toBe(0);
    });
  });

  describe("edge cases and integration", () => {
    test("should handle adding many players", () => {
      for (let i = 0; i < 100; i++) {
        manager.addPlayer(`Player${i}`, i * 100);
      }

      expect(manager.playerCount).toBe(100);
      const players = manager.getAllPlayers();
      expect(players).toHaveLength(100);
    });

    test("should maintain separate bank instances per player", () => {
      const alice = manager.addPlayer("Alice", 1000);
      const bob = manager.addPlayer("Bob", 500);

      alice.bank.debit(100);
      bob.bank.credit(200);

      expect(alice.bank.balance).toBe(900);
      expect(bob.bank.balance).toBe(700);
    });

    test("should handle rapid add/remove operations", () => {
      const player1 = manager.addPlayer("Player1", 1000);
      const player2 = manager.addPlayer("Player2", 500);

      manager.removePlayer(player1.id);
      const player3 = manager.addPlayer("Player3", 750);

      manager.removePlayer(player2.id);
      manager.removePlayer(player3.id);

      expect(manager.playerCount).toBe(0);
      expect(manager.getAllPlayers()).toEqual([]);
    });
  });
});
