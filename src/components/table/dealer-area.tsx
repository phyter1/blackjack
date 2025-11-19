"use client";

import React from "react";
import type { Round } from "@/modules/game/round";
import type { GamePhase } from "./types";
import { AnimatedCard } from "@/components/animated-card";
import { useSettings } from "@/hooks/use-settings";

interface DealerAreaProps {
  round: Round | undefined;
  phase: GamePhase;
  version?: number;
}

export function DealerArea({ round, phase, version }: DealerAreaProps) {
  const { settings } = useSettings();
  const [, forceUpdate] = React.useReducer((x) => x + 1, 0);

  React.useEffect(() => {
    forceUpdate();
  }, [version]);

  if (!round) return null;

  const showingText =
    phase === "dealing" || phase === "playing" || phase === "insurance"
      ? `Showing: ${round.dealerHand.upCard?.rank || round.dealerHand.cards[0]?.rank || ""}`
      : `Total: ${round.dealerHand.handValue}`;

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="text-amber-200 font-serif text-lg">Dealer</div>

      <div className="relative flex" style={{ minHeight: "146px" }}>
        {round.dealerHand.cards.map((card, idx) => (
          <div
            key={`card-${idx}-${card.rank}-${card.suit}`}
            className="transition-all duration-300"
            style={{
              marginLeft: idx > 0 ? "-55px" : "0",
              zIndex: idx,
            }}
          >
            <AnimatedCard
              card={card}
              hidden={
                idx > 0 &&
                (phase === "dealing" ||
                  phase === "playing" ||
                  phase === "insurance")
              }
              size="xl"
              dealDelay={
                settings.animations.enableAnimations
                  ? idx * settings.animations.dealingSpeed
                  : 0
              }
            />
          </div>
        ))}
      </div>

      {phase !== "betting" && (
        <div className="text-amber-400 font-serif">{showingText}</div>
      )}
    </div>
  );
}
