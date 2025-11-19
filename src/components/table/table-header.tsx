"use client";

import type { Player } from "@/modules/game/player";
import { Button } from "@/components/ui/button";
import { Settings } from "lucide-react";
import { cn } from "@/lib/utils";

interface TableHeaderProps {
  player: Player | null;
  currentBalance: number;
  practiceBalance: number;
  isTrainerActive: boolean;
  onOpenSettings: () => void;
  onEndGame: () => void;
}

export function TableHeader({
  player,
  currentBalance,
  practiceBalance,
  isTrainerActive,
  onOpenSettings,
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
        {/* Balance Display */}
        <div className="text-right">
          <div className="text-sm text-amber-400">
            {isTrainerActive ? "Practice Balance" : "Balance"}
          </div>
          <div
            className={cn(
              "text-xl font-bold",
              isTrainerActive ? "text-blue-400" : "text-green-400",
            )}
          >
            $
            {isTrainerActive
              ? practiceBalance.toLocaleString()
              : currentBalance.toFixed(2)}
          </div>
          {isTrainerActive && (
            <div className="text-xs text-blue-300">(Training Mode)</div>
          )}
        </div>

        {/* Settings Button */}
        <Button
          onClick={onOpenSettings}
          variant="outline"
          size="icon"
          className="border-gray-700 bg-gray-950/50 text-gray-200 hover:bg-gray-900"
        >
          <Settings className="h-4 w-4" />
        </Button>

        {/* Cash Out Button */}
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
