"use client";

import { BlackjackGameProvider } from "@/hooks/use-blackjack-game";
import { BlackjackTable } from "@/components/blackjack-table";

export default function TestIndicatorsPage() {
  return (
    <BlackjackGameProvider>
      <BlackjackTable />
    </BlackjackGameProvider>
  );
}