"use client";

import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import type { UserStats } from "@/types/user";

interface StatsPanelProps {
  stats: UserStats | null;
}

export function StatsPanel({ stats }: StatsPanelProps) {
  const formatDuration = (ms: number) => {
    const minutes = Math.floor(ms / 60000);
    const hours = Math.floor(minutes / 60);
    if (hours > 0) {
      return `${hours}h ${minutes % 60}m`;
    }
    return `${minutes}m`;
  };

  if (!stats) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <Card className="bg-gray-900 border-gray-700">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-gray-400">
            Total Sessions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-white">
            {stats.totalSessionsPlayed}
          </div>
          <p className="text-xs text-gray-500">
            {stats.totalRoundsPlayed} rounds played
          </p>
        </CardContent>
      </Card>

      <Card className="bg-gray-900 border-gray-700">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-gray-400">Win Rate</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-white">
            {stats.winRate.toFixed(1)}%
          </div>
          <p className="text-xs text-gray-500">Session win rate</p>
        </CardContent>
      </Card>

      <Card className="bg-gray-900 border-gray-700">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-gray-400">
            Total Play Time
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-white">
            {formatDuration(stats.totalTimePlayedMs)}
          </div>
          <p className="text-xs text-gray-500">Time at the tables</p>
        </CardContent>
      </Card>
    </div>
  );
}
