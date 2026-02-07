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
- **Responsive**: Mobile-first with `md:` and `lg:` prefixes

## Responsive Design Patterns

### Breakpoint Strategy (Mobile-First)

Use Tailwind's mobile-first approach with responsive prefixes:

```tsx
// Base styles target mobile (320px-640px)
// md: targets tablet and up (641px+)
// lg: targets desktop and up (1025px+)

className={cn(
  // Mobile base styles (no prefix)
  "p-4 text-sm w-full",
  // Tablet and up
  "md:p-6 md:text-base md:w-auto",
  // Desktop and up
  "lg:p-8 lg:text-lg"
)}
```

**Breakpoints:**
- **Mobile**: 320px - 640px (base styles, no prefix)
- **Tablet**: 641px - 1024px (`md:` prefix)
- **Desktop**: 1025px+ (`lg:` prefix)

### Mobile Drawer Pattern

For sidebars/modals, use bottom drawer on mobile and preserve desktop layout:

```tsx
className={cn(
  // Mobile: Bottom drawer
  "fixed inset-x-0 bottom-0",
  "md:right-0 md:left-auto md:top-0 md:bottom-auto",
  // Heights
  "h-[70vh] md:h-full",
  // Widths
  "w-full md:w-96",
  // Borders
  "border-t md:border-t-0 md:border-l",
  // Rounded corners (mobile only)
  "rounded-t-2xl md:rounded-none",
  // Smooth animation
  "transition-transform duration-300"
)}
```

**Why**: Fixed sidebars block mobile screens. Drawers provide better UX.

**Examples**:
- `TrainerSidebar`: 384px sidebar → 70vh drawer
- `SessionReplay`: Full-screen → 90vh drawer

### Safe Area Handling (iPhone Notches)

All fixed/sticky elements respect iPhone notch and Dynamic Island:

```css
/* In globals.css */
body {
  padding-top: env(safe-area-inset-top);
  padding-bottom: env(safe-area-inset-bottom);
  padding-left: env(safe-area-inset-left);
  padding-right: env(safe-area-inset-right);
}
```

**Prevents**: Content overlap on iPhone 12, 13, 14, 15 Pro models.

### Touch Target Guidelines (WCAG 2.1 AA)

All interactive elements must meet 44px × 44px minimum on mobile:

```tsx
// Minimum viable touch target
className="min-w-[44px] min-h-[44px]"

// Spacing between targets (minimum 8px)
className="gap-2" // 8px gap
```

**Current compliance:**
- ✅ DenomChip: 60px mobile, 80px desktop
- ✅ ActionChip: 45px mobile, 70px desktop
- ✅ Betting circles: 64px mobile, 80px desktop
- ✅ Chip spacing: 8px (gap-2)
- ✅ Circle spacing: 16px (gap-4)

**Reference**: See `.domain/touch-target-audit.md` for full compliance report.

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

All documentation is centralized in `docs/`:

- **[docs/guides/quick-start.md](docs/guides/quick-start.md)**: Game engine API
- **[docs/architecture/state-machine.md](docs/architecture/state-machine.md)**: State management
- **[docs/architecture/modular-rules.md](docs/architecture/modular-rules.md)**: Rules system
- **[docs/adr/](docs/adr/)**: Architecture decisions
- **[docs/README.md](docs/README.md)**: Documentation index
- **[README.md](README.md)**: Project overview

## Recent Changes

**Nov 2025**:
- Phase 2: Modularized rules, state machines, components (50-60% size reduction)
- Phase 3: Added comprehensive documentation and ADRs
- Phase 4: Centralized documentation in `docs/` directory

**Feb 2026**:
- Phase 2: Mobile-first responsive design
  - Bottom drawer patterns for mobile (trainer sidebar, session replay)
  - Safe-area CSS for iPhone notches/Dynamic Island
  - WCAG 2.1 AA touch target compliance verified
  - Responsive breakpoint strategy standardized

---

*Last Updated: 2026-02-07 | Keep this guide concise for context efficiency*
