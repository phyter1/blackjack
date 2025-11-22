"use client";

import { Label } from "../ui/label";
import { Input } from "../ui/input";
import type { TableRules } from "@/types/user";

interface TableLimitsProps {
  rules: TableRules;
  onUpdateRule: <K extends keyof TableRules>(
    key: K,
    value: TableRules[K],
  ) => void;
}

export function TableLimits({ rules, onUpdateRule }: TableLimitsProps) {
  return (
    <div className="space-y-2 sm:space-y-4">
      <h3
        className="text-base sm:text-lg font-semibold border-b pb-1 sm:pb-2"
        style={{
          color: "var(--theme-text-primary)",
          borderColor: "var(--theme-border)",
        }}
      >
        Table Limits
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-4">
        <div>
          <Label
            htmlFor="minBet"
            className="text-sm"
            style={{ color: "var(--theme-text-primary)" }}
          >
            Minimum Bet
          </Label>
          <div className="flex items-center gap-1">
            <span
              className="text-sm"
              style={{ color: "var(--theme-text-primary)" }}
            >
              $
            </span>
            <Input
              id="minBet"
              type="number"
              min={1}
              max={10000}
              value={rules.minBet || 5}
              onChange={(e) =>
                onUpdateRule("minBet", parseInt(e.target.value, 10) || 5)
              }
              style={{
                background: "var(--theme-background)",
                color: "var(--theme-text-primary)",
                borderColor: "var(--theme-border)",
              }}
            />
          </div>
        </div>

        <div>
          <Label
            htmlFor="maxBet"
            className="text-sm"
            style={{ color: "var(--theme-text-primary)" }}
          >
            Maximum Bet
          </Label>
          <div className="flex items-center gap-1">
            <span
              className="text-sm"
              style={{ color: "var(--theme-text-primary)" }}
            >
              $
            </span>
            <Input
              id="maxBet"
              type="number"
              min={10}
              max={1000000}
              value={rules.maxBet || 1000}
              onChange={(e) =>
                onUpdateRule("maxBet", parseInt(e.target.value, 10) || 1000)
              }
              style={{
                background: "var(--theme-background)",
                color: "var(--theme-text-primary)",
                borderColor: "var(--theme-border)",
              }}
            />
          </div>
        </div>

        <div>
          <Label
            htmlFor="betUnit"
            className="text-sm"
            style={{ color: "var(--theme-text-primary)" }}
          >
            Bet Unit
          </Label>
          <div className="flex items-center gap-1">
            <span
              className="text-sm"
              style={{ color: "var(--theme-text-primary)" }}
            >
              $
            </span>
            <Input
              id="betUnit"
              type="number"
              min={1}
              max={1000}
              value={rules.betUnit || 5}
              onChange={(e) =>
                onUpdateRule("betUnit", parseInt(e.target.value, 10) || 5)
              }
              style={{
                background: "var(--theme-background)",
                color: "var(--theme-text-primary)",
                borderColor: "var(--theme-border)",
              }}
            />
          </div>
        </div>
      </div>
      <p className="text-xs" style={{ color: "var(--theme-text-muted)" }}>
        All bets must be multiples of the bet unit and within the table limits
      </p>
    </div>
  );
}
