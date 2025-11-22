"use client";

import type { ActionType } from "@/modules/game/action";
import {
  ACTION_DOUBLE,
  ACTION_HIT,
  ACTION_SPLIT,
  ACTION_STAND,
  ACTION_SURRENDER,
} from "@/modules/game/action";
import { ActionChip } from "./chips";

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

// Action chip color schemes matching casino feel
const actionColors = {
  [ACTION_HIT]: { color: "#2563EB", accentColor: "#1E40AF" }, // Blue
  [ACTION_STAND]: { color: "#DC2626", accentColor: "#991B1B" }, // Red
  [ACTION_DOUBLE]: { color: "#F59E0B", accentColor: "#B45309" }, // Gold
  [ACTION_SPLIT]: { color: "#8B5CF6", accentColor: "#6D28D9" }, // Purple
  [ACTION_SURRENDER]: { color: "#4B5563", accentColor: "#374151" }, // Grey
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
    <div className="flex flex-wrap gap-2 md:gap-3 justify-center pb-8 md:pb-20">
      {availableActions.map((action) => (
        <ActionChip
          key={action}
          label={actionLabels[action]}
          color={actionColors[action].color}
          accentColor={actionColors[action].accentColor}
          onClick={() => onAction(action)}
          disabled={disabled}
        />
      ))}
    </div>
  );
}
