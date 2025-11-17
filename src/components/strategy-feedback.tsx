"use client";

import { useTrainerMode } from "@/hooks/use-trainer-mode";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { CheckCircle2, XCircle, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

export function StrategyFeedback() {
  const { currentActionFeedback, isActive } = useTrainerMode();

  if (!isActive || !currentActionFeedback) return null;

  const { wasCorrect, explanation, severity } = currentActionFeedback;

  const icons = {
    success: CheckCircle2,
    warning: AlertTriangle,
    error: XCircle,
  };

  const Icon = icons[severity];

  const colors = {
    success: "border-green-500/50 bg-green-950/50 text-green-200",
    warning: "border-yellow-500/50 bg-yellow-950/50 text-yellow-200",
    error: "border-red-500/50 bg-red-950/50 text-red-200",
  };

  return (
    <Alert className={cn("animate-in fade-in-50 duration-300", colors[severity])}>
      <Icon className="h-4 w-4" />
      <AlertTitle className="font-semibold">
        {wasCorrect ? "Correct Play!" : "Incorrect Play"}
      </AlertTitle>
      <AlertDescription className="text-sm opacity-90">
        {explanation}
      </AlertDescription>
    </Alert>
  );
}
