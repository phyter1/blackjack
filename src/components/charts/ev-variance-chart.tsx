"use client";

import { useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Legend,
} from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { EVDataPoint } from "@/lib/chart-data-utils";
import { formatCurrency } from "@/lib/chart-data-utils";

interface EVVarianceChartProps {
  perSessionData: EVDataPoint[];
  cumulativeData: EVDataPoint[];
}

export function EVVarianceChart({ perSessionData, cumulativeData }: EVVarianceChartProps) {
  const [mode, setMode] = useState<"per-session" | "cumulative">("cumulative");
  const data = mode === "cumulative" ? cumulativeData : perSessionData;
  if (data.length === 0) {
    return (
      <Card className="bg-gray-900 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white">Expected vs Actual Value</CardTitle>
          <CardDescription>No EV/AV data available</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const totalEV = data.reduce((sum, d) => sum + d.expectedValue, 0);
  const totalAV = data.reduce((sum, d) => sum + d.actualValue, 0);
  const variance = totalAV - totalEV;

  return (
    <Card className="bg-gray-900 border-gray-700">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-white">Expected vs Actual Value</CardTitle>
            <CardDescription>
              Variance:
              <span
                className={
                  variance >= 0
                    ? "text-green-500 ml-2 font-semibold"
                    : "text-red-500 ml-2 font-semibold"
                }
              >
                {formatCurrency(variance)}
              </span>
              <span className="text-gray-400 ml-2">
                ({variance >= 0 ? "+" : ""}
                {((variance / Math.abs(totalEV)) * 100).toFixed(1)}% vs EV)
              </span>
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={() => setMode("per-session")}
              variant={mode === "per-session" ? "default" : "outline"}
              size="sm"
              className={mode === "per-session" ? "" : "text-gray-400"}
            >
              Per Session
            </Button>
            <Button
              onClick={() => setMode("cumulative")}
              variant={mode === "cumulative" ? "default" : "outline"}
              size="sm"
              className={mode === "cumulative" ? "" : "text-gray-400"}
            >
              Cumulative
            </Button>
          </div>
        </div>
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
                value: "$ Amount",
                angle: -90,
                position: "insideLeft",
                fill: "#9CA3AF",
              }}
              tickFormatter={(value) => `$${value}`}
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
                  const label =
                    name === "expectedValue"
                      ? "Expected Value (EV)"
                      : "Actual Value (AV)";
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
                return value === "expectedValue"
                  ? "Expected Value (EV)"
                  : "Actual Value (AV)";
              }}
            />
            <Line
              type="monotone"
              dataKey="expectedValue"
              stroke="#F59E0B"
              strokeWidth={3}
              strokeDasharray="5 5"
              dot={{ fill: "#F59E0B", r: 4 }}
              activeDot={{ r: 6 }}
            />
            <Line
              type="monotone"
              dataKey="actualValue"
              stroke="#10B981"
              strokeWidth={3}
              dot={{ fill: "#10B981", r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
