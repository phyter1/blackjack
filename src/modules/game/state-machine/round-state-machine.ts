/**
 * Round state machine implementation
 */

import type { ActionType } from "../action";
import { BaseStateMachine } from "./state-machine";
import type {
  RoundState,
  RoundTransitionEvent,
  StateMachineConfig,
} from "./types";

export class RoundStateMachine extends BaseStateMachine<
  RoundState,
  RoundTransitionEvent
> {
  constructor(hasInsurance: boolean = false) {
    const config: StateMachineConfig<RoundState, RoundTransitionEvent> = {
      initialState: hasInsurance ? "insurance" : "player_turn",
      states: {
        insurance: {
          on: {
            RESOLVE_INSURANCE: "player_turn", // Will be overridden if dealer has blackjack
            AUTO_SETTLE: "settling",
          },
          entry: () => {
            // Insurance offers active
          },
        },
        player_turn: {
          on: {
            ALL_PLAYERS_DONE: "dealer_turn",
            AUTO_SETTLE: "settling", // All players busted or have blackjack
          },
          entry: () => {
            // Players making decisions
          },
        },
        dealer_turn: {
          on: {
            DEALER_DONE: "settling",
          },
          entry: () => {
            // Dealer playing their hand
          },
        },
        settling: {
          on: {
            // No transitions from settling - it's a terminal state for the round
          },
          entry: () => {
            // Calculating payouts
          },
        },
        complete: {
          on: {
            // Terminal state
          },
          entry: () => {
            // Round fully complete
          },
        },
      },
    };

    super(config);
  }

  /**
   * Resolve insurance phase and transition to next state
   *
   * @param dealerBlackjack - Whether dealer has blackjack (determines next state)
   * @throws Error if not in insurance state
   */
  resolveInsurance(dealerBlackjack: boolean): void {
    if (this.currentState !== "insurance") {
      throw new Error(
        `Cannot resolve insurance in state: ${this.currentState}. Must be in 'insurance' state.`,
      );
    }

    if (dealerBlackjack) {
      // If dealer has blackjack, skip to settling
      this.transition({ type: "AUTO_SETTLE" });
    } else {
      // Otherwise continue to player turn
      this.transition({
        type: "RESOLVE_INSURANCE",
        dealerBlackjack,
      });
    }
  }

  /**
   * Process a player action during player turn
   *
   * @param action - The action being performed (hit, stand, double, etc.)
   * @throws Error if not in player_turn state
   */
  processPlayerAction(action: ActionType): void {
    if (this.currentState !== "player_turn") {
      throw new Error(
        `Cannot process player action in state: ${this.currentState}. Must be in 'player_turn' state.`,
      );
    }

    this.transition({ type: "PLAYER_ACTION", action });
  }

  /**
   * Mark all players as done
   */
  allPlayersDone(): void {
    if (this.currentState !== "player_turn") {
      throw new Error(
        `Cannot mark players done in state: ${this.currentState}. Must be in 'player_turn' state.`,
      );
    }

    this.transition({ type: "ALL_PLAYERS_DONE" });
  }

  /**
   * Mark dealer as done
   */
  dealerDone(): void {
    if (this.currentState !== "dealer_turn") {
      throw new Error(
        `Cannot mark dealer done in state: ${this.currentState}. Must be in 'dealer_turn' state.`,
      );
    }

    this.transition({ type: "DEALER_DONE" });
  }

  /**
   * Auto-settle the round (all players busted/blackjack)
   */
  autoSettle(): void {
    if (this.currentState === "settling" || this.currentState === "complete") {
      // Already settling or complete
      return;
    }

    this.transition({ type: "AUTO_SETTLE" });
  }

  /**
   * Check if the round is complete
   */
  isComplete(): boolean {
    return this.currentState === "complete" || this.currentState === "settling";
  }

  /**
   * Check if we're in insurance phase
   */
  isInsurancePhase(): boolean {
    return this.currentState === "insurance";
  }

  /**
   * Check if it's player turn
   */
  isPlayerTurn(): boolean {
    return this.currentState === "player_turn";
  }

  /**
   * Check if it's dealer turn
   */
  isDealerTurn(): boolean {
    return this.currentState === "dealer_turn";
  }

  /**
   * Check if we're settling
   */
  isSettling(): boolean {
    return this.currentState === "settling";
  }

  /**
   * Get a description of the current phase
   */
  getPhaseDescription(): string {
    switch (this.currentState) {
      case "insurance":
        return "Insurance offers in progress";
      case "player_turn":
        return "Players making decisions";
      case "dealer_turn":
        return "Dealer playing hand";
      case "settling":
        return "Calculating payouts";
      case "complete":
        return "Round complete";
      default:
        return `Unknown state: ${this.currentState}`;
    }
  }
}

/**
 * Round-specific state validation helpers
 */
export const roundStateValidation = {
  canTakeInsurance: (state: RoundState): boolean => {
    return state === "insurance";
  },

  canPlayAction: (state: RoundState): boolean => {
    return state === "player_turn";
  },

  canDealerPlay: (state: RoundState): boolean => {
    return state === "dealer_turn";
  },

  canSettle: (state: RoundState): boolean => {
    return state === "settling";
  },

  isRoundActive: (state: RoundState): boolean => {
    return state !== "complete";
  },
};

/**
 * Creates a new round state machine instance for managing round phases.
 *
 * The round state machine manages five states:
 * - `insurance`: Offering insurance (if dealer shows Ace)
 * - `player_turn`: Players making decisions
 * - `dealer_turn`: Dealer playing their hand
 * - `settling`: Calculating and distributing payouts
 * - `complete`: Round fully complete
 *
 * @param hasInsurance - Whether to start with insurance phase (dealer shows Ace)
 * @returns {RoundStateMachine} A new round state machine instance
 *
 * @example
 * ```typescript
 * // Create machine without insurance phase
 * const roundMachine = createRoundStateMachine(false);
 *
 * // Create machine with insurance phase
 * const roundWithInsurance = createRoundStateMachine(true);
 *
 * // Process player actions
 * if (roundMachine.isPlayerTurn()) {
 *   roundMachine.processPlayerAction(ACTION_HIT);
 * }
 * ```
 */
export function createRoundStateMachine(
  hasInsurance: boolean = false,
): RoundStateMachine {
  return new RoundStateMachine(hasInsurance);
}
