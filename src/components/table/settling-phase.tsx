"use client";

import type { Player } from "@/modules/game/player";
import type { Round } from "@/modules/game/round";
import { Button } from "@/components/ui/button";

interface SettlingPhaseProps {
  round: Round | undefined;
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
    <div className="flex flex-col items-center gap-4 pb-20">
      <div className="text-amber-200 font-serif text-xl">{getResultText()}</div>

      <Button
        onClick={onNextRound}
        className="bg-green-800 hover:bg-green-700 text-white font-serif text-lg px-8"
      >
        {buttonText}
      </Button>
    </div>
  );
}
