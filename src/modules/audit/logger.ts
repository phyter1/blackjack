// import { writeFileSync } from "node:fs";
import type { AuditEvent, AuditEventType } from "./types";

export interface AuditLoggerOptions {
  sessionId?: string;
  enableConsoleLog?: boolean;
  enableFileLog?: boolean;
  logFilePath?: string;
}

/**
 * Audit Logger for tracking all game events
 */
export class AuditLogger {
  private events: AuditEvent[] = [];
  private sessionId: string;
  private enableConsoleLog: boolean;
  private enableFileLog: boolean;
  private logFilePath?: string;
  private currentRoundNumber?: number;

  constructor(options: AuditLoggerOptions = {}) {
    this.sessionId = options.sessionId ?? `session-${crypto.randomUUID()}`;
    this.enableConsoleLog = options.enableConsoleLog ?? false;
    this.enableFileLog = false; //  options.enableFileLog ?? false;
    this.logFilePath = options.logFilePath;
    // this.initLogFile();
  }

  // private initLogFile(): void {
  //   if (this.enableFileLog && this.logFilePath) {
  //     // const header = "id,timestamp,type,sessionId,roundNumber,data\n";
  //     // writeFileSync(this.logFilePath, header, { flag: "w" });
  //   }
  // }

  // private appendToLogFile(event: AuditEvent): void {
  //   if (this.enableFileLog && this.logFilePath) {
  //     // const row = `${event.id},${event.timestamp.toISOString()},${event.type},${event.sessionId},${event.roundNumber ?? ""},"${JSON.stringify(event)}"\n`;
  //     // writeFileSync(this.logFilePath, row, { flag: "a" });
  //   }
  // }

  /**
   * Log an audit eventd
   */
  log<T extends AuditEvent>(
    type: AuditEventType,
    data: Omit<T, "id" | "timestamp" | "type">,
  ): T {
    const event = {
      id: `event-${crypto.randomUUID()}`,
      timestamp: new Date(),
      type,
      sessionId: this.sessionId,
      roundNumber: this.currentRoundNumber,
      ...data,
    } as T;

    this.events.push(event);

    if (this.enableConsoleLog) {
      console.log(`[AUDIT] ${type}:`, event);
    }

    if (this.enableFileLog) {
      // this.appendToLogFile(event);
    }

    return event;
  }

  /**
   * Set the current round number for subsequent events
   */
  setCurrentRound(roundNumber: number): void {
    this.currentRoundNumber = roundNumber;
  }

  /**
   * Clear the current round number
   */
  clearCurrentRound(): void {
    this.currentRoundNumber = undefined;
  }

  /**
   * Get all events
   */
  getEvents(): AuditEvent[] {
    return [...this.events];
  }

  /**
   * Get events by type
   */
  getEventsByType(type: AuditEventType): AuditEvent[] {
    return this.events.filter((event) => event.type === type);
  }

  /**
   * Get events by round
   */
  getEventsByRound(roundNumber: number): AuditEvent[] {
    return this.events.filter((event) => event.roundNumber === roundNumber);
  }

  /**
   * Get events in a time range
   */
  getEventsByTimeRange(start: Date, end: Date): AuditEvent[] {
    return this.events.filter(
      (event) => event.timestamp >= start && event.timestamp <= end,
    );
  }

  /**
   * Export audit trail as JSON
   */
  exportJSON(): string {
    return JSON.stringify(
      {
        sessionId: this.sessionId,
        exportedAt: new Date().toISOString(),
        totalEvents: this.events.length,
        events: this.events,
      },
      null,
      2,
    );
  }

  /**
   * Export audit trail as CSV
   */
  exportCSV(): string {
    if (this.events.length === 0) return "";

    // Get all unique keys from all events
    const allKeys = new Set<string>();
    for (const event of this.events) {
      for (const key of Object.keys(event)) {
        allKeys.add(key);
      }
    }

    const headers = Array.from(allKeys);
    const rows: string[] = [];

    // Add header row
    rows.push(headers.join(","));

    // Add data rows
    for (const event of this.events) {
      const row = headers.map((header) => {
        const value = event[header as keyof AuditEvent];
        if (value === undefined || value === null) return "";
        if (typeof value === "object") return JSON.stringify(value);
        if (typeof value === "string" && value.includes(",")) {
          return `"${value}"`;
        }
        return String(value);
      });
      rows.push(row.join(","));
    }

    return rows.join("\n");
  }

  /**
   * Generate a summary report
   */
  generateSummary(): {
    sessionId: string;
    totalEvents: number;
    eventCounts: Record<string, number>;
    firstEvent?: Date;
    lastEvent?: Date;
    totalRounds: number;
    uniquePlayers: number;
  } {
    const eventCounts: Record<string, number> = {};
    const rounds = new Set<number>();
    const players = new Set<string>();

    for (const event of this.events) {
      eventCounts[event.type] = (eventCounts[event.type] || 0) + 1;

      if (event.roundNumber !== undefined) {
        rounds.add(event.roundNumber);
      }

      if ("playerId" in event && event.playerId) {
        players.add(event.playerId);
      }
    }

    return {
      sessionId: this.sessionId,
      totalEvents: this.events.length,
      eventCounts,
      firstEvent: this.events[0]?.timestamp,
      lastEvent: this.events[this.events.length - 1]?.timestamp,
      totalRounds: rounds.size,
      uniquePlayers: players.size,
    };
  }

  /**
   * Clear all events
   */
  clear(): void {
    this.events = [];
    this.currentRoundNumber = undefined;
  }

  /**
   * Get session ID
   */
  getSessionId(): string {
    return this.sessionId;
  }
}

// Singleton instance for global access
let globalAuditLogger: AuditLogger | null = null;

/**
 * Get the global audit logger instance
 */
export function getAuditLogger(): AuditLogger {
  if (!globalAuditLogger) {
    globalAuditLogger = new AuditLogger();
  }
  return globalAuditLogger;
}

/**
 * Initialize the global audit logger with options
 */
export function initAuditLogger(options: AuditLoggerOptions): AuditLogger {
  globalAuditLogger = new AuditLogger(options);
  return globalAuditLogger;
}

/**
 * Reset the global audit logger
 */
export function resetAuditLogger(): void {
  globalAuditLogger = null;
}
