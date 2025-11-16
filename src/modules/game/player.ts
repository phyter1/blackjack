import { Bank } from "./bank";

export type Player = {
  id: string;
  name: string;
  bank: Bank;
};

export class PlayerManager {
  private players: Map<string, Player> = new Map();

  /**
   * Add a new player to the game
   */
  addPlayer(name: string, initialBankroll: number): Player {
    const id = crypto.randomUUID();
    const bank = new Bank(id, initialBankroll);

    const player: Player = {
      id,
      name,
      bank,
    };

    this.players.set(id, player);
    return player;
  }

  /**
   * Remove a player from the game
   */
  removePlayer(playerId: string): boolean {
    return this.players.delete(playerId);
  }

  /**
   * Get a player by ID
   */
  getPlayer(playerId: string): Player | undefined {
    return this.players.get(playerId);
  }

  /**
   * Get all players
   */
  getAllPlayers(): Player[] {
    return Array.from(this.players.values());
  }

  /**
   * Get player count
   */
  get playerCount(): number {
    return this.players.size;
  }

  /**
   * Check if a player exists
   */
  hasPlayer(playerId: string): boolean {
    return this.players.has(playerId);
  }

  /**
   * Get player by name (returns first match)
   */
  getPlayerByName(name: string): Player | undefined {
    return Array.from(this.players.values()).find((p) => p.name === name);
  }
}
