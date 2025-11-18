import type { ActionType } from "./action";
import { House } from "./bank";
import type { Player } from "./player";
import { PlayerManager } from "./player";
import { Round, type PlayerRoundInfo } from "./round";
import { RuleSet } from "./rules";
import type { SettlementResult } from "./settlement";
import { Shoe } from "./shoe";
import type { Stack } from "./cards";
import { getAuditLogger, initAuditLogger } from "../audit/logger";
import type {
  SessionStartEvent,
  SessionEndEvent,
  PlayerJoinEvent,
  PlayerLeaveEvent,
  GameStateChangeEvent,
  RoundStartEvent,
  RoundCompleteEvent,
} from "../audit/types";

export type GameState = "waiting_for_bets" | "in_round" | "round_complete";

export type PlayerBet = {
  playerId: string;
  amount: number;
};

export class Game {
  private playerManager: PlayerManager;
  private house: House;
  private shoe: Shoe;
  private currentRound?: Round;
  private roundNumber: number = 0;
  private state: GameState = "waiting_for_bets";
  private rules: RuleSet;
  private numDecks: number;
  private penetration: number;
  private sessionId: string;
  private testStack?: Stack;

  constructor(
    numDecks: number = 6,
    penetration: number = 0.75,
    houseInitialBankroll: number = 1000000,
    rules?: RuleSet,
    testStack?: Stack,
  ) {
    this.numDecks = numDecks;
    this.penetration = penetration;
    this.rules = rules ?? new RuleSet();
    this.playerManager = new PlayerManager();
    this.house = new House(houseInitialBankroll);
    this.testStack = testStack;
    this.shoe = new Shoe(numDecks, penetration, testStack);

    // Initialize audit logger for this session
    const logger = initAuditLogger({ enableFileLog: true, enableConsoleLog: true, logFilePath: "./audit_log.csv" });
    this.sessionId = logger.getSessionId();

    // Audit log session start
    getAuditLogger().log<SessionStartEvent>("session_start", {
      sessionId: this.sessionId,
      numDecks,
      penetration,
      houseInitialBankroll,
    });
  }

  /**
   * Add a player to the game
   */
  addPlayer(name: string, bankroll: number): Player {
    if (this.state === "in_round") {
      throw new Error("Cannot add players during a round");
    }
    const player = this.playerManager.addPlayer(name, bankroll);

    // Audit log player join
    getAuditLogger().log<PlayerJoinEvent>("player_join", {
      playerId: player.id,
      playerName: player.name,
      initialBankroll: bankroll,
    });

    return player;
  }

  /**
   * Remove a player from the game
   */
  removePlayer(playerId: string): boolean {
    if (this.state === "in_round") {
      throw new Error("Cannot remove players during a round");
    }

    const player = this.playerManager.getPlayer(playerId);
    if (player) {
      // Audit log player leave
      getAuditLogger().log<PlayerLeaveEvent>("player_leave", {
        playerId: player.id,
        playerName: player.name,
        finalBankroll: player.bank.balance,
      });
    }

    return this.playerManager.removePlayer(playerId);
  }

  /**
   * Get a player by ID
   */
  getPlayer(playerId: string): Player | undefined {
    return this.playerManager.getPlayer(playerId);
  }

  /**
   * Get all players
   */
  getAllPlayers(): Player[] {
    return this.playerManager.getAllPlayers();
  }

  /**
   * Start a new round with player bets
   */
  startRound(bets: PlayerBet[]): Round {
    if (this.state === "in_round") {
      throw new Error("Cannot start a new round while one is in progress");
    }

    // Validate all bets
    const playerInfo: PlayerRoundInfo[] = [];

    for (const bet of bets) {
      const player = this.playerManager.getPlayer(bet.playerId);
      if (!player) {
        throw new Error(`Player ${bet.playerId} not found`);
      }

      if (bet.amount <= 0) {
        throw new Error(`Invalid bet amount: ${bet.amount}`);
      }

      if (bet.amount > player.bank.balance) {
        throw new Error(
          `Player ${player.name} has insufficient funds (has $${player.bank.balance}, bet $${bet.amount})`,
        );
      }

      playerInfo.push({
        userId: player.id,
        bank: player.bank,
        bet: bet.amount,
      });
    }

    // Check if we need a new shoe
    if (this.shoe.isComplete) {
      this.shoe = new Shoe(this.numDecks, this.penetration, this.testStack);
    }

    // Start the round
    this.roundNumber++;
    const totalBets = bets.reduce((sum, bet) => sum + bet.amount, 0);

    // Count unique players and total hands (for multi-hand tracking)
    const uniquePlayers = new Set(bets.map((b) => b.playerId));
    const totalHands = bets.length;

    // Set current round number in audit logger
    getAuditLogger().setCurrentRound(this.roundNumber);

    // Audit log round start
    getAuditLogger().log<RoundStartEvent>("round_start", {
      roundNumber: this.roundNumber,
      playerCount: uniquePlayers.size,
      totalBets,
      totalHands,
    });

    this.currentRound = new Round(
      this.roundNumber,
      playerInfo,
      this.shoe,
      this.rules,
    );

    // Set state and log state change
    this.setState("in_round");

    // Check if round auto-progressed to settling (e.g., all players have blackjack)
    if (this.currentRound.state === "settling") {
      this.settleCurrentRound();
    }

    return this.currentRound;
  }

  /**
   * Play an action on the current hand in the current round
   */
  playAction(action: ActionType): void {
    if (!this.currentRound) {
      throw new Error("No active round");
    }

    if (this.state !== "in_round") {
      throw new Error("Cannot play action - not in a round");
    }

    this.currentRound.playAction(action);

    // Check if round is ready for settlement
    if (this.currentRound.state === "settling") {
      this.settleCurrentRound();
    }
  }

  /**
   * Take insurance for a specific player hand
   */
  takeInsurance(handIndex: number): void {
    if (!this.currentRound) {
      throw new Error("No active round");
    }

    this.currentRound.takeInsurance(handIndex);
  }

  /**
   * Decline insurance for a specific player hand
   */
  declineInsurance(handIndex: number): void {
    if (!this.currentRound) {
      throw new Error("No active round");
    }

    this.currentRound.declineInsurance(handIndex);
  }

  /**
   * Resolve insurance phase
   * Returns insurance results and whether dealer has blackjack
   */
  resolveInsurance(): {
    dealerBlackjack: boolean;
    insuranceResults: {
      handIndex: number;
      hadInsurance: boolean;
      payout: number;
    }[];
  } {
    if (!this.currentRound) {
      throw new Error("No active round");
    }

    const results = this.currentRound.resolveInsurance(this.house);

    // If dealer has blackjack, auto-settle the round
    if (results.dealerBlackjack) {
      this.settleCurrentRound();
    }

    // Check if round auto-progressed to settling (e.g., player had blackjack)
    if (this.currentRound.state === "settling") {
      this.settleCurrentRound();
    }

    return results;
  }

  /**
   * Set the game state and log the change
   */
  private setState(newState: GameState): void {
    const oldState = this.state;
    this.state = newState;

    if (oldState !== newState) {
      // Audit log state change
      getAuditLogger().log<GameStateChangeEvent>("game_state_change", {
        fromState: oldState,
        toState: newState,
      });
    }
  }

  /**
   * Settle the current round
   */
  private settleCurrentRound(): SettlementResult[] {
    if (!this.currentRound) {
      throw new Error("No active round to settle");
    }

    const results = this.currentRound.settle(this.house);

    // Calculate total payout and profit
    const totalPayout = results.reduce((sum, r) => sum + r.payout, 0);
    const houseProfit = results.reduce((sum, r) => sum - r.payout, 0);

    // Set state and log state change
    this.setState("round_complete");

    // Audit log round complete
    getAuditLogger().log<RoundCompleteEvent>("round_complete", {
      roundNumber: this.roundNumber,
      totalPayout,
      houseProfit,
    });

    return results;
  }

  /**
   * Get the current round
   */
  getCurrentRound(): Round | undefined {
    return this.currentRound;
  }

  /**
   * Get available actions for the current player
   */
  getAvailableActions(): ActionType[] {
    if (!this.currentRound) {
      return [];
    }

    return this.currentRound.getAvailableActions();
  }

  /**
   * Complete the current round and prepare for the next one
   */
  completeRound(): void {
    if (this.state !== "round_complete") {
      throw new Error("Round is not complete");
    }

    // Clear the current round from audit logger
    getAuditLogger().clearCurrentRound();

    // Set state and log state change
    this.setState("waiting_for_bets");
    this.currentRound = undefined;
  }

  /**
   * Get game statistics
   */
  getStats() {
    return {
      roundNumber: this.roundNumber,
      playerCount: this.playerManager.playerCount,
      houseProfit: this.house.profitLoss,
      houseBankroll: this.house.balance,
      shoeRemainingCards: this.shoe.remainingCards,
      shoeComplete: this.shoe.isComplete,
      state: this.state,
    };
  }

  /**
   * Get the current game state
   */
  getState(): GameState {
    return this.state;
  }

  /**
   * Get the rules for this game
   */
  getRules(): RuleSet {
    return this.rules;
  }

  /**
   * Get the house edge for the current rules
   */
  getHouseEdge(): number {
    return this.rules.build().houseEdge;
  }

  /**
   * Get a description of the current rules
   */
  getRulesDescription(): string {
    return this.rules.describe();
  }

  /**
   * Get the session ID
   */
  getSessionId(): string {
    return this.sessionId;
  }

  /**
   * Get the audit trail as JSON
   */
  getAuditTrailJSON(): string {
    return getAuditLogger().exportJSON();
  }

  /**
   * Get the audit trail as CSV
   */
  getAuditTrailCSV(): string {
    return getAuditLogger().exportCSV();
  }

  /**
   * Get audit trail summary
   */
  getAuditSummary() {
    return getAuditLogger().generateSummary();
  }

  /**
   * End the session and log it
   */
  endSession(): void {
    // Audit log session end
    getAuditLogger().log<SessionEndEvent>("session_end", {
      sessionId: this.sessionId,
      totalRounds: this.roundNumber,
      houseFinalBankroll: this.house.balance,
      houseProfitLoss: this.house.profitLoss,
    });
  }
}
