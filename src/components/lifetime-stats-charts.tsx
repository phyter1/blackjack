"use client";

import { useMemo } from "react";
import type { GameSession } from "@/types/user";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProfitLossChart } from "@/components/charts/profit-loss-chart";
import { WinRateChart } from "@/components/charts/win-rate-chart";
import { EVVarianceChart } from "@/components/charts/ev-variance-chart";
import { TimePlayedChart } from "@/components/charts/time-played-chart";
import { BetSizeChart } from "@/components/charts/bet-size-chart";
import { StreaksChart } from "@/components/charts/streaks-chart";
import { DealerUpcardChart } from "@/components/charts/dealer-upcard-chart";
import {
  transformToProfitLossData,
  transformToWinRateData,
  transformToEVData,
  transformToCumulativeEVData,
  transformToTimePlayedData,
  transformToBetSizeData,
  analyzeStreaks,
  analyzeDealerUpcards,
} from "@/lib/chart-data-utils";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface LifetimeStatsChartsProps {
  sessions: GameSession[];
}

export function LifetimeStatsCharts({ sessions }: LifetimeStatsChartsProps) {
  const profitLossData = useMemo(
    () => transformToProfitLossData(sessions),
    [sessions],
  );

  const winRateData = useMemo(
    () => transformToWinRateData(sessions),
    [sessions],
  );

  const evData = useMemo(() => transformToEVData(sessions), [sessions]);

  const cumulativeEvData = useMemo(
    () => transformToCumulativeEVData(sessions),
    [sessions],
  );

  const timePlayedData = useMemo(
    () => transformToTimePlayedData(sessions),
    [sessions],
  );

  const betSizeData = useMemo(
    () => transformToBetSizeData(sessions),
    [sessions],
  );

  const streakData = useMemo(() => analyzeStreaks(sessions), [sessions]);

  const dealerUpcardData = useMemo(
    () => analyzeDealerUpcards(sessions),
    [sessions],
  );

  if (sessions.length === 0) {
    return (
      <Card className="bg-gray-900 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white">Lifetime Statistics</CardTitle>
          <CardDescription>
            Play some games to see your lifetime statistics and trends
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-gray-400 text-center py-8">
            No session data available. Start playing to track your progress!
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-white">
          Lifetime Statistics
        </h2>
        <p className="text-gray-400">
          Track your performance across {sessions.length} session
          {sessions.length !== 1 ? "s" : ""}
        </p>
      </div>

      <Tabs defaultValue="profit-loss" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="profit-loss">P/L</TabsTrigger>
          <TabsTrigger value="win-rate">Win Rate</TabsTrigger>
          <TabsTrigger value="ev-av">EV/AV</TabsTrigger>
          <TabsTrigger value="time">Time</TabsTrigger>
          <TabsTrigger value="advanced">Advanced</TabsTrigger>
        </TabsList>

        <TabsContent value="profit-loss" className="space-y-4">
          <ProfitLossChart data={profitLossData} />
        </TabsContent>

        <TabsContent value="win-rate" className="space-y-4">
          <WinRateChart data={winRateData} />
        </TabsContent>

        <TabsContent value="ev-av" className="space-y-4">
          {evData.length > 0 ? (
            <EVVarianceChart
              perSessionData={evData}
              cumulativeData={cumulativeEvData}
              sessions={sessions}
            />
          ) : (
            <Card className="bg-gray-900 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">
                  Expected vs Actual Value
                </CardTitle>
                <CardDescription>No EV/AV data available</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-400 text-center py-8">
                  EV/AV tracking is available when playing with strategy
                  analysis enabled.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="time" className="space-y-4">
          <TimePlayedChart data={timePlayedData} />
        </TabsContent>

        <TabsContent value="advanced" className="space-y-4">
          <BetSizeChart data={betSizeData} />
          <StreaksChart data={streakData} />
          <DealerUpcardChart data={dealerUpcardData} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
