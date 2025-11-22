import type { GamePhase } from "@/components/table/types";
import type { GameStore } from "../types";

export function createStateUpdateActions(
  set: any,
  get: () => GameStore,
) {
  return {
    setPhase: (phase: GamePhase) =>
      set((state: GameStore) => {
        state.phase = phase;
      }),

    setCountingEnabled: (enabled: boolean) =>
      set((state: GameStore) => {
        state.countingEnabled = enabled;
      }),

    setShowCount: (show: boolean) =>
      set((state: GameStore) => {
        state.showCount = show;
      }),

    updateFromGame: () => {
      const state = get();
      const { game, player, phase } = state;

      if (!game || !player) return;

      const round = game.getCurrentRound();

      set((state: GameStore) => {
        // Serialize round data to plain objects for React
        if (round) {
          state.currentRound = {
            ...round,
            playerHands: round.playerHands.map((hand) => hand.toObject()),
          };
        } else {
          state.currentRound = undefined;
        }
        state.currentActions = game.getAvailableActions();
        state.shoeDetails = game.getShoeDetails();
        state.currentBalance = player.bank.balance;
      });

      // Update settlement outcomes if we're in settling phase
      if (phase === "settling") {
        get().updateSettlementOutcomes();
      }
    },

    updateSettlementOutcomes: () => {
      const state = get();
      const { game, player, decisionTracker } = state;

      if (!game || !player || !decisionTracker) return;

      const round = game.getCurrentRound();
      if (!round?.settlementResults) return;

      // Get trainer store
      const { useTrainerStore } = require("../../trainer");
      const trainerState = useTrainerStore.getState();
      const isTrainerActive = trainerState.isActive;
      const trainer = trainerState.trainer;

      // Update each hand's outcome in the decision tracker
      round.settlementResults.forEach((result, handIndex) => {
        const hand = round.playerHands[handIndex];
        if (hand) {
          decisionTracker.updateHandOutcome(
            hand.id,
            result.outcome,
            result.payout,
            result.profit,
          );

          // If trainer is active, update practice balance instead of real balance
          if (isTrainerActive && trainer) {
            trainer.updateHandOutcome(
              hand.id,
              result.outcome,
              result.payout,
              result.profit,
            );
          }
        }
      });

      // Refresh trainer stats after settlement
      if (isTrainerActive && trainer && player) {
        trainerState.refreshStats();

        // In trainer mode, restore the original balance to prevent
        // the real bank from being modified
        // We need to undo all the game's bank modifications
        const round = game.getCurrentRound();
        if (round) {
          // Calculate total bet for this round
          const totalBet = round.playerHands.reduce(
            (sum, hand) => sum + hand.betAmount,
            0,
          );
          // Calculate total payout from settlement
          const totalPayout =
            round.settlementResults?.reduce(
              (sum, result) => sum + result.payout,
              0,
            ) || 0;

          // Reverse the game's bank operations:
          // The game debited totalBet and credited totalPayout
          // We need to undo this: debit payout, credit bet back
          if (totalPayout > 0) {
            player.bank.debit(totalPayout, "trainer-reversal");
          }
          if (totalBet > 0) {
            player.bank.credit(totalBet, "trainer-reversal");
          }
        }
      }

      // Update UI balance after settlement
      set((state: GameStore) => {
        state.currentBalance = player.bank.balance;
      });
    },

    updateInsuranceState: () => {
      const state = get();
      const { game, phase } = state;

      if (phase === "insurance" && game) {
        const round = game.getCurrentRound();
        if (round) {
          const pendingHands = round.playerHands
            .map((hand, index) => ({ hand, index }))
            .filter(({ hand }) => hand.insuranceOffered && !hand.hasInsurance)
            .map(({ index }) => index);

          set((state: GameStore) => {
            state.handsPendingInsurance = pendingHands;
            if (pendingHands.length > 0) {
              state.insuranceHandIndex = pendingHands[0];
            }
          });
        }
      }
    },
  };
}
