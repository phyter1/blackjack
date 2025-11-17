# CLAUDE.md - AI Assistant Guide for Blackjack Repository

## Repository Overview

This is a comprehensive **Blackjack game simulation and training platform** built with:
- **Next.js 16** (React 19) - Web UI with App Router
- **TypeScript** - Full type safety
- **Bun** - Runtime and package manager
- **shadcn/ui** - Component library (New York style)
- **Tailwind CSS v4** - Styling
- **Biome** - Linting and formatting

The project features:
- A fully-functional blackjack game engine with realistic rules
- Beautiful web UI with casino-style visuals
- Interactive CLI for terminal play
- Comprehensive audit trail system
- Basic strategy and card counting utilities
- Multiple rule sets (Vegas Strip, Atlantic City, etc.)

---

## Directory Structure

```
blackjack/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── page.tsx           # Main entry point
│   │   ├── layout.tsx         # Root layout with fonts
│   │   └── globals.css        # Global styles
│   ├── modules/               # Core game logic (framework-agnostic)
│   │   ├── game/             # Blackjack game engine
│   │   │   ├── game.ts       # Main Game class
│   │   │   ├── round.ts      # Round management
│   │   │   ├── hand.ts       # Player hand logic
│   │   │   ├── dealer-hand.ts# Dealer-specific hand
│   │   │   ├── player.ts     # Player management
│   │   │   ├── bank.ts       # Money management (Bank, Escrow, House)
│   │   │   ├── rules.ts      # Rule sets and house edge calculation
│   │   │   ├── settlement.ts # Payout and outcome determination
│   │   │   ├── cards.ts      # Card definitions (Suit, Rank)
│   │   │   ├── shoe.ts       # Multi-deck shoe management
│   │   │   ├── shuffle.ts    # Realistic shuffling algorithms
│   │   │   ├── action.ts     # Player actions (Hit, Stand, etc.)
│   │   │   ├── random.ts     # Random utilities
│   │   │   ├── archive/      # Deprecated/legacy code
│   │   │   ├── test-*.ts     # Integration tests
│   │   │   └── index.ts      # Public API exports
│   │   ├── audit/            # Audit trail system
│   │   │   ├── logger.ts     # Centralized event logging
│   │   │   ├── types.ts      # 25+ strongly-typed events
│   │   │   └── index.ts      # Exports
│   │   └── strategy/         # Strategy utilities
│   │       ├── basic-strategy.ts    # Basic strategy engine
│   │       ├── hi-lo-counter.ts     # Card counting
│   │       ├── ev-calculator.ts     # Expected value
│   │       └── decision-tracker.ts  # Track decisions
│   ├── components/           # React components
│   │   ├── ui/              # shadcn/ui primitives
│   │   ├── blackjack-table.tsx      # Main game component
│   │   ├── card.tsx                 # Playing card display
│   │   ├── hand-display.tsx         # Hand with cards
│   │   ├── betting-controls.tsx     # Chip-based betting
│   │   ├── action-buttons.tsx       # Hit/Stand/etc buttons
│   │   ├── insurance-dialog.tsx     # Insurance modal
│   │   ├── game-stats.tsx           # Balance/round info
│   │   ├── terminal-*.tsx           # Terminal/CLI components
│   │   └── ...                      # Other components
│   ├── hooks/               # React hooks
│   │   └── use-blackjack-game.tsx  # Game state management
│   ├── cli/                 # Command-line interface
│   │   ├── game.ts         # CLI game loop
│   │   ├── display.ts      # ASCII card rendering
│   │   └── audit-viewer.ts # Audit trail viewer
│   ├── lib/                # Utility functions
│   │   ├── utils.ts        # General utilities (cn, etc.)
│   │   ├── terminal-display.ts     # Terminal UI helpers
│   │   └── storage.ts      # Local storage utilities
│   ├── services/           # External services
│   │   └── user-service.ts # User management (future)
│   └── types/              # (currently unused - types in modules)
├── public/                 # Static assets
│   └── favicon.ico        # Site icon
├── audit-logs/            # Generated audit trail files (gitignored)
├── *.md                   # Documentation files
├── package.json           # Dependencies and scripts
├── tsconfig.json          # TypeScript configuration
├── biome.json             # Biome linter/formatter config
├── components.json        # shadcn/ui configuration
├── next.config.ts         # Next.js configuration
└── bun.lock              # Bun lockfile
```

---

## Core Architecture

### Game Engine (Framework-Agnostic)

The game engine in `src/modules/game/` is **completely independent** of React or Next.js. It can be used in:
- Web UI (via React hooks)
- CLI (via direct instantiation)
- Node.js scripts
- Tests

**Key Classes:**

1. **`Game`** - Main orchestrator
   - Manages players, house, shoe, rounds
   - Provides high-level API
   - Tracks session and round state
   - Integrates audit logging

2. **`Round`** - Single game round
   - Manages bets, dealing, player turns
   - Handles insurance offers
   - Coordinates settlement
   - Tracks round state machine

3. **`Hand`** - Player or dealer hand
   - Manages cards and betting
   - Calculates hand value (soft/hard)
   - Executes actions (hit, stand, double, split)
   - Uses Escrow for bet management

4. **`Bank`** - Money management
   - `Bank` - Individual player/house balance
   - `Escrow` - Holds bets during play
   - `House` - Special bank for the house
   - All transactions are audited

5. **`RuleSet`** - Game rules configuration
   - Fluent builder API
   - Calculates house edge
   - Includes common presets (Vegas Strip, etc.)

6. **`Shoe`** - Multi-deck shoe
   - Manages card stack
   - Handles penetration and reshuffling
   - Realistic shuffle algorithms

### UI Layer (React/Next.js)

The UI layer wraps the game engine with React components:

1. **`use-blackjack-game.tsx`** - Context provider
   - Wraps `Game` class with React hooks
   - Provides actions: `startGame`, `placeBet`, `playAction`, etc.
   - Force re-render pattern for state updates

2. **Component Hierarchy:**
   ```
   BlackjackTable (main orchestrator)
   ├── GameStats (balance, round, bet)
   ├── HandDisplay (dealer)
   ├── BettingControls (chip interface)
   ├── ActionButtons (hit/stand/etc)
   ├── InsuranceDialog (modal)
   └── HandDisplay (player hands)
   ```

### Audit System

Every significant event is logged:
- Bank transactions (credit/debit)
- Round lifecycle (start/complete)
- Player actions (hit/stand/double/split)
- Insurance events
- Settlement results

Events are exported to JSON/CSV for analysis.

---

## Development Workflows

### Setup

```bash
# Install dependencies
bun install

# Run development server (web UI)
bun run dev
# Visit http://localhost:3000

# Run CLI game
bun run cli

# Run audit viewer
bun run audit-viewer
```

### Building and Deployment

```bash
# Build for production
bun run build

# Start production server
bun run start

# Lint code
bun run lint

# Format code
bun run format
```

### Testing

The project includes integration tests:
```bash
# Run specific tests (these are scripts, not a test framework)
bun run src/modules/game/example-game.ts
bun run src/modules/game/test-complete-round.ts
bun run src/modules/game/test-settlement.ts
bun run src/modules/game/test-insurance.ts
bun run src/modules/game/test-surrender.ts
```

**Note:** These are standalone test scripts, not part of a test framework like Jest or Vitest.

---

## Code Conventions

### TypeScript

- **Strict mode enabled** - All types must be explicit
- **Path aliases** - Use `@/` for imports (maps to `src/`)
  ```typescript
  import { Game } from "@/modules/game";
  import { Button } from "@/components/ui/button";
  ```
- **Type exports** - Always export types separately
  ```typescript
  export type { Card, Stack, Deck } from "./cards";
  export { newDeck, SUITS, RANKS } from "./cards";
  ```
- **Const assertions** - Use `as const` for immutable arrays
  ```typescript
  export const SUITS = ["hearts", "diamonds", "clubs", "spades"] as const;
  ```

### Formatting (Biome)

- **Indent:** 2 spaces
- **Style:** New York (shadcn/ui)
- **Line length:** No strict limit, but keep readable
- **Import organization:** Automatic via Biome

Run `bun run format` before committing.

### File Naming

- **TypeScript files:** `kebab-case.ts` or `kebab-case.tsx`
- **React components:** `PascalCase` or `kebab-case.tsx` (component names are always PascalCase)
- **Test files:** `test-*.ts` (e.g., `test-settlement.ts`)
- **Archive/deprecated:** Move to `archive/` subdirectory

### Component Patterns

1. **Separation of concerns** - UI components don't contain game logic
2. **Single source of truth** - Game class manages all state
3. **Props over context** - Pass data explicitly when possible
4. **Declarative rendering** - Components render based on props, not internal state
5. **Force re-render pattern** - Game engine doesn't notify; React hooks trigger re-renders

Example:
```typescript
// Hook wraps game engine
const game = useRef(new Game()).current;
const [, forceUpdate] = useReducer(x => x + 1, 0);

const hit = () => {
  game.playAction(ACTION_HIT);
  forceUpdate(); // Trigger React re-render
};
```

### Module Exports

Every module has an `index.ts` that exports the public API:

```typescript
// src/modules/game/index.ts
export { Game } from "./game";
export type { GameState, PlayerBet } from "./game";
export { Round } from "./round";
// ... etc
```

Consumers import from the module root:
```typescript
import { Game, Round, Hand } from "@/modules/game";
```

---

## Key Files and Their Purposes

### Configuration Files

| File | Purpose |
|------|---------|
| `package.json` | Dependencies, scripts, project metadata |
| `tsconfig.json` | TypeScript compiler options, path aliases |
| `biome.json` | Linter and formatter configuration |
| `components.json` | shadcn/ui configuration |
| `next.config.ts` | Next.js configuration (React compiler enabled) |
| `postcss.config.mjs` | PostCSS configuration for Tailwind |

### Documentation Files

| File | Purpose |
|------|---------|
| `README.md` | Generic Next.js getting started (not very useful) |
| `QUICK-START.md` | **Essential** - How to use the game engine API |
| `CLI-README.md` | CLI game documentation |
| `UI-GUIDE.md` | Web UI architecture and features |
| `AUDIT-TRAIL.md` | Audit system documentation |
| `CLAUDE.md` | **This file** - AI assistant guide |

### Entry Points

| File | Purpose |
|------|---------|
| `src/app/page.tsx` | Web UI entry point |
| `src/cli/game.ts` | CLI game entry point |
| `src/cli/audit-viewer.ts` | Audit viewer entry point |
| `src/modules/game/example-game.ts` | Example usage script |

### Core Game Files (in order of importance)

1. `src/modules/game/game.ts` - Main `Game` class
2. `src/modules/game/round.ts` - Round management
3. `src/modules/game/hand.ts` - Hand logic and actions
4. `src/modules/game/settlement.ts` - Payout calculations
5. `src/modules/game/rules.ts` - Rule sets and house edge
6. `src/modules/game/bank.ts` - Money management
7. `src/modules/game/shoe.ts` - Shoe and dealing
8. `src/modules/game/cards.ts` - Card definitions
9. `src/modules/game/dealer-hand.ts` - Dealer-specific logic
10. `src/modules/game/player.ts` - Player management

---

## Important Patterns and Idioms

### Game State Machine

The `Game` class has three states:
- `"waiting_for_bets"` - Ready to start a new round
- `"in_round"` - Round in progress
- `"round_complete"` - Round finished, awaiting next round

The `Round` class has its own state machine:
- `"player_turn"` - Players making decisions
- `"dealer_turn"` - Dealer playing
- `"settling"` - Calculating payouts
- `"complete"` - Round finished

### Money Flow

1. Player places bet → Money moves from `Bank` to `Escrow`
2. Round plays
3. Settlement → Money moves from `Escrow` to `Bank` (player) or `House`

All transactions are audited automatically.

### Hand Values

Hands track both soft and hard values:
- **Soft hand:** Contains an Ace counted as 11 (e.g., A-6 = soft 17)
- **Hard hand:** No Ace or Ace counted as 1 (e.g., 10-7 = hard 17)

```typescript
hand.handValue      // Best value (soft if possible)
hand.isSoft         // true if soft
hand.hardValue      // Always the hard value
```

### Actions and Availability

Actions are context-dependent:
```typescript
const actions = game.getAvailableActions();
// Returns: ["hit", "stand", "double", "split"]

if (actions.includes(ACTION_DOUBLE)) {
  // Can double
}
```

### Rule Set Builder Pattern

```typescript
const rules = new RuleSet()
  .setDealerStand("s17")      // Dealer stands on soft 17
  .setBlackjackPayout(3, 2)   // 3:2 blackjack payout
  .setDoubleAfterSplit(true)  // Allow DAS
  .setSurrender("late");      // Late surrender

const builtRules = rules.build();
console.log(builtRules.houseEdge); // e.g., 0.29%
```

Common presets available:
```typescript
import { COMMON_RULESETS } from "@/modules/game";

COMMON_RULESETS.vegasStrip()      // 0.29% edge
COMMON_RULESETS.atlanticCity()    // 0.36% edge
COMMON_RULESETS.downtown()        // 0.39% edge
COMMON_RULESETS.singleDeck()      // 0.17% edge
COMMON_RULESETS.liberal()         // 0.19% edge
COMMON_RULESETS.terrible65()      // 2.01% edge (avoid!)
```

### Audit Trail Usage

```typescript
// Audit logging is automatic when using Game class
const game = new Game(6, 0.75, 1000000);
const sessionId = game.getSessionId();

// Play some rounds...

// Export audit data
const json = game.getAuditTrailJSON();
const csv = game.getAuditTrailCSV();
const summary = game.getAuditSummary();

// End session (logs session_end event)
game.endSession();
```

---

## Common Tasks for AI Assistants

### Adding a New Feature to the Game Engine

1. **Identify the right module:**
   - Player action? → `action.ts`, `hand.ts`
   - New rule? → `rules.ts`
   - Settlement logic? → `settlement.ts`
   - Money management? → `bank.ts`

2. **Update types if needed:**
   - Add to type definitions
   - Export from `index.ts`

3. **Add audit logging:**
   - Define event type in `audit/types.ts`
   - Log event at appropriate point
   - Export event type from `audit/index.ts`

4. **Test with integration script:**
   - Create `test-feature-name.ts`
   - Run with `bun run src/modules/game/test-feature-name.ts`

5. **Update documentation:**
   - Add to `QUICK-START.md` if API changed
   - Update `AUDIT-TRAIL.md` if new events

### Adding a New UI Component

1. **Create component in `src/components/`:**
   ```typescript
   // betting-display.tsx
   export function BettingDisplay({ bet }: { bet: number }) {
     return <div>Current bet: ${bet}</div>;
   }
   ```

2. **Use shadcn/ui primitives:**
   ```typescript
   import { Card, CardContent } from "@/components/ui/card";
   import { Button } from "@/components/ui/button";
   ```

3. **Integrate with game hook:**
   ```typescript
   const { currentBet, placeBet } = useBlackjackGame();
   ```

4. **Add to main table:**
   - Import in `blackjack-table.tsx`
   - Place in appropriate section

### Modifying Rules

The `RuleSet` class uses a builder pattern. To add a new rule:

1. **Define rule interface in `rules.ts`:**
   ```typescript
   export type MyNewRule = {
     enabled: boolean;
     someValue: number;
   };
   ```

2. **Add to `CompleteRuleSet` type:**
   ```typescript
   export type CompleteRuleSet = {
     // ... existing rules
     myNewRule: MyNewRule;
   };
   ```

3. **Add builder method to `RuleSet` class:**
   ```typescript
   setMyNewRule(enabled: boolean, someValue: number): RuleSet {
     this.rules.myNewRule = { enabled, someValue };
     return this;
   }
   ```

4. **Update house edge calculation in `calculateHouseEdge()`**

5. **Use in game logic where appropriate**

### Running the Project

```bash
# Development (web UI)
bun run dev

# CLI game
bun run cli

# Audit viewer
bun run audit-viewer

# Build
bun run build

# Lint
bun run lint

# Format
bun run format
```

---

## Important Notes for AI Assistants

### DO:
- ✅ Always use `@/` path aliases for imports
- ✅ Keep game engine (`src/modules/game/`) framework-agnostic
- ✅ Add audit logging for significant events
- ✅ Export types and functions from module `index.ts`
- ✅ Use Biome for formatting (`bun run format`)
- ✅ Follow the force re-render pattern in React hooks
- ✅ Use shadcn/ui components for UI elements
- ✅ Test changes with integration scripts
- ✅ Update documentation when changing APIs
- ✅ Use `RuleSet` builder pattern for rules configuration
- ✅ Check available actions before playing actions

### DON'T:
- ❌ Don't import React in game engine modules
- ❌ Don't modify `src/components/ui/` (shadcn managed)
- ❌ Don't commit `node_modules/`, `.next/`, `audit-logs/`
- ❌ Don't skip audit logging for money transactions
- ❌ Don't break the separation between UI and game engine
- ❌ Don't modify archived code (`archive/` folders)
- ❌ Don't change the `Game` state machine without careful consideration
- ❌ Don't forget to update `index.ts` exports when adding features
- ❌ Don't use `npm` or `yarn` (use `bun` instead)
- ❌ Don't create test files with Jest/Vitest (use standalone scripts)

### When Reading Code:
- The game engine is in `src/modules/game/`
- The UI is in `src/components/` and `src/app/`
- The CLI is in `src/cli/`
- Tests are `test-*.ts` files in the same directory as what they test
- Documentation is in `*.md` files at the root
- Types are co-located with implementation (not in separate `types/` folder)

### When Writing Code:
- Start by understanding the module structure
- Read `QUICK-START.md` for API usage examples
- Check existing test files for patterns
- Use the builder pattern for complex configuration
- Always handle edge cases (insufficient funds, invalid actions, etc.)
- Add TypeScript types for everything (strict mode)

### When Debugging:
- Check the audit trail for transaction history
- Look at test files for expected behavior
- Run integration scripts to reproduce issues
- Use `game.getStats()` for current state
- Check `game.getState()` and `round.state` for state machine position

---

## Git and Version Control

### Branch Naming
- Feature branches: `feature/description`
- Bug fixes: `fix/description`
- Claude branches: `claude/claude-md-{id}` (auto-generated)

### Commit Messages
- Use conventional commits style when possible
- Focus on "why" rather than "what"
- Examples:
  - "Add surrender action to game engine"
  - "Fix settlement calculation for split aces"
  - "Update audit trail to log insurance events"

### Gitignore
Key ignored patterns:
- `node_modules/` - Dependencies
- `.next/` - Next.js build output
- `audit-logs/` - Generated audit trails
- `*.tsbuildinfo` - TypeScript build cache
- `.env*` - Environment variables

---

## Technology Stack Summary

| Category | Technology | Version |
|----------|-----------|---------|
| Runtime | Bun | Latest |
| Framework | Next.js | 16.0.3 |
| React | React | 19.2.0 |
| Language | TypeScript | ^5 |
| Styling | Tailwind CSS | ^4 |
| UI Components | shadcn/ui | Latest |
| Icons | lucide-react | ^0.553.0 |
| Linting | Biome | 2.2.0 |
| Forms | react-hook-form | ^7.66.0 |
| Validation | Zod | ^4.1.12 |
| Charts | Recharts | 2.15.4 |
| CLI | @inquirer/prompts | ^7.10.1 |
| CLI Styling | chalk | ^5.6.2 |

---

## Quick Reference

### File Imports
```typescript
// Game engine
import { Game, Round, Hand, ACTION_HIT } from "@/modules/game";
import { COMMON_RULESETS, RuleSet } from "@/modules/game";

// Audit
import { getAuditLogger } from "@/modules/audit";

// Strategy
import { BasicStrategy } from "@/modules/strategy";

// UI components
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { BlackjackTable } from "@/components/blackjack-table";

// Hooks
import { useBlackjackGame } from "@/hooks/use-blackjack-game";

// Utils
import { cn } from "@/lib/utils";
```

### Common Game Operations
```typescript
// Create game
const game = new Game(6, 0.75, 1000000, COMMON_RULESETS.vegasStrip());

// Add player
const player = game.addPlayer("Alice", 1000);

// Start round
const round = game.startRound([{ playerId: player.id, amount: 100 }]);

// Play actions
game.playAction(ACTION_HIT);
game.playAction(ACTION_STAND);

// Complete round
game.completeRound();

// Get state
const state = game.getState();
const stats = game.getStats();
```

### shadcn/ui Components
```bash
# Add new component (if needed)
bunx shadcn@latest add [component-name]

# Example
bunx shadcn@latest add button
bunx shadcn@latest add card
```

---

## Resources

### Internal Documentation
- `QUICK-START.md` - **START HERE** for game engine usage
- `CLI-README.md` - CLI game guide
- `UI-GUIDE.md` - Web UI architecture
- `AUDIT-TRAIL.md` - Audit system documentation

### External Resources
- [Next.js 16 Docs](https://nextjs.org/docs)
- [shadcn/ui Components](https://ui.shadcn.com)
- [Tailwind CSS v4](https://tailwindcss.com)
- [Biome](https://biomejs.dev)
- [Bun](https://bun.sh)

---

## Project Status

**Current State:** Fully functional with web UI, CLI, and audit system

**Completed Features:**
- ✅ Core game engine with all standard actions
- ✅ Web UI with casino-style visuals
- ✅ CLI terminal game
- ✅ Comprehensive audit trail system
- ✅ Multiple rule sets with house edge calculation
- ✅ Basic strategy utilities
- ✅ Card counting framework
- ✅ Insurance betting
- ✅ Split hands
- ✅ Double down
- ✅ Surrender

**Potential Future Enhancements:**
- [ ] Persistent storage (database)
- [ ] User authentication
- [ ] Multiplayer support
- [ ] Advanced statistics dashboard
- [ ] Sound effects and animations
- [ ] Mobile-responsive layout
- [ ] Tutorial mode
- [ ] Achievement system
- [ ] Session replay from audit trails

---

## Contact and Contribution

This is a personal project. When making changes:

1. Follow the existing code style (Biome enforced)
2. Add tests for new features
3. Update documentation
4. Add audit logging where appropriate
5. Keep game engine framework-agnostic
6. Test both web UI and CLI

---

**Last Updated:** 2025-11-17
**Repository:** blackjack
**Primary Branch:** `main` (or as configured in git)

---

*This document is intended for AI assistants (like Claude) to understand the codebase structure and conventions. It should be updated whenever significant architectural changes are made.*
