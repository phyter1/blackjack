import type { Stack } from "./cards";
import { weightedRandomChoice } from "./random";

/**
 * Determines a random interleave length for riffle shuffle.
 * Simulates realistic card interleaving during a riffle.
 *
 * @param remaining - Number of cards remaining to interleave
 * @returns Number of cards to take (1-4, weighted toward 1)
 */
export const randomInterleaveLen = (remaining: number): number => {
  if (remaining <= 0) return 0;
  const len = weightedRandomChoice([1, 2, 3, 4], [0.6, 0.15, 0.15, 0.1]);
  return Math.min(len, remaining);
};

const penetrationChoices = Array(200)
  .fill(0)
  .map((_, i) => {
    if (i <= 100) {
      // ascending from 0 to 100
      return [i, i * 0.01];
    } else {
      // descending from 99 to 0
      const desc = 200 - i;
      return [i, desc * 0.01];
    }
  });

/**
 * Cuts the stack at a specific penetration point.
 * Penetration determines where the cut card is placed.
 *
 * @param params - Configuration object
 * @param params.stack - The card stack to cut
 * @param params.penetration - Percentage (0-100) where to cut, random if not specified
 * @returns Object containing cut stack, penetration value, and cut position
 */
export const cutStackAtPenetration = ({
  stack,
  penetration: pen,
}: {
  stack: Stack;
  penetration?: number;
}) => {
  let penetration: number =
    pen ??
    weightedRandomChoice(
      penetrationChoices.map((pc) => pc[0]),
      penetrationChoices.map((pc) => pc[1]),
    );
  penetration = Math.min(Math.max(penetration, 0), 100); // clamp between 0 and 100
  const cutPosition = Math.floor((penetration / 100) * stack.length);
  return {
    stack: [...stack.slice(cutPosition), ...stack.slice(0, cutPosition)],
    penetration,
    cutPosition,
  };
};

/**
 * Performs a realistic riffle shuffle on a card stack.
 * Splits the deck near middle and interleaves cards from each half.
 *
 * @param stack - The card stack to shuffle
 * @returns Shuffled card stack
 */
export const riffleShuffleStack = (stack: Stack): Stack => {
  const middle = weightedRandomChoice(
    [0.4, 0.42, 0.45, 0.5, 0.55, 0.6],
    [0.1, 0.2, 0.4, 0.2, 0.1, 0.01],
  );
  const mid = Math.floor(stack.length * middle);
  let firstHalf = stack.slice(0, mid);
  let secondHalf = stack.slice(mid);
  const shuffledStack: Stack = [];

  while (firstHalf.length > 0 || secondHalf.length > 0) {
    const takeFromFirst = randomInterleaveLen(firstHalf.length);
    const takeFromSecond = randomInterleaveLen(secondHalf.length);

    shuffledStack.push(...firstHalf.slice(0, takeFromFirst));
    shuffledStack.push(...secondHalf.slice(0, takeFromSecond));

    firstHalf = firstHalf.slice(takeFromFirst);
    secondHalf = secondHalf.slice(takeFromSecond);
  }

  return shuffledStack;
};

/**
 * Performs an overhand shuffle on a card stack.
 * Takes small chunks from top and places them on a new stack.
 *
 * @param stack - The card stack to shuffle
 * @returns Shuffled card stack
 */
export const overhandShuffleStack = (stack: Stack): Stack => {
  let remainingStack = [...stack];
  const shuffledStack: Stack = [];

  while (remainingStack.length > 0) {
    const chunkSize = weightedRandomChoice(
      [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
      [0.2, 0.2, 0.15, 0.1, 0.1, 0.08, 0.07, 0.05, 0.03, 0.02],
    );
    const takeSize = Math.min(chunkSize, remainingStack.length);
    const chunk = remainingStack.slice(0, takeSize);
    shuffledStack.unshift(...chunk); // add to the top of the shuffled stack
    remainingStack = remainingStack.slice(takeSize);
  }

  return shuffledStack;
};

/**
 * Performs a complete casino-style shuffle on a multi-deck shoe.
 * Breaks shoe into deck-sized chunks, riffle shuffles each 3 times,
 * overhand shuffles once, then reassembles and cuts.
 *
 * @param shoe - The complete shoe (multiple decks) to shuffle
 * @returns Fully shuffled shoe ready for play
 */
export const shuffleShoe = (shoe: Stack): Stack => {
  // break the shoe into chunks of around 52 cards (1 deck) each, riffle shuffle each chunk 3 times, overhand shuffle each chunk once, then reassemble and cut the shoe at OPPOSITE the desired penetration point, effectively achieving the desired penetration

  const deckSize = 52;
  const numDecks = Math.ceil(shoe.length / deckSize);
  const chunks: Stack[] = [];
  for (let i = 0; i < numDecks; i++) {
    const chunk = shoe.slice(i * deckSize, (i + 1) * deckSize);
    let shuffledChunk = chunk;
    for (let j = 0; j < 3; j++) {
      shuffledChunk = riffleShuffleStack(shuffledChunk);
    }
    shuffledChunk = overhandShuffleStack(shuffledChunk);
    chunks.push(shuffledChunk);
  }

  const reassembledShoe = chunks.flat();

  // Now cut the shoe at opposite the desired penetration point
  const desiredPenetration = 75; // default desired penetration
  const cutPenetration = 100 - desiredPenetration;
  const cutPosition = Math.floor(
    (cutPenetration / 100) * reassembledShoe.length,
  );
  return [
    ...reassembledShoe.slice(cutPosition),
    ...reassembledShoe.slice(0, cutPosition),
  ];
};
