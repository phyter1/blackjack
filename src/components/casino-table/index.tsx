"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import type { ActionType } from "@/modules/game/action";
import { ChipConfigService } from "@/services/chip-config-service";
import { useGameStore } from "@/stores/game";
import { selectSettings, useSettingsStore } from "@/stores/settings";
import { useTrainerStore } from "@/stores/trainer";
import { useUIStore } from "@/stores/ui";
import type { UserBank, UserProfile } from "@/types/user";
import { SettingsDialog } from "../settings-dialog";
import { BettingPhase } from "../table/betting-phase";
import { DealerArea } from "../table/dealer-area";
import { DiscardTray } from "../table/discard-tray";
import { InsurancePhase } from "../table/insurance-phase";
import { PlayerArea } from "../table/player-area";
import { PlayingPhase } from "../table/playing-phase";
import { SettlingPhase } from "../table/settling-phase";
import { ShoeDisplay } from "../table/shoe-display";
// Import UI components
import { TableBackground } from "../table/table-background";
import { TableHeader } from "../table/table-header";
import { TrainerSidebar } from "../table/trainer-sidebar";
import { useFullscreen } from "./use-fullscreen";

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
  const _settings = useSettingsStore(selectSettings);
  const searchParams = useSearchParams();

  // Fullscreen functionality
  const containerRef = useRef<HTMLDivElement>(null as unknown as HTMLDivElement);
  const { isFullscreen, toggleFullscreen } = useFullscreen(containerRef);

  // UI state from store
  const showTrainerSidebar = useUIStore((state) => state.showTrainerSidebar);
  const setShowTrainerSidebar = useUIStore(
    (state) => state.setShowTrainerSidebar,
  );
  const showSettingsDialog = useUIStore((state) => state.showSettingsDialog);
  const setShowSettingsDialog = useUIStore(
    (state) => state.setShowSettingsDialog,
  );
  const previousBets = useUIStore((state) => state.previousBets);
  const setPreviousBets = useUIStore((state) => state.setPreviousBets);

  // Trainer mode store
  const initializeTrainer = useTrainerStore((state) => state.initializeTrainer);
  const isTrainerActive = useTrainerStore((state) => state.isActive);
  const practiceBalance = useTrainerStore((state) => state.practiceBalance);

  // Game state from store
  const game = useGameStore((state) => state.game);
  const player = useGameStore((state) => state.player);
  const phase = useGameStore((state) => state.phase);
  const currentBalance = useGameStore((state) => state.currentBalance);
  const currentRound = useGameStore((state) => state.currentRound);
  const currentActions = useGameStore((state) => state.currentActions);
  const shoeDetails = useGameStore((state) => state.shoeDetails);
  const showCount = useGameStore((state) => state.showCount);
  const insuranceHandIndex = useGameStore((state) => state.insuranceHandIndex);
  const roundVersion = useGameStore((state) => state.roundVersion);

  // Game actions from store
  const initializeGame = useGameStore((state) => state.initializeGame);
  const cleanup = useGameStore((state) => state.cleanup);
  const placeBets = useGameStore((state) => state.placeBets);
  const playAction = useGameStore((state) => state.playAction);
  const handleInsuranceAction = useGameStore(
    (state) => state.handleInsuranceAction,
  );
  const handleNextRound = useGameStore((state) => state.handleNextRound);
  const handleEndGame = useGameStore((state) => state.handleEndGame);
  const setShowCount = useGameStore((state) => state.setShowCount);

  // Chip denominations based on table limits
  const [chipDenominations, setChipDenominations] = useState<number[]>([]);

  // Load chip denominations when rules change
  useEffect(() => {
    if (rules?.minBet && rules?.maxBet && rules?.betUnit) {
      const config = ChipConfigService.getChipConfig({
        minBet: rules.minBet,
        maxBet: rules.maxBet,
        betUnit: rules.betUnit,
      });
      setChipDenominations(config.denominations);
    }
  }, [rules?.minBet, rules?.maxBet, rules?.betUnit]);

  // Initialize game on mount
  useEffect(() => {
    initializeGame(user, bank, rules, searchParams.toString());

    // Cleanup on unmount
    return () => {
      cleanup();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    user.id,
    bank.balance,
    bank,
    initializeGame,
    rules,
    searchParams.toString,
    cleanup,
    user,
  ]);

  // Initialize trainer when game is ready
  useEffect(() => {
    if (game) {
      initializeTrainer(game.getGameInstance());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [game, initializeTrainer]);

  // Trigger settlement outcomes update when phase changes to settling
  useEffect(() => {
    if (phase === "settling") {
      const updateSettlementOutcomes =
        useGameStore.getState().updateSettlementOutcomes;
      updateSettlementOutcomes();
    }
  }, [phase]);

  // Handler wrappers - delegate to store actions
  const onBet = (bets: number[]) => {
    placeBets(bets);
  };

  const onAction = (action: ActionType) => {
    playAction(action);
  };

  const onNextRound = () => {
    if (!game || !player) return;
    handleNextRound();
  };

  const onEndGame = () => {
    handleEndGame(user.id, onGameEnd);
    onBackToDashboard();
  };

  return (
    <div
      ref={containerRef}
      className="h-screen flex flex-col relative overflow-hidden"
    >
      {/* Casino table background */}
      <TableBackground />

      {/* Header */}
      <TableHeader
        player={player}
        currentBalance={currentBalance}
        practiceBalance={practiceBalance}
        isTrainerActive={isTrainerActive}
        isFullscreen={isFullscreen}
        onOpenSettings={() => setShowSettingsDialog(true)}
        onToggleFullscreen={toggleFullscreen}
        onEndGame={onEndGame}
      />

      {/* Shoe Display - Right Side - Hidden on mobile */}
      {shoeDetails && (
        <div className="hidden md:block">
          <ShoeDisplay
            remainingCards={shoeDetails.remainingCards}
            totalCards={shoeDetails.initialCardCount}
            cutCardPosition={shoeDetails.cutCardPosition}
            penetration={shoeDetails.penetration}
            isComplete={shoeDetails.isComplete}
          />
        </div>
      )}

      {/* Discard Tray - Left Side - Hidden on mobile */}
      {shoeDetails && (
        <div className="hidden md:block">
          <DiscardTray
            discardedCards={shoeDetails.discardedCards}
            totalCards={shoeDetails.initialCardCount}
          />
        </div>
      )}

      {/* Main playing area */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center gap-4 md:gap-12 p-2 md:p-8">
        {/* Dealer area */}
        <DealerArea round={currentRound} phase={phase} />

        {/* Player area */}
        <PlayerArea
          round={currentRound}
          phase={phase}
          userName={user.name}
          version={roundVersion}
        />
      </div>

      {/* Action area */}
      <div
        className="relative z-10 p-2 md:p-6 backdrop-blur-sm"
        style={{
          background:
            "linear-gradient(to top, var(--theme-table-edge) / 0.8, transparent)",
        }}
      >
        {phase === "betting" && (
          <BettingPhase
            currentBalance={currentBalance}
            practiceBalance={practiceBalance}
            isTrainerActive={isTrainerActive}
            maxPlayableHands={rules?.maxPlayableHands || 5}
            minBet={rules?.minBet}
            maxBet={rules?.maxBet}
            betUnit={rules?.betUnit}
            chipDenominations={chipDenominations}
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
