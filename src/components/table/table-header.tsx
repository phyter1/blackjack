"use client";

import type { Player } from "@/modules/game/player";
import type { HiLoCounter } from "@/modules/strategy/hi-lo-counter";
import { Button } from "@/components/ui/button";
import { GraduationCap } from "lucide-react";
import { cn } from "@/lib/utils";

interface TableHeaderProps {
  player: Player | null;
  currentBalance: number;
  practiceBalance: number;
  isTrainerActive: boolean;
  countingEnabled: boolean;
  showCount: boolean;
  cardCounter: HiLoCounter | null;
  showTrainerSidebar: boolean;
  onToggleCount: () => void;
  onToggleTrainer: () => void;
  onEndGame: () => void;
}

export function TableHeader({
  player,
  currentBalance,
  practiceBalance,
  isTrainerActive,
  countingEnabled,
  showCount,
  cardCounter,
  showTrainerSidebar,
  onToggleCount,
  onToggleTrainer,
  onEndGame,
}: TableHeaderProps) {
  return (
    <div className="relative z-10 flex justify-between items-center p-4 text-amber-100">
      <div className="flex items-center gap-4">
        <h1 className="text-2xl font-serif font-bold text-amber-200">
          ♠ BLACKJACK ♠
        </h1>
      </div>

      <div className="flex items-center gap-4">
        {/* Card Count Display */}
        {countingEnabled && cardCounter && showCount && (
          <div className="px-4 py-2 bg-black/60 border border-purple-700 rounded-lg">
            <div className="text-xs text-purple-400">Card Count</div>
            <div className="flex gap-3 items-center">
              <div>
                <div className="text-xs text-gray-400">Running</div>
                <div className="text-lg font-bold text-white">
                  {cardCounter.getRunningCount() > 0 && "+"}
                  {cardCounter.getRunningCount()}
                </div>
              </div>
              <div className="h-8 w-px bg-gray-600" />
              <div>
                <div className="text-xs text-gray-400">True</div>
                <div
                  className={cn(
                    "text-lg font-bold",
                    cardCounter.getTrueCount() >= 2
                      ? "text-green-400"
                      : cardCounter.getTrueCount() <= -2
                        ? "text-red-400"
                        : "text-yellow-400",
                  )}
                >
                  {cardCounter.getTrueCount() > 0 && "+"}
                  {cardCounter.getTrueCount()}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Balance Display */}
        <div className="text-right">
          <div className="text-sm text-amber-400">
            {isTrainerActive ? "Practice Balance" : "Balance"}
          </div>
          <div className={cn(
            "text-xl font-bold",
            isTrainerActive ? "text-blue-400" : "text-green-400"
          )}>
            ${isTrainerActive
              ? practiceBalance.toLocaleString()
              : currentBalance.toFixed(2)}
          </div>
          {isTrainerActive && (
            <div className="text-xs text-blue-300">
              (Training Mode)
            </div>
          )}
        </div>

        {/* Control Buttons */}
        <Button
          onClick={onToggleCount}
          variant="outline"
          size="sm"
          className="border-purple-700 bg-purple-950/50 text-purple-200 hover:bg-purple-900"
        >
          {showCount ? "Hide Count" : "Show Count"}
        </Button>

        <Button
          onClick={onToggleTrainer}
          variant="outline"
          size="sm"
          className={cn(
            "border-blue-700 text-blue-200 hover:bg-blue-900",
            showTrainerSidebar ? "bg-blue-800/80" : "bg-blue-950/50"
          )}
        >
          <GraduationCap className="w-4 h-4 mr-2" />
          {showTrainerSidebar ? "Hide Trainer" : "Show Trainer"}
        </Button>

        <Button
          onClick={onEndGame}
          variant="outline"
          className="border-red-700 bg-red-950/50 text-red-200 hover:bg-red-900"
        >
          Cash Out
        </Button>
      </div>
    </div>
  );
}