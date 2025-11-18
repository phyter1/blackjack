"use client";

import type { ActionType } from "@/modules/game/action";
import { Button } from "@/components/ui/button";

interface PlayingPhaseProps {
  availableActions: ActionType[];
  onAction: (action: ActionType) => void;
}

export function PlayingPhase({ availableActions, onAction }: PlayingPhaseProps) {
  return (
    <div className="flex flex-col items-center gap-4">
      <div className="text-amber-200 font-serif text-lg">Your Action</div>

      <div className="flex gap-2">
        {availableActions.includes("hit") && (
          <Button
            onClick={() => onAction("hit")}
            className="bg-blue-800 hover:bg-blue-700 text-white font-serif px-6"
          >
            Hit
          </Button>
        )}

        {availableActions.includes("stand") && (
          <Button
            onClick={() => onAction("stand")}
            className="bg-red-800 hover:bg-red-700 text-white font-serif px-6"
          >
            Stand
          </Button>
        )}

        {availableActions.includes("double") && (
          <Button
            onClick={() => onAction("double")}
            className="bg-purple-800 hover:bg-purple-700 text-white font-serif px-6"
          >
            Double
          </Button>
        )}

        {availableActions.includes("split") && (
          <Button
            onClick={() => onAction("split")}
            className="bg-amber-800 hover:bg-amber-700 text-white font-serif px-6"
          >
            Split
          </Button>
        )}

        {availableActions.includes("surrender") && (
          <Button
            onClick={() => onAction("surrender")}
            className="bg-gray-800 hover:bg-gray-700 text-white font-serif px-6"
          >
            Surrender
          </Button>
        )}
      </div>
    </div>
  );
}