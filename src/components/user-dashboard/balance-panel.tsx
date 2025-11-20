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
    <Card className="bg-gray-900 border-green-500 mb-6">
      <CardHeader>
        <CardTitle className="text-green-500">Your Balance</CardTitle>
        <CardDescription>Current account balance</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="text-5xl font-bold text-white mb-4">
          ${bank.balance.toFixed(2)}
        </div>
        <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
          <div>
            <p className="text-gray-400">Lifetime Profit/Loss</p>
            <p
              className={`text-xl font-semibold ${
                bank.lifetimeProfit >= 0 ? "text-green-500" : "text-red-500"
              }`}
            >
              {bank.lifetimeProfit >= 0 ? "+" : ""}$
              {bank.lifetimeProfit.toFixed(2)}
            </p>
          </div>
          <div>
            <p className="text-gray-400">Total Deposited</p>
            <p className="text-xl font-semibold text-white">
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
            className="bg-green-600 hover:bg-green-700"
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
            className="bg-blue-600 hover:bg-blue-700"
            disabled={bank.balance === 0}
          >
            Withdraw
          </Button>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <Button
            onClick={() => onStartGame("graphical")}
            className="bg-amber-600 hover:bg-amber-700"
            disabled={bank.balance < 10}
          >
            🎰 Casino Table
          </Button>
          <Button
            onClick={() => onStartGame("terminal")}
            className="bg-gray-700 hover:bg-gray-600"
            disabled={bank.balance < 10}
          >
            💻 Terminal
          </Button>
        </div>

        {/* Current Rules Display */}
        {currentRules && (
          <div className="mt-2 p-2 bg-black rounded border border-gray-700">
            <p className="text-xs text-gray-400">Current table rules:</p>
            <p className="text-sm text-white">{formatRules(currentRules)}</p>
            <p className="text-xs text-green-400">
              House Edge: {currentRules.houseEdge?.toFixed(2)}%
            </p>
          </div>
        )}

        {/* Deposit/Withdraw Form */}
        {(showDeposit || showWithdraw) && (
          <div className="mt-4 p-4 bg-black rounded border border-gray-700">
            <Label htmlFor="amount" className="text-white">
              {showDeposit ? "Deposit" : "Withdraw"} Amount
            </Label>
            <div className="flex gap-2 mt-2">
              <div className="relative flex-1">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                  $
                </span>
                <Input
                  id="amount"
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="100"
                  className="bg-gray-900 text-white border-gray-700 pl-7"
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
                className={
                  showDeposit
                    ? "bg-green-600 hover:bg-green-700"
                    : "bg-blue-600 hover:bg-blue-700"
                }
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
                className="border-gray-700"
              >
                Cancel
              </Button>
            </div>
            {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
