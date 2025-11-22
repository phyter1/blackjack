import type { GameSession } from "@/types/user";
import type { BetSizeDataPoint } from "./types";

/**
 * Transform sessions into average bet size over time
 */
export function transformToBetSizeData(
  sessions: GameSession[],
): BetSizeDataPoint[] {
  const sortedSessions = [...sessions].sort(
    (a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime(),
  );

  return sortedSessions
    .filter(
      (session) =>
        session.totalWagered !== undefined && session.roundsPlayed > 0,
    )
    .map((session, index) => ({
      sessionNumber: index + 1,
      date: new Date(session.startTime).toLocaleDateString(),
      avgBetSize: session.totalWagered! / session.roundsPlayed,
      totalWagered: session.totalWagered!,
    }));
}
