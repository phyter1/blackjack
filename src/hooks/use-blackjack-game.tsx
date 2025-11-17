"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import { Game, type PlayerBet } from "@/modules/game/game";
import { RuleSet } from "@/modules/game/rules";
import type { Player } from "@/modules/game/player";
import type { Round } from "@/modules/game/round";
import type { ActionType } from "@/modules/game/action";

// Wrapper around Game that supports subscriptions
class GameStore {
  private game: Game;
  private player: Player | null = null;
  private listeners = new Set<() => void>();
  private version = 0;
  private cachedSnapshot: {
    game: Game;
    currentPlayer: Player | null;
    currentRound: Round | undefined;
    gameState: "waiting_for_bets" | "in_round" | "round_complete";
    playerBalance: number;
    roundNumber: number;
    currentBet: number | undefined;
    version: number;
  } | null = null;

  constructor() {
    this.game = new Game(6, 0.75, 1000000, new RuleSet());
    this.updateSnapshot();
  }

  subscribe = (listener: () => void) => {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  };

  private notify = () => {
    this.version++;
    this.updateSnapshot();
    this.listeners.forEach((listener) => listener());
  };

  private updateSnapshot = () => {
    const currentRound = this.game.getCurrentRound();

    // Create a shallow copy of the round with cloned arrays to ensure React detects changes
    const roundSnapshot = currentRound
      ? {
          ...currentRound,
          dealerHand: {
            ...currentRound.dealerHand,
            cards: [...currentRound.dealerHand.cards],
          },
          playerHands: currentRound.playerHands.map((hand) => ({
            ...hand,
            hand: [...hand.hand],
          })),
        }
      : undefined;

    this.cachedSnapshot = {
      game: this.game,
      currentPlayer: this.player,
      currentRound: roundSnapshot as Round | undefined,
      gameState: this.game.getState(),
      playerBalance: this.player?.bank.balance ?? 0,
      roundNumber: this.game.getStats().roundNumber,
      currentBet: currentRound?.playerHands[0]?.betAmount,
      version: this.version,
    };
  };

  getSnapshot = () => {
    return this.cachedSnapshot!;
  };

  addPlayer = (name: string, bankroll: number) => {
    this.player = this.game.addPlayer(name, bankroll);
    this.notify();
    return this.player;
  };

  placeBet = (bets: number | number[]) => {
    if (!this.player) throw new Error("No player");

    // Support both single bet (number) and multi-hand (array) for backward compatibility
    const betAmounts = Array.isArray(bets) ? bets : [bets];

    // Create PlayerBet array - one entry per hand
    const playerBets: PlayerBet[] = betAmounts.map((amount) => ({
      playerId: this.player!.id,
      amount,
    }));

    this.game.startRound(playerBets);
    this.notify();
  };

  playAction = (action: ActionType) => {
    this.game.playAction(action);
    this.notify();
  };

  takeInsurance = (handIndex: number) => {
    this.game.takeInsurance(handIndex);
    this.notify();
  };

  declineInsurance = (handIndex: number) => {
    this.game.declineInsurance(handIndex);
    this.notify();
  };

  resolveInsurance = () => {
    this.game.resolveInsurance();
    this.notify();
  };

  completeRound = () => {
    this.game.completeRound();
    this.notify();
  };

  getAvailableActions = () => this.game.getAvailableActions();
  getPlayerBalance = () => this.player?.bank.balance ?? 0;
  getRoundNumber = () => this.game.getStats().roundNumber;
}

interface BlackjackGameContextType {
  store: GameStore;
}

const BlackjackGameContext = createContext<
  BlackjackGameContextType | undefined
>(undefined);

export function BlackjackGameProvider({ children }: { children: ReactNode }) {
  const [store] = useState(() => new GameStore());

  const value = { store };

  return (
    <BlackjackGameContext.Provider value={value}>
      {children}
    </BlackjackGameContext.Provider>
  );
}

export function useBlackjackGame() {
  const context = useContext(BlackjackGameContext);
  if (!context) {
    throw new Error(
      "useBlackjackGame must be used within BlackjackGameProvider",
    );
  }

  const { store } = context;

  // Subscribe to store changes
  const snapshot = useSyncExternalStore(
    store.subscribe,
    store.getSnapshot,
    store.getSnapshot,
  );

  return {
    game: snapshot.game,
    currentPlayer: snapshot.currentPlayer,
    currentRound: snapshot.currentRound,
    gameState: snapshot.gameState,

    // Actions
    startGame: (playerName: string, bankroll: number) =>
      store.addPlayer(playerName, bankroll),
    placeBet: (bets: number | number[]) => store.placeBet(bets),
    playAction: (action: ActionType) => store.playAction(action),
    takeInsurance: (handIndex: number) => store.takeInsurance(handIndex),
    declineInsurance: (handIndex: number) => store.declineInsurance(handIndex),
    resolveInsurance: () => store.resolveInsurance(),
    completeRound: () => store.completeRound(),

    // Getters - use snapshot values instead of calling methods
    getAvailableActions: () => store.getAvailableActions(),
    getPlayerBalance: () => snapshot.playerBalance,
    getRoundNumber: () => snapshot.roundNumber,
    getCurrentBet: () => snapshot.currentBet,
  };
}
