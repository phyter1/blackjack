// casinoChips.ts

/**
 * Enhanced chip color with 3-color design:
 * - primary: Main border/edge color
 * - secondary: Accent/decoration color (must contrast with primary)
 * - center: Center spot color (standardized by tier)
 * - textColor: High-contrast text color for denomination
 */
export interface ChipColor {
  value: number;
  primary: string;
  secondary: string;
  center: string;
  textColor: string;
}

/**
 * Legacy single-color interface for backward compatibility
 */
export interface LegacyChipColor {
  value: number;
  hex: string;
}

export interface CasinoPaletteOptions {
  /**
   * Optional explicit denominations. If omitted, we use a standard
   * casino-style ladder between min and max:
   * [0.01, 0.05, 0.25, 0.5, 1, 5, 25, 100, 500, 1000, 5000, 10000]
   */
  denominations?: number[];
  /**
   * Minimum denomination to include (inclusive).
   * Defaults to the minimum in the standard ladder.
   */
  min?: number;
  /**
   * Maximum denomination to include (inclusive).
   * Defaults to the maximum in the standard ladder.
   */
  max?: number;
}

/**
 * Default "viable casino" denominations from 0.01 to 10000 units.
 * These mirror typical chip ladders (pennies, quarters, $1, $5, $25, etc.).
 */
export const STANDARD_DENOMS: number[] = [
  0.01, 0.05, 0.25, 0.5, 1, 5, 25, 100, 500, 1000, 5000, 10000,
];

/**
 * Standard center spot colors for chip tiers
 */
const CENTER_COLORS = {
  LOW_TIER: { bg: "#E5E7EB", text: "#111827" }, // Light gray with dark text (0.01-0.5)
  MID_TIER: { bg: "#FFF8DC", text: "#1F2937" }, // Cornsilk/cream with dark text (1-100)
  HIGH_TIER: { bg: "#1F2937", text: "#FEF3C7" }, // Dark gray with cream text (500-10000)
};

interface CanonicalChipColor {
  denom: number;
  primary: string;
  secondary: string;
  center: string;
  textColor: string;
}

/**
 * Canonical casino chip colors with 3-color design:
 * - primary: Main border/edge color
 * - secondary: Contrasting accent color
 * - center: Standardized by tier (LOW/MID/HIGH)
 * - textColor: High-contrast text
 *
 *  0.01  → copper/bronze
 *  0.05  → brown/tan
 *  0.25  → orange/yellow
 *  0.5   → grey/white
 *  1     → white/blue (BASE)
 *  5     → red/white
 *  25    → green/white
 *  100   → black/gold
 *  500   → purple/gold
 *  1000  → yellow/black
 *  5000  → orange/black
 *  10000 → slate/gold (high roller)
 */
const CANONICAL_CHIP_COLORS: CanonicalChipColor[] = [
  {
    denom: 0.01,
    primary: "#B87333",
    secondary: "#CD7F32",
    center: CENTER_COLORS.LOW_TIER.bg,
    textColor: CENTER_COLORS.LOW_TIER.text,
  }, // copper/bronze
  {
    denom: 0.05,
    primary: "#A0522D",
    secondary: "#D2B48C",
    center: CENTER_COLORS.LOW_TIER.bg,
    textColor: CENTER_COLORS.LOW_TIER.text,
  }, // sienna/tan
  {
    denom: 0.25,
    primary: "#D97706",
    secondary: "#FBBF24",
    center: CENTER_COLORS.LOW_TIER.bg,
    textColor: CENTER_COLORS.LOW_TIER.text,
  }, // orange/yellow
  {
    denom: 0.5,
    primary: "#9CA3AF",
    secondary: "#E5E7EB",
    center: CENTER_COLORS.LOW_TIER.bg,
    textColor: CENTER_COLORS.LOW_TIER.text,
  }, // grey/light grey
  {
    denom: 1,
    primary: "#F9FAFB",
    secondary: "#3B82F6",
    center: CENTER_COLORS.MID_TIER.bg,
    textColor: CENTER_COLORS.MID_TIER.text,
  }, // white/blue
  {
    denom: 5,
    primary: "#DC2626",
    secondary: "#FFFFFF",
    center: CENTER_COLORS.MID_TIER.bg,
    textColor: CENTER_COLORS.MID_TIER.text,
  }, // red/white
  {
    denom: 25,
    primary: "#16A34A",
    secondary: "#FFFFFF",
    center: CENTER_COLORS.MID_TIER.bg,
    textColor: CENTER_COLORS.MID_TIER.text,
  }, // green/white
  {
    denom: 100,
    primary: "#111827",
    secondary: "#FBBF24",
    center: CENTER_COLORS.MID_TIER.bg,
    textColor: CENTER_COLORS.MID_TIER.text,
  }, // black/gold
  {
    denom: 500,
    primary: "#7C3AED",
    secondary: "#FBBF24",
    center: CENTER_COLORS.HIGH_TIER.bg,
    textColor: CENTER_COLORS.HIGH_TIER.text,
  }, // purple/gold
  {
    denom: 1000,
    primary: "#FACC15",
    secondary: "#111827",
    center: CENTER_COLORS.HIGH_TIER.bg,
    textColor: CENTER_COLORS.HIGH_TIER.text,
  }, // yellow/black
  {
    denom: 5000,
    primary: "#EA580C",
    secondary: "#111827",
    center: CENTER_COLORS.HIGH_TIER.bg,
    textColor: CENTER_COLORS.HIGH_TIER.text,
  }, // orange/black
  {
    denom: 10000,
    primary: "#4B5563",
    secondary: "#FBBF24",
    center: CENTER_COLORS.HIGH_TIER.bg,
    textColor: CENTER_COLORS.HIGH_TIER.text,
  }, // slate/gold
];

/**
 * List of canonical chip denominations that have defined colors.
 * Use these for UI selectors to ensure exact color matching.
 */
export const CANONICAL_DENOMS: number[] = CANONICAL_CHIP_COLORS.map(
  (c) => c.denom,
);

/**
 * Get canonical casino chip colors without any theming.
 * Returns the enhanced 3-color casino chip design for given denominations.
 */
export function getCanonicalChipColors(denominations: number[]): ChipColor[] {
  if (denominations.length === 0) {
    return [];
  }

  return denominations.map((value) => {
    const mapped = findNearestCanonical(value, CANONICAL_CHIP_COLORS);
    return {
      value,
      primary: mapped.primary,
      secondary: mapped.secondary,
      center: mapped.center,
      textColor: mapped.textColor,
    };
  });
}

/**
 * @deprecated Use getCanonicalChipColors() instead for enhanced 3-color chip design.
 *
 * Legacy function that generates single-color chip palette with theming.
 * This function is kept for backward compatibility but returns the old format.
 */
export function generateStandardCasinoChipPalette(
  baseHex: string,
  options: CasinoPaletteOptions = {},
): LegacyChipColor[] {
  const min = options.min ?? Math.min(...STANDARD_DENOMS);
  const max = options.max ?? Math.max(...STANDARD_DENOMS);

  if (min <= 0 || min > max) {
    throw new Error("Invalid min/max for chip denominations");
  }

  let denominations: number[];

  if (options.denominations && options.denominations.length > 0) {
    // Use explicit denominations, clamp to [min, max], dedupe & sort
    const uniq = Array.from(new Set(options.denominations));
    denominations = uniq
      .filter((v) => v >= min && v <= max)
      .sort((a, b) => a - b);
  } else {
    // Use the standard ladder
    denominations = STANDARD_DENOMS.filter((v) => v >= min && v <= max).sort(
      (a, b) => a - b,
    );
  }

  if (denominations.length === 0) {
    return [];
  }

  // For legacy compatibility, just use primary color from canonical chips
  return denominations.map((value) => {
    const mapped = findNearestCanonical(value, CANONICAL_CHIP_COLORS);
    return {
      value,
      hex: mapped.primary, // Use primary color as the legacy "hex" color
    };
  });
}

/**
 * Optional helper: generate a 1–2–5-style ladder between min and max
 * if you want more granular denominations than the standard set.
 */
export function generate125Denominations(min: number, max: number): number[] {
  if (min <= 0 || max <= 0 || min > max) {
    throw new Error("min and max must be > 0 and min <= max");
  }

  const eps = 1e-9;
  const result: number[] = [];

  let exp = Math.floor(Math.log10(min));
  let safeguard = 0;

  outer: while (safeguard++ < 1000) {
    const base = Math.pow(10, exp);
    for (const m of [1, 2, 5]) {
      const val = m * base;

      if (val < min - eps) continue;
      if (val > max + eps) break outer;

      if (!result.includes(val)) {
        result.push(val);
      }
    }
    exp++;
  }

  return result.sort((a, b) => a - b);
}

// ---------- Color utilities ----------

interface Hsl {
  h: number; // 0–360
  s: number; // 0–100
  l: number; // 0–100
}

interface Rgb {
  r: number; // 0–255
  g: number; // 0–255
  b: number; // 0–255
}

function hexToHsl(hex: string): Hsl {
  const { r, g, b } = hexToRgb(hex);

  const rNorm = r / 255;
  const gNorm = g / 255;
  const bNorm = b / 255;

  const max = Math.max(rNorm, gNorm, bNorm);
  const min = Math.min(rNorm, gNorm, bNorm);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

    switch (max) {
      case rNorm:
        h = (gNorm - bNorm) / d + (gNorm < bNorm ? 6 : 0);
        break;
      case gNorm:
        h = (bNorm - rNorm) / d + 2;
        break;
      case bNorm:
        h = (rNorm - gNorm) / d + 4;
        break;
    }

    h /= 6;
  }

  return {
    h: h * 360,
    s: s * 100,
    l: l * 100,
  };
}

function hslToHex(h: number, s: number, l: number): string {
  const { r, g, b } = hslToRgb(h, s, l);
  return rgbToHex(r, g, b);
}

function hexToRgb(hex: string): Rgb {
  let clean = hex.trim();
  if (clean.startsWith("#")) clean = clean.slice(1);

  if (clean.length === 3) {
    clean = clean
      .split("")
      .map((c) => c + c)
      .join("");
  }

  if (clean.length !== 6) {
    throw new Error(`Invalid hex color: "${hex}"`);
  }

  const num = parseInt(clean, 16);
  const r = (num >> 16) & 0xff;
  const g = (num >> 8) & 0xff;
  const b = num & 0xff;

  return { r, g, b };
}

function hslToRgb(h: number, s: number, l: number): Rgb {
  const hNorm = normalizeHue(h) / 360;
  const sNorm = clamp(s, 0, 100) / 100;
  const lNorm = clamp(l, 0, 100) / 100;

  let r: number;
  let g: number;
  let b: number;

  if (sNorm === 0) {
    r = g = b = lNorm;
  } else {
    const q = lNorm < 0.5 ? lNorm * (1 + sNorm) : lNorm + sNorm - lNorm * sNorm;
    const p = 2 * lNorm - q;

    const hue2rgb = (pVal: number, qVal: number, t: number): number => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return pVal + (qVal - pVal) * 6 * t;
      if (t < 1 / 2) return qVal;
      if (t < 2 / 3) return pVal + (qVal - pVal) * (2 / 3 - t) * 6;
      return pVal;
    };

    r = hue2rgb(p, q, hNorm + 1 / 3);
    g = hue2rgb(p, q, hNorm);
    b = hue2rgb(p, q, hNorm - 1 / 3);
  }

  return {
    r: Math.round(r * 255),
    g: Math.round(g * 255),
    b: Math.round(b * 255),
  };
}

function rgbToHex(r: number, g: number, b: number): string {
  const toHex = (v: number) =>
    clamp(Math.round(v), 0, 255).toString(16).padStart(2, "0");

  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

// ---------- small helpers ----------

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function normalizeHue(h: number): number {
  let res = h % 360;
  if (res < 0) res += 360;
  return res;
}

/**
 * Smallest signed hue difference from "from" → "to".
 */
function hueDelta(from: number, to: number): number {
  let delta = to - from;
  if (delta > 180) delta -= 360;
  if (delta < -180) delta += 360;
  return delta;
}

function findNearestCanonical(
  denom: number,
  canonical: CanonicalChipColor[],
): CanonicalChipColor {
  if (canonical.length === 0) {
    throw new Error("Canonical chip list cannot be empty");
  }

  const logV = Math.log10(denom);
  let best = canonical[0];
  let bestDist = Infinity;

  for (const c of canonical) {
    const logC = Math.log10(c.denom);
    const dist = Math.abs(logC - logV);
    if (dist < bestDist) {
      bestDist = dist;
      best = c;
    }
  }

  return best;
}
