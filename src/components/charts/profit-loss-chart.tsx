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
import type { ProfitLossDataPoint } from "@/lib/chart-data-utils";
import { formatCurrency } from "@/lib/chart-data-utils";

interface ProfitLossChartProps {
  data: ProfitLossDataPoint[];
}

export function ProfitLossChart({ data }: ProfitLossChartProps) {
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
            Profit/Loss Over Time
          </CardTitle>
          <CardDescription style={{ color: "var(--theme-text-secondary)" }}>
            No session data available
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const finalProfit = data[data.length - 1]?.cumulativeProfit || 0;

  return (
    <Card
      style={{
        background: "var(--theme-dashboard-card)",
        borderColor: "var(--theme-dashboard-card-border)",
      }}
    >
      <CardHeader>
        <CardTitle style={{ color: "var(--theme-text-primary)" }}>
          Profit/Loss Over Time
        </CardTitle>
        <CardDescription style={{ color: "var(--theme-text-secondary)" }}>
          Cumulative P/L:
          <span
            className="ml-2 font-semibold"
            style={{
              color:
                finalProfit >= 0 ? "var(--theme-success)" : "var(--theme-error)",
            }}
          >
            {formatCurrency(finalProfit)}
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
              label={{
                value: "$ Amount",
                angle: -90,
                position: "insideLeft",
                fill: "var(--theme-text-secondary)",
              }}
              tickFormatter={(value) => `$${value}`}
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
                  const label =
                    name === "cumulativeProfit"
                      ? "Cumulative P/L"
                      : "Session P/L";
                  return [formatCurrency(value), label];
                }
                return [value, name];
              }}
            />
            <Line
              type="monotone"
              dataKey="cumulativeProfit"
              stroke="var(--theme-success)"
              strokeWidth={3}
              dot={{ fill: "var(--theme-success)", r: 4 }}
              activeDot={{ r: 6 }}
            />
            <Line
              type="monotone"
              dataKey="profit"
              stroke="var(--theme-primary)"
              strokeWidth={2}
              strokeDasharray="5 5"
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
