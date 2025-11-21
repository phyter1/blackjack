"use client";

import { SvgChip } from "./svg-chip";

interface ActionChipProps {
  label: string;
  color: string;
  accentColor: string;
  onClick: () => void;
  disabled?: boolean;
  size?: number;
}

/**
 * Action chip component for game actions (Deal, Re-bet, Clear, etc.).
 * Uses the hexagonal action-chip.svg design with dynamic coloring.
 */
export function ActionChip({
  label,
  color,
  accentColor,
  onClick,
  disabled = false,
  size = 84,
}: ActionChipProps) {
  return (
    <SvgChip
      type="action"
      color={disabled ? "#4B5563" : color}
      accentColor={disabled ? "#374151" : accentColor}
      size={size}
      onClick={onClick}
      disabled={disabled}
    >
      <div className="text-center px-2">
        <div className="text-white font-bold text-xs drop-shadow-lg font-serif uppercase leading-tight">
          {label}
        </div>
      </div>
    </SvgChip>
  );
}
