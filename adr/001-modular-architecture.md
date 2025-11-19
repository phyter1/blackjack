# ADR-001: Modular Architecture Pattern

## Status

Accepted

## Context

The blackjack game codebase initially had several monolithic files that were becoming difficult to maintain and test:

- `rules.ts` was 700+ lines handling all rule-related logic
- `casino-table.tsx` was 500+ lines with mixed concerns
- `user-dashboard.tsx` and `session-replay.tsx` had similar complexity
- State management was intertwined with component logic

## Decision

We will adopt a modular architecture pattern where:

1. Large files are broken into focused, single-responsibility modules
2. Each module exports a clear public API through its `index.ts`
3. Internal implementation details are kept private
4. Related functionality is grouped in directories

## Implementation

### Rules System Modularization

```
rules/
├── types.ts           # Type definitions (228 lines)
├── defaults.ts        # Default configuration (71 lines)
├── builder.ts         # RuleSet builder class (246 lines)
├── house-edge.ts      # House edge calculations (180 lines)
├── action-validator.ts# Action validation logic (238 lines)
├── presets.ts         # Common rule presets (112 lines)
└── index.ts           # Public API exports (89 lines)
```

### Component Modularization

```
CasinoTable/
├── hooks/             # Custom React hooks
├── handlers/          # Event handlers
├── components/        # Sub-components
└── index.tsx          # Main component

UserDashboard/
├── panels/            # Individual dashboard panels
├── types.ts           # Type definitions
└── index.tsx          # Main component

SessionReplay/
├── components/        # Replay sub-components
├── hooks/             # Replay-specific hooks
└── index.tsx          # Main component
```

## Consequences

### Positive

- **Improved maintainability**: Each module has a single, clear responsibility
- **Better testability**: Modules can be tested in isolation
- **Reduced cognitive load**: Developers can focus on smaller, focused files
- **Clear boundaries**: Public APIs make it obvious what's available for use
- **Easier collaboration**: Multiple developers can work on different modules
- **Tree-shaking support**: Bundlers can optimize by only including used exports

### Negative

- **More files to navigate**: Project has more files (mitigated by good naming)
- **Import complexity**: More import statements needed (mitigated by barrel exports)
- **Initial learning curve**: New developers need to understand module structure

### Neutral

- **File size**: Individual files are smaller (100-250 lines vs 500-700 lines)
- **Build complexity**: No change - modern bundlers handle this well

## Metrics

- Rules system: From 1 file (700+ lines) to 7 focused modules
- Casino Table: 60% size reduction in main component
- Type safety: Maintained 100% TypeScript coverage
- Bundle size: No increase due to tree-shaking

## References

- [Single Responsibility Principle](https://en.wikipedia.org/wiki/Single-responsibility_principle)
- [Module Pattern](https://www.patterns.dev/posts/module-pattern/)
- [Barrel Exports](https://basarat.gitbook.io/typescript/main-1/barrel)
