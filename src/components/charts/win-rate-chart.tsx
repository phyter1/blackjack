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
      <Card className="bg-gray-900 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white">Win Rate Trends</CardTitle>
          <CardDescription>No session data available</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const avgWinRate =
    data.length > 0
      ? data.reduce((sum, d) => sum + d.winRate, 0) / data.length
      : 0;

  return (
    <Card className="bg-gray-900 border-gray-700">
      <CardHeader>
        <CardTitle className="text-white">Win Rate Trends</CardTitle>
        <CardDescription>
          Overall Win Rate:
          <span
            className={
              avgWinRate >= 50
                ? "text-green-500 ml-2 font-semibold"
                : "text-red-500 ml-2 font-semibold"
            }
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
            <ReferenceLine y={50} stroke="#6B7280" strokeDasharray="3 3" />
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
              stroke="#10B981"
              strokeWidth={3}
              dot={{ fill: "#10B981", r: 4 }}
              activeDot={{ r: 6 }}
            />
            <Line
              type="stepAfter"
              dataKey="winRate"
              stroke="#60A5FA"
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
