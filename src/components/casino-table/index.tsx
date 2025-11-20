"use client";

import { useEffect, useState } from "react";
import type { ActionType } from "@/modules/game/action";
import type { UserBank, UserProfile } from "@/types/user";
import { useTrainerMode } from "@/hooks/use-trainer-mode";
import { useSettings } from "@/hooks/use-settings";

// Import custom hooks
import { useCasinoGame } from "./use-casino-game";
import { useInsurance } from "./use-insurance";
import { useCounting } from "./use-counting";

// Import handler functions
import { handleBet } from "./handlers/betting";
import { handleAction } from "./handlers/actions";
import {
  handleNextRound,
  handleEndGame,
  updateSettlementOutcomes,
} from "./handlers/settlement";

// Import UI components
import { TableBackground } from "../table/table-background";
import { TableHeader } from "../table/table-header";
import { DealerArea } from "../table/dealer-area";
import { PlayerArea } from "../table/player-area";
import { BettingPhase } from "../table/betting-phase";
import { InsurancePhase } from "../table/insurance-phase";
import { PlayingPhase } from "../table/playing-phase";
import { SettlingPhase } from "../table/settling-phase";
import { TrainerSidebar } from "../table/trainer-sidebar";
import { SettingsDialog } from "../settings-dialog";
import { ShoeDisplay } from "../table/shoe-display";
import { DiscardTray } from "../table/discard-tray";

interface CasinoTableProps {
  user: UserProfile;
  bank: UserBank;
  rules?: import("@/types/user").TableRules;
  onGameEnd: (bank: UserBank) => void;
  onBackToDashboard: () => void;
}

export function CasinoTable({
  user,
  bank,
  rules,
  onGameEnd,
  onBackToDashboard,
}: CasinoTableProps) {
  const { settings } = useSettings();
  const [showTrainerSidebar, setShowTrainerSidebar] = useState(false);
  const [showSettingsDialog, setShowSettingsDialog] = useState(false);
  const [previousBets, setPreviousBets] = useState<number[] | null>(null);

  // Trainer mode hook
  const {
    initializeTrainer,
    isActive: isTrainerActive,
    refreshStats,
    clearFeedback,
    getTrainer,
    practiceBalance,
  } = useTrainerMode();

  // Game state management hook
  const {
    game,
    player,
    phase,
    roundsPlayed,
    totalWagered,
    sessionId,
    currentBalance,
    roundVersion,
    currentRound,
    currentActions,
    shoeDetails,
    decisionTracker,
    setPhase,
    setRoundsPlayed,
    setTotalWagered,
    setCurrentBalance,
    setRoundVersion,
    setCurrentRound,
    setCurrentActions,
  } = useCasinoGame({ user, bank, rules, initializeTrainer });

  // Card counting hook
  const { countingEnabled, showCount, cardCounter, setShowCount } = useCounting(
    {
      deckCount: rules?.deckCount || 6,
    },
  );

  // Insurance hook
  const { insuranceHandIndex, handleInsuranceAction } = useInsurance({
    game,
    phase,
    setPhase,
    setCurrentRound,
    setCurrentActions,
    setRoundVersion,
  });

  // Update hand outcomes when settling phase is reached
  useEffect(() => {
    updateSettlementOutcomes({
      phase,
      game,
      player,
      decisionTracker: decisionTracker.current,
      isTrainerActive,
      trainer: getTrainer(),
      refreshTrainerStats: refreshStats,
      setCurrentBalance,
      setRoundVersion,
    });
  }, [
    phase,
    game,
    isTrainerActive,
    getTrainer,
    refreshStats,
    player,
    decisionTracker,
    setRoundVersion,
  ]);

  // Handler wrappers
  const onBet = (bets: number[]) => {
    if (!game || !player) return;

    handleBet({
      game,
      player,
      bets,
      isTrainerActive,
      practiceBalance,
      countingEnabled,
      cardCounter,
      trainer: getTrainer(),
      settings,
      setCurrentBalance,
      setCurrentRound,
      setCurrentActions,
      setRoundVersion,
      setRoundsPlayed,
      setPhase,
      clearTrainerFeedback: clearFeedback,
    });
  };

  const onAction = (action: ActionType) => {
    if (!game || !player) return;

    handleAction({
      game,
      player,
      action,
      decisionTracker: decisionTracker.current,
      countingEnabled,
      cardCounter,
      isTrainerActive,
      trainer: getTrainer(),
      setCurrentBalance,
      setCurrentRound,
      setCurrentActions,
      setRoundVersion,
      setPhase,
      refreshTrainerStats: refreshStats,
    });
  };

  const onNextRound = () => {
    if (!game || !player) return;

    handleNextRound({
      game,
      player,
      setPhase,
      setTotalWagered,
      setCurrentRound,
      setCurrentActions,
      setRoundVersion,
      handleEndGame: onEndGame,
    });
  };

  const onEndGame = () => {
    if (!game || !player || !sessionId) return;

    handleEndGame({
      game,
      player,
      sessionId,
      roundsPlayed,
      totalWagered,
      decisionTracker: decisionTracker.current,
      onGameEnd,
      onBackToDashboard,
    });
  };

  return (
    <div className="h-screen flex flex-col relative overflow-hidden">
      {/* Casino table background */}
      <TableBackground />

      {/* Header */}
      <TableHeader
        player={player}
        currentBalance={currentBalance}
        practiceBalance={practiceBalance}
        isTrainerActive={isTrainerActive}
        onOpenSettings={() => setShowSettingsDialog(true)}
        onEndGame={onEndGame}
      />

      {/* Shoe Display - Right Side */}
      {shoeDetails && (
        <ShoeDisplay
          remainingCards={shoeDetails.remainingCards}
          totalCards={shoeDetails.initialCardCount}
          cutCardPosition={shoeDetails.cutCardPosition}
          penetration={shoeDetails.penetration}
          isComplete={shoeDetails.isComplete}
        />
      )}

      {/* Discard Tray - Left Side */}
      {shoeDetails && (
        <DiscardTray
          discardedCards={shoeDetails.discardedCards}
          totalCards={shoeDetails.initialCardCount}
        />
      )}

      {/* Main playing area */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center gap-12 p-8">
        {/* Dealer area */}
        <DealerArea round={currentRound} phase={phase} version={roundVersion} />

        {/* Player area */}
        <PlayerArea
          round={currentRound}
          phase={phase}
          userName={user.name}
          version={roundVersion}
        />
      </div>

      {/* Action area */}
      <div className="relative z-10 p-6 bg-linear-to-t from-amber-950/80 to-transparent backdrop-blur-sm">
        {phase === "betting" && (
          <BettingPhase
            currentBalance={currentBalance}
            practiceBalance={practiceBalance}
            isTrainerActive={isTrainerActive}
            maxPlayableHands={rules?.maxPlayableHands || 5}
            previousBets={previousBets}
            onBet={onBet}
            onSetPreviousBets={setPreviousBets}
          />
        )}

        {phase === "insurance" && (
          <InsurancePhase
            round={currentRound}
            insuranceHandIndex={insuranceHandIndex}
            onTakeInsurance={() => handleInsuranceAction(true)}
            onDeclineInsurance={() => handleInsuranceAction(false)}
          />
        )}

        {phase === "playing" && currentActions.length > 0 && (
          <PlayingPhase availableActions={currentActions} onAction={onAction} />
        )}

        {phase === "settling" && (
          <SettlingPhase
            round={currentRound}
            player={player}
            onNextRound={onNextRound}
          />
        )}
      </div>

      {/* Trainer Sidebar */}
      {showTrainerSidebar && (
        <TrainerSidebar
          isActive={isTrainerActive}
          onClose={() => setShowTrainerSidebar(false)}
        />
      )}

      {/* Settings Dialog */}
      <SettingsDialog
        open={showSettingsDialog}
        onOpenChange={setShowSettingsDialog}
        showTrainerSidebar={showTrainerSidebar}
        onToggleTrainer={() => setShowTrainerSidebar(!showTrainerSidebar)}
        showCount={showCount}
        onToggleCount={() => setShowCount(!showCount)}
      />
    </div>
  );
}
