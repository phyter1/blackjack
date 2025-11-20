import type { House } from "./bank";
import type { DealerHand } from "./dealer-hand";
import type { Hand } from "./hand";
import type { CompleteRuleSet } from "./rules/index";

export type HandOutcome =
  | "blackjack" // Player natural blackjack (pays 3:2 or 6:5)
  | "win" // Player wins (pays 1:1)
  | "push" // Tie, bet returned
  | "lose" // Player loses, bet kept by house
  | "surrender" // Player surrendered, half bet returned
  | "charlie"; // Player hit charlie rule (5+ cards without busting)

export type SettlementResult = {
  outcome: HandOutcome;
  payout: number; // Amount returned to player (includes original bet if win/push)
  profit: number; // Net profit/loss for player (negative = loss)
  playerHandValue: number;
  dealerHandValue: number;
};

/**
 * Compare a player hand against the dealer hand to determine the winner
 */
export function compareHands(
  playerHand: Hand,
  dealerHand: DealerHand,
): "player" | "dealer" | "push" {
  const playerValue = playerHand.handValue;
  const dealerValue = dealerHand.handValue;

  // If player busted, dealer wins
  if (playerValue > 21) {
    return "dealer";
  }

  // If dealer busted, player wins (if player didn't bust)
  if (dealerValue > 21) {
    return "player";
  }

  // Neither busted, compare values
  if (playerValue > dealerValue) {
    return "player";
  } else if (playerValue < dealerValue) {
    return "dealer";
  } else {
    return "push";
  }
}

/**
 * Determine the outcome of a hand including special cases
 */
export function determineOutcome(
  playerHand: Hand,
  dealerHand: DealerHand,
  rules: CompleteRuleSet,
): HandOutcome {
  const playerValue = playerHand.handValue;
  const dealerValue = dealerHand.handValue;
  const playerCards = playerHand.cards;
  const dealerCards = dealerHand.cards;

  // Check if player surrendered
  if (playerHand.state === "surrendered") {
    return "surrender";
  }

  // Check if player busted
  if (playerValue > 21) {
    return "lose";
  }

  // Check for Charlie rule (5+ cards without busting)
  if (rules.charlie.cards && playerCards.length >= rules.charlie.cards) {
    // Charlie rule applies - player wins automatically
    return "charlie";
  }

  // Check for player blackjack (21 with 2 cards, not from split)
  const isPlayerBlackjack =
    playerValue === 21 && playerCards.length === 2 && !playerHand.isSplit;

  // Check for dealer blackjack
  const isDealerBlackjack = dealerValue === 21 && dealerCards.length === 2;

  if (isPlayerBlackjack && isDealerBlackjack) {
    // Both have blackjack - check blackjack tie rule
    return rules.blackjackTie.outcome === "push"
      ? "push"
      : rules.blackjackTie.outcome === "win"
        ? "blackjack"
        : "lose";
  }

  if (isPlayerBlackjack) {
    // Player has blackjack, dealer doesn't
    return "blackjack";
  }

  if (isDealerBlackjack) {
    // Dealer has blackjack, player doesn't
    return "lose";
  }

  // Check for dealer 22 push rule
  if (rules.dealer22Push.enabled && dealerValue === 22) {
    return "push";
  }

  // Regular comparison
  const comparison = compareHands(playerHand, dealerHand);

  if (comparison === "player") {
    return "win";
  } else if (comparison === "dealer") {
    return "lose";
  } else {
    return "push";
  }
}

/**
 * Calculate the payout amount based on outcome and rules
 * @returns The total amount to return to player (includes original bet for wins/pushes)
 */
export function calculatePayout(
  betAmount: number,
  outcome: HandOutcome,
  rules: CompleteRuleSet,
): number {
  switch (outcome) {
    case "blackjack":
      // Blackjack pays based on rules (typically 3:2 or 6:5) plus original bet
      return betAmount + rules.blackjackPayout.function(betAmount);

    case "charlie":
      // Charlie typically pays same as regular win (1:1) plus original bet
      // Some variations pay 2:1, but we'll use 1:1 as standard
      return betAmount + betAmount;

    case "win":
      // Regular win pays 1:1 plus original bet
      return betAmount + betAmount;

    case "push":
      // Push returns original bet only
      return betAmount;

    case "surrender":
      // Surrender returns half the bet
      return betAmount / 2;

    case "lose":
      // Lose returns nothing
      return 0;

    default:
      return 0;
  }
}

/**
 * Calculate the net profit/loss for the player
 * @returns Positive = profit, Negative = loss, Zero = push
 */
export function calculateProfit(betAmount: number, payout: number): number {
  return payout - betAmount;
}

/**
 * Settle a single hand - transfer money between player bank and house
 *
 * Note: When a hand is created, the bet is already debited from the player's bank.
 * Settlement handles returning money to player or collecting it for the house.
 */
export function settleHand(
  hand: Hand,
  dealerHand: DealerHand,
  house: House,
  rules: CompleteRuleSet,
): SettlementResult {
  // Determine outcome
  const outcome = determineOutcome(hand, dealerHand, rules);

  // Get the bet amount from the hand
  const betAmount = hand.betAmount;

  // Calculate payout
  const payout = calculatePayout(betAmount, outcome, rules);

  // Calculate profit (negative means loss)
  const profit = calculateProfit(betAmount, payout);

  // Transfer money based on outcome
  // Remember: bet was already debited from player's bank when hand was created
  if (outcome === "lose") {
    // Player loses - house collects the bet
    house.credit(betAmount, hand.id);
    house.profitLoss += betAmount;
  } else if (outcome === "push") {
    // Push - return original bet to player
    hand.bank.credit(betAmount, "house");
  } else {
    // Win/Blackjack/Charlie - return bet + winnings to player
    hand.bank.credit(payout, "house");
    // House pays out the winnings (payout includes original bet)
    house.debit(payout, hand.id);
    house.profitLoss -= profit;
  }

  return {
    outcome,
    payout,
    profit,
    playerHandValue: hand.handValue,
    dealerHandValue: dealerHand.handValue,
  };
}

/**
 * Settle multiple hands (for a complete round)
 */
export function settleRound(
  playerHands: Hand[],
  dealerHand: DealerHand,
  house: House,
  rules: CompleteRuleSet,
): SettlementResult[] {
  return playerHands.map((hand) => settleHand(hand, dealerHand, house, rules));
}
