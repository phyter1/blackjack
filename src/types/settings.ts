/**
 * User settings and preferences for the blackjack game
 */

export interface AnimationSettings {
  /** Delay between each dealt card in milliseconds (100-1000ms) */
  dealingSpeed: number;
  /** Whether to show card dealing animations */
  enableAnimations: boolean;
}

export interface GameSettings {
  /** Animation-related settings */
  animations: AnimationSettings;
  /** Sound settings (future) */
  // sounds: SoundSettings;
  /** Gameplay settings (future) */
  // gameplay: GameplaySettings;
}

/** Default settings for new users */
export const DEFAULT_SETTINGS: GameSettings = {
  animations: {
    dealingSpeed: 300, // 300ms default as requested
    enableAnimations: true,
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
} as const;
