"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "./ui/button";
import { Input } from "./ui/input";

interface BettingControlsProps {
  balance: number;
  onPlaceBet: (bets: number[]) => void; // Now accepts array of bets for multi-hand
  disabled?: boolean;
}

const chipValues = [5, 10, 25, 50, 100, 500];
const _MAX_HANDS = 5;

const chipColors = {
  5: "bg-red-600 hover:bg-red-700",
  10: "bg-blue-600 hover:bg-blue-700",
  25: "bg-green-600 hover:bg-green-700",
  50: "bg-orange-600 hover:bg-orange-700",
  100: "bg-black hover:bg-gray-800",
  500: "bg-purple-600 hover:bg-purple-700",
};

export function BettingControls({
  balance,
  onPlaceBet,
  disabled,
}: BettingControlsProps) {
  const [numHands, setNumHands] = useState(1);
  const [currentHandIndex, setCurrentHandIndex] = useState(0);
  const [handBets, setHandBets] = useState<number[]>([10]); // Array of bet amounts
  const [previousBets, setPreviousBets] = useState<number[] | null>(null); // Track previous bet for re-bet feature

  // Update handBets array when numHands changes
  const handleNumHandsChange = (newNumHands: number) => {
    setNumHands(newNumHands);
    setHandBets((prev) => {
      const newBets = [...prev];
      // Add or remove bet amounts as needed
      while (newBets.length < newNumHands) {
        newBets.push(10); // Default bet for new hands
      }
      while (newBets.length > newNumHands) {
        newBets.pop();
      }
      return newBets;
    });
    setCurrentHandIndex(Math.min(currentHandIndex, newNumHands - 1));
  };

  const handleChipClick = (value: number) => {
    setHandBets((prev) => {
      const newBets = [...prev];
      const totalBet = newBets.reduce((sum, bet) => sum + bet, 0);
      const newAmount = Math.min(
        newBets[currentHandIndex] + value,
        balance - (totalBet - newBets[currentHandIndex]),
      );
      newBets[currentHandIndex] = newAmount;
      return newBets;
    });
  };

  const handleClearBet = () => {
    setHandBets((prev) => {
      const newBets = [...prev];
      newBets[currentHandIndex] = 0;
      return newBets;
    });
  };

  const handleClearAllBets = () => {
    setHandBets(new Array(numHands).fill(0));
  };

  const handlePlaceBet = () => {
    const totalBet = handBets.reduce((sum, bet) => sum + bet, 0);
    const allBetsValid = handBets.every((bet) => bet > 0);

    if (allBetsValid && totalBet > 0 && totalBet <= balance) {
      // Save current bets for re-bet feature
      setPreviousBets([...handBets]);
      onPlaceBet(handBets);
      setHandBets(new Array(numHands).fill(10)); // Reset to defaults
    }
  };

  const handleReBet = () => {
    if (!previousBets) return;

    const totalPreviousBet = previousBets.reduce((sum, bet) => sum + bet, 0);
    if (totalPreviousBet <= balance) {
      // Set the number of hands to match previous bet
      setNumHands(previousBets.length);
      setHandBets([...previousBets]);
      setCurrentHandIndex(0);
    }
  };

  const totalBet = handBets.reduce((sum, bet) => sum + bet, 0);

  return (
    <div className="flex flex-col gap-4 p-6 pb-20 bg-gray-800 rounded-lg">
      <div className="flex items-center justify-between">
        <span className="text-white font-semibold">Balance:</span>
        <span className="text-green-400 text-xl font-bold">${balance}</span>
      </div>

      {/* Number of hands selector */}
      <div className="flex flex-col gap-2">
        <span className="text-white font-semibold">Number of Hands:</span>
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5].map((num) => (
            <button
              key={num}
              onClick={() => handleNumHandsChange(num)}
              disabled={disabled}
              className={cn(
                "flex-1 py-2 px-3 rounded font-bold transition-all",
                numHands === num
                  ? "bg-blue-600 text-white"
                  : "bg-gray-700 text-gray-300 hover:bg-gray-600",
                "disabled:opacity-50 disabled:cursor-not-allowed",
              )}
            >
              {num}
            </button>
          ))}
        </div>
      </div>

      {/* Hand selection tabs (if multiple hands) */}
      {numHands > 1 && (
        <div className="flex flex-col gap-2">
          <span className="text-white text-sm">Select Hand to Bet:</span>
          <div className="flex gap-1">
            {handBets.map((bet, index) => (
              <button
                key={index}
                onClick={() => setCurrentHandIndex(index)}
                disabled={disabled}
                className={cn(
                  "flex-1 py-2 px-2 rounded text-sm font-semibold transition-all",
                  currentHandIndex === index
                    ? "bg-green-600 text-white"
                    : "bg-gray-700 text-gray-300 hover:bg-gray-600",
                  "disabled:opacity-50 disabled:cursor-not-allowed",
                )}
              >
                <div>Hand {index + 1}</div>
                <div className="text-xs">${bet}</div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Current hand bet display */}
      <div className="flex items-center justify-between">
        <span className="text-white font-semibold">
          {numHands > 1 ? `Hand ${currentHandIndex + 1} Bet:` : "Bet:"}
        </span>
        <Input
          type="number"
          value={handBets[currentHandIndex]}
          onChange={(e) => {
            const newValue = Number(e.target.value);
            const otherBets = handBets
              .filter((_, i) => i !== currentHandIndex)
              .reduce((sum, bet) => sum + bet, 0);
            const maxBet = balance - otherBets;
            setHandBets((prev) => {
              const newBets = [...prev];
              newBets[currentHandIndex] = Math.min(
                Math.max(0, newValue),
                maxBet,
              );
              return newBets;
            });
          }}
          className="w-32 bg-gray-700 text-white border-gray-600"
          min={0}
          max={balance}
          disabled={disabled}
        />
      </div>

      {/* Total bet display */}
      {numHands > 1 && (
        <div className="flex items-center justify-between text-sm border-t border-gray-700 pt-2">
          <span className="text-gray-300 font-semibold">Total Bet:</span>
          <span className="text-yellow-400 font-bold">${totalBet}</span>
        </div>
      )}

      {/* Chips */}
      <div className="grid grid-cols-3 gap-2">
        {chipValues.map((value) => (
          <button
            key={value}
            onClick={() => handleChipClick(value)}
            disabled={disabled || totalBet >= balance}
            className={cn(
              "h-14 w-14 rounded-full text-white font-bold shadow-lg text-sm",
              "transition-all hover:scale-110 active:scale-95",
              "disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100",
              "border-4 border-white/20",
              chipColors[value as keyof typeof chipColors],
            )}
          >
            ${value}
          </button>
        ))}
      </div>

      {/* Action buttons */}
      <div className="flex gap-2 flex-wrap">
        <Button
          onClick={handleClearBet}
          variant="outline"
          className="flex-1"
          disabled={disabled}
        >
          Clear Hand
        </Button>
        {numHands > 1 && (
          <Button
            onClick={handleClearAllBets}
            variant="outline"
            className="flex-1"
            disabled={disabled}
          >
            Clear All
          </Button>
        )}
        <Button
          onClick={handleReBet}
          variant="outline"
          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white border-blue-600"
          disabled={
            disabled ||
            !previousBets ||
            previousBets.reduce((sum, bet) => sum + bet, 0) > balance
          }
        >
          Re-bet
        </Button>
        <Button
          onClick={handlePlaceBet}
          className="flex-1 bg-green-600 hover:bg-green-700"
          disabled={
            disabled ||
            totalBet === 0 ||
            totalBet > balance ||
            !handBets.every((bet) => bet > 0)
          }
        >
          Place Bet{numHands > 1 ? "s" : ""}
        </Button>
      </div>
    </div>
  );
}
