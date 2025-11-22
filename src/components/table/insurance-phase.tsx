"use client";

import type { SerializedRound } from "@/stores/game";
import { RoundActionButton } from "./round-action-button";

interface InsurancePhaseProps {
  round: SerializedRound | undefined;
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
    <div className="flex flex-col items-center gap-4 md:gap-6 pb-8 md:pb-20">
      <div
        className="font-serif text-lg text-center"
        style={{ color: "var(--theme-text-primary)" }}
      >
        Dealer shows Ace - Take Insurance?
        {round && round.playerHands.length > 1 && (
          <span
            className="ml-2"
            style={{ color: "var(--theme-text-secondary)" }}
          >
            (Hand {insuranceHandIndex + 1})
          </span>
        )}
      </div>

      <div className="flex gap-4">
        <RoundActionButton
          label={`Yes $${insuranceCost}`}
          onClick={onTakeInsurance}
          color="#16A34A"
          accentColor="#15803D"
        />

        <RoundActionButton
          label="No"
          onClick={onDeclineInsurance}
          color="#DC2626"
          accentColor="#991B1B"
        />
      </div>
    </div>
  );
}
