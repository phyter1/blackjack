import type { ActionType } from "@/modules/game/action";
import type { Game } from "@/modules/game/game";
import type { Player } from "@/modules/game/player";
import { getBasicStrategyDecision } from "@/modules/strategy/basic-strategy";
import type { DecisionTracker } from "@/modules/strategy/decision-tracker";
import type { HiLoCounter } from "@/modules/strategy/hi-lo-counter";
import type { TrainerMode } from "@/modules/strategy/trainer";
import type { GamePhase } from "../../table/types";

export interface ActionHandlerParams {
  game: Game;
  player: Player;
  action: ActionType;
  decisionTracker: DecisionTracker | null;
  countingEnabled: boolean;
  cardCounter: HiLoCounter | null;
  isTrainerActive: boolean;
  trainer: TrainerMode | null;
  setCurrentBalance: (balance: number) => void;
  setCurrentRound: (round: any) => void;
  setCurrentActions: (actions: any[]) => void;
  setRoundVersion: (updater: (v: number) => number) => void;
  setPhase: (phase: GamePhase) => void;
  refreshTrainerStats: () => void;
}

/**
 * Handle player actions (hit, stand, double, split, etc.)
 */
export function handleAction(params: ActionHandlerParams): void {
  const {
    game,
    player,
    action,
    decisionTracker,
    countingEnabled,
    cardCounter,
    isTrainerActive,
    trainer,
    setCurrentBalance,
    setCurrentRound,
    setCurrentActions,
    setRoundVersion,
    setPhase,
    refreshTrainerStats,
  } = params;

  try {
    const round = game.getCurrentRound();
    const availableActions = game.getAvailableActions() ?? [];

    // Record the decision for strategy analysis
    if (round && round.state === "player_turn") {
      const currentHand = round.playerHands[round.currentHandIndex];
      if (currentHand && decisionTracker) {
        const dealerUpCard = round.dealerHand.upCard;

        // Determine what actions are available
        const canDouble = availableActions.includes("double");
        const canSplit = availableActions.includes("split");
        const canSurrender = availableActions.includes("surrender");

        // Get basic strategy recommendation
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
          refreshTrainerStats();
        }
      }
    }

    // Track cards before action
    const currentRound = game.getCurrentRound();
    const cardsBefore = currentRound
      ? currentRound.playerHands.reduce((sum, h) => sum + h.cards.length, 0)
      : 0;

    game.playAction(action);

    // Update balance after action (in case of double down which debits more money)
    setCurrentBalance(player.bank.balance);

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

    const newRound = game.getCurrentRound();
    const newActions = game.getAvailableActions() ?? [];

    // Update round state to show new cards immediately
    // Create a deep clone of the round to force React to see the changes
    if (newRound) {
      // Deep clone the round object to force React to see the changes
      // We need to preserve ALL properties including betAmount, handValue, etc.
      const clonedRound = {
        ...newRound,
        playerHands: newRound.playerHands.map((hand: any) => ({
          ...hand,
          cards: [...hand.cards], // Create new array reference for cards
          betAmount: hand.betAmount,
          handValue: hand.handValue,
          hardValue: hand.hardValue,
          isSoft: hand.isSoft,
          state: hand.state,
          id: hand.id,
          playerId: hand.playerId,
          canSplit: hand.canSplit,
          isDoubled: hand.isDoubled,
          isSplit: hand.isSplit,
        })),
        dealerHand: {
          ...newRound.dealerHand,
          cards: [...newRound.dealerHand.cards],
          handValue: newRound.dealerHand.handValue,
          hardValue: (newRound.dealerHand as any).hardValue,
          isSoft: newRound.dealerHand.isSoft,
          upCard: newRound.dealerHand.upCard,
        },
        // Preserve other round properties
        state: newRound.state,
        id: newRound.id,
        currentHandIndex: newRound.currentHandIndex,
      };
      setCurrentRound(clonedRound as any);
    } else {
      setCurrentRound(newRound);
    }
    setCurrentActions(newActions);
    // Use roundVersion to trigger re-render
    // This is the key - incrementing version will cause useEffect in components to fire
    setRoundVersion((v) => v + 1);

    // Check if we're still in player turn with actions available
    if (newActions.length > 0 && newRound?.state === "player_turn") {
      // Still playing
      return;
    }

    // No more actions, move to dealer turn
    setPhase("dealer_turn");

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

    setTimeout(() => {
      setPhase("settling");
    }, 1500);
  } catch (error) {
    console.error("Failed to play action:", error);
  }
}
