"use client";

import { useEffect, useState } from "react";
import type { Game } from "@/modules/game/game";
import type { GamePhase } from "../table/types";

interface UseInsuranceProps {
  game: Game | null;
  phase: GamePhase;
  setPhase: (phase: GamePhase) => void;
  setCurrentRound: (round: any) => void;
  setCurrentActions: (actions: any[]) => void;
  setRoundVersion: (updater: (v: number) => number) => void;
}

export function useInsurance({
  game,
  phase,
  setPhase,
  setCurrentRound,
  setCurrentActions,
  setRoundVersion,
}: UseInsuranceProps) {
  const [handsPendingInsurance, setHandsPendingInsurance] = useState<number[]>(
    [],
  );
  const [insuranceHandIndex, setInsuranceHandIndex] = useState(0);

  // Handle insurance phase - find all hands that need insurance decision
  useEffect(() => {
    if (phase === "insurance" && game) {
      const round = game.getCurrentRound();
      if (round) {
        const pendingHands = round.playerHands
          .map((hand, index) => ({ hand, index }))
          .filter(({ hand }) => hand.insuranceOffered && !hand.hasInsurance)
          .map(({ index }) => index);

        setHandsPendingInsurance(pendingHands);

        if (pendingHands.length > 0) {
          setInsuranceHandIndex(pendingHands[0]);
        }
      }
    }
  }, [phase, game]);

  const handleInsuranceAction = (takeInsurance: boolean) => {
    if (!game) return;

    if (takeInsurance) {
      game.takeInsurance(insuranceHandIndex);
    } else {
      game.declineInsurance(insuranceHandIndex);
    }

    // Check if there are more hands needing insurance
    const remainingHands = handsPendingInsurance.filter(
      (i) => i !== insuranceHandIndex,
    );
    if (remainingHands.length > 0) {
      setInsuranceHandIndex(remainingHands[0]);
      setHandsPendingInsurance(remainingHands);
    } else {
      // All hands processed, resolve insurance
      game.resolveInsurance();

      // Check round state after insurance resolution
      const round = game.getCurrentRound();
      if (round?.state === "settling" || round?.state === "complete") {
        // Dealer has blackjack - go directly to settling
        setTimeout(() => {
          setPhase("settling");
          const roundAfterInsurance = game.getCurrentRound();
          setCurrentRound(roundAfterInsurance);
          setCurrentActions(game.getAvailableActions() ?? []);
          setRoundVersion((v) => v + 1);
        }, 500);
      } else {
        setPhase("playing");
        const roundAfterInsuranceDecline = game.getCurrentRound();
        setCurrentRound(roundAfterInsuranceDecline);
        setCurrentActions(game.getAvailableActions() ?? []);
        setRoundVersion((v) => v + 1);
      }
    }
  };

  return {
    handsPendingInsurance,
    insuranceHandIndex,
    handleInsuranceAction,
  };
}
