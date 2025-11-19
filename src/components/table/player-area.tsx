"use client";

import React from "react";
import type { Round } from "@/modules/game/round";
import type { GamePhase } from "./types";
import { AnimatedCard } from "@/components/animated-card";
import { cn } from "@/lib/utils";
import { useSettings } from "@/hooks/use-settings";

interface PlayerAreaProps {
  round: Round | undefined;
  phase: GamePhase;
  userName: string;
  version?: number;
}

export function PlayerArea({
  round,
  phase,
  userName,
  version,
}: PlayerAreaProps) {
  const { settings } = useSettings();
  const [, forceUpdate] = React.useReducer((x) => x + 1, 0);

  React.useEffect(() => {
    forceUpdate();
  }, [version]);

  if (!round) return null;

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="text-amber-200 font-serif text-lg">{userName}</div>

      <div className="flex gap-4">
        {round.playerHands.map((hand, handIdx) => (
          <div
            key={`hand-${handIdx}`}
            className={cn(
              "flex flex-col items-center gap-2 p-4 rounded-lg transition-all",
              round.currentHandIndex === handIdx &&
                phase === "playing" &&
                "ring-2 ring-amber-400 bg-amber-950/30",
            )}
          >
            {/* Hand label (if multiple hands) */}
            {round.playerHands.length > 1 && (
              <div className="text-amber-300 text-xs font-serif font-bold uppercase tracking-wide">
                Hand {handIdx + 1}
              </div>
            )}

            <div
              className="relative flex"
              style={{ minHeight: "146px" }}
              key={`hand-${handIdx}`}
            >
              {hand.cards.map((card, cardIdx) => (
                <div
                  key={`card-${cardIdx}-${card.rank}-${card.suit}`}
                  className="transition-all duration-300"
                  style={{
                    marginLeft: cardIdx > 0 ? "-55px" : "0",
                    zIndex: cardIdx,
                  }}
                >
                  <AnimatedCard
                    card={card}
                    size="xl"
                    dealDelay={
                      settings.animations.enableAnimations
                        ? cardIdx * settings.animations.dealingSpeed + 100
                        : 0
                    }
                  />
                </div>
              ))}
            </div>

            <div className="text-amber-400 font-serif text-sm">
              Total: {hand.handValue}
              {hand.isSoft && " (soft)"}
            </div>

            <div className="text-amber-300 text-xs">
              Bet: ${hand.betAmount.toFixed(2)}
            </div>

            {hand.state && hand.state !== "active" && (
              <div
                className={cn(
                  "text-sm font-bold uppercase",
                  hand.state === "blackjack" && "text-amber-400",
                  hand.state === "won" && "text-green-400",
                  hand.state === "lost" && "text-red-400",
                  hand.state === "pushed" && "text-gray-400",
                  hand.state === "busted" && "text-red-500",
                )}
              >
                {hand.state}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
