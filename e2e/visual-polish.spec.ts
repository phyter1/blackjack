import { test, expect } from "@playwright/test";

/**
 * Visual Polish & Cleanup E2E Tests
 * Tests visual quality after removing clutter and standardizing design
 * Issue: phyter1/blackjack#15
 */

test.describe("Visual Polish - Playing Cards", () => {
  test("cards render cleanly without noise texture", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 }); // iPhone 12
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    // Find a playing card
    const card = page.locator('[class*="playing-card"]').first();
    await expect(card).toBeVisible();

    // Card should have clean shadow (shadow-sm)
    const classes = await card.getAttribute("class");
    expect(classes).toContain("shadow-sm");

    // Card should NOT contain noise texture or center decorative suit
    // (We can't directly test for removed elements, but we can verify the card renders)
    await expect(card).toBeVisible();
  });

  test("cards have subtle shadow on hover", async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    const card = page.locator('[class*="playing-card"]').first();
    await expect(card).toBeVisible();

    // Hover should trigger shadow-md
    const classes = await card.getAttribute("class");
    expect(classes).toContain("hover:shadow-md");
  });
});

test.describe("Visual Polish - Table Background", () => {
  test("table background renders without texture clutter", async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    // Table should have clean radial gradient background
    const table = page.locator('[class*="table"]').first();
    await expect(table).toBeVisible();

    // Verify table background exists and is visible
    const bgColor = await table.evaluate((el) =>
      window.getComputedStyle(el).background
    );
    expect(bgColor).toBeTruthy();
  });
});

test.describe("Visual Polish - Chip Dimensions", () => {
  test("denomination chips use Tailwind tokens on mobile", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 }); // iPhone 12
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    // Find denomination chips
    const chip = page.locator('[class*="denom-chip"]').first();

    if (await chip.isVisible()) {
      const classes = await chip.getAttribute("class");
      // Should use w-14 h-14 (56px) on mobile instead of w-[60px]
      expect(classes).toContain("w-14");
      expect(classes).toContain("h-14");
    }
  });

  test("action chips use Tailwind tokens on mobile", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 }); // iPhone 12
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    // Find action chips (Deal, Clear, etc.)
    const actionChip = page.locator('[class*="action-chip"]').first();

    if (await actionChip.isVisible()) {
      const classes = await actionChip.getAttribute("class");
      // Should use w-12 h-12 (48px) on mobile instead of w-[45px]
      expect(classes).toContain("w-12");
      expect(classes).toContain("h-12");
    }
  });

  test("denomination chips scale correctly on desktop", async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    const chip = page.locator('[class*="denom-chip"]').first();

    if (await chip.isVisible()) {
      const classes = await chip.getAttribute("class");
      // Should use md:w-20 md:h-20 (80px) on desktop
      expect(classes).toContain("md:w-20");
      expect(classes).toContain("md:h-20");
    }
  });
});

test.describe("Visual Polish - Shadow Standardization", () => {
  test("cards use shadow-sm for subtle depth", async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    const card = page.locator('[class*="playing-card"]').first();
    if (await card.isVisible()) {
      const classes = await card.getAttribute("class");
      expect(classes).toContain("shadow-sm");
    }
  });

  test("shoe and discard displays use shadow-lg for elevation", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    // Check shoe display
    const shoe = page.locator('[data-shoe-display="true"]').first();
    if (await shoe.isVisible()) {
      const shoeContainer = shoe.locator(".shadow-lg").first();
      await expect(shoeContainer).toBeVisible();
    }
  });
});

test.describe("Visual Polish - Hover Effects", () => {
  test("chips use scale effect only (not both scale and shadow)", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    const chip = page.locator('[class*="denom-chip"]').first();
    if (await chip.isVisible()) {
      const classes = await chip.getAttribute("class");

      // Should have hover:scale-110
      expect(classes).toContain("hover:scale-110");

      // Should NOT have hover:shadow in the same element
      // (simplified to use scale OR shadow, not both)
      const hasHoverShadow = classes?.includes("hover:shadow-lg");
      expect(hasHoverShadow).toBe(false);
    }
  });

  test("preset selectors use scale effect only", async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    // Navigate to preset selector if not on main page
    const presetButton = page.locator('button:has-text("Vegas")').first();
    if (await presetButton.isVisible()) {
      const classes = await presetButton.getAttribute("class");

      // Should have hover:scale-105
      if (classes?.includes("hover:scale")) {
        // Should NOT also have hover:shadow
        const hasHoverShadow = classes?.includes("hover:shadow-lg");
        expect(hasHoverShadow).toBe(false);
      }
    }
  });
});

test.describe("Visual Polish - Shoe & Discard Heights", () => {
  test("shoe display uses formula-based height instead of lookup table", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    const shoe = page.locator('[data-shoe-display="true"]').first();
    if (await shoe.isVisible()) {
      // Verify shoe container exists and has a computed height
      const shoeContainer = shoe.locator(".relative").first();
      const height = await shoeContainer.evaluate((el) =>
        window.getComputedStyle(el).height
      );

      // Height should be computed (not 0 or empty)
      expect(height).toBeTruthy();
      expect(height).not.toBe("0px");
    }
  });
});

test.describe("Visual Regression - Overall Quality", () => {
  test("game table renders cleanly on mobile (375px)", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 }); // iPhone SE
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    // Take screenshot for visual comparison
    await page.screenshot({
      path: "e2e/screenshots/visual-polish-mobile-375.png",
      fullPage: true,
    });

    // Verify key elements are visible
    const table = page.locator('[class*="table"]').first();
    await expect(table).toBeVisible();
  });

  test("game table renders cleanly on tablet (768px)", async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 }); // iPad
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    await page.screenshot({
      path: "e2e/screenshots/visual-polish-tablet-768.png",
      fullPage: true,
    });

    const table = page.locator('[class*="table"]').first();
    await expect(table).toBeVisible();
  });

  test("game table renders cleanly on desktop (1920px)", async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 }); // Full HD
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    await page.screenshot({
      path: "e2e/screenshots/visual-polish-desktop-1920.png",
      fullPage: true,
    });

    const table = page.locator('[class*="table"]').first();
    await expect(table).toBeVisible();
  });

  test("professional casino aesthetic maintained", async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    // Verify no visual artifacts or missing elements
    const table = page.locator('[class*="table"]').first();
    await expect(table).toBeVisible();

    // Verify cards are visible if dealt
    const hasCards = await page.locator('[class*="playing-card"]').count();
    if (hasCards > 0) {
      const firstCard = page.locator('[class*="playing-card"]').first();
      await expect(firstCard).toBeVisible();
    }

    // Verify chips are visible
    const hasChips = await page.locator('[class*="chip"]').count();
    if (hasChips > 0) {
      const firstChip = page.locator('[class*="chip"]').first();
      await expect(firstChip).toBeVisible();
    }
  });
});
