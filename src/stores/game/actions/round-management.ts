import type { UserBank } from "@/types/user";
import type { GameStore } from "../types";

export function createRoundManagementActions(set: any, get: () => GameStore) {
  return {
    handleInsuranceAction: (takeInsurance: boolean) => {
      const state = get();
      const { game, handsPendingInsurance, insuranceHandIndex } = state;

      if (!game) return;

      if (takeInsurance) {
        game.takeInsurance(insuranceHandIndex);
      } else {
        game.declineInsurance(insuranceHandIndex);
      }

      // Check if there are more hands needing insurance
      const remainingHands = handsPendingInsurance.filter(
        (i) => i !== insuranceHandIndex,
      );

      if (remainingHands.length > 0) {
        set((state: GameStore) => {
          state.insuranceHandIndex = remainingHands[0];
          state.handsPendingInsurance = remainingHands;
        });
      } else {
        // All hands processed, resolve insurance
        game.resolveInsurance();

        // Check round state after insurance resolution
        const round = game.getCurrentRound();
        if (round?.state === "settling" || round?.state === "complete") {
          // Dealer has blackjack - go to settling
          setTimeout(() => {
            set((state: GameStore) => {
              state.phase = "settling";
            });
            get().updateFromGame();
          }, 500);
        } else {
          set((state: GameStore) => {
            state.phase = "playing";
          });
          get().updateFromGame();
        }
      }
    },

    handleNextRound: () => {
      const state = get();
      const { game, player } = state;

      if (!game || !player) return;

      // Check actual player balance
      if (player.bank.balance < 10) {
        // End game if out of money
        const { useAppStore } = require("../../app");
        const userId = useAppStore.getState().user?.id;
        const onGameEnd = useAppStore.getState().handleGameEnd;
        if (userId && onGameEnd) {
          get().handleEndGame(userId, onGameEnd);
        }
        return;
      }

      // Track total wagered from this round before completing it
      const round = game.getCurrentRound();
      if (round) {
        const roundWagered = round.playerHands.reduce(
          (sum, hand) => sum + hand.betAmount,
          0,
        );
        set((state: GameStore) => {
          state.totalWagered += roundWagered;
        });
      }

      try {
        game.completeRound();

        set((state: GameStore) => {
          state.phase = "betting";
          state.currentRound = undefined;
          state.currentActions = [];
          state.handsPendingInsurance = [];
          state.insuranceHandIndex = 0;
        });

        get().updateFromGame();
      } catch (error) {
        console.error("Error starting next round:", error);
      }
    },

    handleEndGame: (_userId: string, onGameEnd: (bank: UserBank) => void) => {
      const state = get();
      const {
        game,
        sessionId,
        roundsPlayed,
        totalWagered,
        decisionTracker,
        originalBalance,
      } = state;

      if (!game || !sessionId) return;

      try {
        // End the game session
        game.endSession();

        // Calculate strategy analysis if we tracked decisions
        let strategyAnalysis: {
          grade: string;
          accuracy: number;
          totalDecisions: number;
          correctDecisions: number;
          decisions: unknown[];
          hasCountData: boolean;
        } | null = null;

        if (decisionTracker) {
          const analysis = decisionTracker.calculateAnalysis();
          strategyAnalysis = {
            grade: analysis.grade,
            accuracy: analysis.accuracyPercentage,
            totalDecisions: analysis.totalDecisions,
            correctDecisions: analysis.correctDecisions,
            decisions: analysis.decisions,
            hasCountData: analysis.hasCountData,
          };
        }

        // Get final balance
        const player = game.getPlayer(game.getAllPlayers()[0].id);
        const finalBalance = player?.bank.balance || originalBalance;

        // End session and pass analysis
        const { UserService } = require("@/services/user-service");
        UserService.endSession(
          sessionId,
          roundsPlayed,
          finalBalance,
          game.getSessionId(),
          strategyAnalysis,
          totalWagered,
        );

        // Get updated bank
        const updatedBank = UserService.getCurrentUser()?.bank;

        // Cleanup subscription
        if (state.unsubscribe) {
          state.unsubscribe();
        }

        // Call the callback
        if (updatedBank) {
          onGameEnd(updatedBank);
        }
      } catch (error) {
        console.error("Error ending game:", error);
      }
    },
  };
}
