"use client";

import { useTrainerMode } from "@/hooks/use-trainer-mode";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { BarChart3, TrendingUp, Brain, Hash } from "lucide-react";

export function TrainerStatsPanel() {
  const { stats, isActive, difficulty } = useTrainerMode();

  if (!isActive || !stats) return null;

  const shouldShowCounting =
    difficulty === "running_count" ||
    difficulty === "true_count" ||
    difficulty === "expert";

  const getGradeColor = (grade: string) => {
    if (grade.startsWith("A")) return "bg-green-600";
    if (grade.startsWith("B")) return "bg-blue-600";
    if (grade.startsWith("C")) return "bg-yellow-600";
    if (grade.startsWith("D")) return "bg-orange-600";
    return "bg-red-600";
  };

  return (
    <Card className="bg-gradient-to-br from-slate-950/90 to-slate-900/90 border-slate-500/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-slate-200">
          <BarChart3 className="w-5 h-5" />
          Performance Statistics
        </CardTitle>
        <CardDescription className="text-slate-300/70">
          Your training progress
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Strategy Performance */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Brain className="w-4 h-4 text-blue-400" />
              <span className="text-sm font-medium text-slate-200">
                Strategy Accuracy
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Badge className={getGradeColor(stats.grade)}>
                {stats.grade}
              </Badge>
              <span className="text-sm font-bold text-slate-100">
                {stats.strategyAccuracy.toFixed(1)}%
              </span>
            </div>
          </div>
          <Progress value={stats.strategyAccuracy} className="h-2" />
          <div className="text-xs text-slate-400">
            {stats.correctDecisions} / {stats.totalDecisions} correct decisions
          </div>
        </div>

        {/* Recent Performance */}
        {stats.totalDecisions >= 10 && (
          <>
            <Separator className="bg-slate-700/50" />
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-green-400" />
                  <span className="text-sm font-medium text-slate-200">
                    Recent (Last 10)
                  </span>
                </div>
                <span className="text-sm font-bold text-slate-100">
                  {stats.recentAccuracy.toFixed(1)}%
                </span>
              </div>
              <Progress value={stats.recentAccuracy} className="h-2" />
            </div>
          </>
        )}

        {/* By Hand Type */}
        {stats.totalDecisions >= 5 && (
          <>
            <Separator className="bg-slate-700/50" />
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-slate-200">
                Accuracy by Hand Type
              </h4>

              {/* Hard Hands */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-300">Hard Hands</span>
                  <span className="text-slate-100 font-medium">
                    {stats.hardHandAccuracy.toFixed(0)}%
                  </span>
                </div>
                <Progress value={stats.hardHandAccuracy} className="h-1.5" />
              </div>

              {/* Soft Hands */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-300">Soft Hands</span>
                  <span className="text-slate-100 font-medium">
                    {stats.softHandAccuracy.toFixed(0)}%
                  </span>
                </div>
                <Progress value={stats.softHandAccuracy} className="h-1.5" />
              </div>

              {/* Pairs */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-300">Pairs</span>
                  <span className="text-slate-100 font-medium">
                    {stats.pairAccuracy.toFixed(0)}%
                  </span>
                </div>
                <Progress value={stats.pairAccuracy} className="h-1.5" />
              </div>
            </div>
          </>
        )}

        {/* Counting Performance */}
        {shouldShowCounting && stats.totalCountGuesses > 0 && (
          <>
            <Separator className="bg-slate-700/50" />
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Hash className="w-4 h-4 text-purple-400" />
                <h4 className="text-sm font-medium text-slate-200">
                  Counting Accuracy
                </h4>
              </div>

              {/* Running Count */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-300">Running Count</span>
                  <span className="text-slate-100 font-medium">
                    {stats.runningCountAccuracy.toFixed(0)}%
                  </span>
                </div>
                <Progress
                  value={stats.runningCountAccuracy}
                  className="h-1.5"
                />
                <div className="text-xs text-slate-400">
                  {stats.correctRunningCounts} / {stats.totalCountGuesses}{" "}
                  correct
                </div>
              </div>

              {/* True Count (if applicable) */}
              {difficulty === "true_count" && stats.trueCountAccuracy > 0 && (
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-300">True Count</span>
                    <span className="text-slate-100 font-medium">
                      {stats.trueCountAccuracy.toFixed(0)}%
                    </span>
                  </div>
                  <Progress value={stats.trueCountAccuracy} className="h-1.5" />
                  <div className="text-xs text-slate-400">
                    {stats.correctTrueCounts} correct
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
