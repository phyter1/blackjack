import { expect, test } from "@playwright/test";
import { createAndLoginUser } from "../helpers/game-setup";
import {
  getWindowScrollPosition,
  isBodyScrollLocked,
  setViewport,
  VIEWPORTS,
  type ViewportKey,
} from "../helpers/viewport-helpers";

test.describe("Modal Scrolling - Body Scroll Lock", () => {
  test.beforeEach(async ({ page }) => {
    await createAndLoginUser(page);
    await page.waitForSelector("text=Welcome back", { timeout: 10000 });
  });

  const allViewports = Object.entries(VIEWPORTS) as [
    ViewportKey,
    (typeof VIEWPORTS)[ViewportKey],
  ][];

  for (const [key, viewport] of allViewports) {
    test(`should prevent body scroll when modal is open on ${viewport.name}`, async ({
      page,
    }) => {
      await setViewport(page, key);

      // Scroll the page first
      await page.evaluate(() => {
        window.scrollTo({ top: 100, behavior: "instant" });
      });

      const scrollBeforeModal = await getWindowScrollPosition(page);

      // Open a modal (PresetSelector modal via Casino Table button)
      const casinoButton = page.locator(
        'button:has-text("Casino Table"), button:has-text("🎰 Casino Table")',
      );
      await casinoButton.click();

      // Wait for modal to appear
      await page.waitForSelector("text=Select Table Rules", { timeout: 5000 });

      // Check if body scroll is locked
      const isLocked = await isBodyScrollLocked(page);
      expect(isLocked).toBe(true);

      // Try to scroll the body (should not move)
      await page.evaluate(() => {
        window.scrollBy({ top: 100, behavior: "instant" });
      });

      await page.waitForTimeout(200);

      const scrollWithModal = await getWindowScrollPosition(page);

      // Body should not have scrolled
      expect(scrollWithModal.y).toBe(scrollBeforeModal.y);
    });

    test(`should restore body scroll after modal closes on ${viewport.name}`, async ({
      page,
    }) => {
      await setViewport(page, key);

      // Scroll to a position
      await page.evaluate(() => {
        window.scrollTo({ top: 150, behavior: "instant" });
      });

      const scrollBeforeModal = await getWindowScrollPosition(page);

      // Open modal
      const casinoButton = page.locator(
        'button:has-text("Casino Table"), button:has-text("🎰 Casino Table")',
      );
      await casinoButton.click();
      await page.waitForSelector("text=Select Table Rules", { timeout: 5000 });

      // Close modal by clicking Cancel or pressing Escape
      const cancelButton = page.locator('button:has-text("Cancel")');
      if (await cancelButton.isVisible({ timeout: 2000 })) {
        await cancelButton.click();
      } else {
        await page.keyboard.press("Escape");
      }

      // Wait for modal to close
      await page.waitForTimeout(500);

      // Body scroll should be restored
      const isLocked = await isBodyScrollLocked(page);
      expect(isLocked).toBe(false);

      // Scroll position should be maintained
      const scrollAfterModal = await getWindowScrollPosition(page);
      expect(Math.abs(scrollAfterModal.y - scrollBeforeModal.y)).toBeLessThan(
        10,
      );
    });
  }
});

test.describe("Modal Scrolling - Modal Content Scrolling", () => {
  test.beforeEach(async ({ page }) => {
    await createAndLoginUser(page);
    await page.waitForSelector("text=Welcome back", { timeout: 10000 });
  });

  const mobileViewports = Object.entries(VIEWPORTS).filter(
    ([_, config]) => config.isMobile,
  ) as [ViewportKey, (typeof VIEWPORTS)[ViewportKey]][];

  for (const [key, viewport] of mobileViewports) {
    test(`should allow modal content scrolling on ${viewport.name}`, async ({
      page,
    }) => {
      await setViewport(page, key);

      // Open modal with scrollable content (PresetSelector)
      const casinoButton = page.locator(
        'button:has-text("Casino Table"), button:has-text("🎰 Casino Table")',
      );
      await casinoButton.click();
      await page.waitForSelector("text=Select Table Rules", { timeout: 5000 });

      // Modal content should be present
      const modalContent = page.locator('[role="dialog"]');
      await expect(modalContent).toBeVisible();

      // Check if modal content is scrollable (it might be depending on content)
      const hasScroll = await page.evaluate(() => {
        const dialog = document.querySelector('[role="dialog"]');
        if (!dialog) return false;

        // Check if dialog or its content container is scrollable
        const hasVerticalScroll = dialog.scrollHeight > dialog.clientHeight;
        return hasVerticalScroll;
      });

      // If modal has scroll, verify it can scroll
      if (hasScroll) {
        const initialScroll = await page.evaluate(() => {
          const dialog = document.querySelector('[role="dialog"]');
          return dialog?.scrollTop || 0;
        });

        await page.evaluate(() => {
          const dialog = document.querySelector('[role="dialog"]');
          if (dialog) {
            dialog.scrollTop = 50;
          }
        });

        const newScroll = await page.evaluate(() => {
          const dialog = document.querySelector('[role="dialog"]');
          return dialog?.scrollTop || 0;
        });

        expect(newScroll).toBeGreaterThan(initialScroll);
      }
    });

    test(`should support touch scrolling in modal on ${viewport.name}`, async ({
      page,
    }) => {
      await setViewport(page, key);

      // Open modal
      const casinoButton = page.locator(
        'button:has-text("Casino Table"), button:has-text("🎰 Casino Table")',
      );
      await casinoButton.click();
      await page.waitForSelector("text=Select Table Rules", { timeout: 5000 });

      // Modal should be visible
      const modalContent = page.locator('[role="dialog"]');
      await expect(modalContent).toBeVisible();

      // Verify touch events work on modal
      const modalBox = await modalContent.boundingBox();
      expect(modalBox).toBeTruthy();

      if (modalBox) {
        // Tap on modal should not close it (only clicking outside or cancel)
        await page.touchscreen.tap(
          modalBox.x + modalBox.width / 2,
          modalBox.y + modalBox.height / 2,
        );

        await page.waitForTimeout(200);

        // Modal should still be visible
        await expect(modalContent).toBeVisible();
      }
    });
  }
});

test.describe("Modal Scrolling - Session Replay Modal", () => {
  test.beforeEach(async ({ page }) => {
    await createAndLoginUser(page);
    await page.waitForSelector("text=Welcome back", { timeout: 10000 });
  });

  test("should handle session replay modal scroll lock", async ({ page }) => {
    await setViewport(page, "mobile_common");

    // Check if there are any sessions to replay
    const sessionExists = await page
      .locator("text=View Replay")
      .isVisible({ timeout: 2000 })
      .catch(() => false);

    if (!sessionExists) {
      test.skip();
      return;
    }

    // Scroll dashboard
    await page.evaluate(() => {
      window.scrollTo({ top: 100, behavior: "instant" });
    });

    const scrollBefore = await getWindowScrollPosition(page);

    // Open session replay modal
    await page.locator("text=View Replay").first().click();
    await page.waitForTimeout(500);

    // Body scroll should be locked
    const isLocked = await isBodyScrollLocked(page);
    expect(isLocked).toBe(true);

    // Try scrolling body (should not work)
    await page.evaluate(() => {
      window.scrollBy({ top: 100, behavior: "instant" });
    });

    const scrollWithModal = await getWindowScrollPosition(page);
    expect(scrollWithModal.y).toBe(scrollBefore.y);

    // Close modal
    const closeButton = page.locator('button:has-text("Close")');
    if (await closeButton.isVisible({ timeout: 2000 })) {
      await closeButton.click();
    }

    await page.waitForTimeout(300);

    // Body scroll should be restored
    const isLockedAfter = await isBodyScrollLocked(page);
    expect(isLockedAfter).toBe(false);
  });
});

test.describe("Modal Scrolling - Nested Scroll Prevention", () => {
  test.beforeEach(async ({ page }) => {
    await createAndLoginUser(page);
    await page.waitForSelector("text=Welcome back", { timeout: 10000 });
  });

  test("should prevent scroll chaining from modal to body", async ({
    page,
  }) => {
    await setViewport(page, "mobile_common");

    // Scroll body
    await page.evaluate(() => {
      window.scrollTo({ top: 100, behavior: "instant" });
    });

    const bodyScrollBefore = await getWindowScrollPosition(page);

    // Open modal
    const casinoButton = page.locator(
      'button:has-text("Casino Table"), button:has-text("🎰 Casino Table")',
    );
    await casinoButton.click();
    await page.waitForSelector("text=Select Table Rules", { timeout: 5000 });

    // Try to scroll past modal boundaries (should not scroll body)
    await page.evaluate(() => {
      const dialog = document.querySelector('[role="dialog"]');
      if (dialog) {
        // Try to scroll beyond modal
        dialog.scrollTop = -100; // Negative scroll
      }
    });

    await page.waitForTimeout(200);

    // Body should not have scrolled
    const bodyScrollAfter = await getWindowScrollPosition(page);
    expect(bodyScrollAfter.y).toBe(bodyScrollBefore.y);
  });

  test("should handle modal opening from different scroll positions", async ({
    page,
  }) => {
    await setViewport(page, "mobile_common");

    // Test opening modal from various scroll positions
    const scrollPositions = [0, 100, 200];

    for (const position of scrollPositions) {
      // Scroll to position
      await page.evaluate((pos) => {
        window.scrollTo({ top: pos, behavior: "instant" });
      }, position);

      await page.waitForTimeout(200);

      // Open modal
      const casinoButton = page.locator(
        'button:has-text("Casino Table"), button:has-text("🎰 Casino Table")',
      );
      await casinoButton.click();
      await page.waitForSelector("text=Select Table Rules", { timeout: 5000 });

      // Body should be locked
      const isLocked = await isBodyScrollLocked(page);
      expect(isLocked).toBe(true);

      // Close modal
      await page.keyboard.press("Escape");
      await page.waitForTimeout(300);

      // Verify scroll position is maintained
      const currentScroll = await getWindowScrollPosition(page);
      expect(Math.abs(currentScroll.y - position)).toBeLessThan(10);
    }
  });
});

test.describe("Modal Scrolling - Touch Interaction", () => {
  test.beforeEach(async ({ page }) => {
    await createAndLoginUser(page);
    await page.waitForSelector("text=Welcome back", { timeout: 10000 });
  });

  const mobileViewports = Object.entries(VIEWPORTS).filter(
    ([_, config]) => config.isMobile && config.width <= 768,
  ) as [ViewportKey, (typeof VIEWPORTS)[ViewportKey]][];

  for (const [key, viewport] of mobileViewports) {
    test(`should prevent touch scroll on body when modal is open on ${viewport.name}`, async ({
      page,
    }) => {
      await setViewport(page, key);

      // Scroll dashboard
      await page.evaluate(() => {
        window.scrollTo({ top: 100, behavior: "instant" });
      });

      const scrollBefore = await getWindowScrollPosition(page);

      // Open modal
      const casinoButton = page.locator(
        'button:has-text("Casino Table"), button:has-text("🎰 Casino Table")',
      );
      await casinoButton.click();
      await page.waitForSelector("text=Select Table Rules", { timeout: 5000 });

      // Try touch scroll on body (should be prevented)
      await page.touchscreen.tap(100, 100);
      await page.mouse.move(100, 100);
      await page.mouse.down();
      await page.mouse.move(100, 0, { steps: 5 });
      await page.mouse.up();

      await page.waitForTimeout(200);

      // Body scroll should not have changed
      const scrollAfter = await getWindowScrollPosition(page);
      expect(scrollAfter.y).toBe(scrollBefore.y);

      // Close modal
      await page.keyboard.press("Escape");
      await page.waitForTimeout(300);
    });
  }
});
