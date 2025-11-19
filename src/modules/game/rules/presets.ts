/**
 * Common preset rulesets for popular casino variants
 *
 * This module provides factory functions for creating common ruleset configurations
 * found in various casinos around the world.
 */

import { RuleSet } from "./builder";
import { rsaRule } from "./types";

/**
 * Collection of common casino ruleset presets
 */
export const COMMON_RULESETS = {
  /**
   * Liberal Vegas Strip rules
   *
   * Features:
   * - Dealer stands on soft 17
   * - 4 decks
   * - Late surrender allowed
   * - Resplit aces allowed
   * - Double after split allowed
   *
   * House edge: ~0.19%
   */
  liberal: () =>
    new RuleSet()
      .setDealerStand("s17")
      .setDeckCount(4)
      .setSurrender("late")
      .setRule(rsaRule(true)),

  /**
   * Standard Vegas Strip rules
   *
   * Features:
   * - Dealer stands on soft 17
   * - 4 decks
   * - Late surrender allowed
   * - Double after split allowed
   *
   * House edge: ~0.29%
   */
  vegasStrip: () =>
    new RuleSet().setDealerStand("s17").setDeckCount(4).setSurrender("late"),

  /**
   * Atlantic City rules
   *
   * Features:
   * - Dealer stands on soft 17
   * - 8 decks
   * - Late surrender allowed
   * - Double after split allowed
   *
   * House edge: ~0.36%
   */
  atlanticCity: () =>
    new RuleSet().setDealerStand("s17").setDeckCount(8).setSurrender("late"),

  /**
   * Downtown Vegas rules
   *
   * Features:
   * - Dealer hits on soft 17
   * - 2 decks
   * - No surrender
   * - Double after split allowed
   *
   * House edge: ~0.39%
   */
  downtown: () => new RuleSet().setDealerStand("h17").setDeckCount(2),

  /**
   * Single deck rules
   *
   * Features:
   * - Dealer hits on soft 17
   * - 1 deck
   * - Double only on 10-11
   * - No double after split
   * - No surrender
   *
   * House edge: ~0.17%
   */
  singleDeck: () =>
    new RuleSet()
      .setDealerStand("h17")
      .setDeckCount(1)
      .setDoubleRestriction("10-11")
      .setDoubleAfterSplit(false),

  /**
   * Terrible 6:5 blackjack game
   *
   * Features:
   * - Dealer hits on soft 17
   * - 8 decks
   * - 6:5 blackjack payout (AVOID!)
   * - No surrender
   * - Double after split allowed
   *
   * House edge: ~2.01%
   */
  terrible65: () =>
    new RuleSet()
      .setDealerStand("h17")
      .setDeckCount(8)
      .setBlackjackPayout(6, 5)
      .setSurrender("none"),
};
