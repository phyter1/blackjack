/** biome-ignore-all lint/suspicious/noAssignInExpressions: <explanation> */
"use client";

import { useEffect, useState } from "react";
import { UserService } from "@/services/user-service";
import type {
  GameSession,
  TableRules,
  UserBank,
  UserProfile,
  UserStats,
} from "@/types/user";
import { LifetimeStatsCharts } from "../lifetime-stats-charts";
import { RulesSelector } from "../rules-selector";
import { SessionReplay } from "../session-replay";
import { Button } from "../ui/button";
import { BalancePanel } from "./balance-panel";
import { SessionsPanel } from "./sessions-panel";
import { StatsPanel } from "./stats-panel";

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
  const [allSessions, setAllSessions] = useState<GameSession[]>([]);
  const [selectedSession, setSelectedSession] = useState<GameSession | null>(
    null,
  );
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
    setAllSessions(userSessions);
  }, [user.id]);

  const handleDeposit = (amount: number) => {
    const updatedBank = UserService.deposit(user.id, amount);
    onBankUpdate(updatedBank);
  };

  const handleWithdraw = (amount: number) => {
    const updatedBank = UserService.withdraw(user.id, amount);
    onBankUpdate(updatedBank);
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

        {/* Balance Panel */}
        <BalancePanel
          bank={bank}
          currentRules={currentRules}
          onDeposit={handleDeposit}
          onWithdraw={handleWithdraw}
          onStartGame={handleStartGame}
        />

        {/* Stats Panel */}
        <StatsPanel stats={stats} />

        {/* Lifetime Stats Charts */}
        {allSessions.length > 0 && (
          <div className="mb-6">
            <LifetimeStatsCharts sessions={allSessions} />
          </div>
        )}

        {/* Sessions Panel */}
        <SessionsPanel
          allSessions={allSessions}
          onSessionSelect={setSelectedSession}
        />
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
