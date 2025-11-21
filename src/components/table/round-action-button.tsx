"use client";

import { ActionChip } from "@/components/chips";

interface RoundActionButtonProps {
  label: string;
  color: string;
  accentColor: string;
  onClick: () => void;
  disabled?: boolean;
}

/**
 * Round action button for game actions (Deal, Re-bet, Clear, etc.).
 * Now uses the modular ActionChip with SVG design.
 */
export function RoundActionButton({
  label,
  color,
  accentColor,
  onClick,
  disabled = false,
}: RoundActionButtonProps) {
  return (
    <ActionChip
      label={label}
      color={color}
      accentColor={accentColor}
      onClick={onClick}
      disabled={disabled}
    />
  );
}
