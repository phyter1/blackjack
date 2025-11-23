"use client";

import { cn } from "@/lib/utils";
import { selectChipScale, useSettingsStore } from "@/stores/settings";

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
 * Responsive sizing: 45px on mobile, 70px on desktop
 */
export function ActionChip({
  label,
  color,
  accentColor,
  onClick,
  disabled = false,
  size,
}: ActionChipProps) {
  const chipScale = useSettingsStore(selectChipScale);
  const svgPath = "/action-chip.svg";

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "relative transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center",
        !disabled && "hover:scale-110 hover:shadow-lg cursor-pointer",
        // Responsive sizing: 45px mobile, 70px desktop
        size === undefined && "w-[45px] h-[45px] md:w-[70px] md:h-[70px]",
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
      {/* Base layer with primary color */}
      <div
        className="absolute inset-0 rounded-full"
        style={{
          background: disabled ? "#4B5563" : color,
        }}
      />

      {/* Primary SVG layer - make it darker to show as border/structure */}
      <div className="absolute inset-0 rounded-full overflow-hidden">
        <img
          src={svgPath}
          alt=""
          className="w-full h-full object-contain"
          style={{
            filter: "brightness(0) saturate(100%) invert(0)",
            opacity: 0.3,
          }}
        />
      </div>

      {/* Secondary color accent layer - using mask to show decorations */}
      <div
        className="absolute inset-0 rounded-full overflow-hidden"
        style={{
          WebkitMaskImage: `url(${svgPath})`,
          WebkitMaskSize: "contain",
          WebkitMaskPosition: "center",
          WebkitMaskRepeat: "no-repeat",
          maskImage: `url(${svgPath})`,
          maskSize: "contain",
          maskPosition: "center",
          maskRepeat: "no-repeat",
          background: disabled ? "#374151" : accentColor,
          opacity: 0.4,
        }}
      />

      {/* Content overlay (text) */}
      <div className="relative z-10 flex items-center justify-center w-full h-full">
        <div className="text-center px-0.5">
          <div className="text-white font-bold text-[7px] md:text-[10px] drop-shadow-lg font-serif uppercase leading-tight">
            {label}
          </div>
        </div>
      </div>
    </button>
  );
}
