const HEARTS = "hearts" as const;
const DIAMONDS = "diamonds" as const;
const CLUBS = "clubs" as const;
const SPADES = "spades" as const;
export const SUITS = [HEARTS, DIAMONDS, CLUBS, SPADES] as const;

const TWO = "2" as const;
const THREE = "3" as const;
const FOUR = "4" as const;
const FIVE = "5" as const;
const SIX = "6" as const;
const SEVEN = "7" as const;
const EIGHT = "8" as const;
const NINE = "9" as const;
const TEN = "10" as const;
const JACK = "J" as const;
const QUEEN = "Q" as const;
const KING = "K" as const;
const ACE = "A" as const;
export const RANKS = [
  TWO,
  THREE,
  FOUR,
  FIVE,
  SIX,
  SEVEN,
  EIGHT,
  NINE,
  TEN,
  JACK,
  QUEEN,
  KING,
  ACE,
] as const;

export type Card = {
  suit: (typeof SUITS)[number];
  rank: (typeof RANKS)[number];
};

export type Stack = Array<Card>;
export type Deck = Stack;

export const newDeck = () =>
  SUITS.flatMap((suit) => RANKS.map((rank) => ({ suit, rank })));
