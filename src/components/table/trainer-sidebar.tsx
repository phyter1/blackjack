"use client";

import { GraduationCap } from "lucide-react";
import { CountingPanel } from "@/components/counting-panel";
import { StrategyFeedback } from "@/components/strategy-feedback";
import { TrainerControls } from "@/components/trainer-controls";
import { TrainerStatsPanel } from "@/components/trainer-stats-panel";
import { Button } from "@/components/ui/button";

interface TrainerSidebarProps {
  isActive: boolean;
  onClose: () => void;
}

export function TrainerSidebar({ isActive, onClose }: TrainerSidebarProps) {
  return (
    <div className="fixed right-0 top-0 h-full w-96 bg-linear-to-l from-black/95 to-black/85 border-l border-blue-500/30 p-4 overflow-y-auto z-50 backdrop-blur-sm">
      <div className="space-y-4">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-blue-200 flex items-center gap-2">
            <GraduationCap className="w-6 h-6" />
            Trainer Mode
          </h2>
          <Button
            onClick={onClose}
            variant="ghost"
            size="sm"
            className="text-blue-200 hover:text-blue-100"
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
