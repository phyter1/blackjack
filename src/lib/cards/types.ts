/**
 * Playing card suits
 */
export type Suit = "hearts" | "diamonds" | "clubs" | "spades";

/**
 * Playing card ranks
 */
export type Rank =
  | "A"
  | "2"
  | "3"
  | "4"
  | "5"
  | "6"
  | "7"
  | "8"
  | "9"
  | "10"
  | "J"
  | "Q"
  | "K";

/**
 * Card notation (e.g., "As" for Ace of Spades, "Kh" for King of Hearts)
 */
export type CardNotation = `${Rank}${"h" | "d" | "c" | "s"}`;

/**
 * Available card back designs
 */
export type CardBackDesign =
  | "bicycle-classic"
  | "geometric-hexagons"
  | "geometric-diamonds"
  | "art-deco-sunburst"
  | "victorian-arabesque"
  | "minimal-dots"
  | "chevron"
  | "solid"
  | "svg-01"
  | "svg-02"
  | "svg-03"
  | "svg-05"
  | "svg-06"
  | "svg-10"
  | "svg-11"
  | "svg-12";

/**
 * Color palette for card backs
 */
export interface CardBackColors {
  /** Primary pattern color */
  primary: string;
  /** Secondary pattern color */
  secondary: string;
  /** Background color */
  background: string;
  /** Border color (optional) */
  border?: string;
}

/**
 * Props for the PlayingCard component
 */
export interface PlayingCardProps {
  /** Card notation or 'back' to show card back */
  card: CardNotation | "back";
  /** Width of the card in pixels */
  width?: number;
  /** Height of the card in pixels */
  height?: number;
  /** Border radius in pixels */
  borderRadius?: number;
  /** Card back design (only used when card='back') */
  backDesign?: CardBackDesign;
  /** Custom colors for card back */
  backColors?: Partial<CardBackColors>;
  /** CSS class name */
  className?: string;
  /** Inline styles */
  style?: React.CSSProperties;
  /** Click handler */
  onClick?: () => void;
}

/**
 * Props for the CardBack component
 */
export interface CardBackProps {
  /** Design pattern to use */
  design?: CardBackDesign;
  /** Color palette */
  colors?: Partial<CardBackColors>;
  /** Card stock color (replaces white background) */
  stockColor?: string;
  /** Width in pixels */
  width?: number;
  /** Height in pixels */
  height?: number;
  /** Border radius in pixels */
  borderRadius?: number;
}

/**
 * Props for pattern components
 */
export interface PatternComponentProps {
  colors: CardBackColors;
  stockColor?: string;
}
