"use client";

import type { UserStats } from "@/types/user";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";

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
    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
      <Card
        style={{
          background: "var(--theme-dashboard-card)",
          borderColor: "var(--theme-dashboard-card-border)",
        }}
      >
        <CardHeader className="pb-2">
          <CardTitle
            className="text-xs"
            style={{ color: "var(--theme-text-secondary)" }}
          >
            Total Sessions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div
            className="text-2xl font-bold"
            style={{ color: "var(--theme-text-primary)" }}
          >
            {stats.totalSessionsPlayed}
          </div>
          <p className="text-xs" style={{ color: "var(--theme-text-muted)" }}>
            {stats.totalRoundsPlayed} rounds
          </p>
        </CardContent>
      </Card>

      <Card
        style={{
          background: "var(--theme-dashboard-card)",
          borderColor: "var(--theme-dashboard-card-border)",
        }}
      >
        <CardHeader className="pb-2">
          <CardTitle
            className="text-xs"
            style={{ color: "var(--theme-text-secondary)" }}
          >
            Win Rate
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div
            className="text-2xl font-bold"
            style={{ color: "var(--theme-text-primary)" }}
          >
            {stats.winRate.toFixed(1)}%
          </div>
          <p className="text-xs" style={{ color: "var(--theme-text-muted)" }}>
            Session win rate
          </p>
        </CardContent>
      </Card>

      <Card
        style={{
          background: "var(--theme-dashboard-card)",
          borderColor: "var(--theme-dashboard-card-border)",
        }}
      >
        <CardHeader className="pb-2">
          <CardTitle
            className="text-xs"
            style={{ color: "var(--theme-text-secondary)" }}
          >
            Total Play Time
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div
            className="text-2xl font-bold"
            style={{ color: "var(--theme-text-primary)" }}
          >
            {formatDuration(stats.totalTimePlayedMs)}
          </div>
          <p className="text-xs" style={{ color: "var(--theme-text-muted)" }}>
            Time at tables
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
