"use client";

interface DiscardTrayProps {
  discardedCards: number;
  totalCards: number;
}

export function DiscardTray({
  discardedCards,
  totalCards,
}: DiscardTrayProps) {
  // Calculate deck count and proportional sizing (matching shoe)
  const deckCount = Math.round(totalCards / 52);

  const deckHeights = {
    1: 68,
    2: 94,
    4: 146,
    6: 198,
    8: 250
  }
  const containerHeight =  deckHeights[deckCount as keyof typeof deckHeights] 

  // Calculate card layers - use same sizing as shoe
  const cardsPerLayer = 4;
  const maxVisibleLayers = Math.ceil(totalCards / cardsPerLayer);
  const discardedLayers = Math.ceil(discardedCards / cardsPerLayer);

  return (
    <div className="fixed left-4 top-1/2 -translate-y-1/2 z-20">
      <div className="flex flex-col items-center gap-2">
        {/* Discard tray label */}
        <div className="text-xs font-semibold text-amber-400 tracking-wider">
          DISCARD
        </div>

        {/* Discard tray container with stacked cards */}
        <div className="relative w-20" style={{ height: `${containerHeight}px` }}>
          {/* Tray base/holder */}
          <div className="absolute inset-0 bg-linear-to-b from-gray-800 to-gray-900 rounded-lg border-2 border-amber-900/50 shadow-lg" />

          {/* Stacked discarded cards visualization - from bottom up */}
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-16" style={{ height: `calc(${containerHeight}px - 1rem)` }}>
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

              return (
                <div
                  key={index}
                  className="absolute left-0 right-0 h-5 rounded-sm border-2 border-amber-900 shadow-sm transition-all duration-500 ease-out"
                  style={{
                    bottom: `${baseOffset}px`,
                    zIndex: cardIndex,
                    opacity: Math.max(0.8, 1 - (cardIndex * 0.003)), // Slight fade for depth
                    background: 'linear-gradient(135deg, #7C2D12 0%, #991B1B 50%, #7C2D12 100%)',
                    transform: 'rotateX(-5deg) rotateY(-5deg)', // Slight 3D tilt - opposite of shoe
                    transformStyle: 'preserve-3d',
                  }}
                >
                  {/* Vintage card back pattern - matching table cards */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-40">
                    <div className="grid grid-cols-3 gap-0.5">
                      {Array.from({ length: 9 }).map((_, i) => (
                        <div
                          key={i}
                          className="w-1 h-1 rounded-full bg-amber-200"
                          style={{ transform: `rotate(${i * 40}deg)` }}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Center medallion */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-2 h-2 rounded-full border border-amber-300 bg-amber-900 flex items-center justify-center">
                      <span className="text-amber-200 text-[6px] font-serif">★</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Card count display - animated */}
        <div className="flex flex-col items-center gap-1 text-center">
          <div className="text-xl font-bold text-amber-200 transition-all duration-300">
            {discardedCards}
          </div>
          <div className="text-[10px] leading-tight text-amber-600">
            cards
            <br />
            dealt
          </div>
        </div>
      </div>
    </div>
  );
}
