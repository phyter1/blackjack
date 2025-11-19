# Modular Rules Architecture

## Overview

The blackjack rules system has been refactored from a monolithic 700+ line file into a modular architecture with clear separation of concerns. Each module handles a specific aspect of rule management.

## Module Structure

```bash
src/modules/game/rules/
├── types.ts            # Type definitions (228 lines)
├── defaults.ts         # Default configuration (71 lines)
├── builder.ts          # RuleSet builder class (246 lines)
├── house-edge.ts       # House edge calculations (180 lines)
├── action-validator.ts # Action validation logic (238 lines)
├── presets.ts          # Common rule presets (112 lines)
└── index.ts            # Public API exports (89 lines)
```

## Module Responsibilities

### 1. Types (`types.ts`)

Defines all rule-related TypeScript types and interfaces:

```typescript
// Core rule set definition
export type CompleteRuleSet = {
  dealerStand: DealerStandRule;
  dealerPeek: DealerPeekRule;
  doubleAfterSplit: DASRule;
  // ... all other rules
};

// Individual rule types
export type DealerStandRule = "h17" | "s17";
export type BlackjackPayoutRule = [number, number]; // e.g., [3, 2]
export type SurrenderRule = "none" | "late" | "early";
// ... etc
```

### 2. Defaults (`defaults.ts`)

Provides the standard Vegas Strip rules as defaults:

```typescript
export const DEFAULT_RULES: CompleteRuleSet = {
  dealerStand: "s17",
  dealerPeek: true,
  doubleAfterSplit: true,
  blackjackPayout: [3, 2],
  deckCount: 6,
  // ... all default values
};
```

### 3. Builder (`builder.ts`)

Implements the fluent builder pattern for rule configuration:

```typescript
export class RuleSet {
  setDealerStand(rule: "h17" | "s17"): RuleSet
  setBlackjackPayout(numerator: number, denominator: number): RuleSet
  setDoubleAfterSplit(allowed: boolean): RuleSet
  setSurrender(type: "none" | "late" | "early"): RuleSet
  // ... all setter methods

  build(): CompleteRuleSet
  describe(): string
}
```

### 4. House Edge Calculator (`house-edge.ts`)

Calculates the mathematical house advantage for any rule combination:

```typescript
export function calculateHouseEdge(rules: CompleteRuleSet): number {
  let edge = 0.0;

  // Dealer rules impact
  if (rules.dealerStand === "h17") edge += 0.22;

  // Payout rules impact
  if (rules.blackjackPayout[0] === 6 && rules.blackjackPayout[1] === 5) {
    edge += 1.39;
  }

  // ... all calculations

  return Math.round(edge * 100) / 100;
}
```

### 5. Action Validator (`action-validator.ts`)

Determines which actions are available based on current rules:

```typescript
export function getRuleBasedActions(
  hand: Hand,
  dealerCard: Card,
  rules: CompleteRuleSet,
  isFirstAction: boolean = true
): ActionType[] {
  const actions: ActionType[] = [ACTION_HIT, ACTION_STAND];

  // Check double down rules
  if (canDouble(hand, rules, isFirstAction)) {
    actions.push(ACTION_DOUBLE);
  }

  // Check split rules
  if (canSplit(hand, rules)) {
    actions.push(ACTION_SPLIT);
  }

  // Check surrender rules
  if (canSurrender(hand, dealerCard, rules, isFirstAction)) {
    actions.push(ACTION_SURRENDER);
  }

  return actions;
}
```

### 6. Presets (`presets.ts`)

Provides common casino rule configurations:

```typescript
export const COMMON_RULESETS = {
  vegasStrip: () => new RuleSet()
    .setDealerStand("s17")
    .setBlackjackPayout(3, 2)
    .setDoubleAfterSplit(true),

  atlanticCity: () => new RuleSet()
    .setDealerStand("s17")
    .setSurrender("late")
    .setResplitAces(false),

  europeanNoHole: () => new RuleSet()
    .setDealerPeek(false)
    .setDoubleOnTwo(false),

  // ... other presets
};
```

### 7. Index (`index.ts`)

Exports the public API and re-exports necessary types:

```typescript
// Main exports
export { RuleSet } from "./builder";
export { COMMON_RULESETS } from "./presets";
export { calculateHouseEdge } from "./house-edge";
export { getRuleBasedActions } from "./action-validator";

// Type exports
export type { CompleteRuleSet, DealerStandRule, /* ... */ } from "./types";
```

## Usage Examples

### Basic Rule Configuration

```typescript
import { RuleSet, COMMON_RULESETS } from "@/modules/game/rules";

// Use a preset
const vegasRules = COMMON_RULESETS.vegasStrip();

// Custom configuration
const customRules = new RuleSet()
  .setDealerStand("h17")
  .setBlackjackPayout(6, 5)  // Terrible 6:5 payout
  .setDoubleAfterSplit(false)
  .setSurrender("late")
  .build();

// Check house edge
console.log(customRules.houseEdge); // 2.01%
```

### Action Validation

```typescript
import { getRuleBasedActions } from "@/modules/game/rules";

const availableActions = getRuleBasedActions(
  playerHand,
  dealerUpCard,
  rules,
  isFirstAction
);

if (availableActions.includes(ACTION_DOUBLE)) {
  // Player can double down
}
```

### Rule Description

```typescript
const rules = new RuleSet()
  .setDealerStand("s17")
  .setBlackjackPayout(3, 2);

console.log(rules.describe());
// Output: "Dealer stands on soft 17, Blackjack pays 3:2, ..."
```

## Benefits of Modularization

### 1. Single Responsibility

Each module has one clear purpose:

- Types: Define data structures
- Builder: Configure rules
- Calculator: Compute house edge
- Validator: Check valid actions

### 2. Maintainability

- Easier to locate specific functionality
- Changes isolated to relevant module
- Reduced cognitive load per file

### 3. Testability

- Each module can be tested in isolation
- Mock dependencies easily
- Clear test boundaries

### 4. Reusability

- Import only what's needed
- Share types across modules
- Extend functionality without modifying core

### 5. Performance

- Smaller bundle sizes with tree-shaking
- Load only required modules
- Optimize hot paths independently

## Architecture Patterns

### Builder Pattern

```typescript
class RuleSet {
  private rules: Partial<CompleteRuleSet> = {};

  setDealerStand(rule: DealerStandRule): RuleSet {
    this.rules.dealerStand = rule;
    return this; // Fluent interface
  }

  build(): CompleteRuleSet {
    return { ...DEFAULT_RULES, ...this.rules };
  }
}
```

### Factory Pattern

```typescript
export const COMMON_RULESETS = {
  vegasStrip: () => new RuleSet()
    .setDealerStand("s17")
    .build(),

  // Factory functions for common configurations
};
```

### Strategy Pattern

```typescript
// Different validation strategies based on rules
function canDouble(hand: Hand, rules: CompleteRuleSet): boolean {
  if (rules.doubleOnTwo && hand.cards.length !== 2) {
    return false;
  }
  // Strategy varies based on rules
}
```

## Testing Strategy

### Unit Tests per Module

```typescript
// types.test.ts - Type validation
// defaults.test.ts - Default values
// builder.test.ts - Builder logic
// house-edge.test.ts - Mathematical accuracy
// action-validator.test.ts - Rule enforcement
// presets.test.ts - Preset configurations
```

### Integration Tests

```typescript
// Test complete rule flows
describe("Rule System Integration", () => {
  it("should calculate correct house edge for presets", () => {
    const vegas = COMMON_RULESETS.vegasStrip().build();
    expect(vegas.houseEdge).toBeCloseTo(0.29, 2);
  });
});
```

## Migration Guide

### From Monolithic to Modular

Before (monolithic):

```typescript
import { RuleSet } from "@/modules/game/rules";
```

After (modular):

```typescript
import { RuleSet } from "@/modules/game/rules";
// Or specific imports
import { calculateHouseEdge } from "@/modules/game/rules/house-edge";
import { COMMON_RULESETS } from "@/modules/game/rules/presets";
```

The public API remains unchanged, ensuring backward compatibility.

## Future Enhancements

1. **Rule Variants**: Add regional rule variations
2. **Side Bets**: Implement side bet rules and payouts
3. **Tournament Rules**: Special rules for tournament play
4. **Custom Validators**: Plugin system for custom rule validation
5. **Rule History**: Track rule changes over time

## Related Documentation

- [Game Architecture](QUICK-START.md)
- [State Machine Architecture](STATE-MACHINE-ARCHITECTURE.md)
- [Casino Table Architecture](CASINO-TABLE-ARCHITECTURE.md)
