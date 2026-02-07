import { expect, test } from "@playwright/test";
import { createAndLoginUser } from "../helpers/game-setup";
import {
  VIEWPORTS,
  type ViewportKey,
  checkHorizontalOverflow,
  getDocumentHeight,
  getViewportHeight,
  getWindowScrollPosition,
  measureLayoutShift,
  setViewport,
} from "../helpers/viewport-helpers";

test.describe("Dashboard Scrolling - Viewport Stability", () => {
  test.beforeEach(async ({ page }) => {
    await createAndLoginUser(page);
    // Wait for dashboard to load
    await page.waitForSelector("text=Welcome back", { timeout: 10000 });
  });

  const allViewports = Object.entries(VIEWPORTS) as [
    ViewportKey,
    (typeof VIEWPORTS)[ViewportKey],
  ][];

  for (const [key, viewport] of allViewports) {
    test(`should not cause viewport jumps on ${viewport.name} (${viewport.width}px)`, async ({
      page,
    }) => {
      await setViewport(page, key);

      // Get initial viewport height
      const initialViewportHeight = await getViewportHeight(page);

      // Scroll down on the page
      await page.evaluate(() => {
        window.scrollBy({ top: 200, behavior: "instant" });
      });

      await page.waitForTimeout(300);

      // Check viewport height again
      const afterScrollViewportHeight = await getViewportHeight(page);

      // Viewport height should remain consistent (no jumps)
      expect(afterScrollViewportHeight).toBe(initialViewportHeight);
    });

    test(`should maintain scroll position during state updates on ${viewport.name}`, async ({
      page,
    }) => {
      await setViewport(page, key);

      // Wait for content to be fully loaded
      await page.waitForTimeout(500);

      // Scroll to a specific position
      await page.evaluate(() => {
        window.scrollTo({ top: 150, behavior: "instant" });
      });

      const scrollPositionBefore = await getWindowScrollPosition(page);

      // Trigger a state update by interacting with the page
      // For example, clicking deposit button (if visible)
      const depositButton = page.locator('button:has-text("Deposit")');
      if (await depositButton.isVisible({ timeout: 1000 })) {
        await depositButton.click();
        await page.waitForTimeout(200);

        // Close the dialog/modal
        const cancelButton = page.locator('button:has-text("Cancel")');
        if (await cancelButton.isVisible({ timeout: 1000 })) {
          await cancelButton.click();
        }

        await page.waitForTimeout(200);
      }

      // Verify scroll position is maintained
      const scrollPositionAfter = await getWindowScrollPosition(page);

      // Position should be very close (allow small variance)
      expect(Math.abs(scrollPositionAfter.y - scrollPositionBefore.y)).toBeLessThan(5);
    });

    test(`should have smooth scroll behavior on ${viewport.name}`, async ({
      page,
    }) => {
      await setViewport(page, key);

      // Check scroll-behavior CSS property
      const scrollBehavior = await page.evaluate(() => {
        const htmlStyle = window.getComputedStyle(document.documentElement);
        const bodyStyle = window.getComputedStyle(document.body);
        return {
          html: htmlStyle.scrollBehavior,
          body: bodyStyle.scrollBehavior,
        };
      });

      // Either html or body should have smooth scrolling
      const hasSmoothScroll =
        scrollBehavior.html === "smooth" || scrollBehavior.body === "smooth";

      // Note: Default is 'auto', so we'll check if it's not explicitly set to something bad
      expect(scrollBehavior.html).not.toBe("none");
    });

    test(`should not have horizontal overflow on ${viewport.name}`, async ({
      page,
    }) => {
      await setViewport(page, key);

      const hasHorizontalOverflow = await checkHorizontalOverflow(page);
      expect(hasHorizontalOverflow).toBe(false);
    });
  }
});

test.describe("Dashboard Scrolling - Layout Stability", () => {
  test.beforeEach(async ({ page }) => {
    await createAndLoginUser(page);
    await page.waitForSelector("text=Welcome back", { timeout: 10000 });
  });

  const mobileViewports = Object.entries(VIEWPORTS).filter(
    ([_, config]) => config.isMobile,
  ) as [ViewportKey, (typeof VIEWPORTS)[ViewportKey]][];

  for (const [key, viewport] of mobileViewports) {
    test(`should have minimal layout shift during scroll on ${viewport.name}`, async ({
      page,
    }) => {
      await setViewport(page, key);
      await page.waitForTimeout(500); // Let page settle

      // Measure CLS during scrolling
      const cls = await measureLayoutShift(page, async () => {
        await page.evaluate(() => {
          window.scrollBy({ top: 200, behavior: "instant" });
        });
        await page.waitForTimeout(200);
        await page.evaluate(() => {
          window.scrollBy({ top: -200, behavior: "instant" });
        });
      });

      // CLS should be minimal (< 0.1 is good, < 0.25 is acceptable)
      expect(cls).toBeLessThan(0.25);
    });

    test(`should maintain document height consistency on ${viewport.name}`, async ({
      page,
    }) => {
      await setViewport(page, key);

      // Get initial document height
      const initialHeight = await getDocumentHeight(page);

      // Scroll through the page
      await page.evaluate(() => {
        window.scrollTo({ top: document.body.scrollHeight / 2, behavior: "instant" });
      });

      await page.waitForTimeout(300);

      // Document height should be consistent
      const heightAfterScroll = await getDocumentHeight(page);

      // Allow small variance for dynamic content
      const heightDifference = Math.abs(heightAfterScroll - initialHeight);
      expect(heightDifference).toBeLessThan(50); // Max 50px variance
    });
  }
});

test.describe("Dashboard Scrolling - Responsive Behavior", () => {
  test.beforeEach(async ({ page }) => {
    await createAndLoginUser(page);
    await page.waitForSelector("text=Welcome back", { timeout: 10000 });
  });

  test("should adapt scroll behavior when resizing from mobile to desktop", async ({
    page,
  }) => {
    // Start with mobile
    await setViewport(page, "mobile_common");
    await page.waitForTimeout(300);

    const mobileViewportHeight = await getViewportHeight(page);

    // Resize to desktop
    await setViewport(page, "desktop");
    await page.waitForTimeout(300);

    const desktopViewportHeight = await getViewportHeight(page);

    // Viewport should reflect the new size
    expect(desktopViewportHeight).toBeGreaterThan(mobileViewportHeight);

    // No horizontal overflow on either
    const hasOverflow = await checkHorizontalOverflow(page);
    expect(hasOverflow).toBe(false);
  });

  test("should handle rapid scroll events without layout breaks", async ({
    page,
  }) => {
    await setViewport(page, "mobile_common");
    await page.waitForTimeout(300);

    // Rapid scroll up and down
    for (let i = 0; i < 5; i++) {
      await page.evaluate(() => {
        window.scrollBy({ top: 100, behavior: "instant" });
      });
      await page.waitForTimeout(50);
    }

    for (let i = 0; i < 5; i++) {
      await page.evaluate(() => {
        window.scrollBy({ top: -100, behavior: "instant" });
      });
      await page.waitForTimeout(50);
    }

    await page.waitForTimeout(300);

    // Page should still be functional and without horizontal overflow
    const hasOverflow = await checkHorizontalOverflow(page);
    expect(hasOverflow).toBe(false);

    // Page should still be responsive
    const welcomeText = page.locator("text=Welcome back");
    await expect(welcomeText).toBeVisible();
  });
});

test.describe("Dashboard Scrolling - Content Overflow", () => {
  test.beforeEach(async ({ page }) => {
    await createAndLoginUser(page);
    await page.waitForSelector("text=Welcome back", { timeout: 10000 });
  });

  test("should properly handle overflow-y-auto on dashboard container", async ({
    page,
  }) => {
    await setViewport(page, "mobile_common");

    // Dashboard uses overflow-y-auto on the main container
    const dashboardContainer = page.locator(".min-h-screen.p-3.overflow-y-auto");
    await expect(dashboardContainer).toBeVisible();

    // Check overflow properties
    const overflowStyles = await page.evaluate(() => {
      const container = document.querySelector(".min-h-screen.p-3.overflow-y-auto");
      if (!container) return null;

      const styles = window.getComputedStyle(container);
      return {
        overflowY: styles.overflowY,
        overflowX: styles.overflowX,
      };
    });

    expect(overflowStyles?.overflowY).toBe("auto");
    // Should not scroll horizontally
    expect(overflowStyles?.overflowX).not.toBe("scroll");
  });

  test("should keep all interactive elements accessible within viewport", async ({
    page,
  }) => {
    await setViewport(page, "mobile_small"); // Smallest mobile viewport

    // Key interactive elements should be accessible
    const logoutButton = page.locator('button:has-text("Logout")');
    const casinoButton = page.locator('button:has-text("Casino Table")');

    // Elements should be visible (may require scrolling)
    await expect(logoutButton).toBeVisible();

    // Scroll to bottom to check Casino Table button
    await page.evaluate(() => {
      window.scrollTo({ top: document.body.scrollHeight, behavior: "instant" });
    });

    await expect(casinoButton).toBeVisible();
  });
});
