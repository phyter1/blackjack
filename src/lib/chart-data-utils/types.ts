import type { Card } from "@/modules/game/cards";

type Rank = Card["rank"];

/**
 * Profit/Loss data point
 */
export interface ProfitLossDataPoint {
  sessionNumber: number;
  date: string;
  profit: number;
  cumulativeProfit: number;
  sessionId: string;
}

/**
 * Win rate data point
 */
export interface WinRateDataPoint {
  sessionNumber: number;
  date: string;
  winRate: number;
  movingAvgWinRate: number;
}

/**
 * Expected Value data point
 */
export interface EVDataPoint {
  sessionNumber: number;
  date: string;
  expectedValue: number;
  actualValue: number;
  variance: number;
  totalWagered: number;
}

/**
 * Time played data point
 */
export interface TimePlayedDataPoint {
  sessionNumber: number;
  date: string;
  sessionDuration: number;
  cumulativeTime: number;
}

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
