import { Page } from "@playwright/test";

/**
 * Helper functions for setting up game scenarios in E2E tests
 */

export interface TestUser {
  name: string;
  balance: number;
}

/**
 * Creates a test user and logs in
 */
export async function createAndLoginUser(
  page: Page,
  name: string = `TestUser${Date.now()}`,
): Promise<void> {
  await page.goto("/");

  // Fill in the name
  await page.fill('input[placeholder*="name" i]', name);

  // Click the "Sign up" link to go to signup page
  const signUpLink = page.locator("text=Sign up");
  if (await signUpLink.isVisible({ timeout: 1000 })) {
    await signUpLink.click();
    await page.waitForTimeout(500);

    // On signup page, fill in name again if needed (it might clear)
    await page.fill('input[placeholder*="name" i]', name);

    // Initial balance should be pre-filled with 1000, but we can set it to be sure
    const balanceInput = page.locator('input[type="number"]').first();
    if (await balanceInput.isVisible({ timeout: 1000 })) {
      await balanceInput.fill("1000");
    }
  }

  // Click the "Sign Up" button on the signup page
  const signUpButton = page.locator('button:has-text("Sign Up")');
  if (await signUpButton.isVisible({ timeout: 2000 })) {
    await signUpButton.click();
  }

  // Wait for the dashboard/home page to load
  await page.waitForTimeout(2000);
}

/**
 * Ensures user has sufficient balance
 */
export async function ensureBalance(
  page: Page,
  amount: number = 1000,
): Promise<void> {
  const depositButton = page.locator('button:has-text("Deposit")');

  if (await depositButton.isVisible({ timeout: 2000 })) {
    await depositButton.click();
    await page.fill('input[type="number"]', amount.toString());
    await page.click('button:has-text("Confirm")');
    await page.waitForTimeout(500);
  }
}

/**
 * Navigates to the casino table
 * @param testMode Optional test mode scenario (e.g., "dealer-blackjack")
 */
export async function goToCasinoTable(
  page: Page,
  testMode?: string,
): Promise<void> {
  // If test mode is specified, we need to inject it before clicking the button
  if (testMode) {
    // Set the test mode in URL before navigating
    await page.evaluate((mode) => {
      // Store in sessionStorage so it persists
      sessionStorage.setItem("test-mode", mode);
    }, testMode);
  }

  // Wait for Casino Table button to be visible
  await page.waitForSelector(
    'button:has-text("Casino Table"), button:has-text("🎰 Casino Table")',
    { timeout: 10000 },
  );

  await page.click(
    'button:has-text("Casino Table"), button:has-text("🎰 Casino Table")',
  );

  await page.waitForSelector("text=Place Your Bet", { timeout: 15000 });
}

/**
 * Places a bet
 */
export async function placeBet(page: Page, amount: number = 10): Promise<void> {
  // Click the chip value button
  await page.click(`button:has-text("$${amount}")`);
  await page.click('button:has-text("Place Bet")');

  // Wait for cards to be dealt
  await page.waitForTimeout(1500);
}

/**
 * Checks if insurance is being offered (dealer showing Ace)
 */
export async function isInsuranceOffered(page: Page): Promise<boolean> {
  return await page
    .locator("text=Insurance")
    .isVisible({ timeout: 2000 })
    .catch(() => false);
}

/**
 * Handles insurance decision
 */
export async function handleInsurance(
  page: Page,
  accept: boolean,
): Promise<void> {
  const button = accept
    ? page.locator('button:has-text("Yes")')
    : page.locator('button:has-text("No")');

  await button.click();
  await page.waitForTimeout(1000);
}

/**
 * Gets the current game phase by checking visible UI elements
 */
export async function getGamePhase(
  page: Page,
): Promise<
  "betting" | "insurance" | "playing" | "settling" | "complete" | "unknown"
> {
  if (
    await page
      .locator("text=Place Your Bet")
      .isVisible({ timeout: 500 })
      .catch(() => false)
  ) {
    return "betting";
  }

  if (
    await page
      .locator("text=Insurance")
      .isVisible({ timeout: 500 })
      .catch(() => false)
  ) {
    return "insurance";
  }

  const hitButton = await page
    .locator('button:has-text("Hit")')
    .isVisible({ timeout: 500 })
    .catch(() => false);
  const standButton = await page
    .locator('button:has-text("Stand")')
    .isVisible({ timeout: 500 })
    .catch(() => false);

  if (hitButton || standButton) {
    return "playing";
  }

  const nextButton = await page
    .locator('button:has-text("Next Round")')
    .isVisible({ timeout: 500 })
    .catch(() => false);
  const cashOutButton = await page
    .locator('button:has-text("Cash Out")')
    .isVisible({ timeout: 500 })
    .catch(() => false);

  if (nextButton || cashOutButton) {
    return "settling";
  }

  return "unknown";
}

/**
 * Plays out a hand automatically (stands on 17+, hits otherwise)
 */
export async function playHandBasicStrategy(page: Page): Promise<void> {
  let playing = true;
  let safetyCounter = 0;

  while (playing && safetyCounter < 20) {
    safetyCounter++;

    const phase = await getGamePhase(page);

    if (phase === "playing") {
      // Simple strategy: stand on 17+
      const hitButton = page.locator('button:has-text("Hit")');
      const standButton = page.locator('button:has-text("Stand")');

      if (await standButton.isVisible({ timeout: 500 })) {
        await standButton.click();
        await page.waitForTimeout(1000);
      } else if (await hitButton.isVisible({ timeout: 500 })) {
        await hitButton.click();
        await page.waitForTimeout(500);
      }
    } else if (phase === "settling" || phase === "complete") {
      playing = false;
    } else if (phase === "betting") {
      playing = false;
    } else {
      // Unknown state, stop
      playing = false;
    }
  }
}

/**
 * Completes a round and starts the next one
 */
export async function advanceToNextRound(page: Page): Promise<void> {
  const nextButton = page.locator('button:has-text("Next Round")');

  if (await nextButton.isVisible({ timeout: 2000 })) {
    await nextButton.click();
    // Wait longer for the betting phase to appear
    await page.waitForTimeout(1500);
  }
}
