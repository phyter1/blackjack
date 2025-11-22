import type { GameSession } from "@/types/user";
import type { AdvantagePlayLevel } from "@/modules/strategy/ev-calculator";
import { calculateAdvantagePlayEV } from "@/modules/strategy/ev-calculator";
import type { EVDataPoint } from "./types";

/**
 * Transform sessions into EV/AV chart data (per-session)
 */
export function transformToEVData(sessions: GameSession[]): EVDataPoint[] {
  const sortedSessions = [...sessions].sort(
    (a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime(),
  );

  return sortedSessions
    .filter(
      (session) =>
        session.expectedValue !== undefined &&
        session.variance !== undefined &&
        session.totalWagered !== undefined,
    )
    .map((session, index) => ({
      sessionNumber: index + 1,
      date: new Date(session.startTime).toLocaleDateString(),
      expectedValue: session.expectedValue!,
      actualValue: session.netProfit,
      variance: session.variance!,
      totalWagered: session.totalWagered!,
    }));
}

/**
 * Transform sessions into cumulative EV/AV chart data
 */
export function transformToCumulativeEVData(
  sessions: GameSession[],
): EVDataPoint[] {
  const sortedSessions = [...sessions].sort(
    (a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime(),
  );

  let cumulativeEV = 0;
  let cumulativeAV = 0;
  let cumulativeWagered = 0;

  return sortedSessions
    .filter(
      (session) =>
        session.expectedValue !== undefined &&
        session.variance !== undefined &&
        session.totalWagered !== undefined,
    )
    .map((session, index) => {
      cumulativeEV += session.expectedValue!;
      cumulativeAV += session.netProfit;
      cumulativeWagered += session.totalWagered!;

      return {
        sessionNumber: index + 1,
        date: new Date(session.startTime).toLocaleDateString(),
        expectedValue: cumulativeEV,
        actualValue: cumulativeAV,
        variance: cumulativeAV - cumulativeEV,
        totalWagered: cumulativeWagered,
      };
    });
}

/**
 * Transform sessions into EV data with specific advantage play level
 */
export function transformToAdvantagePlayEVData(
  sessions: GameSession[],
  level: AdvantagePlayLevel,
  cumulative: boolean = false,
): EVDataPoint[] {
  const sortedSessions = [...sessions].sort(
    (a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime(),
  );

  let cumulativeEV = 0;
  let cumulativeAV = 0;
  let cumulativeWagered = 0;

  const dataPoints: EVDataPoint[] = [];

  for (let i = 0; i < sortedSessions.length; i++) {
    const session = sortedSessions[i];

    // Skip sessions without required data
    if (!session.totalWagered) continue;

    // Calculate EV for this session with the specified advantage play level
    const evCalc = calculateAdvantagePlayEV({
      totalWagered: session.totalWagered,
      actualValue: session.netProfit,
      level,
      strategyAccuracy: session.strategyAccuracy,
      decisionsData: session.decisionsData,
      averageBetSize:
        session.roundsPlayed > 0
          ? session.totalWagered / session.roundsPlayed
          : session.totalWagered / 100,
    });

    if (cumulative) {
      cumulativeEV += evCalc.expectedValue;
      cumulativeAV += session.netProfit;
      cumulativeWagered += session.totalWagered;

      dataPoints.push({
        sessionNumber: i + 1,
        date: new Date(session.startTime).toLocaleDateString(),
        expectedValue: cumulativeEV,
        actualValue: cumulativeAV,
        variance: cumulativeAV - cumulativeEV,
        totalWagered: cumulativeWagered,
      });
    } else {
      dataPoints.push({
        sessionNumber: i + 1,
        date: new Date(session.startTime).toLocaleDateString(),
        expectedValue: evCalc.expectedValue,
        actualValue: session.netProfit,
        variance: evCalc.variance,
        totalWagered: session.totalWagered,
      });
    }
  }

  return dataPoints;
}
