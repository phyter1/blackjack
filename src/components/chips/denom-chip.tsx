"use client";

import { cn } from "@/lib/utils";
import { CasinoChip } from "./casino-chip";
import { selectChipScale, useSettingsStore } from "@/stores/settings";

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
 *
 * Responsive sizing: 60px on mobile, 80px on desktop
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
  size,
}: DenomChipProps) {
  const chipScale = useSettingsStore(selectChipScale);

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "relative transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed",
        !disabled && "hover:scale-110 hover:shadow-md cursor-pointer",
        selected && "scale-110 shadow-lg ring-2 ring-amber-400",
        // Responsive sizing: 60px mobile, 80px desktop
        size === undefined && "w-[60px] h-[60px] md:w-20 md:h-20",
      )}
      style={
        size !== undefined
          ? {
              width: `${size}px`,
              height: `${size}px`,
              transform: `scale(${chipScale / 100})`,
            }
          : {
              transform: `scale(${chipScale / 100})`,
            }
      }
    >
      <CasinoChip
        chipBodyColor={primary}
        centerCircleColor={center}
        edgeMarkColor={secondary}
        suitColor={center}
        denomination={value}
        denominationColor={textColor}
        denominationSize={36}
        circularText="PHYTERTEK"
        circularTextColor={primary}
        className="w-full h-full"
      />
    </button>
  );
}

// Re-export chip configuration utilities for backward compatibility
export { CHIP_VALUES, getChipColor, generateChipConfigs } from "../casino-chip";
