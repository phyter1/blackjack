import type { ActionType } from "@/modules/game/action";
import type { Game } from "@/modules/game/game";
import type { Player } from "@/modules/game/player";
import type { HiLoCounter } from "@/modules/strategy/hi-lo-counter";
import type { TrainerMode } from "@/modules/strategy/trainer";
import type { SerializedRound } from "@/stores/game";
import type { GameSettings } from "@/types/settings";
import type { GamePhase } from "../../table/types";

export interface BettingHandlerParams {
  game: Game;
  player: Player;
  bets: number[];
  isTrainerActive: boolean;
  practiceBalance: number;
  countingEnabled: boolean;
  cardCounter: HiLoCounter | null;
  trainer: TrainerMode | null;
  settings: GameSettings;
  setCurrentBalance: (balance: number) => void;
  setCurrentRound: (round: SerializedRound | undefined) => void;
  setCurrentActions: (actions: ActionType[]) => void;
  setRoundVersion: (updater: (v: number) => number) => void;
  setRoundsPlayed: (updater: (prev: number) => number) => void;
  setPhase: (phase: GamePhase) => void;
  clearTrainerFeedback: () => void;
}

/**
 * Handle placing bets and starting a new round
 */
export function handleBet(params: BettingHandlerParams): void {
  const {
    game,
    player,
    bets,
    isTrainerActive,
    practiceBalance,
    countingEnabled,
    cardCounter,
    trainer,
    settings,
    setCurrentBalance,
    setCurrentRound,
    setCurrentActions,
    setRoundVersion,
    setRoundsPlayed,
    setPhase,
    clearTrainerFeedback,
  } = params;

  try {
    // Create PlayerBet array - one entry per hand
    const playerBets = bets.map((amount) => ({
      playerId: player.id,
      amount,
    }));

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

    // Start the round - this will debit the bets from the player's bank
    game.startRound(playerBets);

    // Update the UI balance after bet is placed
    setCurrentBalance(player.bank.balance);

    // Update round state to show new cards
    const roundAfterBet = game.getCurrentRound();
    // Simply update the round and increment version to force re-render
    setCurrentRound(roundAfterBet);
    setCurrentActions(game.getAvailableActions() ?? []);
    // Use roundVersion to trigger re-render
    // This is the key - incrementing version will cause useEffect in components to fire
    setRoundVersion((v) => v + 1);

    setRoundsPlayed((prev) => prev + 1);
    setPhase("dealing");

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
      clearTrainerFeedback();
    }

    // Calculate total dealing time based on the number of cards and dealing speed
    // Typically 2 cards for dealer + 2 cards per player hand
    const round = game.getCurrentRound();
    let totalCards = 2; // Dealer gets 2 cards
    if (round) {
      totalCards += round.playerHands.length * 2; // Each hand gets 2 cards initially
    }

    // Calculate wait time: max card index * dealing speed + buffer time for animation
    const dealingTime = settings.animations.enableAnimations
      ? Math.max(totalCards * settings.animations.dealingSpeed, 1000) + 300 // Add 300ms buffer
      : 100; // Minimal delay if animations are disabled

    // After dealing animation, check for insurance or proceed to playing
    setTimeout(() => {
      const round = game.getCurrentRound();
      if (round?.state === "insurance") {
        setPhase("insurance");
      } else if (round?.state === "player_turn") {
        setPhase("playing");
      } else {
        setPhase("settling");
      }
    }, dealingTime);
  } catch (error) {
    console.error("Failed to start round:", error);
  }
}
