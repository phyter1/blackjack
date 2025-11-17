import { test, expect } from "@playwright/test";
import {
  createAndLoginUser,
  ensureBalance,
  goToCasinoTable,
  placeBet,
  isInsuranceOffered,
  handleInsurance,
  getGamePhase,
  playHandBasicStrategy,
  advanceToNextRound,
} from "./helpers/game-setup";

/**
 * E2E Test: Dealer Blackjack with Insurance Declined
 *
 * This test verifies that when the dealer shows an Ace and has blackjack,
 * and the player declines insurance, the game properly transitions to the
 * settling phase without getting stuck.
 *
 * Bug: Previously, declining insurance when dealer had blackjack would
 * leave the UI in "playing" phase with no available actions, forcing the
 * player to cash out.
 *
 * Fix: The insurance buttons now check the round state after resolving
 * insurance and transition to "settling" phase if dealer has blackjack.
 */

test.describe("Dealer Blackjack Insurance Bug", () => {
  test.beforeEach(async ({ page }) => {
    await createAndLoginUser(page, "TestPlayer");
    await ensureBalance(page, 1000);
  });

  /**
   * Test: Dealer has blackjack with deterministic test mode
   * This test uses the test-mode URL parameter to force dealer blackjack
   */
  test("should handle dealer blackjack when insurance is declined (deterministic)", async ({
    page,
  }) => {
    // Navigate to casino table with test mode enabled
    await goToCasinoTable(page, "dealer-blackjack");

    // Place a bet
    await placeBet(page, 10);

    // Insurance should be offered (dealer shows Ace)
    const insuranceOffered = await isInsuranceOffered(page);
    expect(insuranceOffered).toBe(true);

    // Decline insurance
    await handleInsurance(page, false);

    // Verify we're in settling phase (dealer has blackjack)
    const phase = await getGamePhase(page);
    expect(phase).toBe("settling");

    // The key test: verify we're NOT stuck with no actions
    // We should see either "Next Round" or "Cash Out" button
    const nextRoundVisible = await page
      .locator('button:has-text("Next Round")')
      .isVisible({ timeout: 2000 })
      .catch(() => false);
    const cashOutVisible = await page
      .locator('button:has-text("Cash Out")')
      .isVisible({ timeout: 2000 })
      .catch(() => false);
    expect(nextRoundVisible || cashOutVisible).toBe(true);

    // Success! The game correctly transitioned to settling and we can continue
    console.log(
      "✓ Test passed: Dealer had blackjack, insurance declined, game properly showed result with next action available",
    );
  });

  /**
   * Test: Random play - may encounter dealer blackjack
   * This test plays without test mode and may naturally encounter the scenario
   */
  test("should handle dealer blackjack when insurance is declined (random)", async ({
    page,
  }) => {
    await goToCasinoTable(page);

    // Place a bet
    await placeBet(page, 10);

    const insuranceOffered = await isInsuranceOffered(page);

    if (insuranceOffered) {
      // Decline insurance
      await handleInsurance(page, false);

      // Get current phase
      const phase = await getGamePhase(page);

      // Should be either playing (dealer doesn't have blackjack) or settling (dealer has blackjack)
      // We should NOT be in unknown phase (which would indicate a bug)
      expect(["playing", "settling"]).toContain(phase);

      if (phase === "settling") {
        // Dealer had blackjack - verify we can continue
        console.log(
          "✓ Dealer had blackjack, game correctly transitioned to settling",
        );
        await advanceToNextRound(page);

        const nextPhase = await getGamePhase(page);
        expect(nextPhase).toBe("betting");
      } else {
        // Dealer didn't have blackjack - play out the hand
        await playHandBasicStrategy(page);
        await advanceToNextRound(page);
      }
    } else {
      // No insurance offered, skip this test run
      test.skip();
    }
  });

  /**
   * Test: Multi-round stress test
   * This test runs multiple rounds to verify no edge cases cause the game to get stuck
   */
  test("should not get stuck during multiple rounds with occasional insurance offers", async ({
    page,
  }) => {
    await goToCasinoTable(page);

    let insuranceOfferedCount = 0;
    const maxRounds = 20;

    for (let round = 0; round < maxRounds; round++) {
      // Place bet
      await placeBet(page, 10);

      // Check if insurance is offered
      const insuranceOffered = await isInsuranceOffered(page);

      if (insuranceOffered) {
        insuranceOfferedCount++;
        await handleInsurance(page, false); // Decline insurance
      }

      // Play out the hand
      await playHandBasicStrategy(page);

      // Get current phase - should be settling or betting
      const phase = await getGamePhase(page);

      if (phase === "unknown") {
        throw new Error(
          `BUG DETECTED at round ${round + 1}: Game is in unknown state`,
        );
      }

      if (phase === "settling") {
        await advanceToNextRound(page);
      }

      // Check if we can continue
      const nextPhase = await getGamePhase(page);

      if (nextPhase === "betting") {
        // Continue to next round
        continue;
      } else if (nextPhase === "unknown") {
        throw new Error(
          `BUG DETECTED: Cannot continue after round ${round + 1}`,
        );
      } else {
        // Game over
        break;
      }
    }

    console.log(
      `Completed rounds successfully. Insurance offered ${insuranceOfferedCount} times.`,
    );
  });
});
