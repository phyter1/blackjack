"use client";

import { useState, useEffect } from "react";
import { PlayingCard } from "./playing-card";
import type { Card as GameCard } from "@/modules/game/card";
import { cn } from "@/lib/utils";

interface AnimatedCardProps {
  card?: GameCard;
  hidden?: boolean;
  size?: "sm" | "md" | "lg" | "xl";
  dealDelay?: number; // Delay before dealing animation starts (ms)
  flipDelay?: number; // Delay before flip animation starts (ms)
  onAnimationComplete?: () => void;
}

export function AnimatedCard({
  card,
  hidden = false,
  size = "md",
  dealDelay = 0,
  flipDelay,
  onAnimationComplete,
}: AnimatedCardProps) {
  const [isDealing, setIsDealing] = useState(true);
  const [isFlipped, setIsFlipped] = useState(hidden);

  useEffect(() => {
    // Deal animation
    const dealTimer = setTimeout(() => {
      setIsDealing(false);

      // Handle flip animation if specified
      if (flipDelay !== undefined) {
        const flipTimer = setTimeout(() => {
          setIsFlipped(false);
          if (onAnimationComplete) {
            setTimeout(onAnimationComplete, 300); // After flip completes
          }
        }, flipDelay);
        return () => clearTimeout(flipTimer);
      } else if (onAnimationComplete) {
        setTimeout(onAnimationComplete, 300); // After deal completes
      }
    }, dealDelay);

    return () => clearTimeout(dealTimer);
  }, [dealDelay, flipDelay, onAnimationComplete]);

  // Update flipped state when hidden prop changes
  useEffect(() => {
    setIsFlipped(hidden);
  }, [hidden]);

  return (
    <div
      className={cn(
        "transition-all duration-300",
        isDealing && "opacity-0 -translate-y-8 scale-90"
      )}
      style={{
        animation: isDealing ? "none" : "cardDeal 0.3s ease-out forwards",
      }}
    >
      <div
        className={cn(
          "transition-all duration-300",
          isFlipped && flipDelay !== undefined && "rotate-y-180"
        )}
        style={{
          transformStyle: "preserve-3d",
        }}
      >
        <PlayingCard
          card={card}
          hidden={isFlipped}
          size={size}
        />
      </div>
    </div>
  );
}
