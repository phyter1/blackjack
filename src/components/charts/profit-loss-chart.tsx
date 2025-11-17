"use client";

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { ProfitLossDataPoint } from "@/lib/chart-data-utils";
import { formatCurrency } from "@/lib/chart-data-utils";

interface ProfitLossChartProps {
  data: ProfitLossDataPoint[];
}

export function ProfitLossChart({ data }: ProfitLossChartProps) {
  if (data.length === 0) {
    return (
      <Card className="bg-gray-900 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white">Profit/Loss Over Time</CardTitle>
          <CardDescription>No session data available</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const finalProfit = data[data.length - 1]?.cumulativeProfit || 0;

  return (
    <Card className="bg-gray-900 border-gray-700">
      <CardHeader>
        <CardTitle className="text-white">Profit/Loss Over Time</CardTitle>
        <CardDescription>
          Cumulative P/L:
          <span className={finalProfit >= 0 ? "text-green-500 ml-2 font-semibold" : "text-red-500 ml-2 font-semibold"}>
            {formatCurrency(finalProfit)}
          </span>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis
              dataKey="sessionNumber"
              label={{ value: "Session #", position: "insideBottom", offset: -5, fill: "#9CA3AF" }}
              stroke="#6B7280"
              tick={{ fill: "#9CA3AF" }}
            />
            <YAxis
              label={{ value: "$ Amount", angle: -90, position: "insideLeft", fill: "#9CA3AF" }}
              tickFormatter={(value) => `$${value}`}
              stroke="#6B7280"
              tick={{ fill: "#9CA3AF" }}
            />
            <ReferenceLine y={0} stroke="#6B7280" strokeDasharray="3 3" />
            <Tooltip
              contentStyle={{ backgroundColor: "#1F2937", border: "1px solid #374151", borderRadius: "6px" }}
              labelStyle={{ color: "#9CA3AF" }}
              itemStyle={{ color: "#F3F4F6" }}
              formatter={(value: any, name: string) => {
                if (typeof value === "number") {
                  const label = name === "cumulativeProfit" ? "Cumulative P/L" : "Session P/L";
                  return [formatCurrency(value), label];
                }
                return [value, name];
              }}
            />
            <Line
              type="monotone"
              dataKey="cumulativeProfit"
              stroke="#10B981"
              strokeWidth={3}
              dot={{ fill: "#10B981", r: 4 }}
              activeDot={{ r: 6 }}
            />
            <Line
              type="monotone"
              dataKey="profit"
              stroke="#60A5FA"
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
