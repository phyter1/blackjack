"use client";

import { cn } from "@/lib/utils";
import type { ActionType } from "@/modules/game/action";

interface PlayingPhaseProps {
  availableActions: ActionType[];
  onAction: (action: ActionType) => void;
}

interface ActionButtonProps {
  label: string;
  color: string;
  accentColor: string;
  onClick: () => void;
}

function ActionButton({
  label,
  color,
  accentColor,
  onClick,
}: ActionButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "relative w-28 h-28 rounded-full transition-all duration-200",
        "hover:scale-110 hover:shadow-xl cursor-pointer",
        "active:scale-105",
      )}
      style={{
        background: `radial-gradient(circle at 30% 30%, ${color} 0%, ${accentColor} 100%)`,
      }}
    >
      {/* Outer ring */}
      <div
        className="absolute inset-0 rounded-full border-4"
        style={{ borderColor: accentColor }}
      >
        {/* White dots around edge */}
        <div className="absolute inset-0">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 bg-white rounded-full"
              style={{
                top: "50%",
                left: "50%",
                transform: `rotate(${i * 45}deg) translate(-50%, -50%) translateY(-48px)`,
              }}
            />
          ))}
        </div>

        {/* Center label */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className="text-white font-bold text-base drop-shadow-lg font-serif uppercase">
              {label}
            </div>
          </div>
        </div>

        {/* Inner decorative ring */}
        <div className="absolute inset-3 rounded-full border-2 border-white opacity-40" />
      </div>
    </button>
  );
}

const ACTION_STYLES = {
  hit: { color: "#2563EB", accentColor: "#1E40AF" }, // Blue
  stand: { color: "#DC2626", accentColor: "#991B1B" }, // Red
  double: { color: "#8B5CF6", accentColor: "#6D28D9" }, // Purple
  split: { color: "#F59E0B", accentColor: "#B45309" }, // Gold
  surrender: { color: "#6B7280", accentColor: "#374151" }, // Gray
};

export function PlayingPhase({
  availableActions,
  onAction,
}: PlayingPhaseProps) {
  return (
    <div className="flex flex-col items-center gap-6 pb-20">
      <div className="text-amber-200 font-serif text-lg">Your Action</div>

      <div className="flex gap-4">
        {availableActions.includes("hit") && (
          <ActionButton
            label="Hit"
            onClick={() => onAction("hit")}
            {...ACTION_STYLES.hit}
          />
        )}

        {availableActions.includes("stand") && (
          <ActionButton
            label="Stand"
            onClick={() => onAction("stand")}
            {...ACTION_STYLES.stand}
          />
        )}

        {availableActions.includes("double") && (
          <ActionButton
            label="Double"
            onClick={() => onAction("double")}
            {...ACTION_STYLES.double}
          />
        )}

        {availableActions.includes("split") && (
          <ActionButton
            label="Split"
            onClick={() => onAction("split")}
            {...ACTION_STYLES.split}
          />
        )}

        {availableActions.includes("surrender") && (
          <ActionButton
            label="Surrender"
            onClick={() => onAction("surrender")}
            {...ACTION_STYLES.surrender}
          />
        )}
      </div>
    </div>
  );
}
