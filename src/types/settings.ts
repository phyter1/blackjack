/**
 * User settings and preferences for the blackjack game
 */

export interface AnimationSettings {
  /** Delay between each dealt card in milliseconds (100-1000ms) */
  dealingSpeed: number;
  /** Whether to show card dealing animations */
  enableAnimations: boolean;
}

export interface TableLimitsSettings {
  /** Minimum bet allowed at the table */
  minBet: number;
  /** Maximum bet allowed at the table */
  maxBet: number;
  /** Minimum betting unit (bets must be multiples of this) */
  betUnit: number;
}

export interface GameSettings {
  /** Animation-related settings */
  animations: AnimationSettings;
  /** Table betting limits */
  tableLimits: TableLimitsSettings;
  /** Sound settings (future) */
  // sounds: SoundSettings;
  /** Gameplay settings (future) */
  // gameplay: GameplaySettings;
}

/** Common table limit presets */
export const TABLE_LIMIT_PRESETS = {
  lowLimit: {
    minBet: 1,
    maxBet: 100,
    betUnit: 1,
    label: "Low Limit ($1-$100)",
  },
  standard: { minBet: 5, maxBet: 1000, betUnit: 5, label: "$5 Table" },
  midRoller: {
    minBet: 25,
    maxBet: 5000,
    betUnit: 25,
    label: "$25 Table",
  },
  highRoller: {
    minBet: 100,
    maxBet: 100000,
    betUnit: 100,
    label: "High Roller",
  },
} as const;

/** Default settings for new users */
export const DEFAULT_SETTINGS: GameSettings = {
  animations: {
    dealingSpeed: 300, // 300ms default as requested
    enableAnimations: true,
  },
  tableLimits: {
    minBet: 5,
    maxBet: 1000,
    betUnit: 5,
  },
};

/** Min and max values for settings */
export const SETTINGS_CONSTRAINTS = {
  animations: {
    dealingSpeed: {
      min: 100,
      max: 1000,
      step: 50,
    },
  },
  tableLimits: {
    minBet: {
      min: 1,
      max: 1000,
      step: 1,
    },
    maxBet: {
      min: 10,
      max: 1000000,
      step: 10,
    },
    betUnit: {
      min: 1,
      max: 100,
      step: 1,
    },
  },
} as const;
