import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import type { GameSession, TableRules } from "@/types/user";

/**
 * UI State - All modal visibility, form inputs, and temporary UI concerns
 */
export interface UIState {
  // CasinoTable UI
  showTrainerSidebar: boolean;
  showSettingsDialog: boolean;
  previousBets: number[] | null;

  // UserDashboard UI
  showRulesSelector: boolean;
  currentRules: TableRules | undefined;
  pendingGameMode: "terminal" | "graphical" | undefined;
  selectedSession: GameSession | null;

  // BalancePanel UI
  showDeposit: boolean;
  showWithdraw: boolean;
  depositAmount: string;
  withdrawAmount: string;
  balanceError: string;

  // SessionsPanel UI
  viewMode: "recent" | "all";
  currentPage: number;

  // SessionReplay UI
  replayCurrentIndex: number;
  replayIsPlaying: boolean;

  // BettingPhase UI
  handBets: number[];
  selectedChipValue: number | null;
}

/**
 * UI Actions - All UI state mutations
 */
export interface UIActions {
  // CasinoTable Actions
  setShowTrainerSidebar: (show: boolean) => void;
  setShowSettingsDialog: (show: boolean) => void;
  setPreviousBets: (bets: number[] | null) => void;

  // UserDashboard Actions
  setShowRulesSelector: (show: boolean) => void;
  setCurrentRules: (rules: TableRules | undefined) => void;
  setPendingGameMode: (mode: "terminal" | "graphical" | undefined) => void;
  setSelectedSession: (session: GameSession | null) => void;

  // BalancePanel Actions
  setShowDeposit: (show: boolean) => void;
  setShowWithdraw: (show: boolean) => void;
  setDepositAmount: (amount: string) => void;
  setWithdrawAmount: (amount: string) => void;
  setBalanceError: (error: string) => void;

  // SessionsPanel Actions
  setViewMode: (mode: "recent" | "all") => void;
  setCurrentPage: (page: number) => void;

  // SessionReplay Actions
  setReplayCurrentIndex: (index: number) => void;
  setReplayIsPlaying: (playing: boolean) => void;

  // BettingPhase Actions
  setHandBets: (bets: number[]) => void;
  updateHandBet: (index: number, bet: number) => void;
  setSelectedChipValue: (value: number | null) => void;
  resetHandBets: () => void;

  // Batch Reset Actions
  resetCasinoTableUI: () => void;
  resetDashboardUI: () => void;
  resetBalancePanelUI: () => void;
  resetSessionsPanelUI: () => void;
  resetReplayUI: () => void;
  resetBettingUI: () => void;
  resetAllUI: () => void;
}

export type UIStore = UIState & UIActions;

const initialState: UIState = {
  // CasinoTable UI
  showTrainerSidebar: false,
  showSettingsDialog: false,
  previousBets: null,

  // UserDashboard UI
  showRulesSelector: false,
  currentRules: undefined,
  pendingGameMode: undefined,
  selectedSession: null,

  // BalancePanel UI
  showDeposit: false,
  showWithdraw: false,
  depositAmount: "",
  withdrawAmount: "",
  balanceError: "",

  // SessionsPanel UI
  viewMode: "recent",
  currentPage: 1,

  // SessionReplay UI
  replayCurrentIndex: 0,
  replayIsPlaying: false,

  // BettingPhase UI
  handBets: [0, 0, 0, 0, 0],
  selectedChipValue: null,
};

/**
 * Centralized UI store for all component UI state
 * Eliminates prop drilling and local useState for UI concerns
 */
export const useUIStore = create<UIStore>()(
  immer((set) => ({
    ...initialState,

    // CasinoTable Actions
    setShowTrainerSidebar: (show) =>
      set((state) => {
        state.showTrainerSidebar = show;
      }),

    setShowSettingsDialog: (show) =>
      set((state) => {
        state.showSettingsDialog = show;
      }),

    setPreviousBets: (bets) =>
      set((state) => {
        state.previousBets = bets;
      }),

    // UserDashboard Actions
    setShowRulesSelector: (show) =>
      set((state) => {
        state.showRulesSelector = show;
      }),

    setCurrentRules: (rules) =>
      set((state) => {
        state.currentRules = rules;
      }),

    setPendingGameMode: (mode) =>
      set((state) => {
        state.pendingGameMode = mode;
      }),

    setSelectedSession: (session) =>
      set((state) => {
        state.selectedSession = session;
      }),

    // BalancePanel Actions
    setShowDeposit: (show) =>
      set((state) => {
        state.showDeposit = show;
        if (!show) {
          state.depositAmount = "";
          state.balanceError = "";
        }
      }),

    setShowWithdraw: (show) =>
      set((state) => {
        state.showWithdraw = show;
        if (!show) {
          state.withdrawAmount = "";
          state.balanceError = "";
        }
      }),

    setDepositAmount: (amount) =>
      set((state) => {
        state.depositAmount = amount;
      }),

    setWithdrawAmount: (amount) =>
      set((state) => {
        state.withdrawAmount = amount;
      }),

    setBalanceError: (error) =>
      set((state) => {
        state.balanceError = error;
      }),

    // SessionsPanel Actions
    setViewMode: (mode) =>
      set((state) => {
        state.viewMode = mode;
        state.currentPage = 1; // Reset to page 1 when changing view mode
      }),

    setCurrentPage: (page) =>
      set((state) => {
        state.currentPage = page;
      }),

    // SessionReplay Actions
    setReplayCurrentIndex: (index) =>
      set((state) => {
        state.replayCurrentIndex = index;
      }),

    setReplayIsPlaying: (playing) =>
      set((state) => {
        state.replayIsPlaying = playing;
      }),

    // BettingPhase Actions
    setHandBets: (bets) =>
      set((state) => {
        state.handBets = bets;
      }),

    updateHandBet: (index, bet) =>
      set((state) => {
        state.handBets[index] = bet;
      }),

    setSelectedChipValue: (value) =>
      set((state) => {
        state.selectedChipValue = value;
      }),

    resetHandBets: () =>
      set((state) => {
        state.handBets = [0, 0, 0, 0, 0];
        state.selectedChipValue = null;
      }),

    // Batch Reset Actions
    resetCasinoTableUI: () =>
      set((state) => {
        state.showTrainerSidebar = initialState.showTrainerSidebar;
        state.showSettingsDialog = initialState.showSettingsDialog;
        state.previousBets = initialState.previousBets;
      }),

    resetDashboardUI: () =>
      set((state) => {
        state.showRulesSelector = initialState.showRulesSelector;
        state.currentRules = initialState.currentRules;
        state.pendingGameMode = initialState.pendingGameMode;
        state.selectedSession = initialState.selectedSession;
      }),

    resetBalancePanelUI: () =>
      set((state) => {
        state.showDeposit = initialState.showDeposit;
        state.showWithdraw = initialState.showWithdraw;
        state.depositAmount = initialState.depositAmount;
        state.withdrawAmount = initialState.withdrawAmount;
        state.balanceError = initialState.balanceError;
      }),

    resetSessionsPanelUI: () =>
      set((state) => {
        state.viewMode = initialState.viewMode;
        state.currentPage = initialState.currentPage;
      }),

    resetReplayUI: () =>
      set((state) => {
        state.replayCurrentIndex = initialState.replayCurrentIndex;
        state.replayIsPlaying = initialState.replayIsPlaying;
      }),

    resetBettingUI: () =>
      set((state) => {
        state.handBets = initialState.handBets;
        state.selectedChipValue = initialState.selectedChipValue;
      }),

    resetAllUI: () =>
      set(() => ({
        ...initialState,
      })),
  })),
);

// Selectors for optimized re-renders
export const selectShowTrainerSidebar = (state: UIStore) =>
  state.showTrainerSidebar;
export const selectShowSettingsDialog = (state: UIStore) =>
  state.showSettingsDialog;
export const selectPreviousBets = (state: UIStore) => state.previousBets;

export const selectShowRulesSelector = (state: UIStore) =>
  state.showRulesSelector;
export const selectCurrentRules = (state: UIStore) => state.currentRules;
export const selectPendingGameMode = (state: UIStore) => state.pendingGameMode;
export const selectSelectedSession = (state: UIStore) => state.selectedSession;

export const selectShowDeposit = (state: UIStore) => state.showDeposit;
export const selectShowWithdraw = (state: UIStore) => state.showWithdraw;
export const selectDepositAmount = (state: UIStore) => state.depositAmount;
export const selectWithdrawAmount = (state: UIStore) => state.withdrawAmount;
export const selectBalanceError = (state: UIStore) => state.balanceError;

export const selectViewMode = (state: UIStore) => state.viewMode;
export const selectCurrentPage = (state: UIStore) => state.currentPage;

export const selectReplayCurrentIndex = (state: UIStore) =>
  state.replayCurrentIndex;
export const selectReplayIsPlaying = (state: UIStore) => state.replayIsPlaying;

export const selectHandBets = (state: UIStore) => state.handBets;
export const selectSelectedChipValue = (state: UIStore) =>
  state.selectedChipValue;
