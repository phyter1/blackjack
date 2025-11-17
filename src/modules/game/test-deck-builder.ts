import type { Card, Stack } from "./cards";
import { RANKS, SUITS } from "./cards";

/**
 * Test deck builder for creating deterministic card sequences
 * Used for E2E testing to force specific game scenarios
 */

/**
 * Create a card with specific rank and suit
 */
export function createCard(
  rank: (typeof RANKS)[number],
  suit: (typeof SUITS)[number] = "hearts",
): Card {
  return { rank, suit };
}

/**
 * Create a specific test scenario deck
 * These decks are designed to trigger specific game situations
 */
export function createTestDeck(scenario: string, numDecks: number = 6): Stack {
  switch (scenario) {
    case "dealer-blackjack":
      return createDealerBlackjackDeck(numDecks);
    case "player-blackjack":
      return createPlayerBlackjackDeck(numDecks);
    case "dealer-bust":
      return createDealerBustDeck(numDecks);
    case "player-21":
      return createPlayer21Deck(numDecks);
    case "push":
      return createPushDeck(numDecks);
    default:
      throw new Error(`Unknown test scenario: ${scenario}`);
  }
}

/**
 * Creates a deck where the dealer will have blackjack (Ace + 10-value card)
 *
 * Card dealing order in this implementation:
 * 1st card: Player's first card
 * 2nd card: Player's second card
 * 3rd card: Dealer's first card (up card)
 * 4th card: Dealer's second card (hole card)
 *
 * For dealer blackjack with Ace showing:
 * - Position 0: Player's first card - any non-Ace
 * - Position 1: Player's second card - any non-Ace
 * - Position 2: Dealer's up card - Ace
 * - Position 3: Dealer's hole card - 10-value card (10, J, Q, K)
 */
function createDealerBlackjackDeck(numDecks: number): Stack {
  const testCards: Stack = [
    createCard("7", "hearts"), // Player's first card
    createCard("8", "diamonds"), // Player's second card
    createCard("A", "spades"), // Dealer's up card (Ace)
    createCard("K", "clubs"), // Dealer's hole card (King = blackjack!)
  ];

  // Fill the rest with normal cards to make a full shoe
  const remainingCards = fillRemainingCards(testCards.length, numDecks * 52);

  return [...testCards, ...remainingCards];
}

/**
 * Creates a deck where the player will have blackjack
 */
function createPlayerBlackjackDeck(numDecks: number): Stack {
  const testCards: Stack = [
    createCard("A", "hearts"), // Player's first card (Ace)
    createCard("K", "diamonds"), // Player's second card (King = blackjack!)
    createCard("6", "spades"), // Dealer's up card
    createCard("10", "clubs"), // Dealer's hole card
  ];

  const remainingCards = fillRemainingCards(testCards.length, numDecks * 52);

  return [...testCards, ...remainingCards];
}

/**
 * Creates a deck where the dealer will bust
 * Player gets 20, dealer shows 6, has 16, and next card is 10 to bust
 */
function createDealerBustDeck(numDecks: number): Stack {
  const testCards: Stack = [
    createCard("10", "hearts"), // Player's first card
    createCard("Q", "diamonds"), // Player's second card (20 total)
    createCard("6", "spades"), // Dealer's up card
    createCard("10", "clubs"), // Dealer's hole card (16 total)
    createCard("10", "hearts"), // Dealer hits and busts
  ];

  const remainingCards = fillRemainingCards(testCards.length, numDecks * 52);

  return [...testCards, ...remainingCards];
}

/**
 * Creates a deck where the player gets 21 (but not blackjack)
 */
function createPlayer21Deck(numDecks: number): Stack {
  const testCards: Stack = [
    createCard("7", "hearts"), // Player's first card
    createCard("7", "diamonds"), // Player's second card (14 total)
    createCard("6", "spades"), // Dealer's up card
    createCard("10", "clubs"), // Dealer's hole card
    createCard("7", "hearts"), // Player hits to 21
  ];

  const remainingCards = fillRemainingCards(testCards.length, numDecks * 52);

  return [...testCards, ...remainingCards];
}

/**
 * Creates a deck where dealer and player push (both get 20)
 */
function createPushDeck(numDecks: number): Stack {
  const testCards: Stack = [
    createCard("10", "hearts"), // Player's first card
    createCard("Q", "diamonds"), // Player's second card (20 total)
    createCard("10", "spades"), // Dealer's up card
    createCard("K", "clubs"), // Dealer's hole card (20 total)
  ];

  const remainingCards = fillRemainingCards(testCards.length, numDecks * 52);

  return [...testCards, ...remainingCards];
}

/**
 * Fill remaining cards to make a complete shoe
 * Creates a balanced deck with proper distribution
 */
function fillRemainingCards(currentCount: number, targetCount: number): Stack {
  const remaining: Stack = [];
  const cardsNeeded = targetCount - currentCount;

  // Create cards in a repeating pattern to maintain balance
  for (let i = 0; i < cardsNeeded; i++) {
    const rankIndex = i % RANKS.length;
    const suitIndex = Math.floor(i / RANKS.length) % SUITS.length;
    remaining.push(createCard(RANKS[rankIndex], SUITS[suitIndex]));
  }

  return remaining;
}

/**
 * Parse test scenario from URL search params
 */
export function parseTestScenario(searchParams: URLSearchParams): {
  enabled: boolean;
  scenario?: string;
} {
  const testMode = searchParams.get("test-mode");

  if (!testMode) {
    return { enabled: false };
  }

  return {
    enabled: true,
    scenario: testMode,
  };
}
