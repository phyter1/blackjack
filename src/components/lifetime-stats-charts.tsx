"use client";

import { useMemo } from "react";
import { BetSizeChart } from "@/components/charts/bet-size-chart";
import { DealerUpcardChart } from "@/components/charts/dealer-upcard-chart";
import { EVVarianceChart } from "@/components/charts/ev-variance-chart";
import { ProfitLossChart } from "@/components/charts/profit-loss-chart";
import { StreaksChart } from "@/components/charts/streaks-chart";
import { TimePlayedChart } from "@/components/charts/time-played-chart";
import { WinRateChart } from "@/components/charts/win-rate-chart";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  analyzeDealerUpcards,
  analyzeStreaks,
  transformToBetSizeData,
  transformToCumulativeEVData,
  transformToEVData,
  transformToProfitLossData,
  transformToTimePlayedData,
  transformToWinRateData,
} from "@/lib/chart-data-utils";
import type { GameSession } from "@/types/user";

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
      <Card
        style={{
          background: "var(--theme-dashboard-card)",
          borderColor: "var(--theme-dashboard-card-border)",
        }}
      >
        <CardHeader>
          <CardTitle style={{ color: "var(--theme-text-primary)" }}>
            Lifetime Statistics
          </CardTitle>
          <CardDescription style={{ color: "var(--theme-text-secondary)" }}>
            Play some games to see your lifetime statistics and trends
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p
            className="text-center py-8"
            style={{ color: "var(--theme-text-muted)" }}
          >
            No session data available. Start playing to track your progress!
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      <div>
        <h2
          className="text-lg font-bold"
          style={{ color: "var(--theme-text-primary)" }}
        >
          Lifetime Statistics
        </h2>
        <p className="text-sm" style={{ color: "var(--theme-text-secondary)" }}>
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
            <Card
              style={{
                background: "var(--theme-dashboard-card)",
                borderColor: "var(--theme-dashboard-card-border)",
              }}
            >
              <CardHeader>
                <CardTitle style={{ color: "var(--theme-text-primary)" }}>
                  Expected vs Actual Value
                </CardTitle>
                <CardDescription
                  style={{ color: "var(--theme-text-secondary)" }}
                >
                  No EV/AV data available
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p
                  className="text-center py-8"
                  style={{ color: "var(--theme-text-muted)" }}
                >
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
