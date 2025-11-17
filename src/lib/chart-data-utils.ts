import type { GameSession } from "@/types/user";

export interface ProfitLossDataPoint {
  sessionNumber: number;
  date: string;
  profit: number;
  cumulativeProfit: number;
  sessionId: string;
}

export interface WinRateDataPoint {
  sessionNumber: number;
  date: string;
  winRate: number;
  movingAvgWinRate: number;
}

export interface EVDataPoint {
  sessionNumber: number;
  date: string;
  expectedValue: number;
  actualValue: number;
  variance: number;
  totalWagered: number;
}

export interface TimePlayedDataPoint {
  sessionNumber: number;
  date: string;
  sessionDuration: number;
  cumulativeTime: number;
}

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

/**
 * Transform sessions into EV/AV chart data
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

/**
 * Format duration in milliseconds to human-readable string
 */
export function formatDuration(ms: number): string {
  const hours = Math.floor(ms / (1000 * 60 * 60));
  const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
}

/**
 * Format currency value
 */
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(value);
}
