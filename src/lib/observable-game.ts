import { Game, type PlayerBet, type GameState } from "@/modules/game/game";
import type { ActionType } from "@/modules/game/action";
import type { Player } from "@/modules/game/player";
import type { Round } from "@/modules/game/round";
import type { RuleSet } from "@/modules/game/rules";
import type { SettlementResult } from "@/modules/game/settlement";

export type GameChangeEvent = {
  type:
    | "round_started"
    | "action_played"
    | "insurance_resolved"
    | "round_settled"
    | "round_completed"
    | "player_added"
    | "player_removed"
    | "session_ended";
  timestamp: number;
};

type GameChangeListener = (event: GameChangeEvent) => void;

/**
 * ObservableGame wraps the framework-agnostic Game class and provides
 * reactive change notifications for integration with Zustand.
 *
 * This replaces the "force re-render" pattern (roundVersion counter)
 * with a proper observable subscription system.
 */
export class ObservableGame {
  private game: Game;
  private listeners: Set<GameChangeListener> = new Set();

  constructor(
    numDecks: number = 6,
    penetration: number = 0.75,
    houseInitialBankroll: number = 1000000,
    rules?: RuleSet,
    testStack?: any,
  ) {
    this.game = new Game(
      numDecks,
      penetration,
      houseInitialBankroll,
      rules,
      testStack,
    );
  }

  /**
   * Subscribe to game changes
   * Returns unsubscribe function
   */
  subscribe(listener: GameChangeListener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  /**
   * Emit change event to all listeners
   */
  private emit(
    type: GameChangeEvent["type"],
    data?: Partial<GameChangeEvent>,
  ): void {
    const event: GameChangeEvent = {
      type,
      timestamp: Date.now(),
      ...data,
    };

    this.listeners.forEach((listener) => {
      try {
        listener(event);
      } catch (error) {
        console.error("Error in game change listener:", error);
      }
    });
  }

  // ==================== Player Management ====================

  addPlayer(name: string, bankroll: number): Player {
    const player = this.game.addPlayer(name, bankroll);
    this.emit("player_added");
    return player;
  }

  removePlayer(playerId: string): boolean {
    const result = this.game.removePlayer(playerId);
    if (result) {
      this.emit("player_removed");
    }
    return result;
  }

  getPlayer(playerId: string): Player | undefined {
    return this.game.getPlayer(playerId);
  }

  getAllPlayers(): Player[] {
    return this.game.getAllPlayers();
  }

  // ==================== Round Management ====================

  startRound(bets: PlayerBet[]): Round {
    const round = this.game.startRound(bets);
    this.emit("round_started");
    return round;
  }

  playAction(action: ActionType): void {
    this.game.playAction(action);
    this.emit("action_played");
  }

  takeInsurance(handIndex: number): void {
    this.game.takeInsurance(handIndex);
    this.emit("insurance_resolved");
  }

  declineInsurance(handIndex: number): void {
    this.game.declineInsurance(handIndex);
    this.emit("insurance_resolved");
  }

  resolveInsurance(): {
    dealerBlackjack: boolean;
    insuranceResults: {
      handIndex: number;
      hadInsurance: boolean;
      payout: number;
    }[];
  } {
    const result = this.game.resolveInsurance();
    this.emit("insurance_resolved");
    return result;
  }

  completeRound(): void {
    this.game.completeRound();
    this.emit("round_completed");
  }

  // ==================== Read-Only Methods (No Events) ====================

  getCurrentRound(): Round | undefined {
    return this.game.getCurrentRound();
  }

  getAvailableActions(): ActionType[] {
    return this.game.getAvailableActions();
  }

  getStats() {
    return this.game.getStats();
  }

  getShoeDetails() {
    return this.game.getShoeDetails();
  }

  getState(): GameState {
    return this.game.getState();
  }

  getRules(): RuleSet {
    return this.game.getRules();
  }

  getHouseEdge(): number {
    return this.game.getHouseEdge();
  }

  getRulesDescription(): string {
    return this.game.getRulesDescription();
  }

  getSessionId(): string {
    return this.game.getSessionId();
  }

  getAuditTrailJSON(): string {
    return this.game.getAuditTrailJSON();
  }

  getAuditTrailCSV(): string {
    return this.game.getAuditTrailCSV();
  }

  getAuditSummary() {
    return this.game.getAuditSummary();
  }

  endSession(): void {
    this.game.endSession();
    this.emit("session_ended");
  }

  /**
   * Get the underlying Game instance (use sparingly)
   * Mainly for migration compatibility
   */
  getGameInstance(): Game {
    return this.game;
  }
}
