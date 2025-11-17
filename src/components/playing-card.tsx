"use client";

import { cn } from "@/lib/utils";
import type { Card as GameCard } from "@/modules/game/cards";

interface PlayingCardProps {
  card?: GameCard;
  hidden?: boolean;
  className?: string;
  flipped?: boolean;
  size?: "sm" | "md" | "lg" | "xl";
}

const SUIT_SYMBOLS: Record<string, string> = {
  hearts: "♥",
  diamonds: "♦",
  clubs: "♣",
  spades: "♠",
};

const SUIT_COLORS: Record<string, string> = {
  hearts: "#DC2626",
  diamonds: "#DC2626",
  clubs: "#1F2937",
  spades: "#1F2937",
};

export function PlayingCard({
  card,
  hidden = false,
  className,
  flipped = false,
  size = "md",
}: PlayingCardProps) {
  const sizeClasses = {
    sm: "w-16 h-24",
    md: "w-20 h-28",
    lg: "w-24 h-32",
    xl: "w-[104px] h-[146px]",
  };

  const fontSize = {
    sm: { rank: "text-lg", suit: "text-2xl" },
    md: { rank: "text-xl", suit: "text-3xl" },
    lg: { rank: "text-2xl", suit: "text-4xl" },
    xl: { rank: "text-3xl", suit: "text-5xl" },
  };

  if (!card || hidden || flipped) {
    // Card back - vintage pattern
    return (
      <div
        className={cn(
          "relative rounded-lg border-2 border-amber-900 shadow-lg transition-all duration-300",
          sizeClasses[size],
          className
        )}
        style={{
          background: "linear-gradient(135deg, #7C2D12 0%, #991B1B 50%, #7C2D12 100%)",
        }}
      >
        {/* Ornate pattern */}
        <div className="absolute inset-0 flex items-center justify-center opacity-40">
          <div className="grid grid-cols-3 gap-1 p-2">
            {Array.from({ length: 9 }).map((_, i) => (
              <div
                key={i}
                className="w-2 h-2 rounded-full bg-amber-200"
                style={{ transform: `rotate(${i * 40}deg)` }}
              />
            ))}
          </div>
        </div>
        {/* Center medallion */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-8 h-8 rounded-full border-2 border-amber-300 bg-amber-900 flex items-center justify-center">
            <span className="text-amber-200 text-xs font-serif">★</span>
          </div>
        </div>
      </div>
    );
  }

  const suitSymbol = SUIT_SYMBOLS[card.suit];
  const suitColor = SUIT_COLORS[card.suit];

  return (
    <div
      className={cn(
        "relative rounded-lg border-2 border-gray-800 shadow-lg bg-amber-50 transition-all duration-300 hover:shadow-xl",
        sizeClasses[size],
        className
      )}
    >
      {/* Vintage paper texture overlay */}
      <div
        className="absolute inset-0 rounded-lg opacity-10"
        style={{
          backgroundImage:
            "url('data:image/svg+xml,%3Csvg width=\"100\" height=\"100\" xmlns=\"http://www.w3.org/2000/svg\"%3E%3Cfilter id=\"noise\"%3E%3CfeTurbulence type=\"fractalNoise\" baseFrequency=\"0.9\" numOctaves=\"4\" /%3E%3C/filter%3E%3Crect width=\"100\" height=\"100\" filter=\"url(%23noise)\" opacity=\"0.3\"/%3E%3C/svg%3E')",
        }}
      />

      {/* Top-left rank and suit - positioned at edge for visibility when overlapped */}
      <div className="absolute top-0.5 left-0.5 flex flex-col items-center leading-none px-1 py-0.5">
        <span
          className={cn("font-serif font-bold", fontSize[size].rank)}
          style={{ color: suitColor }}
        >
          {card.rank}
        </span>
        <span className={cn("font-serif", fontSize[size].rank)} style={{ color: suitColor }}>
          {suitSymbol}
        </span>
      </div>

      {/* Center suit - subtle background */}
      <div className="absolute inset-0 flex items-center justify-center">
        <span
          className="text-6xl opacity-10"
          style={{ color: suitColor }}
        >
          {suitSymbol}
        </span>
      </div>

      {/* Bottom-right rank and suit (rotated) - positioned at edge */}
      <div
        className="absolute bottom-0.5 right-0.5 flex flex-col items-center leading-none px-1 py-0.5"
        style={{ transform: "rotate(180deg)" }}
      >
        <span
          className={cn("font-serif font-bold", fontSize[size].rank)}
          style={{ color: suitColor }}
        >
          {card.rank}
        </span>
        <span className={cn("font-serif", fontSize[size].rank)} style={{ color: suitColor }}>
          {suitSymbol}
        </span>
      </div>
    </div>
  );
}
