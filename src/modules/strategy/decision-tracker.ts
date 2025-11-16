import type { ActionType } from "../game/action";
import type { Card } from "../game/card";
import type { BasicStrategyDecision } from "./basic-strategy";

/**
 * A single decision made during gameplay
 */
export interface PlayerDecision {
  // Game state when decision was made
  playerCards: Card[];
  playerHandValue: number;
  dealerUpCard: Card;
  handId: string;
  roundId: string;

  // Available options
  canDouble: boolean;
  canSplit: boolean;
  canSurrender: boolean;

  // What the player chose
  actualAction: ActionType;
  timestamp: string;

  // What basic strategy recommends
  optimalAction: ActionType;
  optimalReason: string;

  // Was the decision correct?
  isCorrect: boolean;
}

/**
 * Strategy analysis for an entire session
 */
export interface StrategyAnalysis {
  sessionId: string;
  decisions: PlayerDecision[];
  totalDecisions: number;
  correctDecisions: number;
  accuracyPercentage: number;
  grade: StrategyGrade;
  gradePoints: number; // GPA-style: 4.0 = A+, 0.0 = F
}

/**
 * Letter grades for strategy adherence
 */
export type StrategyGrade =
  | "A+"
  | "A"
  | "A-"
  | "B+"
  | "B"
  | "B-"
  | "C+"
  | "C"
  | "C-"
  | "D+"
  | "D"
  | "F";

/**
 * Calculate letter grade based on accuracy percentage
 */
export function calculateGrade(accuracyPercentage: number): StrategyGrade {
  if (accuracyPercentage >= 98) return "A+";
  if (accuracyPercentage >= 93) return "A";
  if (accuracyPercentage >= 90) return "A-";
  if (accuracyPercentage >= 87) return "B+";
  if (accuracyPercentage >= 83) return "B";
  if (accuracyPercentage >= 80) return "B-";
  if (accuracyPercentage >= 77) return "C+";
  if (accuracyPercentage >= 73) return "C";
  if (accuracyPercentage >= 70) return "C-";
  if (accuracyPercentage >= 67) return "D+";
  if (accuracyPercentage >= 60) return "D";
  return "F";
}

/**
 * Convert letter grade to GPA-style points
 */
export function getGradePoints(grade: StrategyGrade): number {
  const gradeMap: Record<StrategyGrade, number> = {
    "A+": 4.0,
    A: 4.0,
    "A-": 3.7,
    "B+": 3.3,
    B: 3.0,
    "B-": 2.7,
    "C+": 2.3,
    C: 2.0,
    "C-": 1.7,
    "D+": 1.3,
    D: 1.0,
    F: 0.0,
  };
  return gradeMap[grade];
}

/**
 * Decision Tracker class for recording and analyzing player decisions
 */
export class DecisionTracker {
  private decisions: PlayerDecision[] = [];
  private sessionId: string;

  constructor(sessionId: string) {
    this.sessionId = sessionId;
  }

  /**
   * Record a player decision
   */
  recordDecision(
    playerCards: Card[],
    playerHandValue: number,
    dealerUpCard: Card,
    handId: string,
    roundId: string,
    canDouble: boolean,
    canSplit: boolean,
    canSurrender: boolean,
    actualAction: ActionType,
    optimalDecision: BasicStrategyDecision
  ): void {
    const decision: PlayerDecision = {
      playerCards,
      playerHandValue,
      dealerUpCard,
      handId,
      roundId,
      canDouble,
      canSplit,
      canSurrender,
      actualAction,
      timestamp: new Date().toISOString(),
      optimalAction: optimalDecision.action,
      optimalReason: optimalDecision.reason,
      isCorrect: actualAction === optimalDecision.action,
    };

    this.decisions.push(decision);
  }

  /**
   * Get all recorded decisions
   */
  getDecisions(): PlayerDecision[] {
    return [...this.decisions];
  }

  /**
   * Calculate strategy analysis for the session
   */
  calculateAnalysis(): StrategyAnalysis {
    const totalDecisions = this.decisions.length;
    const correctDecisions = this.decisions.filter((d) => d.isCorrect).length;
    const accuracyPercentage =
      totalDecisions > 0 ? (correctDecisions / totalDecisions) * 100 : 0;
    const grade = calculateGrade(accuracyPercentage);
    const gradePoints = getGradePoints(grade);

    return {
      sessionId: this.sessionId,
      decisions: this.decisions,
      totalDecisions,
      correctDecisions,
      accuracyPercentage,
      grade,
      gradePoints,
    };
  }

  /**
   * Get common mistakes (decisions that were wrong)
   */
  getMistakes(): PlayerDecision[] {
    return this.decisions.filter((d) => !d.isCorrect);
  }

  /**
   * Get decision accuracy by situation type
   */
  getAccuracyByType(): {
    hard: number;
    soft: number;
    pair: number;
  } {
    const categorizeDecision = (decision: PlayerDecision) => {
      const cards = decision.playerCards;
      if (cards.length === 2 && cards[0].rank === cards[1].rank) {
        return "pair";
      }
      // Check if soft (has ace counted as 11)
      const hasAce = cards.some((c) => c.rank === "A");
      if (hasAce) {
        let hardTotal = 0;
        for (const card of cards) {
          if (card.rank === "A") hardTotal += 1;
          else if (["J", "Q", "K"].includes(card.rank)) hardTotal += 10;
          else hardTotal += parseInt(card.rank);
        }
        if (decision.playerHandValue === hardTotal + 10) {
          return "soft";
        }
      }
      return "hard";
    };

    const byType = { hard: [] as PlayerDecision[], soft: [] as PlayerDecision[], pair: [] as PlayerDecision[] };

    for (const decision of this.decisions) {
      const type = categorizeDecision(decision);
      byType[type].push(decision);
    }

    return {
      hard: byType.hard.length > 0 ? (byType.hard.filter(d => d.isCorrect).length / byType.hard.length) * 100 : 0,
      soft: byType.soft.length > 0 ? (byType.soft.filter(d => d.isCorrect).length / byType.soft.length) * 100 : 0,
      pair: byType.pair.length > 0 ? (byType.pair.filter(d => d.isCorrect).length / byType.pair.length) * 100 : 0,
    };
  }

  /**
   * Clear all decisions (useful for starting a new session)
   */
  clear(): void {
    this.decisions = [];
  }
}
