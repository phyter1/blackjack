"use client";

import { TrainerPage } from "@/components/trainer-page";
import { BlackjackGameProvider } from "@/hooks/use-blackjack-game";

export default function TrainerRoute() {
  return (
    <BlackjackGameProvider>
      <TrainerPage />
    </BlackjackGameProvider>
  );
}
