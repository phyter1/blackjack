"use client";

import { useState, useEffect } from "react";
import type { GameSession } from "@/types/user";
import type { PlayerDecision } from "@/modules/strategy/decision-tracker";
import type { CountSnapshot } from "@/modules/strategy/hi-lo-counter";
import { calculateHandEV } from "@/modules/strategy/ev-calculator";
import { PlayingCard } from "./playing-card";
import { Button } from "./ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { cn } from "@/lib/utils";
import {
  ChevronLeft,
  ChevronRight,
  X,
  CheckCircle2,
  XCircle,
  TrendingUp,
  TrendingDown,
  DollarSign,
} from "lucide-react";

interface SessionReplayProps {
  session: GameSession;
  onClose: () => void;
}

export function SessionReplay({ session, onClose }: SessionReplayProps) {
  const [decisions, setDecisions] = useState<PlayerDecision[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    // Parse decisions from JSON
    if (session.decisionsData) {
      try {
        const parsed = JSON.parse(session.decisionsData) as PlayerDecision[];
        setDecisions(parsed);
      } catch (error) {
        console.error("Failed to parse decisions data:", error);
      }
    }
  }, [session.decisionsData]);

  useEffect(() => {
    // Auto-play functionality
    if (isPlaying && currentIndex < decisions.length - 1) {
      const timer = setTimeout(() => {
        setCurrentIndex((prev) => prev + 1);
      }, 2000); // Advance every 2 seconds
      return () => clearTimeout(timer);
    } else if (isPlaying && currentIndex >= decisions.length - 1) {
      setIsPlaying(false);
    }
  }, [isPlaying, currentIndex, decisions.length]);

  const handlePrevious = () => {
    setCurrentIndex((prev) => Math.max(0, prev - 1));
    setIsPlaying(false);
  };

  const handleNext = () => {
    setCurrentIndex((prev) => Math.min(decisions.length - 1, prev + 1));
    setIsPlaying(false);
  };

  const handlePlayPause = () => {
    if (currentIndex >= decisions.length - 1) {
      setCurrentIndex(0);
    }
    setIsPlaying((prev) => !prev);
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString();
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case "hit":
        return "text-blue-400";
      case "stand":
        return "text-green-400";
      case "double":
        return "text-purple-400";
      case "split":
        return "text-orange-400";
      case "surrender":
        return "text-red-400";
      default:
        return "text-gray-400";
    }
  };

  const getActionLabel = (action: string) => {
    return action.charAt(0).toUpperCase() + action.slice(1);
  };

  const getOutcomeLabel = (outcome: string) => {
    switch (outcome) {
      case "blackjack":
        return "Blackjack!";
      case "win":
        return "Win";
      case "lose":
        return "Loss";
      case "push":
        return "Push";
      case "surrender":
        return "Surrendered";
      default:
        return outcome;
    }
  };

  const getOutcomeColor = (outcome: string) => {
    switch (outcome) {
      case "blackjack":
      case "win":
        return "text-green-500";
      case "lose":
        return "text-red-500";
      case "push":
        return "text-yellow-500";
      case "surrender":
        return "text-orange-500";
      default:
        return "text-gray-400";
    }
  };

  const renderCountInfo = (countSnapshot?: CountSnapshot) => {
    if (!countSnapshot) return null;

    const getTrueCountColor = (tc: number) => {
      if (tc >= 2) return "text-green-500";
      if (tc <= -2) return "text-red-500";
      return "text-yellow-500";
    };

    return (
      <div className="grid grid-cols-2 gap-4 p-4 bg-gray-900 rounded-lg border border-gray-700">
        <div>
          <p className="text-sm text-gray-400">Running Count</p>
          <p className="text-2xl font-bold text-white">
            {countSnapshot.runningCount > 0 && "+"}
            {countSnapshot.runningCount}
          </p>
        </div>
        <div>
          <p className="text-sm text-gray-400">True Count</p>
          <p
            className={cn(
              "text-2xl font-bold",
              getTrueCountColor(countSnapshot.trueCount)
            )}
          >
            {countSnapshot.trueCount > 0 && "+"}
            {countSnapshot.trueCount}
          </p>
        </div>
        <div>
          <p className="text-sm text-gray-400">Cards Remaining</p>
          <p className="text-lg font-semibold text-white">
            {countSnapshot.cardsRemaining}
          </p>
        </div>
        <div>
          <p className="text-sm text-gray-400">Decks Remaining</p>
          <p className="text-lg font-semibold text-white">
            {countSnapshot.decksRemaining.toFixed(1)}
          </p>
        </div>
      </div>
    );
  };

  if (decisions.length === 0) {
    return (
      <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50">
        <Card className="bg-gray-900 border-green-500 max-w-lg w-full mx-4">
          <CardHeader>
            <CardTitle className="text-green-500">Session Replay</CardTitle>
            <CardDescription>
              No decision data available for this session
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={onClose}
              variant="outline"
              className="w-full border-gray-700"
            >
              Close
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const currentDecision = decisions[currentIndex];

  return (
    <div className="fixed inset-0 bg-black/95 overflow-y-auto z-50">
      <div className="min-h-screen p-4">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-3xl font-bold text-green-500">
                Session Replay
              </h1>
              <p className="text-gray-400">
                {new Date(session.startTime).toLocaleString()}
              </p>
            </div>
            <Button
              onClick={onClose}
              variant="ghost"
              className="text-gray-400 hover:text-white"
            >
              <X className="w-6 h-6" />
            </Button>
          </div>

          {/* Session Summary */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <Card className="bg-gray-900 border-gray-700">
              <CardContent className="p-4">
                <p className="text-sm text-gray-400">Total Decisions</p>
                <p className="text-2xl font-bold text-white">
                  {decisions.length}
                </p>
              </CardContent>
            </Card>
            <Card className="bg-gray-900 border-gray-700">
              <CardContent className="p-4">
                <p className="text-sm text-gray-400">Correct Decisions</p>
                <p className="text-2xl font-bold text-green-500">
                  {decisions.filter((d) => d.isCorrect).length}
                </p>
              </CardContent>
            </Card>
            <Card className="bg-gray-900 border-gray-700">
              <CardContent className="p-4">
                <p className="text-sm text-gray-400">Accuracy</p>
                <p className="text-2xl font-bold text-white">
                  {session.strategyAccuracy?.toFixed(1)}%
                </p>
              </CardContent>
            </Card>
            <Card className="bg-gray-900 border-gray-700">
              <CardContent className="p-4">
                <p className="text-sm text-gray-400">Grade</p>
                <p className="text-2xl font-bold text-blue-400">
                  {session.strategyGrade}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Decision Display */}
          <Card className="bg-gray-900 border-green-500 mb-6">
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle className="text-white">
                    Decision {currentIndex + 1} of {decisions.length}
                  </CardTitle>
                  <CardDescription>
                    {formatTimestamp(currentDecision.timestamp)}
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  {currentDecision.isCorrect ? (
                    <div className="flex items-center gap-1 text-green-500">
                      <CheckCircle2 className="w-5 h-5" />
                      <span className="font-semibold">Correct</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1 text-red-500">
                      <XCircle className="w-5 h-5" />
                      <span className="font-semibold">Incorrect</span>
                    </div>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {/* Cards Display */}
              <div className="mb-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Player Hand */}
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-3">
                      Your Hand (Value: {currentDecision.playerHandValue})
                    </h3>
                    <div className="flex gap-2">
                      {currentDecision.playerCards.map((card, idx) => (
                        <PlayingCard key={idx} card={card} size="md" />
                      ))}
                    </div>
                  </div>

                  {/* Dealer Card */}
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-3">
                      Dealer Up Card
                    </h3>
                    <PlayingCard
                      card={currentDecision.dealerUpCard}
                      size="md"
                    />
                  </div>
                </div>
              </div>

              {/* Decision Comparison */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                {/* Your Decision */}
                <div
                  className={cn(
                    "p-4 rounded-lg border-2",
                    currentDecision.isCorrect
                      ? "bg-green-950/30 border-green-700"
                      : "bg-red-950/30 border-red-700"
                  )}
                >
                  <p className="text-sm text-gray-400 mb-2">Your Decision</p>
                  <p
                    className={cn(
                      "text-2xl font-bold",
                      getActionColor(currentDecision.actualAction)
                    )}
                  >
                    {getActionLabel(currentDecision.actualAction)}
                  </p>
                </div>

                {/* Optimal Decision */}
                <div className="p-4 rounded-lg border-2 bg-blue-950/30 border-blue-700">
                  <p className="text-sm text-gray-400 mb-2">
                    Optimal Strategy
                  </p>
                  <p
                    className={cn(
                      "text-2xl font-bold",
                      getActionColor(currentDecision.optimalAction)
                    )}
                  >
                    {getActionLabel(currentDecision.optimalAction)}
                  </p>
                  <p className="text-sm text-gray-400 mt-2">
                    {currentDecision.optimalReason}
                  </p>
                </div>
              </div>

              {/* Available Actions */}
              <div className="mb-6">
                <p className="text-sm text-gray-400 mb-2">Available Options</p>
                <div className="flex gap-2 flex-wrap">
                  <span className="px-3 py-1 bg-gray-800 text-white rounded">
                    Hit
                  </span>
                  <span className="px-3 py-1 bg-gray-800 text-white rounded">
                    Stand
                  </span>
                  {currentDecision.canDouble && (
                    <span className="px-3 py-1 bg-purple-900 text-purple-300 rounded">
                      Double
                    </span>
                  )}
                  {currentDecision.canSplit && (
                    <span className="px-3 py-1 bg-orange-900 text-orange-300 rounded">
                      Split
                    </span>
                  )}
                  {currentDecision.canSurrender && (
                    <span className="px-3 py-1 bg-red-900 text-red-300 rounded">
                      Surrender
                    </span>
                  )}
                </div>
              </div>

              {/* Financial Metrics */}
              {currentDecision.outcome && currentDecision.profit !== undefined && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                    <DollarSign className="w-5 h-5" />
                    Financial Summary
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 p-4 bg-gray-900 rounded-lg border border-gray-700">
                    {/* Bet Amount */}
                    <div>
                      <p className="text-sm text-gray-400">Bet Amount</p>
                      <p className="text-xl font-bold text-white">
                        ${currentDecision.betAmount.toFixed(2)}
                      </p>
                    </div>

                    {/* Outcome */}
                    <div>
                      <p className="text-sm text-gray-400">Outcome</p>
                      <p
                        className={cn(
                          "text-xl font-bold",
                          getOutcomeColor(currentDecision.outcome)
                        )}
                      >
                        {getOutcomeLabel(currentDecision.outcome)}
                      </p>
                    </div>

                    {/* Payout */}
                    <div>
                      <p className="text-sm text-gray-400">Payout</p>
                      <p className="text-xl font-bold text-white">
                        ${(currentDecision.payout ?? 0).toFixed(2)}
                      </p>
                    </div>

                    {/* Actual Value (Profit/Loss) */}
                    <div>
                      <p className="text-sm text-gray-400">Actual Value</p>
                      <p
                        className={cn(
                          "text-xl font-bold flex items-center gap-1",
                          currentDecision.profit >= 0
                            ? "text-green-500"
                            : "text-red-500"
                        )}
                      >
                        {currentDecision.profit >= 0 ? (
                          <TrendingUp className="w-4 h-4" />
                        ) : (
                          <TrendingDown className="w-4 h-4" />
                        )}
                        {currentDecision.profit >= 0 ? "+" : ""}$
                        {Math.abs(currentDecision.profit).toFixed(2)}
                      </p>
                    </div>

                    {/* Expected Value */}
                    {(() => {
                      const evCalc = calculateHandEV({
                        betAmount: currentDecision.betAmount,
                        actualValue: currentDecision.profit,
                        trueCount: currentDecision.countSnapshot?.trueCount,
                        isCorrectDecision: currentDecision.isCorrect,
                      });

                      return (
                        <>
                          <div>
                            <p className="text-sm text-gray-400">Expected Value</p>
                            <p
                              className={cn(
                                "text-xl font-bold",
                                evCalc.expectedValue >= 0
                                  ? "text-blue-400"
                                  : "text-orange-400"
                              )}
                            >
                              {evCalc.expectedValue >= 0 ? "+" : ""}$
                              {evCalc.expectedValue.toFixed(2)}
                            </p>
                            <p className="text-xs text-gray-500">
                              Edge: {evCalc.finalEdge >= 0 ? "+" : ""}
                              {evCalc.finalEdge.toFixed(2)}%
                            </p>
                          </div>

                          {/* Variance */}
                          <div>
                            <p className="text-sm text-gray-400">Variance</p>
                            <p
                              className={cn(
                                "text-xl font-bold",
                                evCalc.variance >= 0
                                  ? "text-green-500"
                                  : "text-red-500"
                              )}
                            >
                              {evCalc.variance >= 0 ? "+" : ""}$
                              {evCalc.variance.toFixed(2)}
                            </p>
                            <p className="text-xs text-gray-500">
                              {evCalc.variance >= 0 ? "Lucky" : "Unlucky"}
                            </p>
                          </div>
                        </>
                      );
                    })()}
                  </div>
                </div>
              )}

              {/* Count Information */}
              {currentDecision.countSnapshot && (
                <div className="mb-4">
                  <h3 className="text-lg font-semibold text-white mb-3">
                    Card Count at Decision
                  </h3>
                  {renderCountInfo(currentDecision.countSnapshot)}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Navigation Controls */}
          <Card className="bg-gray-900 border-gray-700">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <Button
                  onClick={handlePrevious}
                  disabled={currentIndex === 0}
                  variant="outline"
                  className="border-gray-700"
                >
                  <ChevronLeft className="w-4 h-4 mr-1" />
                  Previous
                </Button>

                <div className="flex gap-2">
                  <Button
                    onClick={handlePlayPause}
                    className={
                      isPlaying
                        ? "bg-red-600 hover:bg-red-700"
                        : "bg-green-600 hover:bg-green-700"
                    }
                  >
                    {isPlaying ? "Pause" : "Play"}
                  </Button>
                </div>

                <Button
                  onClick={handleNext}
                  disabled={currentIndex >= decisions.length - 1}
                  variant="outline"
                  className="border-gray-700"
                >
                  Next
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </div>

              {/* Progress Bar */}
              <div className="mt-4">
                <div className="w-full bg-gray-800 rounded-full h-2">
                  <div
                    className="bg-green-500 h-2 rounded-full transition-all duration-300"
                    style={{
                      width: `${((currentIndex + 1) / decisions.length) * 100}%`,
                    }}
                  />
                </div>
                <p className="text-center text-sm text-gray-400 mt-2">
                  {currentIndex + 1} / {decisions.length}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
