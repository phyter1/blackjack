"use client";

import { useEffect, useState } from "react";
import { useBlackjackGame } from "@/hooks/use-blackjack-game";
import { HandDisplay } from "./hand-display";
import { BettingControls } from "./betting-controls";
import { ActionButtons } from "./action-buttons";
import { InsuranceDialog } from "./insurance-dialog";
import { GameStats } from "./game-stats";
import { ShoeIndicator } from "./shoe-indicator";
import { DiscardPile } from "./discard-pile";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { ActionType } from "@/modules/game";

export function BlackjackTable() {
  const {
    currentPlayer,
    currentRound,
    gameState,
    shoeDetails,
    startGame,
    placeBet,
    playAction,
    takeInsurance,
    declineInsurance,
    resolveInsurance,
    completeRound,
    getAvailableActions,
    getPlayerBalance,
    getRoundNumber,
    getCurrentBet,
  } = useBlackjackGame();

  const [playerName, setPlayerName] = useState("");
  const [showInsuranceDialog, setShowInsuranceDialog] = useState(false);
  const [insuranceHandIndex, setInsuranceHandIndex] = useState(0);
  const [handsPendingInsurance, setHandsPendingInsurance] = useState<number[]>(
    [],
  );

  // Handle insurance phase - find all hands that need insurance decision
  useEffect(() => {
    if (currentRound?.state === "insurance") {
      const pendingHands = currentRound.playerHands
        .map((hand, index) => ({ hand, index }))
        .filter(({ hand }) => hand.insuranceOffered && !hand.hasInsurance)
        .map(({ index }) => index);

      setHandsPendingInsurance(pendingHands);

      if (pendingHands.length > 0 && !showInsuranceDialog) {
        setInsuranceHandIndex(pendingHands[0]);
        setShowInsuranceDialog(true);
      }
    }
  }, [currentRound?.state, currentRound?.playerHands, showInsuranceDialog]);

  const handleStartGame = () => {
    if (playerName.trim()) {
      startGame(playerName.trim(), 1000);
    }
  };

  const handleTakeInsurance = () => {
    takeInsurance(insuranceHandIndex);

    // Check if there are more hands needing insurance
    const remainingHands = handsPendingInsurance.filter(
      (i) => i !== insuranceHandIndex,
    );
    if (remainingHands.length > 0) {
      setInsuranceHandIndex(remainingHands[0]);
      setHandsPendingInsurance(remainingHands);
    } else {
      setShowInsuranceDialog(false);
      setHandsPendingInsurance([]);
      resolveInsurance();
    }
  };

  const handleDeclineInsurance = () => {
    declineInsurance(insuranceHandIndex);

    // Check if there are more hands needing insurance
    const remainingHands = handsPendingInsurance.filter(
      (i) => i !== insuranceHandIndex,
    );
    if (remainingHands.length > 0) {
      setInsuranceHandIndex(remainingHands[0]);
      setHandsPendingInsurance(remainingHands);
    } else {
      setShowInsuranceDialog(false);
      setHandsPendingInsurance([]);
      resolveInsurance();
    }
  };

  const handleAction = (action: ActionType) => {
    playAction(action);
  };

  const handleNextRound = () => {
    completeRound();
  };

  // No player yet - show setup screen
  if (!currentPlayer) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-linear-to-br from-green-800 to-green-900">
        <Card className="w-96">
          <CardHeader>
            <CardTitle>Blackjack</CardTitle>
            <CardDescription>Enter your name to start playing</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-4">
              <Input
                type="text"
                placeholder="Your name"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleStartGame()}
              />
              <Button onClick={handleStartGame} disabled={!playerName.trim()}>
                Start Game ($1,000)
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const balance = getPlayerBalance();
  const roundNumber = getRoundNumber();
  const currentBet = getCurrentBet();

  return (
    <div className="min-h-screen bg-linear-to-br from-green-800 to-green-900 p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Stats */}
        <GameStats
          balance={balance}
          roundNumber={roundNumber}
          currentBet={currentBet}
        />

        {/* Main game area with shoe and discard indicators on the sides */}
        <div className="flex gap-4">
          {/* Shoe indicator (left side) */}
          <div className="w-64">
            <ShoeIndicator
              remainingCards={shoeDetails.remainingCards}
              totalCards={shoeDetails.totalCards}
              cutCardPosition={shoeDetails.cutCardPosition}
              penetration={shoeDetails.penetration}
              isComplete={shoeDetails.isComplete}
            />
          </div>

          {/* Game Table (center) */}
          <div className="flex-1 bg-green-700 rounded-3xl p-8 shadow-2xl border-8 border-amber-900">
            {/* Dealer's Hand */}
            <div className="flex justify-center mb-16">
              {currentRound && (
                <HandDisplay
                  cards={currentRound.dealerHand.cards}
                  hideFirstCard={
                    currentRound.state !== "settling" &&
                    currentRound.state !== "complete"
                  }
                  value={
                    currentRound.state === "settling" ||
                    currentRound.state === "complete"
                      ? currentRound.dealerHand.value
                      : undefined
                  }
                  label="Dealer"
                  isSoft={currentRound.dealerHand.isSoft}
                />
              )}
            </div>

            {/* Center Area - Actions or Betting */}
            <div className="flex justify-center mb-16">
              {gameState === "waiting_for_bets" && (
                <BettingControls balance={balance} onPlaceBet={placeBet} />
              )}

              {gameState === "in_round" &&
                currentRound?.state === "player_turn" && (
                  <ActionButtons
                    availableActions={getAvailableActions()}
                    onAction={handleAction}
                  />
                )}

              {gameState === "round_complete" && (
                <div className="flex flex-col items-center gap-4">
                  <Button
                    onClick={handleNextRound}
                    size="lg"
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    Next Round
                  </Button>
                </div>
              )}
            </div>

            {/* Player's Hand(s) */}
            <div className="flex justify-center gap-8">
              {currentRound?.playerHands.map((hand, index) => (
                <HandDisplay
                  key={hand.id}
                  cards={hand.hand}
                  value={hand.value}
                  label={`${currentPlayer.name}${
                    currentRound.playerHands.length > 1
                      ? ` (Hand ${index + 1})`
                      : ""
                  }`}
                  isSoft={hand.isSoft}
                  state={hand.state}
                  betAmount={hand.betAmount}
                />
              ))}
            </div>
          </div>

          {/* Discard pile (right side) */}
          <div className="w-64">
            <DiscardPile discardPile={shoeDetails.discardPile} />
          </div>
        </div>

        {/* Insurance Dialog */}
        {currentRound && (
          <InsuranceDialog
            open={showInsuranceDialog}
            insuranceAmount={
              currentRound.playerHands[insuranceHandIndex]?.betAmount / 2
            }
            onTakeInsurance={handleTakeInsurance}
            onDeclineInsurance={handleDeclineInsurance}
            handNumber={
              currentRound.playerHands.length > 1
                ? insuranceHandIndex + 1
                : undefined
            }
          />
        )}
      </div>
    </div>
  );
}
