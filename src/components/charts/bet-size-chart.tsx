"use client";

import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
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
import type { BetSizeDataPoint } from "@/lib/chart-data-utils";
import { formatCurrency } from "@/lib/chart-data-utils";

interface BetSizeChartProps {
  data: BetSizeDataPoint[];
}

export function BetSizeChart({ data }: BetSizeChartProps) {
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
            Average Bet Size
          </CardTitle>
          <CardDescription style={{ color: "var(--theme-text-secondary)" }}>
            No betting data available
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const avgOfAvg = data.reduce((sum, d) => sum + d.avgBetSize, 0) / data.length;

  return (
    <Card
      style={{
        background: "var(--theme-dashboard-card)",
        borderColor: "var(--theme-dashboard-card-border)",
      }}
    >
      <CardHeader>
        <CardTitle style={{ color: "var(--theme-text-primary)" }}>
          Average Bet Size Over Time
        </CardTitle>
        <CardDescription style={{ color: "var(--theme-text-secondary)" }}>
          Overall Average:{" "}
          <span
            className="font-semibold ml-2"
            style={{ color: "var(--theme-primary)" }}
          >
            {formatCurrency(avgOfAvg)}
          </span>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart
            data={data}
            margin={{ top: 35, right: 20, left: 10, bottom: 5 }}
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
                value: "$ Avg Bet",
                angle: -90,
                position: "insideLeft",
                fill: "var(--theme-text-secondary)",
              }}
              tickFormatter={(value) => `$${value}`}
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
                  const label = name === "avgBetSize" ? "Avg Bet Size" : name;
                  return [formatCurrency(value), label];
                }
                return [value, name];
              }}
            />
            <Legend
              verticalAlign="top"
              height={36}
              iconType="line"
              wrapperStyle={{ color: "var(--theme-text-secondary)" }}
              formatter={(value) => {
                return value === "avgBetSize" ? "Average Bet Size" : value;
              }}
            />
            <Line
              type="monotone"
              dataKey="avgBetSize"
              stroke="var(--theme-primary)"
              strokeWidth={3}
              dot={{ fill: "var(--theme-primary)", r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
