"use client";

import { cn } from "@/lib/utils";
import type { Card as GameCard } from "@/modules/game/cards";
import { CardBack, type CardBackDesign } from "@/lib/cards";
import { selectCardScale, useSettingsStore } from "@/stores/settings";

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
  const cardScale = useSettingsStore(selectCardScale);

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

  // Apply card scale from settings
  const scaleStyle = {
    transform: `scale(${cardScale / 100})`,
    transformOrigin: "center",
  };

  if (!card || hidden || flipped) {
    // Card back - use CardBack from cards library
    const dimensions = {
      sm: { width: 64, height: 96 },
      md: { width: 80, height: 112 },
      lg: { width: 96, height: 128 },
      xl: { width: 104, height: 146 },
    };

    const { width, height } = dimensions[size];

    // Get colors and design from CSS variables
    const computedStyle = getComputedStyle(document.documentElement);
    const primary =
      computedStyle
        .getPropertyValue("--theme-card-back-gradient-middle")
        .trim() || "#991B1B";
    const secondary =
      computedStyle.getPropertyValue("--theme-card-back-pattern").trim() ||
      "#fbbf24";
    const background =
      computedStyle
        .getPropertyValue("--theme-card-back-gradient-start")
        .trim() || "#7c2d12";
    const border =
      computedStyle.getPropertyValue("--theme-card-back-border").trim() ||
      "#78350f";
    const design = (computedStyle
      .getPropertyValue("--theme-card-back-design")
      .trim() || "bicycle-classic") as CardBackDesign;
    const stockColor =
      computedStyle.getPropertyValue("--theme-card-stock").trim() || "#1a1a1a";

    return (
      <div className={className} style={scaleStyle}>
        <CardBack
          design={design}
          colors={{
            primary,
            secondary,
            background,
            border,
          }}
          stockColor={stockColor}
          width={width}
          height={height}
          borderRadius={12}
        />
      </div>
    );
  }

  const suitSymbol = SUIT_SYMBOLS[card.suit];
  const suitColor = SUIT_COLORS[card.suit];

  return (
    <div
      className={cn(
        "relative rounded-lg shadow-lg transition-all duration-300 hover:shadow-xl",
        sizeClasses[size],
        className,
      )}
      style={{
        backgroundColor: "var(--theme-card-face-bg)",
        border: "3px solid var(--theme-card-stock)",
        fontFamily: "var(--theme-card-face-font)",
        boxSizing: "border-box",
        ...scaleStyle,
      }}
    >
      {/* Vintage paper texture overlay */}
      <div
        className="absolute inset-0 rounded-lg opacity-10"
        style={{
          backgroundImage:
            'url(\'data:image/svg+xml,%3Csvg width="100" height="100" xmlns="http://www.w3.org/2000/svg"%3E%3Cfilter id="noise"%3E%3CfeTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="4" /%3E%3C/filter%3E%3Crect width="100" height="100" filter="url(%23noise)" opacity="0.3"/%3E%3C/svg%3E\')',
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
        <span
          className={cn("font-serif", fontSize[size].rank)}
          style={{ color: suitColor }}
        >
          {suitSymbol}
        </span>
      </div>

      {/* Center suit - subtle background */}
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-6xl opacity-10" style={{ color: suitColor }}>
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
        <span
          className={cn("font-serif", fontSize[size].rank)}
          style={{ color: suitColor }}
        >
          {suitSymbol}
        </span>
      </div>
    </div>
  );
}
