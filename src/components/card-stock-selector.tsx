"use client";

import { useState } from "react";
import { Check } from "lucide-react";
import { useThemeStore } from "@/stores/theme";
import { cn } from "@/lib/utils";
import { Label } from "./ui/label";

const STOCK_COLORS = [
  { id: "dark", name: "Dark", color: "#1a1a1a", description: "Classic dark edge" },
  { id: "black", name: "Black", color: "#000000", description: "Pure black" },
  { id: "charcoal", name: "Charcoal", color: "#2d2d2d", description: "Soft charcoal" },
  { id: "navy", name: "Navy", color: "#1e3a8a", description: "Dark navy blue" },
  { id: "burgundy", name: "Burgundy", color: "#7f1d1d", description: "Deep red" },
  { id: "forest", name: "Forest", color: "#14532d", description: "Dark green" },
  { id: "slate", name: "Slate", color: "#1e293b", description: "Blue-gray" },
  { id: "ivory", name: "Ivory", color: "#fffbeb", description: "Warm white" },
  { id: "cream", name: "Cream", color: "#fef3c7", description: "Pale cream" },
  { id: "pearl", name: "Pearl", color: "#f5f5f4", description: "Light gray" },
  { id: "mint", name: "Mint", color: "#ecfdf5", description: "Light mint" },
  { id: "gold", name: "Gold", color: "#ca8a04", description: "Metallic gold" },
];

export function CardStockSelector() {
  const theme = useThemeStore((state) => state.theme);
  const updateThemeColors = useThemeStore((state) => state.updateThemeColors);
  const currentStockColor = theme.colors.cards.stock?.color || "#1a1a1a";

  const handleStockColorChange = (color: string) => {
    updateThemeColors({
      cards: {
        ...theme.colors.cards,
        stock: {
          color,
        },
      },
    });
  };

  return (
    <div className="space-y-3">
      <Label>Card Stock Color</Label>
      <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
        {STOCK_COLORS.map((stock) => (
          <button
            key={stock.id}
            type="button"
            onClick={() => handleStockColorChange(stock.color)}
            className={cn(
              "relative p-2 rounded-lg border-2 transition-all",
              "hover:scale-105 cursor-pointer",
              currentStockColor === stock.color
                ? "border-[var(--theme-primary)] bg-[var(--theme-primary)]/10"
                : "border-[var(--theme-border)] hover:border-[var(--theme-primary)]/50",
            )}
          >
            {/* Color preview */}
            <div className="mb-1.5 flex justify-center">
              <div
                className="w-full h-8 rounded border-2 border-black/20"
                style={{ backgroundColor: stock.color }}
              />
            </div>

            {/* Stock info */}
            <div className="text-left">
              <div className="font-medium text-xs text-[var(--theme-text-primary)] flex items-center justify-between">
                {stock.name}
                {currentStockColor === stock.color && (
                  <Check
                    className="h-3 w-3 flex-shrink-0"
                    style={{ color: "var(--theme-primary)" }}
                  />
                )}
              </div>
              <div className="text-[9px] text-[var(--theme-text-muted)] mt-0.5">
                {stock.description}
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
