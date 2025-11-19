"use client";

import { cn } from "@/lib/utils";
import type { CountSnapshot } from "@/modules/strategy/hi-lo-counter";

interface CountInfoProps {
  countSnapshot?: CountSnapshot;
}

export function CountInfo({ countSnapshot }: CountInfoProps) {
  if (!countSnapshot) return null;

  const getTrueCountColor = (tc: number) => {
    if (tc >= 2) return "text-green-500";
    if (tc <= -2) return "text-red-500";
    return "text-yellow-500";
  };

  return (
    <div className="mb-4">
      <h3 className="text-lg font-semibold text-white mb-3">
        Card Count at Decision
      </h3>
      <div className="grid grid-cols-2 gap-4 p-4 bg-gray-900 rounded-lg border border-gray-700">
        <div>
          <p className="text-sm text-gray-400">Running Count</p>
          <p className="text-2xl font-bold text-white">
            {countSnapshot.runningCount > 0 && "+"}
            {countSnapshot.runningCount}
          </p>
        </div>
        <div>
          <p className="text-sm text-gray-400">True Count</p>
          <p
            className={cn(
              "text-2xl font-bold",
              getTrueCountColor(countSnapshot.trueCount),
            )}
          >
            {countSnapshot.trueCount > 0 && "+"}
            {countSnapshot.trueCount}
          </p>
        </div>
        <div>
          <p className="text-sm text-gray-400">Cards Remaining</p>
          <p className="text-lg font-semibold text-white">
            {countSnapshot.cardsRemaining}
          </p>
        </div>
        <div>
          <p className="text-sm text-gray-400">Decks Remaining</p>
          <p className="text-lg font-semibold text-white">
            {countSnapshot.decksRemaining.toFixed(1)}
          </p>
        </div>
      </div>
    </div>
  );
}