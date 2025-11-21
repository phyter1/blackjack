export interface ChipConfig {
  denominations: number[]; // Array of chip values (e.g., [5, 10, 25, 100])
}

export interface TableLimitsKey {
  minBet: number;
  maxBet: number;
  betUnit: number;
}

/**
 * Generate a unique key for table limits to store/retrieve chip configurations
 */
export function getTableLimitsKey(limits: TableLimitsKey): string {
  return `${limits.minBet}-${limits.maxBet}-${limits.betUnit}`;
}

/**
 * Canonical casino chip denominations with exact color mappings
 */
const CANONICAL_CHIP_DENOMS = [0.01, 0.05, 0.25, 0.5, 1, 5, 25, 100, 500, 1000, 5000, 10000];

/**
 * Generate default chip denominations based on table limits
 * Only uses canonical casino chip denominations for exact color matching
 */
export function generateDefaultChips(limits: TableLimitsKey): number[] {
  const { minBet, maxBet, betUnit } = limits;

  // Filter canonical denominations that fit the table limits
  const validChips = CANONICAL_CHIP_DENOMS.filter((denom) => {
    // Must be >= bet unit and <= max bet
    if (denom < betUnit || denom > maxBet) return false;

    // Must be a multiple of bet unit (with tolerance for floating point)
    const tolerance = 0.0001;
    const remainder = denom % betUnit;
    if (remainder > tolerance && remainder < betUnit - tolerance) return false;

    return true;
  });

  // If we have too few chips, include some smaller denoms if possible
  if (validChips.length < 4) {
    // Try to include chips that are at least half the bet unit
    const halfUnitChips = CANONICAL_CHIP_DENOMS.filter((denom) => {
      return denom >= betUnit / 2 && denom < betUnit;
    });
    validChips.unshift(...halfUnitChips);
  }

  // Remove duplicates and sort
  const uniqueChips = Array.from(new Set(validChips)).sort((a, b) => a - b);

  // Return up to 7 chips
  return uniqueChips.slice(0, 7);
}

/**
 * Validate chip denominations
 */
export function validateChipDenominations(
  denominations: number[],
  limits: TableLimitsKey,
): { valid: boolean; error?: string } {
  if (denominations.length === 0) {
    return { valid: false, error: "At least one chip denomination is required" };
  }

  if (denominations.length > 7) {
    return { valid: false, error: "Maximum 7 chip denominations allowed" };
  }

  // Check all denominations are positive
  if (denominations.some((d) => d <= 0)) {
    return { valid: false, error: "All chip denominations must be positive" };
  }

  // Check all are multiples of bet unit
  const { betUnit } = limits;
  const tolerance = 0.0001;
  for (const denom of denominations) {
    const remainder = denom % betUnit;
    if (remainder > tolerance && remainder < betUnit - tolerance) {
      return {
        valid: false,
        error: `All chip denominations must be multiples of bet unit (${betUnit})`,
      };
    }
  }

  return { valid: true };
}
