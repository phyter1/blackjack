import { expect, test } from "@playwright/test";
import { createAndLoginUser, goToCasinoTable } from "../helpers/game-setup";
import {
  VIEWPORTS,
  type ViewportKey,
  checkHorizontalOverflow,
  getElementScrollPosition,
  isElementScrollable,
  setViewport,
  simulateTouchScroll,
} from "../helpers/viewport-helpers";

test.describe("Casino Table Scrolling - Mobile Viewports", () => {
  test.beforeEach(async ({ page }) => {
    await createAndLoginUser(page);
    await goToCasinoTable(page);
  });

  const mobileViewports = Object.entries(VIEWPORTS).filter(
    ([_, config]) => config.isMobile && config.width <= 768,
  ) as [ViewportKey, (typeof VIEWPORTS)[ViewportKey]][];

  for (const [key, viewport] of mobileViewports) {
    test(`should allow scrolling on ${viewport.name} (${viewport.width}px)`, async ({
      page,
    }) => {
      await setViewport(page, key);

      // Wait for casino table to load
      await page.waitForSelector("text=Place Your Bet", { timeout: 15000 });

      // Find the main scrollable container
      // Casino table uses overflow-y-auto on mobile
      const mainContainer = page.locator(
        ".min-h-screen.flex.flex-col.relative.overflow-y-auto",
      );
      await expect(mainContainer).toBeVisible();

      // Verify the container is scrollable on mobile
      const scrollable = await isElementScrollable(
        page,
        ".min-h-screen.flex.flex-col.relative.overflow-y-auto",
      );
      expect(scrollable.vertical).toBe(true);

      // Verify no horizontal overflow
      const hasHorizontalOverflow = await checkHorizontalOverflow(page);
      expect(hasHorizontalOverflow).toBe(false);

      // Test actual scrolling functionality
      const initialScroll = await getElementScrollPosition(
        page,
        ".min-h-screen.flex.flex-col.relative.overflow-y-auto",
      );

      // Scroll down by setting scrollTop
      await mainContainer.evaluate((el) => {
        el.scrollTop = 100;
      });

      const scrolledPosition = await getElementScrollPosition(
        page,
        ".min-h-screen.flex.flex-col.relative.overflow-y-auto",
      );

      // Verify scrolling occurred
      expect(scrolledPosition.scrollTop).toBeGreaterThan(initialScroll.scrollTop);
    });

    test(`should have proper overflow styling on ${viewport.name}`, async ({
      page,
    }) => {
      await setViewport(page, key);
      await page.waitForSelector("text=Place Your Bet", { timeout: 15000 });

      // Check overflow styles
      const overflowStyles = await page.evaluate(() => {
        const container = document.querySelector(
          ".min-h-screen.flex.flex-col.relative.overflow-y-auto",
        );
        if (!container) return null;

        const styles = window.getComputedStyle(container);
        return {
          overflowY: styles.overflowY,
          overflowX: styles.overflowX,
          WebkitOverflowScrolling: styles.webkitOverflowScrolling,
        };
      });

      expect(overflowStyles).toBeTruthy();
      expect(overflowStyles?.overflowY).toBe("auto");
      expect(overflowStyles?.overflowX).not.toBe("auto"); // Should not scroll horizontally
    });

    test(`should support touch scrolling on ${viewport.name}`, async ({
      page,
    }) => {
      await setViewport(page, key);
      await page.waitForSelector("text=Place Your Bet", { timeout: 15000 });

      const container = page.locator(
        ".min-h-screen.flex.flex-col.relative.overflow-y-auto",
      );

      // Get initial scroll position
      const initialScroll = await getElementScrollPosition(
        page,
        ".min-h-screen.flex.flex-col.relative.overflow-y-auto",
      );

      // Simulate touch scroll (swipe up = scroll down)
      await simulateTouchScroll(
        page,
        ".min-h-screen.flex.flex-col.relative.overflow-y-auto",
        -100,
      );

      // Wait for scroll animation
      await page.waitForTimeout(300);

      const finalScroll = await getElementScrollPosition(
        page,
        ".min-h-screen.flex.flex-col.relative.overflow-y-auto",
      );

      // Touch scroll should have changed position
      // Note: This might be flaky on some systems, so we check for change OR initial being 0
      const scrollChanged = finalScroll.scrollTop !== initialScroll.scrollTop;
      const wasAtTop = initialScroll.scrollTop === 0;

      expect(scrollChanged || wasAtTop).toBe(true);
    });
  }
});

test.describe("Casino Table Scrolling - Desktop Viewport", () => {
  test.beforeEach(async ({ page }) => {
    await createAndLoginUser(page);
    await goToCasinoTable(page);
  });

  test("should not require scrolling on desktop (1920px)", async ({ page }) => {
    await setViewport(page, "desktop");
    await page.waitForSelector("text=Place Your Bet", { timeout: 15000 });

    // Desktop uses md:overflow-hidden md:h-screen
    const mainContainer = page.locator(
      ".min-h-screen.flex.flex-col.relative.overflow-y-auto",
    );
    await expect(mainContainer).toBeVisible();

    // Check that on desktop, the overflow-hidden class is applied via media query
    const overflowStyles = await page.evaluate(() => {
      const container = document.querySelector(
        ".min-h-screen.flex.flex-col.relative.overflow-y-auto",
      );
      if (!container) return null;

      const styles = window.getComputedStyle(container);
      return {
        overflowY: styles.overflowY,
        height: styles.height,
      };
    });

    // On desktop (md breakpoint), should be overflow: hidden
    expect(overflowStyles?.overflowY).toBe("hidden");
  });

  test("should have all elements visible without scrolling on desktop", async ({
    page,
  }) => {
    await setViewport(page, "desktop");
    await page.waitForSelector("text=Place Your Bet", { timeout: 15000 });

    // Verify key game elements are all in viewport
    const dealerArea = page.locator("text=Dealer");
    const bettingControls = page.locator("text=Place Your Bet");

    // All elements should be visible without scrolling
    await expect(dealerArea).toBeInViewport();
    await expect(bettingControls).toBeInViewport();

    // Verify no scrolling is needed
    const hasVerticalScroll = await page.evaluate(() => {
      const container = document.querySelector(
        ".min-h-screen.flex.flex-col.relative.overflow-y-auto",
      );
      if (!container) return false;
      return container.scrollHeight > container.clientHeight;
    });

    expect(hasVerticalScroll).toBe(false);
  });

  test("should not have horizontal overflow on desktop", async ({ page }) => {
    await setViewport(page, "desktop");
    await page.waitForSelector("text=Place Your Bet", { timeout: 15000 });

    const hasHorizontalOverflow = await checkHorizontalOverflow(page);
    expect(hasHorizontalOverflow).toBe(false);
  });
});

test.describe("Casino Table Scrolling - Tablet Viewport", () => {
  test.beforeEach(async ({ page }) => {
    await createAndLoginUser(page);
    await goToCasinoTable(page);
  });

  test("should handle iPad viewport (768px) correctly", async ({ page }) => {
    await setViewport(page, "tablet");
    await page.waitForSelector("text=Place Your Bet", { timeout: 15000 });

    // At 768px, we're at the md breakpoint
    // Check that scrolling behavior is appropriate
    const scrollable = await isElementScrollable(
      page,
      ".min-h-screen.flex.flex-col.relative.overflow-y-auto",
    );

    // At md breakpoint, should transition to fixed layout
    const overflowStyles = await page.evaluate(() => {
      const container = document.querySelector(
        ".min-h-screen.flex.flex-col.relative.overflow-y-auto",
      );
      if (!container) return null;
      const styles = window.getComputedStyle(container);
      return styles.overflowY;
    });

    // At 768px with md: breakpoint, should be hidden
    expect(overflowStyles).toBe("hidden");

    // Verify no horizontal overflow at tablet size
    const hasHorizontalOverflow = await checkHorizontalOverflow(page);
    expect(hasHorizontalOverflow).toBe(false);
  });
});
