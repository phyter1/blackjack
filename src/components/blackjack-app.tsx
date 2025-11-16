"use client";

import { useState, useEffect } from "react";
import { UserAuth } from "./user-auth";
import { UserDashboard } from "./user-dashboard";
import { TerminalGamePersistent } from "./terminal-game-persistent";
import { CasinoTable } from "./casino-table";
import type { UserProfile, UserBank } from "@/types/user";
import { UserService } from "@/services/user-service";

type AppState = "auth" | "dashboard" | "game";
type GameMode = "terminal" | "graphical";

export function BlackjackApp() {
  const [appState, setAppState] = useState<AppState>("auth");
  const [user, setUser] = useState<UserProfile | null>(null);
  const [bank, setBank] = useState<UserBank | null>(null);
  const [loading, setLoading] = useState(true);
  const [gameMode, setGameMode] = useState<GameMode>("graphical");

  useEffect(() => {
    // Check if user is already logged in
    const currentUser = UserService.getCurrentUser();
    if (currentUser) {
      setUser(currentUser.user);
      setBank(currentUser.bank);
      setAppState("dashboard");
    }
    setLoading(false);
  }, []);

  const handleAuthenticated = (authenticatedUser: UserProfile, authenticatedBank: UserBank) => {
    setUser(authenticatedUser);
    setBank(authenticatedBank);
    setAppState("dashboard");
  };

  const handleLogout = () => {
    UserService.logout();
    setUser(null);
    setBank(null);
    setAppState("auth");
  };

  const handleBankUpdate = (updatedBank: UserBank) => {
    setBank(updatedBank);
  };

  const handleStartGame = (mode: GameMode = "graphical") => {
    setGameMode(mode);
    setAppState("game");
  };

  const handleGameEnd = (updatedBank: UserBank) => {
    setBank(updatedBank);
  };

  const handleBackToDashboard = () => {
    // Refresh user data from storage when returning to dashboard
    const currentUser = UserService.getCurrentUser();
    if (currentUser) {
      setUser(currentUser.user);
      setBank(currentUser.bank);
    }
    setAppState("dashboard");
  };

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
        onBankUpdate={handleBankUpdate}
        onStartGame={handleStartGame}
        onLogout={handleLogout}
      />
    );
  }

  if (appState === "game" && user && bank) {
    if (gameMode === "terminal") {
      return (
        <TerminalGamePersistent
          user={user}
          bank={bank}
          onGameEnd={handleGameEnd}
          onBackToDashboard={handleBackToDashboard}
        />
      );
    } else {
      return (
        <CasinoTable
          user={user}
          bank={bank}
          onGameEnd={handleGameEnd}
          onBackToDashboard={handleBackToDashboard}
        />
      );
    }
  }

  return null;
}
