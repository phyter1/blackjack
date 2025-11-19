"use client";

import { useState } from "react";
import { CasinoChip, CHIP_VALUES } from "@/components/casino-chip";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface BettingPhaseProps {
  currentBalance: number;
  practiceBalance?: number;
  isTrainerActive: boolean;
  maxPlayableHands?: number; // 1-5, defaults to 5
  previousBets: number[] | null;
  onBet: (bets: number[]) => void;
  onSetPreviousBets: (bets: number[] | null) => void;
}

export function BettingPhase({
  currentBalance,
  practiceBalance = 0,
  isTrainerActive,
  maxPlayableHands = 5,
  previousBets,
  onBet,
  onSetPreviousBets,
}: BettingPhaseProps) {
  // Always track all 5 positions
  const [handBets, setHandBets] = useState<number[]>([0, 0, 0, 0, 0]);
  const [selectedChipValue, setSelectedChipValue] = useState<number | null>(
    null,
  );

  const availableBalance = isTrainerActive ? practiceBalance : currentBalance;
  const totalBet = handBets.reduce((sum, bet) => sum + bet, 0);

  // Calculate which positions are playable based on maxPlayableHands
  const getPlayablePositions = (): number[] => {
    // If only 1 hand allowed, show center position (index 2)
    if (maxPlayableHands === 1) return [2];
    // If 2 hands, show positions 1 and 3
    if (maxPlayableHands === 2) return [1, 3];
    // If 3 hands, show positions 1, 2, 3
    if (maxPlayableHands === 3) return [1, 2, 3];
    // If 4 hands, show positions 0, 1, 3, 4
    if (maxPlayableHands === 4) return [0, 1, 3, 4];
    // If 5 hands, show all positions
    return [0, 1, 2, 3, 4];
  };

  const playablePositions = getPlayablePositions();

  const handlePlaceBet = () => {
    // Filter only hands with bets >= 10
    const validBets = handBets.filter((bet) => bet >= 10);
    if (validBets.length > 0 && totalBet > 0) {
      onSetPreviousBets([...handBets]);
      onBet(validBets);
      setHandBets([0, 0, 0, 0, 0]);
      setSelectedChipValue(null);
    }
  };

  const handleReBet = () => {
    if (!previousBets) return;
    const totalPreviousBet = previousBets.reduce((sum, bet) => sum + bet, 0);
    if (totalPreviousBet <= availableBalance) {
      setHandBets([...previousBets]);
    }
  };

  const handleReBetAndDouble = () => {
    if (!previousBets) return;
    const doubledBets = previousBets.map((bet) => bet * 2);
    const totalDoubledBet = doubledBets.reduce((sum, bet) => sum + bet, 0);
    if (totalDoubledBet <= availableBalance) {
      setHandBets(doubledBets);
    }
  };

  const handleChipClick = (chipValue: number) => {
    // Toggle selection: if already selected, deselect; otherwise select
    if (selectedChipValue === chipValue) {
      setSelectedChipValue(null);
    } else {
      setSelectedChipValue(chipValue);
    }
  };

  const handleBettingCircleClick = (positionIndex: number) => {
    if (!playablePositions.includes(positionIndex)) return;
    if (selectedChipValue === null) return;

    // Add selected chip value to this position
    if (totalBet + selectedChipValue <= availableBalance) {
      setHandBets((prev) => {
        const newBets = [...prev];
        newBets[positionIndex] = prev[positionIndex] + selectedChipValue;
        return newBets;
      });
    }
  };

  const handleClearPosition = (positionIndex: number) => {
    setHandBets((prev) => {
      const newBets = [...prev];
      newBets[positionIndex] = 0;
      return newBets;
    });
  };

  const handleClearAllBets = () => {
    setHandBets([0, 0, 0, 0, 0]);
  };

  const activeBetsCount = handBets.filter((bet) => bet >= 10).length;
  const hasInvalidBets = handBets.some((bet) => bet > 0 && bet < 10);

  return (
    <div className="flex flex-col items-center gap-6 pb-20">
      {isTrainerActive && (
        <div className="px-4 py-2 bg-blue-950/80 border border-blue-500/50 rounded-lg text-blue-200 text-sm">
          🎓 <strong>Practice Mode</strong> - Using virtual balance, real
          bankroll is safe
        </div>
      )}

      <div className="text-amber-200 font-serif text-xl">Place Your Bets</div>

      {/* Instruction text */}
      <div className="text-amber-400/80 text-sm text-center">
        {selectedChipValue === null
          ? "Click a chip to select it, then click a betting circle to place bet"
          : `Selected: $${selectedChipValue} - Click a betting circle to add`}
      </div>

      {/* Total bet display - MOVED HERE ABOVE CIRCLES */}
      {totalBet > 0 && (
        <div className="bg-amber-950/30 px-8 py-3 rounded-lg border-2 border-amber-600">
          <div className="text-center">
            <div className="text-xs text-amber-400 uppercase tracking-wide">
              Total Bet
              {activeBetsCount > 0 && ` (${activeBetsCount} hands)`}
            </div>
            <div className="text-3xl font-bold text-yellow-400 font-serif">
              ${totalBet.toFixed(2)}
            </div>
          </div>
        </div>
      )}

      {/* Betting Circles - Casino Style Layout */}
      <div className="relative w-full max-w-4xl">
        <div className="flex items-center justify-center gap-4 mb-6">
          {playablePositions.map((positionIndex, displayIndex) => {
            const bet = handBets[positionIndex];
            const hasChips = bet > 0;

            return (
              <div key={positionIndex} className="flex flex-col items-center">
                {/* Position label */}
                <div className="text-xs mb-2 font-serif text-amber-400">
                  Spot {displayIndex + 1}
                </div>

                {/* Betting Circle */}
                <button
                  type="button"
                  onClick={() => handleBettingCircleClick(positionIndex)}
                  onContextMenu={(e) => {
                    e.preventDefault();
                    handleClearPosition(positionIndex);
                  }}
                  disabled={selectedChipValue === null}
                  className={cn(
                    "relative w-24 h-24 rounded-full transition-all duration-200 flex items-center justify-center",
                    "border-4 font-serif font-bold",
                    selectedChipValue !== null
                      ? "cursor-pointer hover:scale-105 hover:shadow-lg border-amber-500 bg-gradient-to-br from-green-900/80 to-green-950/80 hover:from-green-800/90 hover:to-green-900/90"
                      : "border-amber-700/50 bg-gradient-to-br from-green-950/40 to-black/40",
                    hasChips && "ring-2 ring-yellow-400",
                  )}
                  title={`Right-click to clear • Bet: $${bet}`}
                >
                  {/* Bet amount display */}
                  {hasChips ? (
                    <div className="text-center">
                      <div className="text-2xl text-yellow-400 font-bold drop-shadow-lg">
                        ${bet}
                      </div>
                    </div>
                  ) : (
                    <div className="text-amber-600/50 text-4xl">+</div>
                  )}
                </button>

                {/* Clear button for positions with bets */}
                {hasChips && (
                  <button
                    type="button"
                    onClick={() => handleClearPosition(positionIndex)}
                    className="mt-2 text-xs text-red-400 hover:text-red-300 underline"
                  >
                    Clear
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Chips */}
      <div className="grid grid-cols-4 gap-2 items-center justify-items-center max-w-xs">
        {CHIP_VALUES.map((chip) => (
          <CasinoChip
            key={chip.value}
            value={chip.value}
            color={chip.color}
            accentColor={chip.accentColor}
            onClick={() => handleChipClick(chip.value)}
            disabled={chip.value > availableBalance}
            selected={selectedChipValue === chip.value}
          />
        ))}
      </div>

      {/* Action buttons */}
      <div className="grid grid-cols-2 gap-2 w-full max-w-md">
        {previousBets && (
          <>
            <Button
              onClick={handleReBet}
              variant="outline"
              className="border-blue-700 bg-blue-950/50 text-blue-200 hover:bg-blue-900 font-serif"
              disabled={
                previousBets.reduce((sum, bet) => sum + bet, 0) >
                  availableBalance
              }
            >
              Re-bet $
              {previousBets.reduce((sum, bet) => sum + bet, 0).toFixed(0)}
            </Button>

            <Button
              onClick={handleReBetAndDouble}
              variant="outline"
              className="border-purple-700 bg-purple-950/50 text-purple-200 hover:bg-purple-900 font-serif"
              disabled={
                previousBets.reduce((sum, bet) => sum + bet, 0) * 2 >
                  availableBalance
              }
            >
              Re-bet & Double $
              {(previousBets.reduce((sum, bet) => sum + bet, 0) * 2).toFixed(0)}
            </Button>
          </>
        )}

        <Button
          onClick={handleClearAllBets}
          variant="outline"
          className="border-red-700 bg-red-950/50 text-red-200 hover:bg-red-900 font-serif"
          disabled={handBets.every((bet) => bet === 0)}
        >
          Clear All
        </Button>

        <Button
          onClick={handlePlaceBet}
          className="bg-green-800 hover:bg-green-700 text-white font-serif px-8"
          disabled={activeBetsCount === 0 || hasInvalidBets}
        >
          Deal Cards
          {activeBetsCount > 0 &&
            ` (${activeBetsCount} hand${activeBetsCount > 1 ? "s" : ""})`}
        </Button>
      </div>

      {hasInvalidBets && (
        <div className="text-amber-400 text-sm">
          Minimum bet is $10 per hand
        </div>
      )}
    </div>
  );
}
