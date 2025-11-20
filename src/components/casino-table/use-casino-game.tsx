"use client";

import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Game } from "@/modules/game/game";
import { RuleSet } from "@/modules/game/rules";
import type { Player } from "@/modules/game/player";
import type { UserBank, UserProfile } from "@/types/user";
import { UserService } from "@/services/user-service";
import { DecisionTracker } from "@/modules/strategy/decision-tracker";
import { createTestDeck, parseTestScenario } from "@/modules/game";
import type { GamePhase } from "../table/types";

interface UseCasinoGameProps {
  user: UserProfile;
  bank: UserBank;
  rules?: import("@/types/user").TableRules;
  initializeTrainer: (game: Game) => void;
}

export function useCasinoGame({
  user,
  bank,
  rules,
  initializeTrainer,
}: UseCasinoGameProps) {
  const [game, setGame] = useState<Game | null>(null);
  const [player, setPlayer] = useState<Player | null>(null);
  const [phase, setPhase] = useState<GamePhase>("betting");
  const [roundsPlayed, setRoundsPlayed] = useState(0);
  const [totalWagered, setTotalWagered] = useState(0);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [currentBalance, setCurrentBalance] = useState(0);
  const [roundVersion, setRoundVersion] = useState(0);
  const [currentRound, setCurrentRound] = useState<any>(undefined);
  const [currentActions, setCurrentActions] = useState<any[]>([]);
  const [shoeDetails, setShoeDetails] = useState<any>(null);
  const decisionTracker = useRef<DecisionTracker | null>(null);
  const originalBalanceRef = useRef<number>(0);
  const searchParams = useSearchParams();

  // Initialize game
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
    setCurrentBalance(newPlayer.bank.balance);
    setCurrentRound(undefined);
    setCurrentActions([]);
    setShoeDetails(newGame.getShoeDetails());

    // Initialize decision tracker for this session
    decisionTracker.current = new DecisionTracker(session.id);

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

  // Update shoe details whenever round version changes
  useEffect(() => {
    if (game) {
      setShoeDetails(game.getShoeDetails());
    }
  }, [game, roundVersion]);

  return {
    // State
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
    originalBalanceRef,

    // Setters
    setPhase,
    setRoundsPlayed,
    setTotalWagered,
    setCurrentBalance,
    setRoundVersion,
    setCurrentRound,
    setCurrentActions,
  };
}
