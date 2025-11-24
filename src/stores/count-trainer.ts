import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import { persist } from "zustand/middleware";
import { Shoe } from "@/modules/game/shoe";
import { type Card, newDeck } from "@/modules/game/cards";
import { getHiLoValue } from "@/modules/strategy/hi-lo-counter";

/**
 * Calculate hand value and determine if it's soft
 */
function calculateHandValue(cards: Card[]): {
  value: number;
  isSoft: boolean;
} {
  let value = 0;
  let aceCount = 0;

  // First pass: count all cards, Aces as 11
  for (const card of cards) {
    if (card.rank === "A") {
      aceCount += 1;
      value += 11;
    } else if (["K", "Q", "J"].includes(card.rank)) {
      value += 10;
    } else {
      value += Number.parseInt(card.rank, 10);
    }
  }

  // Second pass: convert Aces from 11 to 1 if over 21
  let acesConverted = 0;
  while (value > 21 && aceCount > acesConverted) {
    value -= 10;
    acesConverted += 1;
  }

  // Soft hand: has at least one Ace counted as 11
  const isSoft = aceCount > 0 && acesConverted < aceCount;

  return { value, isSoft };
}

export type CountTrainerMode = "beginner" | "intermediate" | "advanced";

export interface ChallengeResult {
  correct: boolean;
  reward: number;
  actualValue?: number;
  playerValue?: number;
}

export interface CountTrainerStats {
  // Overall stats
  totalChallenges: number;
  correctChallenges: number;
  accuracy: number;
  currentStreak: number;
  bestStreak: number;

  // Mode-specific stats
  beginnerStats: {
    attempts: number;
    correct: number;
    accuracy: number;
  };
  intermediateStats: {
    attempts: number;
    correct: number;
    accuracy: number;
  };
  advancedStats: {
    attempts: number;
    correctRunning: number;
    correctTrue: number;
    accuracy: number;
  };

  // Financial
  totalEarnings: number;
  totalLosses: number;
  netProfit: number;
}

export interface CountTrainerState {
  // Mode and session
  mode: CountTrainerMode;
  isActive: boolean;
  practiceBalance: number;

  // Shoe and cards
  shoe: Shoe | null;
  dealtCards: Card[];
  currentHand: Card[];
  runningCount: number;

  // Challenge state
  challengeActive: boolean;
  lastResult: ChallengeResult | null;
  feedbackMessage: string | null;

  // Stats
  stats: CountTrainerStats;
}

export interface CountTrainerActions {
  // Mode management
  setMode: (mode: CountTrainerMode) => void;
  startSession: () => void;
  endSession: () => void;

  // Beginner mode
  generateHandChallenge: () => void;
  submitHandAnswer: (answer: number, isSoft: boolean) => void;

  // Intermediate mode
  dealCard: () => void;
  submitRunningCount: (count: number) => void;

  // Advanced mode
  submitTrueCount: (runningCount: number, trueCount: number) => void;

  // Utilities
  resetShoe: () => void;
  resetSession: () => void;
  clearFeedback: () => void;
  cashOut: () => number; // Returns amount cashed out
}

export type CountTrainerStore = CountTrainerState & CountTrainerActions;

const initialStats: CountTrainerStats = {
  totalChallenges: 0,
  correctChallenges: 0,
  accuracy: 0,
  currentStreak: 0,
  bestStreak: 0,
  beginnerStats: { attempts: 0, correct: 0, accuracy: 0 },
  intermediateStats: { attempts: 0, correct: 0, accuracy: 0 },
  advancedStats: {
    attempts: 0,
    correctRunning: 0,
    correctTrue: 0,
    accuracy: 0,
  },
  totalEarnings: 0,
  totalLosses: 0,
  netProfit: 0,
};

export const useCountTrainerStore = create<CountTrainerStore>()(
  persist(
    immer((set, get) => ({
      // Initial state
      mode: "beginner",
      isActive: false,
      practiceBalance: 1000,
      shoe: null,
      dealtCards: [],
      currentHand: [],
      runningCount: 0,
      challengeActive: false,
      lastResult: null,
      feedbackMessage: null,
      stats: initialStats,

      // Mode management
      setMode: (mode) =>
        set((state) => {
          state.mode = mode;
          state.challengeActive = false;
          state.lastResult = null;
          state.feedbackMessage = null;
        }),

      startSession: () =>
        set((state) => {
          state.isActive = true;
          const shoe = new Shoe(6, 0.75);
          state.shoe = shoe;
          state.dealtCards = [];
          state.runningCount = 0;
          state.challengeActive = false;
          state.lastResult = null;
          state.feedbackMessage = null;
        }),

      endSession: () =>
        set((state) => {
          state.isActive = false;
          state.challengeActive = false;
        }),

      // Beginner mode: Hand total counting
      generateHandChallenge: () =>
        set((state) => {
          if (!state.shoe) return;

          // Draw 2-5 cards for the challenge
          const numCards = Math.floor(Math.random() * 4) + 2; // 2-5 cards
          const hand: Card[] = [];

          for (let i = 0; i < numCards; i++) {
            const card = state.shoe.drawCard();
            if (card) hand.push(card);
          }

          state.currentHand = hand;
          state.challengeActive = true;
          state.lastResult = null;
          state.feedbackMessage = null;
        }),

      submitHandAnswer: (answer, isSoft) =>
        set((state) => {
          if (!state.challengeActive || state.currentHand.length === 0) return;

          const handValue = calculateHandValue(state.currentHand);
          const actualValue = handValue.value;
          const actualIsSoft = handValue.isSoft;

          const correct = answer === actualValue && isSoft === actualIsSoft;
          const reward = correct ? Math.floor(Math.random() * 20) + 5 : -5; // $5-$25 win, $5 loss

          // Update balance
          state.practiceBalance += reward;

          // Update stats
          state.stats.totalChallenges++;
          state.stats.beginnerStats.attempts++;

          if (correct) {
            state.stats.correctChallenges++;
            state.stats.beginnerStats.correct++;
            state.stats.currentStreak++;
            state.stats.totalEarnings += reward;

            if (state.stats.currentStreak > state.stats.bestStreak) {
              state.stats.bestStreak = state.stats.currentStreak;
            }
          } else {
            state.stats.currentStreak = 0;
            state.stats.totalLosses += Math.abs(reward);
          }

          // Update accuracy
          state.stats.accuracy =
            (state.stats.correctChallenges / state.stats.totalChallenges) * 100;
          state.stats.beginnerStats.accuracy =
            (state.stats.beginnerStats.correct /
              state.stats.beginnerStats.attempts) *
            100;
          state.stats.netProfit =
            state.stats.totalEarnings - state.stats.totalLosses;

          state.lastResult = {
            correct,
            reward,
            actualValue,
            playerValue: answer,
          };

          state.feedbackMessage = correct
            ? `Correct! ${actualIsSoft ? "Soft" : "Hard"} ${actualValue}. +$${reward}`
            : `Incorrect. Answer was ${actualIsSoft ? "Soft" : "Hard"} ${actualValue}. -$${Math.abs(reward)}`;

          state.challengeActive = false;
        }),

      // Intermediate mode: Running count
      dealCard: () =>
        set((state) => {
          if (!state.shoe) return;

          const card = state.shoe.drawCard();
          if (!card) {
            state.feedbackMessage = "Shoe is empty! Resetting...";
            return;
          }

          state.dealtCards.push(card);
          state.runningCount += getHiLoValue(card);
          state.challengeActive = true;
        }),

      submitRunningCount: (count) =>
        set((state) => {
          if (!state.challengeActive) return;

          const actualCount = state.runningCount;
          const correct = count === actualCount;
          const reward = correct ? Math.floor(Math.random() * 75) + 25 : -10; // $25-$100 win, $10 loss

          state.practiceBalance += reward;

          // Update stats
          state.stats.totalChallenges++;
          state.stats.intermediateStats.attempts++;

          if (correct) {
            state.stats.correctChallenges++;
            state.stats.intermediateStats.correct++;
            state.stats.currentStreak++;
            state.stats.totalEarnings += reward;

            if (state.stats.currentStreak > state.stats.bestStreak) {
              state.stats.bestStreak = state.stats.currentStreak;
            }
          } else {
            state.stats.currentStreak = 0;
            state.stats.totalLosses += Math.abs(reward);
          }

          state.stats.accuracy =
            (state.stats.correctChallenges / state.stats.totalChallenges) * 100;
          state.stats.intermediateStats.accuracy =
            (state.stats.intermediateStats.correct /
              state.stats.intermediateStats.attempts) *
            100;
          state.stats.netProfit =
            state.stats.totalEarnings - state.stats.totalLosses;

          state.lastResult = {
            correct,
            reward,
            actualValue: actualCount,
            playerValue: count,
          };

          state.feedbackMessage = correct
            ? `Correct! Running count is ${actualCount}. +$${reward}`
            : `Incorrect. Running count was ${actualCount}. -$${Math.abs(reward)}`;

          state.challengeActive = false;
        }),

      // Advanced mode: True count
      submitTrueCount: (runningCount, trueCount) =>
        set((state) => {
          if (!state.shoe || !state.challengeActive) return;

          const actualRunningCount = state.runningCount;
          const decksRemaining = state.shoe.remainingCards / 52;
          const actualTrueCount = Math.round(actualRunningCount / decksRemaining);

          const runningCorrect = runningCount === actualRunningCount;
          const trueCorrect = trueCount === actualTrueCount;
          const bothCorrect = runningCorrect && trueCorrect;

          const reward = bothCorrect
            ? Math.floor(Math.random() * 150) + 50
            : runningCorrect
              ? 20
              : -15; // $50-$200 for both, $20 for running only, -$15 for wrong

          state.practiceBalance += reward;

          // Update stats
          state.stats.totalChallenges++;
          state.stats.advancedStats.attempts++;

          if (runningCorrect) {
            state.stats.advancedStats.correctRunning++;
          }

          if (trueCorrect) {
            state.stats.advancedStats.correctTrue++;
          }

          if (bothCorrect) {
            state.stats.correctChallenges++;
            state.stats.currentStreak++;
            state.stats.totalEarnings += reward;

            if (state.stats.currentStreak > state.stats.bestStreak) {
              state.stats.bestStreak = state.stats.currentStreak;
            }
          } else {
            state.stats.currentStreak = 0;
            if (reward < 0) {
              state.stats.totalLosses += Math.abs(reward);
            } else {
              state.stats.totalEarnings += reward;
            }
          }

          state.stats.accuracy =
            (state.stats.correctChallenges / state.stats.totalChallenges) * 100;
          state.stats.advancedStats.accuracy =
            ((state.stats.advancedStats.correctRunning +
              state.stats.advancedStats.correctTrue) /
              (state.stats.advancedStats.attempts * 2)) *
            100;
          state.stats.netProfit =
            state.stats.totalEarnings - state.stats.totalLosses;

          state.lastResult = {
            correct: bothCorrect,
            reward,
          };

          let message = "";
          if (bothCorrect) {
            message = `Perfect! RC: ${actualRunningCount}, TC: ${actualTrueCount}. +$${reward}`;
          } else if (runningCorrect) {
            message = `Running count correct (${actualRunningCount}), but true count was ${actualTrueCount}. +$${reward}`;
          } else if (trueCorrect) {
            message = `True count correct (${actualTrueCount}), but running count was ${actualRunningCount}. -$${Math.abs(reward)}`;
          } else {
            message = `Incorrect. RC: ${actualRunningCount}, TC: ${actualTrueCount}. -$${Math.abs(reward)}`;
          }

          state.feedbackMessage = message;
          state.challengeActive = false;
        }),

      // Utilities
      resetShoe: () =>
        set((state) => {
          state.shoe = new Shoe(6, 0.75);
          state.dealtCards = [];
          state.runningCount = 0;
          state.currentHand = [];
          state.challengeActive = false;
          state.lastResult = null;
          state.feedbackMessage = null;
        }),

      resetSession: () =>
        set((state) => {
          state.practiceBalance = 1000;
          state.stats = initialStats;
          state.shoe = new Shoe(6, 0.75);
          state.dealtCards = [];
          state.runningCount = 0;
          state.currentHand = [];
          state.challengeActive = false;
          state.lastResult = null;
          state.feedbackMessage = null;
        }),

      clearFeedback: () =>
        set((state) => {
          state.feedbackMessage = null;
          state.lastResult = null;
        }),

      cashOut: () => {
        const balance = get().practiceBalance;
        const profit = balance - 1000; // Initial balance was $1000

        if (profit > 0) {
          set((state) => {
            state.practiceBalance = 1000; // Reset to starting balance
          });
          return profit;
        }

        return 0;
      },
    })),
    {
      name: "count-trainer-storage",
      partialize: (state) => ({
        stats: state.stats,
        practiceBalance: state.practiceBalance,
      }),
    },
  ),
);

// Selectors
export const selectMode = (state: CountTrainerStore) => state.mode;
export const selectIsActive = (state: CountTrainerStore) => state.isActive;
export const selectPracticeBalance = (state: CountTrainerStore) =>
  state.practiceBalance;
export const selectStats = (state: CountTrainerStore) => state.stats;
export const selectChallengeActive = (state: CountTrainerStore) =>
  state.challengeActive;
export const selectFeedback = (state: CountTrainerStore) =>
  state.feedbackMessage;
export const selectLastResult = (state: CountTrainerStore) => state.lastResult;
