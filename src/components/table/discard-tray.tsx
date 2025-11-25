"use client";

import { MiniCardBack } from "../mini-card-back";
import { selectCardScale, useSettingsStore } from "@/stores/settings";

interface DiscardTrayProps {
  discardedCards: number;
  totalCards: number;
}

export function DiscardTray({ discardedCards, totalCards }: DiscardTrayProps) {
  const cardScale = useSettingsStore(selectCardScale);

  // Calculate deck count and proportional sizing (matching shoe)
  const deckCount = Math.round(totalCards / 52);

  const deckHeights = {
    1: 68,
    2: 94,
    4: 146,
    6: 198,
    8: 250,
  };
  const containerHeight = deckHeights[deckCount as keyof typeof deckHeights];

  // Calculate card layers - use same sizing as shoe
  const cardsPerLayer = 4;
  const maxVisibleLayers = Math.ceil(totalCards / cardsPerLayer);
  const discardedLayers = Math.ceil(discardedCards / cardsPerLayer);

  return (
    <div
      className="fixed left-4 top-1/2 -translate-y-1/2 z-20"
      style={{ transform: `translateY(-50%) scale(${cardScale / 100})`, transformOrigin: "center" }}
    >
      <div className="flex flex-col items-center gap-2">
        {/* Discard tray label */}
        <div
          className="text-xs font-semibold tracking-wider"
          style={{ color: "var(--theme-accent)" }}
        >
          DISCARD
        </div>

        {/* Discard tray container with stacked cards */}
        <div
          className="relative w-20"
          style={{
            height: `${containerHeight}px`,
            perspective: "500px",
            perspectiveOrigin: "50% 60%",
          }}
        >
          {/* 3D Tray Structure */}
          <div
            className="absolute inset-0"
            style={{
              transformStyle: "preserve-3d",
              transform: "rotateX(5deg) rotateY(3deg)",
            }}
          >
            {/* Base platform */}
            <div
              className="absolute bottom-0 left-1/2 -translate-x-1/2 rounded-sm"
              style={{
                width: "85px",
                height: "12px",
                background: "linear-gradient(to bottom, #1a0f0a 0%, #0d0705 100%)",
                transform: "translateZ(-8px) rotateX(-90deg)",
                transformOrigin: "center top",
                boxShadow: "0 4px 8px rgba(0,0,0,0.5)",
              }}
            />

            {/* Back edge - lower profile than shoe */}
            <div
              className="absolute inset-x-0 rounded-t-lg"
              style={{
                top: "8px",
                height: "20px",
                background: `linear-gradient(135deg, #2c1810 0%, #1f1108 40%, #1a0f0a 100%)`,
                transform: "translateZ(-6px)",
                boxShadow: "inset 0 1px 3px rgba(0,0,0,0.3)",
                border: "1px solid #0d0705",
              }}
            />

            {/* Left side wall - shorter */}
            <div
              className="absolute left-0 rounded-l-lg"
              style={{
                top: "8px",
                bottom: "8px",
                width: "8px",
                background: "linear-gradient(to right, #0d0705 0%, #1a0f0a 100%)",
                transform: "translateZ(-6px) rotateY(88deg)",
                transformOrigin: "left center",
                boxShadow: "inset 1px 0 3px rgba(0,0,0,0.4)",
              }}
            />

            {/* Right side wall - shorter */}
            <div
              className="absolute right-0 rounded-r-lg"
              style={{
                top: "8px",
                bottom: "8px",
                width: "8px",
                background: "linear-gradient(to left, #0d0705 0%, #1a0f0a 100%)",
                transform: "translateZ(-6px) rotateY(-88deg)",
                transformOrigin: "right center",
                boxShadow: "inset -1px 0 3px rgba(0,0,0,0.4)",
              }}
            />

            {/* Front edge */}
            <div
              className="absolute inset-x-0 bottom-0 rounded-b-lg"
              style={{
                height: "20px",
                background: "linear-gradient(to bottom, #1a0f0a 0%, #0d0705 100%)",
                transform: "translateZ(-6px)",
                boxShadow: "inset 0 -1px 3px rgba(0,0,0,0.3)",
                border: "1px solid #0d0705",
              }}
            />

            {/* Inner felt base (visible inside tray) */}
            <div
              className="absolute inset-x-2 inset-y-2 rounded-sm"
              style={{
                background: "linear-gradient(to bottom, #0f4d3a 0%, #0a3326 100%)",
                transform: "translateZ(-5px)",
                opacity: 0.7,
              }}
            />
          </div>

          {/* Stacked discarded cards visualization - from bottom up */}
          <div
            className="absolute bottom-2 left-1/2 -translate-x-1/2 w-16"
            style={{
              height: `calc(${containerHeight}px - 1rem)`,
              transformStyle: "preserve-3d",
            }}
          >
            {Array.from({ length: maxVisibleLayers }).map((_, index) => {
              // Only show cards that have been discarded
              if (index >= discardedLayers) return null;

              // Calculate position from bottom (cards stack upward)
              const cardIndex = index;

              // Calculate vertical offset (stacked effect)
              // Use dynamic spacing: more layers = tighter stacking
              const totalHeight = containerHeight - 16; // Available height in px (container minus padding)
              const spacing = Math.min(2, totalHeight / maxVisibleLayers); // Dynamic spacing
              const baseOffset = cardIndex * spacing;

              // Add slight random variation for realism (but consistent per card)
              const randomSeed = (cardIndex * 43) % 100; // Deterministic "random"
              const randomRotation = (randomSeed / 100 - 0.5) * 1.5; // ±0.75 degrees (slightly more chaos than shoe)
              const randomOffset = (randomSeed / 100 - 0.5) * 1.2; // ±0.6px

              // Cards in discard tray are nearly flat with very slight forward tilt
              const leanAngle = 3;

              // Slight expansion effect - cards spread slightly as more are added
              const expansionFactor = 1 + (cardIndex / maxVisibleLayers) * 0.05;

              // Add Z-depth to prevent overlap artifacts
              // Each card should be behind the next one in 3D space
              const zDepth = cardIndex * 0.5;

              return (
                <div
                  key={`discard-${cardIndex}`}
                  className="absolute left-0 right-0 transition-all duration-500 ease-out"
                  style={{
                    bottom: `${baseOffset}px`,
                    zIndex: cardIndex,
                    transformStyle: "preserve-3d",
                  }}
                >
                  {/* Card with thickness */}
                  <div
                    className="relative rounded-sm"
                    style={{
                      height: `${20 * expansionFactor}px`,
                      transform: `
                        translateZ(${zDepth}px)
                        rotateX(${leanAngle}deg)
                        rotateZ(${randomRotation}deg)
                        translateX(${randomOffset}px)
                      `,
                      transformStyle: "preserve-3d",
                      transformOrigin: "center bottom",
                      opacity: Math.max(0.85, 1 - cardIndex * 0.002),
                    }}
                  >
                    {/* Card front (back design) */}
                    <div
                      className="absolute inset-0 overflow-hidden rounded-sm"
                      style={{
                        transform: "translateZ(0.5px)",
                        boxShadow: "0 1px 2px rgba(0,0,0,0.4)",
                      }}
                    >
                      <MiniCardBack className="w-full h-full" />
                    </div>

                    {/* Card thickness/edge - white paper stock */}
                    <div
                      className="absolute inset-x-0 rounded-b-sm"
                      style={{
                        bottom: "-1px",
                        height: "2px",
                        background: "linear-gradient(to bottom, #f5f5f5 0%, #e5e5e5 50%, #d0d0d0 100%)",
                        transform: "rotateX(90deg)",
                        transformOrigin: "center top",
                        boxShadow: "inset 0 1px 0 rgba(0,0,0,0.1)",
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Card count display - animated */}
        <div className="flex flex-col items-center gap-1 text-center">
          <div
            className="text-xl font-bold transition-all duration-300"
            style={{ color: "var(--theme-text-primary)" }}
          >
            {discardedCards}
          </div>
          <div
            className="text-[10px] leading-tight"
            style={{ color: "var(--theme-text-muted)" }}
          >
            cards
            <br />
            dealt
          </div>
        </div>
      </div>
    </div>
  );
}
