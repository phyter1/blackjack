"use client";

import { useRef, useState } from "react";
import { HiLoCounter } from "@/modules/strategy/hi-lo-counter";

interface UseCountingProps {
  deckCount: number;
}

export function useCounting({ deckCount }: UseCountingProps) {
  const [countingEnabled, setCountingEnabled] = useState(true);
  const [showCount, setShowCount] = useState(true);
  const cardCounter = useRef<HiLoCounter | null>(null);

  // Initialize card counter
  if (!cardCounter.current) {
    cardCounter.current = new HiLoCounter(deckCount, false);
  }

  return {
    countingEnabled,
    showCount,
    cardCounter: cardCounter.current,
    setCountingEnabled,
    setShowCount,
  };
}
