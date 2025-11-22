"use client";

import { Label } from "../ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import type { TableRules } from "@/types/user";

interface BasicRulesProps {
  rules: TableRules;
  onUpdateRule: <K extends keyof TableRules>(
    key: K,
    value: TableRules[K],
  ) => void;
}

export function BasicRules({ rules, onUpdateRule }: BasicRulesProps) {
  return (
    <div className="space-y-2 sm:space-y-4">
      <h3
        className="text-base sm:text-lg font-semibold border-b pb-1 sm:pb-2"
        style={{
          color: "var(--theme-text-primary)",
          borderColor: "var(--theme-border)",
        }}
      >
        Basic Rules
      </h3>

      <div>
        <Label
          htmlFor="deckCount"
          className="text-sm"
          style={{ color: "var(--theme-text-primary)" }}
        >
          Number of Decks
        </Label>
        <Select
          value={rules.deckCount.toString()}
          onValueChange={(value) =>
            onUpdateRule("deckCount", parseInt(value, 10))
          }
        >
          <SelectTrigger
            id="deckCount"
            style={{
              background: "var(--theme-background)",
              color: "var(--theme-text-primary)",
              borderColor: "var(--theme-border)",
            }}
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="1">1 Deck</SelectItem>
            <SelectItem value="2">2 Decks</SelectItem>
            <SelectItem value="4">4 Decks</SelectItem>
            <SelectItem value="6">6 Decks</SelectItem>
            <SelectItem value="8">8 Decks</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label
          htmlFor="dealerStand"
          className="text-sm"
          style={{ color: "var(--theme-text-primary)" }}
        >
          Dealer Stand Rule
        </Label>
        <Select
          value={rules.dealerStand}
          onValueChange={(value: "s17" | "h17") =>
            onUpdateRule("dealerStand", value)
          }
        >
          <SelectTrigger
            id="dealerStand"
            style={{
              background: "var(--theme-background)",
              color: "var(--theme-text-primary)",
              borderColor: "var(--theme-border)",
            }}
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="s17">S17 (Stand on Soft 17)</SelectItem>
            <SelectItem value="h17">H17 (Hit on Soft 17)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label
          htmlFor="blackjackPayout"
          className="text-sm"
          style={{ color: "var(--theme-text-primary)" }}
        >
          Blackjack Payout
        </Label>
        <Select
          value={rules.blackjackPayout}
          onValueChange={(value: "3:2" | "6:5") =>
            onUpdateRule("blackjackPayout", value)
          }
        >
          <SelectTrigger
            id="blackjackPayout"
            style={{
              background: "var(--theme-background)",
              color: "var(--theme-text-primary)",
              borderColor: "var(--theme-border)",
            }}
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="3:2">3:2 (Standard)</SelectItem>
            <SelectItem value="6:5">6:5 (Poor odds)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label
          htmlFor="surrender"
          className="text-sm"
          style={{ color: "var(--theme-text-primary)" }}
        >
          Surrender
        </Label>
        <Select
          value={rules.surrender}
          onValueChange={(value: "none" | "late" | "early") =>
            onUpdateRule("surrender", value)
          }
        >
          <SelectTrigger
            id="surrender"
            style={{
              background: "var(--theme-background)",
              color: "var(--theme-text-primary)",
              borderColor: "var(--theme-border)",
            }}
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">Not Allowed</SelectItem>
            <SelectItem value="late">Late Surrender</SelectItem>
            <SelectItem value="early">Early Surrender</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
