"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { DealerUpcardStats } from "@/lib/chart-data-utils";
import { formatCurrency } from "@/lib/chart-data-utils";

interface DealerUpcardChartProps {
  data: DealerUpcardStats[];
}

export function DealerUpcardChart({ data }: DealerUpcardChartProps) {
  if (data.length === 0) {
    return (
      <Card
        style={{
          background: "var(--theme-dashboard-card)",
          borderColor: "var(--theme-dashboard-card-border)",
        }}
      >
        <CardHeader>
          <CardTitle style={{ color: "var(--theme-text-primary)" }}>
            Performance vs Dealer Upcard
          </CardTitle>
          <CardDescription style={{ color: "var(--theme-text-secondary)" }}>
            No upcard performance data available. Play with strategy tracking
            enabled to see this analysis.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  // Calculate overall stats
  const totalHands = data.reduce((sum, d) => sum + d.totalHands, 0);
  const totalWins = data.reduce((sum, d) => sum + d.wins, 0);
  const overallWinRate = totalHands > 0 ? (totalWins / totalHands) * 100 : 0;

  return (
    <div className="space-y-4">
      <Card
        style={{
          background: "var(--theme-dashboard-card)",
          borderColor: "var(--theme-dashboard-card-border)",
        }}
      >
        <CardHeader>
          <CardTitle style={{ color: "var(--theme-text-primary)" }}>
            Win Rate vs Dealer Upcard
          </CardTitle>
          <CardDescription style={{ color: "var(--theme-text-secondary)" }}>
            Overall Win Rate:{" "}
            <span
              className="font-semibold ml-2"
              style={{ color: "var(--theme-success)" }}
            >
              {overallWinRate.toFixed(1)}%
            </span>
            <span className="ml-2" style={{ color: "var(--theme-text-muted)" }}>
              ({totalHands} total hands)
            </span>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={data}
              margin={{ top: 20, right: 20, left: 10, bottom: 5 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="var(--theme-border)"
                opacity={0.3}
              />
              <XAxis
                dataKey="upcard"
                label={{
                  value: "Dealer Upcard",
                  position: "insideBottom",
                  offset: -5,
                  fill: "var(--theme-text-secondary)",
                }}
                stroke="var(--theme-border)"
                tick={{ fill: "var(--theme-text-muted)" }}
              />
              <YAxis
                label={{
                  value: "Win Rate %",
                  angle: -90,
                  position: "insideLeft",
                  fill: "var(--theme-text-secondary)",
                }}
                domain={[0, 100]}
                stroke="var(--theme-border)"
                tick={{ fill: "var(--theme-text-muted)" }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "var(--theme-dashboard-bg)",
                  border: "1px solid var(--theme-border)",
                  borderRadius: "6px",
                }}
                labelStyle={{ color: "var(--theme-text-secondary)" }}
                itemStyle={{ color: "var(--theme-text-primary)" }}
                content={({ active, payload }) => {
                  if (active && payload && payload.length > 0) {
                    const data = payload[0].payload as DealerUpcardStats;
                    return (
                      <div
                        className="rounded p-3 space-y-1"
                        style={{
                          background: "var(--theme-dashboard-card)",
                          borderColor: "var(--theme-border)",
                          border: "1px solid",
                        }}
                      >
                        <div
                          className="font-semibold"
                          style={{ color: "var(--theme-text-primary)" }}
                        >
                          Dealer Upcard: {data.upcard}
                        </div>
                        <div
                          className="text-sm"
                          style={{ color: "var(--theme-text-secondary)" }}
                        >
                          Win Rate: {data.winRate.toFixed(1)}%
                        </div>
                        <div
                          className="text-sm"
                          style={{ color: "var(--theme-text-secondary)" }}
                        >
                          Wins: {data.wins} | Losses: {data.losses} | Pushes:{" "}
                          {data.pushes}
                        </div>
                        <div
                          className="text-sm"
                          style={{ color: "var(--theme-text-secondary)" }}
                        >
                          Total Hands: {data.totalHands}
                        </div>
                        <div
                          className="text-sm font-semibold"
                          style={{
                            color:
                              data.totalProfit >= 0
                                ? "var(--theme-success)"
                                : "var(--theme-error)",
                          }}
                        >
                          Total Profit: {formatCurrency(data.totalProfit)}
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar dataKey="winRate" radius={[4, 4, 0, 0]}>
                {data.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={
                      entry.winRate >= 50
                        ? "var(--theme-success)"
                        : entry.winRate >= 40
                          ? "var(--theme-warning)"
                          : "var(--theme-error)"
                    }
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card
        style={{
          background: "var(--theme-dashboard-card)",
          borderColor: "var(--theme-dashboard-card-border)",
        }}
      >
        <CardHeader>
          <CardTitle style={{ color: "var(--theme-text-primary)" }}>
            Profit vs Dealer Upcard
          </CardTitle>
          <CardDescription style={{ color: "var(--theme-text-secondary)" }}>
            Shows average profit per hand against each dealer upcard
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={data}
              margin={{ top: 20, right: 20, left: 10, bottom: 5 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="var(--theme-border)"
                opacity={0.3}
              />
              <XAxis
                dataKey="upcard"
                label={{
                  value: "Dealer Upcard",
                  position: "insideBottom",
                  offset: -5,
                  fill: "var(--theme-text-secondary)",
                }}
                stroke="var(--theme-border)"
                tick={{ fill: "var(--theme-text-muted)" }}
              />
              <YAxis
                label={{
                  value: "Avg Profit",
                  angle: -90,
                  position: "insideLeft",
                  fill: "var(--theme-text-secondary)",
                }}
                tickFormatter={(value) => `$${value.toFixed(0)}`}
                stroke="var(--theme-border)"
                tick={{ fill: "var(--theme-text-muted)" }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "var(--theme-dashboard-bg)",
                  border: "1px solid var(--theme-border)",
                  borderRadius: "6px",
                }}
                labelStyle={{ color: "var(--theme-text-secondary)" }}
                itemStyle={{ color: "var(--theme-text-primary)" }}
                formatter={(value: any, name: string) => {
                  if (typeof value === "number") {
                    return [formatCurrency(value), "Avg Profit"];
                  }
                  return [value, name];
                }}
              />
              <Bar dataKey="avgProfit" radius={[4, 4, 0, 0]}>
                {data.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={
                      entry.avgProfit >= 0
                        ? "var(--theme-success)"
                        : "var(--theme-error)"
                    }
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
