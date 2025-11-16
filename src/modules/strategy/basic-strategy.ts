import type { ActionType } from "../game/action";
import type { Card } from "../game/card";

/**
 * Basic Strategy Engine for Blackjack
 *
 * This implements the mathematically optimal strategy for standard blackjack.
 * Based on the player's hand total, dealer's up card, and whether the hand is soft/pair.
 */

export type BasicStrategyDecision = {
  action: ActionType;
  reason: string;
};

/**
 * Determine if a hand is a pair (two cards with same rank)
 */
function isPair(cards: Card[]): boolean {
  if (cards.length !== 2) return false;
  return cards[0].rank === cards[1].rank;
}

/**
 * Determine if a hand is soft (contains an Ace counted as 11)
 */
function isSoftHand(cards: Card[], handValue: number): boolean {
  const hasAce = cards.some((c) => c.rank === "A");
  if (!hasAce) return false;

  // Calculate hard total (all aces as 1)
  let hardTotal = 0;
  for (const card of cards) {
    if (card.rank === "A") {
      hardTotal += 1;
    } else if (["J", "Q", "K"].includes(card.rank)) {
      hardTotal += 10;
    } else {
      hardTotal += parseInt(card.rank);
    }
  }

  // If hand value is 11 more than hard total, we have a soft ace
  return handValue === hardTotal + 10;
}

/**
 * Get the numeric value of dealer's up card (1-11)
 */
function getDealerValue(dealerUpCard: Card): number {
  if (dealerUpCard.rank === "A") return 11;
  if (["J", "Q", "K"].includes(dealerUpCard.rank)) return 10;
  return parseInt(dealerUpCard.rank);
}

/**
 * Basic strategy for pairs
 */
function getPairStrategy(
  pairRank: string,
  dealerValue: number,
  canDouble: boolean,
  canSplit: boolean,
  canSurrender: boolean
): BasicStrategyDecision {
  const dealerCard = dealerValue;

  // Always split Aces and 8s
  if (pairRank === "A" && canSplit) {
    return { action: "split", reason: "Always split Aces" };
  }
  if (pairRank === "8" && canSplit) {
    return { action: "split", reason: "Always split 8s" };
  }

  // Never split 5s or 10s
  if (pairRank === "5" || pairRank === "10" || ["J", "Q", "K"].includes(pairRank)) {
    // Treat as hard 10 or 20
    return getHardStrategy(pairRank === "5" ? 10 : 20, dealerValue, canDouble, canSurrender);
  }

  // Split 9s against 2-9 except 7
  if (pairRank === "9" && canSplit) {
    if (dealerCard >= 2 && dealerCard <= 6) {
      return { action: "split", reason: "Split 9s vs dealer 2-6" };
    }
    if (dealerCard === 8 || dealerCard === 9) {
      return { action: "split", reason: "Split 9s vs dealer 8-9" };
    }
    return { action: "stand", reason: "Stand with pair of 9s vs dealer 7, 10, or A" };
  }

  // Split 7s against 2-7
  if (pairRank === "7" && canSplit && dealerCard >= 2 && dealerCard <= 7) {
    return { action: "split", reason: "Split 7s vs dealer 2-7" };
  }

  // Split 6s against 2-6
  if (pairRank === "6" && canSplit && dealerCard >= 2 && dealerCard <= 6) {
    return { action: "split", reason: "Split 6s vs dealer 2-6" };
  }

  // Split 4s against 5-6 only
  if (pairRank === "4" && canSplit && (dealerCard === 5 || dealerCard === 6)) {
    return { action: "split", reason: "Split 4s vs dealer 5-6" };
  }

  // Split 3s and 2s against 2-7
  if ((pairRank === "3" || pairRank === "2") && canSplit && dealerCard >= 2 && dealerCard <= 7) {
    return { action: "split", reason: `Split ${pairRank}s vs dealer 2-7` };
  }

  // Fall back to hard total strategy
  const hardValue = pairRank === "A" ? 12 : parseInt(pairRank) * 2;
  return getHardStrategy(hardValue, dealerValue, canDouble, canSurrender);
}

/**
 * Basic strategy for soft hands (hands with an Ace counted as 11)
 */
function getSoftStrategy(
  handValue: number,
  dealerValue: number,
  canDouble: boolean
): BasicStrategyDecision {
  const dealerCard = dealerValue;

  // Soft 19-21: Always stand
  if (handValue >= 19) {
    return { action: "stand", reason: `Always stand on soft ${handValue}` };
  }

  // Soft 18 (A,7)
  if (handValue === 18) {
    if (dealerCard >= 2 && dealerCard <= 6) {
      if (canDouble) {
        return { action: "double", reason: "Double soft 18 vs dealer 2-6" };
      }
      return { action: "stand", reason: "Stand soft 18 vs dealer 2-6" };
    }
    if (dealerCard === 7 || dealerCard === 8) {
      return { action: "stand", reason: "Stand soft 18 vs dealer 7-8" };
    }
    return { action: "hit", reason: "Hit soft 18 vs dealer 9, 10, or A" };
  }

  // Soft 17 (A,6)
  if (handValue === 17) {
    if (dealerCard >= 3 && dealerCard <= 6 && canDouble) {
      return { action: "double", reason: "Double soft 17 vs dealer 3-6" };
    }
    return { action: "hit", reason: "Hit soft 17" };
  }

  // Soft 15-16 (A,4-5)
  if (handValue === 15 || handValue === 16) {
    if (dealerCard >= 4 && dealerCard <= 6 && canDouble) {
      return { action: "double", reason: `Double soft ${handValue} vs dealer 4-6` };
    }
    return { action: "hit", reason: `Hit soft ${handValue}` };
  }

  // Soft 13-14 (A,2-3)
  if (handValue === 13 || handValue === 14) {
    if (dealerCard >= 5 && dealerCard <= 6 && canDouble) {
      return { action: "double", reason: `Double soft ${handValue} vs dealer 5-6` };
    }
    return { action: "hit", reason: `Hit soft ${handValue}` };
  }

  // Soft 12 or less: always hit
  return { action: "hit", reason: "Always hit soft hands 12 or less" };
}

/**
 * Basic strategy for hard hands
 */
function getHardStrategy(
  handValue: number,
  dealerValue: number,
  canDouble: boolean,
  canSurrender: boolean
): BasicStrategyDecision {
  const dealerCard = dealerValue;

  // Hard 17 or higher: always stand
  if (handValue >= 17) {
    return { action: "stand", reason: `Always stand on hard ${handValue}` };
  }

  // Hard 16
  if (handValue === 16) {
    // Surrender vs dealer 9, 10, or A
    if (canSurrender && dealerCard >= 9) {
      return { action: "surrender", reason: "Surrender hard 16 vs dealer 9, 10, or A" };
    }
    if (dealerCard >= 7) {
      return { action: "hit", reason: "Hit hard 16 vs dealer 7 or higher" };
    }
    return { action: "stand", reason: "Stand hard 16 vs dealer 2-6" };
  }

  // Hard 15
  if (handValue === 15) {
    // Surrender vs dealer 10
    if (canSurrender && dealerCard === 10) {
      return { action: "surrender", reason: "Surrender hard 15 vs dealer 10" };
    }
    if (dealerCard >= 7) {
      return { action: "hit", reason: "Hit hard 15 vs dealer 7 or higher" };
    }
    return { action: "stand", reason: "Stand hard 15 vs dealer 2-6" };
  }

  // Hard 13-14
  if (handValue === 13 || handValue === 14) {
    if (dealerCard >= 7) {
      return { action: "hit", reason: `Hit hard ${handValue} vs dealer 7 or higher` };
    }
    return { action: "stand", reason: `Stand hard ${handValue} vs dealer 2-6` };
  }

  // Hard 12
  if (handValue === 12) {
    if (dealerCard >= 4 && dealerCard <= 6) {
      return { action: "stand", reason: "Stand hard 12 vs dealer 4-6" };
    }
    return { action: "hit", reason: "Hit hard 12 vs dealer 2-3 or 7+" };
  }

  // Hard 11
  if (handValue === 11) {
    if (canDouble) {
      return { action: "double", reason: "Always double hard 11" };
    }
    return { action: "hit", reason: "Hit hard 11 (cannot double)" };
  }

  // Hard 10
  if (handValue === 10) {
    if (canDouble && dealerCard <= 9) {
      return { action: "double", reason: "Double hard 10 vs dealer 2-9" };
    }
    return { action: "hit", reason: dealerCard >= 10 ? "Hit hard 10 vs dealer 10 or A" : "Hit hard 10 (cannot double)" };
  }

  // Hard 9
  if (handValue === 9) {
    if (canDouble && dealerCard >= 3 && dealerCard <= 6) {
      return { action: "double", reason: "Double hard 9 vs dealer 3-6" };
    }
    return { action: "hit", reason: "Hit hard 9" };
  }

  // Hard 8 or less: always hit
  return { action: "hit", reason: `Always hit hard ${handValue}` };
}

/**
 * Get the basic strategy recommendation for a given situation
 */
export function getBasicStrategyDecision(
  playerCards: Card[],
  playerHandValue: number,
  dealerUpCard: Card,
  canDouble: boolean,
  canSplit: boolean,
  canSurrender: boolean
): BasicStrategyDecision {
  const dealerValue = getDealerValue(dealerUpCard);

  // Check for pair first
  if (isPair(playerCards)) {
    return getPairStrategy(
      playerCards[0].rank,
      dealerValue,
      canDouble,
      canSplit,
      canSurrender
    );
  }

  // Check for soft hand
  if (isSoftHand(playerCards, playerHandValue)) {
    return getSoftStrategy(playerHandValue, dealerValue, canDouble);
  }

  // Hard hand
  return getHardStrategy(playerHandValue, dealerValue, canDouble, canSurrender);
}
