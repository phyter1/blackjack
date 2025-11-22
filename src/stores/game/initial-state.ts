import type { GameState } from "./types";

export const initialState: Omit<
  GameState,
  "decisionTracker" | "cardCounter" | "unsubscribe"
> = {
  game: null,
  player: null,
  phase: "betting",
  roundsPlayed: 0,
  totalWagered: 0,
  sessionId: null,
  currentBalance: 0,
  currentRound: undefined,
  currentActions: [],
  shoeDetails: null,
  originalBalance: 0,
  roundVersion: 0,
  handsPendingInsurance: [],
  insuranceHandIndex: 0,
  countingEnabled: true,
  showCount: true,
};
