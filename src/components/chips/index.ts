/**
 * Modular SVG-based chip components for casino gaming
 *
 * This module provides reusable chip components using SVG designs:
 * - DenomChip: Ornate design for denominational betting chips
 * - ActionChip: Hexagonal design for action buttons
 * - SvgChip: Base component for custom chip implementations
 */

export { SvgChip } from "./svg-chip";
export type { ChipSvgType } from "./svg-chip";

export {
  DenomChip,
  CHIP_VALUES,
  getChipColor,
  generateChipConfigs,
} from "./denom-chip";
export { ActionChip } from "./action-chip";
export { CasinoChip } from "./casino-chip";
export { CasinoChip3D } from "./casino-chip-3d";
