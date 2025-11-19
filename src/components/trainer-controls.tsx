"use client";

import { useTrainerMode } from "@/hooks/use-trainer-mode";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { GraduationCap, RotateCcw } from "lucide-react";
import type { TrainerDifficulty } from "@/modules/strategy/trainer";

export function TrainerControls() {
  const {
    isActive,
    difficulty,
    practiceBalance,
    activateTrainer,
    deactivateTrainer,
    setDifficulty,
    resetTrainer,
  } = useTrainerMode();

  const handleToggle = (checked: boolean) => {
    if (checked) {
      activateTrainer();
    } else {
      deactivateTrainer();
    }
  };

  const handleDifficultyChange = (value: string) => {
    setDifficulty(value as TrainerDifficulty);
  };

  return (
    <Card className="bg-gradient-to-br from-blue-950/90 to-purple-950/90 border-blue-500/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-blue-200">
          <GraduationCap className="w-5 h-5" />
          Trainer Mode
        </CardTitle>
        <CardDescription className="text-blue-300/70">
          Practice counting and perfect basic strategy
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Toggle Trainer Mode */}
        <div className="flex items-center justify-between">
          <Label htmlFor="trainer-mode" className="text-blue-100">
            Enable Trainer
          </Label>
          <Switch
            id="trainer-mode"
            checked={isActive}
            onCheckedChange={handleToggle}
          />
        </div>

        {/* Difficulty Level */}
        {isActive && (
          <>
            <div className="space-y-2">
              <Label htmlFor="difficulty" className="text-blue-100">
                Difficulty
              </Label>
              <Select value={difficulty} onValueChange={handleDifficultyChange}>
                <SelectTrigger
                  id="difficulty"
                  className="bg-blue-950/50 border-blue-500/30 text-blue-100"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-blue-950 border-blue-500/30">
                  <SelectItem value="beginner" className="text-blue-100">
                    Beginner (with hints)
                  </SelectItem>
                  <SelectItem value="running_count" className="text-blue-100">
                    Running Count Practice
                  </SelectItem>
                  <SelectItem value="true_count" className="text-blue-100">
                    True Count Practice
                  </SelectItem>
                  <SelectItem value="expert" className="text-blue-100">
                    Expert (no hints)
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Practice Balance */}
            <div className="flex items-center justify-between text-sm">
              <span className="text-blue-200">Practice Balance:</span>
              <span className="font-bold text-green-400">
                ${practiceBalance.toLocaleString()}
              </span>
            </div>

            {/* Reset Button */}
            <Button
              onClick={resetTrainer}
              variant="outline"
              size="sm"
              className="w-full border-blue-500/30 bg-blue-950/50 text-blue-100 hover:bg-blue-900/50"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Reset Session
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
}
