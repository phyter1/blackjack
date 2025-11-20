"use client";

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
  const cutCardLayer = currentLayers - Math.ceil(cutCardPosition / cardsPerLayer);

  return (
    <div className="fixed right-4 top-1/2 -translate-y-1/2 z-20">
      <div className="flex flex-col items-center gap-2">
        {/* Shoe label */}
        <div className="text-xs font-semibold text-amber-400 tracking-wider">
          SHOE
        </div>

        {/* Shoe container with stacked cards */}
        <div className="relative w-20 h-48">
          {/* Shoe base/holder */}
          <div className="absolute inset-0 bg-linear-to-b from-gray-800 to-gray-900 rounded-lg border-2 border-amber-900/50 shadow-lg" />

          {/* Stacked cards visualization - from top down */}
          <div className="absolute top-2 left-1/2 -translate-x-1/2 w-16 h-[calc(100%-1rem)]">
            {Array.from({ length: maxVisibleLayers }).map((_, index) => {
              // Only show cards that are still in the shoe
              if (index >= currentLayers) return null;

              // Calculate position from top (cards stack downward)
              const cardIndex = index;
              const isCutCard = cardIndex === cutCardLayer;

              // Calculate vertical offset (stacked effect)
              // Use dynamic spacing: more layers = tighter stacking
              const totalHeight = 176; // Available height in px (h-48 minus padding)
              const spacing = Math.min(2, totalHeight / maxVisibleLayers); // Dynamic spacing
              const baseOffset = cardIndex * spacing;

              return (
                <div
                  key={index}
                  className="absolute left-0 right-0 h-5 rounded-sm border-2 border-amber-900 shadow-sm transition-all duration-500 ease-out"
                  style={{
                    top: `${baseOffset}px`,
                    zIndex: maxVisibleLayers - cardIndex,
                    opacity: Math.max(0.8, 1 - (cardIndex * 0.003)), // Slight fade for depth
                    background: atCutCard
                      ? 'linear-gradient(135deg, #7C2D12 0%, #991B1B 50%, #7C2D12 100%)'
                      : nearCutCard
                      ? 'linear-gradient(135deg, #854D0E 0%, #A16207 50%, #854D0E 100%)'
                      : 'linear-gradient(135deg, #7C2D12 0%, #991B1B 50%, #7C2D12 100%)',
                    transform: 'rotateX(-5deg) rotateY(5deg)', // Slight 3D tilt - opposite direction
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

                  {/* Cut card marker */}
                  {isCutCard && (
                    <>
                      {/* Yellow indicator on the card itself */}
                      <div className={`absolute inset-0 border-2 border-yellow-400 rounded-sm ${nearCutCard ? 'animate-pulse' : ''}`}
                           style={{ boxShadow: '0 0 8px rgba(250, 204, 21, 0.6)' }} />

                      {/* Arrow pointing to cut card */}
                      <div className="absolute -right-4 top-1/2 -translate-y-1/2 flex items-center gap-1">
                        <div className={`w-2 h-2 bg-yellow-400 rotate-45 ${nearCutCard ? 'animate-pulse' : ''}`} />
                        {nearCutCard && (
                          <div className="text-[8px] font-bold text-yellow-400 whitespace-nowrap animate-pulse">
                            CUT
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>

          {/* Shuffle warning overlay */}
          {isComplete && (
            <div className="absolute inset-0 bg-red-900/20 backdrop-blur-[1px] rounded-lg flex items-center justify-center animate-in fade-in duration-500">
              <div className="text-red-400 text-xs font-bold rotate-[-90deg] whitespace-nowrap animate-pulse">
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
                ? 'text-red-400 animate-pulse scale-110'
                : nearCutCard
                ? 'text-yellow-400 animate-pulse'
                : 'text-amber-200'
            }`}
          >
            {remainingCards}
          </div>
          <div
            className={`text-[10px] leading-tight transition-colors duration-300 ${
              atCutCard
                ? 'text-red-400'
                : nearCutCard
                ? 'text-yellow-400'
                : 'text-amber-600'
            }`}
          >
            cards
            <br />
            left
          </div>
        </div>

        {/* Warning indicators */}
        {nearCutCard && !atCutCard && (
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse" />
            <div className="text-[9px] text-yellow-400 font-semibold animate-pulse">
              NEAR CUT
            </div>
          </div>
        )}

        {/* Reshuffle warning when at cut card */}
        {atCutCard && (
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
            <div className="text-[9px] text-red-400 font-semibold animate-pulse">
              RESHUFFLE
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
