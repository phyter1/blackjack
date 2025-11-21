"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
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
import type { TimePlayedDataPoint } from "@/lib/chart-data-utils";

interface TimePlayedChartProps {
  data: TimePlayedDataPoint[];
}

function formatTime(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = Math.round(minutes % 60);

  if (hours > 0) {
    return `${hours}h ${mins}m`;
  }
  return `${mins}m`;
}

export function TimePlayedChart({ data }: TimePlayedChartProps) {
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
            Time Played
          </CardTitle>
          <CardDescription style={{ color: "var(--theme-text-secondary)" }}>
            No session data available
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const totalTime = data[data.length - 1]?.cumulativeTime || 0;

  return (
    <Card
      style={{
        background: "var(--theme-dashboard-card)",
        borderColor: "var(--theme-dashboard-card-border)",
      }}
    >
      <CardHeader>
        <CardTitle style={{ color: "var(--theme-text-primary)" }}>
          Time Played
        </CardTitle>
        <CardDescription style={{ color: "var(--theme-text-secondary)" }}>
          Total Time:
          <span
            className="ml-2 font-semibold"
            style={{ color: "var(--theme-primary)" }}
          >
            {formatTime(totalTime)}
          </span>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart
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
              label={{
                value: "Minutes",
                angle: -90,
                position: "insideLeft",
                fill: "var(--theme-text-secondary)",
              }}
              tickFormatter={(value) => formatTime(value)}
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
                  const label =
                    name === "cumulativeTime" ? "Total Time" : "Session";
                  return [formatTime(value), label];
                }
                return [value, name];
              }}
            />
            <Area
              type="monotone"
              dataKey="cumulativeTime"
              stroke="var(--theme-primary)"
              fill="var(--theme-primary)"
              fillOpacity={0.3}
              strokeWidth={3}
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
