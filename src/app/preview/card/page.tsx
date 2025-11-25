"use client";

import { useState } from "react";
import { CardMeisterCard } from "@/components/cardmeister-card";
import { CardBackSelector } from "@/components/card-back-selector";
import { CardStockSelector } from "@/components/card-stock-selector";
import { Button } from "@/components/ui/button";
import { Card as CardUI } from "@/components/ui/card";
import { Plus, Minus, Shuffle, Trash2 } from "lucide-react";
import { SUITS, RANKS, type Card, type Suit, type Rank } from "@/modules/game/cards";

export default function CardPreviewPage() {
  const [hand, setHand] = useState<Card[]>([
    { suit: "hearts", rank: "A" },
    { suit: "spades", rank: "K" },
    { suit: "diamonds", rank: "Q" },
  ]);

  const addRandomCard = () => {
    const randomSuit = SUITS[Math.floor(Math.random() * SUITS.length)];
    const randomRank = RANKS[Math.floor(Math.random() * RANKS.length)];
    setHand([...hand, { suit: randomSuit, rank: randomRank }]);
  };

  const addSpecificCard = (suit: Suit, rank: Rank) => {
    setHand([...hand, { suit, rank }]);
  };

  const removeLastCard = () => {
    if (hand.length > 0) {
      setHand(hand.slice(0, -1));
    }
  };

  const clearHand = () => {
    setHand([]);
  };

  const shuffleHand = () => {
    const shuffled = [...hand];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    setHand(shuffled);
  };

  return (
    <div className="min-h-screen bg-[var(--theme-background)] p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold text-[var(--theme-text-primary)]">
            Card Component Preview
          </h1>
          <p className="text-[var(--theme-text-muted)]">
            Preview and test card components with different designs and settings
          </p>
        </div>

        {/* Overlapping Hand Preview */}
        <CardUI className="p-6 bg-[var(--theme-card-background)]">
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-[var(--theme-text-primary)]">
              Hand Preview - Overlapping ({hand.length} cards)
            </h2>

            {/* Overlapping Card Display */}
            <div className="min-h-[200px] flex items-center justify-center">
              {hand.length === 0 ? (
                <p className="text-[var(--theme-text-muted)] text-lg">
                  No cards in hand. Add some cards to get started!
                </p>
              ) : (
                <div className="relative inline-flex items-center" style={{ paddingRight: "90px" }}>
                  {hand.map((card, index) => (
                    <div
                      key={index}
                      className="transition-transform hover:scale-105 hover:z-10"
                      style={{
                        marginLeft: index === 0 ? "0" : "-60px",
                        position: "relative",
                        zIndex: index,
                      }}
                    >
                      <CardMeisterCard card={card} size="lg" />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </CardUI>

        {/* Individual Cards Display */}
        <CardUI className="p-6 bg-[var(--theme-card-background)]">
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-[var(--theme-text-primary)]">
              Individual Cards - Fronts & Backs
            </h2>

            {/* Card Display */}
            <div className="min-h-[200px] flex flex-col gap-6">
              {hand.length === 0 ? (
                <p className="text-[var(--theme-text-muted)] text-lg text-center">
                  No cards in hand. Add some cards to get started!
                </p>
              ) : (
                <div className="space-y-6">
                  {hand.map((card, index) => (
                    <div key={index} className="flex items-center gap-8 justify-center flex-wrap">
                      <div className="flex flex-col items-center gap-2">
                        <CardMeisterCard
                          card={card}
                          size="lg"
                          className="transition-transform hover:scale-105"
                        />
                        <span className="text-sm font-medium text-[var(--theme-text-primary)]">
                          Front
                        </span>
                        <span className="text-xs text-[var(--theme-text-muted)]">
                          {card.rank} of {card.suit}
                        </span>
                      </div>
                      <div className="flex flex-col items-center gap-2">
                        <CardMeisterCard
                          hidden
                          size="lg"
                          className="transition-transform hover:scale-105"
                        />
                        <span className="text-sm font-medium text-[var(--theme-text-primary)]">
                          Back
                        </span>
                        <span className="text-xs text-[var(--theme-text-muted)]">
                          Hidden
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </CardUI>

        {/* Hand Controls */}
        <CardUI className="p-6 bg-[var(--theme-card-background)]">
          <h3 className="text-lg font-semibold text-[var(--theme-text-primary)] mb-4">
            Hand Controls
          </h3>
          <div className="flex flex-wrap gap-3">
            <Button onClick={addRandomCard} className="gap-2">
              <Plus className="w-4 h-4" />
              Add Random Card
            </Button>
            <Button
              onClick={removeLastCard}
              variant="outline"
              className="gap-2"
              disabled={hand.length === 0}
            >
              <Minus className="w-4 h-4" />
              Remove Last Card
            </Button>
            <Button
              onClick={shuffleHand}
              variant="outline"
              className="gap-2"
              disabled={hand.length === 0}
            >
              <Shuffle className="w-4 h-4" />
              Shuffle Hand
            </Button>
            <Button
              onClick={clearHand}
              variant="destructive"
              className="gap-2"
              disabled={hand.length === 0}
            >
              <Trash2 className="w-4 h-4" />
              Clear Hand
            </Button>
          </div>
        </CardUI>

        {/* Quick Add Cards */}
        <CardUI className="p-6 bg-[var(--theme-card-background)]">
          <h3 className="text-lg font-semibold text-[var(--theme-text-primary)] mb-4">
            Quick Add Specific Cards
          </h3>
          <div className="space-y-4">
            {SUITS.map((suit) => (
              <div key={suit} className="space-y-2">
                <h4 className="text-sm font-medium text-[var(--theme-text-primary)] capitalize">
                  {suit}
                </h4>
                <div className="flex flex-wrap gap-2">
                  {RANKS.map((rank) => (
                    <Button
                      key={`${suit}-${rank}`}
                      onClick={() => addSpecificCard(suit, rank)}
                      variant="outline"
                      size="sm"
                      className="min-w-[3rem]"
                    >
                      {rank}
                    </Button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardUI>

        {/* Card Back Design Settings */}
        <CardUI className="p-6 bg-[var(--theme-card-background)]">
          <h3 className="text-lg font-semibold text-[var(--theme-text-primary)] mb-4">
            Card Back Design
          </h3>
          <CardBackSelector />
        </CardUI>

        {/* Card Stock Color Settings */}
        <CardUI className="p-6 bg-[var(--theme-card-background)]">
          <h3 className="text-lg font-semibold text-[var(--theme-text-primary)] mb-4">
            Card Stock Color
          </h3>
          <CardStockSelector />
        </CardUI>

        {/* Preview All Card Sizes */}
        <CardUI className="p-6 bg-[var(--theme-card-background)]">
          <h3 className="text-lg font-semibold text-[var(--theme-text-primary)] mb-4">
            Card Size Comparison
          </h3>
          <div className="flex flex-wrap items-end gap-8 justify-center">
            {(["sm", "md", "lg", "xl"] as const).map((size) => (
              <div key={size} className="flex flex-col items-center gap-2">
                <CardMeisterCard
                  card={{ suit: "hearts", rank: "A" }}
                  size={size}
                />
                <span className="text-xs text-[var(--theme-text-muted)] uppercase font-medium">
                  {size}
                </span>
              </div>
            ))}
          </div>
        </CardUI>

        {/* Card Back Preview */}
        <CardUI className="p-6 bg-[var(--theme-card-background)]">
          <h3 className="text-lg font-semibold text-[var(--theme-text-primary)] mb-4">
            Card Back Size Comparison
          </h3>
          <div className="flex flex-wrap items-end gap-8 justify-center">
            {(["sm", "md", "lg", "xl"] as const).map((size) => (
              <div key={size} className="flex flex-col items-center gap-2">
                <CardMeisterCard hidden size={size} />
                <span className="text-xs text-[var(--theme-text-muted)] uppercase font-medium">
                  {size}
                </span>
              </div>
            ))}
          </div>
        </CardUI>
      </div>
    </div>
  );
}
