# CLAUDE.md - AI Assistant Guide

## Project Overview

**Blackjack game platform** with Next.js 16, TypeScript, Bun, shadcn/ui, and Tailwind CSS v4.

Features: Game engine, Web UI, CLI, Audit trail, Strategy utilities, Multiple rule sets.

## Key Architecture

### Core Modules (`src/modules/`)

- **`game/`**: Framework-agnostic engine
  - `rules/`: Modular rules (7 modules)
  - `state-machine/`: Game flow management
  - Main classes: Game, Round, Hand, Bank, Shoe
- **`audit/`**: Event logging (25+ event types)
- **`strategy/`**: Basic strategy, card counting

### UI Components (`src/components/`)

- **Modular structure**: Hooks, handlers, components separated
- **`CasinoTable/`**, **`UserDashboard/`**, **`SessionReplay/`**: All modularized
- Uses shadcn/ui primitives in `ui/`

## Critical Patterns

### State Management

```typescript
// Game states: waiting_for_bets → in_round → round_complete
// Round states: insurance → player_turn → dealer_turn → settling → complete
```

### Money Flow

Bank → Escrow (during play) → Bank/House (settlement)

### Force Re-render Pattern

```typescript
const game = useRef(new Game()).current;
const [, forceUpdate] = useReducer(x => x + 1, 0);
// After action: forceUpdate();
```

## Development

```bash
bun install          # Setup
bun run dev          # Web UI (localhost:3000)
bun run cli          # CLI game
bun run build        # Production
bun run format       # Format with Biome
```

## Code Conventions

- **Imports**: Use `@/` alias for `src/`
- **Exports**: Public API in `index.ts`
- **Types**: Co-located with implementation
- **Tests**: `test-*.ts` scripts (not Jest/Vitest)
- **Formatting**: Biome (2 spaces, kebab-case files)

## Common Tasks

### Using Rules

```typescript
import { COMMON_RULESETS, RuleSet } from "@/modules/game/rules";

// Preset
const vegas = COMMON_RULESETS.vegasStrip();

// Custom
const rules = new RuleSet()
  .setDealerStand("s17")
  .setBlackjackPayout(3, 2)
  .build();
```

### Game Operations

```typescript
const game = new Game(6, 0.75, 1000000);
const player = game.addPlayer("Alice", 1000);
game.startRound([{ playerId: player.id, amount: 100 }]);
game.playAction(ACTION_HIT);
game.completeRound();
```

## Important Rules

### DO ✅

- Keep game engine framework-agnostic
- Add audit logging for money transactions
- Use RuleSet builder pattern
- Export from module `index.ts`
- Test with integration scripts
- Update docs when changing APIs

### DON'T ❌

- Import React in game modules
- Modify `ui/` (shadcn managed)
- Skip audit logging
- Use npm/yarn (use bun)
- Create Jest/Vitest tests

## Documentation

- **[QUICK-START.md](QUICK-START.md)**: Game engine API
- **[STATE-MACHINE-ARCHITECTURE.md](STATE-MACHINE-ARCHITECTURE.md)**: State management
- **[MODULAR-RULES-ARCHITECTURE.md](MODULAR-RULES-ARCHITECTURE.md)**: Rules system
- **[adr/](adr/)**: Architecture decisions
- **[README.md](README.md)**: Project overview

## Recent Changes (Nov 2025)

**Phase 2**: Modularized rules, state machines, and components (50-60% size reduction)
**Phase 3**: Added comprehensive documentation and ADRs

---

*Last Updated: 2025-11-19 | Keep this guide concise for context efficiency*
