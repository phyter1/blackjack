"use client";

import { useState } from "react";
import { Check } from "lucide-react";
import { CardBack, type CardBackDesign } from "@/lib/cards";
import { useThemeStore, selectThemeColors } from "@/stores/theme";
import { cn } from "@/lib/utils";
import { Label } from "./ui/label";

const AVAILABLE_DESIGNS: {
  id: CardBackDesign;
  name: string;
  description: string;
}[] = [
  {
    id: "bicycle-classic",
    name: "Bicycle Classic",
    description: "Traditional ornate pattern",
  },
  {
    id: "geometric-hexagons",
    name: "Hexagons",
    description: "Modern geometric pattern",
  },
  {
    id: "art-deco-sunburst",
    name: "Art Deco",
    description: "1920s sunburst design",
  },
  {
    id: "minimal-dots",
    name: "Minimal Dots",
    description: "Simple dot pattern",
  },
  { id: "chevron", name: "Chevron", description: "Classic zigzag pattern" },
  { id: "solid", name: "Solid", description: "Solid color" },
  { id: "svg-01", name: "Classic Blue", description: "Ornate blue design" },
  { id: "svg-02", name: "Classic Red", description: "Traditional red pattern" },
  { id: "svg-03", name: "Vintage", description: "Classic vintage style" },
  {
    id: "svg-05",
    name: "Traditional Green",
    description: "Classic green design",
  },
  { id: "svg-06", name: "Elegant", description: "Sophisticated pattern" },
  {
    id: "svg-10",
    name: "Modern Blue",
    description: "Contemporary blue design",
  },
  { id: "svg-11", name: "Royal", description: "Regal ornate pattern" },
  { id: "svg-12", name: "Premium", description: "Luxury card back" },
];

export function CardBackSelector() {
  const themeColors = useThemeStore(selectThemeColors);
  const updateCardBackDesign = useThemeStore(
    (state) => state.updateCardBackDesign,
  );
  const currentDesign = themeColors.cards?.back.design || "bicycle-classic";

  const handleDesignChange = (design: CardBackDesign) => {
    updateCardBackDesign(design);
  };

  return (
    <div className="space-y-3">
      <Label>Card Back Design</Label>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {AVAILABLE_DESIGNS.map((design) => (
          <button
            key={design.id}
            type="button"
            onClick={() => handleDesignChange(design.id)}
            className={cn(
              "relative p-2 rounded-lg border-2 transition-all",
              "hover:scale-105 cursor-pointer",
              currentDesign === design.id
                ? "border-[var(--theme-primary)] bg-[var(--theme-primary)]/10"
                : "border-[var(--theme-border)] hover:border-[var(--theme-primary)]/50",
            )}
          >
            {/* Card preview */}
            <div className="mb-2 flex justify-center">
              <CardBack
                design={design.id}
                colors={{
                  primary: themeColors.cards?.back.gradient.middle || "#991B1B",
                  secondary: themeColors.cards?.back.patternColor || "#fbbf24",
                  background:
                    themeColors.cards?.back.gradient.start || "#7c2d12",
                  border: themeColors.cards?.back.border || "#78350f",
                }}
                width={60}
                height={84}
                borderRadius={4}
              />
            </div>

            {/* Design info */}
            <div className="text-left">
              <div className="font-medium text-xs text-[var(--theme-text-primary)] flex items-center justify-between">
                {design.name}
                {currentDesign === design.id && (
                  <Check
                    className="h-4 w-4 flex-shrink-0"
                    style={{ color: "var(--theme-primary)" }}
                  />
                )}
              </div>
              <div className="text-[10px] text-[var(--theme-text-muted)] mt-0.5">
                {design.description}
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
