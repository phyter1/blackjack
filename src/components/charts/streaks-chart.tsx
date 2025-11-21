"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ReferenceLine,
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
import type { StreakData } from "@/lib/chart-data-utils";

interface StreaksChartProps {
  data: StreakData;
}

export function StreaksChart({ data }: StreaksChartProps) {
  if (data.streakHistory.length === 0) {
    return (
      <Card
        style={{
          background: "var(--theme-dashboard-card)",
          borderColor: "var(--theme-dashboard-card-border)",
        }}
      >
        <CardHeader>
          <CardTitle style={{ color: "var(--theme-text-primary)" }}>
            Win/Loss Streaks
          </CardTitle>
          <CardDescription style={{ color: "var(--theme-text-secondary)" }}>
            No streak data available
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card
      style={{
        background: "var(--theme-dashboard-card)",
        borderColor: "var(--theme-dashboard-card-border)",
      }}
    >
      <CardHeader>
        <CardTitle style={{ color: "var(--theme-text-primary)" }}>
          Win/Loss Streaks
        </CardTitle>
        <CardDescription
          className="space-y-2"
          style={{ color: "var(--theme-text-secondary)" }}
        >
          <div className="flex gap-6">
            <div>
              Current Streak:{" "}
              <span
                className="font-semibold ml-2"
                style={{
                  color:
                    data.currentStreakType === "win"
                      ? "var(--theme-success)"
                      : data.currentStreakType === "loss"
                        ? "var(--theme-error)"
                        : "var(--theme-text-muted)",
                }}
              >
                {data.currentStreak === 0
                  ? "None"
                  : `${Math.abs(data.currentStreak)} ${data.currentStreakType}${Math.abs(data.currentStreak) > 1 ? "s" : ""}`}
              </span>
            </div>
            <div>
              Longest Win Streak:{" "}
              <span
                className="font-semibold ml-2"
                style={{ color: "var(--theme-success)" }}
              >
                {data.longestWinStreak}
              </span>
            </div>
            <div>
              Longest Loss Streak:{" "}
              <span
                className="font-semibold ml-2"
                style={{ color: "var(--theme-error)" }}
              >
                {data.longestLossStreak}
              </span>
            </div>
          </div>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart
            data={data.streakHistory}
            margin={{ top: 20, right: 20, left: 10, bottom: 5 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="var(--theme-border)"
              opacity={0.3}
            />
            <XAxis
              dataKey="sessionNumber"
              label={{
                value: "Session #",
                position: "insideBottom",
                offset: -5,
                fill: "var(--theme-text-secondary)",
              }}
              stroke="var(--theme-border)"
              tick={{ fill: "var(--theme-text-muted)" }}
            />
            <YAxis
              label={{
                value: "Streak Length",
                angle: -90,
                position: "insideLeft",
                fill: "var(--theme-text-secondary)",
              }}
              stroke="var(--theme-border)"
              tick={{ fill: "var(--theme-text-muted)" }}
            />
            <ReferenceLine
              y={0}
              stroke="var(--theme-border)"
              strokeDasharray="3 3"
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
                  const streakType = value > 0 ? "Win" : "Loss";
                  const label = `${streakType} Streak`;
                  return [Math.abs(value), label];
                }
                return [value, name];
              }}
            />
            <Bar dataKey="streak" radius={[4, 4, 0, 0]}>
              {data.streakHistory.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={
                    entry.streakType === "win"
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
  );
}
