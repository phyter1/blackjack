#!/usr/bin/env bun

import { select, input, confirm } from "@inquirer/prompts";
import chalk from "chalk";
import { readFileSync, writeFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

interface AuditTrailFile {
  sessionId: string;
  exportedAt: string;
  totalEvents: number;
  events: any[];
}

class AuditViewer {
  private auditLogsPath = "./audit-logs";

  async start(): Promise<void> {
    console.clear();
    console.log(chalk.green.bold("═".repeat(60)));
    console.log(
      chalk.green.bold(
        "           🔍 BLACKJACK AUDIT TRAIL VIEWER 🔍           ",
      ),
    );
    console.log(chalk.green.bold("═".repeat(60)));

    while (true) {
      const action = await select({
        message: "What would you like to do?",
        choices: [
          {
            name: "View Audit Trail (from current session)",
            value: "view_current",
          },
          { name: "Load Audit Trail from JSON file", value: "load_file" },
          { name: "View Summary", value: "summary" },
          { name: "Export to CSV", value: "export_csv" },
          { name: "Filter Events", value: "filter" },
          { name: "Exit", value: "exit" },
        ],
      });

      if (action === "exit") {
        console.log(chalk.green("\n👋 Goodbye!\n"));
        break;
      }

      switch (action) {
        case "view_current":
          console.log(
            chalk.yellow("\n⚠ No current session. Please load from file.\n"),
          );
          break;
        case "load_file":
          await this.loadFromFile();
          break;
        case "summary":
          console.log(chalk.yellow("\n⚠ Load a file first.\n"));
          break;
        case "export_csv":
          console.log(chalk.yellow("\n⚠ Load a file first.\n"));
          break;
        case "filter":
          console.log(chalk.yellow("\n⚠ Load a file first.\n"));
          break;
      }
    }
  }

  private async loadFromFile(): Promise<void> {
    const filePath = await input({
      message: "Enter path to JSON audit file:",
      validate: (value) => {
        if (!value) return "Please enter a file path";
        return true;
      },
    });

    try {
      const data = readFileSync(filePath, "utf-8");
      const audit: AuditTrailFile = JSON.parse(data);

      console.log(chalk.green("\n✓ Loaded audit trail successfully!\n"));
      await this.viewAuditTrail(audit);
    } catch (error) {
      console.log(chalk.red(`\n❌ Error loading file: ${error}\n`));
    }
  }

  private async viewAuditTrail(audit: AuditTrailFile): Promise<void> {
    while (true) {
      console.log(chalk.cyan("\n" + "═".repeat(60)));
      console.log(chalk.cyan(`Session ID: ${audit.sessionId}`));
      console.log(chalk.cyan(`Total Events: ${audit.totalEvents}`));
      console.log(chalk.cyan(`Exported At: ${audit.exportedAt}`));
      console.log(chalk.cyan("═".repeat(60) + "\n"));

      const action = await select({
        message: "What would you like to do?",
        choices: [
          { name: "View All Events", value: "all" },
          { name: "View Summary by Type", value: "summary" },
          { name: "Filter by Event Type", value: "filter_type" },
          { name: "Filter by Round", value: "filter_round" },
          { name: "Export to CSV", value: "export_csv" },
          { name: "Back", value: "back" },
        ],
      });

      if (action === "back") break;

      switch (action) {
        case "all":
          this.displayAllEvents(audit.events);
          break;
        case "summary":
          this.displaySummary(audit.events);
          break;
        case "filter_type":
          await this.filterByType(audit.events);
          break;
        case "filter_round":
          await this.filterByRound(audit.events);
          break;
        case "export_csv":
          await this.exportToCSV(audit);
          break;
      }

      await this.pressEnterToContinue();
    }
  }

  private displayAllEvents(events: any[]): void {
    console.log(chalk.yellow("\n📋 All Events:\n"));
    for (const event of events.slice(0, 50)) {
      // Limit to first 50
      console.log(
        chalk.white(`[${event.timestamp}] ${chalk.cyan(event.type)}`),
      );
      console.log(chalk.gray(JSON.stringify(event, null, 2)));
      console.log(chalk.gray("-".repeat(60)));
    }

    if (events.length > 50) {
      console.log(chalk.yellow(`\n... and ${events.length - 50} more events`));
    }
  }

  private displaySummary(events: any[]): void {
    const summary: Record<string, number> = {};

    for (const event of events) {
      summary[event.type] = (summary[event.type] || 0) + 1;
    }

    console.log(chalk.yellow("\n📊 Event Summary:\n"));
    for (const [type, count] of Object.entries(summary).sort(
      (a, b) => b[1] - a[1],
    )) {
      console.log(
        chalk.cyan(
          `${type.padEnd(30)} ${chalk.white(count.toString().padStart(5))}`,
        ),
      );
    }
  }

  private async filterByType(events: any[]): Promise<void> {
    const types = [...new Set(events.map((e) => e.type))];

    const selectedType = await select({
      message: "Select event type:",
      choices: types.map((type) => ({ name: type, value: type })),
    });

    const filtered = events.filter((e) => e.type === selectedType);

    console.log(
      chalk.yellow(
        `\n🔍 Found ${filtered.length} events of type "${selectedType}":\n`,
      ),
    );
    for (const event of filtered.slice(0, 20)) {
      console.log(chalk.white(JSON.stringify(event, null, 2)));
      console.log(chalk.gray("-".repeat(60)));
    }

    if (filtered.length > 20) {
      console.log(
        chalk.yellow(`\n... and ${filtered.length - 20} more events`),
      );
    }
  }

  private async filterByRound(events: any[]): Promise<void> {
    const rounds = [
      ...new Set(
        events.map((e) => e.roundNumber).filter((r) => r !== undefined),
      ),
    ];

    const selectedRound = await select({
      message: "Select round number:",
      choices: rounds.map((round) => ({
        name: `Round ${round}`,
        value: round,
      })),
    });

    const filtered = events.filter((e) => e.roundNumber === selectedRound);

    console.log(
      chalk.yellow(
        `\n🔍 Found ${filtered.length} events for Round ${selectedRound}:\n`,
      ),
    );
    for (const event of filtered) {
      console.log(
        chalk.white(`[${event.timestamp}] ${chalk.cyan(event.type)}`),
      );
      console.log(chalk.gray(JSON.stringify(event, null, 2)));
      console.log(chalk.gray("-".repeat(60)));
    }
  }

  private async exportToCSV(audit: AuditTrailFile): Promise<void> {
    const filename = `audit-${audit.sessionId}-${Date.now()}.csv`;

    // Simple CSV export
    const headers = Object.keys(audit.events[0] || {});
    const rows = [headers.join(",")];

    for (const event of audit.events) {
      const row = headers.map((h) => {
        const val = event[h];
        if (val === undefined || val === null) return "";
        if (typeof val === "object")
          return JSON.stringify(val).replace(/"/g, '""');
        if (typeof val === "string" && val.includes(",")) return `"${val}"`;
        return val;
      });
      rows.push(row.join(","));
    }

    try {
      writeFileSync(filename, rows.join("\n"));
      console.log(chalk.green(`\n✓ Exported to ${filename}\n`));
    } catch (error) {
      console.log(chalk.red(`\n❌ Error exporting: ${error}\n`));
    }
  }

  private async pressEnterToContinue(): Promise<void> {
    await input({
      message: "Press Enter to continue...",
    });
  }
}

// Run the viewer
const viewer = new AuditViewer();
viewer.start().catch(console.error);
