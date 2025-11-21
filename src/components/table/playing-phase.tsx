"use client";

import type { ActionType } from "@/modules/game/action";
import { ActionChip } from "@/components/chips";

interface PlayingPhaseProps {
  availableActions: ActionType[];
  onAction: (action: ActionType) => void;
}

const ACTION_STYLES = {
  hit: { label: "Hit", color: "#2563EB", accentColor: "#1E40AF" }, // Blue
  stand: { label: "Stand", color: "#DC2626", accentColor: "#991B1B" }, // Red
  double: { label: "Double", color: "#F59E0B", accentColor: "#B45309" }, // Gold
  split: { label: "Split", color: "#8B5CF6", accentColor: "#6D28D9" }, // Purple
  surrender: { label: "Surrender", color: "#6B7280", accentColor: "#374151" }, // Gray
};

export function PlayingPhase({
  availableActions,
  onAction,
}: PlayingPhaseProps) {
  return (
    <div className="flex flex-col items-center gap-6 pb-20">
      <div
        className="font-serif text-lg"
        style={{ color: "var(--theme-text-primary)" }}
      >
        Your Action
      </div>

      <div className="flex gap-4">
        {availableActions.includes("hit") && (
          <ActionChip
            label={ACTION_STYLES.hit.label}
            color={ACTION_STYLES.hit.color}
            accentColor={ACTION_STYLES.hit.accentColor}
            onClick={() => onAction("hit")}
            size={112}
          />
        )}

        {availableActions.includes("stand") && (
          <ActionChip
            label={ACTION_STYLES.stand.label}
            color={ACTION_STYLES.stand.color}
            accentColor={ACTION_STYLES.stand.accentColor}
            onClick={() => onAction("stand")}
            size={112}
          />
        )}

        {availableActions.includes("double") && (
          <ActionChip
            label={ACTION_STYLES.double.label}
            color={ACTION_STYLES.double.color}
            accentColor={ACTION_STYLES.double.accentColor}
            onClick={() => onAction("double")}
            size={112}
          />
        )}

        {availableActions.includes("split") && (
          <ActionChip
            label={ACTION_STYLES.split.label}
            color={ACTION_STYLES.split.color}
            accentColor={ACTION_STYLES.split.accentColor}
            onClick={() => onAction("split")}
            size={112}
          />
        )}

        {availableActions.includes("surrender") && (
          <ActionChip
            label={ACTION_STYLES.surrender.label}
            color={ACTION_STYLES.surrender.color}
            accentColor={ACTION_STYLES.surrender.accentColor}
            onClick={() => onAction("surrender")}
            size={112}
          />
        )}
      </div>
    </div>
  );
}
