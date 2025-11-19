# Blackjack Game Platform

A comprehensive blackjack game simulation and training platform built with modern web technologies. Features a fully-functional game engine, beautiful casino-style UI, terminal CLI, and extensive audit trail system.

## Features

### Core Gameplay
- ✅ Complete blackjack game engine with all standard actions
- ✅ Multiple rule sets (Vegas Strip, Atlantic City, European, etc.)
- ✅ Insurance betting
- ✅ Split hands (including re-split)
- ✅ Double down (with DAS - Double After Split)
- ✅ Surrender (early and late)
- ✅ Realistic card shuffling algorithms
- ✅ Multi-deck shoes with configurable penetration

### User Interfaces
- 🎨 **Web UI**: Beautiful casino-style interface with animations
- 💻 **CLI**: Terminal-based game for command-line enthusiasts
- 📊 **Dashboard**: Player statistics and session history
- 🔄 **Session Replay**: Replay past games from audit trails

### Advanced Features
- 📝 Comprehensive audit trail system (25+ event types)
- 🧮 House edge calculator for any rule combination
- 📈 Basic strategy engine
- 🎯 Card counting framework (Hi-Lo system)
- 💰 Realistic bankroll management
- ⚙️ Customizable game settings

## Tech Stack

| Technology | Version | Purpose |
|------------|---------|---------|
| **Bun** | Latest | Runtime and package manager |
| **Next.js** | 16.0.3 | React framework with App Router |
| **React** | 19.2.0 | UI library |
| **TypeScript** | ^5 | Type safety |
| **Tailwind CSS** | ^4 | Styling |
| **shadcn/ui** | Latest | Component library |
| **Biome** | 2.2.0 | Linting and formatting |

## Quick Start

### Prerequisites
- [Bun](https://bun.sh) installed on your system
- Node.js 18+ (for compatibility)

### Installation

```bash
# Clone the repository
git clone [repository-url]
cd blackjack

# Install dependencies
bun install
```

### Running the Application

```bash
# Web UI (development)
bun run dev
# Visit http://localhost:3000

# Web UI (production)
bun run build
bun run start

# CLI Game
bun run cli

# Audit Trail Viewer
bun run audit-viewer
```

### Development Commands

```bash
# Linting
bun run lint

# Formatting
bun run format

# Type checking
bun run type-check
```

## Architecture

The project follows a modular architecture with clear separation of concerns:

### Core Modules (`src/modules/`)

#### Game Engine (`/game`)
- **Framework-agnostic**: Can be used in any JavaScript environment
- **State machines**: Formal state management for game flow
- **Modular rules system**: 7 focused modules for rule management
- **Complete type safety**: 100% TypeScript coverage

#### Audit System (`/audit`)
- **Automatic logging**: All significant events tracked
- **Strongly-typed events**: 25+ event types
- **Export capabilities**: JSON/CSV export for analysis

#### Strategy Engine (`/strategy`)
- **Basic strategy**: Optimal play recommendations
- **Card counting**: Hi-Lo system implementation
- **EV calculations**: Expected value analysis

### UI Components (`src/components/`)

Following separation of concerns:
- **Components**: Pure presentation
- **Hooks**: State management
- **Handlers**: Business logic
- **Utils**: Data transformation

### Architecture Decisions

See [`docs/adr/`](docs/adr/) directory for detailed Architecture Decision Records:
- [ADR-001](docs/adr/001-modular-architecture.md): Modular Architecture Pattern
- [ADR-002](docs/adr/002-state-machine-pattern.md): State Machine Pattern
- [ADR-003](docs/adr/003-separation-of-concerns.md): Separation of Concerns

## Project Structure

```
blackjack/
├── src/
│   ├── app/                    # Next.js App Router
│   ├── modules/                # Core game logic
│   │   ├── game/              # Game engine
│   │   │   ├── rules/         # Modular rules system
│   │   │   ├── state-machine/ # State management
│   │   │   └── ...           # Other game modules
│   │   ├── audit/             # Audit trail system
│   │   └── strategy/          # Strategy utilities
│   ├── components/            # React components
│   │   ├── ui/               # shadcn/ui primitives
│   │   ├── CasinoTable/      # Main game component
│   │   ├── UserDashboard/    # Dashboard panels
│   │   └── SessionReplay/    # Replay components
│   ├── hooks/                # Custom React hooks
│   ├── cli/                  # Terminal interface
│   └── lib/                  # Utilities
├── docs/                     # Documentation
│   ├── guides/              # User guides
│   ├── architecture/        # Architecture docs
│   ├── adr/                # Architecture Decision Records
│   ├── development/        # Development history
│   └── testing/            # Testing guides
├── public/                   # Static assets
└── [config files]           # Configuration
```

## Documentation

**📖 [Complete Documentation Index](docs/README.md)**

### Quick Links
- 📚 [Quick Start Guide](docs/guides/quick-start.md) - Game engine API usage
- 🎮 [CLI Guide](docs/guides/cli-guide.md) - Terminal game documentation
- 🖼️ [UI Guide](docs/guides/ui-guide.md) - Web interface architecture
- 📊 [Audit Trail](docs/architecture/audit-trail.md) - Event logging system
- 🏗️ [State Machines](docs/architecture/state-machine.md) - State management
- 📦 [Modular Rules](docs/architecture/modular-rules.md) - Rules system
- 🤖 [AI Assistant Guide](CLAUDE.md) - For AI pair programming

## Game Rules Configuration

### Using Presets

```typescript
import { COMMON_RULESETS } from "@/modules/game/rules";

// Vegas Strip (0.29% house edge)
const vegas = COMMON_RULESETS.vegasStrip();

// Atlantic City (0.36% house edge)
const atlantic = COMMON_RULESETS.atlanticCity();

// Single Deck (0.17% house edge)
const singleDeck = COMMON_RULESETS.singleDeck();
```

### Custom Rules

```typescript
import { RuleSet } from "@/modules/game/rules";

const customRules = new RuleSet()
  .setDealerStand("s17")        // Dealer stands on soft 17
  .setBlackjackPayout(3, 2)     // 3:2 blackjack payout
  .setDoubleAfterSplit(true)    // Allow DAS
  .setSurrender("late")         // Late surrender
  .setDeckCount(6)              // 6-deck shoe
  .build();

console.log(customRules.houseEdge); // Calculated house edge
```

## Contributing

### Code Style
- Follow Biome configuration (auto-formatted)
- Use TypeScript strict mode
- Write JSDoc for exported functions
- Keep modules focused (single responsibility)

### Testing
Run integration tests:
```bash
bun run src/modules/game/test-complete-round.ts
bun run src/modules/game/test-settlement.ts
bun run src/modules/game/test-insurance.ts
```

### Git Workflow
- Branch naming: `feature/description` or `fix/description`
- Conventional commits preferred
- Update documentation for API changes

## Recent Updates (Phase 3 - Documentation)

### Completed
- ✅ Updated CLAUDE.md with modular architecture
- ✅ Created comprehensive architecture documentation
- ✅ Added JSDoc comments to key functions
- ✅ Created Architecture Decision Records
- ✅ Updated this README

### Previous Updates (Phase 2 - Modularization)
- ✅ Modularized rules system (7 focused modules)
- ✅ Extracted state machines to dedicated module
- ✅ Refactored CasinoTable component (60% size reduction)
- ✅ Split UserDashboard into panel components
- ✅ Modularized SessionReplay components

## Performance

- **Bundle size**: Optimized with tree-shaking
- **Code splitting**: Automatic with Next.js
- **Type checking**: ~3 seconds for full codebase
- **Build time**: ~15 seconds production build
- **Runtime**: 60fps animations, instant responses

## License

[License Type] - See LICENSE file for details

## Support

For questions or issues:
- Check the documentation links above
- Review Architecture Decision Records
- Consult CLAUDE.md for AI assistance

---

Built with ❤️ using modern web technologies