"use client";

import { CANONICAL_DENOMS } from "@/modules/chip";
import { getChipColor } from "@/components/casino-chip";
import { DenomChip } from "@/components/chips";
import { Button } from "../ui/button";
import { Label } from "../ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";

interface ChipConfigurationProps {
  chipDenominations: number[];
  showChipConfig: boolean;
  selectedDenom: string;
  chipError: string | null;
  onToggleShow: () => void;
  onSelectedDenomChange: (value: string) => void;
  onAddChip: () => void;
  onRemoveChip: (value: number) => void;
  onResetChips: () => void;
}

export function ChipConfiguration({
  chipDenominations,
  showChipConfig,
  selectedDenom,
  chipError,
  onToggleShow,
  onSelectedDenomChange,
  onAddChip,
  onRemoveChip,
  onResetChips,
}: ChipConfigurationProps) {
  const getAvailableDenominations = () => {
    return CANONICAL_DENOMS.filter(
      (denom) => !chipDenominations.includes(denom),
    );
  };

  return (
    <div className="space-y-2 sm:space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-base sm:text-lg font-semibold text-white border-b border-gray-700 pb-1 sm:pb-2 flex-1">
          Chip Denominations
        </h3>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onToggleShow}
          className="text-blue-400 hover:text-blue-300 ml-2"
        >
          {showChipConfig ? "Hide" : "Customize"}
        </Button>
      </div>

      {/* Show current chips */}
      <div className="flex flex-wrap gap-2">
        {chipDenominations.map((denom) => (
          <div
            key={denom}
            className="px-3 py-1.5 bg-gradient-to-br from-amber-600 to-amber-800 rounded-full text-white font-bold text-sm shadow-lg border-2 border-amber-400"
          >
            ${denom}
          </div>
        ))}
      </div>

      {showChipConfig && (
        <div className="space-y-3 p-3 bg-blue-950/20 rounded border border-blue-800">
          <p className="text-xs text-blue-300">
            Select from authentic casino chip denominations with exact color
            matching. Only canonical denominations ($0.01, $0.05, $0.25, $0.50,
            $1, $5, $25, $100, $500, $1000, $5000, $10000) are available.
          </p>

          <div className="flex gap-2">
            <div className="flex-1">
              <Label
                htmlFor="chipValue"
                className="text-sm"
                style={{ color: "var(--theme-text-primary)" }}
              >
                Add Chip Denomination
              </Label>
              <div className="flex gap-2">
                <Select value={selectedDenom} onValueChange={onSelectedDenomChange}>
                  <SelectTrigger
                    id="chipValue"
                    className="bg-gray-800 text-white border-gray-700 flex-1"
                  >
                    <SelectValue placeholder="Select denomination..." />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-700">
                    {getAvailableDenominations().map((denom) => (
                      <SelectItem
                        key={denom}
                        value={denom.toString()}
                        className="text-white hover:bg-gray-700"
                      >
                        ${denom >= 1 ? denom.toString() : denom.toFixed(2)}
                      </SelectItem>
                    ))}
                    {getAvailableDenominations().length === 0 && (
                      <SelectItem
                        value="none"
                        disabled
                        className="text-gray-500"
                      >
                        No more denominations available
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
                <Button
                  type="button"
                  onClick={onAddChip}
                  size="sm"
                  className="bg-blue-600 hover:bg-blue-700"
                  disabled={
                    !selectedDenom || getAvailableDenominations().length === 0
                  }
                >
                  Add
                </Button>
              </div>
            </div>
          </div>

          {chipError && (
            <div className="text-sm text-red-400 bg-red-950/30 px-3 py-2 rounded border border-red-800">
              {chipError}
            </div>
          )}

          {/* Current chips with remove buttons */}
          <div>
            <Label className="text-white text-sm mb-2 block">
              Current Chips ({chipDenominations.length}/7)
            </Label>
            <div className="flex flex-wrap gap-3">
              {chipDenominations.map((denom) => {
                const chipColors = getChipColor(denom);
                return (
                  <div
                    key={denom}
                    className="relative group"
                    title="Click to remove"
                  >
                    <div
                      onClick={() => onRemoveChip(denom)}
                      className="cursor-pointer transition-all group-hover:scale-110 group-hover:brightness-75"
                    >
                      <DenomChip
                        value={denom}
                        primary={chipColors.primary}
                        secondary={chipColors.secondary}
                        center={chipColors.center}
                        textColor={chipColors.textColor}
                        size={72}
                      />
                    </div>
                    <div className="absolute -top-1 -right-1 bg-red-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity shadow-lg">
                      ×
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              type="button"
              onClick={onResetChips}
              variant="outline"
              size="sm"
              className="border-gray-600 text-gray-400 hover:text-white"
            >
              Reset to Defaults
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
