import type { ActionType } from "../../game/action";
import type { Card } from "../../game/cards";
import {
  type BasicStrategyDecision,
  getBasicStrategyDecision,
} from "../basic-strategy";
import type { ActionFeedback } from "./types";

/**
 * Get the optimal action for current situation
 */
export function getOptimalAction(
  playerCards: Card[],
  playerHandValue: number,
  dealerUpCard: Card,
  canDouble: boolean,
  canSplit: boolean,
  canSurrender: boolean,
): BasicStrategyDecision {
  return getBasicStrategyDecision(
    playerCards,
    playerHandValue,
    dealerUpCard,
    canDouble,
    canSplit,
    canSurrender,
  );
}

/**
 * Evaluate a player's action against basic strategy
 */
export function evaluateAction(
  playerCards: Card[],
  playerHandValue: number,
  dealerUpCard: Card,
  canDouble: boolean,
  canSplit: boolean,
  canSurrender: boolean,
  playerAction: ActionType,
): ActionFeedback {
  const optimal = getOptimalAction(
    playerCards,
    playerHandValue,
    dealerUpCard,
    canDouble,
    canSplit,
    canSurrender,
  );

  const wasCorrect = playerAction === optimal.action;

  let explanation: string;
  let severity: "success" | "warning" | "error";

  if (wasCorrect) {
    explanation = `Correct! ${optimal.reason}`;
    severity = "success";
  } else {
    explanation = `Incorrect. You chose ${playerAction}, but optimal play is ${optimal.action}. ${optimal.reason}`;
    severity = "error";
  }

  return {
    wasCorrect,
    playerAction,
    optimalAction: optimal.action,
    optimalReason: optimal.reason,
    explanation,
    severity,
  };
}
