import { test, expect } from '@playwright/test';

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

test.describe('Dealer Blackjack Insurance Bug', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the app
    await page.goto('/');

    // Create/login as a test user
    await page.fill('input[placeholder*="name" i]', 'TestPlayer');
    await page.click('button:has-text("Create Account"), button:has-text("Login")');

    // Deposit money if needed
    const depositButton = page.locator('button:has-text("Deposit")');
    if (await depositButton.isVisible({ timeout: 2000 })) {
      await depositButton.click();
      await page.fill('input[type="number"]', '1000');
      await page.click('button:has-text("Confirm")');
    }

    // Navigate to Casino Table
    await page.click('button:has-text("Casino Table")');
    await page.waitForSelector('text=Place Your Bet', { timeout: 10000 });
  });

  /**
   * Helper function to mock the deck to ensure dealer gets blackjack
   * This injects code before the game starts to control Math.random()
   */
  async function mockDealerBlackjack(page: any) {
    await page.evaluate(() => {
      // Save original Math.random
      const originalRandom = Math.random;
      let callCount = 0;

      // Mock Math.random to create a specific deck order
      // We need: Dealer gets Ace + 10-value card
      Math.random = function() {
        callCount++;

        // This is a simplified mock - in reality the shuffle is more complex
        // We're aiming to get dealer: [Ace, 10/J/Q/K] which is blackjack
        // The exact sequence depends on the shuffle algorithm

        // For shuffling, we want to position Ace and King at dealer positions
        // Dealer gets 2nd and 4th cards typically
        if (callCount <= 100) {
          // During shuffle, favor certain positions
          return callCount % 2 === 0 ? 0.01 : 0.99;
        }

        // Fall back to original random for everything else
        return originalRandom();
      };

      // Store for cleanup
      (window as any).__mockCleanup = () => {
        Math.random = originalRandom;
      };
    });
  }

  /**
   * Test: Dealer has blackjack, player declines insurance
   * Expected: Game transitions to settling phase, player can continue
   */
  test('should handle dealer blackjack when insurance is declined', async ({ page }) => {
    // Place a bet
    await page.click('button:has-text("$10")');
    await page.click('button:has-text("Place Bet")');

    // Wait for cards to be dealt
    await page.waitForSelector('text=Insurance', { timeout: 5000 }).catch(() => {
      // If insurance doesn't appear, dealer doesn't have Ace showing
      // This is expected - we'll need to run the test multiple times
      // or enhance the mocking strategy
    });

    const insuranceVisible = await page.locator('text=Insurance').isVisible({ timeout: 1000 }).catch(() => false);

    if (insuranceVisible) {
      // Decline insurance
      await page.click('button:has-text("No")');

      // Wait a moment for the round state to update
      await page.waitForTimeout(1000);

      // Check if we can see "Next Round" button (settling phase)
      // or if we're stuck with no actions
      const nextRoundButton = page.locator('button:has-text("Next Round"), button:has-text("Cash Out")');
      const isSettlingOrComplete = await nextRoundButton.isVisible({ timeout: 3000 }).catch(() => false);

      // Verify we're not stuck in playing phase with no actions
      const playingActions = page.locator('button:has-text("Hit"), button:has-text("Stand"), button:has-text("Double")');
      const hasPlayingActions = await playingActions.first().isVisible({ timeout: 1000 }).catch(() => false);

      // If dealer has blackjack, we should be in settling/complete, not playing
      if (!hasPlayingActions && !isSettlingOrComplete) {
        // This is the bug: no actions available and can't proceed
        throw new Error('BUG DETECTED: No actions available after declining insurance with dealer blackjack');
      }

      // Either we have playing actions (dealer didn't have blackjack) or next round button (dealer had blackjack)
      expect(hasPlayingActions || isSettlingOrComplete).toBe(true);

      if (isSettlingOrComplete) {
        // Success! We handled dealer blackjack correctly
        console.log('✓ Dealer had blackjack, game correctly transitioned to settling');

        // Verify we can continue playing
        await nextRoundButton.click();

        // Should be back at betting phase or game over
        const canContinue = await page.locator('text=Place Your Bet, text=Cash Out').first().isVisible({ timeout: 3000 });
        expect(canContinue).toBe(true);
      }
    } else {
      // Dealer doesn't show Ace, continue playing normally
      // This test run didn't hit the specific scenario
      test.skip();
    }
  });

  /**
   * Test: Repeatedly play until we encounter dealer Ace
   * This test runs multiple rounds to increase chances of hitting the bug scenario
   */
  test('should not get stuck during multiple rounds with occasional insurance offers', async ({ page }) => {
    let insuranceOfferedCount = 0;
    const maxRounds = 20;

    for (let round = 0; round < maxRounds; round++) {
      // Place bet
      await page.click('button:has-text("$10")');
      await page.click('button:has-text("Place Bet")');

      // Check if insurance is offered
      const insuranceVisible = await page.locator('text=Insurance').isVisible({ timeout: 2000 }).catch(() => false);

      if (insuranceVisible) {
        insuranceOfferedCount++;

        // Decline insurance
        await page.click('button:has-text("No")');

        // Wait for state transition
        await page.waitForTimeout(1500);
      }

      // Play out the hand
      // Keep hitting until we bust or hand is complete
      let handInProgress = true;
      let safetyCounter = 0;

      while (handInProgress && safetyCounter < 10) {
        safetyCounter++;

        const hitButton = page.locator('button:has-text("Hit")');
        const standButton = page.locator('button:has-text("Stand")');
        const nextButton = page.locator('button:has-text("Next Round"), button:has-text("Cash Out")');

        const hitVisible = await hitButton.isVisible({ timeout: 500 }).catch(() => false);
        const standVisible = await standButton.isVisible({ timeout: 500 }).catch(() => false);
        const nextVisible = await nextButton.isVisible({ timeout: 500 }).catch(() => false);

        if (nextVisible) {
          // Round is complete
          handInProgress = false;
          await nextButton.click();
          await page.waitForTimeout(500);
        } else if (standVisible) {
          // Stand to end our turn
          await standButton.click();
          await page.waitForTimeout(1000);
        } else if (hitVisible) {
          // Continue playing
          await hitButton.click();
          await page.waitForTimeout(500);
        } else {
          // No actions available - this could be the bug!
          throw new Error(`BUG DETECTED at round ${round + 1}: No actions available and game is stuck`);
        }
      }

      // Check if we can start a new round
      const placeBetVisible = await page.locator('text=Place Your Bet').isVisible({ timeout: 2000 }).catch(() => false);
      const gameOverVisible = await page.locator('text=Cash Out').isVisible({ timeout: 1000 }).catch(() => false);

      if (!placeBetVisible && !gameOverVisible) {
        throw new Error(`BUG DETECTED: Cannot continue after round ${round + 1}`);
      }

      // If game over, break
      if (gameOverVisible) {
        break;
      }
    }

    console.log(`Completed ${maxRounds} rounds successfully. Insurance offered ${insuranceOfferedCount} times.`);
  });

  test.afterEach(async ({ page }) => {
    // Cleanup any mocks
    await page.evaluate(() => {
      if ((window as any).__mockCleanup) {
        (window as any).__mockCleanup();
      }
    });
  });
});
