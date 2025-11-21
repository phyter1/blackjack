"use client";

import { useState } from "react";
import type { TableRules, UserBank } from "@/types/user";
import { Button } from "../ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Input } from "../ui/input";
import { Label } from "../ui/label";

interface BalancePanelProps {
  bank: UserBank;
  currentRules?: TableRules;
  onDeposit: (amount: number) => void;
  onWithdraw: (amount: number) => void;
  onStartGame: (mode: "terminal" | "graphical") => void;
}

export function BalancePanel({
  bank,
  currentRules,
  onDeposit,
  onWithdraw,
  onStartGame,
}: BalancePanelProps) {
  const [showDeposit, setShowDeposit] = useState(false);
  const [showWithdraw, setShowWithdraw] = useState(false);
  const [amount, setAmount] = useState("");
  const [error, setError] = useState("");

  const handleDeposit = () => {
    setError("");
    try {
      const depositAmount = parseFloat(amount);
      if (Number.isNaN(depositAmount) || depositAmount <= 0) {
        setError("Please enter a valid amount");
        return;
      }
      onDeposit(depositAmount);
      setAmount("");
      setShowDeposit(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Deposit failed");
    }
  };

  const handleWithdraw = () => {
    setError("");
    try {
      const withdrawAmount = parseFloat(amount);
      if (Number.isNaN(withdrawAmount) || withdrawAmount <= 0) {
        setError("Please enter a valid amount");
        return;
      }
      onWithdraw(withdrawAmount);
      setAmount("");
      setShowWithdraw(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Withdrawal failed");
    }
  };

  const formatRules = (rules?: TableRules): string => {
    if (!rules) return "Default rules";
    const parts = [];
    parts.push(`${rules.deckCount}D`);
    parts.push(rules.dealerStand.toUpperCase());
    parts.push(`BJ ${rules.blackjackPayout}`);
    if (rules.doubleAfterSplit) parts.push("DAS");
    if (rules.surrender !== "none")
      parts.push(rules.surrender === "late" ? "LS" : "ES");
    return parts.join(", ");
  };

  return (
    <Card
      className="mb-6"
      style={{
        background: "var(--theme-dashboard-card)",
        borderColor: "var(--theme-dashboard-accent)",
      }}
    >
      <CardHeader>
        <CardTitle style={{ color: "var(--theme-accent)" }}>
          Your Balance
        </CardTitle>
        <CardDescription style={{ color: "var(--theme-text-secondary)" }}>
          Current account balance
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div
          className="text-5xl font-bold mb-4"
          style={{ color: "var(--theme-text-primary)" }}
        >
          ${bank.balance.toFixed(2)}
        </div>
        <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
          <div>
            <p style={{ color: "var(--theme-text-secondary)" }}>
              Lifetime Profit/Loss
            </p>
            <p
              className="text-xl font-semibold"
              style={{
                color:
                  bank.lifetimeProfit >= 0
                    ? "var(--theme-success)"
                    : "var(--theme-error)",
              }}
            >
              {bank.lifetimeProfit >= 0 ? "+" : ""}$
              {bank.lifetimeProfit.toFixed(2)}
            </p>
          </div>
          <div>
            <p style={{ color: "var(--theme-text-secondary)" }}>
              Total Deposited
            </p>
            <p
              className="text-xl font-semibold"
              style={{ color: "var(--theme-text-primary)" }}
            >
              ${bank.totalDeposited.toFixed(2)}
            </p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2 mb-2">
          <Button
            onClick={() => {
              setShowDeposit(true);
              setShowWithdraw(false);
              setError("");
              setAmount("");
            }}
            style={{
              background: "var(--theme-success)",
              color: "var(--theme-text-primary)",
            }}
            className="hover:opacity-90"
          >
            Deposit
          </Button>
          <Button
            onClick={() => {
              setShowWithdraw(true);
              setShowDeposit(false);
              setError("");
              setAmount("");
            }}
            style={{
              background: "var(--theme-primary)",
              color: "var(--theme-primary-foreground)",
            }}
            className="hover:opacity-90"
            disabled={bank.balance === 0}
          >
            Withdraw
          </Button>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <Button
            onClick={() => onStartGame("graphical")}
            style={{
              background: "var(--theme-accent)",
              color: "var(--theme-accent-foreground)",
            }}
            className="hover:opacity-90"
            disabled={bank.balance < 10}
          >
            🎰 Casino Table
          </Button>
          <Button
            onClick={() => onStartGame("terminal")}
            style={{
              background: "var(--theme-secondary)",
              color: "var(--theme-secondary-foreground)",
            }}
            className="hover:opacity-90"
            disabled={bank.balance < 10}
          >
            💻 Terminal
          </Button>
        </div>

        {/* Current Rules Display */}
        {currentRules && (
          <div
            className="mt-2 p-2 rounded border"
            style={{
              background: "var(--theme-dashboard-bg)",
              borderColor: "var(--theme-border)",
            }}
          >
            <p className="text-xs" style={{ color: "var(--theme-text-muted)" }}>
              Current table rules:
            </p>
            <p className="text-sm" style={{ color: "var(--theme-text-primary)" }}>
              {formatRules(currentRules)}
            </p>
            <p className="text-xs" style={{ color: "var(--theme-accent)" }}>
              House Edge: {currentRules.houseEdge?.toFixed(2)}%
            </p>
          </div>
        )}

        {/* Deposit/Withdraw Form */}
        {(showDeposit || showWithdraw) && (
          <div
            className="mt-4 p-4 rounded border"
            style={{
              background: "var(--theme-dashboard-bg)",
              borderColor: "var(--theme-border)",
            }}
          >
            <Label
              htmlFor="amount"
              style={{ color: "var(--theme-text-primary)" }}
            >
              {showDeposit ? "Deposit" : "Withdraw"} Amount
            </Label>
            <div className="flex gap-2 mt-2">
              <div className="relative flex-1">
                <span
                  className="absolute left-3 top-1/2 -translate-y-1/2"
                  style={{ color: "var(--theme-text-muted)" }}
                >
                  $
                </span>
                <Input
                  id="amount"
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="100"
                  style={{
                    background: "var(--theme-background)",
                    color: "var(--theme-text-primary)",
                    borderColor: "var(--theme-border)",
                  }}
                  className="pl-7"
                  min="1"
                  step="10"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      showDeposit ? handleDeposit() : handleWithdraw();
                    }
                  }}
                  autoFocus
                />
              </div>
              <Button
                onClick={showDeposit ? handleDeposit : handleWithdraw}
                style={{
                  background: showDeposit
                    ? "var(--theme-success)"
                    : "var(--theme-primary)",
                  color: "var(--theme-text-primary)",
                }}
                className="hover:opacity-90"
              >
                Confirm
              </Button>
              <Button
                onClick={() => {
                  setShowDeposit(false);
                  setShowWithdraw(false);
                  setAmount("");
                  setError("");
                }}
                variant="outline"
                style={{
                  borderColor: "var(--theme-border)",
                  color: "var(--theme-text-secondary)",
                }}
                className="hover:opacity-80"
              >
                Cancel
              </Button>
            </div>
            {error && (
              <p className="text-sm mt-2" style={{ color: "var(--theme-error)" }}>
                {error}
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
