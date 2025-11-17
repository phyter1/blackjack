"use client";

import { useState, useEffect } from "react";
import { UserService } from "@/services/user-service";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { SessionReplay } from "./session-replay";
import { LifetimeStatsCharts } from "./lifetime-stats-charts";
import type { UserProfile, UserBank, UserStats, GameSession } from "@/types/user";

interface UserDashboardProps {
  user: UserProfile;
  bank: UserBank;
  onBankUpdate: (bank: UserBank) => void;
  onStartGame: (mode?: "terminal" | "graphical") => void;
  onLogout: () => void;
}

export function UserDashboard({
  user,
  bank,
  onBankUpdate,
  onStartGame,
  onLogout,
}: UserDashboardProps) {
  const [stats, setStats] = useState<UserStats | null>(null);
  const [sessions, setSessions] = useState<GameSession[]>([]);
  const [allSessions, setAllSessions] = useState<GameSession[]>([]);
  const [showDeposit, setShowDeposit] = useState(false);
  const [showWithdraw, setShowWithdraw] = useState(false);
  const [amount, setAmount] = useState("");
  const [error, setError] = useState("");
  const [selectedSession, setSelectedSession] = useState<GameSession | null>(null);

  useEffect(() => {
    // Load user stats and sessions
    setStats(UserService.getUserStats(user.id));
    const userSessions = UserService.getSessions(user.id);
    setAllSessions(userSessions); // All sessions for charts
    setSessions(userSessions.slice(0, 5)); // Show last 5 sessions
  }, [user.id]);

  const handleDeposit = () => {
    setError("");
    try {
      const depositAmount = parseFloat(amount);
      if (isNaN(depositAmount) || depositAmount <= 0) {
        setError("Please enter a valid amount");
        return;
      }

      const updatedBank = UserService.deposit(user.id, depositAmount);
      onBankUpdate(updatedBank);
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
      if (isNaN(withdrawAmount) || withdrawAmount <= 0) {
        setError("Please enter a valid amount");
        return;
      }

      const updatedBank = UserService.withdraw(user.id, withdrawAmount);
      onBankUpdate(updatedBank);
      setAmount("");
      setShowWithdraw(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Withdrawal failed");
    }
  };

  const formatDuration = (ms: number) => {
    const minutes = Math.floor(ms / 60000);
    const hours = Math.floor(minutes / 60);
    if (hours > 0) {
      return `${hours}h ${minutes % 60}m`;
    }
    return `${minutes}m`;
  };

  return (
    <div className="h-screen bg-black p-4 overflow-y-auto">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-green-500">
              🃏 Blackjack Dashboard
            </h1>
            <p className="text-gray-400">Welcome back, {user.name}!</p>
          </div>
          <Button
            onClick={onLogout}
            variant="outline"
            className="border-gray-700 text-gray-400 hover:text-white"
          >
            Logout
          </Button>
        </div>

        {/* Balance Card */}
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
                {error && (
                  <p className="text-red-500 text-sm mt-2">{error}</p>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Card className="bg-gray-900 border-gray-700">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-gray-400">
                  Total Sessions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-white">
                  {stats.totalSessionsPlayed}
                </div>
                <p className="text-xs text-gray-500">
                  {stats.totalRoundsPlayed} rounds played
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gray-900 border-gray-700">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-gray-400">
                  Win Rate
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-white">
                  {stats.winRate.toFixed(1)}%
                </div>
                <p className="text-xs text-gray-500">Session win rate</p>
              </CardContent>
            </Card>

            <Card className="bg-gray-900 border-gray-700">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-gray-400">
                  Total Play Time
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-white">
                  {formatDuration(stats.totalTimePlayedMs)}
                </div>
                <p className="text-xs text-gray-500">Time at the tables</p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Lifetime Stats Charts */}
        {allSessions.length > 0 && (
          <div className="mb-6">
            <LifetimeStatsCharts sessions={allSessions} />
          </div>
        )}

        {/* Recent Sessions */}
        <Card className="bg-gray-900 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">Recent Sessions</CardTitle>
            <CardDescription>Your last 5 game sessions</CardDescription>
          </CardHeader>
          <CardContent>
            {sessions.length === 0 ? (
              <p className="text-gray-400 text-center py-4">
                No sessions yet. Start playing to see your history!
              </p>
            ) : (
              <div className="space-y-2">
                {sessions.map((session) => (
                  <div
                    key={session.id}
                    onClick={() => {
                      if (session.decisionsData) {
                        setSelectedSession(session);
                      }
                    }}
                    className={`flex justify-between items-center p-3 bg-black rounded border border-gray-800 ${
                      session.decisionsData
                        ? "cursor-pointer hover:border-green-600 hover:bg-gray-900 transition-colors"
                        : ""
                    }`}
                  >
                    <div>
                      <p className="text-white font-semibold">
                        {new Date(session.startTime).toLocaleDateString()}{" "}
                        {new Date(session.startTime).toLocaleTimeString()}
                      </p>
                      <p className="text-sm text-gray-400">
                        {session.roundsPlayed} rounds
                        {session.endTime &&
                          ` • ${formatDuration(
                            new Date(session.endTime).getTime() -
                              new Date(session.startTime).getTime()
                          )}`}
                        {session.decisionsData && (
                          <span className="ml-2 text-green-500">
                            • Click to replay
                          </span>
                        )}
                      </p>
                    </div>
                    <div className="text-right">
                      <p
                        className={`text-lg font-semibold ${
                          session.netProfit >= 0
                            ? "text-green-500"
                            : "text-red-500"
                        }`}
                      >
                        {session.netProfit >= 0 ? "+" : ""}$
                        {session.netProfit.toFixed(2)}
                      </p>
                      <p className="text-xs text-gray-400">
                        ${session.startingBalance.toFixed(2)} → $
                        {session.endingBalance.toFixed(2)}
                      </p>
                      {session.strategyGrade && (
                        <p className="text-xs text-blue-400 mt-1">
                          Strategy: {session.strategyGrade} ({session.strategyAccuracy?.toFixed(1)}%)
                        </p>
                      )}
                      {session.hasCountData && (
                        <p className="text-xs text-purple-400 mt-1">
                          📊 Count data available
                        </p>
                      )}
                      {session.expectedValue !== undefined && session.variance !== undefined && (
                        <p className="text-xs text-gray-400 mt-1">
                          EV: ${session.expectedValue.toFixed(2)} | Variance:{" "}
                          <span
                            className={
                              session.variance >= 0
                                ? "text-green-400"
                                : "text-red-400"
                            }
                          >
                            {session.variance >= 0 ? "+" : ""}$
                            {session.variance.toFixed(2)}
                          </span>
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Session Replay Modal */}
      {selectedSession && (
        <SessionReplay
          session={selectedSession}
          onClose={() => setSelectedSession(null)}
        />
      )}
    </div>
  );
}
