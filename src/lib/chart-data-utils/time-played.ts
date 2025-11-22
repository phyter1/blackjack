import type { GameSession } from "@/types/user";
import type { TimePlayedDataPoint } from "./types";

/**
 * Transform sessions into time played chart data
 */
export function transformToTimePlayedData(
  sessions: GameSession[],
): TimePlayedDataPoint[] {
  const sortedSessions = [...sessions].sort(
    (a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime(),
  );

  let cumulativeTime = 0;

  return sortedSessions.map((session, index) => {
    const sessionDuration = session.endTime
      ? (new Date(session.endTime).getTime() -
          new Date(session.startTime).getTime()) /
        (1000 * 60) // Convert to minutes
      : 0;

    cumulativeTime += sessionDuration;

    return {
      sessionNumber: index + 1,
      date: new Date(session.startTime).toLocaleDateString(),
      sessionDuration,
      cumulativeTime,
    };
  });
}
