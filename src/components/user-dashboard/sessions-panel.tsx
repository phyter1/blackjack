/** biome-ignore-all lint/a11y/noStaticElementInteractions: <explanation> */
/** biome-ignore-all lint/a11y/useKeyWithClickEvents: <explanation> */
"use client";

import { useState, useEffect } from "react";
import { Button } from "../ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import type { GameSession, TableRules } from "@/types/user";

interface SessionsPanelProps {
  allSessions: GameSession[];
  onSessionSelect: (session: GameSession) => void;
}

export function SessionsPanel({
  allSessions,
  onSessionSelect,
}: SessionsPanelProps) {
  const [sessions, setSessions] = useState<GameSession[]>([]);
  const [viewMode, setViewMode] = useState<"recent" | "all">("recent");
  const [currentPage, setCurrentPage] = useState(1);
  const sessionsPerPage = 10;

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

  const formatDuration = (ms: number) => {
    const minutes = Math.floor(ms / 60000);
    const hours = Math.floor(minutes / 60);
    if (hours > 0) {
      return `${hours}h ${minutes % 60}m`;
    }
    return `${minutes}m`;
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
                    onSessionSelect(session);
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
                      session.netProfit >= 0 ? "text-green-500" : "text-red-500"
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
              onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
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
                currentPage >= Math.ceil(allSessions.length / sessionsPerPage)
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
  );
}
