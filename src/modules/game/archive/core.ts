import { Deck, Stack } from "./cards";

type Player = {
  id: string;
  name: string;
  bankroll: number;
};

type PlayerSession = {
  player: Player;
  sessionId: string;
  roundHistory: {
    roundNumber: number;
    hands: PlayerHand[];
    dealerHand: Stack;
    totalBet: number;
    totalWin: number;
  }[];
};

type PlayerTurn = {
  sessionId: string;
  roundNumber: number;
  playerHandIndex: number;
  actionHistory: Action[];
};

export type PlayerHand = {
  isSplitHand?: boolean;
  bet: number;
  cards: Stack;
  actionHistory: Action[];
  outcome: "pending" | "win" | "lose" | "push" | "surrender";
};
export type Turn = {
  action: Action;
  playerHands: PlayerHand[];
  deck: Deck;
};

export type Round = {
  number: number;
  startTime: number;
  endTime?: number;
  deck: Deck;
  playerHands: PlayerHand[];
  dealerHand: Stack;
};

// A session represents one shoe of blackjack being played
export type Session = {
  metadata: {
    startTime: number;
    gameType: "s17" | "h17";
    numDecks: number;
    // how deep into the shoe the cut card is placed, as a percentage (e.g., 0.75 means 75% of the shoe will be dealt before reshuffling)
    startingPenetration: number;
    startingDeck: Deck;
  };
  bank: number;
  players: {
    id: string;
    bankroll: number;
    transactionHistory: {
      amount: number;
      time: number;
      type: "bet" | "win" | "loss" | "deposit" | "withdrawal";
    }[];
  }[];
  rounds: {
    roundNumber: number;
    startTime: number;
    endTime: number;
    playerHands: {
      playerId: string;
      hands: PlayerHand[];
    }[];
    dealerHand: Stack;
  }[];
};

export const randomInterleaveLen = (remaining: number): number => {
  if (remaining <= 0) return 0;
  // first we need to generate a random number between 1 and 4, weighted towards 1 and 2, but not exceeding remaining
  const rand = Math.random();
  if (rand < 0.6) return Math.min(1, remaining);
  if (rand < 0.75) return Math.min(2, remaining);
  if (rand < 0.9) return Math.min(3, remaining);
  return Math.min(4, remaining);
};

export const cutDeck = (deck: Deck): Deck => {
  // Cut the deck at a random position between 20% and 80% of the deck length, weighted towards the center
  const minCut = Math.floor(deck.length * 0.2);
  const maxCut = Math.floor(deck.length * 0.8);
  const cutPosition = Math.floor(
    (Math.random() * Math.random() * Math.random()) *
      (maxCut - minCut),
  ) + minCut;

  return [...deck.slice(cutPosition), ...deck.slice(0, cutPosition)];
};

export const shuffleDeck = (deck: Deck): Deck => {
  const shuffledDeck = cutDeck(deck);
  // Let's create a human-like shuffle that first splits the deck in half, then interleaves the two halves with some randomness to the interleaving.
  const mid = Math.floor(shuffledDeck.length / 2);
  let firstHalf = shuffledDeck.slice(0, mid);
  let secondHalf = shuffledDeck.slice(mid);

  console.log("Starting shuffle:", firstHalf.length + secondHalf.length);

  const interleavedDeck: Deck = [];

  while (firstHalf.length > 0 || secondHalf.length > 0) {
    // Randomly decide how many cards to take from each half (1 or 2)
    const takeFromFirst = randomInterleaveLen(firstHalf.length);
    const takeFromSecond = randomInterleaveLen(secondHalf.length);

    interleavedDeck.push(...firstHalf.slice(0, takeFromFirst));
    interleavedDeck.push(...secondHalf.slice(0, takeFromSecond));

    // Remove taken cards from halves
    firstHalf = firstHalf.slice(takeFromFirst);
    secondHalf = secondHalf.slice(takeFromSecond);
  }

  return interleavedDeck;
};

export const getHandValue = (hand: Array<Card>): number => {
  let value = 0;
  let aceCount = 0;
  hand.forEach((card) => {
    if (["J", "Q", "K"].includes(card.rank)) {
      value += 10;
    } else if (card.rank === "A") {
      value += (value + 11 > 21 && aceCount > 0) ? 1 : 11;
      aceCount += 1;
    } else {
      value += parseInt(card.rank, 10);
    }
  });
  return value;
};

export const isBust = (hand: Array<Card>): boolean => {
  return getHandValue(hand) > 21;
};

export const addCardToPlayerHand = (
  turn: Turn,
  playerHandIndex: number = 0,
): Turn => {
  const newCard = turn.deck[0];
  const newDeck = turn.deck.slice(1);
  const newHand = {
    ...turn.playerHands[playerHandIndex],
    cards: [...turn.playerHands[playerHandIndex].cards, newCard],
  };
  const newPlayerHands = [...turn.playerHands];
  newPlayerHands[playerHandIndex] = newHand;
  return { ...turn, playerHands: newPlayerHands, deck: newDeck };
};

const ACTION_HIT = "hit" as const;
const ACTION_STAND = "stand" as const;
const ACTION_DOUBLE = "double" as const;
const ACTION_SPLIT = "split" as const;
const ACTION_SURRENDER = "surrender" as const;

export type ActionType =
  | typeof ACTION_HIT
  | typeof ACTION_STAND
  | typeof ACTION_DOUBLE
  | typeof ACTION_SPLIT
  | typeof ACTION_SURRENDER;

export type Action = {
  type: ActionType;
  playerIndex: number;
  playerHandIndex: number;
};

export const nextAction = (
  action: Action,
  round: Round,
): Round => {
  // Placeholder for the function that determines the next action
  // This function should be implemented based on game logic

  const turn: Turn = {
    action,
    playerHands: round.playerHands,
    deck: round.deck,
  };

  switch (action.type) {
    case ACTION_HIT: {
      const newTurn = addCardToPlayerHand(turn);
      const newPlayerHands = [...round.playerHands];
      newPlayerHands[action.playerIndex] =
        newTurn.playerHands[action.playerHandIndex];
      return {
        ...round,
        playerHands: newPlayerHands,
        deck: newTurn.deck,
      };
    }
    case ACTION_DOUBLE: {
      // Logic for double action
      const newTurn = addCardToPlayerHand(turn);
      const newPlayerHands = [...round.playerHands];
      // double the bet in the player's hand
      const ch = newTurn.playerHands[action.playerHandIndex];

      newPlayerHands[action.playerIndex] = {
        ...ch,
        bet: ch.bet * 2,
      };

      return {
        ...round,
        playerHands: newPlayerHands,
        deck: newTurn.deck,
      };
    }
    case ACTION_SPLIT: {
      // Logic for split action
      const newTurn = { ...turn };
      const playerHand = newTurn.playerHands[action.playerHandIndex];
      if (
        playerHand.cards.length !== 2 ||
        playerHand.cards[0].rank !== playerHand.cards[1].rank
      ) {
        // Cannot split, return game unchanged
        return round;
      }

      const cardToMove = playerHand.cards[1];
      const newCardForFirstHand = newTurn.deck[0];
      const newCardForSecondHand = newTurn.deck[1];
      const newDeck = newTurn.deck.slice(2);

      const firstHand: PlayerHand = {
        isSplitHand: true,
        bet: playerHand.bet,
        cards: [playerHand.cards[0], newCardForFirstHand],
        actionHistory: [],
        outcome: "pending",
      };

      const secondHand: PlayerHand = {
        isSplitHand: true,
        bet: playerHand.bet,
        cards: [cardToMove, newCardForSecondHand],
        actionHistory: [],
        outcome: "pending",
      };

      const newPlayerHands = [...round.playerHands];
      // Replace the original hand with the first hand and add the second hand
      newPlayerHands.splice(
        action.playerHandIndex,
        1,
        firstHand,
      );
      newPlayerHands.splice(
        action.playerHandIndex + 1,
        0,
        secondHand,
      );

      round = {
        ...round,
        playerHands: newPlayerHands,
        deck: newDeck,
      };
      return round;
    }
    // case ACTION_SURRENDER: {
    //   // Logic for surrender action
    //   return round;
    // }
    default:
      return round;
  }
};

let d = newDeck();
for (let i = 0; i < 3; i++) {
  d = shuffleDeck(d);
}
console.log("Final shuffled deck:");
d.map((card) => console.log(`${card.rank} of ${card.suit}`));
console.error("Deck length:", d.length);
