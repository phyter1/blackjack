# State Machine Architecture

## Overview

The blackjack game uses a hierarchical state machine architecture to manage game flow and round progression. This provides clear, predictable state transitions and ensures game rules are consistently enforced.

## Architecture Components

### 1. Base State Machine (`state-machine.ts`)

A generic, reusable state machine implementation that provides:

- Type-safe state transitions
- Transition guards and actions
- State change listeners
- Visual state machine representation

```typescript
class BaseStateMachine<S extends string, E extends { type: string }>
```

Key features:

- **Entry/Exit Actions**: Execute code when entering or leaving states
- **Transition Guards**: Conditional transitions based on event data
- **Event-Driven**: All transitions triggered by typed events
- **Listener Pattern**: Subscribe to state changes

### 2. Game State Machine (`game-state-machine.ts`)

Manages the high-level game flow with three states:

```
┌─────────────────┐      START_ROUND      ┌──────────┐
│ waiting_for_bets│ ───────────────────────> │ in_round │
└─────────────────┘                        └──────────┘
        ▲                                        │
        │                                        │
        │           ┌──────────────────┐        │
        └────────── │ round_complete   │ <──────┘
         COMPLETE_  └──────────────────┘  ROUND_SETTLED
         ROUND
```

**States:**

- `waiting_for_bets`: Ready to accept bets for a new round
- `in_round`: Round is active, players making decisions
- `round_complete`: Round finished, awaiting cleanup

**Transitions:**

- `START_ROUND`: Begin a new round with player bets
- `ROUND_SETTLED`: Mark round as complete after settlement
- `COMPLETE_ROUND`: Clean up and return to waiting state

### 3. Round State Machine (`round-state-machine.ts`)

Manages the detailed flow within a single round:

```
┌───────────┐  RESOLVE_INSURANCE  ┌──────────────┐
│ insurance │ ───────────────────> │ player_turn  │
└───────────┘                      └──────────────┘
      │                                    │
      │                                    │ ALL_PLAYERS_DONE
      │ AUTO_SETTLE                        ▼
      │                            ┌──────────────┐
      │                            │ dealer_turn  │
      │                            └──────────────┘
      │                                    │
      │                                    │ DEALER_DONE
      ▼                                    ▼
┌───────────┐                      ┌──────────────┐
│ settling  │ <──────────────────── │              │
└───────────┘      AUTO_SETTLE     └──────────────┘
```

**States:**

- `insurance`: Insurance offers (optional, if dealer shows Ace)
- `player_turn`: Players making hit/stand decisions
- `dealer_turn`: Dealer playing their hand
- `settling`: Calculating payouts
- `complete`: Round fully complete

**Transitions:**

- `RESOLVE_INSURANCE`: Continue after insurance decisions
- `PLAYER_ACTION`: Process player hit/stand/double/split
- `ALL_PLAYERS_DONE`: Move to dealer turn
- `DEALER_DONE`: Move to settlement
- `AUTO_SETTLE`: Skip to settlement (all bust/blackjack)

## Integration with Game Logic

### State Validation

The state machines provide validation helpers to ensure actions are only taken in appropriate states:

```typescript
// Game state validation
gameStateValidation.canAddPlayer(state)      // Not during round
gameStateValidation.canStartRound(state)     // Only when waiting
gameStateValidation.canPlayAction(state)     // Only during round

// Round state validation
roundStateValidation.canTakeInsurance(state) // Only in insurance
roundStateValidation.canPlayAction(state)    // Only in player_turn
roundStateValidation.canDealerPlay(state)    // Only in dealer_turn
```

### Audit Integration

State transitions automatically trigger audit events:

```typescript
// Automatic logging on state change
getAuditLogger().log<GameStateChangeEvent>("game_state_change", {
  fromState: oldState,
  toState: newState,
});
```

## Usage Example

### Game Flow

```typescript
// Game starts in 'waiting_for_bets'
const game = new Game();

// Start a round - transitions to 'in_round'
game.startRound([{ playerId: "p1", amount: 100 }]);

// Players make decisions (round internal state machine)
game.playAction(ACTION_HIT);
game.playAction(ACTION_STAND);

// Round completes - transitions to 'round_complete'
// (automatic when all hands settled)

// Clean up - transitions back to 'waiting_for_bets'
game.completeRound();
```

### Direct State Machine Usage

```typescript
// Create state machine
const stateMachine = createGameStateMachine();

// Check current state
console.log(stateMachine.currentState); // "waiting_for_bets"

// Check if transition is valid
if (stateMachine.canStartRound()) {
  stateMachine.startRound(bets);
}

// Listen to state changes
stateMachine.addListener((prev, next) => {
  console.log(`State changed: ${prev} -> ${next}`);
});
```

## Benefits

1. **Predictable Flow**: No ambiguous states or invalid transitions
2. **Type Safety**: All states and events are strongly typed
3. **Maintainability**: State logic centralized and reusable
4. **Debugging**: Visual state representation and transition logs
5. **Testing**: Easy to test state transitions in isolation
6. **Extensibility**: New states/transitions can be added easily

## Type Definitions

### Core Types

```typescript
// Game states
type GameState = "waiting_for_bets" | "in_round" | "round_complete";

// Round states
type RoundState =
  | "insurance"
  | "player_turn"
  | "dealer_turn"
  | "settling"
  | "complete";

// Transition events
type GameTransitionEvent =
  | { type: "START_ROUND"; bets: PlayerBet[] }
  | { type: "ROUND_SETTLED"; results: SettlementResult[] }
  | { type: "COMPLETE_ROUND" };

type RoundTransitionEvent =
  | { type: "RESOLVE_INSURANCE"; dealerBlackjack: boolean }
  | { type: "PLAYER_ACTION"; action: ActionType }
  | { type: "ALL_PLAYERS_DONE" }
  | { type: "DEALER_DONE" }
  | { type: "AUTO_SETTLE" };
```

### Configuration Interface

```typescript
interface StateMachineConfig<S extends string, E> {
  initialState: S;
  states: {
    [K in S]: {
      on?: {
        [EventType in E extends { type: string } ? E["type"] : never]?: S;
      };
      entry?: () => void;
      exit?: () => void;
    };
  };
}
```

## Testing

State machines can be tested independently:

```typescript
describe("GameStateMachine", () => {
  it("should transition from waiting to in_round", () => {
    const sm = createGameStateMachine();
    expect(sm.currentState).toBe("waiting_for_bets");

    sm.startRound(bets);
    expect(sm.currentState).toBe("in_round");
  });

  it("should prevent invalid transitions", () => {
    const sm = createGameStateMachine();
    sm.startRound(bets);

    expect(() => sm.startRound(bets)).toThrow();
  });
});
```

## Future Enhancements

1. **Persisted State**: Save/restore state machine state
2. **History**: Track state history for replay
3. **Parallel States**: Support concurrent state machines
4. **Hierarchical States**: Nested state machines
5. **Time-based Transitions**: Auto-transitions after timeout

## Related Documentation

- [Game Architecture](QUICK-START.md)
- [Casino Table Architecture](CASINO-TABLE-ARCHITECTURE.md)
- [Audit Trail System](AUDIT-TRAIL.md)
