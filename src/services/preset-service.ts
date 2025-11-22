import { BUILT_IN_PRESETS, type RulesPreset } from "@/types/preset";

const CUSTOM_PRESETS_KEY = "blackjack-custom-presets";

export class PresetService {
  /**
   * Get all presets (built-in + custom)
   */
  static getAllPresets(): RulesPreset[] {
    const customPresets = this.getCustomPresets();
    return [...BUILT_IN_PRESETS, ...customPresets];
  }

  /**
   * Get only custom (user-created) presets
   */
  static getCustomPresets(): RulesPreset[] {
    if (typeof window === "undefined") return [];

    try {
      const stored = localStorage.getItem(CUSTOM_PRESETS_KEY);
      if (!stored) return [];

      const presets = JSON.parse(stored) as RulesPreset[];
      return presets.filter((p) => !p.isBuiltIn); // Safety check
    } catch (error) {
      console.error("Failed to load custom presets:", error);
      return [];
    }
  }

  /**
   * Get a specific preset by ID
   */
  static getPreset(id: string): RulesPreset | undefined {
    return this.getAllPresets().find((p) => p.id === id);
  }

  /**
   * Save a new custom preset
   */
  static savePreset(
    preset: Omit<RulesPreset, "id" | "createdAt">,
  ): RulesPreset {
    const customPresets = this.getCustomPresets();

    // Generate unique ID
    const id = `custom-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

    const newPreset: RulesPreset = {
      ...preset,
      id,
      isBuiltIn: false,
      createdAt: new Date().toISOString(),
    };

    customPresets.push(newPreset);
    this.saveCustomPresets(customPresets);

    return newPreset;
  }

  /**
   * Update an existing custom preset
   */
  static updatePreset(
    id: string,
    updates: Partial<Omit<RulesPreset, "id" | "isBuiltIn" | "createdAt">>,
  ): boolean {
    const customPresets = this.getCustomPresets();
    const index = customPresets.findIndex((p) => p.id === id);

    if (index === -1) return false;

    customPresets[index] = {
      ...customPresets[index],
      ...updates,
    };

    this.saveCustomPresets(customPresets);
    return true;
  }

  /**
   * Delete a custom preset
   */
  static deletePreset(id: string): boolean {
    const customPresets = this.getCustomPresets();
    const filtered = customPresets.filter((p) => p.id !== id);

    if (filtered.length === customPresets.length) {
      return false; // Preset not found
    }

    this.saveCustomPresets(filtered);
    return true;
  }

  /**
   * Check if a preset name already exists
   */
  static presetNameExists(name: string, excludeId?: string): boolean {
    return this.getAllPresets().some(
      (p) => p.name.toLowerCase() === name.toLowerCase() && p.id !== excludeId,
    );
  }

  /**
   * Save custom presets to localStorage
   */
  private static saveCustomPresets(presets: RulesPreset[]): void {
    if (typeof window === "undefined") return;

    try {
      localStorage.setItem(CUSTOM_PRESETS_KEY, JSON.stringify(presets));
    } catch (error) {
      console.error("Failed to save custom presets:", error);
    }
  }
}
