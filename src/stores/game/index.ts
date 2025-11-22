import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import { initialState } from "./initial-state";
import type { GameStore } from "./types";
import { createInitializationActions } from "./actions/initialization";
import { createBettingActions } from "./actions/betting";
import { createPlayingActions } from "./actions/playing";
import { createRoundManagementActions } from "./actions/round-management";
import { createStateUpdateActions } from "./actions/state-updates";

/**
 * Game store with ObservableGame integration
 * Replaces use-casino-game, use-insurance, and use-counting hooks
 */
export const useGameStore = create<GameStore>()(
  immer((set, get) => ({
    ...initialState,
    decisionTracker: null,
    cardCounter: null,
    unsubscribe: null,

    // Merge all action creators
    ...createInitializationActions(set, get),
    ...createBettingActions(set, get),
    ...createPlayingActions(set, get),
    ...createRoundManagementActions(set, get),
    ...createStateUpdateActions(set, get),
  })),
);

// Re-export types and selectors
export * from "./types";
export * from "./selectors";
