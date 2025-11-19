# Architecture Decision Records

This directory contains Architecture Decision Records (ADRs) that document significant architectural decisions made in the blackjack project.

## What is an ADR?

An Architecture Decision Record captures an important architectural decision made along with its context and consequences. ADRs help future developers (including yourself) understand why certain decisions were made.

## ADR Template

Each ADR follows this template:

- **Status**: Accepted/Deprecated/Superseded
- **Context**: What prompted this decision?
- **Decision**: What did we decide to do?
- **Implementation**: How was it implemented?
- **Consequences**: What are the trade-offs?
- **Metrics**: How do we measure success?
- **References**: Related documentation

## Current ADRs

| ADR | Title | Status | Date |
|-----|-------|--------|------|
| [001](001-modular-architecture.md) | Modular Architecture Pattern | Accepted | 2025-11 |
| [002](002-state-machine-pattern.md) | State Machine Pattern for Game Flow | Accepted | 2025-11 |
| [003](003-separation-of-concerns.md) | Separation of Concerns in Component Architecture | Accepted | 2025-11 |

## How to Add a New ADR

1. Create a new file: `XXX-decision-title.md` (increment the number)
2. Use the template structure shown in existing ADRs
3. Update this README with the new entry
4. Link to the ADR from relevant documentation

## Key Architectural Principles

Based on our ADRs, the project follows these principles:

1. **Modularity**: Break large files into focused, single-responsibility modules
2. **State Machines**: Use formal state machines for complex state management
3. **Separation of Concerns**: Keep UI, logic, and data management separate
4. **Type Safety**: Leverage TypeScript for compile-time guarantees
5. **Testability**: Design for easy unit and integration testing
6. **Documentation**: Document decisions for future maintainers

## Related Documentation

- [Project README](../../README.md)
- [Quick Start Guide](../guides/quick-start.md)
- [State Machine Architecture](../architecture/state-machine.md)
- [Modular Rules Architecture](../architecture/modular-rules.md)
- [Claude Assistant Guide](../../CLAUDE.md)
