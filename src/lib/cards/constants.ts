import { CardBackColors } from "./types";

/**
 * Default color schemes for different card back designs
 */
export const DEFAULT_BACK_COLORS: Record<string, CardBackColors> = {
  "bicycle-classic": {
    primary: "#E21C21",
    secondary: "#FFFFFF",
    background: "#FFFFFF",
    border: "#000000",
  },
  "geometric-hexagons": {
    primary: "#2563EB",
    secondary: "#FFFFFF",
    background: "#F8FAFC",
    border: "#1E40AF",
  },
  "geometric-diamonds": {
    primary: "#7C3AED",
    secondary: "#FFFFFF",
    background: "#FAF5FF",
    border: "#6D28D9",
  },
  "art-deco-sunburst": {
    primary: "#F59E0B",
    secondary: "#78350F",
    background: "#FFFBEB",
    border: "#92400E",
  },
  "victorian-arabesque": {
    primary: "#BE123C",
    secondary: "#FFE4E6",
    background: "#FFFFFF",
    border: "#881337",
  },
  "minimal-dots": {
    primary: "#334155",
    secondary: "#E2E8F0",
    background: "#FFFFFF",
    border: "#1E293B",
  },
  chevron: {
    primary: "#059669",
    secondary: "#FFFFFF",
    background: "#ECFDF5",
    border: "#047857",
  },
  solid: {
    primary: "#1F2937",
    secondary: "#1F2937",
    background: "#1F2937",
    border: "#111827",
  },
};

/**
 * Default card dimensions (poker size)
 */
export const DEFAULT_CARD_WIDTH = 225;
export const DEFAULT_CARD_HEIGHT = 315;
export const DEFAULT_BORDER_RADIUS = 12;

/**
 * Aspect ratio for poker-sized cards
 */
export const CARD_ASPECT_RATIO = DEFAULT_CARD_HEIGHT / DEFAULT_CARD_WIDTH; // 1.4
