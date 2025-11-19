"use client";

import { useState } from "react";
import { useTrainerMode } from "@/hooks/use-trainer-mode";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Calculator, CheckCircle2, XCircle, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

export function CountingPanel() {
  const { trainer, isActive, difficulty, currentCountFeedback, refreshStats } =
    useTrainerMode();

  const [runningCount, setRunningCount] = useState("");
  const [trueCount, setTrueCount] = useState("");

  const shouldShowTrueCount =
    difficulty === "true_count" || difficulty === "expert";
  const shouldTrackCounting = trainer?.shouldTrackCounting() ?? false;

  const handleSubmit = () => {
    if (!trainer || !runningCount) return;

    const running = parseInt(runningCount, 10);
    const trueCnt = trueCount ? parseInt(trueCount, 10) : undefined;

    if (isNaN(running)) return;
    if (shouldShowTrueCount && trueCnt !== undefined && isNaN(trueCnt)) return;

    trainer.submitCountGuess(running, trueCnt);
    refreshStats();

    // Clear inputs
    setRunningCount("");
    setTrueCount("");
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSubmit();
    }
  };

  if (!isActive || !shouldTrackCounting) return null;

  const icons = {
    success: CheckCircle2,
    warning: AlertTriangle,
    error: XCircle,
  };

  const Icon = currentCountFeedback
    ? icons[currentCountFeedback.severity]
    : null;

  const colors = {
    success: "border-green-500/50 bg-green-950/50 text-green-200",
    warning: "border-yellow-500/50 bg-yellow-950/50 text-yellow-200",
    error: "border-red-500/50 bg-red-950/50 text-red-200",
  };

  return (
    <div className="space-y-3">
      <Card className="bg-gradient-to-br from-purple-950/90 to-blue-950/90 border-purple-500/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-purple-200">
            <Calculator className="w-5 h-5" />
            Card Counting
          </CardTitle>
          <CardDescription className="text-purple-300/70">
            Enter your count after each hand
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Running Count Input */}
          <div className="space-y-2">
            <Label htmlFor="running-count" className="text-purple-100">
              Running Count
            </Label>
            <Input
              id="running-count"
              type="number"
              placeholder="Enter running count"
              value={runningCount}
              onChange={(e) => setRunningCount(e.target.value)}
              onKeyPress={handleKeyPress}
              className="bg-purple-950/50 border-purple-500/30 text-purple-100 placeholder:text-purple-400/50"
            />
          </div>

          {/* True Count Input (if applicable) */}
          {shouldShowTrueCount && (
            <div className="space-y-2">
              <Label htmlFor="true-count" className="text-purple-100">
                True Count
              </Label>
              <Input
                id="true-count"
                type="number"
                placeholder="Enter true count"
                value={trueCount}
                onChange={(e) => setTrueCount(e.target.value)}
                onKeyPress={handleKeyPress}
                className="bg-purple-950/50 border-purple-500/30 text-purple-100 placeholder:text-purple-400/50"
              />
            </div>
          )}

          {/* Submit Button */}
          <Button
            onClick={handleSubmit}
            disabled={!runningCount}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white"
          >
            Submit Count
          </Button>
        </CardContent>
      </Card>

      {/* Count Feedback */}
      {currentCountFeedback && Icon && (
        <Alert
          className={cn(
            "animate-in fade-in-50 duration-300",
            colors[currentCountFeedback.severity],
          )}
        >
          <Icon className="h-4 w-4" />
          <AlertDescription className="text-sm opacity-90">
            {currentCountFeedback.message}
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
