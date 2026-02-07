"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import type { Card as GameCard } from "@/modules/game/cards";
import { CardMeisterCard } from "./cardmeister-card";

interface AnimatedCardProps {
  card?: GameCard;
  hidden?: boolean;
  size?: "sm" | "md" | "lg" | "xl";
  dealDelay?: number; // Delay before dealing animation starts (ms)
  flipDelay?: number; // Delay before flip animation starts (ms)
  onAnimationComplete?: () => void;
  sourcePosition?: { x: number; y: number } | null; // Starting position (e.g., from shoe)
}

export function AnimatedCard({
  card,
  hidden = false,
  size = "md",
  dealDelay = 0,
  flipDelay,
  onAnimationComplete,
  sourcePosition,
}: AnimatedCardProps) {
  const [isVisible, setIsVisible] = useState(dealDelay === 0);
  const [isDealing, setIsDealing] = useState(true);
  const [isFlipped, setIsFlipped] = useState(hidden);
  const [animationPhase, setAnimationPhase] = useState<
    "traveling" | "complete"
  >(sourcePosition ? "traveling" : "complete");
  const targetRef = useRef<HTMLDivElement>(null);
  const [travelTransform, setTravelTransform] = useState<string>("");

  // Handle delayed visibility - card doesn't render until it's time to deal
  useEffect(() => {
    if (dealDelay === 0) {
      setIsVisible(true);
      return;
    }

    const visibilityTimer = setTimeout(() => {
      setIsVisible(true);
    }, dealDelay);

    return () => clearTimeout(visibilityTimer);
  }, [dealDelay]);

  useEffect(() => {
    // Calculate travel distance from source to target
    if (sourcePosition && targetRef.current && animationPhase === "traveling") {
      const targetRect = targetRef.current.getBoundingClientRect();
      const deltaX = sourcePosition.x - targetRect.left;
      const deltaY = sourcePosition.y - targetRect.top;
      setTravelTransform(`translate(${deltaX}px, ${deltaY}px)`);

      // Start the traveling animation after a brief moment
      const travelTimer = setTimeout(() => {
        setTravelTransform("translate(0, 0)");
        setAnimationPhase("complete");
      }, 50);

      return () => clearTimeout(travelTimer);
    }
  }, [sourcePosition, animationPhase]);

  useEffect(() => {
    if (!isVisible) return;

    // Deal animation - starts immediately after card becomes visible
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
        const completeTimer = setTimeout(
          onAnimationComplete,
          sourcePosition ? 500 : 300,
        ); // Longer delay for travel animation
        return () => clearTimeout(completeTimer);
      }
    }, 50); // Small delay to allow DOM to render before animation starts

    return () => clearTimeout(dealTimer);
  }, [isVisible, flipDelay, onAnimationComplete, sourcePosition]);

  // Update flipped state when hidden prop changes
  useEffect(() => {
    setIsFlipped(hidden);
  }, [hidden]);

  // Don't render until it's time to deal this card
  if (!isVisible) {
    return null;
  }

  // Simple fade-in animation (no source position)
  if (!sourcePosition) {
    return (
      <div
        className={cn(
          "transition-all duration-300",
          isDealing && "opacity-0 -translate-y-8 scale-90",
        )}
        style={{
          animation: isDealing ? "none" : "cardDeal 0.3s ease-out forwards",
        }}
      >
        <div
          className={cn(
            "transition-all duration-300",
            isFlipped && flipDelay !== undefined && "rotate-y-180",
          )}
          style={{
            transformStyle: "preserve-3d",
          }}
        >
          <CardMeisterCard card={card} hidden={isFlipped} size={size} />
        </div>
      </div>
    );
  }

  // Travel animation (from shoe to hand)
  return (
    <div ref={targetRef} className="relative">
      <div
        className={cn(
          "transition-all",
          animationPhase === "traveling" && "opacity-0 duration-500 ease-out",
          animationPhase === "complete" && "opacity-100",
        )}
        style={{
          transform: travelTransform,
        }}
      >
        <div
          className={cn(
            "transition-all duration-300",
            isFlipped && flipDelay !== undefined && "rotate-y-180",
          )}
          style={{
            transformStyle: "preserve-3d",
          }}
        >
          <CardMeisterCard card={card} hidden={isFlipped} size={size} />
        </div>
      </div>
    </div>
  );
}
