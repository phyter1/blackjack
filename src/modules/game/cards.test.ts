import { describe, expect, test } from "bun:test";
import { newDeck, RANKS, SUITS } from "./cards";

describe("cards", () => {
  describe("newDeck", () => {
    test("should create 52 cards", () => {
      const deck = newDeck();
      expect(deck).toHaveLength(52);
    });

    test("should have 13 cards per suit", () => {
      const deck = newDeck();
      for (const suit of SUITS) {
        const cardsOfSuit = deck.filter((card) => card.suit === suit);
        expect(cardsOfSuit).toHaveLength(13);
      }
    });

    test("should have 4 cards per rank", () => {
      const deck = newDeck();
      for (const rank of RANKS) {
        const cardsOfRank = deck.filter((card) => card.rank === rank);
        expect(cardsOfRank).toHaveLength(4);
      }
    });

    test("should have all suits represented", () => {
      const deck = newDeck();
      for (const suit of SUITS) {
        const hasSuit = deck.some((card) => card.suit === suit);
        expect(hasSuit).toBe(true);
      }
    });

    test("should have all ranks represented", () => {
      const deck = newDeck();
      for (const rank of RANKS) {
        const hasRank = deck.some((card) => card.rank === rank);
        expect(hasRank).toBe(true);
      }
    });

    test("should create cards with correct structure", () => {
      const deck = newDeck();
      for (const card of deck) {
        expect(card).toHaveProperty("suit");
        expect(card).toHaveProperty("rank");
        expect(SUITS).toContain(card.suit);
        expect(RANKS).toContain(card.rank);
      }
    });
  });

  describe("SUITS constant", () => {
    test("should contain 4 suits", () => {
      expect(SUITS).toHaveLength(4);
    });

    test("should contain expected suits", () => {
      expect(SUITS).toContain("hearts");
      expect(SUITS).toContain("diamonds");
      expect(SUITS).toContain("clubs");
      expect(SUITS).toContain("spades");
    });
  });

  describe("RANKS constant", () => {
    test("should contain 13 ranks", () => {
      expect(RANKS).toHaveLength(13);
    });

    test("should contain number cards", () => {
      expect(RANKS).toContain("2");
      expect(RANKS).toContain("3");
      expect(RANKS).toContain("4");
      expect(RANKS).toContain("5");
      expect(RANKS).toContain("6");
      expect(RANKS).toContain("7");
      expect(RANKS).toContain("8");
      expect(RANKS).toContain("9");
      expect(RANKS).toContain("10");
    });

    test("should contain face cards", () => {
      expect(RANKS).toContain("J");
      expect(RANKS).toContain("Q");
      expect(RANKS).toContain("K");
    });

    test("should contain Ace", () => {
      expect(RANKS).toContain("A");
    });
  });
});
