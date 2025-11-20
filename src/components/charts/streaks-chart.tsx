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
      <Card className="bg-gray-900 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white">Win/Loss Streaks</CardTitle>
          <CardDescription>No streak data available</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="bg-gray-900 border-gray-700">
      <CardHeader>
        <CardTitle className="text-white">Win/Loss Streaks</CardTitle>
        <CardDescription className="space-y-2">
          <div className="flex gap-6">
            <div>
              Current Streak:{" "}
              <span
                className={
                  data.currentStreakType === "win"
                    ? "text-green-500 font-semibold ml-2"
                    : data.currentStreakType === "loss"
                      ? "text-red-500 font-semibold ml-2"
                      : "text-gray-400 font-semibold ml-2"
                }
              >
                {data.currentStreak === 0
                  ? "None"
                  : `${Math.abs(data.currentStreak)} ${data.currentStreakType}${Math.abs(data.currentStreak) > 1 ? "s" : ""}`}
              </span>
            </div>
            <div>
              Longest Win Streak:{" "}
              <span className="text-green-500 font-semibold ml-2">
                {data.longestWinStreak}
              </span>
            </div>
            <div>
              Longest Loss Streak:{" "}
              <span className="text-red-500 font-semibold ml-2">
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
                value: "Streak Length",
                angle: -90,
                position: "insideLeft",
                fill: "#9CA3AF",
              }}
              stroke="#6B7280"
              tick={{ fill: "#9CA3AF" }}
            />
            <ReferenceLine y={0} stroke="#6B7280" strokeDasharray="3 3" />
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
                  fill={entry.streakType === "win" ? "#10B981" : "#EF4444"}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
