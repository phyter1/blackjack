"use client";

import { cn } from "@/lib/utils";

export type ChipSvgType = "denom" | "action";

interface SvgChipProps {
  type: ChipSvgType;
  color: string;
  accentColor?: string;
  size?: number;
  className?: string;
  children?: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  selected?: boolean;
}

/**
 * Base SVG Chip component that renders either the denominational or action chip SVG
 * with dynamic color overlays and optional content in the center.
 */
export function SvgChip({
  type,
  color,
  accentColor,
  size = 96,
  className,
  children,
  onClick,
  disabled = false,
  selected = false,
}: SvgChipProps) {
  const svgPath = type === "denom" ? "/denom-chip.svg" : "/action-chip.svg";

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "relative transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center",
        !disabled && "hover:scale-110 hover:shadow-lg cursor-pointer",
        selected && "scale-110 shadow-xl ring-2 ring-amber-400",
        className,
      )}
      style={{
        width: `${size}px`,
        height: `${size}px`,
      }}
    >
      {/* Base layer with primary color */}
      <div
        className="absolute inset-0 rounded-full"
        style={{
          background: color,
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
      {accentColor && (
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
            background: accentColor,
            opacity: 0.4,
          }}
        />
      )}

      {/* Content overlay (text, icons, etc.) */}
      {children && (
        <div className="relative z-10 flex items-center justify-center w-full h-full">
          {children}
        </div>
      )}
    </button>
  );
}
