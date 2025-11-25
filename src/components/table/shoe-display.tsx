"use client";

import { MiniCardBack } from "../mini-card-back";
import { selectCardScale, useSettingsStore } from "@/stores/settings";

interface ShoeDisplayProps {
  remainingCards: number;
  totalCards: number;
  cutCardPosition: number;
  penetration: number;
  isComplete: boolean;
}

export function ShoeDisplay({
  remainingCards,
  totalCards,
  cutCardPosition,
  isComplete,
}: ShoeDisplayProps) {
  const cardScale = useSettingsStore(selectCardScale);

  // Calculate deck count and proportional sizing
  const deckCount = Math.round(totalCards / 52);

  const deckHeights = {
    1: 68,
    2: 94,
    4: 146,
    6: 198,
    8: 250,
  };
  const containerHeight = deckHeights[deckCount as keyof typeof deckHeights];
  const _containerHeightClass = `h-[${containerHeight}px]`;

  // Calculate percentages for visual representation
  const remainingPercentage = (remainingCards / totalCards) * 100;
  const cutCardPercentage = (cutCardPosition / totalCards) * 100;

  // Determine proximity to cut card for visual warnings
  const nearCutCard = remainingPercentage <= cutCardPercentage + 5;
  const atCutCard = isComplete;

  // Calculate card layers - use smaller groups for more granular animation
  // Each layer represents 3-4 cards for smoother visual changes
  const cardsPerLayer = 4;
  const maxVisibleLayers = Math.ceil(totalCards / cardsPerLayer); // ~78 layers for 312 cards
  const currentLayers = Math.ceil(remainingCards / cardsPerLayer);

  // Calculate cut card layer position from the bottom of current stack
  // cutCardPosition is the number of cards remaining when cut card is reached
  // We need to find which layer from the bottom of the current stack
  const cutCardLayer =
    currentLayers - Math.ceil(cutCardPosition / cardsPerLayer);

  return (
    <div
      className="fixed right-4 top-1/2 -translate-y-1/2 z-20"
      data-shoe-display="true"
      style={{ transform: `translateY(-50%) scale(${cardScale / 100})`, transformOrigin: "center" }}
    >
      <div className="flex flex-col items-center gap-2">
        {/* Shoe label */}
        <div
          className="text-xs font-semibold tracking-wider"
          style={{ color: "var(--theme-accent)" }}
        >
          SHOE
        </div>

        {/* Main shoe container with warning indicators on the side */}
        <div className="flex items-start gap-3">
          {/* Shoe and card count - centered column */}
          <div className="flex flex-col items-center gap-2">
            {/* Shoe container with stacked cards */}
            <div
              className="relative w-20"
              style={{
                height: `${containerHeight}px`,
                perspective: "500px",
                perspectiveOrigin: "50% 40%",
              }}
            >
          {/* 3D Shoe Structure */}
          <div
            className="absolute inset-0"
            style={{
              transformStyle: "preserve-3d",
              transform: "rotateX(8deg) rotateY(-3deg)",
            }}
          >
            {/* Base platform */}
            <div
              className="absolute bottom-0 left-1/2 -translate-x-1/2 rounded-sm"
              style={{
                width: "85px",
                height: "12px",
                background: "linear-gradient(to bottom, #1a0f0a 0%, #0d0705 100%)",
                transform: "translateZ(-25px) rotateX(-90deg)",
                transformOrigin: "center top",
                boxShadow: "0 4px 8px rgba(0,0,0,0.5)",
              }}
            />

            {/* Back plate - angled */}
            <div
              className="absolute inset-x-0 rounded-t-lg"
              style={{
                top: "8px",
                bottom: "8px",
                background: `
                  linear-gradient(135deg,
                    #2c1810 0%,
                    #1f1108 40%,
                    #1a0f0a 100%
                  )
                `,
                transform: "translateZ(-22px) rotateX(-12deg)",
                transformOrigin: "center bottom",
                boxShadow: "inset 0 2px 4px rgba(0,0,0,0.3)",
                border: "1px solid #0d0705",
              }}
            />

            {/* Left side wall */}
            <div
              className="absolute left-0 rounded-l-lg"
              style={{
                top: "8px",
                bottom: "8px",
                width: "22px",
                background: "linear-gradient(to right, #0d0705 0%, #1a0f0a 100%)",
                transform: "translateZ(-22px) rotateY(85deg)",
                transformOrigin: "left center",
                boxShadow: "inset 2px 0 4px rgba(0,0,0,0.4)",
              }}
            />

            {/* Right side wall */}
            <div
              className="absolute right-0 rounded-r-lg"
              style={{
                top: "8px",
                bottom: "8px",
                width: "22px",
                background: "linear-gradient(to left, #0d0705 0%, #1a0f0a 100%)",
                transform: "translateZ(-22px) rotateY(-85deg)",
                transformOrigin: "right center",
                boxShadow: "inset -2px 0 4px rgba(0,0,0,0.4)",
              }}
            />

            {/* Front opening/slot */}
            <div
              className="absolute inset-x-2 bottom-2 rounded-sm"
              style={{
                height: "28px",
                background: "linear-gradient(to bottom, #0a0604 0%, #000000 100%)",
                boxShadow: "inset 0 2px 6px rgba(0,0,0,0.8)",
                border: "1px solid #000000",
              }}
            />

            {/* Inner felt (visible through opening) */}
            <div
              className="absolute inset-x-3 rounded-sm"
              style={{
                top: "10px",
                height: "20px",
                background: "linear-gradient(to bottom, #0f4d3a 0%, #0a3326 100%)",
                transform: "translateZ(-20px)",
                opacity: 0.6,
              }}
            />
          </div>

          {/* Stacked cards visualization - from top down */}
          <div
            className="absolute top-2 left-1/2 -translate-x-1/2 w-16"
            style={{
              height: `calc(${containerHeight}px - 1rem)`,
              transformStyle: "preserve-3d",
            }}
          >
            {Array.from({ length: maxVisibleLayers }).map((_, index) => {
              // Only show cards that are still in the shoe
              if (index >= currentLayers) return null;

              // Calculate position from top (cards stack downward)
              const cardIndex = index;
              const isCutCard = cardIndex === cutCardLayer;

              // Calculate vertical offset (stacked effect)
              // Use dynamic spacing: more layers = tighter stacking
              const totalHeight = containerHeight - 16; // Available height in px (container minus padding)
              const spacing = Math.min(2, totalHeight / maxVisibleLayers); // Dynamic spacing
              const baseOffset = cardIndex * spacing;

              // Add slight random variation for realism (but consistent per card)
              const randomSeed = (cardIndex * 37) % 100; // Deterministic "random"
              const randomRotation = (randomSeed / 100 - 0.5) * 1.2; // ±0.6 degrees
              const randomOffset = (randomSeed / 100 - 0.5) * 0.8; // ±0.4px

              // Cards lean forward towards the front opening at ~18 degrees
              const leanAngle = 18;

              // Compression effect - cards at bottom are slightly more compressed
              const compressionFactor = 1 - (cardIndex / maxVisibleLayers) * 0.15;

              return (
                <div
                  key={`card-${cardIndex}`}
                  className="absolute left-0 right-0 transition-all duration-500 ease-out"
                  style={{
                    top: `${baseOffset}px`,
                    zIndex: maxVisibleLayers - cardIndex,
                    transformStyle: "preserve-3d",
                  }}
                >
                  {/* Card with thickness */}
                  <div
                    className="relative rounded-sm"
                    style={{
                      height: `${20 * compressionFactor}px`,
                      transform: `
                        rotateX(${leanAngle}deg)
                        rotateZ(${randomRotation}deg)
                        translateX(${randomOffset}px)
                      `,
                      transformStyle: "preserve-3d",
                      transformOrigin: "center bottom",
                      opacity: Math.max(0.85, 1 - cardIndex * 0.002),
                      filter: atCutCard
                        ? "none"
                        : nearCutCard
                          ? "hue-rotate(20deg) brightness(1.2)"
                          : "none",
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

                    {/* Cut card marker */}
                    {isCutCard && (
                      <>
                        {/* Yellow indicator on the card itself */}
                        <div
                          className={`absolute inset-0 border-2 border-yellow-400 rounded-sm ${nearCutCard ? "animate-pulse" : ""}`}
                          style={{
                            boxShadow: "0 0 8px rgba(250, 204, 21, 0.6)",
                            transform: "translateZ(1px)",
                          }}
                        />

                        {/* Arrow pointing to cut card */}
                        <div className="absolute -right-4 top-1/2 -translate-y-1/2 flex items-center gap-1">
                          <div
                            className={`w-2 h-2 bg-yellow-400 rotate-45 ${nearCutCard ? "animate-pulse" : ""}`}
                          />
                          {nearCutCard && (
                            <div className="text-[8px] font-bold text-yellow-400 whitespace-nowrap animate-pulse">
                              CUT
                            </div>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Shuffle warning overlay */}
          {isComplete && (
            <div
              className="absolute inset-0 bg-red-900/20 backdrop-blur-[1px] rounded-lg flex items-center justify-center animate-in fade-in duration-500"
              style={{
                transform: "translateZ(5px)",
              }}
            >
              <div className="text-red-400 text-xs font-bold -rotate-90 whitespace-nowrap animate-pulse">
                SHUFFLE
              </div>
            </div>
          )}
            </div>

            {/* Card count display - animated */}
            <div className="flex flex-col items-center gap-1 text-center">
              <div
                className={`text-xl font-bold transition-all duration-300 ${
                  atCutCard
                    ? "animate-pulse scale-110"
                    : nearCutCard
                      ? "animate-pulse"
                      : ""
                }`}
                style={{
                  color: atCutCard
                    ? "var(--theme-error)"
                    : nearCutCard
                      ? "var(--theme-warning)"
                      : "var(--theme-text-primary)",
                }}
              >
                {remainingCards}
              </div>
              <div
                className={`text-[10px] leading-tight transition-colors duration-300`}
                style={{
                  color: atCutCard
                    ? "var(--theme-error)"
                    : nearCutCard
                      ? "var(--theme-warning)"
                      : "var(--theme-text-muted)",
                }}
              >
                cards
                <br />
                left
              </div>
            </div>
          </div>

          {/* Warning indicators - positioned to the right of the shoe */}
          <div className="flex flex-col gap-2 min-w-[60px]">
            {nearCutCard && !atCutCard && (
              <div className="flex flex-col items-start gap-1">
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse" />
                  <div className="text-[9px] text-yellow-400 font-semibold animate-pulse whitespace-nowrap">
                    NEAR CUT
                  </div>
                </div>
              </div>
            )}

            {atCutCard && (
              <div className="flex flex-col items-start gap-1">
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                  <div className="text-[9px] text-red-400 font-semibold animate-pulse whitespace-nowrap">
                    RESHUFFLE
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
