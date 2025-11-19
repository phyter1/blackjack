/**
 * State machine types and interfaces for the blackjack game
 */

import type { ActionType } from "../action";
import type { PlayerBet } from "../game";
import type { SettlementResult } from "../settlement";

// Game States
export type GameState = "waiting_for_bets" | "in_round" | "round_complete";

// Round States
export type RoundState =
  | "insurance"
  | "player_turn"
  | "dealer_turn"
  | "settling"
  | "complete";

// State Transition Events
export type GameTransitionEvent =
  | { type: "START_ROUND"; bets: PlayerBet[] }
  | { type: "ROUND_SETTLED"; results: SettlementResult[] }
  | { type: "COMPLETE_ROUND" };

export type RoundTransitionEvent =
  | { type: "RESOLVE_INSURANCE"; dealerBlackjack: boolean }
  | { type: "PLAYER_ACTION"; action: ActionType }
  | { type: "ALL_PLAYERS_DONE" }
  | { type: "DEALER_DONE" }
  | { type: "AUTO_SETTLE" };

// State Machine Configuration
export interface StateMachineConfig<S extends string, E> {
  initialState: S;
  states: {
    [K in S]: {
      on?: {
        [EventType in E extends { type: string } ? E["type"] : never]?: S;
      };
      entry?: () => void;
      exit?: () => void;
    };
  };
}

// Transition Guards
export type TransitionGuard<E> = (event: E) => boolean;

// Transition Actions
export type TransitionAction<E> = (event: E) => void;

// State Machine Transition Definition
export interface Transition<S extends string, E> {
  from: S;
  to: S;
  event: E extends { type: string } ? E["type"] : never;
  guard?: TransitionGuard<E>;
  action?: TransitionAction<E>;
}

// State Machine Interface
export interface StateMachine<S extends string, E> {
  currentState: S;
  transition(event: E): S;
  canTransition(event: E): boolean;
  getAvailableTransitions(): string[];
  reset(): void;
}

// Validation Rules for State Transitions
export interface StateValidation {
  canAddPlayer: (state: GameState) => boolean;
  canRemovePlayer: (state: GameState) => boolean;
  canStartRound: (state: GameState) => boolean;
  canPlayAction: (state: GameState, roundState?: RoundState) => boolean;
  canTakeInsurance: (roundState: RoundState) => boolean;
  canCompleteRound: (state: GameState) => boolean;
}

// State Change Listener
export type StateChangeListener<S extends string> = (
  prevState: S,
  newState: S,
) => void;