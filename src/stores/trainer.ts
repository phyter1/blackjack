import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import type { Game } from "@/modules/game/game";
import {
  type ActionFeedback,
  type CountFeedback,
  type TrainerDifficulty,
  TrainerMode,
  type TrainerStats,
} from "@/modules/strategy/trainer";

export interface TrainerState {
  trainer: TrainerMode | null;
  isActive: boolean;
  difficulty: TrainerDifficulty;
  practiceBalance: number;
  stats: TrainerStats | null;
  currentActionFeedback: ActionFeedback | null;
  currentCountFeedback: CountFeedback | null;
}

export interface TrainerActions {
  initializeTrainer: (game: Game) => void;
  activateTrainer: () => void;
  deactivateTrainer: () => void;
  setDifficulty: (difficulty: TrainerDifficulty) => void;
  resetTrainer: () => void;
  refreshStats: () => void;
  clearFeedback: () => void;
  getTrainer: () => TrainerMode | null;
}

export type TrainerStore = TrainerState & TrainerActions;

/**
 * Trainer mode store
 * Replaces the TrainerModeProvider context
 */
export const useTrainerStore = create<TrainerStore>()(
  immer((set, get) => ({
    // State
    trainer: null,
    isActive: false,
    difficulty: "beginner",
    practiceBalance: 10000,
    stats: null,
    currentActionFeedback: null,
    currentCountFeedback: null,

    // Actions
    initializeTrainer: (game) =>
      set((state) => {
        const newTrainer = new TrainerMode(game, state.difficulty, 10000);
        state.trainer = newTrainer;
        state.practiceBalance = newTrainer.getPracticeBalance();
      }),

    activateTrainer: () =>
      set((state) => {
        if (!state.trainer) return;
        state.trainer.activate();
        state.isActive = true;
        // Refresh stats
        const { trainer } = state;
        state.stats = trainer.getStats();
        state.practiceBalance = trainer.getPracticeBalance();
        state.currentActionFeedback = trainer.getCurrentActionFeedback();
        state.currentCountFeedback = trainer.getCurrentCountFeedback();
      }),

    deactivateTrainer: () =>
      set((state) => {
        if (!state.trainer) return;
        state.trainer.deactivate();
        state.isActive = false;
      }),

    setDifficulty: (newDifficulty) =>
      set((state) => {
        state.difficulty = newDifficulty;
        if (state.trainer) {
          state.trainer.setDifficulty(newDifficulty);
        }
      }),

    resetTrainer: () =>
      set((state) => {
        if (!state.trainer) return;
        state.trainer.reset();
        state.practiceBalance = state.trainer.getPracticeBalance();
        state.stats = state.trainer.getStats();
        state.currentActionFeedback = null;
        state.currentCountFeedback = null;
      }),

    refreshStats: () =>
      set((state) => {
        if (!state.trainer) return;
        state.stats = state.trainer.getStats();
        state.practiceBalance = state.trainer.getPracticeBalance();
        state.currentActionFeedback = state.trainer.getCurrentActionFeedback();
        state.currentCountFeedback = state.trainer.getCurrentCountFeedback();
      }),

    clearFeedback: () =>
      set((state) => {
        if (!state.trainer) return;
        state.trainer.clearCurrentFeedback();
        state.currentActionFeedback = null;
        state.currentCountFeedback = null;
      }),

    getTrainer: () => get().trainer,
  })),
);

// Selectors for optimized re-renders
export const selectTrainer = (state: TrainerStore) => state.trainer;
export const selectIsActive = (state: TrainerStore) => state.isActive;
export const selectDifficulty = (state: TrainerStore) => state.difficulty;
export const selectPracticeBalance = (state: TrainerStore) =>
  state.practiceBalance;
export const selectTrainerStats = (state: TrainerStore) => state.stats;
export const selectActionFeedback = (state: TrainerStore) =>
  state.currentActionFeedback;
export const selectCountFeedback = (state: TrainerStore) =>
  state.currentCountFeedback;
