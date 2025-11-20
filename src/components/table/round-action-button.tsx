"use client";

import { cn } from "@/lib/utils";

interface RoundActionButtonProps {
  label: string;
  color: string;
  accentColor: string;
  onClick: () => void;
  disabled?: boolean;
}

export function RoundActionButton({
  label,
  color,
  accentColor,
  onClick,
  disabled = false,
}: RoundActionButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "relative w-21 h-21 rounded-full transition-all duration-200",
        !disabled && "hover:scale-110 hover:shadow-xl cursor-pointer active:scale-105",
        disabled && "opacity-50 cursor-not-allowed"
      )}
      style={{
        background: disabled
          ? `radial-gradient(circle at 30% 30%, #4B5563 0%, #374151 100%)`
          : `radial-gradient(circle at 30% 30%, ${color} 0%, ${accentColor} 100%)`,
      }}
    >
      {/* Outer ring */}
      <div
        className="absolute inset-0 rounded-full border-3"
        style={{ borderColor: disabled ? "#374151" : accentColor }}
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
                transform: `rotate(${i * 45}deg) translate(-50%, -50%) translateY(-36px)`,
              }}
            />
          ))}
        </div>

        {/* Center label */}
        <div className="absolute inset-0 flex items-center justify-center px-2">
          <div className="text-center">
            <div className="text-white font-bold text-xs drop-shadow-lg font-serif uppercase leading-tight">
              {label}
            </div>
          </div>
        </div>

        {/* Inner decorative ring */}
        <div className="absolute inset-2 rounded-full border-2 border-white opacity-40" />
      </div>
    </button>
  );
}
