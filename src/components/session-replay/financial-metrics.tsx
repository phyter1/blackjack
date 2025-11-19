"use client";

import { cn } from "@/lib/utils";
import { DollarSign, TrendingUp, TrendingDown } from "lucide-react";
import { calculateHandEV } from "@/modules/strategy/ev-calculator";
import type { PlayerDecision } from "@/modules/strategy/decision-tracker";

interface FinancialMetricsProps {
  decision: PlayerDecision;
}

export function FinancialMetrics({ decision }: FinancialMetricsProps) {
  if (!decision.outcome || decision.profit === undefined) {
    return null;
  }

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

  const evCalc = calculateHandEV({
    betAmount: decision.betAmount,
    actualValue: decision.profit,
    trueCount: decision.countSnapshot?.trueCount,
    isCorrectDecision: decision.isCorrect,
  });

  return (
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
            ${decision.betAmount.toFixed(2)}
          </p>
        </div>

        {/* Outcome */}
        <div>
          <p className="text-sm text-gray-400">Outcome</p>
          <p
            className={cn(
              "text-xl font-bold",
              getOutcomeColor(decision.outcome),
            )}
          >
            {getOutcomeLabel(decision.outcome)}
          </p>
        </div>

        {/* Payout */}
        <div>
          <p className="text-sm text-gray-400">Payout</p>
          <p className="text-xl font-bold text-white">
            ${(decision.payout ?? 0).toFixed(2)}
          </p>
        </div>

        {/* Actual Value (Profit/Loss) */}
        <div>
          <p className="text-sm text-gray-400">Actual Value</p>
          <p
            className={cn(
              "text-xl font-bold flex items-center gap-1",
              decision.profit >= 0 ? "text-green-500" : "text-red-500",
            )}
          >
            {decision.profit >= 0 ? (
              <TrendingUp className="w-4 h-4" />
            ) : (
              <TrendingDown className="w-4 h-4" />
            )}
            {decision.profit >= 0 ? "+" : ""}$
            {Math.abs(decision.profit).toFixed(2)}
          </p>
        </div>

        {/* Expected Value */}
        <div>
          <p className="text-sm text-gray-400">Expected Value</p>
          <p
            className={cn(
              "text-xl font-bold",
              evCalc.expectedValue >= 0 ? "text-blue-400" : "text-orange-400",
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
              evCalc.variance >= 0 ? "text-green-500" : "text-red-500",
            )}
          >
            {evCalc.variance >= 0 ? "+" : ""}${evCalc.variance.toFixed(2)}
          </p>
          <p className="text-xs text-gray-500">
            {evCalc.variance >= 0 ? "Lucky" : "Unlucky"}
          </p>
        </div>
      </div>
    </div>
  );
}
