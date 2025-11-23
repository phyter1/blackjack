/**
 * Calculates the proper dealing sequence for blackjack cards.
 *
 * Real casino dealing order:
 * Round 1: Player hands right-to-left, then dealer up card (cards[0])
 * Round 2: Player hands right-to-left, then dealer hole card (cards[1], face down)
 *
 * NOTE: In the game engine, DealerHand.upCard returns cards[0], so:
 * - cards[0] = up card (visible)
 * - cards[1] = hole card (hidden during dealing/playing/insurance)
 *
 * @param numHands - Number of player hands
 * @returns Array of card positions in dealing order with timing information
 */

export interface CardPosition {
  type: "player" | "dealer";
  handIndex?: number; // For player hands (0 = rightmost hand)
  cardIndex: 0 | 1; // 0 = first card, 1 = second card
  dealOrder: number; // Overall position in dealing sequence
  isHidden: boolean; // Whether card should be face down
}

export function calculateDealingSequence(numHands: number): CardPosition[] {
  const sequence: CardPosition[] = [];
  let dealOrder = 0;

  // Round 1: Deal first card to each player hand (right to left), then dealer's up card
  for (let handIdx = numHands - 1; handIdx >= 0; handIdx--) {
    sequence.push({
      type: "player",
      handIndex: handIdx,
      cardIndex: 0,
      dealOrder: dealOrder++,
      isHidden: false,
    });
  }

  // Dealer's first card (up card - cards[0], visible)
  sequence.push({
    type: "dealer",
    cardIndex: 0,
    dealOrder: dealOrder++,
    isHidden: false,
  });

  // Round 2: Deal second card to each player hand (right to left), then dealer's hole card
  for (let handIdx = numHands - 1; handIdx >= 0; handIdx--) {
    sequence.push({
      type: "player",
      handIndex: handIdx,
      cardIndex: 1,
      dealOrder: dealOrder++,
      isHidden: false,
    });
  }

  // Dealer's second card (hole card - cards[1], face down)
  sequence.push({
    type: "dealer",
    cardIndex: 1,
    dealOrder: dealOrder++,
    isHidden: true,
  });

  return sequence;
}

/**
 * Gets the deal order for a specific card
 */
export function getCardDealOrder(
  type: "player" | "dealer",
  cardIndex: number,
  numHands: number,
  handIndex?: number,
): number {
  const sequence = calculateDealingSequence(numHands);

  const position = sequence.find((pos) => {
    if (type === "dealer") {
      return pos.type === "dealer" && pos.cardIndex === cardIndex;
    }
    return (
      pos.type === "player" &&
      pos.handIndex === handIndex &&
      pos.cardIndex === cardIndex
    );
  });

  return position?.dealOrder ?? 0;
}
