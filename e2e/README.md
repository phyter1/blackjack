# E2E Tests

End-to-end tests for the Blackjack application using Playwright.

## Running Tests

```bash
# Run all tests
bun run test

# Run tests in UI mode (interactive)
bun run test:ui

# Run tests in headed mode (see browser)
bun run test:headed

# Run specific test file
bunx playwright test dealer-blackjack-insurance.spec.ts

# Run tests and show report
bunx playwright show-report
```

## Test Structure

### `dealer-blackjack-insurance.spec.ts`

Tests the bug fix for dealer blackjack with insurance declined:

**Bug:** When the dealer shows an Ace and has blackjack, and the player declines insurance, the game would get stuck in the "playing" phase with no available actions, forcing the player to cash out.

**Fix:** The insurance buttons now check the round state after resolving insurance and properly transition to the "settling" phase if the dealer has blackjack.

**Test Strategy:**
- The test runs multiple rounds to naturally encounter the dealer blackjack scenario
- When insurance is offered and declined, it verifies the game doesn't get stuck
- Uses helper functions to automate gameplay and detect stuck states

### Helpers (`helpers/game-setup.ts`)

Utility functions for test setup:
- `createAndLoginUser()` - Creates and logs in a test user
- `ensureBalance()` - Deposits money if needed
- `goToCasinoTable()` - Navigates to the casino table
- `placeBet()` - Places a bet
- `isInsuranceOffered()` - Checks if dealer is showing Ace
- `handleInsurance()` - Accepts or declines insurance
- `getGamePhase()` - Determines current game state
- `playHandBasicStrategy()` - Automatically plays a hand
- `advanceToNextRound()` - Proceeds to next round

## Triggering Dealer Blackjack

Since the game uses random shuffle, the dealer blackjack scenario occurs naturally about 4.8% of the time when dealer shows an Ace (31% chance of Ace × 30.77% chance of 10-value card for hole card = ~4.8% of all hands).

The multi-round test is designed to play enough hands to likely encounter this scenario.

### Future Enhancement: Deterministic Testing

For more reliable testing, consider implementing:

1. **Test Mode Query Parameter**
   ```typescript
   // In casino-table.tsx
   const searchParams = useSearchParams();
   const testMode = searchParams.get('test-mode');

   if (testMode === 'dealer-blackjack') {
     // Force specific cards
   }
   ```

2. **Seeded Randomness**
   ```typescript
   // In random.ts
   let seed = Date.now();

   export function setSeed(newSeed: number) {
     seed = newSeed;
   }

   export const randomInt = (min: number, max: number): number => {
     // Use seeded random instead of Math.random()
     seed = (seed * 9301 + 49297) % 233280;
     return min + (seed / 233280) * (max - min + 1);
   };
   ```

## Debugging Tests

### View Test Report
```bash
bunx playwright show-report
```

### Debug Specific Test
```bash
bunx playwright test --debug dealer-blackjack-insurance.spec.ts
```

### Take Screenshots on Failure
Screenshots are automatically captured on test failures and stored in `test-results/`.

### View Traces
Traces are captured on first retry. View them with:
```bash
bunx playwright show-trace test-results/.../trace.zip
```

## Writing New Tests

1. Create a new file in `e2e/` with `.spec.ts` extension
2. Import helpers from `./helpers/game-setup`
3. Follow the pattern from existing tests:

```typescript
import { test, expect } from '@playwright/test';
import { createAndLoginUser, goToCasinoTable, placeBet } from './helpers/game-setup';

test.describe('My Test Suite', () => {
  test.beforeEach(async ({ page }) => {
    await createAndLoginUser(page);
    await goToCasinoTable(page);
  });

  test('should do something', async ({ page }) => {
    await placeBet(page, 10);
    // ... test logic
  });
});
```

## CI/CD Integration

The tests are configured to run in CI with:
- 2 retries for flaky tests
- Single worker (no parallelization)
- Automatic server startup via `webServer` config

To run in CI:
```bash
CI=true bun run test
```
