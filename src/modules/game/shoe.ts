import { type Card, newDeck, type Stack } from "./cards";
import {
  cutStackAtPenetration,
  riffleShuffleStack,
  shuffleShoe,
} from "./shuffle";

export type ShoeDeck = {
  stack: Stack;
  penetration: number; // percentage of shoe used before reshuffle (0-100), ie where is the cut card
  cutPosition?: number;
};

export const newShoeStack = (
  numDecks: number,
  penetration: number = 1 / 10,
  testStack?: Stack,
): ShoeDeck => {
  // If a test stack is provided, use it directly (for testing)
  if (testStack) {
    return {
      stack: testStack,
      penetration,
      cutPosition: 0,
    };
  }

  // Normal shuffling logic
  let shoe: Stack = [];
  for (let i = 0; i < numDecks; i++) {
    shoe = shoe.concat(riffleShuffleStack(newDeck()));
  }
  const { stack: cards, cutPosition } = cutStackAtPenetration({
    stack: shuffleShoe(shoe),
    penetration: penetration * 100,
  });
  return {
    stack: cards,
    penetration,
    cutPosition,
  };
};

export class Shoe {
  private deck: ShoeDeck;
  private discardPile: Stack;
  private stopPosition: number;
  private state: "in progress" | "complete" = "in progress";
  private roundCompleted: number | null = null;
  private currentRound: number;

  constructor(numDecks: number, penetration: number = 0.1, testStack?: Stack) {
    this.deck = newShoeStack(numDecks, penetration, testStack);
    this.discardPile = [];
    this.stopPosition = Math.floor(
      this.deck.stack.length * (1 - this.deck.penetration),
    );
    this.currentRound = 0;
  }

  startNextRound() {
    this.currentRound += 1;
  }

  deal(players: number): { playerHands: Stack[][]; dealerHand: Stack } {
    this.startNextRound();
    const hands: Stack[][] = [];
    for (let i = 0; i < players; i++) {
      hands.push([[this.drawCard(), this.drawCard()]]);
    }
    const dealerHand: Stack = [this.drawCard(), this.drawCard()];
    return { playerHands: hands, dealerHand };
  }

  drawCard(): Card {
    if (
      this.state === "complete" &&
      this.currentRound !== this.roundCompleted
    ) {
      // throw new Error("Shoe is complete, cannot draw more cards.");
      throw new Error("Shoe is complete, cannot draw more cards.");
    }
    if (this.deck.stack.length <= this.stopPosition) {
      this.state = "complete";
      this.roundCompleted = this.currentRound;
    }
    const card = this.deck.stack.shift() as Card;
    return card;
  }

  discard(stack: Stack) {
    this.discardPile.push(...stack);
  }

  get remainingCards(): number {
    return this.deck.stack.length;
  }

  get isComplete(): boolean {
    return this.state === "complete";
  }

  get stats() {
    return {
      remainingCards: this.remainingCards,
      isComplete: this.isComplete,
      roundCompleted: this.roundCompleted,
    };
  }

  get discardedCards(): Stack {
    return [...this.discardPile];
  }

  get totalCards(): number {
    return this.deck.stack.length + this.discardPile.length;
  }

  get cutCardPosition(): number {
    return this.stopPosition;
  }

  get detailedStats() {
    return {
      remainingCards: this.remainingCards,
      discardedCards: this.discardPile.length,
      totalCards: this.totalCards,
      cutCardPosition: this.stopPosition,
      penetration: this.deck.penetration,
      isComplete: this.isComplete,
      currentRound: this.currentRound,
      discardPile: [...this.discardPile],
    };
  }
}
