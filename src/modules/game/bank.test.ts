import { beforeEach, describe, expect, test } from "bun:test";
import { Bank, Escrow, House } from "./bank";

describe("Bank", () => {
  const userId = "test-user-123";
  let bank: Bank;

  beforeEach(() => {
    bank = new Bank(userId, 1000);
  });

  describe("constructor", () => {
    test("should initialize with correct balance", () => {
      expect(bank.balance).toBe(1000);
      expect(bank.id).toBe(userId);
    });

    test("should initialize with zero balance", () => {
      const zeroBank = new Bank(userId, 0);
      expect(zeroBank.balance).toBe(0);
    });
  });

  describe("debit", () => {
    test("should deduct amount from balance", () => {
      bank.debit(200);
      expect(bank.balance).toBe(800);
    });

    test("should record successful transaction", () => {
      bank.debit(200, "test-recipient");
      const txs = bank.transactions;
      expect(txs).toHaveLength(1);
      expect(txs[0].type).toBe("debit");
      expect(txs[0].amount).toBe(200);
      expect(txs[0].outcome).toBe("success");
      expect(txs[0].to).toBe("test-recipient");
    });

    test("should throw error for insufficient funds", () => {
      expect(() => {
        bank.debit(1500);
      }).toThrow("Insufficient funds");
      expect(bank.balance).toBe(1000); // Balance unchanged
    });

    test("should record failed transaction for insufficient funds", () => {
      try {
        bank.debit(1500, "test-recipient");
      } catch (_e) {
        // Expected to throw
      }
      const txs = bank.transactions;
      expect(txs).toHaveLength(1);
      expect(txs[0].outcome).toBe("failure");
    });

    test("should handle exact balance debit", () => {
      bank.debit(1000);
      expect(bank.balance).toBe(0);
    });

    test("should handle multiple debits", () => {
      bank.debit(300);
      bank.debit(200);
      bank.debit(100);
      expect(bank.balance).toBe(400);
      expect(bank.transactions).toHaveLength(3);
    });
  });

  describe("credit", () => {
    test("should add amount to balance", () => {
      bank.credit(500);
      expect(bank.balance).toBe(1500);
    });

    test("should record transaction", () => {
      bank.credit(500, "test-source");
      const txs = bank.transactions;
      expect(txs).toHaveLength(1);
      expect(txs[0].type).toBe("credit");
      expect(txs[0].amount).toBe(500);
      expect(txs[0].outcome).toBe("success");
      expect(txs[0].from).toBe("test-source");
    });

    test("should handle multiple credits", () => {
      bank.credit(100);
      bank.credit(200);
      bank.credit(300);
      expect(bank.balance).toBe(1600);
      expect(bank.transactions).toHaveLength(3);
    });
  });

  describe("transactions", () => {
    test("should track mixed transactions", () => {
      bank.debit(100, "recipient-1");
      bank.credit(200, "source-1");
      bank.debit(150, "recipient-2");
      expect(bank.balance).toBe(950);
      expect(bank.transactions).toHaveLength(3);
    });

    test("should include timestamps in transactions", () => {
      bank.debit(100);
      const txs = bank.transactions;
      expect(txs[0].date).toBeDefined();
      expect(new Date(txs[0].date)).toBeInstanceOf(Date);
    });
  });
});

describe("Escrow", () => {
  const userId = "test-user-123";
  const handId = "test-hand-456";
  let escrow: Escrow;

  beforeEach(() => {
    escrow = new Escrow(userId, handId);
  });

  describe("constructor", () => {
    test("should initialize with zero balance", () => {
      expect(escrow.balance).toBe(0);
    });

    test("should have correct escrow ID", () => {
      expect(escrow.id).toBe(`${userId}-${handId}-escrow`);
    });

    test("should default to hand owner", () => {
      expect(escrow.owner).toBe("hand");
    });
  });

  describe("credit", () => {
    test("should add funds to escrow", () => {
      escrow.credit(100, userId);
      expect(escrow.balance).toBe(100);
    });

    test("should handle multiple credits", () => {
      escrow.credit(50, userId);
      escrow.credit(75, userId);
      expect(escrow.balance).toBe(125);
    });
  });

  describe("debit", () => {
    beforeEach(() => {
      escrow.credit(200, userId); // Fund the escrow first
    });

    test("should remove funds from escrow", () => {
      escrow.debit(100, "recipient");
      expect(escrow.balance).toBe(100);
    });

    test("should throw on insufficient funds", () => {
      expect(() => {
        escrow.debit(300, "recipient");
      }).toThrow("Insufficient funds");
    });
  });

  describe("releaseToOwner", () => {
    beforeEach(() => {
      escrow.credit(500, userId);
    });

    test("should release to user", () => {
      const amount = escrow.releaseToOwner("user");
      expect(amount).toBe(500);
      expect(escrow.balance).toBe(0);
      expect(escrow.owner).toBe("user");
    });

    test("should release to house", () => {
      const amount = escrow.releaseToOwner("house");
      expect(amount).toBe(500);
      expect(escrow.balance).toBe(0);
      expect(escrow.owner).toBe("house");
    });

    test("should return zero if escrow is empty", () => {
      escrow.debit(500); // Empty the escrow
      const amount = escrow.releaseToOwner("user");
      expect(amount).toBe(0);
    });
  });
});

describe("House", () => {
  let house: House;

  beforeEach(() => {
    house = new House(1000000);
  });

  describe("constructor", () => {
    test("should initialize with house ID", () => {
      expect(house.id).toBe("house");
    });

    test("should initialize with correct balance", () => {
      expect(house.balance).toBe(1000000);
    });

    test("should initialize profit/loss to zero", () => {
      expect(house.profitLoss).toBe(0);
    });
  });

  describe("bank operations", () => {
    test("should handle credits (player losses)", () => {
      house.credit(500, "player-123");
      expect(house.balance).toBe(1000500);
    });

    test("should handle debits (player wins)", () => {
      house.debit(500, "player-123");
      expect(house.balance).toBe(999500);
    });

    test("should track profit/loss separately", () => {
      house.profitLoss = 100;
      expect(house.profitLoss).toBe(100);
      expect(house.balance).toBe(1000000);
    });
  });
});
