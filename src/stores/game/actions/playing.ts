import type { ActionType } from "@/modules/game/action";
import type { GameStore } from "../types";

export function createPlayingActions(set: any, get: () => GameStore) {
  return {
    playAction: async (action: ActionType) => {
      const state = get();
      const { game, player, decisionTracker, cardCounter, countingEnabled } =
        state;

      if (!game || !player) {
        throw new Error("Game not initialized");
      }

      const round = game.getCurrentRound();
      if (!round) {
        throw new Error("No active round");
      }

      try {
        // Get trainer store
        const { useTrainerStore } = await import("../../trainer");
        const trainerState = useTrainerStore.getState();
        const isTrainerActive = trainerState.isActive;
        const trainer = trainerState.trainer;

        const availableActions = game.getAvailableActions() ?? [];

        // Record the decision for strategy analysis
        if (round.state === "player_turn") {
          const currentHand = round.playerHands[round.currentHandIndex];
          if (currentHand && decisionTracker) {
            const dealerUpCard = round.dealerHand.upCard;

            // Determine what actions are available
            const canDouble = availableActions.includes("double");
            const canSplit = availableActions.includes("split");
            const canSurrender = availableActions.includes("surrender");

            // Get basic strategy recommendation
            const { getBasicStrategyDecision } = await import(
              "@/modules/strategy/basic-strategy"
            );
            const optimalDecision = getBasicStrategyDecision(
              currentHand.cards,
              currentHand.handValue,
              dealerUpCard,
              canDouble,
              canSplit,
              canSurrender,
            );

            // Get count snapshot if counting is enabled
            const countSnapshot =
              countingEnabled && cardCounter
                ? cardCounter.getSnapshot()
                : undefined;

            // Record the decision
            decisionTracker.recordDecision(
              currentHand.cards,
              currentHand.handValue,
              dealerUpCard,
              currentHand.id,
              round.id,
              canDouble,
              canSplit,
              canSurrender,
              action,
              optimalDecision,
              currentHand.betAmount,
              countSnapshot,
            );

            // If trainer is active, evaluate the action
            if (isTrainerActive && trainer) {
              trainer.evaluateAction(
                currentHand.cards,
                currentHand.handValue,
                dealerUpCard,
                canDouble,
                canSplit,
                canSurrender,
                action,
                currentHand.id,
                round.id,
                currentHand.betAmount,
              );
              trainerState.refreshStats();
            }
          }
        }

        // Track cards before action
        const currentRound = game.getCurrentRound();
        const cardsBefore = currentRound
          ? currentRound.playerHands.reduce((sum, h) => sum + h.cards.length, 0)
          : 0;

        // Play the action
        game.playAction(action);

        // Update balance after action (in case of double down which debits more money)
        set((state: GameStore) => {
          state.currentBalance = player.bank.balance;
        });

        // Track any new cards dealt (from hit, split, double)
        if (cardCounter && countingEnabled) {
          const round = game.getCurrentRound();
          if (round) {
            const cardsAfter = round.playerHands.reduce(
              (sum, h) => sum + h.cards.length,
              0,
            );
            if (cardsAfter > cardsBefore) {
              // New cards were dealt, collect all cards and add the new ones
              const allCurrentCards = round.playerHands.flatMap((h) => h.cards);
              const newCards = allCurrentCards.slice(cardsBefore);
              cardCounter.addCards(newCards);
            }
          }
        }

        // Update state from game
        get().updateFromGame();

        // Increment roundVersion to force re-render of components watching this value
        set((state: GameStore) => {
          state.roundVersion = (state.roundVersion || 0) + 1;
        });

        const newRound = game.getCurrentRound();
        const newActions = game.getAvailableActions() ?? [];

        // Check if we're still in player turn with actions available
        if (newActions.length > 0 && newRound?.state === "player_turn") {
          // Still in player turn, don't proceed to dealer turn
          return;
        }

        // No more actions, move to dealer turn
        set((state: GameStore) => {
          state.phase = "dealer_turn";
        });

        // Track dealer's hole card and any dealer hits
        if (cardCounter && countingEnabled) {
          const round = game.getCurrentRound();
          if (round) {
            const dealerCards = round.dealerHand.cards;
            // Add hole card (second card, index 1) if it exists
            if (dealerCards.length >= 2 && dealerCards[1]) {
              cardCounter.addCard(dealerCards[1]);
            }
            // Add any additional dealer cards beyond the initial 2
            if (dealerCards.length > 2) {
              cardCounter.addCards(dealerCards.slice(2));
            }
          }
        }

        // Wait before settling
        await new Promise((resolve) => setTimeout(resolve, 1500));

        set((state: GameStore) => {
          state.phase = "settling";
        });
      } catch (error) {
        console.error("Error playing action:", error);
        throw error;
      }
    },
  };
}
