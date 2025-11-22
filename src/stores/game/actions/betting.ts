import type { GameStore } from "../types";

export function createBettingActions(
  set: any,
  get: () => GameStore,
) {
  return {
    placeBets: async (bets: number[]) => {
      const state = get();
      const { game, player, cardCounter, countingEnabled } = state;

      if (!game || !player) {
        throw new Error("Game not initialized");
      }

      try {
        // Get trainer store for practice balance handling
        const { useTrainerStore } = await import("../../trainer");
        const trainerState = useTrainerStore.getState();
        const isTrainerActive = trainerState.isActive;
        const practiceBalance = trainerState.practiceBalance;
        const trainer = trainerState.trainer;

        // In trainer mode, we'll track virtual balance separately
        if (isTrainerActive && trainer) {
          const totalBet = bets.reduce((sum, bet) => sum + bet, 0);
          if (totalBet > practiceBalance) {
            console.error(
              `Insufficient practice balance. Bet: ${totalBet}, Balance: ${practiceBalance}`,
            );
            return;
          }
          // Debit the bet from practice balance
          trainer.adjustPracticeBalance(-totalBet);
        }

        // Create PlayerBet array
        const playerBets = bets.map((amount) => ({
          playerId: player.id,
          amount,
        }));

        // Start the round - this will debit the bets from the player's bank
        game.startRound(playerBets);

        // Update state
        set((state: GameStore) => {
          state.currentBalance = player.bank.balance;
          state.roundsPlayed += 1;
          state.phase = "dealing";
        });

        // Update round state
        get().updateFromGame();

        // Track dealt cards in the counter
        if (cardCounter && countingEnabled) {
          const round = game.getCurrentRound();
          if (round) {
            // Add all player cards
            for (const hand of round.playerHands) {
              cardCounter.addCards(hand.cards);
            }
            // Add dealer's up card
            if (round.dealerHand.upCard) {
              cardCounter.addCard(round.dealerHand.upCard);
            }
          }
        }

        // Track cards in trainer if active
        if (isTrainerActive && trainer) {
          const round = game.getCurrentRound();
          if (round) {
            // Process all dealt cards for counting
            for (const hand of round.playerHands) {
              trainer.processCardsDealt(hand.cards);
            }
            if (round.dealerHand.upCard) {
              trainer.processCardsDealt([round.dealerHand.upCard]);
            }
          }
          // Clear feedback from previous round
          trainerState.clearFeedback();
        }

        // Get settings for animation delay
        const { useSettingsStore } = await import("../../settings");
        const settings = useSettingsStore.getState().settings;

        // Calculate total dealing time based on the number of cards and dealing speed
        const round = game.getCurrentRound();
        let totalCards = 2; // Dealer gets 2 cards
        if (round) {
          totalCards += round.playerHands.length * 2; // Each hand gets 2 cards initially
        }

        // Calculate wait time: max card index * dealing speed + buffer time for animation
        const dealingTime = settings.animations.enableAnimations
          ? Math.max(totalCards * settings.animations.dealingSpeed, 1000) + 300 // Add 300ms buffer
          : 100; // Minimal delay if animations are disabled

        // Wait for dealing animation
        await new Promise((resolve) => setTimeout(resolve, dealingTime));

        // After dealing animation, check for insurance or proceed to playing
        const roundAfterDealing = game.getCurrentRound();
        if (roundAfterDealing?.state === "insurance") {
          set((state: GameStore) => {
            state.phase = "insurance";
          });
          get().updateInsuranceState();
        } else if (roundAfterDealing?.state === "player_turn") {
          set((state: GameStore) => {
            state.phase = "playing";
          });
        } else {
          set((state: GameStore) => {
            state.phase = "settling";
          });
        }
      } catch (error) {
        console.error("Error placing bets:", error);
        throw error;
      }
    },
  };
}
