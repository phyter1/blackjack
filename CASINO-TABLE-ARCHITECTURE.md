# Casino Table Architecture

## Component Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                      CasinoTable (index.tsx)                     │
│                     Main Orchestrator Component                  │
│                          (282 lines)                             │
└───────────┬─────────────────────────────────────┬───────────────┘
            │                                     │
            ├─────────────────┐                   │
            │                 │                   │
            ▼                 ▼                   ▼
  ┌──────────────────┐  ┌──────────────┐  ┌─────────────────┐
  │  Custom Hooks    │  │   Handlers   │  │  UI Components  │
  └──────────────────┘  └──────────────┘  └─────────────────┘
            │                 │                   │
            │                 │                   │
    ┌───────┴───────┐   ┌─────┴─────┐     ┌──────┴──────┐
    │               │   │           │     │             │
    ▼               ▼   ▼           ▼     ▼             ▼
┌─────────┐  ┌──────────┐ ┌────────┐ ┌──────────┐  ┌────────┐
│ Casino  │  │Insurance │ │Betting │ │ Actions  │  │Table   │
│ Game    │  │          │ │        │ │          │  │        │
│ (134)   │  │  (94)    │ │ (144)  │ │  (219)   │  │UI      │
└─────────┘  └──────────┘ └────────┘ └──────────┘  │Comps   │
                                                    └────────┘
┌─────────┐                ┌────────┐
│Counting │                │Settle- │
│         │                │ment    │
│  (27)   │                │ (201)  │
└─────────┘                └────────┘
```

## File Responsibilities

### Main Component
**`index.tsx`** (282 lines)
- Orchestrates all hooks and handlers
- Manages component lifecycle
- Renders phase-based UI
- Coordinates trainer mode
- Integrates settings

### Custom Hooks

**`use-casino-game.tsx`** (134 lines)
- Game initialization and setup
- Player management
- Session tracking
- Round state management
- Decision tracker initialization
- Rule set configuration
- Test mode support

**`use-insurance.tsx`** (94 lines)
- Insurance phase detection
- Pending insurance hands tracking
- Insurance action processing
- Phase transitions after insurance

**`use-counting.tsx`** (27 lines)
- Card counter initialization
- Counting enabled/disabled state
- Show/hide count display

### Handler Functions

**`handlers/betting.ts`** (144 lines)
- Bet placement validation
- Round initialization
- Card dealing tracking
- Trainer mode integration
- Animation timing calculation
- Phase transition to insurance/playing

**`handlers/actions.ts`** (219 lines)
- Player action execution (hit, stand, double, split)
- Basic strategy decision recording
- Trainer mode action evaluation
- Card counting updates
- Round state deep cloning
- Dealer turn processing
- Phase transition to settlement

**`handlers/settlement.ts`** (201 lines)
- Next round progression
- Game end handling
- Hand outcome updates
- Strategy analysis calculation
- Trainer mode balance updates
- User service integration

## Data Flow

### Initialization Flow
```
User starts game
    ↓
useCasinoGame initializes
    ↓
Game, Player, Session created
    ↓
Decision Tracker initialized
    ↓
useCounting creates card counter
    ↓
Trainer mode initialized
    ↓
Phase set to "betting"
```

### Betting Flow
```
Player places bet
    ↓
handleBet (betting.ts)
    ↓
Validate balance (trainer or real)
    ↓
Game.startRound()
    ↓
Track cards in counter
    ↓
Track cards in trainer
    ↓
Phase transition → "dealing"
    ↓
Animation delay
    ↓
Phase transition → "insurance" or "playing"
```

### Action Flow
```
Player selects action
    ↓
handleAction (actions.ts)
    ↓
Record decision in tracker
    ↓
Evaluate with trainer (if active)
    ↓
Game.playAction()
    ↓
Track new cards in counter
    ↓
Deep clone round state
    ↓
Check for more actions
    ↓
If done → Phase transition → "dealer_turn"
    ↓
Track dealer cards
    ↓
Phase transition → "settling"
```

### Settlement Flow
```
Settling phase reached
    ↓
updateSettlementOutcomes effect
    ↓
Update decision tracker outcomes
    ↓
Update trainer mode outcomes
    ↓
Refresh trainer stats
    ↓
Update UI balance
    ↓
Player clicks "Next Round"
    ↓
handleNextRound (settlement.ts)
    ↓
Track wagered amount
    ↓
Game.completeRound()
    ↓
Phase transition → "betting"
```

## State Management

### Component State
- `game`: Game instance
- `player`: Player instance
- `phase`: Current game phase
- `roundsPlayed`: Total rounds counter
- `currentBalance`: UI balance display
- `roundVersion`: Force re-render trigger

### Hook State
- `useCasinoGame`: Core game state
- `useInsurance`: Insurance-specific state
- `useCounting`: Card counting state
- `useTrainerMode`: Trainer mode state (external)
- `useSettings`: Game settings (external)

### Ref State
- `decisionTracker`: Decision tracking instance
- `cardCounter`: Card counting instance
- `originalBalanceRef`: Original player balance

## Phase Architecture

```
┌─────────┐
│ Betting │ ──→ Place bets
└────┬────┘
     │
     ▼
┌─────────┐
│ Dealing │ ──→ Deal cards (animation)
└────┬────┘
     │
     ├──→ Dealer shows Ace?
     │
     ▼         Yes              No
┌──────────┐   ↓                ↓
│Insurance │ ──┘                │
└────┬─────┘                    │
     │                          │
     └──────────────┬───────────┘
                    │
                    ▼
              ┌─────────┐
              │ Playing │ ──→ Player actions
              └────┬────┘
                   │
                   ▼
            ┌────────────┐
            │Dealer Turn │ ──→ Dealer plays
            └─────┬──────┘
                  │
                  ▼
             ┌──────────┐
             │ Settling │ ──→ Calculate results
             └─────┬────┘
                   │
                   └──→ Back to Betting
```

## Integration Points

### External Hooks
- `useTrainerMode()` - Trainer mode functionality
- `useSettings()` - Game settings and animation preferences

### External Services
- `UserService` - User and session management
- `DecisionTracker` - Strategy decision tracking
- `HiLoCounter` - Card counting implementation

### UI Components
- `TableBackground` - Casino table visual
- `TableHeader` - Header with stats and controls
- `DealerArea` - Dealer's cards and hand
- `PlayerArea` - Player's cards and hands
- `BettingPhase` - Betting controls and chip selection
- `InsurancePhase` - Insurance decision UI
- `PlayingPhase` - Action buttons (hit, stand, etc.)
- `SettlingPhase` - Results and next round button
- `TrainerSidebar` - Trainer mode feedback and stats
- `SettingsDialog` - Game settings configuration

## Key Design Decisions

### 1. Hook-Based State Management
Custom hooks encapsulate related state and logic, making the main component cleaner and hooks reusable.

### 2. Handler Function Pattern
Complex logic extracted into pure functions that receive all dependencies as parameters, improving testability.

### 3. Deep Cloning for React Updates
Round state is deeply cloned to ensure React detects changes, necessary due to the game engine's mutable design.

### 4. Phase-Based Architecture
Game flow controlled by phase state machine, making the flow predictable and easy to debug.

### 5. Separation of Business Logic
Game engine (`@/modules/game`) completely separate from UI layer, enabling CLI and web UI to share the same logic.

## Testing Strategy

### Unit Tests (Recommended)
- Test each hook independently with mock dependencies
- Test each handler function with mock game instances
- Test phase transitions and state updates

### Integration Tests
- Test complete betting → playing → settling flow
- Test insurance scenarios
- Test trainer mode integration
- Test card counting accuracy

### E2E Tests
- Test full game sessions through UI
- Test multi-hand scenarios
- Test edge cases (splits, doubles, blackjack)

## Performance Considerations

### Optimization Techniques
1. **Memoization**: Consider `useMemo` for expensive calculations
2. **Callback Stability**: Use `useCallback` for handler wrappers
3. **Component Splitting**: Phase components only render when active
4. **Ref Usage**: Card counter and decision tracker use refs to avoid re-renders

### Potential Improvements
1. Add `React.memo` to phase components
2. Use `useCallback` for handler wrapper functions
3. Implement virtual scrolling for large decision history
4. Optimize deep cloning with selective cloning

## Future Enhancements

### Modularity
- Extract trainer mode logic into dedicated hook
- Create phase manager hook for phase transitions
- Add custom hook for decision tracking

### Testing
- Add comprehensive unit tests for all modules
- Implement integration tests for handler functions
- Add E2E tests for critical user flows

### Documentation
- Add JSDoc comments to all functions
- Document handler function contracts
- Create hook usage examples

### Performance
- Profile and optimize re-render frequency
- Implement React.memo where beneficial
- Consider state management library for complex scenarios
