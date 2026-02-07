import type { Page } from "@playwright/test";

/**
 * Viewport configurations for mobile scrolling tests
 * Covering 5 key device sizes as specified in requirements
 */
export const VIEWPORTS = {
  mobile_small: {
    width: 375,
    height: 667,
    name: "iPhone SE",
    isMobile: true,
  },
  mobile_common: {
    width: 390,
    height: 844,
    name: "iPhone 12",
    isMobile: true,
  },
  mobile_android: { width: 360, height: 800, name: "Android", isMobile: true },
  tablet: { width: 768, height: 1024, name: "iPad", isMobile: true },
  desktop: { width: 1920, height: 1080, name: "Desktop", isMobile: false },
} as const;

export type ViewportKey = keyof typeof VIEWPORTS;

/**
 * Set viewport size and configure touch events for mobile
 */
export async function setViewport(
  page: Page,
  viewport: ViewportKey,
): Promise<void> {
  const config = VIEWPORTS[viewport];
  await page.setViewportSize({ width: config.width, height: config.height });

  // Enable touch events for mobile viewports
  if (config.isMobile) {
    await page.emulateMedia({ reducedMotion: "no-preference" });
  }
}

/**
 * Check if page has horizontal overflow (scroll wider than viewport)
 */
export async function checkHorizontalOverflow(page: Page): Promise<boolean> {
  return await page.evaluate(() => {
    const scrollWidth = document.documentElement.scrollWidth;
    const clientWidth = document.documentElement.clientWidth;
    return scrollWidth > clientWidth;
  });
}

/**
 * Get horizontal overflow amount in pixels
 */
export async function getHorizontalOverflowAmount(page: Page): Promise<number> {
  return await page.evaluate(() => {
    const scrollWidth = document.documentElement.scrollWidth;
    const clientWidth = document.documentElement.clientWidth;
    return Math.max(0, scrollWidth - clientWidth);
  });
}

/**
 * Measure scroll performance (time taken to scroll)
 */
export async function measureScrollPerformance(
  page: Page,
  scrollAmount: number,
): Promise<number> {
  return await page.evaluate((amount) => {
    const start = performance.now();
    window.scrollBy({ top: amount, behavior: "instant" });
    return performance.now() - start;
  }, scrollAmount);
}

/**
 * Simulate touch scroll on an element
 */
export async function simulateTouchScroll(
  page: Page,
  selector: string,
  distance: number,
): Promise<void> {
  const element = page.locator(selector);
  const box = await element.boundingBox();

  if (!box) throw new Error(`Element ${selector} not found for touch scroll`);

  const centerX = box.x + box.width / 2;
  const startY = box.y + box.height / 2;
  const endY = startY - distance;

  // Simulate touch drag
  await page.touchscreen.tap(centerX, startY);
  await page.mouse.move(centerX, startY);
  await page.mouse.down();
  await page.mouse.move(centerX, endY, { steps: 10 });
  await page.mouse.up();
}

/**
 * Get scroll position of window
 */
export async function getWindowScrollPosition(page: Page): Promise<{
  x: number;
  y: number;
}> {
  return await page.evaluate(() => ({
    x: window.scrollX,
    y: window.scrollY,
  }));
}

/**
 * Get scroll position of an element
 */
export async function getElementScrollPosition(
  page: Page,
  selector: string,
): Promise<{ scrollTop: number; scrollLeft: number }> {
  return await page.evaluate((sel) => {
    const element = document.querySelector(sel);
    if (!element) {
      throw new Error(`Element ${sel} not found`);
    }
    return {
      scrollTop: element.scrollTop,
      scrollLeft: element.scrollLeft,
    };
  }, selector);
}

/**
 * Check if element is scrollable (has overflow)
 */
export async function isElementScrollable(
  page: Page,
  selector: string,
): Promise<{ vertical: boolean; horizontal: boolean }> {
  return await page.evaluate((sel) => {
    const element = document.querySelector(sel);
    if (!element) {
      throw new Error(`Element ${sel} not found`);
    }

    const style = window.getComputedStyle(element);
    const hasVerticalOverflow = element.scrollHeight > element.clientHeight;
    const hasHorizontalOverflow = element.scrollWidth > element.clientWidth;

    const overflowY = style.overflowY;
    const overflowX = style.overflowX;

    return {
      vertical:
        hasVerticalOverflow &&
        (overflowY === "auto" || overflowY === "scroll"),
      horizontal:
        hasHorizontalOverflow &&
        (overflowX === "auto" || overflowX === "scroll"),
    };
  }, selector);
}

/**
 * Get viewport height (window.innerHeight)
 */
export async function getViewportHeight(page: Page): Promise<number> {
  return await page.evaluate(() => window.innerHeight);
}

/**
 * Get document height
 */
export async function getDocumentHeight(page: Page): Promise<number> {
  return await page.evaluate(
    () => document.documentElement.scrollHeight || document.body.scrollHeight,
  );
}

/**
 * Check if body scroll is locked (overflow: hidden)
 */
export async function isBodyScrollLocked(page: Page): Promise<boolean> {
  return await page.evaluate(() => {
    const bodyStyle = window.getComputedStyle(document.body);
    const htmlStyle = window.getComputedStyle(document.documentElement);
    return (
      bodyStyle.overflow === "hidden" || htmlStyle.overflow === "hidden"
    );
  });
}

/**
 * Measure Cumulative Layout Shift (CLS) during action
 */
export async function measureLayoutShift(
  page: Page,
  action: () => Promise<void>,
): Promise<number> {
  // Start measuring layout shifts
  await page.evaluate(() => {
    (window as any).__cumulativeLayoutShift = 0;

    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if ((entry as any).hadRecentInput) continue;
        (window as any).__cumulativeLayoutShift += (entry as any).value;
      }
    });

    observer.observe({ type: "layout-shift", buffered: true });
    (window as any).__layoutShiftObserver = observer;
  });

  // Perform action
  await action();

  // Wait a bit for layout shifts to settle
  await page.waitForTimeout(500);

  // Get final CLS score
  const cls = await page.evaluate(() => {
    const score = (window as any).__cumulativeLayoutShift || 0;
    const observer = (window as any).__layoutShiftObserver;
    if (observer) {
      observer.disconnect();
    }
    return score;
  });

  return cls;
}

/**
 * Wait for element to be scrollable
 */
export async function waitForElementScrollable(
  page: Page,
  selector: string,
  timeout = 5000,
): Promise<void> {
  await page.waitForFunction(
    (sel) => {
      const element = document.querySelector(sel);
      if (!element) return false;

      const hasOverflow = element.scrollHeight > element.clientHeight;
      const style = window.getComputedStyle(element);
      return hasOverflow && (style.overflowY === "auto" || style.overflowY === "scroll");
    },
    selector,
    { timeout },
  );
}
