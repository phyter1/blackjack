import type { Card } from "@/modules/game/cards";
import type { PlayerDecision } from "@/modules/strategy/decision-tracker";
import type { AdvantagePlayLevel } from "@/modules/strategy/ev-calculator";
import { calculateAdvantagePlayEV } from "@/modules/strategy/ev-calculator";
import type { GameSession } from "@/types/user";

type Rank = Card["rank"];

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

// ============================================================================
// ADVANCED ANALYTICS
// ============================================================================

/**
 * Bet size data point
 */
export interface BetSizeDataPoint {
  sessionNumber: number;
  date: string;
  avgBetSize: number;
  totalWagered: number;
}

/**
 * Win/Loss streak information
 */
export interface StreakData {
  currentStreak: number; // Positive = wins, negative = losses, 0 = no data
  currentStreakType: "win" | "loss" | "none";
  longestWinStreak: number;
  longestLossStreak: number;
  streakHistory: StreakDataPoint[];
}

export interface StreakDataPoint {
  sessionNumber: number;
  date: string;
  streak: number; // Positive = win streak, negative = loss streak
  streakType: "win" | "loss";
}

/**
 * Dealer upcard performance
 */
export interface DealerUpcardStats {
  upcard: Rank;
  totalHands: number;
  wins: number;
  losses: number;
  pushes: number;
  winRate: number; // Percentage
  totalProfit: number;
  avgProfit: number;
}

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

/**
 * Analyze performance against different dealer upcards
 */
export function analyzeDealerUpcards(
  sessions: GameSession[],
): DealerUpcardStats[] {
  // Aggregate all decisions from all sessions
  const allDecisions: PlayerDecision[] = [];

  for (const session of sessions) {
    if (session.decisionsData) {
      try {
        const decisions: PlayerDecision[] = JSON.parse(session.decisionsData);
        allDecisions.push(...decisions);
      } catch (e) {
        // Skip sessions with invalid JSON
        console.warn(`Failed to parse decisions for session ${session.id}`, e);
      }
    }
  }

  if (allDecisions.length === 0) {
    return [];
  }

  // Group decisions by dealer upcard
  const byUpcard = new Map<Rank, PlayerDecision[]>();

  for (const decision of allDecisions) {
    const upcard = decision.dealerUpCard.rank;
    if (!byUpcard.has(upcard)) {
      byUpcard.set(upcard, []);
    }
    byUpcard.get(upcard)?.push(decision);
  }

  // Calculate stats for each upcard
  const stats: DealerUpcardStats[] = [];

  for (const [upcard, decisions] of byUpcard.entries()) {
    // Only count decisions where we have outcome data (one decision per hand)
    const decisionsWithOutcome = decisions.filter(
      (d) => d.outcome !== undefined,
    );

    if (decisionsWithOutcome.length === 0) {
      continue;
    }

    // Group by handId to count unique hands (not individual decisions)
    const handIds = new Set(decisionsWithOutcome.map((d) => d.handId));
    const uniqueHands = Array.from(handIds).map((handId) => {
      // Get the last decision for this hand (which has the outcome)
      const handDecisions = decisionsWithOutcome.filter(
        (d) => d.handId === handId,
      );
      return handDecisions[handDecisions.length - 1];
    });

    const totalHands = uniqueHands.length;
    const wins = uniqueHands.filter(
      (d) =>
        d.outcome === "win" ||
        d.outcome === "blackjack" ||
        d.outcome === "charlie",
    ).length;
    const losses = uniqueHands.filter(
      (d) => d.outcome === "lose" || (d.profit && d.profit < 0),
    ).length;
    const pushes = uniqueHands.filter((d) => d.outcome === "push").length;
    const totalProfit = uniqueHands.reduce(
      (sum, d) => sum + (d.profit || 0),
      0,
    );

    stats.push({
      upcard,
      totalHands,
      wins,
      losses,
      pushes,
      winRate: totalHands > 0 ? (wins / totalHands) * 100 : 0,
      totalProfit,
      avgProfit: totalHands > 0 ? totalProfit / totalHands : 0,
    });
  }

  // Sort by card rank order (2-10, J, Q, K, A)
  const rankOrder: Record<Rank, number> = {
    "2": 2,
    "3": 3,
    "4": 4,
    "5": 5,
    "6": 6,
    "7": 7,
    "8": 8,
    "9": 9,
    "10": 10,
    J: 11,
    Q: 12,
    K: 13,
    A: 14,
  };

  stats.sort((a, b) => rankOrder[a.upcard] - rankOrder[b.upcard]);

  return stats;
}
