"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
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
      <Card className="bg-gray-900 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white">Average Bet Size</CardTitle>
          <CardDescription>No betting data available</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const avgOfAvg =
    data.reduce((sum, d) => sum + d.avgBetSize, 0) / data.length;

  return (
    <Card className="bg-gray-900 border-gray-700">
      <CardHeader>
        <CardTitle className="text-white">Average Bet Size Over Time</CardTitle>
        <CardDescription>
          Overall Average:{" "}
          <span className="text-blue-400 font-semibold ml-2">
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
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis
              dataKey="sessionNumber"
              label={{
                value: "Session #",
                position: "insideBottom",
                offset: -5,
                fill: "#9CA3AF",
              }}
              stroke="#6B7280"
              tick={{ fill: "#9CA3AF" }}
            />
            <YAxis
              label={{
                value: "$ Avg Bet",
                angle: -90,
                position: "insideLeft",
                fill: "#9CA3AF",
              }}
              tickFormatter={(value) => `$${value}`}
              stroke="#6B7280"
              tick={{ fill: "#9CA3AF" }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "#1F2937",
                border: "1px solid #374151",
                borderRadius: "6px",
              }}
              labelStyle={{ color: "#9CA3AF" }}
              itemStyle={{ color: "#F3F4F6" }}
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
              wrapperStyle={{ color: "#9CA3AF" }}
              formatter={(value) => {
                return value === "avgBetSize" ? "Average Bet Size" : value;
              }}
            />
            <Line
              type="monotone"
              dataKey="avgBetSize"
              stroke="#3B82F6"
              strokeWidth={3}
              dot={{ fill: "#3B82F6", r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
