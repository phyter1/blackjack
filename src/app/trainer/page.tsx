"use client";

import { BlackjackGameProvider } from "@/hooks/use-blackjack-game";
import { TrainerPage } from "@/components/trainer-page";

export default function TrainerRoute() {
  return (
    <BlackjackGameProvider>
      <TrainerPage />
    </BlackjackGameProvider>
  );
}
