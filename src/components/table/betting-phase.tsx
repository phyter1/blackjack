"use client";

import { useEffect, useState } from "react";
import { DenomChip, generateChipConfigs } from "@/components/chips/denom-chip";
import { useViewportHandLimit } from "@/hooks/use-viewport-hand-limit";
import { cn } from "@/lib/utils";
import { RoundActionButton } from "./round-action-button";
import { selectChipScale, useSettingsStore } from "@/stores/settings";

interface BettingPhaseProps {
  currentBalance: number;
  practiceBalance?: number;
  isTrainerActive: boolean;
  maxPlayableHands?: number; // 1-5, defaults to 5
  minBet?: number; // Minimum bet allowed at the table
  maxBet?: number; // Maximum bet allowed at the table
  betUnit?: number; // Bet unit/chip denomination
  chipDenominations?: number[]; // Available chip denominations
  previousBets: number[] | null;
  onBet: (bets: number[]) => void;
  onSetPreviousBets: (bets: number[] | null) => void;
}

export function BettingPhase({
  currentBalance,
  practiceBalance = 0,
  isTrainerActive,
  maxPlayableHands = 5,
  minBet = 5,
  maxBet = 10000,
  betUnit = 1,
  chipDenominations,
  previousBets,
  onBet,
  onSetPreviousBets,
}: BettingPhaseProps) {
  const chipScale = useSettingsStore(selectChipScale);

  // Determine viewport-based hand limit
  const viewportHandLimit = useViewportHandLimit(maxPlayableHands);

  // Generate chip configs from denominations (canonical only)
  const chipConfigs = chipDenominations
    ? generateChipConfigs(chipDenominations)
    : generateChipConfigs([5, 25, 100, 500, 1000, 5000]);
  // Always track all 5 positions
  const [handBets, setHandBets] = useState<number[]>([0, 0, 0, 0, 0]);
  const [selectedChipValue, setSelectedChipValue] = useState<number | null>(
    null,
  );
  const [betError, setBetError] = useState<string | null>(null);

  const availableBalance = isTrainerActive ? practiceBalance : currentBalance;
  const totalBet = handBets.reduce((sum, bet) => sum + bet, 0);

  // Clear error when bets change
  useEffect(() => {
    if (betError) {
      setBetError(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [handBets]);

  // Calculate which positions are playable based on viewport-adjusted hand limit
  const getPlayablePositions = (): number[] => {
    // If only 1 hand allowed, show center position (index 2)
    if (viewportHandLimit === 1) return [2];
    // If 2 hands, show positions 1 and 3
    if (viewportHandLimit === 2) return [1, 3];
    // If 3 hands, show positions 1, 2, 3
    if (viewportHandLimit === 3) return [1, 2, 3];
    // If 4 hands, show positions 0, 1, 3, 4
    if (viewportHandLimit === 4) return [0, 1, 3, 4];
    // If 5 hands, show all positions
    return [0, 1, 2, 3, 4];
  };

  const playablePositions = getPlayablePositions();

  const handlePlaceBet = () => {
    // Clear any previous errors
    setBetError(null);

    // Filter only hands with bets > 0
    const activeBets = handBets.filter((bet) => bet > 0);

    if (activeBets.length === 0) {
      return;
    }

    // Validate each bet against table rules
    for (const bet of activeBets) {
      if (bet < minBet) {
        setBetError(`All bets must be at least $${minBet} (table minimum)`);
        return;
      }
      if (bet > maxBet) {
        setBetError(`All bets must not exceed $${maxBet} (table maximum)`);
        return;
      }
      // Check if bet is a multiple of betUnit
      const remainder = bet % betUnit;
      const tolerance = 0.0001;
      if (remainder > tolerance && remainder < betUnit - tolerance) {
        setBetError(`All bets must be multiples of $${betUnit}`);
        return;
      }
    }

    // All bets are valid
    onSetPreviousBets([...handBets]);
    onBet(activeBets);
    setHandBets([0, 0, 0, 0, 0]);
    setSelectedChipValue(null);
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

  const activeBetsCount = handBets.filter((bet) => bet >= minBet).length;
  const hasInvalidBets = handBets.some((bet) => bet > 0 && bet < minBet);

  return (
    <div className="flex flex-col items-center gap-3 md:gap-6 pb-8 md:pb-20">
      {isTrainerActive && (
        <div
          className="px-4 py-2 border rounded-lg text-sm"
          style={{
            background: "var(--theme-primary)",
            borderColor: "var(--theme-primary)",
            color: "var(--theme-primary-foreground)",
            opacity: 0.9,
          }}
        >
          🎓 <strong>Practice Mode</strong> - Using virtual balance, real
          bankroll is safe
        </div>
      )}

      <div
        className="font-serif text-xl"
        style={{ color: "var(--theme-text-primary)" }}
      >
        Place Your Bets
      </div>

      {/* Instruction text */}
      <div
        className="text-sm text-center"
        style={{ color: "var(--theme-text-secondary)", opacity: 0.8 }}
      >
        {selectedChipValue === null
          ? "Click a chip to select it, then click a betting circle to place bet"
          : `Selected: $${selectedChipValue} - Click a betting circle to add`}
      </div>

      {/* Error message */}
      {betError && (
        <div
          className="border-2 px-6 py-3 rounded-lg text-sm font-medium"
          style={{
            background: "var(--theme-error)",
            borderColor: "var(--theme-error)",
            color: "var(--theme-text-primary)",
            opacity: 0.9,
          }}
        >
          ⚠️ {betError}
        </div>
      )}

      {/* Total bet display - MOVED HERE ABOVE CIRCLES */}
      {totalBet > 0 && (
        <div
          className="px-8 py-3 rounded-lg border-2"
          style={{
            background: "var(--theme-table-edge)",
            borderColor: "var(--theme-accent)",
            opacity: 0.9,
          }}
        >
          <div className="text-center">
            <div
              className="text-xs uppercase tracking-wide"
              style={{ color: "var(--theme-text-secondary)" }}
            >
              Total Bet
              {activeBetsCount > 0 && ` (${activeBetsCount} hands)`}
            </div>
            <div
              className="text-3xl font-bold font-serif"
              style={{ color: "var(--theme-accent)" }}
            >
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
                <div
                  className="text-xs mb-2 font-serif"
                  style={{ color: "var(--theme-text-secondary)" }}
                >
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
                    "relative w-16 h-16 md:w-20 md:h-20 rounded-full transition-all duration-200 flex items-center justify-center",
                    "border-3 font-serif font-bold",
                    selectedChipValue !== null &&
                      "cursor-pointer hover:scale-105",
                    hasChips && "ring-2",
                  )}
                  style={{
                    borderColor:
                      selectedChipValue !== null
                        ? "var(--theme-accent)"
                        : "var(--theme-border)",
                    backgroundColor:
                      selectedChipValue !== null
                        ? "var(--theme-table-felt-end)"
                        : "var(--theme-background)",
                    opacity: selectedChipValue !== null ? 0.9 : 0.5,
                    transform: `scale(${chipScale / 100})`,
                    ...(hasChips && {
                      "--tw-ring-color": "var(--theme-accent)",
                    }),
                  }}
                  title={`Right-click to clear • Bet: $${bet}`}
                >
                  {/* Bet amount display */}
                  {hasChips ? (
                    <div className="text-center">
                      <div
                        className="text-sm md:text-xl font-bold"
                        style={{ color: "var(--theme-accent)" }}
                      >
                        ${bet}
                      </div>
                    </div>
                  ) : (
                    <div
                      className="text-xl md:text-2xl"
                      style={{ color: "var(--theme-text-muted)", opacity: 0.5 }}
                    >
                      +
                    </div>
                  )}
                </button>

                {/* Clear button for positions with bets */}
                {hasChips && (
                  <button
                    type="button"
                    onClick={() => handleClearPosition(positionIndex)}
                    className="mt-2 text-xs hover:opacity-80 underline"
                    style={{ color: "var(--theme-error)" }}
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
      <div className="flex flex-col items-center gap-2">
        {/* Top row - first half of chips */}
        <div className="flex gap-2 justify-center">
          {chipConfigs
            .slice(0, Math.ceil(chipConfigs.length / 2))
            .map((chip) => (
              <DenomChip
                key={chip.value}
                value={chip.value}
                primary={chip.primary}
                secondary={chip.secondary}
                center={chip.center}
                textColor={chip.textColor}
                onClick={() => handleChipClick(chip.value)}
                disabled={chip.value > availableBalance}
                selected={selectedChipValue === chip.value}
              />
            ))}
        </div>
        {/* Bottom row - second half of chips */}
        <div className="flex gap-2 justify-center">
          {chipConfigs.slice(Math.ceil(chipConfigs.length / 2)).map((chip) => (
            <DenomChip
              key={chip.value}
              value={chip.value}
              primary={chip.primary}
              secondary={chip.secondary}
              center={chip.center}
              textColor={chip.textColor}
              onClick={() => handleChipClick(chip.value)}
              disabled={chip.value > availableBalance}
              selected={selectedChipValue === chip.value}
            />
          ))}
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex flex-wrap gap-3 w-full max-w-md justify-center">
        {previousBets && (
          <>
            <RoundActionButton
              label={`Re-bet $${previousBets.reduce((sum, bet) => sum + bet, 0).toFixed(0)}`}
              onClick={handleReBet}
              color="#2563EB"
              accentColor="#1E40AF"
              disabled={
                previousBets.reduce((sum, bet) => sum + bet, 0) >
                availableBalance
              }
            />

            <RoundActionButton
              label={`2x $${(previousBets.reduce((sum, bet) => sum + bet, 0) * 2).toFixed(0)}`}
              onClick={handleReBetAndDouble}
              color="#8B5CF6"
              accentColor="#6D28D9"
              disabled={
                previousBets.reduce((sum, bet) => sum + bet, 0) * 2 >
                availableBalance
              }
            />
          </>
        )}

        <RoundActionButton
          label="Clear All"
          onClick={handleClearAllBets}
          color="#DC2626"
          accentColor="#991B1B"
          disabled={handBets.every((bet) => bet === 0)}
        />

        <RoundActionButton
          label={`Deal${activeBetsCount > 0 ? ` (${activeBetsCount})` : ""}`}
          onClick={handlePlaceBet}
          color="#16A34A"
          accentColor="#15803D"
          disabled={activeBetsCount === 0 || hasInvalidBets}
        />
      </div>

      {hasInvalidBets && (
        <div className="text-amber-400 text-sm">
          Minimum bet is ${minBet} per hand
        </div>
      )}
    </div>
  );
}
