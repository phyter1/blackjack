"use client";

import { cn } from "@/lib/utils";

interface EdgeGradientProps {
  position: "top" | "bottom";
}

function EdgeGradient({ position }: EdgeGradientProps) {
  return (
    <div
      className={cn(
        "absolute left-0 right-0 h-22 border-4",
        position === "top" ? "top-0 border-b-4 border-t-0 border-x-0" : "bottom-0 border-t-4 border-b-0 border-x-0"
      )}
      style={{
        background: `linear-gradient(${position === "top" ? "180deg" : "0deg"}, var(--theme-table-edge) 0%, transparent 100%)`,
        borderColor: "var(--theme-table-edge-accent)",
      }}
    />
  );
}

export function TableBackground() {
  return (
    <div
      className="absolute inset-0"
      style={{
        background:
          "radial-gradient(ellipse at center, var(--theme-table-felt-start) 0%, var(--theme-table-felt-end) 100%)",
      }}
    >
      {/* Table edge gradients - wood grain effect */}
      <EdgeGradient position="top" />
      <EdgeGradient position="bottom" />
    </div>
  );
}
