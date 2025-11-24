"use client";

import { useCountTrainerStore } from "@/stores/count-trainer";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Trophy,
  Target,
  TrendingUp,
  DollarSign,
  Flame,
  Award,
} from "lucide-react";

export function StatsPanel() {
  const stats = useCountTrainerStore((state) => state.stats);
  const practiceBalance = useCountTrainerStore(
    (state) => state.practiceBalance,
  );
  const mode = useCountTrainerStore((state) => state.mode);

  const getModeStats = () => {
    switch (mode) {
      case "beginner":
        return {
          attempts: stats.beginnerStats.attempts,
          correct: stats.beginnerStats.correct,
          accuracy: stats.beginnerStats.accuracy,
        };
      case "intermediate":
        return {
          attempts: stats.intermediateStats.attempts,
          correct: stats.intermediateStats.correct,
          accuracy: stats.intermediateStats.accuracy,
        };
      case "advanced":
        return {
          attempts: stats.advancedStats.attempts,
          correct: stats.advancedStats.correctRunning, // Use correctRunning as the main correct count
          accuracy: stats.advancedStats.accuracy,
        };
      default:
        return { attempts: 0, correct: 0, accuracy: 0 };
    }
  };

  const modeStats = getModeStats();
  const profitColor =
    stats.netProfit > 0
      ? "var(--theme-success)"
      : stats.netProfit < 0
        ? "var(--theme-error)"
        : "var(--theme-text-secondary)";

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
      {/* Practice Balance */}
      <div
        className="rounded-lg p-3"
        style={{
          backgroundColor: "var(--theme-dashboard-card)",
          border: "1px solid var(--theme-border)",
        }}
      >
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <DollarSign
              className="h-5 w-5"
              style={{ color: "var(--theme-primary)" }}
            />
            <span
              className="text-sm font-medium"
              style={{ color: "var(--theme-text-secondary)" }}
            >
              Practice Balance
            </span>
          </div>
        </div>
        <div
          className="text-xl font-bold"
          style={{ color: "var(--theme-primary)" }}
        >
          ${practiceBalance.toLocaleString()}
        </div>
        <div className="mt-0.5" style={{ color: profitColor }}>
          <span className="text-xs">
            Net: {stats.netProfit >= 0 ? "+" : ""}$
            {stats.netProfit.toLocaleString()}
          </span>
        </div>
      </div>

      {/* Overall Accuracy */}
      <div
        className="rounded-lg p-3"
        style={{
          backgroundColor: "var(--theme-dashboard-card)",
          border: "1px solid var(--theme-border)",
        }}
      >
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Target
              className="h-5 w-5"
              style={{ color: "var(--theme-primary)" }}
            />
            <span
              className="text-sm font-medium"
              style={{ color: "var(--theme-text-secondary)" }}
            >
              Overall Accuracy
            </span>
          </div>
          <Badge
            style={{
              backgroundColor:
                stats.accuracy >= 90
                  ? "var(--theme-success)"
                  : stats.accuracy >= 75
                    ? "var(--theme-warning)"
                    : "var(--theme-error)",
              color: "white",
            }}
          >
            {stats.accuracy >= 90
              ? "Expert"
              : stats.accuracy >= 75
                ? "Good"
                : "Learning"}
          </Badge>
        </div>
        <div
          className="text-xl font-bold"
          style={{ color: "var(--theme-primary)" }}
        >
          {stats.accuracy.toFixed(1)}%
        </div>
        <Progress
          value={stats.accuracy}
          className="mt-1"
          style={{
            backgroundColor: "var(--theme-dashboard-bg)",
          }}
        />
        <div
          className="text-xs mt-1"
          style={{ color: "var(--theme-text-muted)" }}
        >
          {stats.correctChallenges} / {stats.totalChallenges} correct
        </div>
      </div>

      {/* Current Streak */}
      <div
        className="rounded-lg p-3"
        style={{
          backgroundColor: "var(--theme-dashboard-card)",
          border: "1px solid var(--theme-border)",
        }}
      >
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Flame
              className="h-5 w-5"
              style={{
                color:
                  stats.currentStreak >= 5
                    ? "var(--theme-warning)"
                    : "var(--theme-primary)",
              }}
            />
            <span
              className="text-sm font-medium"
              style={{ color: "var(--theme-text-secondary)" }}
            >
              Current Streak
            </span>
          </div>
        </div>
        <div
          className="text-xl font-bold"
          style={{ color: "var(--theme-primary)" }}
        >
          {stats.currentStreak}
        </div>
        <div
          className="text-xs mt-1"
          style={{ color: "var(--theme-text-muted)" }}
        >
          Best: {stats.bestStreak}
        </div>
      </div>

      {/* Mode-Specific Stats */}
      <div
        className="rounded-lg p-3"
        style={{
          backgroundColor: "var(--theme-dashboard-card)",
          border: "1px solid var(--theme-border)",
        }}
      >
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Trophy
              className="h-5 w-5"
              style={{ color: "var(--theme-primary)" }}
            />
            <span
              className="text-sm font-medium"
              style={{ color: "var(--theme-text-secondary)" }}
            >
              {mode === "beginner"
                ? "Beginner"
                : mode === "intermediate"
                  ? "Intermediate"
                  : "Advanced"}{" "}
              Mode
            </span>
          </div>
        </div>
        <div
          className="text-xl font-bold"
          style={{ color: "var(--theme-primary)" }}
        >
          {modeStats.accuracy.toFixed(1)}%
        </div>
        <div
          className="text-xs mt-1"
          style={{ color: "var(--theme-text-muted)" }}
        >
          {modeStats.correct} / {modeStats.attempts} attempts
        </div>
      </div>

      {/* Earnings */}
      <div
        className="rounded-lg p-3"
        style={{
          backgroundColor: "var(--theme-dashboard-card)",
          border: "1px solid var(--theme-border)",
        }}
      >
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <TrendingUp
              className="h-5 w-5"
              style={{ color: "var(--theme-success)" }}
            />
            <span
              className="text-sm font-medium"
              style={{ color: "var(--theme-text-secondary)" }}
            >
              Total Earnings
            </span>
          </div>
        </div>
        <div
          className="text-xl font-bold"
          style={{ color: "var(--theme-success)" }}
        >
          ${stats.totalEarnings.toLocaleString()}
        </div>
        <div
          className="text-xs mt-1"
          style={{ color: "var(--theme-text-muted)" }}
        >
          Losses: ${stats.totalLosses.toLocaleString()}
        </div>
      </div>

      {/* Achievement Status */}
      <div
        className="rounded-lg p-3"
        style={{
          backgroundColor: "var(--theme-dashboard-card)",
          border: "1px solid var(--theme-border)",
        }}
      >
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Award
              className="h-5 w-5"
              style={{ color: "var(--theme-primary)" }}
            />
            <span
              className="text-sm font-medium"
              style={{ color: "var(--theme-text-secondary)" }}
            >
              Achievements
            </span>
          </div>
        </div>
        <div className="space-y-1">
          {stats.bestStreak >= 10 && (
            <Badge
              variant="outline"
              style={{
                borderColor: "var(--theme-warning)",
                color: "var(--theme-warning)",
              }}
            >
              Hot Streak (10+)
            </Badge>
          )}
          {stats.accuracy >= 90 && stats.totalChallenges >= 20 && (
            <Badge
              variant="outline"
              style={{
                borderColor: "var(--theme-success)",
                color: "var(--theme-success)",
              }}
            >
              Master Counter
            </Badge>
          )}
          {stats.totalChallenges >= 100 && (
            <Badge
              variant="outline"
              style={{
                borderColor: "var(--theme-primary)",
                color: "var(--theme-primary)",
              }}
            >
              Dedicated
            </Badge>
          )}
          {stats.netProfit >= 5000 && (
            <Badge
              variant="outline"
              style={{
                borderColor: "var(--theme-success)",
                color: "var(--theme-success)",
              }}
            >
              Big Winner
            </Badge>
          )}
          {stats.totalChallenges === 0 && (
            <span
              className="text-sm"
              style={{ color: "var(--theme-text-muted)" }}
            >
              Start practicing to earn achievements!
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
