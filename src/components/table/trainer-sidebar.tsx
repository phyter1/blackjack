"use client";

import { GraduationCap } from "lucide-react";
import { CountingPanel } from "@/components/counting-panel";
import { StrategyFeedback } from "@/components/strategy-feedback";
import { TrainerControls } from "@/components/trainer-controls";
import { TrainerStatsPanel } from "@/components/trainer-stats-panel";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface TrainerSidebarProps {
  isActive: boolean;
  onClose: () => void;
}

export function TrainerSidebar({ isActive, onClose }: TrainerSidebarProps) {
  return (
    <div
      className={cn(
        // Mobile: Bottom drawer
        "fixed inset-x-0 bottom-0 left-0 right-0",
        // Desktop: Right sidebar
        "md:right-0 md:left-auto md:top-0 md:bottom-auto md:inset-y-0",
        // Heights: 70vh on mobile, full height on desktop
        "h-[70vh] md:h-full",
        // Widths: Full width on mobile, 384px on desktop
        "w-full md:w-96",
        // Borders: Top border on mobile, left border on desktop
        "border-t md:border-t-0 md:border-l",
        // Rounded corners on mobile only
        "rounded-t-2xl md:rounded-none",
        // Common styles
        "p-4 overflow-y-auto z-50 backdrop-blur-sm",
        // Smooth slide animation (always visible on desktop, slide from bottom on mobile)
        "transition-transform duration-300",
        "translate-y-0 md:translate-y-0"
      )}
      style={{
        background: `linear-gradient(to left, var(--theme-dashboard-bg), var(--theme-dashboard-card))`,
        borderColor: "var(--theme-primary)",
      }}
    >
      <div className="space-y-4">
        <div className="flex items-center justify-between mb-6">
          <h2
            className="text-xl font-bold flex items-center gap-2"
            style={{ color: "var(--theme-primary)" }}
          >
            <GraduationCap className="w-6 h-6" />
            Trainer Mode
          </h2>
          <Button
            onClick={onClose}
            variant="ghost"
            size="sm"
            style={{ color: "var(--theme-primary)" }}
            className="hover:opacity-80"
          >
            ✕
          </Button>
        </div>

        <TrainerControls />

        {isActive && (
          <>
            <div className="space-y-3">
              <StrategyFeedback />
            </div>
            <CountingPanel />
            <TrainerStatsPanel />
          </>
        )}
      </div>
    </div>
  );
}
