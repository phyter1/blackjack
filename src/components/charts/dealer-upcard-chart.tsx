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
      <Card className="bg-gray-900 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white">
            Performance vs Dealer Upcard
          </CardTitle>
          <CardDescription>
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
      <Card className="bg-gray-900 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white">
            Win Rate vs Dealer Upcard
          </CardTitle>
          <CardDescription>
            Overall Win Rate:{" "}
            <span className="text-green-400 font-semibold ml-2">
              {overallWinRate.toFixed(1)}%
            </span>
            <span className="text-gray-400 ml-2">
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
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis
                dataKey="upcard"
                label={{
                  value: "Dealer Upcard",
                  position: "insideBottom",
                  offset: -5,
                  fill: "#9CA3AF",
                }}
                stroke="#6B7280"
                tick={{ fill: "#9CA3AF" }}
              />
              <YAxis
                label={{
                  value: "Win Rate %",
                  angle: -90,
                  position: "insideLeft",
                  fill: "#9CA3AF",
                }}
                domain={[0, 100]}
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
                content={({ active, payload }) => {
                  if (active && payload && payload.length > 0) {
                    const data = payload[0].payload as DealerUpcardStats;
                    return (
                      <div className="bg-gray-800 border border-gray-700 rounded p-3 space-y-1">
                        <div className="text-gray-300 font-semibold">
                          Dealer Upcard: {data.upcard}
                        </div>
                        <div className="text-sm text-gray-400">
                          Win Rate: {data.winRate.toFixed(1)}%
                        </div>
                        <div className="text-sm text-gray-400">
                          Wins: {data.wins} | Losses: {data.losses} | Pushes:{" "}
                          {data.pushes}
                        </div>
                        <div className="text-sm text-gray-400">
                          Total Hands: {data.totalHands}
                        </div>
                        <div
                          className={`text-sm font-semibold ${data.totalProfit >= 0 ? "text-green-400" : "text-red-400"}`}
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
                        ? "#10B981"
                        : entry.winRate >= 40
                          ? "#F59E0B"
                          : "#EF4444"
                    }
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card className="bg-gray-900 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white">Profit vs Dealer Upcard</CardTitle>
          <CardDescription>
            Shows average profit per hand against each dealer upcard
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={data}
              margin={{ top: 20, right: 20, left: 10, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis
                dataKey="upcard"
                label={{
                  value: "Dealer Upcard",
                  position: "insideBottom",
                  offset: -5,
                  fill: "#9CA3AF",
                }}
                stroke="#6B7280"
                tick={{ fill: "#9CA3AF" }}
              />
              <YAxis
                label={{
                  value: "Avg Profit",
                  angle: -90,
                  position: "insideLeft",
                  fill: "#9CA3AF",
                }}
                tickFormatter={(value) => `$${value.toFixed(0)}`}
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
                    return [formatCurrency(value), "Avg Profit"];
                  }
                  return [value, name];
                }}
              />
              <Bar dataKey="avgProfit" radius={[4, 4, 0, 0]}>
                {data.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.avgProfit >= 0 ? "#10B981" : "#EF4444"}
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
