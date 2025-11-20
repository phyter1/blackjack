"use client";

import type { ActionType } from "@/modules/game/action";
import {
  ACTION_DOUBLE,
  ACTION_HIT,
  ACTION_SPLIT,
  ACTION_STAND,
  ACTION_SURRENDER,
} from "@/modules/game/action";
import { Button } from "./ui/button";

interface ActionButtonsProps {
  availableActions: ActionType[];
  onAction: (action: ActionType) => void;
  disabled?: boolean;
}

const actionLabels = {
  [ACTION_HIT]: "Hit",
  [ACTION_STAND]: "Stand",
  [ACTION_DOUBLE]: "Double Down",
  [ACTION_SPLIT]: "Split",
  [ACTION_SURRENDER]: "Surrender",
};

const actionVariants = {
  [ACTION_HIT]: "default" as const,
  [ACTION_STAND]: "secondary" as const,
  [ACTION_DOUBLE]: "default" as const,
  [ACTION_SPLIT]: "default" as const,
  [ACTION_SURRENDER]: "destructive" as const,
};

export function ActionButtons({
  availableActions,
  onAction,
  disabled,
}: ActionButtonsProps) {
  if (availableActions.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-wrap gap-2 justify-center pb-20">
      {availableActions.map((action) => (
        <Button
          key={action}
          onClick={() => onAction(action)}
          variant={actionVariants[action]}
          disabled={disabled}
          className="min-w-32"
        >
          {actionLabels[action]}
        </Button>
      ))}
    </div>
  );
}
