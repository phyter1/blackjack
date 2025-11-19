"use client";

import { Card, CardContent } from "../ui/card";
import type { GameSession } from "@/types/user";
import type { PlayerDecision } from "@/modules/strategy/decision-tracker";

interface SessionSummaryProps {
  session: GameSession;
  decisions: PlayerDecision[];
}

export function SessionSummary({ session, decisions }: SessionSummaryProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      <Card className="bg-gray-900 border-gray-700">
        <CardContent className="p-4">
          <p className="text-sm text-gray-400">Total Decisions</p>
          <p className="text-2xl font-bold text-white">{decisions.length}</p>
        </CardContent>
      </Card>
      <Card className="bg-gray-900 border-gray-700">
        <CardContent className="p-4">
          <p className="text-sm text-gray-400">Correct Decisions</p>
          <p className="text-2xl font-bold text-green-500">
            {decisions.filter((d) => d.isCorrect).length}
          </p>
        </CardContent>
      </Card>
      <Card className="bg-gray-900 border-gray-700">
        <CardContent className="p-4">
          <p className="text-sm text-gray-400">Accuracy</p>
          <p className="text-2xl font-bold text-white">
            {session.strategyAccuracy?.toFixed(1)}%
          </p>
        </CardContent>
      </Card>
      <Card className="bg-gray-900 border-gray-700">
        <CardContent className="p-4">
          <p className="text-sm text-gray-400">Grade</p>
          <p className="text-2xl font-bold text-blue-400">
            {session.strategyGrade}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
