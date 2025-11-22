import type { Card } from "@/modules/game/cards";
import type { PlayerDecision } from "@/modules/strategy/decision-tracker";
import type { GameSession } from "@/types/user";
import type { DealerUpcardStats } from "./types";

type Rank = Card["rank"];

/**
 * Analyze performance against different dealer upcards
 */
export function analyzeDealerUpcards(
  sessions: GameSession[],
): DealerUpcardStats[] {
  // Aggregate all decisions from all sessions
  const allDecisions: PlayerDecision[] = [];

  for (const session of sessions) {
    if (session.decisionsData) {
      try {
        const decisions: PlayerDecision[] = JSON.parse(session.decisionsData);
        allDecisions.push(...decisions);
      } catch (e) {
        // Skip sessions with invalid JSON
        console.warn(`Failed to parse decisions for session ${session.id}`, e);
      }
    }
  }

  if (allDecisions.length === 0) {
    return [];
  }

  // Group decisions by dealer upcard
  const byUpcard = new Map<Rank, PlayerDecision[]>();

  for (const decision of allDecisions) {
    const upcard = decision.dealerUpCard.rank;
    if (!byUpcard.has(upcard)) {
      byUpcard.set(upcard, []);
    }
    byUpcard.get(upcard)?.push(decision);
  }

  // Calculate stats for each upcard
  const stats: DealerUpcardStats[] = [];

  for (const [upcard, decisions] of byUpcard.entries()) {
    // Only count decisions where we have outcome data (one decision per hand)
    const decisionsWithOutcome = decisions.filter(
      (d) => d.outcome !== undefined,
    );

    if (decisionsWithOutcome.length === 0) {
      continue;
    }

    // Group by handId to count unique hands (not individual decisions)
    const handIds = new Set(decisionsWithOutcome.map((d) => d.handId));
    const uniqueHands = Array.from(handIds).map((handId) => {
      // Get the last decision for this hand (which has the outcome)
      const handDecisions = decisionsWithOutcome.filter(
        (d) => d.handId === handId,
      );
      return handDecisions[handDecisions.length - 1];
    });

    const totalHands = uniqueHands.length;
    const wins = uniqueHands.filter(
      (d) =>
        d.outcome === "win" ||
        d.outcome === "blackjack" ||
        d.outcome === "charlie",
    ).length;
    const losses = uniqueHands.filter(
      (d) => d.outcome === "lose" || (d.profit && d.profit < 0),
    ).length;
    const pushes = uniqueHands.filter((d) => d.outcome === "push").length;
    const totalProfit = uniqueHands.reduce(
      (sum, d) => sum + (d.profit || 0),
      0,
    );

    stats.push({
      upcard,
      totalHands,
      wins,
      losses,
      pushes,
      winRate: totalHands > 0 ? (wins / totalHands) * 100 : 0,
      totalProfit,
      avgProfit: totalHands > 0 ? totalProfit / totalHands : 0,
    });
  }

  // Sort by card rank order (2-10, J, Q, K, A)
  const rankOrder: Record<Rank, number> = {
    "2": 2,
    "3": 3,
    "4": 4,
    "5": 5,
    "6": 6,
    "7": 7,
    "8": 8,
    "9": 9,
    "10": 10,
    J: 11,
    Q: 12,
    K: 13,
    A: 14,
  };

  stats.sort((a, b) => rankOrder[a.upcard] - rankOrder[b.upcard]);

  return stats;
}
