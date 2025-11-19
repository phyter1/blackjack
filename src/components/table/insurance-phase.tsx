"use client";

import type { Round } from "@/modules/game/round";
import { Button } from "@/components/ui/button";

interface InsurancePhaseProps {
  round: Round | undefined;
  insuranceHandIndex: number;
  onTakeInsurance: () => void;
  onDeclineInsurance: () => void;
}

export function InsurancePhase({
  round,
  insuranceHandIndex,
  onTakeInsurance,
  onDeclineInsurance,
}: InsurancePhaseProps) {
  const insuranceCost = round?.playerHands[insuranceHandIndex]?.betAmount
    ? (round.playerHands[insuranceHandIndex].betAmount / 2).toFixed(2)
    : "0";

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="text-amber-200 font-serif text-lg">
        Dealer shows Ace - Take Insurance?
        {round && round.playerHands.length > 1 && (
          <span className="text-amber-400 ml-2">
            (Hand {insuranceHandIndex + 1})
          </span>
        )}
      </div>

      <div className="flex gap-4">
        <Button
          onClick={onTakeInsurance}
          className="bg-green-800 hover:bg-green-700 text-white font-serif"
        >
          Yes (costs ${insuranceCost})
        </Button>

        <Button
          onClick={onDeclineInsurance}
          className="bg-red-800 hover:bg-red-700 text-white font-serif"
        >
          No
        </Button>
      </div>
    </div>
  );
}
