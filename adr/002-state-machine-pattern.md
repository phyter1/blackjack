# ADR-002: State Machine Pattern for Game Flow

## Status

Accepted

## Context

The blackjack game has complex state transitions that need to be managed reliably:

- Game states: waiting for bets, in round, round complete
- Round states: insurance, player turn, dealer turn, settling, complete
- Invalid state transitions must be prevented
- State changes need to be auditable

Initially, state management was scattered throughout the codebase with boolean flags and conditional logic.

## Decision

Implement a hierarchical state machine architecture:

1. **BaseStateMachine**: Generic, reusable state machine implementation
2. **GameStateMachine**: Manages high-level game flow
3. **RoundStateMachine**: Manages detailed round progression

## Implementation

### State Machine Hierarchy

```typescript
// Base state machine (generic)
class BaseStateMachine<S extends string, E extends { type: string }>

// Game-specific implementations
class GameStateMachine extends BaseStateMachine<GameState, GameTransitionEvent>
class RoundStateMachine extends BaseStateMachine<RoundState, RoundTransitionEvent>
```

### State Definitions

```typescript
// Game states
type GameState = "waiting_for_bets" | "in_round" | "round_complete";

// Round states
type RoundState = "insurance" | "player_turn" | "dealer_turn" | "settling" | "complete";
```

### Transition Flow

```
Game State Machine:
waiting_for_bets → in_round → round_complete → waiting_for_bets

Round State Machine:
insurance → player_turn → dealer_turn → settling → complete
```

## Consequences

### Positive

- **Predictable state transitions**: Invalid transitions are impossible
- **Type safety**: All states and events are strongly typed
- **Centralized logic**: State management in one place
- **Audit integration**: Automatic logging of state changes
- **Visual debugging**: Can generate state diagrams
- **Easy testing**: State machines can be tested in isolation

### Negative

- **Learning curve**: Developers need to understand state machine concepts
- **Indirection**: State logic separated from business logic
- **Verbosity**: More code for simple state changes

### Neutral

- **Performance**: Minimal overhead (simple object lookups)
- **Memory**: Small memory footprint for state tracking

## Example Usage

```typescript
// Create state machine
const gameStateMachine = createGameStateMachine();

// Check current state
if (gameStateMachine.canStartRound()) {
  gameStateMachine.startRound(bets);
}

// Listen to state changes
gameStateMachine.addListener((prevState, newState) => {
  console.log(`State changed: ${prevState} → ${newState}`);
});
```

## Validation Helpers

```typescript
// Validation functions prevent invalid operations
gameStateValidation.canAddPlayer(state)      // Not during round
gameStateValidation.canStartRound(state)     // Only when waiting
roundStateValidation.canTakeInsurance(state) // Only in insurance phase
```

## Metrics

- **States managed**: 8 total states across 2 machines
- **Type safety**: 100% typed transitions
- **Invalid transitions prevented**: 100% at compile time
- **Audit coverage**: All state changes logged automatically

## Alternatives Considered

1. **Redux/MobX**: Too heavy for this use case
2. **XState**: Powerful but adds external dependency
3. **Boolean flags**: Error-prone and hard to reason about
4. **Custom event emitter**: Less structure, more boilerplate

## References

- [Finite State Machines](https://en.wikipedia.org/wiki/Finite-state_machine)
- [State Pattern](https://refactoring.guru/design-patterns/state)
- [TypeScript Discriminated Unions](https://www.typescriptlang.org/docs/handbook/unions-and-intersections.html)
