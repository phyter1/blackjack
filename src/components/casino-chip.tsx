"use client";

import { cn } from "@/lib/utils";

interface CasinoChipProps {
  value: number;
  color: string;
  accentColor: string;
  onClick?: () => void;
  disabled?: boolean;
  selected?: boolean;
}

export function CasinoChip({
  value,
  color,
  accentColor,
  onClick,
  disabled = false,
  selected = false,
}: CasinoChipProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "relative w-16 h-16 rounded-full transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed",
        !disabled && "hover:scale-110 hover:shadow-lg cursor-pointer",
        selected && "scale-110 shadow-xl ring-2 ring-amber-400"
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
              className="absolute w-1.5 h-1.5 bg-white rounded-full"
              style={{
                top: "50%",
                left: "50%",
                transform: `rotate(${i * 45}deg) translate(-50%, -50%) translateY(-24px)`,
              }}
            />
          ))}
        </div>

        {/* Center value */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className="text-white font-bold text-sm drop-shadow-lg font-serif">
              ${value}
            </div>
          </div>
        </div>

        {/* Inner decorative ring */}
        <div
          className="absolute inset-2 rounded-full border-2 border-white opacity-40"
        />
      </div>
    </button>
  );
}

// Predefined chip configurations
export const CHIP_VALUES = [
  { value: 5, color: "#DC2626", accentColor: "#991B1B" }, // Red
  { value: 10, color: "#2563EB", accentColor: "#1E40AF" }, // Blue
  { value: 25, color: "#16A34A", accentColor: "#15803D" }, // Green
  { value: 50, color: "#1F2937", accentColor: "#111827" }, // Black
  { value: 100, color: "#7C3AED", accentColor: "#5B21B6" }, // Purple
];
