"use client";

import { Label } from "../ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Switch } from "../ui/switch";
import type { TableRules } from "@/types/user";

interface AdvancedRulesProps {
  rules: TableRules;
  onUpdateRule: <K extends keyof TableRules>(
    key: K,
    value: TableRules[K],
  ) => void;
}

export function AdvancedRules({ rules, onUpdateRule }: AdvancedRulesProps) {
  return (
    <div className="space-y-2 sm:space-y-4">
      <h3
        className="text-base sm:text-lg font-semibold border-b pb-1 sm:pb-2"
        style={{
          color: "var(--theme-text-primary)",
          borderColor: "var(--theme-border)",
        }}
      >
        Advanced Rules
      </h3>

      <div>
        <Label
          htmlFor="doubleRestriction"
          className="text-sm"
          style={{ color: "var(--theme-text-primary)" }}
        >
          Double Down Restriction
        </Label>
        <Select
          value={rules.doubleRestriction}
          onValueChange={(value: "any" | "9-11" | "10-11" | "11") =>
            onUpdateRule("doubleRestriction", value)
          }
        >
          <SelectTrigger
            id="doubleRestriction"
            style={{
              background: "var(--theme-background)",
              color: "var(--theme-text-primary)",
              borderColor: "var(--theme-border)",
            }}
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="any">Any Two Cards</SelectItem>
            <SelectItem value="9-11">9, 10, or 11 Only</SelectItem>
            <SelectItem value="10-11">10 or 11 Only</SelectItem>
            <SelectItem value="11">11 Only</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label
          htmlFor="maxSplits"
          className="text-sm"
          style={{ color: "var(--theme-text-primary)" }}
        >
          Maximum Splits
        </Label>
        <Select
          value={rules.maxSplits.toString()}
          onValueChange={(value) =>
            onUpdateRule("maxSplits", parseInt(value, 10))
          }
        >
          <SelectTrigger
            id="maxSplits"
            style={{
              background: "var(--theme-background)",
              color: "var(--theme-text-primary)",
              borderColor: "var(--theme-border)",
            }}
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="1">1 Split (2 hands)</SelectItem>
            <SelectItem value="2">2 Splits (3 hands)</SelectItem>
            <SelectItem value="3">3 Splits (4 hands)</SelectItem>
            <SelectItem value="4">4 Splits (5 hands)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label
          htmlFor="maxPlayableHands"
          className="text-sm"
          style={{ color: "var(--theme-text-primary)" }}
        >
          Max Playable Hands
        </Label>
        <Select
          value={(rules.maxPlayableHands || 5).toString()}
          onValueChange={(value) =>
            onUpdateRule("maxPlayableHands", parseInt(value, 10))
          }
        >
          <SelectTrigger
            id="maxPlayableHands"
            style={{
              background: "var(--theme-background)",
              color: "var(--theme-text-primary)",
              borderColor: "var(--theme-border)",
            }}
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="1">1 Hand</SelectItem>
            <SelectItem value="2">2 Hands</SelectItem>
            <SelectItem value="3">3 Hands</SelectItem>
            <SelectItem value="4">4 Hands</SelectItem>
            <SelectItem value="5">5 Hands</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div
        className="flex items-center justify-between p-2 sm:p-3 rounded"
        style={{ background: "var(--theme-dashboard-bg)" }}
      >
        <Label
          htmlFor="das"
          className="text-sm"
          style={{ color: "var(--theme-text-primary)" }}
        >
          Double After Split (DAS)
        </Label>
        <Switch
          id="das"
          checked={rules.doubleAfterSplit}
          onCheckedChange={(checked) =>
            onUpdateRule("doubleAfterSplit", checked)
          }
        />
      </div>

      <div
        className="flex items-center justify-between p-2 sm:p-3 rounded"
        style={{ background: "var(--theme-dashboard-bg)" }}
      >
        <Label
          htmlFor="rsa"
          className="text-sm"
          style={{ color: "var(--theme-text-primary)" }}
        >
          Resplit Aces
        </Label>
        <Switch
          id="rsa"
          checked={rules.resplitAces}
          onCheckedChange={(checked) => onUpdateRule("resplitAces", checked)}
        />
      </div>

      <div
        className="flex items-center justify-between p-2 sm:p-3 rounded"
        style={{ background: "var(--theme-dashboard-bg)" }}
      >
        <Label
          htmlFor="hsa"
          className="text-sm"
          style={{ color: "var(--theme-text-primary)" }}
        >
          Hit Split Aces
        </Label>
        <Switch
          id="hsa"
          checked={rules.hitSplitAces}
          onCheckedChange={(checked) => onUpdateRule("hitSplitAces", checked)}
        />
      </div>
    </div>
  );
}
