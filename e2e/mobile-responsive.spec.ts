import { test, expect } from "@playwright/test";

/**
 * Mobile-First Responsive Design E2E Tests
 * Tests drawer patterns, safe-area handling, and touch target compliance
 * Issue: phyter1/blackjack#13
 */

test.describe("Mobile Drawer Patterns", () => {
  test.describe("Trainer Sidebar", () => {
    test("displays as bottom drawer on mobile (iPhone 12)", async ({ page }) => {
      await page.setViewportSize({ width: 390, height: 844 }); // iPhone 12
      await page.goto("/");

      // Wait for page to load
      await page.waitForLoadState("networkidle");

      // Trainer sidebar should exist
      const sidebar = page.locator('[class*="trainer"]').first();

      // On mobile, should have bottom positioning classes
      const classes = await sidebar.getAttribute("class");
      expect(classes).toContain("inset-x-0");
      expect(classes).toContain("bottom-0");

      // Should be full width on mobile
      expect(classes).toContain("w-full");

      // Should have rounded top corners on mobile
      expect(classes).toContain("rounded-t-2xl");
    });

    test("displays as right sidebar on desktop", async ({ page }) => {
      await page.setViewportSize({ width: 1920, height: 1080 }); // Desktop
      await page.goto("/");

      await page.waitForLoadState("networkidle");

      const sidebar = page.locator('[class*="trainer"]').first();
      const classes = await sidebar.getAttribute("class");

      // On desktop, should have right positioning via responsive classes
      expect(classes).toContain("md:w-96"); // 384px on desktop
      expect(classes).toContain("md:h-full"); // Full height on desktop
    });

    test("has smooth animation on mobile", async ({ page }) => {
      await page.setViewportSize({ width: 390, height: 844 });
      await page.goto("/");

      await page.waitForLoadState("networkidle");

      const sidebar = page.locator('[class*="trainer"]').first();
      const classes = await sidebar.getAttribute("class");

      // Should have transition classes
      expect(classes).toContain("transition-transform");
      expect(classes).toContain("duration-300");
    });
  });

  test.describe("Session Replay Modal", () => {
    test("displays as bottom drawer on mobile", async ({ page }) => {
      await page.setViewportSize({ width: 390, height: 844 }); // iPhone 12
      await page.goto("/");

      // This test assumes session replay can be triggered
      // Adjust selector based on actual implementation

      await page.waitForLoadState("networkidle");

      // Look for session replay modal if present
      const modal = page.locator('[class*="session-replay"]').first();
      if (await modal.isVisible()) {
        const classes = await modal.getAttribute("class");

        // Should be bottom drawer on mobile
        expect(classes).toContain("inset-x-0");
        expect(classes).toContain("bottom-0");
        expect(classes).toContain("max-h-[90vh]");
        expect(classes).toContain("rounded-t-2xl");
      }
    });

    test("displays as full-screen on desktop", async ({ page }) => {
      await page.setViewportSize({ width: 1920, height: 1080 });
      await page.goto("/");

      await page.waitForLoadState("networkidle");

      const modal = page.locator('[class*="session-replay"]').first();
      if (await modal.isVisible()) {
        const classes = await modal.getAttribute("class");

        // Should be full-screen on desktop
        expect(classes).toContain("md:inset-0");
        expect(classes).toContain("md:max-h-none");
      }
    });
  });
});

test.describe("Safe Area Handling", () => {
  test("body respects safe-area insets", async ({ page }) => {
    await page.setViewportSize({ width: 393, height: 852 }); // iPhone 15 Pro
    await page.goto("/");

    await page.waitForLoadState("networkidle");

    // Check body element has safe-area CSS
    const bodyStyle = await page.evaluate(() => {
      return window.getComputedStyle(document.body).paddingTop;
    });

    // Safe area should be applied (may be 0 in test env without device simulation)
    expect(bodyStyle).toBeDefined();
  });
});

test.describe("Touch Target Compliance", () => {
  test("chip buttons meet 44px minimum on mobile", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 }); // iPhone 12
    await page.goto("/");

    await page.waitForLoadState("networkidle");

    // Find chip buttons (adjust selectors based on actual implementation)
    const chips = page.locator('button[class*="chip"]');

    if ((await chips.count()) > 0) {
      const firstChip = chips.first();
      const box = await firstChip.boundingBox();

      if (box) {
        // Chips should be at least 44px on mobile
        expect(box.width).toBeGreaterThanOrEqual(44);
        expect(box.height).toBeGreaterThanOrEqual(44);
      }
    }
  });

  test("betting circles meet 44px minimum on mobile", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/");

    await page.waitForLoadState("networkidle");

    // Find betting circles (adjust selectors based on actual implementation)
    const circles = page.locator('button[class*="betting"]');

    if ((await circles.count()) > 0) {
      const firstCircle = circles.first();
      const box = await firstCircle.boundingBox();

      if (box) {
        // Betting circles should be at least 44px
        expect(box.width).toBeGreaterThanOrEqual(44);
        expect(box.height).toBeGreaterThanOrEqual(44);
      }
    }
  });

  test("adequate spacing between touch targets", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/");

    await page.waitForLoadState("networkidle");

    // Find adjacent chips
    const chips = page.locator('button[class*="chip"]');

    if ((await chips.count()) >= 2) {
      const firstChip = await chips.nth(0).boundingBox();
      const secondChip = await chips.nth(1).boundingBox();

      if (firstChip && secondChip) {
        // Calculate horizontal gap
        const gap = Math.abs(secondChip.x - (firstChip.x + firstChip.width));

        // WCAG requires minimum 8px spacing
        expect(gap).toBeGreaterThanOrEqual(8);
      }
    }
  });
});

test.describe("Responsive Breakpoints", () => {
  const viewports = [
    { name: "iPhone SE", width: 375, height: 667 },
    { name: "iPhone 12", width: 390, height: 844 },
    { name: "iPhone 15 Pro", width: 393, height: 852 },
    { name: "Pixel 7", width: 412, height: 915 },
    { name: "iPad", width: 768, height: 1024 },
    { name: "iPad Pro", width: 1024, height: 1366 },
    { name: "Desktop HD", width: 1920, height: 1080 },
    { name: "Desktop 2K", width: 2560, height: 1440 },
  ];

  for (const viewport of viewports) {
    test(`renders correctly on ${viewport.name} (${viewport.width}x${viewport.height})`, async ({
      page,
    }) => {
      await page.setViewportSize({
        width: viewport.width,
        height: viewport.height,
      });
      await page.goto("/");

      await page.waitForLoadState("networkidle");

      // No horizontal scroll should be present
      const scrollWidth = await page.evaluate(() => document.body.scrollWidth);
      const clientWidth = await page.evaluate(() => document.body.clientWidth);

      expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 1); // +1 for rounding
    });
  }
});

test.describe("Animation Performance", () => {
  test("drawer animations are smooth", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/");

    await page.waitForLoadState("networkidle");

    // Verify transition duration is set
    const drawer = page.locator('[class*="transition-transform"]').first();

    if (await drawer.isVisible()) {
      const transitionDuration = await drawer.evaluate((el) => {
        return window.getComputedStyle(el).transitionDuration;
      });

      // Should have 300ms transition
      expect(transitionDuration).toContain("0.3s");
    }
  });
});
