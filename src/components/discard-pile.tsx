"use client";

import { cn } from "@/lib/utils";
import { Card as UICard } from "@/components/ui/card";
import type { Card, Rank, Suit } from "@/modules/game/cards";

interface DiscardPileProps {
  discardPile: Card[];
}

// Helper to get card display properties
function getCardDisplay(card: Card): {
  symbol: string;
  color: string;
  rank: string;
  suit: string;
} {
  const suitSymbols: Record<Suit, string> = {
    hearts: "♥",
    diamonds: "♦",
    clubs: "♣",
    spades: "♠",
  };

  const rankDisplay: Record<Rank, string> = {
    ace: "A",
    two: "2",
    three: "3",
    four: "4",
    five: "5",
    six: "6",
    seven: "7",
    eight: "8",
    nine: "9",
    ten: "10",
    jack: "J",
    queen: "Q",
    king: "K",
  };

  const color =
    card.suit === "hearts" || card.suit === "diamonds"
      ? "text-red-500"
      : "text-gray-900";

  return {
    symbol: suitSymbols[card.suit],
    color,
    rank: rankDisplay[card.rank],
    suit: card.suit,
  };
}

export function DiscardPile({ discardPile }: DiscardPileProps) {
  // Get the last few cards to display (showing top of discard pile)
  const visibleCards = discardPile.slice(-5).reverse(); // Show last 5 cards, most recent on top
  const totalDiscarded = discardPile.length;

  // Calculate card value distribution for statistics
  const distribution = discardPile.reduce(
    (acc, card) => {
      const value = ["jack", "queen", "king"].includes(card.rank)
        ? "10+"
        : card.rank === "ace"
          ? "A"
          : card.rank === "two"
            ? "2"
            : card.rank === "three"
              ? "3"
              : card.rank === "four"
                ? "4"
                : card.rank === "five"
                  ? "5"
                  : card.rank === "six"
                    ? "6"
                    : card.rank === "seven"
                      ? "7"
                      : card.rank === "eight"
                        ? "8"
                        : card.rank === "nine"
                          ? "9"
                          : "10+";

      acc[value] = (acc[value] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>,
  );

  return (
    <UICard className="p-4 bg-gradient-to-br from-gray-900 to-gray-800 border-gray-700">
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-gray-300">Discard Pile</h3>
          <div className="text-xs text-gray-400">{totalDiscarded} cards</div>
        </div>

        {/* Discard pile visualization */}
        <div className="relative h-32 flex items-center justify-center">
          {totalDiscarded === 0 ? (
            <div className="text-gray-600 text-sm">No cards discarded</div>
          ) : (
            <div className="relative w-24 h-32">
              {/* Base pile (messy stack effect) */}
              {totalDiscarded > 5 && (
                <>
                  {Array.from({ length: Math.min(5, totalDiscarded - 5) }).map(
                    (_, i) => (
                      <div
                        key={`base-${i}`}
                        className="absolute w-16 h-24 bg-gradient-to-br from-gray-700 to-gray-800 rounded-sm border border-gray-600"
                        style={{
                          transform: `rotate(${(i - 2) * 3}deg) translateX(${(i - 2) * 2}px) translateY(${i * 2}px)`,
                          opacity: 0.3 + i * 0.1,
                          zIndex: i,
                        }}
                      />
                    ),
                  )}
                </>
              )}

              {/* Visible top cards */}
              {visibleCards.map((card, index) => {
                const display = getCardDisplay(card);
                const rotation = (Math.random() - 0.5) * 10; // Random rotation for realism
                const offsetX = (Math.random() - 0.5) * 8;
                const offsetY = index * 4;

                return (
                  <div
                    key={`${card.suit}-${card.rank}-${index}`}
                    className="absolute w-16 h-24 bg-white rounded-sm border border-gray-400 shadow-lg flex flex-col items-center justify-center"
                    style={{
                      transform: `rotate(${rotation}deg) translateX(${offsetX}px) translateY(${offsetY}px)`,
                      zIndex: 10 + index,
                    }}
                  >
                    {/* Mini card display */}
                    <div className={cn("text-2xl font-bold", display.color)}>
                      {display.rank}
                    </div>
                    <div className={cn("text-3xl", display.color)}>
                      {display.symbol}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Card distribution mini chart */}
        {totalDiscarded > 0 && (
          <div className="space-y-2">
            <div className="text-xs text-gray-400">Distribution</div>
            <div className="grid grid-cols-5 gap-1 text-xs">
              {["A", "2-5", "6-9", "10+"].map((range) => {
                let count = 0;
                if (range === "A") count = distribution["A"] || 0;
                else if (range === "2-5")
                  count =
                    (distribution["2"] || 0) +
                    (distribution["3"] || 0) +
                    (distribution["4"] || 0) +
                    (distribution["5"] || 0);
                else if (range === "6-9")
                  count =
                    (distribution["6"] || 0) +
                    (distribution["7"] || 0) +
                    (distribution["8"] || 0) +
                    (distribution["9"] || 0);
                else if (range === "10+") count = distribution["10+"] || 0;

                const percentage =
                  totalDiscarded > 0 ? (count / totalDiscarded) * 100 : 0;

                return (
                  <div key={range} className="flex flex-col items-center">
                    <div className="text-gray-500">{range}</div>
                    <div className="relative w-full h-12 bg-gray-700 rounded-sm overflow-hidden">
                      <div
                        className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-purple-600 to-purple-500"
                        style={{ height: `${percentage}%` }}
                      />
                      <div className="absolute inset-0 flex items-center justify-center text-gray-300 font-semibold">
                        {count}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Running count hint (for card counters) */}
        {totalDiscarded > 0 && (
          <div className="text-xs text-gray-500 text-center">
            <span className="opacity-50">
              High cards out: {distribution["10+"] || 0} | Low cards out:{" "}
              {(distribution["2"] || 0) +
                (distribution["3"] || 0) +
                (distribution["4"] || 0) +
                (distribution["5"] || 0) +
                (distribution["6"] || 0)}
            </span>
          </div>
        )}
      </div>
    </UICard>
  );
}
