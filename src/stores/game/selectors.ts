import type { GameStore } from "./types";

// Selectors for optimized re-renders
export const selectGame = (state: GameStore) => state.game;
export const selectPlayer = (state: GameStore) => state.player;
export const selectPhase = (state: GameStore) => state.phase;
export const selectRoundsPlayed = (state: GameStore) => state.roundsPlayed;
export const selectTotalWagered = (state: GameStore) => state.totalWagered;
export const selectCurrentBalance = (state: GameStore) => state.currentBalance;
export const selectCurrentRound = (state: GameStore) => state.currentRound;
export const selectCurrentActions = (state: GameStore) => state.currentActions;
export const selectShoeDetails = (state: GameStore) => state.shoeDetails;
export const selectDecisionTracker = (state: GameStore) =>
  state.decisionTracker;
export const selectCardCounter = (state: GameStore) => state.cardCounter;
export const selectCountingEnabled = (state: GameStore) =>
  state.countingEnabled;
export const selectShowCount = (state: GameStore) => state.showCount;
export const selectHandsPendingInsurance = (state: GameStore) =>
  state.handsPendingInsurance;
export const selectInsuranceHandIndex = (state: GameStore) =>
  state.insuranceHandIndex;
