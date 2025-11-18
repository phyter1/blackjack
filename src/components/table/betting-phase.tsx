"use client";

import { useState } from "react";
import { CasinoChip, CHIP_VALUES } from "@/components/casino-chip";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface BettingPhaseProps {
  currentBalance: number;
  practiceBalance?: number;
  isTrainerActive: boolean;
  onBet: (bets: number[]) => void;
}

export function BettingPhase({
  currentBalance,
  practiceBalance = 0,
  isTrainerActive,
  onBet
}: BettingPhaseProps) {
  const [numHands, setNumHands] = useState(1);
  const [currentHandIndex, setCurrentHandIndex] = useState(0);
  const [handBets, setHandBets] = useState<number[]>([0]);
  const [previousBets, setPreviousBets] = useState<number[] | null>(null);

  const availableBalance = isTrainerActive ? practiceBalance : currentBalance;
  const totalBet = handBets.reduce((sum, bet) => sum + bet, 0);
  const currentHandBet = handBets[currentHandIndex];

  const handlePlaceBet = () => {
    const allBetsValid = handBets.every((bet) => bet >= 10);
    if (allBetsValid && totalBet > 0) {
      setPreviousBets([...handBets]);
      onBet(handBets);
      setHandBets(new Array(numHands).fill(0));
    }
  };

  const handleReBet = () => {
    if (!previousBets) return;
    const totalPreviousBet = previousBets.reduce((sum, bet) => sum + bet, 0);
    if (totalPreviousBet <= availableBalance) {
      setNumHands(previousBets.length);
      setHandBets([...previousBets]);
      setCurrentHandIndex(0);
    }
  };

  const handleChipClick = (chipValue: number) => {
    if (totalBet + chipValue <= availableBalance) {
      setHandBets((prev) => {
        const newBets = [...prev];
        newBets[currentHandIndex] = currentHandBet + chipValue;
        return newBets;
      });
    }
  };

  const handleClearCurrentBet = () => {
    setHandBets((prev) => {
      const newBets = [...prev];
      newBets[currentHandIndex] = 0;
      return newBets;
    });
  };

  const handleClearAllBets = () => {
    setHandBets(new Array(numHands).fill(0));
  };

  const handleNumHandsChange = (num: number) => {
    setNumHands(num);
    setHandBets(new Array(num).fill(0));
    setCurrentHandIndex(0);
  };

  return (
    <div className="flex flex-col items-center gap-4">
      {isTrainerActive && (
        <div className="px-4 py-2 bg-blue-950/80 border border-blue-500/50 rounded-lg text-blue-200 text-sm">
          🎓 <strong>Practice Mode</strong> - Using virtual balance, real bankroll is safe
        </div>
      )}

      <div className="text-amber-200 font-serif text-lg">
        Place Your Bet
      </div>

      {/* Number of hands selector */}
      <div className="flex gap-2">
        {[1, 2, 3, 4, 5].map((num) => (
          <button
            key={num}
            onClick={() => handleNumHandsChange(num)}
            className={cn(
              "px-4 py-2 rounded font-serif font-bold transition-all",
              numHands === num
                ? "bg-amber-600 text-white"
                : "bg-amber-950/50 text-amber-300 hover:bg-amber-900/50 border border-amber-700",
            )}
          >
            {num} Hand{num > 1 ? "s" : ""}
          </button>
        ))}
      </div>

      {/* Hand selection tabs (if multiple hands) */}
      {numHands > 1 && (
        <div className="flex gap-2">
          {handBets.map((bet, index) => (
            <button
              key={index}
              onClick={() => setCurrentHandIndex(index)}
              className={cn(
                "px-3 py-2 rounded text-sm font-serif transition-all",
                currentHandIndex === index
                  ? "bg-green-800 text-white font-bold"
                  : "bg-amber-950/50 text-amber-300 hover:bg-amber-900/50 border border-amber-700",
              )}
            >
              <div>Hand {index + 1}</div>
              <div className="text-xs">${bet.toFixed(0)}</div>
            </button>
          ))}
        </div>
      )}

      {/* Current hand bet display */}
      <div className="bg-black/50 px-8 py-3 rounded-lg border-2 border-amber-600">
        <div className="text-center">
          <div className="text-xs text-amber-400 uppercase tracking-wide">
            {numHands > 1 ? `Hand ${currentHandIndex + 1}` : "Current Bet"}
          </div>
          <div className="text-3xl font-bold text-green-400 font-serif">
            ${currentHandBet.toFixed(2)}
          </div>
        </div>
      </div>

      {/* Total bet display (if multiple hands) */}
      {numHands > 1 && (
        <div className="bg-amber-950/30 px-6 py-2 rounded border border-amber-700">
          <div className="text-center">
            <div className="text-xs text-amber-400">Total Bet</div>
            <div className="text-xl font-bold text-yellow-400 font-serif">
              ${totalBet.toFixed(2)}
            </div>
          </div>
        </div>
      )}

      {/* Chips */}
      <div className="flex gap-3 items-center">
        {CHIP_VALUES.map((chip) => (
          <CasinoChip
            key={chip.value}
            value={chip.value}
            color={chip.color}
            accentColor={chip.accentColor}
            onClick={() => handleChipClick(chip.value)}
            disabled={totalBet + chip.value > availableBalance}
          />
        ))}
      </div>

      {/* Action buttons */}
      <div className="flex gap-3">
        <Button
          onClick={handleClearCurrentBet}
          variant="outline"
          className="border-red-700 bg-red-950/50 text-red-200 hover:bg-red-900 font-serif"
          disabled={currentHandBet === 0}
        >
          Clear {numHands > 1 ? "Hand" : "Bet"}
        </Button>

        {numHands > 1 && (
          <Button
            onClick={handleClearAllBets}
            variant="outline"
            className="border-red-700 bg-red-950/50 text-red-200 hover:bg-red-900 font-serif"
            disabled={handBets.every((bet) => bet === 0)}
          >
            Clear All
          </Button>
        )}

        {previousBets && (
          <Button
            onClick={handleReBet}
            variant="outline"
            className="border-blue-700 bg-blue-950/50 text-blue-200 hover:bg-blue-900 font-serif"
            disabled={
              !previousBets ||
              previousBets.reduce((sum, bet) => sum + bet, 0) > availableBalance
            }
          >
            Re-bet ${previousBets.reduce((sum, bet) => sum + bet, 0).toFixed(0)}
          </Button>
        )}

        <Button
          onClick={handlePlaceBet}
          className="bg-green-800 hover:bg-green-700 text-white font-serif px-8"
          disabled={
            !handBets.every((bet) => bet >= 10) ||
            totalBet === 0
          }
        >
          Place Bet{numHands > 1 ? "s" : ""} ${totalBet.toFixed(0)}
        </Button>
      </div>

      {handBets.some((bet) => bet > 0 && bet < 10) && (
        <div className="text-amber-400 text-sm">Minimum bet is $10 per hand</div>
      )}
    </div>
  );
}