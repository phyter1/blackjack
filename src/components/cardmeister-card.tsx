"use client";

import React, { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import type { Card as GameCard } from "@/modules/game/cards";
import { useThemeStore, selectThemeColors } from "@/stores/theme";
import { CardBack } from "@/lib/cards";

interface CardMeisterCardProps {
  card?: GameCard;
  hidden?: boolean;
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
}

const SUIT_MAP: Record<string, string> = {
  hearts: "hearts",
  diamonds: "diamonds",
  clubs: "clubs",
  spades: "spades",
};

const RANK_MAP: Record<string, string> = {
  A: "ace",
  "2": "two",
  "3": "three",
  "4": "four",
  "5": "five",
  "6": "six",
  "7": "seven",
  "8": "eight",
  "9": "nine",
  "10": "ten",
  J: "jack",
  Q: "queen",
  K: "king",
};

const SIZE_MAP = {
  sm: { width: "48px", height: "67px" },
  md: { width: "62px", height: "88px" },
  lg: { width: "77px", height: "108px" },
  xl: { width: "84px", height: "118px" },
};

/**
 * Calculate luminance of a color to determine if it's dark
 * Returns true if color is dark (needs light text for contrast)
 */
function isColorDark(color: string): boolean {
  // Convert hex to RGB
  const hex = color.replace("#", "");
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);

  // Calculate relative luminance using sRGB coefficients
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

  // Dark if luminance is less than 0.6 (higher threshold for better contrast)
  return luminance < 0.6;
}

export function CardMeisterCard({
  card,
  hidden = false,
  className,
  size = "md",
}: CardMeisterCardProps) {
  const scriptLoaded = useRef(false);
  const themeColors = useThemeStore(selectThemeColors);

  useEffect(() => {
    if (!scriptLoaded.current) {
      const script = document.createElement("script");
      script.src = "/lib/cardmeister.min.js";
      script.async = true;
      document.head.appendChild(script);
      scriptLoaded.current = true;
    }
  }, []);

  const sizeStyle = SIZE_MAP[size];

  // Fallback colors if cards theme is not defined (backward compatibility)
  const cardBackColor = themeColors.cards?.back.gradient.middle || "#991B1B";
  const cardBackBorder = themeColors.cards?.back.border || "#78350f";
  const cardStockColor = themeColors.cards?.stock?.color || "#1a1a1a";

  // Create a unique key based on colors to force re-render when theme changes
  const colorKey = `${cardBackColor}-${cardStockColor}`;

  if (!card || hidden) {
    // Use CardBack from the new cards library with themed colors
    const dimensions = {
      sm: { width: 48, height: 67 },
      md: { width: 62, height: 88 },
      lg: { width: 77, height: 108 },
      xl: { width: 84, height: 118 },
    };

    const { width, height } = dimensions[size];

    return (
      <div className={cn("inline-block", className)} style={{ padding: "6px" }}>
        <CardBack
          design={themeColors.cards?.back.design || "bicycle-classic"}
          colors={{
            primary: cardBackColor,
            secondary: themeColors.cards?.back.patternColor || "#fbbf24",
            background: themeColors.cards?.back.gradient.start || "#7c2d12",
            border: cardBackBorder,
          }}
          stockColor={cardStockColor}
          width={width}
          height={height}
          borderRadius={8}
        />
      </div>
    );
  }

  const suit = SUIT_MAP[card.suit];
  const rank = RANK_MAP[card.rank];

  // Determine suit colors based on stock color darkness
  // Format: spades, hearts, diamonds, clubs
  const isDark = isColorDark(cardStockColor);
  const blackSuitColor = isDark ? "#ffffff" : "#1F2937"; // Pure white for dark, dark gray for light
  const redSuitColor = isDark ? "#ff4444" : "#DC2626"; // Bright red for dark backgrounds, standard for light
  const suitColors = `${blackSuitColor},${redSuitColor},${redSuitColor},${blackSuitColor}`;

  return (
    <div className={cn("inline-block", className)}>
      {/* @ts-expect-error - playing-card is a custom element from cardmeister.min.js */}
      <playing-card
        key={colorKey}
        suit={suit}
        rank={rank}
        cardcolor={cardStockColor}
        suitcolor={suitColors}
        rankcolor={suitColors}
        bordercolor="transparent"
        borderline="0"
        borderradius="8px"
        style={sizeStyle}
        class="shadow-lg transition-all duration-300 hover:shadow-xl"
      />
    </div>
  );
}
