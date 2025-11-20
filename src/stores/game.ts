import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import type { GamePhase } from "@/components/table/types";
import { type GameChangeEvent, ObservableGame } from "@/lib/observable-game";
import { createTestDeck, parseTestScenario } from "@/modules/game";
import type { ActionType } from "@/modules/game/action";
import type { Hand } from "@/modules/game/hand";
import type { Player } from "@/modules/game/player";
import type { Round } from "@/modules/game/round";
import { RuleSet, type ShoeDetails } from "@/modules/game";
import { DecisionTracker } from "@/modules/strategy/decision-tracker";
import { HiLoCounter } from "@/modules/strategy/hi-lo-counter";
import { UserService } from "@/services/user-service";
import type { TableRules, UserBank, UserProfile } from "@/types/user";
import { useAppStore } from "./app";
import { useTrainerStore } from "./trainer";

// Serialized hand type for UI (plain object, not class instance)
type SerializedHand = ReturnType<Hand["toObject"]>;

// Serialized round type for UI (only data properties, no methods/getters)
export type SerializedRound = {
  id: string;
  dealerHand: Round["dealerHand"];
  playerHands: SerializedHand[];
  state: Round["state"];
  currentHandIndex: number;
  settlementResults?: Round["settlementResults"];
  roundNumber: number;
};

export interface GameState {
  // Core game instances
  game: ObservableGame | null;
  player: Player | null;
  decisionTracker: DecisionTracker | null;
  cardCounter: HiLoCounter | null;

  // Game state
  phase: GamePhase;
  roundsPlayed: number;
  totalWagered: number;
  sessionId: string | null;
  currentBalance: number;
  currentRound: SerializedRound | undefined;
  currentActions: ActionType[];
  shoeDetails: ShoeDetails | null;
  originalBalance: number;
  roundVersion: number;

  // Insurance state
  handsPendingInsurance: number[];
  insuranceHandIndex: number;

  // Counting state
  countingEnabled: boolean;
  showCount: boolean;

  // Observable subscription
  unsubscribe: (() => void) | null;
}

export interface GameActions {
  // Initialization
  initializeGame: (
    user: UserProfile,
    bank: UserBank,
    rules: TableRules | undefined,
    searchParamsString?: string,
  ) => Promise<void>;
  cleanup: () => void;

  // Game actions (converted from handlers)
  placeBets: (bets: number[]) => Promise<void>;
  playAction: (action: ActionType) => Promise<void>;
  handleInsuranceAction: (takeInsurance: boolean) => void;
  handleNextRound: () => void;
  handleEndGame: (userId: string, onGameEnd: (bank: UserBank) => void) => void;

  // Phase management
  setPhase: (phase: GamePhase) => void;

  // Counting actions
  setCountingEnabled: (enabled: boolean) => void;
  setShowCount: (show: boolean) => void;

  // Internal state updates (called by actions)
  updateFromGame: () => void;
  updateSettlementOutcomes: () => void;
  updateInsuranceState: () => void;
}

export type GameStore = GameState & GameActions;

const initialState: Omit<
  GameState,
  "decisionTracker" | "cardCounter" | "unsubscribe"
> = {
  game: null,
  player: null,
  phase: "betting",
  roundsPlayed: 0,
  totalWagered: 0,
  sessionId: null,
  currentBalance: 0,
  currentRound: undefined,
  currentActions: [],
  shoeDetails: null,
  originalBalance: 0,
  roundVersion: 0,
  handsPendingInsurance: [],
  insuranceHandIndex: 0,
  countingEnabled: true,
  showCount: true,
};

/**
 * Game store with ObservableGame integration
 * Replaces use-casino-game, use-insurance, and use-counting hooks
 */
export const useGameStore = create<GameStore>()(
  immer((set, get) => ({
    ...initialState,
    decisionTracker: null,
    cardCounter: null,
    unsubscribe: null,

    // Initialization
    initializeGame: async (user, bank, rules, searchParamsString) => {
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
        if (rules.minBet !== undefined && rules.maxBet !== undefined && rules.betUnit !== undefined) {
          ruleSet.setTableLimits(
            rules.minBet,
            rules.maxBet,
            rules.betUnit,
          );
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

      set((state) => {
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
      set((state) => {
        state.unsubscribe = null;
      });
    },

    // Game Actions
    placeBets: async (bets) => {
      const state = get();
      const { game, player, cardCounter, countingEnabled } = state;

      if (!game || !player) {
        throw new Error("Game not initialized");
      }

      try {
        // Get trainer store for practice balance handling
        const { useTrainerStore } = await import("./trainer");
        const trainerState = useTrainerStore.getState();
        const isTrainerActive = trainerState.isActive;
        const practiceBalance = trainerState.practiceBalance;
        const trainer = trainerState.trainer;

        // In trainer mode, we'll track virtual balance separately
        if (isTrainerActive && trainer) {
          const totalBet = bets.reduce((sum, bet) => sum + bet, 0);
          if (totalBet > practiceBalance) {
            console.error(
              `Insufficient practice balance. Bet: ${totalBet}, Balance: ${practiceBalance}`,
            );
            return;
          }
          // Debit the bet from practice balance
          trainer.adjustPracticeBalance(-totalBet);
        }

        // Create PlayerBet array
        const playerBets = bets.map((amount) => ({
          playerId: player.id,
          amount,
        }));

        // Start the round - this will debit the bets from the player's bank
        game.startRound(playerBets);

        // Update state
        set((state) => {
          state.currentBalance = player.bank.balance;
          state.roundsPlayed += 1;
          state.phase = "dealing";
        });

        // Update round state
        get().updateFromGame();

        // Track dealt cards in the counter
        if (cardCounter && countingEnabled) {
          const round = game.getCurrentRound();
          if (round) {
            // Add all player cards
            for (const hand of round.playerHands) {
              cardCounter.addCards(hand.cards);
            }
            // Add dealer's up card
            if (round.dealerHand.upCard) {
              cardCounter.addCard(round.dealerHand.upCard);
            }
          }
        }

        // Track cards in trainer if active
        if (isTrainerActive && trainer) {
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
          trainerState.clearFeedback();
        }

        // Get settings for animation delay
        const { useSettingsStore } = await import("./settings");
        const settings = useSettingsStore.getState().settings;

        // Calculate total dealing time based on the number of cards and dealing speed
        const round = game.getCurrentRound();
        let totalCards = 2; // Dealer gets 2 cards
        if (round) {
          totalCards += round.playerHands.length * 2; // Each hand gets 2 cards initially
        }

        // Calculate wait time: max card index * dealing speed + buffer time for animation
        const dealingTime = settings.animations.enableAnimations
          ? Math.max(totalCards * settings.animations.dealingSpeed, 1000) + 300 // Add 300ms buffer
          : 100; // Minimal delay if animations are disabled

        // Wait for dealing animation
        await new Promise((resolve) => setTimeout(resolve, dealingTime));

        // After dealing animation, check for insurance or proceed to playing
        const roundAfterDealing = game.getCurrentRound();
        if (roundAfterDealing?.state === "insurance") {
          set((state) => {
            state.phase = "insurance";
          });
          get().updateInsuranceState();
        } else if (roundAfterDealing?.state === "player_turn") {
          set((state) => {
            state.phase = "playing";
          });
        } else {
          set((state) => {
            state.phase = "settling";
          });
        }
      } catch (error) {
        console.error("Error placing bets:", error);
        throw error;
      }
    },

    playAction: async (action) => {
      const state = get();
      const { game, player, decisionTracker, cardCounter, countingEnabled } =
        state;

      if (!game || !player) {
        throw new Error("Game not initialized");
      }

      const round = game.getCurrentRound();
      if (!round) {
        throw new Error("No active round");
      }

      try {
        // Get trainer store
        const trainerState = useTrainerStore.getState();
        const isTrainerActive = trainerState.isActive;
        const trainer = trainerState.trainer;

        const availableActions = game.getAvailableActions() ?? [];

        // Record the decision for strategy analysis
        if (round.state === "player_turn") {
          const currentHand = round.playerHands[round.currentHandIndex];
          if (currentHand && decisionTracker) {
            const dealerUpCard = round.dealerHand.upCard;

            // Determine what actions are available
            const canDouble = availableActions.includes("double");
            const canSplit = availableActions.includes("split");
            const canSurrender = availableActions.includes("surrender");

            // Get basic strategy recommendation
            const { getBasicStrategyDecision } = await import(
              "@/modules/strategy/basic-strategy"
            );
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
              countingEnabled && cardCounter
                ? cardCounter.getSnapshot()
                : undefined;

            // Record the decision
            decisionTracker.recordDecision(
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
            if (isTrainerActive && trainer) {
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
              trainerState.refreshStats();
            }
          }
        }

        // Track cards before action
        const currentRound = game.getCurrentRound();
        const cardsBefore = currentRound
          ? currentRound.playerHands.reduce((sum, h) => sum + h.cards.length, 0)
          : 0;

        // Play the action
        game.playAction(action);

        // Update balance after action (in case of double down which debits more money)
        set((state) => {
          state.currentBalance = player.bank.balance;
        });

        // Track any new cards dealt (from hit, split, double)
        if (cardCounter && countingEnabled) {
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
              cardCounter.addCards(newCards);
            }
          }
        }

        // Update state from game
        get().updateFromGame();

        // Increment roundVersion to force re-render of components watching this value
        set((state) => {
          state.roundVersion = (state.roundVersion || 0) + 1;
        });

        const newRound = game.getCurrentRound();
        const newActions = game.getAvailableActions() ?? [];

        // Check if we're still in player turn with actions available
        if (newActions.length > 0 && newRound?.state === "player_turn") {
          // Still in player turn, don't proceed to dealer turn
          return;
        }

        // No more actions, move to dealer turn
        set((state) => {
          state.phase = "dealer_turn";
        });

        // Track dealer's hole card and any dealer hits
        if (cardCounter && countingEnabled) {
          const round = game.getCurrentRound();
          if (round) {
            const dealerCards = round.dealerHand.cards;
            // Add hole card (second card, index 1) if it exists
            if (dealerCards.length >= 2 && dealerCards[1]) {
              cardCounter.addCard(dealerCards[1]);
            }
            // Add any additional dealer cards beyond the initial 2
            if (dealerCards.length > 2) {
              cardCounter.addCards(dealerCards.slice(2));
            }
          }
        }

        // Wait before settling
        await new Promise((resolve) => setTimeout(resolve, 1500));

        set((state) => {
          state.phase = "settling";
        });
      } catch (error) {
        console.error("Error playing action:", error);
        throw error;
      }
    },

    handleInsuranceAction: (takeInsurance) => {
      const state = get();
      const { game, handsPendingInsurance, insuranceHandIndex } = state;

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
        set((state) => {
          state.insuranceHandIndex = remainingHands[0];
          state.handsPendingInsurance = remainingHands;
        });
      } else {
        // All hands processed, resolve insurance
        game.resolveInsurance();

        // Check round state after insurance resolution
        const round = game.getCurrentRound();
        if (round?.state === "settling" || round?.state === "complete") {
          // Dealer has blackjack - go to settling
          setTimeout(() => {
            set((state) => {
              state.phase = "settling";
            });
            get().updateFromGame();
          }, 500);
        } else {
          set((state) => {
            state.phase = "playing";
          });
          get().updateFromGame();
        }
      }
    },

    handleNextRound: () => {
      const state = get();
      const { game, player } = state;

      if (!game || !player) return;

      // Check actual player balance
      if (player.bank.balance < 10) {
        // End game if out of money

        const userId = useAppStore.getState().user?.id;
        const onGameEnd = useAppStore.getState().handleGameEnd;
        if (userId && onGameEnd) {
          get().handleEndGame(userId, onGameEnd);
        }
        return;
      }

      // Track total wagered from this round before completing it
      const round = game.getCurrentRound();
      if (round) {
        const roundWagered = round.playerHands.reduce(
          (sum, hand) => sum + hand.betAmount,
          0,
        );
        set((state) => {
          state.totalWagered += roundWagered;
        });
      }

      try {
        game.completeRound();

        set((state) => {
          state.phase = "betting";
          state.currentRound = undefined;
          state.currentActions = [];
          state.handsPendingInsurance = [];
          state.insuranceHandIndex = 0;
        });

        get().updateFromGame();
      } catch (error) {
        console.error("Error starting next round:", error);
      }
    },

    handleEndGame: (_userId, onGameEnd) => {
      const state = get();
      const {
        game,
        sessionId,
        roundsPlayed,
        totalWagered,
        decisionTracker,
        originalBalance,
      } = state;

      if (!game || !sessionId) return;

      try {
        // End the game session
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

        // Get final balance
        const player = game.getPlayer(game.getAllPlayers()[0].id);
        const finalBalance = player?.bank.balance || originalBalance;

        // End session and pass analysis
        UserService.endSession(
          sessionId,
          roundsPlayed,
          finalBalance,
          game.getSessionId(),
          strategyAnalysis,
          totalWagered,
        );

        // Get updated bank
        const updatedBank = UserService.getCurrentUser()?.bank;

        // Cleanup subscription
        if (state.unsubscribe) {
          state.unsubscribe();
        }

        // Call the callback
        if (updatedBank) {
          onGameEnd(updatedBank);
        }
      } catch (error) {
        console.error("Error ending game:", error);
      }
    },

    // Phase Management
    setPhase: (phase) =>
      set((state) => {
        state.phase = phase;
      }),

    // Counting Actions
    setCountingEnabled: (enabled) =>
      set((state) => {
        state.countingEnabled = enabled;
      }),

    setShowCount: (show) =>
      set((state) => {
        state.showCount = show;
      }),

    // Internal Updates
    updateFromGame: () => {
      const state = get();
      const { game, player, phase } = state;

      if (!game || !player) return;

      const round = game.getCurrentRound();

      set((state) => {
        // Serialize round data to plain objects for React
        if (round) {
          state.currentRound = {
            ...round,
            playerHands: round.playerHands.map((hand) => hand.toObject()),
          };
        } else {
          state.currentRound = undefined;
        }
        state.currentActions = game.getAvailableActions();
        state.shoeDetails = game.getShoeDetails();
        state.currentBalance = player.bank.balance;
      });

      // Update settlement outcomes if we're in settling phase
      if (phase === "settling") {
        get().updateSettlementOutcomes();
      }
    },

    updateSettlementOutcomes: () => {
      const state = get();
      const { game, player, decisionTracker } = state;

      if (!game || !player || !decisionTracker) return;

      const round = game.getCurrentRound();
      if (!round?.settlementResults) return;

      // Get trainer store
      const { useTrainerStore } = require("./trainer");
      const trainerState = useTrainerStore.getState();
      const isTrainerActive = trainerState.isActive;
      const trainer = trainerState.trainer;

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
      if (isTrainerActive && trainer && player) {
        trainerState.refreshStats();

        // In trainer mode, restore the original balance to prevent
        // the real bank from being modified
        // We need to undo all the game's bank modifications
        const round = game.getCurrentRound();
        if (round) {
          // Calculate total bet for this round
          const totalBet = round.playerHands.reduce(
            (sum, hand) => sum + hand.betAmount,
            0,
          );
          // Calculate total payout from settlement
          const totalPayout =
            round.settlementResults?.reduce(
              (sum, result) => sum + result.payout,
              0,
            ) || 0;

          // Reverse the game's bank operations:
          // The game debited totalBet and credited totalPayout
          // We need to undo this: debit payout, credit bet back
          if (totalPayout > 0) {
            player.bank.debit(totalPayout, "trainer-reversal");
          }
          if (totalBet > 0) {
            player.bank.credit(totalBet, "trainer-reversal");
          }
        }
      }

      // Update UI balance after settlement
      set((state) => {
        state.currentBalance = player.bank.balance;
      });
    },

    updateInsuranceState: () => {
      const state = get();
      const { game, phase } = state;

      if (phase === "insurance" && game) {
        const round = game.getCurrentRound();
        if (round) {
          const pendingHands = round.playerHands
            .map((hand, index) => ({ hand, index }))
            .filter(({ hand }) => hand.insuranceOffered && !hand.hasInsurance)
            .map(({ index }) => index);

          set((state) => {
            state.handsPendingInsurance = pendingHands;
            if (pendingHands.length > 0) {
              state.insuranceHandIndex = pendingHands[0];
            }
          });
        }
      }
    },
  })),
);

// Selectors for optimized re-renders
export const selectGame = (state: GameStore) => state.game;
export const selectPlayer = (state: GameStore) => state.player;
export const selectPhase = (state: GameStore) => state.phase;
export const selectRoundsPlayed = (state: GameStore) => state.roundsPlayed;
export const selectTotalWagered = (state: GameStore) => state.totalWagered;
export const selectCurrentBalance = (state: GameStore) => state.currentBalance;
export const selectCurrentRound = (state: GameStore) => state.currentRound;
export const selectCurrentActions = (state: GameStore) => state.currentActions;
export const selectShoeDetails = (state: GameStore) => state.shoeDetails;
export const selectDecisionTracker = (state: GameStore) =>
  state.decisionTracker;
export const selectCardCounter = (state: GameStore) => state.cardCounter;
export const selectCountingEnabled = (state: GameStore) =>
  state.countingEnabled;
export const selectShowCount = (state: GameStore) => state.showCount;
export const selectHandsPendingInsurance = (state: GameStore) =>
  state.handsPendingInsurance;
export const selectInsuranceHandIndex = (state: GameStore) =>
  state.insuranceHandIndex;
