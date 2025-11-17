import { getAuditLogger } from "../audit/logger";
import type { BankCreditEvent, BankDebitEvent } from "../audit/types";

interface Transaction {
  amount: number;
  type: "debit" | "credit";
  date: string;
  outcome: "success" | "failure";
  to?: string;
  from?: string;
}

export class Bank {
  private txs: Transaction[] = [];
  private total: number;
  protected skipAuditLog = false; // Flag for subclasses to control logging

  constructor(private userId: string, initialAmount: number) {
    this.total = initialAmount;
  }

  get balance() {
    return this.total;
  }

  get id() {
    return this.userId;
  }

  debit(amount: number, to?: string) {
    const balanceBefore = this.total;

    if (amount > this.total) {
      this.txs.push({
        amount,
        type: "debit",
        date: new Date().toUTCString(),
        outcome: "failure",
        to,
        from: this.userId,
      });
      throw new Error("Insufficient funds");
    }

    this.total -= amount;
    this.txs.push({
      amount,
      type: "debit",
      date: new Date().toUTCString(),
      outcome: "success",
      to,
      from: this.userId,
    });

    // Audit log (unless skipped by subclass)
    if (!this.skipAuditLog) {
      getAuditLogger().log<BankDebitEvent>("bank_debit", {
        bankId: this.userId,
        amount,
        reason: to ?? "unknown",
        balanceBefore,
        balanceAfter: this.total,
      });
    }
  }

  credit(amount: number, from?: string) {
    const balanceBefore = this.total;

    this.txs.push({
      amount,
      type: "credit",
      date: new Date().toUTCString(),
      outcome: "success",
      from,
      to: this.userId,
    });
    this.total += amount;

    // Audit log (unless skipped by subclass)
    if (!this.skipAuditLog) {
      getAuditLogger().log<BankCreditEvent>("bank_credit", {
        bankId: this.userId,
        amount,
        reason: from ?? "unknown",
        balanceBefore,
        balanceAfter: this.total,
      });
    }
  }

  get transactions() {
    return this.txs;
  }
}

export class Escrow extends Bank {
  owner: "user" | "house" | "hand" = "hand";
  private escrowId: string;

  constructor(userId: string, handId: string) {
    super(`${userId}-${handId}-escrow`, 0);
    this.escrowId = `${userId}-${handId}-escrow`;
    this.skipAuditLog = true; // Escrow uses its own event types
  }

  get id() {
    return this.escrowId;
  }

  credit(amount: number, from?: string) {
    const balanceBefore = this.balance;
    super.credit(amount, from);

    // Log escrow-specific event
    getAuditLogger().log("escrow_credit", <any>{
      escrowId: this.escrowId,
      fromId: from ?? "unknown",
      amount,
      balanceBefore,
      balanceAfter: this.balance,
    });
  }

  debit(amount: number, to?: string) {
    const balanceBefore = this.balance;
    super.debit(amount, to);

    // Log escrow-specific event
    getAuditLogger().log("escrow_debit", <any>{
      escrowId: this.escrowId,
      toId: to ?? "unknown",
      amount,
      balanceBefore,
      balanceAfter: this.balance,
    });
  }

  releaseToOwner(newOwner: "user" | "house") {
    const amount = this.balance;
    this.debit(amount);
    this.owner = newOwner;
    return amount;
  }
}

export class House extends Bank {
  profitLoss: number = 0;
  constructor(initialAmount: number) {
    super("house", initialAmount);
  }
}
