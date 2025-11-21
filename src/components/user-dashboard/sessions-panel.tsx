/** biome-ignore-all lint/a11y/noStaticElementInteractions: <explanation> */
/** biome-ignore-all lint/a11y/useKeyWithClickEvents: <explanation> */
"use client";

import { useEffect, useState } from "react";
import type { GameSession, TableRules } from "@/types/user";
import { Button } from "../ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";

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
  }, [viewMode, currentPage, allSessions]);

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
    <Card
      style={{
        background: "var(--theme-dashboard-card)",
        borderColor: "var(--theme-dashboard-card-border)",
      }}
    >
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle style={{ color: "var(--theme-text-primary)" }}>
              {viewMode === "recent" ? "Recent Sessions" : "All Sessions"}
            </CardTitle>
            <CardDescription style={{ color: "var(--theme-text-secondary)" }}>
              {viewMode === "recent"
                ? "Your last 5 game sessions"
                : `All sessions (${allSessions.length} total)`}
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={() => setViewMode("recent")}
              variant={viewMode === "recent" ? "default" : "outline"}
              style={
                viewMode === "recent"
                  ? {
                      background: "var(--theme-accent)",
                      color: "var(--theme-accent-foreground)",
                    }
                  : {
                      borderColor: "var(--theme-border)",
                      color: "var(--theme-text-muted)",
                    }
              }
              className="hover:opacity-90"
              size="sm"
            >
              Recent
            </Button>
            <Button
              onClick={() => setViewMode("all")}
              variant={viewMode === "all" ? "default" : "outline"}
              style={
                viewMode === "all"
                  ? {
                      background: "var(--theme-accent)",
                      color: "var(--theme-accent-foreground)",
                    }
                  : {
                      borderColor: "var(--theme-border)",
                      color: "var(--theme-text-muted)",
                    }
              }
              className="hover:opacity-90"
              size="sm"
            >
              All
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {sessions.length === 0 ? (
          <p
            className="text-center py-4"
            style={{ color: "var(--theme-text-muted)" }}
          >
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
                className={`flex justify-between items-center p-3 rounded border transition-colors ${
                  session.decisionsData ? "cursor-pointer" : ""
                }`}
                style={{
                  background: "var(--theme-dashboard-bg)",
                  borderColor: "var(--theme-border)",
                }}
                onMouseEnter={(e) => {
                  if (session.decisionsData) {
                    e.currentTarget.style.borderColor = "var(--theme-accent)";
                    e.currentTarget.style.background =
                      "var(--theme-dashboard-card)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (session.decisionsData) {
                    e.currentTarget.style.borderColor = "var(--theme-border)";
                    e.currentTarget.style.background =
                      "var(--theme-dashboard-bg)";
                  }
                }}
              >
                <div>
                  <p
                    className="font-semibold"
                    style={{ color: "var(--theme-text-primary)" }}
                  >
                    {new Date(session.startTime).toLocaleDateString()}{" "}
                    {new Date(session.startTime).toLocaleTimeString()}
                  </p>
                  <p
                    className="text-sm"
                    style={{ color: "var(--theme-text-secondary)" }}
                  >
                    {session.roundsPlayed} rounds
                    {session.endTime &&
                      ` • ${formatDuration(
                        new Date(session.endTime).getTime() -
                          new Date(session.startTime).getTime(),
                      )}`}
                    {session.decisionsData && (
                      <span
                        className="ml-2"
                        style={{ color: "var(--theme-accent)" }}
                      >
                        • Click to replay
                      </span>
                    )}
                  </p>
                </div>
                <div className="text-right">
                  <p
                    className="text-lg font-semibold"
                    style={{
                      color:
                        session.netProfit >= 0
                          ? "var(--theme-success)"
                          : "var(--theme-error)",
                    }}
                  >
                    {session.netProfit >= 0 ? "+" : ""}$
                    {session.netProfit.toFixed(2)}
                  </p>
                  <p
                    className="text-xs"
                    style={{ color: "var(--theme-text-secondary)" }}
                  >
                    ${session.startingBalance.toFixed(2)} → $
                    {session.endingBalance.toFixed(2)}
                  </p>
                  {session.strategyGrade && (
                    <p
                      className="text-xs mt-1"
                      style={{ color: "var(--theme-primary)" }}
                    >
                      Strategy: {session.strategyGrade} (
                      {session.strategyAccuracy?.toFixed(1)}%)
                    </p>
                  )}
                  {session.hasCountData && (
                    <p
                      className="text-xs mt-1"
                      style={{ color: "var(--theme-secondary)" }}
                    >
                      📊 Count data available
                    </p>
                  )}
                  {session.expectedValue !== undefined &&
                    session.variance !== undefined && (
                      <p
                        className="text-xs mt-1"
                        style={{ color: "var(--theme-text-secondary)" }}
                      >
                        EV: ${session.expectedValue.toFixed(2)} | Variance:{" "}
                        <span
                          style={{
                            color:
                              session.variance >= 0
                                ? "var(--theme-success)"
                                : "var(--theme-error)",
                          }}
                        >
                          {session.variance >= 0 ? "+" : ""}$
                          {session.variance.toFixed(2)}
                        </span>
                      </p>
                    )}
                  {session.rules && (
                    <p
                      className="text-xs mt-1"
                      style={{ color: "var(--theme-warning)" }}
                    >
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
          <div
            className="flex justify-between items-center mt-4 pt-4 border-t"
            style={{ borderColor: "var(--theme-border)" }}
          >
            <Button
              onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              variant="outline"
              style={{
                borderColor: "var(--theme-border)",
                color: "var(--theme-text-muted)",
              }}
              className="hover:opacity-80 disabled:opacity-30"
              size="sm"
            >
              ← Previous
            </Button>
            <span
              className="text-sm"
              style={{ color: "var(--theme-text-secondary)" }}
            >
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
              style={{
                borderColor: "var(--theme-border)",
                color: "var(--theme-text-muted)",
              }}
              className="hover:opacity-80 disabled:opacity-30"
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
