"use client";

import { useEffect, useState } from "react";
import { useBlackjackGame } from "@/hooks/use-blackjack-game";
import { useTrainerMode } from "@/hooks/use-trainer-mode";
import { HandDisplay } from "./hand-display";
import { BettingControls } from "./betting-controls";
import { ActionButtons } from "./action-buttons";
import { GameStats } from "./game-stats";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { TrainerControls } from "./trainer-controls";
import { StrategyFeedback } from "./strategy-feedback";
import { CountingPanel } from "./counting-panel";
import { TrainerStatsPanel } from "./trainer-stats-panel";
import type { ActionType } from "@/modules/game";

export function TrainerPage() {
  const {
    game,
    currentPlayer,
    currentRound,
    gameState,
    startGame,
    placeBet,
    playAction,
    completeRound,
    getAvailableActions,
    getPlayerBalance,
    getRoundNumber,
    getCurrentBet,
  } = useBlackjackGame();

  const {
    initializeTrainer,
    isActive,
    difficulty,
    refreshStats,
    clearFeedback,
    getTrainer,
  } = useTrainerMode();

  const [playerName, setPlayerName] = useState("");

  // Initialize trainer when game is created
  useEffect(() => {
    if (game) {
      initializeTrainer(game);
    }
  }, [game, initializeTrainer]);

  // Track cards dealt for counting
  useEffect(() => {
    if (!isActive || !currentRound) return;

    const trainer = getTrainer();
    if (!trainer) return;

    // Process dealer cards
    if (currentRound.dealerHand.cards.length > 0) {
      trainer.processCardsDealt(currentRound.dealerHand.cards);
    }

    // Process player cards
    for (const hand of currentRound.playerHands) {
      if (hand.hand.length > 0) {
        trainer.processCardsDealt(hand.hand);
      }
    }
  }, [currentRound, isActive, getTrainer]);

  // Clear feedback when starting new round
  useEffect(() => {
    if (gameState === "waiting_for_bets") {
      clearFeedback();
    }
  }, [gameState, clearFeedback]);

  const handleStartGame = () => {
    if (playerName.trim()) {
      startGame(playerName.trim(), 10000); // Start with $10k practice balance
    }
  };

  const handleAction = (action: ActionType) => {
    if (!isActive || !currentRound) {
      playAction(action);
      return;
    }

    const trainer = getTrainer();
    if (!trainer) {
      playAction(action);
      return;
    }

    // Get current hand
    const activeHand = currentRound.currentHand;
    if (!activeHand) {
      playAction(action);
      return;
    }

    const dealerUpCard = currentRound.dealerHand.upCard;
    const availableActions = getAvailableActions();

    // Evaluate the action before playing it
    const feedback = trainer.evaluateAction(
      activeHand.hand,
      activeHand.handValue,
      dealerUpCard,
      availableActions.includes("double"),
      availableActions.includes("split"),
      availableActions.includes("surrender"),
      action,
      activeHand.id,
      currentRound.id,
      activeHand.betAmount,
    );

    // Play the action
    playAction(action);

    // Refresh stats after action
    refreshStats();
  };

  const handleNextRound = () => {
    completeRound();
    refreshStats();
  };

  const handleBet = (amount: number | number[]) => {
    placeBet(amount);
    clearFeedback();
  };

  // No player yet - show setup screen
  if (!currentPlayer) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-green-800 to-green-900">
        <Card className="w-96">
          <CardHeader>
            <CardTitle>Blackjack Trainer Mode</CardTitle>
            <CardDescription>
              Practice counting and perfect basic strategy
            </CardDescription>
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
                Start Training ($10,000)
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
    <div className="min-h-screen bg-gradient-to-br from-green-800 to-green-900 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header with back button */}
        <div className="mb-4 flex items-center justify-between">
          <Button
            onClick={() => (window.location.href = "/")}
            variant="outline"
            className="bg-black/30 border-amber-600/30 text-amber-200 hover:bg-black/50"
          >
            ← Back to Dashboard
          </Button>
          <h1 className="text-3xl font-bold text-amber-200 font-serif">
            🎓 Blackjack Trainer Mode
          </h1>
          <div className="w-[140px]" /> {/* Spacer for centering */}
        </div>

        <div className="grid grid-cols-12 gap-4">
          {/* Left sidebar - Trainer controls */}
          <div className="col-span-3 space-y-4">
            <TrainerControls />
            {isActive && <TrainerStatsPanel />}
          </div>

          {/* Main playing area */}
          <div className="col-span-6 space-y-6">
            {/* Stats */}
            <GameStats
              balance={balance}
              roundNumber={roundNumber}
              currentBet={currentBet}
            />

            {/* Strategy Feedback */}
            {isActive && <StrategyFeedback />}

            {/* Game Table */}
            <Card className="bg-gradient-to-br from-green-700/50 to-green-800/50 border-amber-600/30">
              <CardContent className="p-8">
                <div className="space-y-8">
                  {/* Dealer */}
                  {currentRound && (
                    <div className="text-center space-y-4">
                      <h3 className="text-amber-200 font-serif text-xl">
                        Dealer
                      </h3>
                      <HandDisplay
                        cards={currentRound.dealerHand.cards}
                        value={currentRound.dealerHand.handValue}
                        hideFirstCard={
                          currentRound.state === "player_turn" ||
                          currentRound.state === "insurance"
                        }
                        label="Dealer"
                      />
                    </div>
                  )}

                  {/* Player */}
                  {currentRound && (
                    <div className="text-center space-y-4">
                      <h3 className="text-amber-200 font-serif text-xl">
                        {currentPlayer.name}
                      </h3>
                      <div className="flex justify-center gap-4">
                        {currentRound.playerHands.map((hand, idx) => (
                          <div
                            key={hand.id}
                            className={`${idx === currentRound.currentHandIndex ? "ring-2 ring-amber-400 rounded-lg p-2" : ""}`}
                          >
                            <HandDisplay
                              cards={hand.hand}
                              value={hand.handValue}
                              betAmount={hand.betAmount}
                              isSoft={hand.isSoft}
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Betting or Action Controls */}
                  <div className="flex justify-center">
                    {gameState === "waiting_for_bets" && (
                      <BettingControls
                        balance={balance}
                        onPlaceBet={handleBet}
                      />
                    )}

                    {gameState === "in_round" &&
                      currentRound?.state === "player_turn" && (
                        <ActionButtons
                          availableActions={getAvailableActions()}
                          onAction={handleAction}
                        />
                      )}

                    {gameState === "round_complete" && (
                      <Button
                        onClick={handleNextRound}
                        size="lg"
                        className="bg-amber-600 hover:bg-amber-700"
                      >
                        Next Round
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right sidebar - Counting panel */}
          <div className="col-span-3">
            <CountingPanel />
          </div>
        </div>
      </div>
    </div>
  );
}
