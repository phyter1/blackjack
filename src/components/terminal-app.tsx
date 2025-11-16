"use client";

import { useState, useRef } from "react";
import { TerminalGame } from "./terminal-game";
import { TerminalAuditViewer } from "./terminal-audit-viewer";
import { Tabs, TabsList, TabsTrigger } from "./ui/tabs";
import type { Game } from "@/modules/game/game";

type Mode = "game" | "audit";

interface AuditTrailFile {
  sessionId: string;
  exportedAt: string;
  totalEvents: number;
  events: any[];
}

export function TerminalApp() {
  const [mode, setMode] = useState<Mode>("game");
  const gameRef = useRef<Game | null>(null);
  const [auditData, setAuditData] = useState<AuditTrailFile | null>(null);

  const handleGameUpdate = (game: Game) => {
    gameRef.current = game;
    // Update audit data when switching to audit view
    if (game) {
      const auditJSON = game.getAuditTrailJSON();
      const parsed = JSON.parse(auditJSON);
      setAuditData(parsed);
    }
  };

  const handleModeChange = (newMode: Mode) => {
    if (newMode === "audit" && gameRef.current) {
      // Refresh audit data when switching to audit viewer
      const auditJSON = gameRef.current.getAuditTrailJSON();
      const parsed = JSON.parse(auditJSON);
      setAuditData(parsed);
    }
    setMode(newMode);
  };

  return (
    <div className="h-screen flex flex-col">
      <div className="border-b border-gray-700 bg-gray-900 p-2">
        <Tabs value={mode} onValueChange={(v) => handleModeChange(v as Mode)}>
          <TabsList className="bg-black">
            <TabsTrigger value="game" className="font-mono">
              🃏 Game
            </TabsTrigger>
            <TabsTrigger value="audit" className="font-mono">
              🔍 Audit Viewer
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
      <div className="flex-1 overflow-hidden">
        {mode === "game" ? (
          <TerminalGame onGameUpdate={handleGameUpdate} />
        ) : (
          <TerminalAuditViewer auditData={auditData} />
        )}
      </div>
    </div>
  );
}
