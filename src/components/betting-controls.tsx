"use client";

import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { cn } from "@/lib/utils";

interface BettingControlsProps {
  balance: number;
  onPlaceBet: (amount: number) => void;
  disabled?: boolean;
}

const chipValues = [5, 10, 25, 50, 100, 500];

const chipColors = {
  5: "bg-red-600 hover:bg-red-700",
  10: "bg-blue-600 hover:bg-blue-700",
  25: "bg-green-600 hover:bg-green-700",
  50: "bg-orange-600 hover:bg-orange-700",
  100: "bg-black hover:bg-gray-800",
  500: "bg-purple-600 hover:bg-purple-700",
};

export function BettingControls({ balance, onPlaceBet, disabled }: BettingControlsProps) {
  const [betAmount, setBetAmount] = useState(10);

  const handleChipClick = (value: number) => {
    setBetAmount(prev => Math.min(prev + value, balance));
  };

  const handleClearBet = () => {
    setBetAmount(0);
  };

  const handlePlaceBet = () => {
    if (betAmount > 0 && betAmount <= balance) {
      onPlaceBet(betAmount);
      setBetAmount(10); // Reset to default
    }
  };

  return (
    <div className="flex flex-col gap-4 p-6 bg-gray-800 rounded-lg">
      <div className="flex items-center justify-between">
        <span className="text-white font-semibold">Balance:</span>
        <span className="text-green-400 text-xl font-bold">${balance}</span>
      </div>

      <div className="flex items-center justify-between">
        <span className="text-white font-semibold">Bet:</span>
        <Input
          type="number"
          value={betAmount}
          onChange={(e) => setBetAmount(Math.min(Number(e.target.value), balance))}
          className="w-32 bg-gray-700 text-white border-gray-600"
          min={0}
          max={balance}
          disabled={disabled}
        />
      </div>

      {/* Chips */}
      <div className="grid grid-cols-3 gap-2">
        {chipValues.map((value) => (
          <button
            key={value}
            onClick={() => handleChipClick(value)}
            disabled={disabled || balance < value}
            className={cn(
              "h-16 w-16 rounded-full text-white font-bold shadow-lg",
              "transition-all hover:scale-110 active:scale-95",
              "disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100",
              "border-4 border-white/20",
              chipColors[value as keyof typeof chipColors]
            )}
          >
            ${value}
          </button>
        ))}
      </div>

      {/* Action buttons */}
      <div className="flex gap-2">
        <Button
          onClick={handleClearBet}
          variant="outline"
          className="flex-1"
          disabled={disabled}
        >
          Clear
        </Button>
        <Button
          onClick={handlePlaceBet}
          className="flex-1 bg-green-600 hover:bg-green-700"
          disabled={disabled || betAmount === 0 || betAmount > balance}
        >
          Place Bet
        </Button>
      </div>
    </div>
  );
}
