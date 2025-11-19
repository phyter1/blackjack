/** biome-ignore-all lint/a11y/noStaticElementInteractions: <explanation> */
/** biome-ignore-all lint/suspicious/noAssignInExpressions: <explanation> */
/** biome-ignore-all lint/a11y/useKeyWithClickEvents: <explanation> */
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
import { RulesSelector } from "./rules-selector";
import type {
  UserProfile,
  UserBank,
  UserStats,
  GameSession,
  TableRules,
} from "@/types/user";

interface UserDashboardProps {
  user: UserProfile;
  bank: UserBank;
  onBankUpdate: (bank: UserBank) => void;
  onStartGame: (mode?: "terminal" | "graphical", rules?: TableRules) => void;
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
  const [selectedSession, setSelectedSession] = useState<GameSession | null>(
    null,
  );
  // Pagination and view mode state
  const [viewMode, setViewMode] = useState<"recent" | "all">("recent");
  const [currentPage, setCurrentPage] = useState(1);
  const sessionsPerPage = 10;
  // Rules configuration state
  const [showRulesSelector, setShowRulesSelector] = useState(false);
  const [currentRules, setCurrentRules] = useState<TableRules | undefined>(
    undefined,
  );
  const [pendingGameMode, setPendingGameMode] = useState<
    "terminal" | "graphical" | undefined
  >();

  useEffect(() => {
    // Load user stats and sessions
    setStats(UserService.getUserStats(user.id));
    const userSessions = UserService.getSessions(user.id);
    setAllSessions(userSessions); // All sessions for charts
    setSessions(userSessions.slice(0, 5)); // Show last 5 sessions
  }, [user.id]);

  // Update displayed sessions when view mode or page changes
  useEffect(() => {
    if (viewMode === "recent") {
      setSessions(allSessions.slice(0, 5));
      setCurrentPage(1);
    } else {
      // Calculate pagination for "all" view
      const startIndex = (currentPage - 1) * sessionsPerPage;
      const endIndex = startIndex + sessionsPerPage;
      setSessions(allSessions.slice(startIndex, endIndex));
    }
  }, [viewMode, currentPage, allSessions, sessionsPerPage]);

  const handleDeposit = () => {
    setError("");
    try {
      const depositAmount = parseFloat(amount);
      if (Number.isNaN(depositAmount) || depositAmount <= 0) {
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

  const handleStartGame = (mode: "terminal" | "graphical") => {
    setPendingGameMode(mode);
    setShowRulesSelector(true);
  };

  const handleSaveRules = (rules: TableRules) => {
    setCurrentRules(rules);
    setShowRulesSelector(false);
    if (pendingGameMode) {
      onStartGame(pendingGameMode, rules);
      setPendingGameMode(undefined);
    }
  };

  const handleCancelRules = () => {
    setShowRulesSelector(false);
    setPendingGameMode(undefined);
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
                onClick={() => handleStartGame("graphical")}
                className="bg-amber-600 hover:bg-amber-700"
                disabled={bank.balance < 10}
              >
                🎰 Casino Table
              </Button>
              <Button
                onClick={() => handleStartGame("terminal")}
                className="bg-gray-700 hover:bg-gray-600"
                disabled={bank.balance < 10}
              >
                💻 Terminal
              </Button>
            </div>
            {/* <Button
              onClick={() => window.location.href = '/trainer'}
              className="w-full bg-linear-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold"
            >
              🎓 Practice Mode (Trainer)
            </Button> */}

            {/* Current Rules Display */}
            {currentRules && (
              <div className="mt-2 p-2 bg-black rounded border border-gray-700">
                <p className="text-xs text-gray-400">Current table rules:</p>
                <p className="text-sm text-white">
                  {formatRules(currentRules)}
                </p>
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
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-white">
                  {viewMode === "recent" ? "Recent Sessions" : "All Sessions"}
                </CardTitle>
                <CardDescription>
                  {viewMode === "recent"
                    ? "Your last 5 game sessions"
                    : `All sessions (${allSessions.length} total)`}
                </CardDescription>
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={() => setViewMode("recent")}
                  variant={viewMode === "recent" ? "default" : "outline"}
                  className={
                    viewMode === "recent"
                      ? "bg-green-600 hover:bg-green-700"
                      : "border-gray-700 text-gray-400 hover:text-white"
                  }
                  size="sm"
                >
                  Recent
                </Button>
                <Button
                  onClick={() => setViewMode("all")}
                  variant={viewMode === "all" ? "default" : "outline"}
                  className={
                    viewMode === "all"
                      ? "bg-green-600 hover:bg-green-700"
                      : "border-gray-700 text-gray-400 hover:text-white"
                  }
                  size="sm"
                >
                  All
                </Button>
              </div>
            </div>
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
                              new Date(session.startTime).getTime(),
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
                          Strategy: {session.strategyGrade} (
                          {session.strategyAccuracy?.toFixed(1)}%)
                        </p>
                      )}
                      {session.hasCountData && (
                        <p className="text-xs text-purple-400 mt-1">
                          📊 Count data available
                        </p>
                      )}
                      {session.expectedValue !== undefined &&
                        session.variance !== undefined && (
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
                      {session.rules && (
                        <p className="text-xs text-amber-400 mt-1">
                          📋 {formatRules(session.rules)} (House Edge:{" "}
                          {session.rules.houseEdge?.toFixed(2)}%)
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Pagination Controls */}
            {viewMode === "all" && allSessions.length > sessionsPerPage && (
              <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-800">
                <Button
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(1, prev - 1))
                  }
                  disabled={currentPage === 1}
                  variant="outline"
                  className="border-gray-700 text-gray-400 hover:text-white disabled:opacity-30"
                  size="sm"
                >
                  ← Previous
                </Button>
                <span className="text-gray-400 text-sm">
                  Page {currentPage} of{" "}
                  {Math.ceil(allSessions.length / sessionsPerPage)}
                </span>
                <Button
                  onClick={() =>
                    setCurrentPage((prev) =>
                      Math.min(
                        Math.ceil(allSessions.length / sessionsPerPage),
                        prev + 1,
                      ),
                    )
                  }
                  disabled={
                    currentPage >=
                    Math.ceil(allSessions.length / sessionsPerPage)
                  }
                  variant="outline"
                  className="border-gray-700 text-gray-400 hover:text-white disabled:opacity-30"
                  size="sm"
                >
                  Next →
                </Button>
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

      {/* Rules Selector Modal */}
      {showRulesSelector && (
        <RulesSelector
          initialRules={currentRules}
          onSave={handleSaveRules}
          onCancel={handleCancelRules}
        />
      )}
    </div>
  );
}
