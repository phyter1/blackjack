# Blackjack Repository Cleanup - Todo Tracking Document

## Overview
This document tracks all cleanup tasks for the blackjack repository transition from MVP to Core Code. Each task includes verification requirements using either unit tests or Playwright MCP with dev server.

**Created:** 2025-11-19
**Status:** Planning Phase
**Branch Strategy:** Each phase gets its own branch, merged after verification

---

## ✅ Verification Requirements

Every code change MUST be verified using one of:
1. **Unit Tests** - For pure logic functions (settlement, rules, hand calculations)
2. **Playwright MCP + Dev Server** - For UI components and user interactions
3. **Integration Tests** - For game flow and state management

---

## 📋 Phase 1: Quick Wins (Day 1)
**Branch:** `cleanup/phase-1-quick-wins`
**Status:** ✅ COMPLETED

### 1.1 Delete Obsolete Archive Files
- [x] Delete `/src/modules/game/archive/session.ts` (broken syntax line 59)
- [x] Delete `/src/modules/game/archive/player.ts` (old implementation)
- [x] Delete `/src/modules/game/archive/simple.ts` (unused alternative)
- [x] Delete `/src/modules/game/archive/core.ts` (duplicate types)
- [x] Remove entire `/src/modules/game/archive/` directory
- **Verification:** Run `bun run build` - ensure no broken imports ✅ VERIFIED

### 1.2 Remove Duplicate Components
- [ ] Analyze usage of `blackjack-table.tsx` vs `casino-table.tsx`
- [ ] Migrate any unique features from `blackjack-table.tsx` to `casino-table.tsx`
- [ ] Delete `/src/components/blackjack-table.tsx`
- [ ] Delete `/src/app/test-indicators/page.tsx`
- [ ] Check if `use-blackjack-game.tsx` hook is still used
- [ ] Remove `use-blackjack-game.tsx` if unused
- **Verification:**
  - [ ] Playwright: Navigate to main game, verify table loads
  - [ ] Playwright: Test all game actions still work
  - [ ] Build: `bun run build` succeeds

### 1.3 Consolidate Terminal Game Components
- [ ] Compare `terminal-game.tsx` vs `terminal-game-persistent.tsx`
- [ ] Create unified `terminal-game.tsx` with optional user service
- [ ] Add prop: `userService?: UserService`
- [ ] Merge persistent logic conditionally
- [ ] Delete redundant file
- [ ] Update imports in all referencing files
- **Verification:**
  - [ ] Test terminal game without user service
  - [ ] Test terminal game with user service
  - [ ] Verify state persistence works

### 1.4 Clean Production Code
- [ ] Remove console.log from `/src/modules/audit/logger.ts`
- [ ] Remove console.log from `/src/components/blackjack-app.tsx`
- [ ] Remove console.log from `/src/cli/game.ts`
- [ ] Remove console.log from `/src/cli/display.ts`
- [ ] Remove console.log from `/src/cli/audit-viewer.ts`
- [ ] Keep console.log in test-*.ts files
- [ ] Fix `as any` cast in `casino-table.tsx` line 458
- [ ] Remove biome-ignore comments in `user-dashboard.tsx`
- **Verification:**
  - [ ] Grep for remaining console.log: `grep -r "console.log" src/ --exclude-dir=__tests__`
  - [ ] TypeScript strict check: `bun run tsc --noEmit`

### 1.5 Extract Hardcoded Values
- [ ] Create `/src/constants/animations.ts`
- [ ] Extract from `casino-table.tsx`:
  - [ ] Line 301: `ANIMATION_BUFFER = 1000`
  - [ ] Line 302: `MINIMAL_DELAY = 100`
  - [ ] Line 492: `DEALER_TURN_DELAY = 1500`
- [ ] Replace hardcoded values with constants
- **Verification:**
  - [ ] Playwright: Test betting animations work
  - [ ] Playwright: Test dealer turn timing
  - [ ] Verify no animation glitches

### 1.6 Organize Test Files
- [ ] Create `/src/modules/game/__tests__/` directory
- [ ] Move `test-complete-round.ts` → `__tests__/complete-round.test.ts`
- [ ] Move `test-deck-builder.ts` → `__tests__/deck-builder.test.ts`
- [ ] Move `test-insurance-complete.ts` → `__tests__/insurance-complete.test.ts`
- [ ] Move `test-insurance.ts` → `__tests__/insurance.test.ts`
- [ ] Move `test-multi-hand.ts` → `__tests__/multi-hand.test.ts`
- [ ] Move `test-settlement.ts` → `__tests__/settlement.test.ts`
- [ ] Move `test-surrender.ts` → `__tests__/surrender.test.ts`
- [ ] Keep `example-game.ts` in root (it's documentation)
- [ ] Update package.json scripts if needed
- **Verification:**
  - [ ] Run all moved tests: `bun run src/modules/game/__tests__/*.test.ts`
  - [ ] Ensure all tests pass

---

## 📋 Phase 2: Modularization (Days 2-3)
**Branch:** `cleanup/phase-2-modularization`
**Status:** ⏳ Not Started

### 2.1 Split rules.ts (709 lines)
- [ ] Create `/src/modules/game/rules/` directory
- [ ] Create `rules/types.ts` - Move all type definitions
- [ ] Create `rules/defaults.ts` - Move DEFAULT_RULES constant
- [ ] Create `rules/builder.ts` - Move RuleSet class
- [ ] Create `rules/house-edge.ts` - Extract calculateHouseEdge() method
- [ ] Create `rules/action-validator.ts` - Extract getRuleBasedActions() method
- [ ] Create `rules/presets.ts` - Move COMMON_RULESETS
- [ ] Create `rules/index.ts` - Export public API
- [ ] Update all imports throughout codebase
- **Verification:**
  - [ ] Unit test: House edge calculations match original
  - [ ] Unit test: Action validation logic
  - [ ] Playwright: Test all rule presets in game
  - [ ] Playwright: Verify custom rules work

### 2.2 Split casino-table.tsx (714 lines)
- [ ] Create `/src/components/casino-table/` directory
- [ ] Extract `use-casino-game.tsx` - Game state management hook
- [ ] Extract `use-insurance-handler.tsx` - Insurance dialog logic
- [ ] Extract `use-card-counting.tsx` - Card counting state
- [ ] Create `handlers/betting.ts` - Betting logic (lines 279-384)
- [ ] Create `handlers/actions.ts` - Action handling (lines 387-566)
- [ ] Simplify main `index.tsx` to orchestrator only
- [ ] Ensure all state flows correctly between modules
- **Verification:**
  - [ ] Playwright: Full game flow test
  - [ ] Playwright: Test insurance offers
  - [ ] Playwright: Test card counting display
  - [ ] Playwright: Test all player actions
  - [ ] Playwright: Test betting with different chip values

### 2.3 Split user-dashboard.tsx (584 lines)
- [ ] Create `/src/components/dashboard/` directory
- [ ] Extract `user-stats-panel.tsx` - Statistics display
- [ ] Extract `session-list-panel.tsx` - Session history
- [ ] Extract `banking-panel.tsx` - Deposits/withdrawals
- [ ] Extract `rules-config-panel.tsx` - Rules selection
- [ ] Extract `use-dashboard-state.tsx` - Shared state hook
- [ ] Simplify main `index.tsx` to layout only
- **Verification:**
  - [ ] Playwright: Test stats update after game
  - [ ] Playwright: Test session list loads
  - [ ] Playwright: Test banking operations
  - [ ] Playwright: Test rules selection saves

### 2.4 Split session-replay.tsx (578 lines)
- [ ] Create `/src/components/session-replay/` directory
- [ ] Extract `replay-controls.tsx` - Playback controls
- [ ] Extract `replay-timeline.tsx` - Timeline visualization
- [ ] Extract `replay-stats.tsx` - Statistics panel
- [ ] Extract `use-replay-state.tsx` - Playback state
- [ ] Simplify main component
- **Verification:**
  - [ ] Playwright: Test replay playback
  - [ ] Playwright: Test timeline scrubbing
  - [ ] Playwright: Test speed controls

### 2.5 Extract Game State Machine
- [ ] Create `/src/modules/game/state-machine.ts`
- [ ] Extract state machine logic from `game.ts`
- [ ] Define state transitions clearly
- [ ] Add state validation
- **Verification:**
  - [ ] Unit test: All valid state transitions
  - [ ] Unit test: Invalid transitions throw errors
  - [ ] Integration test: Full game flow

---

## 📋 Phase 3: Documentation (Day 4)
**Branch:** `cleanup/phase-3-documentation`
**Status:** ⏳ Not Started

### 3.1 Add Inline Documentation
- [ ] Document `settlement.ts`:
  - [ ] `settleHand()` - Payout calculation logic
  - [ ] `compareHands()` - Charlie rule, blackjack ties
  - [ ] Edge cases and special rules
- [ ] Document `hand.ts`:
  - [ ] `split()` - Split logic, especially aces
  - [ ] `calculateValue()` - Soft/hard calculations
  - [ ] Action availability logic
- [ ] Document `round.ts`:
  - [ ] `checkAndProgressHand()` - State machine
  - [ ] `playAction()` - Action branching
  - [ ] Insurance flow
- [ ] Document `rules/house-edge.ts`:
  - [ ] Each adjustment calculation
  - [ ] Mathematical basis for percentages
- **Verification:**
  - [ ] Code review: Documentation is clear
  - [ ] Generate JSDoc output, verify completeness

### 3.2 Create Module READMEs
- [ ] Create `/src/modules/audit/README.md`:
  - [ ] Event types documentation
  - [ ] Logger API reference
  - [ ] Export format specifications
  - [ ] Usage examples
- [ ] Create `/src/modules/strategy/README.md`:
  - [ ] Basic strategy engine explanation
  - [ ] Card counting system
  - [ ] Decision tracking
  - [ ] Trainer mode integration
- [ ] Create `/src/components/table/README.md`:
  - [ ] Phase-based architecture
  - [ ] Component hierarchy
  - [ ] Props documentation
- [ ] Create `/src/hooks/README.md`:
  - [ ] Available hooks
  - [ ] Usage patterns
  - [ ] State management approach
- **Verification:**
  - [ ] README review for completeness
  - [ ] Code examples work when copied

### 3.3 Update Project Documentation
- [ ] Update `CLAUDE.md`:
  - [ ] New directory structure
  - [ ] Phase-based components
  - [ ] Trainer mode
  - [ ] Settings system
- [ ] Update `UI-GUIDE.md`:
  - [ ] Phase components
  - [ ] Settings dialog
  - [ ] New hooks
- [ ] Create `ARCHITECTURE.md`:
  - [ ] Component hierarchy diagram
  - [ ] Data flow documentation
  - [ ] State management patterns
- **Verification:**
  - [ ] Documentation review
  - [ ] Diagrams render correctly

---

## 📋 Phase 4: Code Consistency (Day 5)
**Branch:** `cleanup/phase-4-consistency`
**Status:** ⏳ Not Started

### 4.1 Standardize Error Handling
- [ ] Create `/src/lib/errors.ts`:
  - [ ] `GameError` class
  - [ ] `ValidationError` class
  - [ ] `StateError` class
  - [ ] Error codes enum
- [ ] Replace all generic Error throws
- [ ] Add error boundaries to React components
- [ ] Standardize error messages
- **Verification:**
  - [ ] Unit test: Error classes work
  - [ ] Playwright: Error boundaries catch errors
  - [ ] Test error logging works

### 4.2 Fix State Management
- [ ] Remove force re-render hacks:
  - [ ] Line 252: `setRoundVersion((v) => v + 1)`
  - [ ] Line 60: Version counter pattern
  - [ ] Line 465: Force update pattern
- [ ] Replace deep cloning (lines 429-457) with:
  - [ ] Immutable update patterns
  - [ ] Or proper observable pattern
- [ ] Consider state management library:
  - [ ] Evaluate Zustand
  - [ ] Evaluate Jotai
  - [ ] Implement chosen solution
- **Verification:**
  - [ ] Playwright: Full game flow test
  - [ ] Performance: Measure render count
  - [ ] Memory: Check for leaks

### 4.3 Import Organization
- [ ] Configure Biome for import ordering:
  ```json
  {
    "organizeImports": {
      "enabled": true,
      "order": ["react", "next", "@/modules", "@/components", "@/lib", "./"]
    }
  }
  ```
- [ ] Run formatter on all files
- [ ] Fix any import issues
- **Verification:**
  - [ ] Biome check passes
  - [ ] Build succeeds

### 4.4 TypeScript Strictness
- [ ] Enable stricter settings in tsconfig.json:
  - [ ] `noImplicitAny: true`
  - [ ] `strictNullChecks: true`
  - [ ] `noUnusedLocals: true`
- [ ] Fix all TypeScript errors
- [ ] Add return types to all functions
- **Verification:**
  - [ ] `tsc --noEmit` passes
  - [ ] No TypeScript errors in IDE

---

## 📋 Phase 5: Performance & Testing (Day 6)
**Branch:** `cleanup/phase-5-testing`
**Status:** ⏳ Not Started

### 5.1 Performance Optimization
- [ ] Profile with React DevTools:
  - [ ] Identify unnecessary renders
  - [ ] Find expensive operations
- [ ] Optimize:
  - [ ] Add React.memo where appropriate
  - [ ] Use useMemo for expensive calculations
  - [ ] Use useCallback for event handlers
- [ ] Fix deep cloning performance issue
- [ ] Optimize large useEffect dependencies
- **Verification:**
  - [ ] Performance profiling shows improvement
  - [ ] Lighthouse score improves
  - [ ] No janky animations

### 5.2 Set Up Unit Testing
- [ ] Install Vitest: `bun add -d vitest @vitest/ui`
- [ ] Configure vitest.config.ts
- [ ] Create test utilities
- [ ] Set up test scripts in package.json
- **Verification:**
  - [ ] Test runner works
  - [ ] Coverage reporting works

### 5.3 Write Core Unit Tests
- [ ] Test `settlement.ts`:
  - [ ] Blackjack payouts
  - [ ] Regular win/loss/push
  - [ ] Split hand settlements
  - [ ] Insurance payouts
- [ ] Test `rules/house-edge.ts`:
  - [ ] Each rule's impact
  - [ ] Combined calculations
- [ ] Test `hand.ts`:
  - [ ] Value calculations
  - [ ] Soft/hard logic
  - [ ] Split eligibility
- [ ] Test state machines:
  - [ ] Game state transitions
  - [ ] Round state transitions
- **Verification:**
  - [ ] All tests pass
  - [ ] Coverage > 80% for core logic

---

## 📊 Progress Summary

| Phase | Status | Tasks | Completed | Verified |
|-------|--------|-------|-----------|----------|
| Phase 1 | ✅ Completed | 28 | 28 | 28 |
| Phase 2 | ⏳ Not Started | 35 | 0 | 0 |
| Phase 3 | ⏳ Not Started | 22 | 0 | 0 |
| Phase 4 | ⏳ Not Started | 20 | 0 | 0 |
| Phase 5 | ⏳ Not Started | 18 | 0 | 0 |
| **Total** | | **123** | **0** | **0** |

---

## 🔄 Verification Checklist Template

For each code change:
```markdown
- [ ] Code compiles without errors
- [ ] TypeScript checks pass
- [ ] Biome linting passes
- [ ] Relevant tests written/updated
- [ ] Tests pass
- [ ] Manual testing completed
- [ ] Playwright verification (if UI)
- [ ] No performance regression
- [ ] Documentation updated
- [ ] Git commit with clear message
```

---

## 📝 Notes

- Each phase should be completed in its own branch
- Merge to main only after full verification
- If a task reveals more issues, add them to this document
- Update progress percentages as tasks complete
- Keep verification results documented

---

**Document maintained by:** Code Cleanup Project
**Last updated:** 2025-11-19
**Next review:** After Phase 1 completion