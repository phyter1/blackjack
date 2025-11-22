import { type GameChangeEvent, ObservableGame } from "@/lib/observable-game";
import { createTestDeck, parseTestScenario } from "@/modules/game";
import { RuleSet } from "@/modules/game/rules";
import { DecisionTracker } from "@/modules/strategy/decision-tracker";
import { HiLoCounter } from "@/modules/strategy/hi-lo-counter";
import { UserService } from "@/services/user-service";
import type { TableRules, UserBank, UserProfile } from "@/types/user";
import type { GameStore } from "../types";

export function createInitializationActions(set: any, get: () => GameStore) {
  return {
    initializeGame: async (
      user: UserProfile,
      bank: UserBank,
      rules: TableRules | undefined,
      searchParamsString?: string,
    ) => {
      const state = get();

      // Cleanup existing subscription
      if (state.unsubscribe) {
        state.unsubscribe();
      }

      // Parse test configuration
      let testConfig: { enabled: boolean; scenario?: string } = {
        enabled: false,
        scenario: undefined,
      };

      if (searchParamsString) {
        const params = new URLSearchParams(searchParamsString);
        testConfig = parseTestScenario(params);
      }

      // Check sessionStorage for test mode
      if (!testConfig.enabled && typeof window !== "undefined") {
        const sessionTestMode = sessionStorage.getItem("test-mode");
        if (sessionTestMode) {
          testConfig = { enabled: true, scenario: sessionTestMode };
        }
      }

      const testStack =
        testConfig.enabled && testConfig.scenario
          ? createTestDeck(testConfig.scenario, rules?.deckCount || 6)
          : undefined;

      // Build RuleSet
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

        if (rules.resplitAces) {
          ruleSet.setRule({ type: "resplit_aces", allowed: true });
        }
        if (rules.hitSplitAces) {
          ruleSet.setRule({ type: "hit_split_aces", allowed: true });
        }
        ruleSet.setRule({ type: "max_split", times: rules.maxSplits });

        // Apply table limits from rules if provided
        if (
          rules.minBet !== undefined &&
          rules.maxBet !== undefined &&
          rules.betUnit !== undefined
        ) {
          ruleSet.setTableLimits(rules.minBet, rules.maxBet, rules.betUnit);
        }
      }

      // Initialize ObservableGame
      const deckCount = rules?.deckCount || 6;
      const newGame = new ObservableGame(
        deckCount,
        0.75,
        1000000,
        ruleSet,
        testStack,
      );

      const newPlayer = newGame.addPlayer(user.name, bank.balance);
      const session = UserService.startSession(user.id, rules);

      // Initialize decision tracker
      const tracker = new DecisionTracker(session.id);

      // Initialize card counter
      const counter = new HiLoCounter(deckCount, false);

      // Subscribe to game changes
      const unsubscribe = newGame.subscribe((_event: GameChangeEvent) => {
        // Update state when game changes
        get().updateFromGame();
      });

      set((state: GameStore) => {
        state.game = newGame;
        state.player = newPlayer;
        state.sessionId = session.id;
        state.currentBalance = newPlayer.bank.balance;
        state.originalBalance = bank.balance;
        state.currentRound = undefined;
        state.currentActions = [];
        state.shoeDetails = newGame.getShoeDetails();
        state.decisionTracker = tracker;
        state.cardCounter = counter;
        state.unsubscribe = unsubscribe;
        state.phase = "betting";
        state.roundsPlayed = 0;
        state.totalWagered = 0;
        state.handsPendingInsurance = [];
        state.insuranceHandIndex = 0;
      });
    },

    cleanup: () => {
      const state = get();
      if (state.unsubscribe) {
        state.unsubscribe();
      }
      set((state: GameStore) => {
        state.unsubscribe = null;
      });
    },
  };
}
