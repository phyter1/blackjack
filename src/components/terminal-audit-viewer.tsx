"use client";

import { useState, useRef, useEffect } from "react";
import { Terminal } from "./terminal";
import type { TerminalLine } from "@/lib/terminal-display";
import type { AuditEvent } from "@/modules/audit/types";

interface AuditTrailFile {
  sessionId: string;
  exportedAt: string;
  totalEvents: number;
  events: AuditEvent[];
}

type ViewerState =
  | "main_menu"
  | "view_all"
  | "view_summary"
  | "filter_type"
  | "filter_round"
  | "get_filter_type"
  | "get_filter_round";

interface TerminalAuditViewerProps {
  auditData: AuditTrailFile | null;
}

export function TerminalAuditViewer({ auditData }: TerminalAuditViewerProps) {
  const [lines, setLines] = useState<TerminalLine[]>([]);
  const [viewerState, setViewerState] = useState<ViewerState>("main_menu");
  const [inputValue, setInputValue] = useState("");
  const [filteredEvents, setFilteredEvents] = useState<AuditEvent[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  // Initialize display on mount or when auditData changes
  useEffect(() => {
    if (auditData) {
      showMainMenu();
    } else {
      addLine([
        {
          text: "No audit data loaded. Play the game first to generate audit logs.",
          color: "yellow",
        },
      ]);
    }
  }, [auditData]);

  const addLines = (newLines: TerminalLine[]) => {
    setLines((prev) => [...prev, ...newLines]);
  };

  const addLine = (line: TerminalLine) => {
    setLines((prev) => [...prev, line]);
  };

  const clearScreen = () => {
    setLines([]);
  };

  const showMainMenu = () => {
    clearScreen();
    addLine([{ text: "═".repeat(60), color: "green", bold: true }]);
    addLine([
      {
        text: "           🔍 BLACKJACK AUDIT TRAIL VIEWER 🔍           ",
        color: "green",
        bold: true,
      },
    ]);
    addLine([{ text: "═".repeat(60), color: "green", bold: true }]);

    if (auditData) {
      addLine([{ text: "\n" + "═".repeat(60), color: "cyan" }]);
      addLine([
        { text: `Session ID: ${auditData.sessionId}`, color: "cyan" },
      ]);
      addLine([
        { text: `Total Events: ${auditData.totalEvents}`, color: "cyan" },
      ]);
      addLine([
        { text: `Exported At: ${auditData.exportedAt}`, color: "cyan" },
      ]);
      addLine([{ text: "═".repeat(60) + "\n", color: "cyan" }]);

      addLine([{ text: "\nWhat would you like to do?", color: "cyan" }]);
      addLine([{ text: "1. View All Events", color: "white" }]);
      addLine([{ text: "2. View Summary by Type", color: "white" }]);
      addLine([{ text: "3. Filter by Event Type", color: "white" }]);
      addLine([{ text: "4. Filter by Round", color: "white" }]);
      addLine([{ text: "5. Back to Main Menu", color: "white" }]);
      addLine([{ text: "\nEnter option number: ", color: "cyan" }]);
    }

    setViewerState("main_menu");
  };

  const viewAllEvents = () => {
    clearScreen();
    addLine([
      { text: "All Events:", color: "cyan", bold: true },
    ]);
    addLine([{ text: "", color: "white" }]);

    if (auditData) {
      auditData.events.forEach((event, index) => {
        addLine([
          { text: `${index + 1}. `, color: "gray" },
          { text: `[${event.type}] `, color: "yellow" },
          {
            text: `${new Date(event.timestamp).toLocaleString()}`,
            color: "white",
          },
        ]);
        if (event.roundNumber !== undefined) {
          addLine([
            { text: `   Round: ${event.roundNumber}`, color: "gray" },
          ]);
        }
        addLine([
          { text: `   ${JSON.stringify(event, null, 2)}`, color: "gray" },
        ]);
        addLine([{ text: "", color: "white" }]);
      });
    }

    addLine([{ text: "\nPress Enter to return to menu...", color: "cyan" }]);
    setViewerState("view_all");
  };

  const viewSummary = () => {
    clearScreen();
    addLine([
      { text: "Summary by Event Type:", color: "cyan", bold: true },
    ]);
    addLine([{ text: "", color: "white" }]);

    if (auditData) {
      const eventCounts: Record<string, number> = {};
      auditData.events.forEach((event) => {
        eventCounts[event.type] = (eventCounts[event.type] || 0) + 1;
      });

      Object.entries(eventCounts)
        .sort((a, b) => b[1] - a[1])
        .forEach(([type, count]) => {
          addLine([
            { text: `${type}: `, color: "yellow" },
            { text: `${count}`, color: "white" },
          ]);
        });
    }

    addLine([{ text: "\nPress Enter to return to menu...", color: "cyan" }]);
    setViewerState("view_summary");
  };

  const promptFilterType = () => {
    clearScreen();
    addLine([
      { text: "Available Event Types:", color: "cyan", bold: true },
    ]);
    addLine([{ text: "", color: "white" }]);

    if (auditData) {
      const eventTypes = [...new Set(auditData.events.map((e) => e.type))];
      eventTypes.forEach((type, index) => {
        addLine([
          { text: `${index + 1}. ${type}`, color: "white" },
        ]);
      });
    }

    addLine([
      { text: "\nEnter event type name or number: ", color: "cyan" },
    ]);
    setViewerState("get_filter_type");
  };

  const filterByType = (typeOrIndex: string) => {
    if (!auditData) return;

    const eventTypes = [...new Set(auditData.events.map((e) => e.type))];
    let eventType = typeOrIndex;

    // Check if it's a number (index)
    const index = parseInt(typeOrIndex) - 1;
    if (!isNaN(index) && index >= 0 && index < eventTypes.length) {
      eventType = eventTypes[index];
    }

    const filtered = auditData.events.filter((e) => e.type === eventType);

    clearScreen();
    addLine([
      { text: `Events of type: ${eventType}`, color: "cyan", bold: true },
    ]);
    addLine([
      { text: `Found ${filtered.length} events\n`, color: "yellow" },
    ]);

    filtered.forEach((event, index) => {
      addLine([
        { text: `${index + 1}. `, color: "gray" },
        {
          text: `${new Date(event.timestamp).toLocaleString()}`,
          color: "white",
        },
      ]);
      if (event.roundNumber !== undefined) {
        addLine([
          { text: `   Round: ${event.roundNumber}`, color: "gray" },
        ]);
      }
      addLine([
        { text: `   ${JSON.stringify(event, null, 2)}`, color: "gray" },
      ]);
      addLine([{ text: "", color: "white" }]);
    });

    addLine([{ text: "\nPress Enter to return to menu...", color: "cyan" }]);
    setViewerState("filter_type");
  };

  const promptFilterRound = () => {
    clearScreen();
    addLine([
      { text: "Filter by Round Number", color: "cyan", bold: true },
    ]);
    addLine([{ text: "", color: "white" }]);

    if (auditData) {
      const rounds = [
        ...new Set(
          auditData.events
            .map((e) => e.roundNumber)
            .filter((r): r is number => r !== undefined)
        ),
      ].sort((a, b) => a - b);

      addLine([
        {
          text: `Available rounds: ${rounds.join(", ")}`,
          color: "yellow",
        },
      ]);
    }

    addLine([{ text: "\nEnter round number: ", color: "cyan" }]);
    setViewerState("get_filter_round");
  };

  const filterByRound = (roundStr: string) => {
    if (!auditData) return;

    const roundNum = parseInt(roundStr);
    if (isNaN(roundNum)) {
      addLine([
        { text: "Invalid round number. Press Enter to try again...", color: "red" },
      ]);
      setViewerState("filter_round");
      return;
    }

    const filtered = auditData.events.filter((e) => e.roundNumber === roundNum);

    clearScreen();
    addLine([
      { text: `Events from Round ${roundNum}`, color: "cyan", bold: true },
    ]);
    addLine([
      { text: `Found ${filtered.length} events\n`, color: "yellow" },
    ]);

    filtered.forEach((event, index) => {
      addLine([
        { text: `${index + 1}. `, color: "gray" },
        { text: `[${event.type}] `, color: "yellow" },
        {
          text: `${new Date(event.timestamp).toLocaleString()}`,
          color: "white",
        },
      ]);
      addLine([
        { text: `   ${JSON.stringify(event, null, 2)}`, color: "gray" },
      ]);
      addLine([{ text: "", color: "white" }]);
    });

    addLine([{ text: "\nPress Enter to return to menu...", color: "cyan" }]);
    setViewerState("filter_round");
  };

  const handleInput = (value: string) => {
    // Echo the input
    addLine([{ text: value, color: "white" }]);

    switch (viewerState) {
      case "main_menu":
        const option = parseInt(value);
        switch (option) {
          case 1:
            viewAllEvents();
            break;
          case 2:
            viewSummary();
            break;
          case 3:
            promptFilterType();
            break;
          case 4:
            promptFilterRound();
            break;
          case 5:
            // Back to main menu (this would switch modes in parent)
            addLine([
              {
                text: "\nReturning to main menu...",
                color: "green",
              },
            ]);
            break;
          default:
            addLine([{ text: "Invalid option", color: "red" }]);
            addLine([{ text: "Enter option number: ", color: "cyan" }]);
        }
        break;

      case "view_all":
      case "view_summary":
      case "filter_type":
      case "filter_round":
        showMainMenu();
        break;

      case "get_filter_type":
        filterByType(value);
        break;

      case "get_filter_round":
        filterByRound(value);
        break;
    }

    setInputValue("");
  };

  return (
    <div className="h-screen flex flex-col bg-black">
      <div className="flex-1 overflow-hidden">
        <Terminal lines={lines} />
      </div>
      <div className="border-t border-gray-700 p-4 bg-gray-900">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleInput(inputValue);
          }}
          className="flex gap-2"
        >
          <span className="text-green-500 font-mono">{">"}</span>
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            className="flex-1 bg-transparent text-white font-mono outline-none"
            autoFocus
          />
        </form>
      </div>
    </div>
  );
}
