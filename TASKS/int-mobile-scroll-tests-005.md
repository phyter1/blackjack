# Task: int-mobile-scroll-tests-005 - Create E2E Tests for Mobile Scrolling

## Overview

Create comprehensive end-to-end tests using Playwright to validate all mobile scrolling fixes across different viewport sizes. These tests will verify that the casino table, dashboard, and modal components handle scrolling correctly on mobile devices without regressions on desktop.

## Requirements

### Functional Requirements

- Viewport testing across 5 different device sizes
- Casino table scrolling behavior validation (mobile scrollable, desktop fixed)
- Dashboard scrolling without viewport jumps or layout shifts
- Modal scrolling without scroll traps or body scroll interference
- Horizontal overflow detection and prevention
- Touch interaction testing for mobile devices
- Scroll position persistence and restoration

### Non-Functional Requirements

- Tests must run reliably in CI environment
- Fast execution time (complete suite under 3 minutes)
- Clear test failure messages with actionable debugging information
- Screenshot capture on failures for visual debugging
- Cross-browser compatibility (Chromium, Firefox, WebKit)
- Minimal flakiness through proper wait strategies

## Acceptance Criteria

- [ ] Test suite covers all 5 viewports (iPhone SE 375px, iPhone 12 390px, Android 360px, iPad 768px, Desktop 1920px)
- [ ] Casino table scrolling tests verify mobile scrollable and desktop fixed behavior
- [ ] Dashboard scrolling tests detect viewport jumps and layout shifts
- [ ] Modal scrolling tests verify no scroll traps or body scroll interference
- [ ] Horizontal overflow tests pass for all viewports
- [ ] Touch interaction tests validate mobile-specific gestures
- [ ] All tests pass in CI environment
- [ ] Test execution completes in under 3 minutes
- [ ] Tests use proper wait strategies and are not flaky

## Implementation Details

### Technical Approach

Implement a comprehensive test suite using Playwright's device emulation and viewport testing capabilities. The tests will validate scrolling behavior across multiple viewports and ensure no regressions were introduced by the mobile scrolling fixes.

**Test Organization:**
```
e2e/
├── mobile-scrolling/
│   ├── casino-table-scroll.spec.ts       # Casino table scrolling tests
│   ├── dashboard-scroll.spec.ts          # Dashboard scrolling tests
│   ├── modal-scroll.spec.ts              # Modal scrolling tests
│   └── viewport-overflow.spec.ts         # Horizontal overflow tests
└── helpers/
    └── viewport-helpers.ts               # Viewport and scrolling utilities
```

**Viewport Configuration:**
```typescript
const VIEWPORTS = {
  mobile_small: { width: 375, height: 667, name: 'iPhone SE' },      // Smallest mobile
  mobile_common: { width: 390, height: 844, name: 'iPhone 12' },     // Common mobile
  mobile_android: { width: 360, height: 800, name: 'Android' },      // Common Android
  tablet: { width: 768, height: 1024, name: 'iPad' },                // Tablet
  desktop: { width: 1920, height: 1080, name: 'Desktop' }            // Desktop
};
```

### Files to Modify/Create

**New Files:**
- `e2e/mobile-scrolling/casino-table-scroll.spec.ts` - Casino table scrolling validation
- `e2e/mobile-scrolling/dashboard-scroll.spec.ts` - Dashboard scrolling validation
- `e2e/mobile-scrolling/modal-scroll.spec.ts` - Modal scrolling validation
- `e2e/mobile-scrolling/viewport-overflow.spec.ts` - Overflow and layout validation
- `e2e/helpers/viewport-helpers.ts` - Viewport testing utilities

**Modified Files:**
- `playwright.config.ts` - Add mobile device projects and viewport configurations
- `package.json` - Add mobile test scripts
- `docs/testing/e2e-testing.md` - Document mobile scrolling tests

### Dependencies

**External Dependencies:**
- `@playwright/test` (already installed)
- Playwright browsers with touch support enabled

**Internal Dependencies:**
- `e2e/helpers/game-setup.ts` - Existing test helpers
- UI fixes from tasks: `ui-casino-scroll-002`, `ui-dashboard-scroll-003`, `ui-modal-scroll-004`

**Component Dependencies:**
- `src/components/CasinoTable/` - Casino table component with mobile scrolling fixes
- `src/components/UserDashboard/` - Dashboard component with scroll improvements
- `src/components/ui/dialog.tsx` - Modal component with scroll trap prevention

## Testing Requirements

### Test Strategy

**1. Casino Table Scrolling Tests** (`casino-table-scroll.spec.ts`)

```typescript
// Test casino table scrolling behavior across viewports
test.describe('Casino Table Scrolling', () => {
  // Mobile viewports: table should be scrollable
  test('should allow scrolling on mobile viewports', async ({ page }) => {
    // Test on iPhone SE (375px), iPhone 12 (390px), Android (360px)
  });

  // Desktop viewport: table should be fixed (no scrolling needed)
  test('should not require scrolling on desktop', async ({ page }) => {
    // Test on Desktop (1920px)
  });

  // Verify scroll container has correct properties
  test('should have proper scroll container on mobile', async ({ page }) => {
    // Verify overflow-y-auto, touch-action, and scrollbar styles
  });

  // Touch interactions
  test('should support touch scrolling on mobile', async ({ page }) => {
    // Simulate touch drag and verify scroll position changes
  });
});
```

**2. Dashboard Scrolling Tests** (`dashboard-scroll.spec.ts`)

```typescript
// Test dashboard scrolling without viewport jumps
test.describe('Dashboard Scrolling', () => {
  // Viewport stability tests
  test('should not cause viewport jumps when scrolling', async ({ page }) => {
    // Measure viewport height before and after scroll
    // Verify no layout shifts or height changes
  });

  // Scroll position persistence
  test('should maintain scroll position during state updates', async ({ page }) => {
    // Scroll to position, trigger state update, verify position maintained
  });

  // Smooth scrolling behavior
  test('should have smooth scroll transitions', async ({ page }) => {
    // Verify scroll-behavior CSS property
    // Test programmatic scrolling
  });
});
```

**3. Modal Scrolling Tests** (`modal-scroll.spec.ts`)

```typescript
// Test modal scrolling without scroll traps
test.describe('Modal Scrolling', () => {
  // Scroll trap prevention
  test('should prevent body scroll when modal is open', async ({ page }) => {
    // Open modal, attempt to scroll body, verify body doesn't move
  });

  // Modal content scrolling
  test('should allow modal content scrolling', async ({ page }) => {
    // Verify modal content can scroll independently
  });

  // Modal close restoration
  test('should restore body scroll after modal closes', async ({ page }) => {
    // Scroll body, open modal, close modal, verify body scroll restored
  });

  // Touch interaction in modals
  test('should support touch scrolling in modal on mobile', async ({ page }) => {
    // Simulate touch drag within modal content
  });
});
```

**4. Viewport Overflow Tests** (`viewport-overflow.spec.ts`)

```typescript
// Test for horizontal overflow issues
test.describe('Viewport Overflow Detection', () => {
  // Horizontal overflow detection
  test('should not have horizontal overflow on any viewport', async ({ page }) => {
    // Check document.documentElement.scrollWidth vs clientWidth
    // Verify no elements extend beyond viewport width
  });

  // Element position validation
  test('should keep all interactive elements within viewport', async ({ page }) => {
    // Verify buttons, inputs, and interactive elements are accessible
  });

  // Layout stability
  test('should maintain layout stability across viewport changes', async ({ page }) => {
    // Resize viewport, verify no layout breaks
  });
});
```

### Integration Tests

**Cross-Component Scrolling:**
- Test scrolling behavior when navigating between dashboard and casino table
- Verify scroll position resets appropriately on navigation
- Test modal opening from different scroll positions

**Multi-Viewport Workflow:**
- Test complete user workflow across multiple viewports
- Verify responsive transitions are smooth
- Test portrait/landscape orientation changes on mobile devices

### Performance Tests

**Scroll Performance:**
- Measure scroll frame rate on mobile devices (target 60fps)
- Test scroll performance with multiple hands in play
- Verify no jank or lag during rapid scrolling

**Layout Shift Metrics:**
- Measure Cumulative Layout Shift (CLS) during scrolling
- Target CLS < 0.1 for good user experience
- Verify no unexpected layout shifts

## Definition of Done

- [ ] All test files created and properly organized in `e2e/mobile-scrolling/`
- [ ] Helper functions implemented in `e2e/helpers/viewport-helpers.ts`
- [ ] Playwright config updated with mobile device projects
- [ ] All tests pass on local development environment
- [ ] All tests pass in CI environment with 0 flakes
- [ ] Test execution time under 3 minutes
- [ ] Documentation updated in `docs/testing/e2e-testing.md`
- [ ] Screenshot capture working for all test failures
- [ ] Code review completed and approved
- [ ] Tests validate all dependency tasks (ui-casino-scroll-002, ui-dashboard-scroll-003, ui-modal-scroll-004)

## Test Implementation Examples

### Viewport Helper Functions

```typescript
// e2e/helpers/viewport-helpers.ts

export const VIEWPORTS = {
  mobile_small: { width: 375, height: 667, name: 'iPhone SE', isMobile: true },
  mobile_common: { width: 390, height: 844, name: 'iPhone 12', isMobile: true },
  mobile_android: { width: 360, height: 800, name: 'Android', isMobile: true },
  tablet: { width: 768, height: 1024, name: 'iPad', isMobile: true },
  desktop: { width: 1920, height: 1080, name: 'Desktop', isMobile: false }
};

export async function setViewport(page: Page, viewport: keyof typeof VIEWPORTS) {
  const config = VIEWPORTS[viewport];
  await page.setViewportSize({ width: config.width, height: config.height });

  // Enable touch events for mobile viewports
  if (config.isMobile) {
    await page.emulateMedia({ touchAction: 'manipulation' });
  }
}

export async function checkHorizontalOverflow(page: Page): Promise<boolean> {
  return await page.evaluate(() => {
    return document.documentElement.scrollWidth > document.documentElement.clientWidth;
  });
}

export async function measureScrollPerformance(page: Page, scrollAmount: number) {
  return await page.evaluate((amount) => {
    const start = performance.now();
    window.scrollBy(0, amount);
    return performance.now() - start;
  }, scrollAmount);
}

export async function simulateTouchScroll(page: Page, selector: string, distance: number) {
  const element = await page.locator(selector);
  const box = await element.boundingBox();

  if (!box) throw new Error(`Element ${selector} not found`);

  // Simulate touch drag
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await page.touchscreen.tap(box.x + box.width / 2, box.y + box.height / 2);
  await page.mouse.down();
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2 - distance);
  await page.mouse.up();
}
```

### Example Test Implementation

```typescript
// e2e/mobile-scrolling/casino-table-scroll.spec.ts

import { test, expect } from '@playwright/test';
import { createAndLoginUser, goToCasinoTable } from '../helpers/game-setup';
import { setViewport, VIEWPORTS, checkHorizontalOverflow } from '../helpers/viewport-helpers';

test.describe('Casino Table Scrolling - Mobile Viewports', () => {
  test.beforeEach(async ({ page }) => {
    await createAndLoginUser(page);
    await goToCasinoTable(page);
  });

  for (const [key, viewport] of Object.entries(VIEWPORTS)) {
    if (!viewport.isMobile) continue; // Skip desktop in this suite

    test(`should allow scrolling on ${viewport.name} (${viewport.width}px)`, async ({ page }) => {
      await setViewport(page, key as keyof typeof VIEWPORTS);

      // Verify table container is scrollable
      const tableContainer = page.locator('[data-testid="casino-table-container"]');
      await expect(tableContainer).toBeVisible();

      // Check scroll properties
      const isScrollable = await tableContainer.evaluate((el) => {
        const style = window.getComputedStyle(el);
        return style.overflowY === 'auto' || style.overflowY === 'scroll';
      });
      expect(isScrollable).toBe(true);

      // Verify no horizontal overflow
      const hasHorizontalOverflow = await checkHorizontalOverflow(page);
      expect(hasHorizontalOverflow).toBe(false);

      // Test actual scrolling works
      const initialScrollTop = await tableContainer.evaluate(el => el.scrollTop);
      await tableContainer.evaluate((el) => {
        el.scrollTop = 100;
      });
      const newScrollTop = await tableContainer.evaluate(el => el.scrollTop);
      expect(newScrollTop).toBeGreaterThan(initialScrollTop);
    });
  }
});

test.describe('Casino Table Scrolling - Desktop Viewport', () => {
  test.beforeEach(async ({ page }) => {
    await createAndLoginUser(page);
    await goToCasinoTable(page);
  });

  test('should not require scrolling on desktop (1920px)', async ({ page }) => {
    await setViewport(page, 'desktop');

    // Verify entire table is visible without scrolling
    const tableContainer = page.locator('[data-testid="casino-table-container"]');
    const dealerArea = page.locator('[data-testid="dealer-area"]');
    const playerArea = page.locator('[data-testid="player-area"]');
    const controls = page.locator('[data-testid="game-controls"]');

    // All elements should be visible without scrolling
    await expect(tableContainer).toBeVisible();
    await expect(dealerArea).toBeInViewport();
    await expect(playerArea).toBeInViewport();
    await expect(controls).toBeInViewport();

    // Container should not be scrollable
    const scrollHeight = await tableContainer.evaluate(el => el.scrollHeight);
    const clientHeight = await tableContainer.evaluate(el => el.clientHeight);
    expect(scrollHeight).toBeLessThanOrEqual(clientHeight);
  });
});
```

## CI Integration

### Playwright Config Updates

```typescript
// playwright.config.ts updates
export default defineConfig({
  projects: [
    {
      name: 'Desktop Chrome',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'Mobile iPhone SE',
      use: { ...devices['iPhone SE'] },
    },
    {
      name: 'Mobile iPhone 12',
      use: { ...devices['iPhone 12 Pro'] },
    },
    {
      name: 'Mobile Android',
      use: {
        ...devices['Pixel 5'],
        viewport: { width: 360, height: 800 }
      },
    },
    {
      name: 'Tablet iPad',
      use: { ...devices['iPad Pro'] },
    },
  ],
});
```

### Package.json Script Updates

```json
{
  "scripts": {
    "test:e2e:mobile": "playwright test mobile-scrolling/",
    "test:e2e:mobile:ui": "playwright test mobile-scrolling/ --ui",
    "test:e2e:mobile:debug": "playwright test mobile-scrolling/ --debug"
  }
}
```

## Validation Against Dependencies

### ui-casino-scroll-002 Validation
- Test verifies casino table scrollable on mobile (<=768px)
- Test verifies casino table fixed on desktop (>768px)
- Test verifies smooth scrolling behavior with touch support

### ui-dashboard-scroll-003 Validation
- Test verifies no viewport jumps during scrolling
- Test verifies scroll position maintained during state updates
- Test verifies smooth scroll transitions

### ui-modal-scroll-004 Validation
- Test verifies body scroll prevention when modal open
- Test verifies modal content scrollable independently
- Test verifies scroll restoration after modal closes
- Test verifies no scroll traps on mobile devices
