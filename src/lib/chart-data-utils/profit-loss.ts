import type { GameSession } from "@/types/user";
import type { ProfitLossDataPoint } from "./types";

/**
 * Transform sessions into profit/loss chart data
 */
export function transformToProfitLossData(
  sessions: GameSession[],
): ProfitLossDataPoint[] {
  const sortedSessions = [...sessions].sort(
    (a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime(),
  );

  let cumulativeProfit = 0;

  return sortedSessions.map((session, index) => {
    cumulativeProfit += session.netProfit;
    return {
      sessionNumber: index + 1,
      date: new Date(session.startTime).toLocaleDateString(),
      profit: session.netProfit,
      cumulativeProfit,
      sessionId: session.id,
    };
  });
}
