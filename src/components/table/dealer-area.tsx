"use client";

import type { Round } from "@/modules/game/round";
import type { GamePhase } from "./types";
import { AnimatedCard } from "@/components/animated-card";

interface DealerAreaProps {
  round: Round | undefined;
  phase: GamePhase;
}

export function DealerArea({ round, phase }: DealerAreaProps) {
  if (!round) return null;

  const showingText = phase === "dealing" || phase === "playing" || phase === "insurance"
    ? `Showing: ${round.dealerHand.upCard.rank}`
    : `Total: ${round.dealerHand.handValue}`;

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="text-amber-200 font-serif text-lg">Dealer</div>

      <div className="relative flex" style={{ minHeight: "146px" }}>
        {round.dealerHand.cards.map((card, idx) => (
          <div
            key={`dealer-${card.rank}-${card.suit}-${idx}`}
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
              dealDelay={idx * 200}
            />
          </div>
        ))}
      </div>

      {phase !== "betting" && (
        <div className="text-amber-400 font-serif">
          {showingText}
        </div>
      )}
    </div>
  );
}