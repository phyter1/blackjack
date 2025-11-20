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
      <Card className="bg-gray-900 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white">Time Played</CardTitle>
          <CardDescription>No session data available</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const totalTime = data[data.length - 1]?.cumulativeTime || 0;

  return (
    <Card className="bg-gray-900 border-gray-700">
      <CardHeader>
        <CardTitle className="text-white">Time Played</CardTitle>
        <CardDescription>
          Total Time:
          <span className="text-blue-400 ml-2 font-semibold">
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
                value: "Minutes",
                angle: -90,
                position: "insideLeft",
                fill: "#9CA3AF",
              }}
              tickFormatter={(value) => formatTime(value)}
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
              stroke="#60A5FA"
              fill="#60A5FA"
              fillOpacity={0.3}
              strokeWidth={3}
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
