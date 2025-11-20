"use client";

import { useEffect } from "react";
import { useAppStore } from "@/stores/app";
import { CasinoTable } from "./casino-table";
import { UserAuth } from "./user-auth";
import { UserDashboard } from "./user-dashboard";

export function BlackjackApp() {
  // App state from store
  const appState = useAppStore((state) => state.appState);
  const loading = useAppStore((state) => state.loading);
  const user = useAppStore((state) => state.user);
  const bank = useAppStore((state) => state.bank);
  const currentRules = useAppStore((state) => state.currentRules);

  // App actions from store
  const initialize = useAppStore((state) => state.initialize);
  const handleAuthenticated = useAppStore((state) => state.handleAuthenticated);
  const handleLogout = useAppStore((state) => state.handleLogout);
  const updateBank = useAppStore((state) => state.updateBank);
  const goToGame = useAppStore((state) => state.goToGame);
  const handleGameEnd = useAppStore((state) => state.handleGameEnd);
  const handleBackToDashboard = useAppStore(
    (state) => state.handleBackToDashboard,
  );

  // Initialize app on mount
  useEffect(() => {
    initialize();
  }, [initialize]);

  if (loading) {
    return (
      <div className="h-screen bg-black flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  if (appState === "auth") {
    return <UserAuth onAuthenticated={handleAuthenticated} />;
  }

  if (appState === "dashboard" && user && bank) {
    return (
      <UserDashboard
        user={user}
        bank={bank}
        onBankUpdate={updateBank}
        onStartGame={goToGame}
        onLogout={handleLogout}
      />
    );
  }

  if (appState === "game" && user && bank) {
    return (
      <CasinoTable
        user={user}
        bank={bank}
        rules={currentRules}
        onGameEnd={handleGameEnd}
        onBackToDashboard={handleBackToDashboard}
      />
    );
  }

  return null;
}
