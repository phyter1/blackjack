"use client";

import type {
  UserProfile,
  UserBank,
  GameSession,
  Transaction,
} from "@/types/user";

const STORAGE_KEYS = {
  USERS: "blackjack_users",
  BANKS: "blackjack_banks",
  SESSIONS: "blackjack_sessions",
  TRANSACTIONS: "blackjack_transactions",
  CURRENT_USER: "blackjack_current_user",
} as const;

// Helper to check if we're in browser
const isBrowser = typeof window !== "undefined";

// Generic storage operations
class Storage {
  static get<T>(key: string): T | null {
    if (!isBrowser) return null;
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch (error) {
      console.error(`Error reading from localStorage: ${key}`, error);
      return null;
    }
  }

  static set<T>(key: string, value: T): void {
    if (!isBrowser) return;
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(`Error writing to localStorage: ${key}`, error);
    }
  }

  static remove(key: string): void {
    if (!isBrowser) return;
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error(`Error removing from localStorage: ${key}`, error);
    }
  }

  static clear(): void {
    if (!isBrowser) return;
    try {
      // Only clear blackjack-related keys
      Object.values(STORAGE_KEYS).forEach((key) => {
        localStorage.removeItem(key);
      });
    } catch (error) {
      console.error("Error clearing localStorage", error);
    }
  }
}

// User storage
export class UserStorage {
  static getAll(): UserProfile[] {
    return Storage.get<UserProfile[]>(STORAGE_KEYS.USERS) || [];
  }

  static getById(id: string): UserProfile | null {
    const users = this.getAll();
    return users.find((u) => u.id === id) || null;
  }

  static getByName(name: string): UserProfile | null {
    const users = this.getAll();
    return users.find((u) => u.name.toLowerCase() === name.toLowerCase()) || null;
  }

  static save(user: UserProfile): void {
    const users = this.getAll();
    const index = users.findIndex((u) => u.id === user.id);
    if (index >= 0) {
      users[index] = user;
    } else {
      users.push(user);
    }
    Storage.set(STORAGE_KEYS.USERS, users);
  }

  static delete(id: string): void {
    const users = this.getAll().filter((u) => u.id !== id);
    Storage.set(STORAGE_KEYS.USERS, users);
  }

  static getCurrentUser(): UserProfile | null {
    const userId = Storage.get<string>(STORAGE_KEYS.CURRENT_USER);
    return userId ? this.getById(userId) : null;
  }

  static setCurrentUser(userId: string | null): void {
    if (userId) {
      Storage.set(STORAGE_KEYS.CURRENT_USER, userId);
    } else {
      Storage.remove(STORAGE_KEYS.CURRENT_USER);
    }
  }
}

// Bank storage
export class BankStorage {
  static getAll(): UserBank[] {
    return Storage.get<UserBank[]>(STORAGE_KEYS.BANKS) || [];
  }

  static getByUserId(userId: string): UserBank | null {
    const banks = this.getAll();
    return banks.find((b) => b.userId === userId) || null;
  }

  static save(bank: UserBank): void {
    const banks = this.getAll();
    const index = banks.findIndex((b) => b.userId === bank.userId);
    if (index >= 0) {
      banks[index] = bank;
    } else {
      banks.push(bank);
    }
    Storage.set(STORAGE_KEYS.BANKS, banks);
  }

  static delete(userId: string): void {
    const banks = this.getAll().filter((b) => b.userId !== userId);
    Storage.set(STORAGE_KEYS.BANKS, banks);
  }
}

// Session storage
export class SessionStorage {
  static getAll(): GameSession[] {
    return Storage.get<GameSession[]>(STORAGE_KEYS.SESSIONS) || [];
  }

  static getByUserId(userId: string): GameSession[] {
    const sessions = this.getAll();
    return sessions.filter((s) => s.userId === userId);
  }

  static getById(id: string): GameSession | null {
    const sessions = this.getAll();
    return sessions.find((s) => s.id === id) || null;
  }

  static save(session: GameSession): void {
    const sessions = this.getAll();
    const index = sessions.findIndex((s) => s.id === session.id);
    if (index >= 0) {
      sessions[index] = session;
    } else {
      sessions.push(session);
    }
    Storage.set(STORAGE_KEYS.SESSIONS, sessions);
  }

  static delete(id: string): void {
    const sessions = this.getAll().filter((s) => s.id !== id);
    Storage.set(STORAGE_KEYS.SESSIONS, sessions);
  }
}

// Transaction storage
export class TransactionStorage {
  static getAll(): Transaction[] {
    return Storage.get<Transaction[]>(STORAGE_KEYS.TRANSACTIONS) || [];
  }

  static getByUserId(userId: string): Transaction[] {
    const transactions = this.getAll();
    return transactions.filter((t) => t.userId === userId);
  }

  static save(transaction: Transaction): void {
    const transactions = this.getAll();
    transactions.push(transaction);
    Storage.set(STORAGE_KEYS.TRANSACTIONS, transactions);
  }

  static delete(id: string): void {
    const transactions = this.getAll().filter((t) => t.id !== id);
    Storage.set(STORAGE_KEYS.TRANSACTIONS, transactions);
  }
}

// Export for clearing all data
export const clearAllData = () => Storage.clear();
