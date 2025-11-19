/**
 * Game state machine implementation
 */

import { BaseStateMachine } from "./state-machine";
import type {
  GameState,
  GameTransitionEvent,
  StateMachineConfig,
  StateValidation,
  RoundState,
} from "./types";
import type { PlayerBet } from "../game";
import type { SettlementResult } from "../settlement";
import { getAuditLogger } from "../../audit/logger";
import type { GameStateChangeEvent } from "../../audit/types";

export class GameStateMachine extends BaseStateMachine<
  GameState,
  GameTransitionEvent
> {
  constructor() {
    const config: StateMachineConfig<GameState, GameTransitionEvent> = {
      initialState: "waiting_for_bets",
      states: {
        waiting_for_bets: {
          on: {
            START_ROUND: "in_round",
          },
          entry: () => {
            // Ready to accept bets for next round
          },
        },
        in_round: {
          on: {
            ROUND_SETTLED: "round_complete",
          },
          entry: () => {
            // Round is active
          },
        },
        round_complete: {
          on: {
            COMPLETE_ROUND: "waiting_for_bets",
          },
          entry: () => {
            // Round finished, cleanup needed
          },
        },
      },
    };

    super(config);

    // Add audit logging listener
    this.addListener((prevState, newState) => {
      getAuditLogger().log<GameStateChangeEvent>("game_state_change", {
        fromState: prevState,
        toState: newState,
      });
    });
  }

  /**
   * Convenience method to check if we can start a round
   */
  canStartRound(): boolean {
    return this.currentState === "waiting_for_bets";
  }

  /**
   * Convenience method to check if we can complete a round
   */
  canCompleteRound(): boolean {
    return this.currentState === "round_complete";
  }

  /**
   * Convenience method to check if a round is active
   */
  isRoundActive(): boolean {
    return this.currentState === "in_round";
  }

  /**
   * Start a new round
   */
  startRound(bets: PlayerBet[]): void {
    if (!this.canStartRound()) {
      throw new Error(
        `Cannot start round in state: ${this.currentState}. Must be in 'waiting_for_bets' state.`,
      );
    }

    this.transition({ type: "START_ROUND", bets });
  }

  /**
   * Mark round as settled
   */
  settleRound(results: SettlementResult[]): void {
    if (!this.isRoundActive()) {
      throw new Error(
        `Cannot settle round in state: ${this.currentState}. Must be in 'in_round' state.`,
      );
    }

    this.transition({ type: "ROUND_SETTLED", results });
  }

  /**
   * Complete the round and return to waiting state
   */
  completeRound(): void {
    if (!this.canCompleteRound()) {
      throw new Error(
        `Cannot complete round in state: ${this.currentState}. Must be in 'round_complete' state.`,
      );
    }

    this.transition({ type: "COMPLETE_ROUND" });
  }
}

/**
 * State validation utilities
 */
export const gameStateValidation: StateValidation = {
  canAddPlayer: (state: GameState): boolean => {
    return state !== "in_round";
  },

  canRemovePlayer: (state: GameState): boolean => {
    return state !== "in_round";
  },

  canStartRound: (state: GameState): boolean => {
    return state === "waiting_for_bets";
  },

  canPlayAction: (state: GameState, roundState?: RoundState): boolean => {
    if (state !== "in_round") return false;
    if (!roundState) return false;
    return roundState === "player_turn";
  },

  canTakeInsurance: (roundState: RoundState): boolean => {
    return roundState === "insurance";
  },

  canCompleteRound: (state: GameState): boolean => {
    return state === "round_complete";
  },
};

/**
 * Creates a new game state machine instance for managing game flow.
 *
 * The game state machine manages three states:
 * - `waiting_for_bets`: Ready to accept bets for a new round
 * - `in_round`: Round is active with players making decisions
 * - `round_complete`: Round finished, awaiting cleanup
 *
 * @returns {GameStateMachine} A new game state machine instance
 *
 * @example
 * ```typescript
 * const stateMachine = createGameStateMachine();
 *
 * // Check current state
 * console.log(stateMachine.currentState); // "waiting_for_bets"
 *
 * // Start a round
 * if (stateMachine.canStartRound()) {
 *   stateMachine.startRound(bets);
 * }
 * ```
 */
export function createGameStateMachine(): GameStateMachine {
  return new GameStateMachine();
}