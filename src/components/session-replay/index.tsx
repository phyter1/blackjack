"use client";

import { X } from "lucide-react";
import { useEffect, useState } from "react";
import type { PlayerDecision } from "@/modules/strategy/decision-tracker";
import type { GameSession } from "@/types/user";
import { Button } from "../ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { CountInfo } from "./count-info";
import { DecisionDisplay } from "./decision-display";
import { FinancialMetrics } from "./financial-metrics";
import { NavigationControls } from "./navigation-controls";
import { SessionSummary } from "./session-summary";

interface SessionReplayProps {
  session: GameSession;
  onClose: () => void;
}

export function SessionReplay({ session, onClose }: SessionReplayProps) {
  const [decisions, setDecisions] = useState<PlayerDecision[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    // Parse decisions from JSON
    if (session.decisionsData) {
      try {
        const parsed = JSON.parse(session.decisionsData) as PlayerDecision[];
        setDecisions(parsed);
      } catch (error) {
        console.error("Failed to parse decisions data:", error);
      }
    }
  }, [session.decisionsData]);

  useEffect(() => {
    // Auto-play functionality
    if (isPlaying && currentIndex < decisions.length - 1) {
      const timer = setTimeout(() => {
        setCurrentIndex((prev) => prev + 1);
      }, 2000); // Advance every 2 seconds
      return () => clearTimeout(timer);
    } else if (isPlaying && currentIndex >= decisions.length - 1) {
      setIsPlaying(false);
    }
  }, [isPlaying, currentIndex, decisions.length]);

  const handlePrevious = () => {
    setCurrentIndex((prev) => Math.max(0, prev - 1));
    setIsPlaying(false);
  };

  const handleNext = () => {
    setCurrentIndex((prev) => Math.min(decisions.length - 1, prev + 1));
    setIsPlaying(false);
  };

  const handlePlayPause = () => {
    if (currentIndex >= decisions.length - 1) {
      setCurrentIndex(0);
    }
    setIsPlaying((prev) => !prev);
  };

  if (decisions.length === 0) {
    return (
      <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50">
        <Card className="bg-gray-900 border-green-500 max-w-lg w-full mx-4">
          <CardHeader>
            <CardTitle className="text-green-500">Session Replay</CardTitle>
            <CardDescription>
              No decision data available for this session
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={onClose}
              variant="outline"
              className="w-full border-gray-700"
            >
              Close
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const currentDecision = decisions[currentIndex];

  return (
    <div className="fixed inset-0 bg-black/95 overflow-y-auto z-50">
      <div className="p-4">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-3xl font-bold text-green-500">
                Session Replay
              </h1>
              <p className="text-gray-400">
                {new Date(session.startTime).toLocaleString()}
              </p>
            </div>
            <Button
              onClick={onClose}
              variant="ghost"
              className="text-gray-400 hover:text-white"
            >
              <X className="w-6 h-6" />
            </Button>
          </div>

          {/* Session Summary */}
          <SessionSummary session={session} decisions={decisions} />

          {/* Decision Display */}
          <DecisionDisplay
            decision={currentDecision}
            index={currentIndex}
            total={decisions.length}
          />

          {/* Financial Metrics (inside DecisionDisplay's card) */}
          <Card className="bg-gray-900 border-green-500 mb-6">
            <CardContent className="pt-6">
              <FinancialMetrics decision={currentDecision} />
              <CountInfo countSnapshot={currentDecision.countSnapshot} />
            </CardContent>
          </Card>

          {/* Navigation Controls */}
          <NavigationControls
            currentIndex={currentIndex}
            totalDecisions={decisions.length}
            isPlaying={isPlaying}
            onPrevious={handlePrevious}
            onNext={handleNext}
            onPlayPause={handlePlayPause}
          />
        </div>
      </div>
    </div>
  );
}
