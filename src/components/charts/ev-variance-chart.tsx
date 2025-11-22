"use client";

import { useMemo, useState } from "react";
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { EVDataPoint } from "@/lib/chart-data-utils";
import {
  formatCurrency,
  transformToAdvantagePlayEVData,
} from "@/lib/chart-data-utils";
import type { AdvantagePlayLevel } from "@/modules/strategy/ev-calculator";
import { getAdvantagePlayDescription } from "@/modules/strategy/ev-calculator";
import type { GameSession } from "@/types/user";

interface EVVarianceChartProps {
  perSessionData: EVDataPoint[];
  cumulativeData: EVDataPoint[];
  sessions: GameSession[];
}

export function EVVarianceChart({
  perSessionData,
  cumulativeData,
  sessions,
}: EVVarianceChartProps) {
  const [mode, setMode] = useState<"per-session" | "cumulative">("cumulative");
  const [advantageLevel, setAdvantageLevel] =
    useState<AdvantagePlayLevel>("basic-strategy");

  // Calculate data for all advantage play levels
  const advantagePlayData = useMemo(() => {
    const levels: AdvantagePlayLevel[] = [
      "house-edge",
      "basic-strategy",
      "card-counting-conservative",
      "card-counting-aggressive",
      "perfect-play",
    ];

    const dataByLevel: Record<
      AdvantagePlayLevel,
      {
        perSession: EVDataPoint[];
        cumulative: EVDataPoint[];
      }
    > = {} as any;

    for (const level of levels) {
      dataByLevel[level] = {
        perSession: transformToAdvantagePlayEVData(sessions, level, false),
        cumulative: transformToAdvantagePlayEVData(sessions, level, true),
      };
    }

    return dataByLevel;
  }, [sessions]);

  // Use appropriate data based on selected level
  const data =
    advantageLevel === "basic-strategy"
      ? mode === "cumulative"
        ? cumulativeData
        : perSessionData
      : mode === "cumulative"
        ? advantagePlayData[advantageLevel]?.cumulative || []
        : advantagePlayData[advantageLevel]?.perSession || [];

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
            Expected vs Actual Value
          </CardTitle>
          <CardDescription style={{ color: "var(--theme-text-secondary)" }}>
            No EV/AV data available
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const totalEV = data[data.length - 1]?.expectedValue || 0;
  const totalAV = data[data.length - 1]?.actualValue || 0;
  const variance = totalAV - totalEV;

  // Determine line color based on advantage level
  const getEVLineColor = () => {
    switch (advantageLevel) {
      case "house-edge":
        return "var(--theme-error)"; // Red - house advantage
      case "basic-strategy":
        return "var(--theme-warning)"; // Amber - slight house advantage
      case "card-counting-conservative":
        return "var(--theme-primary)"; // Blue - small player advantage
      case "card-counting-aggressive":
        return "#8B5CF6"; // Purple - moderate player advantage
      case "perfect-play":
        return "#EC4899"; // Pink - theoretical maximum
      default:
        return "var(--theme-warning)";
    }
  };

  return (
    <Card
      style={{
        background: "var(--theme-dashboard-card)",
        borderColor: "var(--theme-dashboard-card-border)",
      }}
    >
      <CardHeader>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle style={{ color: "var(--theme-text-primary)" }}>
                Expected vs Actual Value
              </CardTitle>
              <CardDescription style={{ color: "var(--theme-text-secondary)" }}>
                Variance:
                <span
                  className="ml-2 font-semibold"
                  style={{
                    color:
                      variance >= 0
                        ? "var(--theme-success)"
                        : "var(--theme-error)",
                  }}
                >
                  {formatCurrency(variance)}
                </span>
                <span
                  className="ml-2"
                  style={{ color: "var(--theme-text-muted)" }}
                >
                  ({variance >= 0 ? "+" : ""}
                  {totalEV !== 0
                    ? ((variance / Math.abs(totalEV)) * 100).toFixed(1)
                    : "0.0"}
                  % vs EV)
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

          {/* Advantage Play Level Selector */}
          <div className="flex items-center gap-3">
            <span
              className="text-sm"
              style={{ color: "var(--theme-text-muted)" }}
            >
              Advantage Play:
            </span>
            <Select
              value={advantageLevel}
              onValueChange={(value) =>
                setAdvantageLevel(value as AdvantagePlayLevel)
              }
            >
              <SelectTrigger className="w-64">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="house-edge">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500" />
                    House Edge (Typical Player)
                  </div>
                </SelectItem>
                <SelectItem value="basic-strategy">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-amber-500" />
                    Basic Strategy
                  </div>
                </SelectItem>
                <SelectItem value="card-counting-conservative">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-blue-500" />
                    Card Counting (1-4 spread)
                  </div>
                </SelectItem>
                <SelectItem value="card-counting-aggressive">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-purple-500" />
                    Card Counting (1-8 spread)
                  </div>
                </SelectItem>
                <SelectItem value="perfect-play">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-pink-500" />
                    Perfect Play (Theoretical)
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Description of selected advantage play level */}
          <div
            className="text-sm italic"
            style={{ color: "var(--theme-text-muted)" }}
          >
            {getAdvantagePlayDescription(advantageLevel)}
          </div>
        </div>
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
                    name === "expectedValue"
                      ? `EV (${advantageLevel.replace(/-/g, " ")})`
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
              wrapperStyle={{ color: "var(--theme-text-secondary)" }}
              formatter={(value) => {
                return value === "expectedValue"
                  ? `EV (${advantageLevel.replace(/-/g, " ")})`
                  : "Actual Value (AV)";
              }}
            />
            <Line
              type="monotone"
              dataKey="expectedValue"
              stroke={getEVLineColor()}
              strokeWidth={3}
              strokeDasharray="5 5"
              dot={{ fill: getEVLineColor(), r: 4 }}
              activeDot={{ r: 6 }}
            />
            <Line
              type="monotone"
              dataKey="actualValue"
              stroke="var(--theme-success)"
              strokeWidth={3}
              dot={{ fill: "var(--theme-success)", r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
