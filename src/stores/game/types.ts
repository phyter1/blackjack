import type { GamePhase } from "@/components/table/types";
import type { ObservableGame } from "@/lib/observable-game";
import type { ActionType } from "@/modules/game/action";
import type { Hand } from "@/modules/game/hand";
import type { Player } from "@/modules/game/player";
import type { Round } from "@/modules/game/round";
import type { ShoeDetails } from "@/modules/game";
import { DecisionTracker } from "@/modules/strategy/decision-tracker";
import { HiLoCounter } from "@/modules/strategy/hi-lo-counter";
import type { TableRules, UserBank, UserProfile } from "@/types/user";

// Serialized hand type for UI (plain object, not class instance)
export type SerializedHand = ReturnType<Hand["toObject"]>;

// Serialized round type for UI (only data properties, no methods/getters)
export type SerializedRound = {
  id: string;
  dealerHand: Round["dealerHand"];
  playerHands: SerializedHand[];
  state: Round["state"];
  currentHandIndex: number;
  settlementResults?: Round["settlementResults"];
  roundNumber: number;
};

export interface GameState {
  // Core game instances
  game: ObservableGame | null;
  player: Player | null;
  decisionTracker: DecisionTracker | null;
  cardCounter: HiLoCounter | null;

  // Game state
  phase: GamePhase;
  roundsPlayed: number;
  totalWagered: number;
  sessionId: string | null;
  currentBalance: number;
  currentRound: SerializedRound | undefined;
  currentActions: ActionType[];
  shoeDetails: ShoeDetails | null;
  originalBalance: number;
  roundVersion: number;

  // Insurance state
  handsPendingInsurance: number[];
  insuranceHandIndex: number;

  // Counting state
  countingEnabled: boolean;
  showCount: boolean;

  // Observable subscription
  unsubscribe: (() => void) | null;
}

export interface GameActions {
  // Initialization
  initializeGame: (
    user: UserProfile,
    bank: UserBank,
    rules: TableRules | undefined,
    searchParamsString?: string,
  ) => Promise<void>;
  cleanup: () => void;

  // Game actions (converted from handlers)
  placeBets: (bets: number[]) => Promise<void>;
  playAction: (action: ActionType) => Promise<void>;
  handleInsuranceAction: (takeInsurance: boolean) => void;
  handleNextRound: () => void;
  handleEndGame: (userId: string, onGameEnd: (bank: UserBank) => void) => void;

  // Phase management
  setPhase: (phase: GamePhase) => void;

  // Counting actions
  setCountingEnabled: (enabled: boolean) => void;
  setShowCount: (show: boolean) => void;

  // Internal state updates (called by actions)
  updateFromGame: () => void;
  updateSettlementOutcomes: () => void;
  updateInsuranceState: () => void;
}

export type GameStore = GameState & GameActions;
