"use client";

import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Game } from "@/modules/game/game";
import { RuleSet } from "@/modules/game/rules";
import type { Player } from "@/modules/game/player";
import type { ActionType } from "@/modules/game/action";
import type { UserBank, UserProfile } from "@/types/user";
import { UserService } from "@/services/user-service";
import { DecisionTracker } from "@/modules/strategy/decision-tracker";
import { getBasicStrategyDecision } from "@/modules/strategy/basic-strategy";
import { HiLoCounter } from "@/modules/strategy/hi-lo-counter";
import { createTestDeck, parseTestScenario } from "@/modules/game";
import { useTrainerMode } from "@/hooks/use-trainer-mode";
import { useSettings } from "@/hooks/use-settings";

// Import new components
import type { GamePhase } from "./table/types";
import { TableBackground } from "./table/table-background";
import { TableHeader } from "./table/table-header";
import { DealerArea } from "./table/dealer-area";
import { PlayerArea } from "./table/player-area";
import { BettingPhase } from "./table/betting-phase";
import { InsurancePhase } from "./table/insurance-phase";
import { PlayingPhase } from "./table/playing-phase";
import { SettlingPhase } from "./table/settling-phase";
import { TrainerSidebar } from "./table/trainer-sidebar";
import { SettingsDialog } from "./settings-dialog";

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
  const [game, setGame] = useState<Game | null>(null);
  const [player, setPlayer] = useState<Player | null>(null);
  const [phase, setPhase] = useState<GamePhase>("betting");
  const [roundsPlayed, setRoundsPlayed] = useState(0);
  const [totalWagered, setTotalWagered] = useState(0);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [handsPendingInsurance, setHandsPendingInsurance] = useState<number[]>(
    [],
  );
  const [insuranceHandIndex, setInsuranceHandIndex] = useState(0);
  const [countingEnabled, setCountingEnabled] = useState(true);
  const [showCount, setShowCount] = useState(true);
  const [showTrainerSidebar, setShowTrainerSidebar] = useState(false);
  const [currentBalance, setCurrentBalance] = useState(0); // Track current balance for UI updates
  const [roundVersion, setRoundVersion] = useState(0); // Force re-renders when round updates
  const decisionTracker = useRef<DecisionTracker | null>(null);
  const cardCounter = useRef<HiLoCounter | null>(null);
  const originalBalanceRef = useRef<number>(0);
  const searchParams = useSearchParams();
  const { settings } = useSettings();

  // Trainer mode hook
  const {
    initializeTrainer,
    isActive: isTrainerActive,
    refreshStats,
    clearFeedback,
    getTrainer,
    practiceBalance,
  } = useTrainerMode();

  useEffect(() => {
    // Check for test mode in URL parameters or sessionStorage
    let testConfig = parseTestScenario(searchParams);

    // If not in URL params, check sessionStorage (for E2E tests)
    if (!testConfig.enabled) {
      const sessionTestMode =
        typeof window !== "undefined"
          ? sessionStorage.getItem("test-mode")
          : null;

      if (sessionTestMode) {
        testConfig = { enabled: true, scenario: sessionTestMode };
      }
    }

    const testStack =
      testConfig.enabled && testConfig.scenario
        ? createTestDeck(testConfig.scenario, 6)
        : undefined;

    // Build RuleSet from provided rules or use defaults
    const ruleSet = new RuleSet();
    if (rules) {
      ruleSet
        .setDeckCount(rules.deckCount)
        .setDealerStand(rules.dealerStand)
        .setBlackjackPayout(
          rules.blackjackPayout === "3:2" ? 3 : 6,
          rules.blackjackPayout === "3:2" ? 2 : 5,
        )
        .setDoubleAfterSplit(rules.doubleAfterSplit)
        .setSurrender(rules.surrender)
        .setDoubleRestriction(rules.doubleRestriction);

      // Add advanced rules
      if (rules.resplitAces) {
        ruleSet.setRule({ type: "resplit_aces", allowed: true });
      }
      if (rules.hitSplitAces) {
        ruleSet.setRule({ type: "hit_split_aces", allowed: true });
      }
      ruleSet.setRule({ type: "max_split", times: rules.maxSplits });
    }

    // Initialize game (with optional test stack and rules)
    const deckCount = rules?.deckCount || 6;
    const newGame = new Game(deckCount, 0.75, 1000000, ruleSet, testStack);
    const newPlayer = newGame.addPlayer(user.name, bank.balance);
    const session = UserService.startSession(user.id, rules);

    setGame(newGame);
    setPlayer(newPlayer);
    setSessionId(session.id);
    setCurrentBalance(newPlayer.bank.balance); // Initialize current balance
    setCurrentRound(undefined); // Reset round state
    setCurrentActions([]); // Reset actions state

    // Initialize decision tracker for this session
    decisionTracker.current = new DecisionTracker(session.id);

    // Initialize card counter (with configured deck count)
    cardCounter.current = new HiLoCounter(deckCount, false);

    // Initialize trainer mode
    initializeTrainer(newGame);

    // Store the original real balance
    originalBalanceRef.current = bank.balance;
  }, [
    user.name,
    bank.balance,
    user.id,
    rules,
    searchParams,
    initializeTrainer,
  ]);

  // Update hand outcomes when settling phase is reached
  useEffect(() => {
    if (phase === "settling" && game && decisionTracker.current) {
      const round = game.getCurrentRound();
      if (round?.settlementResults) {
        // Update each hand's outcome in the decision tracker
        round.settlementResults.forEach((result, handIndex) => {
          const hand = round.playerHands[handIndex];
          if (hand) {
            decisionTracker.current?.updateHandOutcome(
              hand.id,
              result.outcome,
              result.payout,
              result.profit,
            );

            // If trainer is active, update practice balance instead of real balance
            if (isTrainerActive) {
              const trainer = getTrainer();
              if (trainer) {
                trainer.updateHandOutcome(
                  hand.id,
                  result.outcome,
                  result.payout,
                  result.profit,
                );
              }
            }
          }
        });

        // Refresh trainer stats after settlement
        if (isTrainerActive) {
          refreshStats();
        }

        // Update UI balance after settlement
        if (player) {
          setCurrentBalance(player.bank.balance);
        }
      }
    }
  }, [phase, game, isTrainerActive, getTrainer, refreshStats, player]);

  // Handle insurance phase - find all hands that need insurance decision
  useEffect(() => {
    if (phase === "insurance" && game) {
      const round = game.getCurrentRound();
      if (round) {
        const pendingHands = round.playerHands
          .map((hand, index) => ({ hand, index }))
          .filter(({ hand }) => hand.insuranceOffered && !hand.hasInsurance)
          .map(({ index }) => index);

        setHandsPendingInsurance(pendingHands);

        if (pendingHands.length > 0) {
          setInsuranceHandIndex(pendingHands[0]);
        }
      }
    }
  }, [phase, game]);

  const handleBet = (bets: number[]) => {
    if (!game || !player) return;

    try {
      // Create PlayerBet array - one entry per hand
      const playerBets = bets.map((amount) => ({
        playerId: player.id,
        amount,
      }));

      // In trainer mode, we'll track virtual balance separately
      if (isTrainerActive) {
        const totalBet = bets.reduce((sum, bet) => sum + bet, 0);
        if (totalBet > practiceBalance) {
          console.error(
            `Insufficient practice balance. Bet: ${totalBet}, Balance: ${practiceBalance}`,
          );
          return;
        }
      }

      // Start the round - this will debit the bets from the player's bank
      game.startRound(playerBets);

      // Update the UI balance after bet is placed
      setCurrentBalance(player.bank.balance);

      // Update round state to show new cards
      const roundAfterBet = game.getCurrentRound();
      // Simply update the round and increment version to force re-render
      setCurrentRound(roundAfterBet);
      setCurrentActions(game.getAvailableActions() ?? []);
      // Use roundVersion to trigger re-render
      // This is the key - incrementing version will cause useEffect in components to fire
      setRoundVersion((v) => v + 1);

      setRoundsPlayed((prev) => prev + 1);
      setPhase("dealing");

      // Track dealt cards in the counter
      if (cardCounter.current && countingEnabled) {
        const round = game.getCurrentRound();
        if (round) {
          // Add all player cards
          for (const hand of round.playerHands) {
            cardCounter.current.addCards(hand.cards);
          }
          // Add dealer's up card
          if (round.dealerHand.upCard) {
            cardCounter.current.addCard(round.dealerHand.upCard);
          }
        }
      }

      // Track cards in trainer if active
      if (isTrainerActive) {
        const trainer = getTrainer();
        if (trainer) {
          const round = game.getCurrentRound();
          if (round) {
            // Process all dealt cards for counting
            for (const hand of round.playerHands) {
              trainer.processCardsDealt(hand.cards);
            }
            if (round.dealerHand.upCard) {
              trainer.processCardsDealt([round.dealerHand.upCard]);
            }
          }
          // Clear feedback from previous round
          clearFeedback();
        }
      }

      // Calculate total dealing time based on the number of cards and dealing speed
      // Typically 2 cards for dealer + 2 cards per player hand
      const round = game.getCurrentRound();
      let totalCards = 2; // Dealer gets 2 cards
      if (round) {
        totalCards += round.playerHands.length * 2; // Each hand gets 2 cards initially
      }

      // Calculate wait time: max card index * dealing speed + buffer time for animation
      const dealingTime = settings.animations.enableAnimations
        ? Math.max(totalCards * settings.animations.dealingSpeed, 1000) + 300 // Add 300ms buffer
        : 100; // Minimal delay if animations are disabled

      // After dealing animation, check for insurance or proceed to playing
      setTimeout(() => {
        const round = game.getCurrentRound();
        if (round?.state === "insurance") {
          setPhase("insurance");
        } else if (round?.state === "player_turn") {
          setPhase("playing");
        } else {
          setPhase("settling");
        }
      }, dealingTime);
    } catch (error) {
      console.error("Failed to start round:", error);
    }
  };

  const handleAction = (action: ActionType) => {
    if (!game || !decisionTracker.current) return;

    try {
      const round = game.getCurrentRound();
      const availableActions = game.getAvailableActions() ?? [];

      // Record the decision for strategy analysis
      if (round && round.state === "player_turn") {
        const currentHand = round.playerHands[round.currentHandIndex];
        if (currentHand) {
          const dealerUpCard = round.dealerHand.upCard;

          // Determine what actions are available
          const canDouble = availableActions.includes("double");
          const canSplit = availableActions.includes("split");
          const canSurrender = availableActions.includes("surrender");

          // Get basic strategy recommendation
          const optimalDecision = getBasicStrategyDecision(
            currentHand.cards,
            currentHand.handValue,
            dealerUpCard,
            canDouble,
            canSplit,
            canSurrender,
          );

          // Get count snapshot if counting is enabled
          const countSnapshot =
            countingEnabled && cardCounter.current
              ? cardCounter.current.getSnapshot()
              : undefined;

          // Record the decision
          decisionTracker.current.recordDecision(
            currentHand.cards,
            currentHand.handValue,
            dealerUpCard,
            currentHand.id,
            round.id,
            canDouble,
            canSplit,
            canSurrender,
            action,
            optimalDecision,
            currentHand.betAmount,
            countSnapshot,
          );

          // If trainer is active, evaluate the action
          if (isTrainerActive) {
            const trainer = getTrainer();
            if (trainer) {
              trainer.evaluateAction(
                currentHand.cards,
                currentHand.handValue,
                dealerUpCard,
                canDouble,
                canSplit,
                canSurrender,
                action,
                currentHand.id,
                round.id,
                currentHand.betAmount,
              );
              refreshStats();
            }
          }
        }
      }

      // Track cards before action
      const currentRound = game.getCurrentRound();
      const cardsBefore = currentRound
        ? currentRound.playerHands.reduce((sum, h) => sum + h.cards.length, 0)
        : 0;

      game.playAction(action);

      // Update balance after action (in case of double down which debits more money)
      if (player) {
        setCurrentBalance(player.bank.balance);
      }

      // Track any new cards dealt (from hit, split, double)
      if (cardCounter.current && countingEnabled) {
        const round = game.getCurrentRound();
        if (round) {
          const cardsAfter = round.playerHands.reduce(
            (sum, h) => sum + h.cards.length,
            0,
          );
          if (cardsAfter > cardsBefore) {
            // New cards were dealt, collect all cards and add the new ones
            const allCurrentCards = round.playerHands.flatMap((h) => h.cards);
            const newCards = allCurrentCards.slice(cardsBefore);
            cardCounter.current.addCards(newCards);
          }
        }
      }
      const newRound = game.getCurrentRound();
      const newActions = game.getAvailableActions() ?? [];

      // Update round state to show new cards immediately
      // Create a deep clone of the round to force React to see the changes
      if (newRound) {
        // Deep clone the round object to force React to see the changes
        // We need to preserve ALL properties including betAmount, handValue, etc.
        const clonedRound = {
          ...newRound,
          playerHands: newRound.playerHands.map((hand: any) => ({
            ...hand,
            cards: [...hand.cards], // Create new array reference for cards
            betAmount: hand.betAmount,
            handValue: hand.handValue,
            hardValue: hand.hardValue,
            isSoft: hand.isSoft,
            state: hand.state,
            id: hand.id,
            playerId: hand.playerId,
            canSplit: hand.canSplit,
            isDoubled: hand.isDoubled,
            isSplit: hand.isSplit,
          })),
          dealerHand: {
            ...newRound.dealerHand,
            cards: [...newRound.dealerHand.cards],
            handValue: newRound.dealerHand.handValue,
            hardValue: (newRound.dealerHand as any).hardValue,
            isSoft: newRound.dealerHand.isSoft,
            upCard: newRound.dealerHand.upCard,
          },
          // Preserve other round properties
          state: newRound.state,
          id: newRound.id,
          currentHandIndex: newRound.currentHandIndex,
        };
        setCurrentRound(clonedRound as any);
      } else {
        setCurrentRound(newRound);
      }
      setCurrentActions(newActions);
      // Use roundVersion to trigger re-render
      // This is the key - incrementing version will cause useEffect in components to fire
      setRoundVersion((v) => v + 1);

      // Check if we're still in player turn with actions available
      if (newActions.length > 0 && newRound?.state === "player_turn") {
        // Still playing
        return;
      }

      // No more actions, move to dealer turn
      setPhase("dealer_turn");

      // Track dealer's hole card and any dealer hits
      if (cardCounter.current && countingEnabled) {
        const round = game.getCurrentRound();
        if (round) {
          const dealerCards = round.dealerHand.cards;
          // Add hole card (second card, index 1) if it exists
          if (dealerCards.length >= 2 && dealerCards[1]) {
            cardCounter.current.addCard(dealerCards[1]);
          }
          // Add any additional dealer cards beyond the initial 2
          if (dealerCards.length > 2) {
            cardCounter.current.addCards(dealerCards.slice(2));
          }
        }
      }

      setTimeout(() => {
        setPhase("settling");
      }, 1500);
    } catch (error) {
      console.error("Failed to play action:", error);
    }
  };

  const handleNextRound = () => {
    if (!game || !player) return;

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
  };

  const handleEndGame = () => {
    if (!game || !player || !sessionId) return;

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
    if (decisionTracker.current) {
      const analysis = decisionTracker.current.calculateAnalysis();
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
  };

  const handleInsuranceAction = (takeInsurance: boolean) => {
    if (!game) return;

    if (takeInsurance) {
      game.takeInsurance(insuranceHandIndex);
    } else {
      game.declineInsurance(insuranceHandIndex);
    }

    // Check if there are more hands needing insurance
    const remainingHands = handsPendingInsurance.filter(
      (i) => i !== insuranceHandIndex,
    );
    if (remainingHands.length > 0) {
      setInsuranceHandIndex(remainingHands[0]);
      setHandsPendingInsurance(remainingHands);
    } else {
      // All hands processed, resolve insurance
      game.resolveInsurance();

      // Check round state after insurance resolution
      const round = game.getCurrentRound();
      if (round?.state === "settling" || round?.state === "complete") {
        // Dealer has blackjack - go directly to settling
        setTimeout(() => {
          setPhase("settling");
          const roundAfterInsurance = game.getCurrentRound();
          setCurrentRound(roundAfterInsurance);
          setCurrentActions(game.getAvailableActions() ?? []);
          setRoundVersion((v) => v + 1);
        }, 500);
      } else {
        setPhase("playing");
        const roundAfterInsuranceDecline = game.getCurrentRound();
        setCurrentRound(roundAfterInsuranceDecline);
        setCurrentActions(game.getAvailableActions() ?? []);
        setRoundVersion((v) => v + 1);
      }
    }
  };

  // Track round in state to ensure UI updates
  const [currentRound, setCurrentRound] = useState(game?.getCurrentRound());
  const [currentActions, setCurrentActions] = useState(
    game?.getAvailableActions() ?? [],
  );

  // Use state-tracked values for rendering
  const round = currentRound;
  const availableActions = currentActions;

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
        countingEnabled={countingEnabled}
        showCount={showCount}
        cardCounter={cardCounter.current}
        showTrainerSidebar={showTrainerSidebar}
        onToggleCount={() => setShowCount(!showCount)}
        onToggleTrainer={() => setShowTrainerSidebar(!showTrainerSidebar)}
        onEndGame={handleEndGame}
      />

      {/* Main playing area */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center gap-12 p-8">
        {/* Dealer area */}
        <DealerArea round={round} phase={phase} version={roundVersion} />

        {/* Player area */}
        <PlayerArea
          round={round}
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
            onBet={handleBet}
          />
        )}

        {phase === "insurance" && (
          <InsurancePhase
            round={round}
            insuranceHandIndex={insuranceHandIndex}
            onTakeInsurance={() => handleInsuranceAction(true)}
            onDeclineInsurance={() => handleInsuranceAction(false)}
          />
        )}

        {phase === "playing" && availableActions.length > 0 && (
          <PlayingPhase
            availableActions={availableActions}
            onAction={handleAction}
          />
        )}

        {phase === "settling" && (
          <SettlingPhase
            round={round}
            player={player}
            onNextRound={handleNextRound}
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
      <SettingsDialog />
    </div>
  );
}
