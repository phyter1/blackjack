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

export interface TableRules {
  deckCount: number;
  dealerStand: "s17" | "h17";
  blackjackPayout: "3:2" | "6:5";
  doubleAfterSplit: boolean;
  surrender: "none" | "late" | "early";
  doubleRestriction: "any" | "9-11" | "10-11" | "11";
  resplitAces: boolean;
  hitSplitAces: boolean;
  maxSplits: number;
  maxPlayableHands?: number; // 1-5, defaults to 5
  houseEdge?: number;
}

export interface GameSession {
  id: string;
  userId: string;
  startTime: string;
  endTime?: string;
  startingBalance: number;
  endingBalance: number;
  roundsPlayed: number;
  netProfit: number; // endingBalance - startingBalance (Actual Value)
  auditTrailId?: string;
  strategyGrade?: string; // A+, A, A-, B+, etc.
  strategyAccuracy?: number; // Percentage 0-100
  totalDecisions?: number;
  correctDecisions?: number;
  decisionsData?: string; // JSON serialized PlayerDecision[] for replay
  hasCountData?: boolean; // Whether this session tracked card counting
  totalWagered?: number; // Sum of all bets placed during session
  expectedValue?: number; // EV based on house edge and strategy
  variance?: number; // netProfit - expectedValue (luck factor)
  rules?: TableRules; // Table rules used for this session
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

/**
 * User's card counting proficiency and progress
 */
export interface CountingProgress {
  userId: string;
  proficiencyLevel: "beginner" | "running_count" | "true_count";
  totalCountGuesses: number;
  runningCountAccuracy: number;
  trueCountAccuracy: number;
  overallAccuracy: number;
  lastUpdated: string;
}
