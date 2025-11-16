export interface UserProfile {
  id: string;
  name: string;
  email?: string;
  createdAt: string;
  lastPlayed: string;
}

export interface UserBank {
  userId: string;
  balance: number;
  totalDeposited: number;
  totalWithdrawn: number;
  lifetimeProfit: number; // Positive = net winnings, Negative = net losses
  lastUpdated: string;
}

export interface GameSession {
  id: string;
  userId: string;
  startTime: string;
  endTime?: string;
  startingBalance: number;
  endingBalance: number;
  roundsPlayed: number;
  netProfit: number; // endingBalance - startingBalance
  auditTrailId?: string;
  strategyGrade?: string; // A+, A, A-, B+, etc.
  strategyAccuracy?: number; // Percentage 0-100
  totalDecisions?: number;
  correctDecisions?: number;
}

export interface Transaction {
  id: string;
  userId: string;
  type: "deposit" | "withdrawal" | "game_win" | "game_loss";
  amount: number;
  timestamp: string;
  sessionId?: string;
  description: string;
}

export interface UserStats {
  totalRoundsPlayed: number;
  totalSessionsPlayed: number;
  winRate: number; // Percentage
  biggestWin: number;
  biggestLoss: number;
  averageSessionProfit: number;
  totalTimePlayedMs: number;
}
