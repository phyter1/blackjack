import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import { UserService } from "@/services/user-service";
import type { TableRules, UserBank, UserProfile } from "@/types/user";

export type AppState = "auth" | "dashboard" | "game";
export type GameMode = "terminal" | "graphical";
export type AuthMode = "login" | "signup";

/**
 * App State - Application-level navigation and user state
 */
export interface AppStateData {
  // App navigation
  appState: AppState;
  loading: boolean;

  // User & Bank
  user: UserProfile | null;
  bank: UserBank | null;

  // Game configuration
  gameMode: GameMode;
  currentRules: TableRules | undefined;

  // Auth form state
  authMode: AuthMode;
  authName: string;
  authInitialBalance: string;
  authError: string;
  authLoading: boolean;
}

/**
 * App Actions - Application-level mutations
 */
export interface AppActions {
  // Initialization
  initialize: () => Promise<void>;

  // Authentication
  setAuthMode: (mode: AuthMode) => void;
  setAuthName: (name: string) => void;
  setAuthInitialBalance: (balance: string) => void;
  setAuthError: (error: string) => void;
  setAuthLoading: (loading: boolean) => void;
  handleAuthenticated: (user: UserProfile, bank: UserBank) => void;
  handleLogout: () => void;

  // Navigation
  goToAuth: () => void;
  goToDashboard: () => void;
  goToGame: (mode?: GameMode, rules?: TableRules) => void;

  // User & Bank
  updateBank: (bank: UserBank) => void;
  refreshUserData: () => void;

  // Game
  setGameMode: (mode: GameMode) => void;
  setCurrentRules: (rules: TableRules | undefined) => void;
  handleGameEnd: (bank: UserBank) => void;
  handleBackToDashboard: () => void;
}

export type AppStore = AppStateData & AppActions;

const initialState: AppStateData = {
  // App navigation
  appState: "auth",
  loading: true,

  // User & Bank
  user: null,
  bank: null,

  // Game configuration
  gameMode: "graphical",
  currentRules: undefined,

  // Auth form state
  authMode: "login",
  authName: "",
  authInitialBalance: "1000",
  authError: "",
  authLoading: false,
};

/**
 * Application-level store
 * Manages authentication, navigation, user state
 */
export const useAppStore = create<AppStore>()(
  immer((set, _get) => ({
    ...initialState,

    // Initialization
    initialize: async () => {
      try {
        // Check for test-mode URL parameter
        if (typeof window !== "undefined") {
          const params = new URLSearchParams(window.location.search);
          const testMode = params.get("test-mode");
          if (testMode) {
            sessionStorage.setItem("test-mode", testMode);
            console.log(`Test mode enabled: ${testMode}`);
          }
        }

        // Check if user is already logged in
        const currentUser = UserService.getCurrentUser();
        if (currentUser) {
          set((state) => {
            state.user = currentUser.user;
            state.bank = currentUser.bank;
            state.appState = "dashboard";
            state.loading = false;
          });
        } else {
          set((state) => {
            state.loading = false;
          });
        }
      } catch (error) {
        console.error("Error initializing app:", error);
        set((state) => {
          state.loading = false;
        });
      }
    },

    // Authentication Actions
    setAuthMode: (mode) =>
      set((state) => {
        state.authMode = mode;
        state.authError = "";
      }),

    setAuthName: (name) =>
      set((state) => {
        state.authName = name;
      }),

    setAuthInitialBalance: (balance) =>
      set((state) => {
        state.authInitialBalance = balance;
      }),

    setAuthError: (error) =>
      set((state) => {
        state.authError = error;
      }),

    setAuthLoading: (loading) =>
      set((state) => {
        state.authLoading = loading;
      }),

    handleAuthenticated: (user, bank) =>
      set((state) => {
        state.user = user;
        state.bank = bank;
        state.appState = "dashboard";
        // Reset auth form
        state.authMode = "login";
        state.authName = "";
        state.authInitialBalance = "1000";
        state.authError = "";
        state.authLoading = false;
      }),

    handleLogout: () =>
      set((state) => {
        UserService.logout();
        state.user = null;
        state.bank = null;
        state.appState = "auth";
        // Reset game state
        state.gameMode = "graphical";
        state.currentRules = undefined;
      }),

    // Navigation Actions
    goToAuth: () =>
      set((state) => {
        state.appState = "auth";
      }),

    goToDashboard: () =>
      set((state) => {
        state.appState = "dashboard";
      }),

    goToGame: (mode = "graphical", rules) =>
      set((state) => {
        state.gameMode = mode;
        state.currentRules = rules;
        state.appState = "game";
      }),

    // User & Bank Actions
    updateBank: (bank) =>
      set((state) => {
        state.bank = bank;
      }),

    refreshUserData: () =>
      set((state) => {
        const currentUser = UserService.getCurrentUser();
        if (currentUser) {
          state.user = currentUser.user;
          state.bank = currentUser.bank;
        }
      }),

    // Game Actions
    setGameMode: (mode) =>
      set((state) => {
        state.gameMode = mode;
      }),

    setCurrentRules: (rules) =>
      set((state) => {
        state.currentRules = rules;
      }),

    handleGameEnd: (bank) =>
      set((state) => {
        state.bank = bank;
      }),

    handleBackToDashboard: () =>
      set((state) => {
        // Refresh user data from storage
        const currentUser = UserService.getCurrentUser();
        if (currentUser) {
          state.user = currentUser.user;
          state.bank = currentUser.bank;
        }
        state.appState = "dashboard";
      }),
  })),
);

// Selectors for optimized re-renders
export const selectAppState = (state: AppStore) => state.appState;
export const selectLoading = (state: AppStore) => state.loading;
export const selectUser = (state: AppStore) => state.user;
export const selectBank = (state: AppStore) => state.bank;
export const selectGameMode = (state: AppStore) => state.gameMode;
export const selectCurrentRules = (state: AppStore) => state.currentRules;

export const selectAuthMode = (state: AppStore) => state.authMode;
export const selectAuthName = (state: AppStore) => state.authName;
export const selectAuthInitialBalance = (state: AppStore) =>
  state.authInitialBalance;
export const selectAuthError = (state: AppStore) => state.authError;
export const selectAuthLoading = (state: AppStore) => state.authLoading;
