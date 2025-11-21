import {
  type ChipConfig,
  generateDefaultChips,
  getTableLimitsKey,
  type TableLimitsKey,
} from "@/types/chip-config";

const CHIP_CONFIGS_KEY = "blackjack-chip-configs";

export class ChipConfigService {
  /**
   * Get chip configuration for specific table limits
   * Returns custom config if exists, otherwise generates defaults
   */
  static getChipConfig(limits: TableLimitsKey): ChipConfig {
    const key = getTableLimitsKey(limits);
    const customConfigs = ChipConfigService.getCustomConfigs();

    if (customConfigs[key]) {
      return customConfigs[key];
    }

    // Generate default chips for this limit combination
    return {
      denominations: generateDefaultChips(limits),
    };
  }

  /**
   * Save custom chip configuration for specific table limits
   */
  static saveChipConfig(limits: TableLimitsKey, config: ChipConfig): void {
    const key = getTableLimitsKey(limits);
    const customConfigs = ChipConfigService.getCustomConfigs();

    customConfigs[key] = config;
    ChipConfigService.saveCustomConfigs(customConfigs);
  }

  /**
   * Delete custom chip configuration (will revert to default)
   */
  static deleteChipConfig(limits: TableLimitsKey): boolean {
    const key = getTableLimitsKey(limits);
    const customConfigs = ChipConfigService.getCustomConfigs();

    if (!(key in customConfigs)) {
      return false; // Config not found
    }

    delete customConfigs[key];
    ChipConfigService.saveCustomConfigs(customConfigs);
    return true;
  }

  /**
   * Check if custom configuration exists for table limits
   */
  static hasCustomConfig(limits: TableLimitsKey): boolean {
    const key = getTableLimitsKey(limits);
    const customConfigs = ChipConfigService.getCustomConfigs();
    return key in customConfigs;
  }

  /**
   * Get all custom chip configurations
   */
  private static getCustomConfigs(): Record<string, ChipConfig> {
    if (typeof window === "undefined") return {};

    try {
      const stored = localStorage.getItem(CHIP_CONFIGS_KEY);
      if (!stored) return {};

      return JSON.parse(stored) as Record<string, ChipConfig>;
    } catch (error) {
      console.error("Failed to load chip configs:", error);
      return {};
    }
  }

  /**
   * Save custom configurations to localStorage
   */
  private static saveCustomConfigs(configs: Record<string, ChipConfig>): void {
    if (typeof window === "undefined") return;

    try {
      localStorage.setItem(CHIP_CONFIGS_KEY, JSON.stringify(configs));
    } catch (error) {
      console.error("Failed to save chip configs:", error);
    }
  }
}
