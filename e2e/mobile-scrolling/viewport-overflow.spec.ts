import { expect, test } from "@playwright/test";
import { createAndLoginUser, goToCasinoTable } from "../helpers/game-setup";
import {
  VIEWPORTS,
  type ViewportKey,
  checkHorizontalOverflow,
  getHorizontalOverflowAmount,
  setViewport,
} from "../helpers/viewport-helpers";

test.describe("Viewport Overflow Detection - Dashboard", () => {
  test.beforeEach(async ({ page }) => {
    await createAndLoginUser(page);
    await page.waitForSelector("text=Welcome back", { timeout: 10000 });
  });

  const allViewports = Object.entries(VIEWPORTS) as [
    ViewportKey,
    (typeof VIEWPORTS)[ViewportKey],
  ][];

  for (const [key, viewport] of allViewports) {
    test(`should not have horizontal overflow on ${viewport.name} (${viewport.width}px)`, async ({
      page,
    }) => {
      await setViewport(page, key);
      await page.waitForTimeout(500); // Let content settle

      const hasOverflow = await checkHorizontalOverflow(page);
      expect(hasOverflow).toBe(false);

      // Get actual overflow amount if any
      const overflowAmount = await getHorizontalOverflowAmount(page);
      expect(overflowAmount).toBe(0);
    });

    test(`should keep all content within viewport bounds on ${viewport.name}`, async ({
      page,
    }) => {
      await setViewport(page, key);

      // Check that no elements extend beyond viewport
      const elementsOutOfBounds = await page.evaluate((viewportWidth) => {
        const elements = document.querySelectorAll("*");
        const outOfBounds: string[] = [];

        elements.forEach((el) => {
          const rect = el.getBoundingClientRect();
          if (rect.right > viewportWidth) {
            // Get a meaningful identifier for the element
            const identifier =
              el.id ||
              el.className ||
              el.tagName.toLowerCase();
            outOfBounds.push(
              `${identifier} extends ${Math.round(rect.right - viewportWidth)}px beyond viewport`,
            );
          }
        });

        return outOfBounds;
      }, viewport.width);

      // Should have no elements extending beyond viewport
      expect(elementsOutOfBounds.length).toBe(0);
    });

    test(`should maintain proper padding/margins on ${viewport.name}`, async ({
      page,
    }) => {
      await setViewport(page, key);

      // Check that main content has proper spacing
      const contentSpacing = await page.evaluate(() => {
        const mainContainer = document.querySelector(".max-w-6xl");
        if (!mainContainer) return null;

        const styles = window.getComputedStyle(mainContainer);
        const rect = mainContainer.getBoundingClientRect();

        return {
          marginLeft: styles.marginLeft,
          marginRight: styles.marginRight,
          paddingLeft: styles.paddingLeft,
          paddingRight: styles.paddingRight,
          width: rect.width,
        };
      });

      expect(contentSpacing).toBeTruthy();
      // Content should have some margin/padding (not 0)
      const hasSpacing =
        contentSpacing?.marginLeft !== "0px" ||
        contentSpacing?.marginRight !== "0px" ||
        contentSpacing?.paddingLeft !== "0px" ||
        contentSpacing?.paddingRight !== "0px";

      expect(hasSpacing).toBe(true);
    });
  }
});

test.describe("Viewport Overflow Detection - Casino Table", () => {
  test.beforeEach(async ({ page }) => {
    await createAndLoginUser(page);
    await goToCasinoTable(page);
  });

  const allViewports = Object.entries(VIEWPORTS) as [
    ViewportKey,
    (typeof VIEWPORTS)[ViewportKey],
  ][];

  for (const [key, viewport] of allViewports) {
    test(`should not have horizontal overflow on ${viewport.name} (${viewport.width}px)`, async ({
      page,
    }) => {
      await setViewport(page, key);
      await page.waitForSelector("text=Place Your Bet", { timeout: 15000 });
      await page.waitForTimeout(500);

      const hasOverflow = await checkHorizontalOverflow(page);
      expect(hasOverflow).toBe(false);

      const overflowAmount = await getHorizontalOverflowAmount(page);
      expect(overflowAmount).toBe(0);
    });

    test(`should keep game elements within viewport on ${viewport.name}`, async ({
      page,
    }) => {
      await setViewport(page, key);
      await page.waitForSelector("text=Place Your Bet", { timeout: 15000 });

      // Check specific game elements are within bounds
      const elementsBounds = await page.evaluate((viewportWidth) => {
        const dealer = document.querySelector("text=Dealer")?.parentElement;
        const controls = document.querySelector(
          "text=Place Your Bet",
        )?.parentElement;

        const results: { element: string; inBounds: boolean }[] = [];

        if (dealer) {
          const rect = dealer.getBoundingClientRect();
          results.push({
            element: "dealer-area",
            inBounds: rect.right <= viewportWidth,
          });
        }

        if (controls) {
          const rect = controls.getBoundingClientRect();
          results.push({
            element: "betting-controls",
            inBounds: rect.right <= viewportWidth,
          });
        }

        return results;
      }, viewport.width);

      // All elements should be within bounds
      elementsBounds.forEach((result) => {
        expect(result.inBounds).toBe(true);
      });
    });
  }
});

test.describe("Viewport Overflow Detection - Interactive Elements", () => {
  test.beforeEach(async ({ page }) => {
    await createAndLoginUser(page);
    await page.waitForSelector("text=Welcome back", { timeout: 10000 });
  });

  const mobileViewports = Object.entries(VIEWPORTS).filter(
    ([_, config]) => config.isMobile,
  ) as [ViewportKey, (typeof VIEWPORTS)[ViewportKey]][];

  for (const [key, viewport] of mobileViewports) {
    test(`should keep all buttons accessible within viewport on ${viewport.name}`, async ({
      page,
    }) => {
      await setViewport(page, key);

      // Find all buttons
      const buttons = await page.locator("button").all();

      // Check each button is within viewport
      for (const button of buttons) {
        const box = await button.boundingBox();
        if (box) {
          // Button should not extend beyond viewport width
          expect(box.x + box.width).toBeLessThanOrEqual(viewport.width + 1); // Allow 1px tolerance
        }
      }
    });

    test(`should keep all interactive elements accessible on ${viewport.name}`, async ({
      page,
    }) => {
      await setViewport(page, key);

      // Check interactive elements (buttons, inputs, links)
      const interactiveElements = await page.evaluate((viewportWidth) => {
        const selectors = ["button", "input", "a", "select"];
        const outOfBounds: string[] = [];

        selectors.forEach((selector) => {
          const elements = document.querySelectorAll(selector);
          elements.forEach((el) => {
            const rect = el.getBoundingClientRect();
            if (rect.right > viewportWidth + 1) {
              // +1px tolerance
              const id =
                (el as HTMLElement).id ||
                el.className ||
                selector;
              outOfBounds.push(`${id}: ${Math.round(rect.right - viewportWidth)}px overflow`);
            }
          });
        });

        return outOfBounds;
      }, viewport.width);

      // No interactive elements should be out of bounds
      if (interactiveElements.length > 0) {
        console.log(
          "Elements out of bounds:",
          interactiveElements,
        );
      }
      expect(interactiveElements.length).toBe(0);
    });
  }
});

test.describe("Viewport Overflow Detection - Layout Stability", () => {
  test.beforeEach(async ({ page }) => {
    await createAndLoginUser(page);
    await page.waitForSelector("text=Welcome back", { timeout: 10000 });
  });

  test("should maintain layout stability across viewport changes", async ({
    page,
  }) => {
    const viewportKeys: ViewportKey[] = [
      "mobile_small",
      "mobile_common",
      "tablet",
      "desktop",
    ];

    for (const key of viewportKeys) {
      await setViewport(page, key);
      await page.waitForTimeout(300); // Let layout adjust

      // Check for horizontal overflow after resize
      const hasOverflow = await checkHorizontalOverflow(page);
      expect(hasOverflow).toBe(false);

      // Page should still be functional
      const welcomeText = page.locator("text=Welcome back");
      await expect(welcomeText).toBeVisible();
    }
  });

  test("should handle orientation changes without overflow", async ({
    page,
  }) => {
    // Portrait
    await page.setViewportSize({ width: 390, height: 844 });
    await page.waitForTimeout(300);

    let hasOverflow = await checkHorizontalOverflow(page);
    expect(hasOverflow).toBe(false);

    // Landscape (swap dimensions)
    await page.setViewportSize({ width: 844, height: 390 });
    await page.waitForTimeout(300);

    hasOverflow = await checkHorizontalOverflow(page);
    expect(hasOverflow).toBe(false);

    // Back to portrait
    await page.setViewportSize({ width: 390, height: 844 });
    await page.waitForTimeout(300);

    hasOverflow = await checkHorizontalOverflow(page);
    expect(hasOverflow).toBe(false);
  });
});

test.describe("Viewport Overflow Detection - Specific Components", () => {
  test.beforeEach(async ({ page }) => {
    await createAndLoginUser(page);
    await page.waitForSelector("text=Welcome back", { timeout: 10000 });
  });

  test("should handle balance panel without overflow on smallest mobile", async ({
    page,
  }) => {
    await setViewport(page, "mobile_small"); // 375px

    // Balance panel should be visible and not overflow
    const balancePanel = page.locator("text=Current Balance");
    await expect(balancePanel).toBeVisible();

    const hasOverflow = await checkHorizontalOverflow(page);
    expect(hasOverflow).toBe(false);
  });

  test("should handle stats panel without overflow on all viewports", async ({
    page,
  }) => {
    const viewportKeys: ViewportKey[] = [
      "mobile_small",
      "mobile_common",
      "mobile_android",
      "tablet",
      "desktop",
    ];

    for (const key of viewportKeys) {
      await setViewport(page, key);
      await page.waitForTimeout(200);

      // Check for stats content
      const hasStats = await page
        .locator("text=Total Hands")
        .isVisible({ timeout: 1000 })
        .catch(() => false);

      if (hasStats) {
        const hasOverflow = await checkHorizontalOverflow(page);
        expect(hasOverflow).toBe(false);
      }
    }
  });
});

test.describe("Viewport Overflow Detection - Casino Table Components", () => {
  test.beforeEach(async ({ page }) => {
    await createAndLoginUser(page);
    await goToCasinoTable(page);
  });

  const mobileViewports = Object.entries(VIEWPORTS).filter(
    ([_, config]) => config.isMobile && config.width <= 768,
  ) as [ViewportKey, (typeof VIEWPORTS)[ViewportKey]][];

  for (const [key, viewport] of mobileViewports) {
    test(`should handle betting controls without overflow on ${viewport.name}`, async ({
      page,
    }) => {
      await setViewport(page, key);
      await page.waitForSelector("text=Place Your Bet", { timeout: 15000 });

      // Betting controls should be visible and within bounds
      const bettingControls = page.locator("text=Place Your Bet");
      await expect(bettingControls).toBeVisible();

      const hasOverflow = await checkHorizontalOverflow(page);
      expect(hasOverflow).toBe(false);
    });

    test(`should handle chip selection without overflow on ${viewport.name}`, async ({
      page,
    }) => {
      await setViewport(page, key);
      await page.waitForSelector("text=Place Your Bet", { timeout: 15000 });

      // Chip buttons should be visible
      const chipButton = page.locator('button:has-text("$")').first();
      const isVisible = await chipButton.isVisible({ timeout: 2000 }).catch(() => false);

      if (isVisible) {
        const hasOverflow = await checkHorizontalOverflow(page);
        expect(hasOverflow).toBe(false);
      }
    });
  }
});
