"use client";

import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";

interface GameStatsProps {
  balance: number;
  roundNumber: number;
  currentBet?: number;
}

export function GameStats({
  balance,
  roundNumber,
  currentBet,
}: GameStatsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Balance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600">
            ${balance.toFixed(2)}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Round
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">#{roundNumber}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Current Bet
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {currentBet ? `$${currentBet.toFixed(2)}` : "-"}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
