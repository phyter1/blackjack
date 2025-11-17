"use client";

import type {
  UserProfile,
  UserBank,
  GameSession,
  Transaction,
  UserStats,
} from "@/types/user";
import {
  UserStorage,
  BankStorage,
  SessionStorage,
  TransactionStorage,
} from "@/lib/storage";
import { calculateSessionEV } from "@/modules/strategy/ev-calculator";

export class UserService {
  /**
   * Create a new user with initial bank balance
   */
  static createUser(
    name: string,
    initialBalance: number = 1000,
  ): {
    user: UserProfile;
    bank: UserBank;
  } {
    // Check if user already exists
    const existing = UserStorage.getByName(name);
    if (existing) {
      throw new Error(`User with name "${name}" already exists`);
    }

    const now = new Date().toISOString();
    const user: UserProfile = {
      id: `user-${crypto.randomUUID()}`,
      name,
      createdAt: now,
      lastPlayed: now,
    };

    const bank: UserBank = {
      userId: user.id,
      balance: initialBalance,
      totalDeposited: initialBalance,
      totalWithdrawn: 0,
      lifetimeProfit: 0,
      lastUpdated: now,
    };

    UserStorage.save(user);
    BankStorage.save(bank);

    // Log initial deposit
    this.addTransaction({
      userId: user.id,
      type: "deposit",
      amount: initialBalance,
      description: "Initial deposit",
    });

    return { user, bank };
  }

  /**
   * Login - get existing user or return null
   */
  static login(name: string): {
    user: UserProfile;
    bank: UserBank;
  } | null {
    const user = UserStorage.getByName(name);
    if (!user) {
      return null;
    }

    const bank = BankStorage.getByUserId(user.id);
    if (!bank) {
      return null;
    }

    // Update last played
    user.lastPlayed = new Date().toISOString();
    UserStorage.save(user);

    // Set as current user
    UserStorage.setCurrentUser(user.id);

    return { user, bank };
  }

  /**
   * Get current logged-in user
   */
  static getCurrentUser(): {
    user: UserProfile;
    bank: UserBank;
  } | null {
    const user = UserStorage.getCurrentUser();
    if (!user) {
      return null;
    }

    const bank = BankStorage.getByUserId(user.id);
    if (!bank) {
      return null;
    }

    return { user, bank };
  }

  /**
   * Logout current user
   */
  static logout(): void {
    UserStorage.setCurrentUser(null);
  }

  /**
   * Deposit money into user's bank
   */
  static deposit(userId: string, amount: number): UserBank {
    if (amount <= 0) {
      throw new Error("Deposit amount must be positive");
    }

    const bank = BankStorage.getByUserId(userId);
    if (!bank) {
      throw new Error("User bank not found");
    }

    bank.balance += amount;
    bank.totalDeposited += amount;
    bank.lastUpdated = new Date().toISOString();

    BankStorage.save(bank);

    this.addTransaction({
      userId,
      type: "deposit",
      amount,
      description: `Deposit of $${amount.toFixed(2)}`,
    });

    return bank;
  }

  /**
   * Withdraw money from user's bank
   */
  static withdraw(userId: string, amount: number): UserBank {
    if (amount <= 0) {
      throw new Error("Withdrawal amount must be positive");
    }

    const bank = BankStorage.getByUserId(userId);
    if (!bank) {
      throw new Error("User bank not found");
    }

    if (bank.balance < amount) {
      throw new Error(
        `Insufficient funds. Balance: $${bank.balance.toFixed(2)}, Requested: $${amount.toFixed(2)}`,
      );
    }

    bank.balance -= amount;
    bank.totalWithdrawn += amount;
    bank.lastUpdated = new Date().toISOString();

    BankStorage.save(bank);

    this.addTransaction({
      userId,
      type: "withdrawal",
      amount,
      description: `Withdrawal of $${amount.toFixed(2)}`,
    });

    return bank;
  }

  /**
   * Start a new game session
   */
  static startSession(
    userId: string,
    rules?: import("@/types/user").TableRules,
  ): GameSession {
    const bank = BankStorage.getByUserId(userId);
    if (!bank) {
      throw new Error("User bank not found");
    }

    const session: GameSession = {
      id: `session-${crypto.randomUUID()}`,
      userId,
      startTime: new Date().toISOString(),
      startingBalance: bank.balance,
      endingBalance: bank.balance,
      roundsPlayed: 0,
      netProfit: 0,
      rules,
    };

    SessionStorage.save(session);
    return session;
  }

  /**
   * End a game session and update stats
   */
  static endSession(
    sessionId: string,
    roundsPlayed: number,
    endingBalance: number,
    auditTrailId?: string,
    strategyAnalysis?: {
      grade: string;
      accuracy: number;
      totalDecisions: number;
      correctDecisions: number;
      decisions: unknown[]; // PlayerDecision[] but avoiding circular import
      hasCountData: boolean;
    } | null,
    totalWagered?: number,
  ): GameSession {
    const session = SessionStorage.getById(sessionId);
    if (!session) {
      throw new Error("Session not found");
    }

    const netProfit = endingBalance - session.startingBalance;

    session.endTime = new Date().toISOString();
    session.endingBalance = endingBalance;
    session.roundsPlayed = roundsPlayed;
    session.netProfit = netProfit;
    session.auditTrailId = auditTrailId;

    // Add strategy analysis if provided
    if (strategyAnalysis) {
      session.strategyGrade = strategyAnalysis.grade;
      session.strategyAccuracy = strategyAnalysis.accuracy;
      session.totalDecisions = strategyAnalysis.totalDecisions;
      session.correctDecisions = strategyAnalysis.correctDecisions;
      session.hasCountData = strategyAnalysis.hasCountData;

      // Serialize decision data for replay
      session.decisionsData = JSON.stringify(strategyAnalysis.decisions);
    }

    // Calculate EV if total wagered is provided
    if (totalWagered !== undefined && totalWagered > 0) {
      const evCalc = calculateSessionEV({
        totalWagered,
        actualValue: netProfit,
        strategyAccuracy: strategyAnalysis?.accuracy,
        decisionsData: session.decisionsData,
      });

      session.totalWagered = totalWagered;
      session.expectedValue = evCalc.expectedValue;
      session.variance = evCalc.variance;
    }

    SessionStorage.save(session);

    // Update bank lifetime profit
    const bank = BankStorage.getByUserId(session.userId);
    if (bank) {
      bank.lifetimeProfit += netProfit;
      bank.balance = endingBalance;
      bank.lastUpdated = new Date().toISOString();
      BankStorage.save(bank);
    }

    // Log transaction
    if (netProfit !== 0) {
      this.addTransaction({
        userId: session.userId,
        type: netProfit > 0 ? "game_win" : "game_loss",
        amount: Math.abs(netProfit),
        description:
          netProfit > 0
            ? `Won $${netProfit.toFixed(2)} in session`
            : `Lost $${Math.abs(netProfit).toFixed(2)} in session`,
        sessionId,
      });
    }

    return session;
  }

  /**
   * Get user statistics
   */
  static getUserStats(userId: string): UserStats {
    const sessions = SessionStorage.getByUserId(userId);
    const completedSessions = sessions.filter((s) => s.endTime);

    const totalRoundsPlayed = completedSessions.reduce(
      (sum, s) => sum + s.roundsPlayed,
      0,
    );
    const totalSessionsPlayed = completedSessions.length;

    const wins = completedSessions.filter((s) => s.netProfit > 0).length;
    const winRate =
      totalSessionsPlayed > 0 ? (wins / totalSessionsPlayed) * 100 : 0;

    const biggestWin = Math.max(
      ...completedSessions.map((s) => s.netProfit),
      0,
    );
    const biggestLoss = Math.min(
      ...completedSessions.map((s) => s.netProfit),
      0,
    );

    const totalProfit = completedSessions.reduce(
      (sum, s) => sum + s.netProfit,
      0,
    );
    const averageSessionProfit =
      totalSessionsPlayed > 0 ? totalProfit / totalSessionsPlayed : 0;

    const totalTimePlayedMs = completedSessions.reduce((sum, s) => {
      if (s.endTime) {
        return (
          sum +
          (new Date(s.endTime).getTime() - new Date(s.startTime).getTime())
        );
      }
      return sum;
    }, 0);

    return {
      totalRoundsPlayed,
      totalSessionsPlayed,
      winRate,
      biggestWin,
      biggestLoss,
      averageSessionProfit,
      totalTimePlayedMs,
    };
  }

  /**
   * Get user transaction history
   */
  static getTransactions(userId: string): Transaction[] {
    return TransactionStorage.getByUserId(userId).sort(
      (a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
    );
  }

  /**
   * Get user session history
   */
  static getSessions(userId: string): GameSession[] {
    return SessionStorage.getByUserId(userId).sort(
      (a, b) =>
        new Date(b.startTime).getTime() - new Date(a.startTime).getTime(),
    );
  }

  /**
   * Delete user and all associated data
   */
  static deleteUser(userId: string): void {
    UserStorage.delete(userId);
    BankStorage.delete(userId);

    // Delete sessions
    const sessions = SessionStorage.getByUserId(userId);
    sessions.forEach((s) => SessionStorage.delete(s.id));

    // Delete transactions
    const transactions = TransactionStorage.getByUserId(userId);
    transactions.forEach((t) => TransactionStorage.delete(t.id));

    // Logout if current user
    const current = UserStorage.getCurrentUser();
    if (current?.id === userId) {
      UserStorage.setCurrentUser(null);
    }
  }

  /**
   * Helper to add a transaction
   */
  private static addTransaction(data: {
    userId: string;
    type: Transaction["type"];
    amount: number;
    description: string;
    sessionId?: string;
  }): void {
    const transaction: Transaction = {
      id: `tx-${crypto.randomUUID()}`,
      timestamp: new Date().toISOString(),
      ...data,
    };

    TransactionStorage.save(transaction);
  }
}
