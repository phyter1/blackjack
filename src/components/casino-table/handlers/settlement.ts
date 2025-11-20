import type { Game } from "@/modules/game/game";
import type { Player } from "@/modules/game/player";
import type { DecisionTracker } from "@/modules/strategy/decision-tracker";
import type { TrainerMode } from "@/modules/strategy/trainer";
import { UserService } from "@/services/user-service";
import type { GamePhase } from "../../table/types";

export interface NextRoundHandlerParams {
  game: Game;
  player: Player;
  setPhase: (phase: GamePhase) => void;
  setTotalWagered: (updater: (prev: number) => number) => void;
  setCurrentRound: (round: any) => void;
  setCurrentActions: (actions: any[]) => void;
  handleEndGame: () => void;
}

export interface EndGameHandlerParams {
  game: Game;
  player: Player;
  sessionId: string | null;
  roundsPlayed: number;
  totalWagered: number;
  decisionTracker: DecisionTracker | null;
  onGameEnd: (bank: any) => void;
  onBackToDashboard: () => void;
}

export interface SettlementEffectParams {
  phase: GamePhase;
  game: Game | null;
  player: Player | null;
  decisionTracker: DecisionTracker | null;
  isTrainerActive: boolean;
  trainer: TrainerMode | null;
  refreshTrainerStats: () => void;
  setCurrentBalance: (balance: number) => void;
  setRoundVersion: (updater: (v: number) => number) => void;
}

/**
 * Handle moving to the next round
 */
export function handleNextRound(params: NextRoundHandlerParams): void {
  const {
    game,
    player,
    setPhase,
    setTotalWagered,
    setCurrentRound,
    setCurrentActions,
    handleEndGame,
  } = params;

  // Check actual player balance
  if (player.bank.balance < 10) {
    handleEndGame();
    return;
  }

  // Track total wagered from this round before completing it
  const round = game.getCurrentRound();
  if (round) {
    const roundWagered = round.playerHands.reduce(
      (sum, hand) => sum + hand.betAmount,
      0,
    );
    setTotalWagered((prev) => prev + roundWagered);
  }

  game.completeRound();
  setPhase("betting");
  // Reset round state for next round
  setCurrentRound(undefined);
  setCurrentActions([]);
}

/**
 * Handle ending the game session
 */
export function handleEndGame(params: EndGameHandlerParams): void {
  const {
    game,
    player,
    sessionId,
    roundsPlayed,
    totalWagered,
    decisionTracker,
    onGameEnd,
    onBackToDashboard,
  } = params;

  if (!sessionId) return;

  // Track final round's wager if there's an active round
  let finalTotalWagered = totalWagered;
  const round = game.getCurrentRound();
  if (round && round.state !== "complete") {
    const roundWagered = round.playerHands.reduce(
      (sum, hand) => sum + hand.betAmount,
      0,
    );
    finalTotalWagered += roundWagered;
  }

  game.endSession();

  // Calculate strategy analysis if we tracked decisions
  let strategyAnalysis: {
    grade: string;
    accuracy: number;
    totalDecisions: number;
    correctDecisions: number;
    decisions: unknown[];
    hasCountData: boolean;
  } | null = null;
  if (decisionTracker) {
    const analysis = decisionTracker.calculateAnalysis();
    strategyAnalysis = {
      grade: analysis.grade,
      accuracy: analysis.accuracyPercentage,
      totalDecisions: analysis.totalDecisions,
      correctDecisions: analysis.correctDecisions,
      decisions: analysis.decisions,
      hasCountData: analysis.hasCountData,
    };
  }

  // Use the real balance for saving (already restored if in trainer mode)
  UserService.endSession(
    sessionId,
    roundsPlayed,
    player.bank.balance,
    game.getSessionId(),
    strategyAnalysis,
    finalTotalWagered,
  );

  const updatedBank = UserService.getCurrentUser()?.bank;
  if (updatedBank) {
    onGameEnd(updatedBank);
  }

  onBackToDashboard();
}

/**
 * Update hand outcomes when settling phase is reached
 * This should be called in a useEffect
 */
export function updateSettlementOutcomes(params: SettlementEffectParams): void {
  const {
    phase,
    game,
    player,
    decisionTracker,
    isTrainerActive,
    trainer,
    refreshTrainerStats,
    setCurrentBalance,
    setRoundVersion,
  } = params;

  if (phase === "settling" && game && decisionTracker) {
    const round = game.getCurrentRound();
    if (round?.settlementResults) {
      // Update each hand's outcome in the decision tracker
      round.settlementResults.forEach((result, handIndex) => {
        const hand = round.playerHands[handIndex];
        if (hand) {
          decisionTracker.updateHandOutcome(
            hand.id,
            result.outcome,
            result.payout,
            result.profit,
          );

          // If trainer is active, update practice balance instead of real balance
          if (isTrainerActive && trainer) {
            trainer.updateHandOutcome(
              hand.id,
              result.outcome,
              result.payout,
              result.profit,
            );
          }
        }
      });

      // Refresh trainer stats after settlement
      if (isTrainerActive) {
        refreshTrainerStats();
      }

      // Update UI balance after settlement
      if (player) {
        setCurrentBalance(player.bank.balance);
      }

      // Trigger round version update to refresh shoe details
      setRoundVersion((v) => v + 1);
    }
  }
}
