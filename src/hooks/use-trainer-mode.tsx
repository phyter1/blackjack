"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import {
  TrainerMode,
  type TrainerDifficulty,
} from "@/modules/strategy/trainer";
import type { Game } from "@/modules/game/game";
import type {
  ActionFeedback,
  CountFeedback,
  TrainerStats,
} from "@/modules/strategy/trainer";

interface TrainerContextValue {
  trainer: TrainerMode | null;
  isActive: boolean;
  difficulty: TrainerDifficulty;
  practiceBalance: number;
  stats: TrainerStats | null;
  currentActionFeedback: ActionFeedback | null;
  currentCountFeedback: CountFeedback | null;

  // Actions
  initializeTrainer: (game: Game) => void;
  activateTrainer: () => void;
  deactivateTrainer: () => void;
  setDifficulty: (difficulty: TrainerDifficulty) => void;
  resetTrainer: () => void;
  refreshStats: () => void;
  clearFeedback: () => void;
  getTrainer: () => TrainerMode | null;
}

const TrainerContext = createContext<TrainerContextValue | undefined>(
  undefined,
);

export function TrainerModeProvider({ children }: { children: ReactNode }) {
  const [trainer, setTrainer] = useState<TrainerMode | null>(null);
  const [isActive, setIsActive] = useState(false);
  const [difficulty, setDifficultyState] =
    useState<TrainerDifficulty>("beginner");
  const [practiceBalance, setPracticeBalance] = useState(10000);
  const [stats, setStats] = useState<TrainerStats | null>(null);
  const [currentActionFeedback, setCurrentActionFeedback] =
    useState<ActionFeedback | null>(null);
  const [currentCountFeedback, setCurrentCountFeedback] =
    useState<CountFeedback | null>(null);

  const initializeTrainer = useCallback(
    (game: Game) => {
      const newTrainer = new TrainerMode(game, difficulty, 10000);
      setTrainer(newTrainer);
      setPracticeBalance(newTrainer.getPracticeBalance());
    },
    [difficulty],
  );

  const activateTrainer = useCallback(() => {
    if (!trainer) return;
    trainer.activate();
    setIsActive(true);
    refreshStats();
  }, [trainer]);

  const deactivateTrainer = useCallback(() => {
    if (!trainer) return;
    trainer.deactivate();
    setIsActive(false);
  }, [trainer]);

  const setDifficulty = useCallback(
    (newDifficulty: TrainerDifficulty) => {
      setDifficultyState(newDifficulty);
      if (trainer) {
        trainer.setDifficulty(newDifficulty);
      }
    },
    [trainer],
  );

  const resetTrainer = useCallback(() => {
    if (!trainer) return;
    trainer.reset();
    setPracticeBalance(trainer.getPracticeBalance());
    setStats(trainer.getStats());
    setCurrentActionFeedback(null);
    setCurrentCountFeedback(null);
  }, [trainer]);

  const refreshStats = useCallback(() => {
    if (!trainer) return;
    setStats(trainer.getStats());
    setPracticeBalance(trainer.getPracticeBalance());
    setCurrentActionFeedback(trainer.getCurrentActionFeedback());
    setCurrentCountFeedback(trainer.getCurrentCountFeedback());
  }, [trainer]);

  const clearFeedback = useCallback(() => {
    if (!trainer) return;
    trainer.clearCurrentFeedback();
    setCurrentActionFeedback(null);
    setCurrentCountFeedback(null);
  }, [trainer]);

  // Expose trainer instance for direct access
  const getTrainer = useCallback(() => trainer, [trainer]);

  return (
    <TrainerContext.Provider
      value={{
        trainer,
        isActive,
        difficulty,
        practiceBalance,
        stats,
        currentActionFeedback,
        currentCountFeedback,
        initializeTrainer,
        activateTrainer,
        deactivateTrainer,
        setDifficulty,
        resetTrainer,
        refreshStats,
        clearFeedback,
        getTrainer,
      }}
    >
      {children}
    </TrainerContext.Provider>
  );
}

export function useTrainerMode() {
  const context = useContext(TrainerContext);
  if (context === undefined) {
    throw new Error("useTrainerMode must be used within a TrainerModeProvider");
  }
  return context;
}
