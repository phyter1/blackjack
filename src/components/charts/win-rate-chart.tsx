"use client";

import {
  CartesianGrid,
  Line,
  LineChart,
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
import type { WinRateDataPoint } from "@/lib/chart-data-utils";

interface WinRateChartProps {
  data: WinRateDataPoint[];
}

export function WinRateChart({ data }: WinRateChartProps) {
  if (data.length === 0) {
    return (
      <Card
        style={{
          background: "var(--theme-dashboard-card)",
          borderColor: "var(--theme-dashboard-card-border)",
        }}
      >
        <CardHeader>
          <CardTitle style={{ color: "var(--theme-text-primary)" }}>Win Rate Trends</CardTitle>
          <CardDescription style={{ color: "var(--theme-text-secondary)" }}>No session data available</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const avgWinRate =
    data.length > 0
      ? data.reduce((sum, d) => sum + d.winRate, 0) / data.length
      : 0;

  return (
    <Card
      style={{
        background: "var(--theme-dashboard-card)",
        borderColor: "var(--theme-dashboard-card-border)",
      }}
    >
      <CardHeader>
        <CardTitle style={{ color: "var(--theme-text-primary)" }}>
          Win Rate Trends
        </CardTitle>
        <CardDescription style={{ color: "var(--theme-text-secondary)" }}>
          Overall Win Rate:
          <span
            className={
              avgWinRate >= 50
                ? "ml-2 font-semibold"
                : "ml-2 font-semibold"
            }
            style={{
              color: avgWinRate >= 50 ? "var(--theme-success)" : "var(--theme-error)",
            }}
          >
            {avgWinRate.toFixed(1)}%
          </span>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart
            data={data}
            margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
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
              domain={[0, 100]}
              label={{
                value: "Win Rate %",
                angle: -90,
                position: "insideLeft",
                fill: "#9CA3AF",
              }}
              tickFormatter={(value) => `${value}%`}
              stroke="#6B7280"
              tick={{ fill: "#9CA3AF" }}
            />
            <ReferenceLine
              y={50}
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
                  const label =
                    name === "movingAvgWinRate"
                      ? "5-Session Avg"
                      : "Session Win";
                  return [`${value.toFixed(1)}%`, label];
                }
                return [value, name];
              }}
            />
            <Line
              type="monotone"
              dataKey="movingAvgWinRate"
              stroke="var(--theme-success)"
              strokeWidth={3}
              dot={{ fill: "var(--theme-success)", r: 4 }}
              activeDot={{ r: 6 }}
            />
            <Line
              type="stepAfter"
              dataKey="winRate"
              stroke="var(--theme-primary)"
              strokeWidth={2}
              strokeOpacity={0.4}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
