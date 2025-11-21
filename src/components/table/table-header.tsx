"use client";

import { Settings } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Player } from "@/modules/game/player";

interface TableHeaderProps {
  player: Player | null;
  currentBalance: number;
  practiceBalance: number;
  isTrainerActive: boolean;
  onOpenSettings: () => void;
  onEndGame: () => void;
}

export function TableHeader({
  currentBalance,
  practiceBalance,
  isTrainerActive,
  onOpenSettings,
  onEndGame,
}: TableHeaderProps) {
  return (
    <div
      className="relative z-10 flex justify-between items-center p-4"
      style={{ color: "var(--theme-text-primary)" }}
    >
      <div className="flex items-center gap-4">
        <h1
          className="text-2xl font-serif font-bold"
          style={{ color: "var(--theme-accent)" }}
        >
          ♠ 21 ♠
        </h1>
      </div>

      <div className="flex items-center gap-4">
        {/* Balance Display */}
        <div className="text-right">
          <div
            className="text-sm font-medium"
            style={{ color: "var(--theme-text-primary)" }}
          >
            {isTrainerActive ? "Practice Balance" : "Balance"}
          </div>
          <div
            className={cn("text-xl font-bold")}
            style={{
              color: "var(--theme-text-primary)",
            }}
          >
            $
            {isTrainerActive
              ? practiceBalance.toLocaleString()
              : currentBalance.toFixed(2)}
          </div>
          {isTrainerActive && (
            <div
              className="text-xs"
              style={{ color: "var(--theme-primary)" }}
            >
              (Training Mode)
            </div>
          )}
        </div>

        {/* Settings Button */}
        <Button
          onClick={onOpenSettings}
          variant="outline"
          size="icon"
          style={{
            borderColor: "var(--theme-border)",
            background: "var(--theme-background)",
            color: "var(--theme-text-primary)",
          }}
          className="hover:opacity-80"
        >
          <Settings className="h-4 w-4" />
        </Button>

        {/* Cash Out Button */}
        <Button
          onClick={onEndGame}
          variant="outline"
          style={{
            borderColor: "var(--theme-error)",
            background: "var(--theme-error)",
            color: "var(--theme-text-primary)",
          }}
          className="hover:opacity-80"
        >
          Cash Out
        </Button>
      </div>
    </div>
  );
}
