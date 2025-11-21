"use client";

import { cn } from "@/lib/utils";
import { CasinoChip } from "./casino-chip";

interface DenomChipProps {
  value: number;
  primary: string;
  secondary: string;
  center: string;
  textColor: string;
  onClick?: () => void;
  disabled?: boolean;
  selected?: boolean;
  size?: number;
}

/**
 * Denominational chip component for betting.
 * Uses enhanced 3-color design:
 * - primary for chip body
 * - secondary for edge marks
 * - center for center circle
 * - textColor for high-contrast denomination text
 */
export function DenomChip({
  value,
  primary,
  secondary,
  center,
  textColor,
  onClick,
  disabled = false,
  selected = false,
  size = 96,
}: DenomChipProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "relative transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed",
        !disabled && "hover:scale-110 hover:shadow-lg cursor-pointer",
        selected && "scale-110 shadow-xl ring-2 ring-amber-400",
      )}
      style={{
        width: `${size}px`,
        height: `${size}px`,
      }}
    >
      <CasinoChip
        chipBodyColor={primary}
        centerCircleColor={center}
        edgeMarkColor={secondary}
        denomination={value}
        denominationColor={textColor}
        denominationSize={size * 0.16}
        className="w-full h-full"
      />
    </button>
  );
}

// Re-export chip configuration utilities for backward compatibility
export { CHIP_VALUES, getChipColor, generateChipConfigs } from "../casino-chip";
