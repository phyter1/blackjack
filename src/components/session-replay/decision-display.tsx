"use client";

import { CheckCircle2, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import type { PlayerDecision } from "@/modules/strategy/decision-tracker";
import { PlayingCard } from "../playing-card";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";

interface DecisionDisplayProps {
  decision: PlayerDecision;
  index: number;
  total: number;
}

export function DecisionDisplay({
  decision,
  index,
  total,
}: DecisionDisplayProps) {
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

  return (
    <Card className="bg-gray-900 border-green-500 mb-6">
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="text-white">
              Decision {index + 1} of {total}
            </CardTitle>
            <CardDescription>
              {formatTimestamp(decision.timestamp)}
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            {decision.isCorrect ? (
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
                Your Hand (Value: {decision.playerHandValue})
              </h3>
              <div className="flex gap-2">
                {decision.playerCards.map((card, idx) => (
                  <PlayingCard key={idx} card={card} size="md" />
                ))}
              </div>
            </div>

            {/* Dealer Card */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-3">
                Dealer Up Card
              </h3>
              <PlayingCard card={decision.dealerUpCard} size="md" />
            </div>
          </div>
        </div>

        {/* Decision Comparison */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {/* Your Decision */}
          <div
            className={cn(
              "p-4 rounded-lg border-2",
              decision.isCorrect
                ? "bg-green-950/30 border-green-700"
                : "bg-red-950/30 border-red-700",
            )}
          >
            <p className="text-sm text-gray-400 mb-2">Your Decision</p>
            <p
              className={cn(
                "text-2xl font-bold",
                getActionColor(decision.actualAction),
              )}
            >
              {getActionLabel(decision.actualAction)}
            </p>
          </div>

          {/* Optimal Decision */}
          <div className="p-4 rounded-lg border-2 bg-blue-950/30 border-blue-700">
            <p className="text-sm text-gray-400 mb-2">Optimal Strategy</p>
            <p
              className={cn(
                "text-2xl font-bold",
                getActionColor(decision.optimalAction),
              )}
            >
              {getActionLabel(decision.optimalAction)}
            </p>
            <p className="text-sm text-gray-400 mt-2">
              {decision.optimalReason}
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
            {decision.canDouble && (
              <span className="px-3 py-1 bg-purple-900 text-purple-300 rounded">
                Double
              </span>
            )}
            {decision.canSplit && (
              <span className="px-3 py-1 bg-orange-900 text-orange-300 rounded">
                Split
              </span>
            )}
            {decision.canSurrender && (
              <span className="px-3 py-1 bg-red-900 text-red-300 rounded">
                Surrender
              </span>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
