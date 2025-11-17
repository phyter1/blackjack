"use client";

import { BlackjackGameProvider } from "@/hooks/use-blackjack-game";
import { TrainerModeProvider } from "@/hooks/use-trainer-mode";
import { TrainerPage } from "@/components/trainer-page";

export default function TrainerRoute() {
  return (
    <BlackjackGameProvider>
      <TrainerModeProvider>
        <TrainerPage />
      </TrainerModeProvider>
    </BlackjackGameProvider>
  );
}
