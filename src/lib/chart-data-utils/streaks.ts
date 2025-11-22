import type { GameSession } from "@/types/user";
import type { StreakData, StreakDataPoint } from "./types";

/**
 * Analyze win/loss streaks across all sessions
 */
export function analyzeStreaks(sessions: GameSession[]): StreakData {
  const sortedSessions = [...sessions].sort(
    (a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime(),
  );

  if (sortedSessions.length === 0) {
    return {
      currentStreak: 0,
      currentStreakType: "none",
      longestWinStreak: 0,
      longestLossStreak: 0,
      streakHistory: [],
    };
  }

  let currentStreak = 0;
  let currentStreakType: "win" | "loss" | "none" = "none";
  let longestWinStreak = 0;
  let longestLossStreak = 0;
  const streakHistory: StreakDataPoint[] = [];

  let tempWinStreak = 0;
  let tempLossStreak = 0;

  for (let i = 0; i < sortedSessions.length; i++) {
    const session = sortedSessions[i];
    const isWin = session.netProfit > 0;

    if (isWin) {
      tempWinStreak++;
      tempLossStreak = 0;
      currentStreakType = "win";
    } else {
      tempLossStreak++;
      tempWinStreak = 0;
      currentStreakType = "loss";
    }

    // Update longest streaks
    longestWinStreak = Math.max(longestWinStreak, tempWinStreak);
    longestLossStreak = Math.max(longestLossStreak, tempLossStreak);

    // Record this point in history
    streakHistory.push({
      sessionNumber: i + 1,
      date: new Date(session.startTime).toLocaleDateString(),
      streak: isWin ? tempWinStreak : -tempLossStreak,
      streakType: isWin ? "win" : "loss",
    });
  }

  // Current streak is the last one
  currentStreak = currentStreakType === "win" ? tempWinStreak : -tempLossStreak;

  return {
    currentStreak,
    currentStreakType,
    longestWinStreak,
    longestLossStreak,
    streakHistory,
  };
}
