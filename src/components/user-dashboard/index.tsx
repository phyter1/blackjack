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
import { PresetSelector } from "../preset-selector";
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
  const [showPresetSelector, setShowPresetSelector] = useState(false);
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
    setShowPresetSelector(true);
  };

  const handleSelectPreset = (rules: TableRules) => {
    setCurrentRules(rules);
    setShowPresetSelector(false);
    if (pendingGameMode) {
      onStartGame(pendingGameMode, rules);
      setPendingGameMode(undefined);
    }
  };

  const handleCustomGame = () => {
    setShowPresetSelector(false);
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

  const handleCancelPresetSelector = () => {
    setShowPresetSelector(false);
    setPendingGameMode(undefined);
  };

  const handleCancelRules = () => {
    setShowRulesSelector(false);
    setShowPresetSelector(true); // Go back to preset selector
  };

  return (
    <div
      className="h-screen p-3 overflow-y-auto"
      style={{ background: "var(--theme-dashboard-bg)" }}
    >
      <div className="max-w-6xl mx-auto space-y-3">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1
              className="text-2xl font-bold"
              style={{ color: "var(--theme-primary)" }}
            >
              ♠ 21 ♠
            </h1>
            <p className="text-sm" style={{ color: "var(--theme-text-secondary)" }}>
              Welcome back, {user.name}!
            </p>
          </div>
          <Button
            onClick={onLogout}
            variant="outline"
            size="sm"
            style={{
              borderColor: "var(--theme-border)",
              color: "var(--theme-text-muted)",
            }}
            className="hover:text-white"
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
          <LifetimeStatsCharts sessions={allSessions} />
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

      {/* Preset Selector Modal */}
      {showPresetSelector && (
        <PresetSelector
          onSelectPreset={handleSelectPreset}
          onCustomGame={handleCustomGame}
          onCancel={handleCancelPresetSelector}
        />
      )}

      {/* Rules Selector Modal */}
      {showRulesSelector && (
        <RulesSelector
          initialRules={currentRules}
          onSave={handleSaveRules}
          onCancel={handleCancelRules}
          allowSaveAsPreset={true}
        />
      )}
    </div>
  );
}
