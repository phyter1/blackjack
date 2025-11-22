import type { GameSession } from "@/types/user";
import type { WinRateDataPoint } from "./types";

/**
 * Calculate win rate for a session
 * Win rate is calculated as: (ending balance - starting balance > 0) ? 1 : 0
 */
function calculateSessionWinRate(session: GameSession): number {
  return session.netProfit > 0 ? 100 : 0;
}

/**
 * Transform sessions into win rate chart data with moving average
 */
export function transformToWinRateData(
  sessions: GameSession[],
  movingAverageWindow: number = 5,
): WinRateDataPoint[] {
  const sortedSessions = [...sessions].sort(
    (a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime(),
  );

  return sortedSessions.map((session, index) => {
    const winRate = calculateSessionWinRate(session);

    // Calculate moving average
    const startIndex = Math.max(0, index - movingAverageWindow + 1);
    const windowSessions = sortedSessions.slice(startIndex, index + 1);
    const movingAvgWinRate =
      windowSessions.reduce((sum, s) => sum + calculateSessionWinRate(s), 0) /
      windowSessions.length;

    return {
      sessionNumber: index + 1,
      date: new Date(session.startTime).toLocaleDateString(),
      winRate,
      movingAvgWinRate,
    };
  });
}
