"use client";

import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";

interface ShoeIndicatorProps {
  remainingCards: number;
  totalCards: number;
  cutCardPosition: number;
  penetration: number;
  isComplete: boolean;
}

export function ShoeIndicator({
  remainingCards,
  totalCards,
  cutCardPosition,
  penetration,
  isComplete,
}: ShoeIndicatorProps) {
  // Calculate percentages for visual representation
  const cardsDealt = totalCards - remainingCards;
  const dealtPercentage = (cardsDealt / totalCards) * 100;
  const cutCardPercentage = ((totalCards - cutCardPosition) / totalCards) * 100;

  // Calculate how many visual card layers to show (max 20 for performance)
  const maxVisibleCards = 20;
  const visibleCardCount = Math.min(
    maxVisibleCards,
    Math.ceil(remainingCards / 10),
  );

  return (
    <Card className="p-4 bg-gradient-to-br from-gray-900 to-gray-800 border-gray-700">
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-gray-300">Shoe</h3>
          <div className="text-xs text-gray-400">
            {remainingCards} / {totalCards} cards
          </div>
        </div>

        {/* 3D Shoe Visualization */}
        <div className="relative h-32 flex items-center justify-center">
          {/* Shoe container */}
          <div className="relative w-24 h-28">
            {/* Back of shoe (angled plate) */}
            <div
              className="absolute inset-0 bg-gradient-to-b from-gray-700 to-gray-800 rounded-sm"
              style={{
                transform: "perspective(200px) rotateY(-20deg) rotateX(5deg)",
                transformOrigin: "center",
              }}
            />

            {/* Card stack visualization */}
            <div className="absolute inset-0 flex items-end justify-center pb-2">
              <div className="relative w-16 h-24">
                {/* Stacked cards effect */}
                {Array.from({ length: visibleCardCount }).map((_, i) => {
                  const offset = i * 2;
                  const opacity = 1 - i * 0.03;

                  return (
                    <div
                      key={i}
                      className={cn(
                        "absolute inset-0 bg-gradient-to-br rounded-sm border border-gray-600",
                        isComplete
                          ? "from-red-900 to-red-950"
                          : "from-blue-900 to-blue-950",
                      )}
                      style={{
                        transform: `translateY(-${offset}px) translateX(${offset * 0.3}px)`,
                        opacity,
                        zIndex: visibleCardCount - i,
                      }}
                    >
                      {/* Card back pattern */}
                      <div className="absolute inset-1 rounded-sm opacity-20">
                        <svg className="w-full h-full" viewBox="0 0 100 140">
                          <pattern
                            id="card-pattern"
                            x="0"
                            y="0"
                            width="20"
                            height="20"
                            patternUnits="userSpaceOnUse"
                          >
                            <rect width="10" height="10" fill="white" />
                            <rect
                              x="10"
                              y="10"
                              width="10"
                              height="10"
                              fill="white"
                            />
                          </pattern>
                          <rect
                            width="100"
                            height="140"
                            fill="url(#card-pattern)"
                          />
                        </svg>
                      </div>
                    </div>
                  );
                })}

                {/* Cut card indicator */}
                {!isComplete && (
                  <div
                    className="absolute w-full h-0.5 bg-yellow-500 shadow-glow-yellow z-50"
                    style={{
                      bottom: `${cutCardPercentage}%`,
                      boxShadow: "0 0 8px rgba(234, 179, 8, 0.6)",
                    }}
                  >
                    <div className="absolute -right-8 -top-2 text-xs text-yellow-400 whitespace-nowrap">
                      Cut
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Progress bar */}
        <div className="space-y-1">
          <div className="relative h-3 bg-gray-700 rounded-full overflow-hidden">
            {/* Dealt cards portion */}
            <div
              className="absolute left-0 top-0 h-full bg-gradient-to-r from-red-600 to-red-500 transition-all duration-500"
              style={{ width: `${dealtPercentage}%` }}
            />

            {/* Cut card position marker */}
            <div
              className="absolute top-0 w-0.5 h-full bg-yellow-500 z-10"
              style={{
                left: `${100 - cutCardPercentage}%`,
                boxShadow: "0 0 4px rgba(234, 179, 8, 0.8)",
              }}
            />

            {/* Remaining cards */}
            <div
              className="absolute inset-y-0 right-0 bg-gradient-to-r from-blue-600 to-blue-500 opacity-30"
              style={{ width: `${100 - dealtPercentage}%` }}
            />
          </div>

          <div className="flex justify-between text-xs text-gray-400">
            <span>Dealt: {cardsDealt}</span>
            <span className="text-yellow-400">
              Penetration: {(penetration * 100).toFixed(0)}%
            </span>
            <span>Remaining: {remainingCards}</span>
          </div>
        </div>

        {/* Status indicator */}
        {isComplete && (
          <div className="flex items-center gap-2 px-2 py-1 bg-red-900/30 rounded border border-red-800/50">
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
            <span className="text-xs text-red-400">
              Shoe complete - Reshuffle needed
            </span>
          </div>
        )}
      </div>
    </Card>
  );
}
