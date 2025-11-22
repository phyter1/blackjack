"use client";

import type { Player } from "@/modules/game/player";
import type { SerializedRound } from "@/stores/game";
import { RoundActionButton } from "./round-action-button";

interface SettlingPhaseProps {
  round: SerializedRound | undefined;
  player: Player | null;
  onNextRound: () => void;
}

export function SettlingPhase({
  round,
  player,
  onNextRound,
}: SettlingPhaseProps) {
  const getResultText = () => {
    if (!round?.settlementResults) return "Dealer Wins";

    const hasWin = round.settlementResults.some(
      (r) =>
        r.outcome === "win" ||
        r.outcome === "blackjack" ||
        r.outcome === "charlie",
    );

    const hasPush = round.settlementResults.some((r) => r.outcome === "push");

    if (hasWin) return "You Win!";
    if (hasPush) return "Push";
    return "Dealer Wins";
  };

  const buttonText =
    player && player.bank.balance < 10 ? "Cash Out" : "Next Round";

  return (
    <div className="flex flex-col items-center gap-4 md:gap-6 pb-8 md:pb-20">
      <div
        className="font-serif text-lg md:text-xl"
        style={{ color: "var(--theme-text-primary)" }}
      >
        {getResultText()}
      </div>

      <RoundActionButton
        label={buttonText}
        onClick={onNextRound}
        color="#16A34A"
        accentColor="#15803D"
      />
    </div>
  );
}
