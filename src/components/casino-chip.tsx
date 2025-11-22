"use client";

import { getCanonicalChipColors } from "@/modules/chip/color";
import { DenomChip } from "./chips";

interface CasinoChipProps {
  value: number;
  primary: string;
  secondary: string;
  center: string;
  textColor: string;
  onClick?: () => void;
  disabled?: boolean;
  selected?: boolean;
}

/**
 * Casino chip component for betting denominations.
 * Now uses the modular DenomChip with enhanced 3-color SVG design.
 */
export function CasinoChip({
  value,
  primary,
  secondary,
  center,
  textColor,
  onClick,
  disabled = false,
  selected = false,
}: CasinoChipProps) {
  return (
    <DenomChip
      value={value}
      primary={primary}
      secondary={secondary}
      center={center}
      textColor={textColor}
      onClick={onClick}
      disabled={disabled}
      selected={selected}
    />
  );
}

/**
 * Get enhanced color configuration for a chip value
 * Returns primary, secondary, center, and text colors
 */
export function getChipColor(value: number): {
  primary: string;
  secondary: string;
  center: string;
  textColor: string;
} {
  // Get canonical colors for this single value
  const palette = getCanonicalChipColors([value]);

  const chipColor = palette[0];
  if (chipColor) {
    return {
      primary: chipColor.primary,
      secondary: chipColor.secondary,
      center: chipColor.center,
      textColor: chipColor.textColor,
    };
  }

  // Fallback
  return {
    primary: "#9CA3AF",
    secondary: "#E5E7EB",
    center: "#FFFFFF",
    textColor: "#000000",
  };
}

/**
 * Generate chip configurations from denominations
 * Uses enhanced 3-color casino-standard color palette
 */
export function generateChipConfigs(denominations: number[]): Array<{
  value: number;
  primary: string;
  secondary: string;
  center: string;
  textColor: string;
}> {
  const palette = getCanonicalChipColors(denominations);

  return palette.map((chip) => ({
    value: chip.value,
    primary: chip.primary,
    secondary: chip.secondary,
    center: chip.center,
    textColor: chip.textColor,
  }));
}

// Legacy export for backward compatibility - uses only canonical denominations
export const CHIP_VALUES = generateChipConfigs([5, 25, 100, 500, 1000, 5000]);
