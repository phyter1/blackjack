# Blackjack Audit Trail System

A comprehensive audit logging system for tracking all game events, transactions, and actions.

## Overview

The audit trail system logs every significant event in the blackjack game, including:
- Bank and escrow transactions
- Session start/end
- Player join/leave
- Shoe creation and card dealing
- Round start/complete
- Bet placement
- Insurance offers, taken, declined, and resolved
- Hand creation, dealing, and actions (hit, stand, double, split, surrender)
- Hand settlement
- Game state changes

## Architecture

### Core Components

1. **Audit Logger** (`src/modules/audit/logger.ts`)
   - Centralized event logging
   - Session management
   - Export to JSON/CSV
   - Event filtering and querying
   - Summary generation

2. **Event Types** (`src/modules/audit/types.ts`)
   - 25+ strongly-typed event types
   - Hierarchical event structure
   - Consistent timestamp and session tracking

3. **Integration Points**
   - `Bank` and `Escrow` classes - transaction logging
   - `Hand` class - bet, action, and settlement logging
   - `Game` class - session, player, round, and state logging
   - `Round` class - round lifecycle events

## Event Types

### Bank/Escrow Events
- `bank_credit` - Money added to bank
- `bank_debit` - Money removed from bank
- `escrow_credit` - Money added to escrow
- `escrow_debit` - Money removed from escrow
- `escrow_transfer` - Transfer between escrows

### Session Events
- `session_start` - Game session begins
- `session_end` - Game session ends
- `player_join` - Player joins game
- `player_leave` - Player leaves game

### Shoe Events
- `shoe_created` - New shoe created
- `shoe_shuffled` - Shoe shuffled
- `shoe_depleted` - Shoe needs replacement
- `card_dealt` - Card dealt to player or dealer

### Round Events
- `round_start` - New round begins
- `round_complete` - Round completed
- `bet_placed` - Player places bet
- `insurance_offered` - Insurance offered to player
- `insurance_taken` - Player takes insurance
- `insurance_declined` - Player declines insurance
- `insurance_resolved` - Insurance bets settled

### Hand Events
- `hand_created` - New hand created
- `hand_dealt` - Initial cards dealt to hand
- `hand_action` - Player action (hit, stand, double, split, surrender)
- `hand_split` - Hand split into two
- `hand_settled` - Hand result and payout determined

### Game State
- `game_state_change` - Game state transition

## Usage

### In Game Code

The audit logger is automatically initialized when a `Game` instance is created:

```typescript
const game = new Game(6, 0.75, 1000000);
// Audit logger is now active
```

Events are logged automatically throughout gameplay. No manual logging required!

### Accessing Audit Data

```typescript
// Get session ID
const sessionId = game.getSessionId();

// Export as JSON
const json = game.getAuditTrailJSON();

// Export as CSV
const csv = game.getAuditTrailCSV();

// Get summary
const summary = game.getAuditSummary();
console.log(`Total events: ${summary.totalEvents}`);
console.log(`Total rounds: ${summary.totalRounds}`);

// End session (logs session_end event)
game.endSession();
```

### CLI Integration

The CLI game automatically saves audit trails when the game ends:

```bash
bun run cli
# Play some rounds...
# When you exit, you'll be prompted to save the audit trail
```

Audit trails are saved to `./audit-logs/audit-{sessionId}-{timestamp}.json`

### Viewing Audit Trails

Use the audit viewer CLI tool:

```bash
bun run audit-viewer
```

Features:
- Load audit trails from JSON files
- View all events
- View summary by event type
- Filter by event type
- Filter by round number
- Export to CSV

## Event Structure

All events share a common base structure:

```typescript
{
  id: string;              // Unique event ID
  timestamp: Date;         // When the event occurred
  type: AuditEventType;    // Event type
  sessionId: string;       // Session ID
  roundNumber?: number;    // Round number (if applicable)
  // ... event-specific fields
}
```

### Example Events

**Bank Debit:**
```json
{
  "id": "event-abc123",
  "timestamp": "2025-11-16T03:00:00.000Z",
  "type": "bank_debit",
  "sessionId": "session-xyz789",
  "roundNumber": 1,
  "bankId": "player-123",
  "amount": 10,
  "reason": "hand-456",
  "balanceBefore": 1000,
  "balanceAfter": 990
}
```

**Hand Action:**
```json
{
  "id": "event-def456",
  "timestamp": "2025-11-16T03:00:05.000Z",
  "type": "hand_action",
  "sessionId": "session-xyz789",
  "roundNumber": 1,
  "handId": "hand-456",
  "playerId": "player-123",
  "action": "hit",
  "handValueBefore": 12,
  "handValueAfter": 19
}
```

**Round Complete:**
```json
{
  "id": "event-ghi789",
  "timestamp": "2025-11-16T03:00:10.000Z",
  "type": "round_complete",
  "sessionId": "session-xyz789",
  "roundNumber": 1,
  "totalPayout": 15,
  "houseProfit": -15
}
```

## Benefits

### 1. Complete Traceability
Every transaction and action is logged with timestamps and context

### 2. Debugging
Replay game sessions to identify bugs or unexpected behavior

### 3. Analytics
Analyze player behavior, win rates, and game statistics

### 4. Compliance
Maintain records for auditing and regulatory requirements

### 5. Testing
Verify game logic by examining the event sequence

### 6. Fairness Verification
Players can request audit trails to verify game fairness

## Performance

The audit logger is designed to be lightweight:
- Events are stored in memory during the session
- Minimal overhead per event (~1ms)
- Export operations are lazy (only when requested)
- No I/O during gameplay (unless file logging enabled)

## Future Enhancements

Potential improvements:
- [ ] Persistent storage (database)
- [ ] Real-time streaming to external systems
- [ ] Advanced analytics dashboard
- [ ] Anomaly detection
- [ ] Event replay for testing
- [ ] Encryption for sensitive data
- [ ] Event batching for performance
- [ ] Compression for large audit trails

## Files

### Core Audit System
- `src/modules/audit/types.ts` - Event type definitions
- `src/modules/audit/logger.ts` - Audit logger implementation
- `src/modules/audit/index.ts` - Module exports

### Integration
- `src/modules/game/bank.ts` - Bank/Escrow logging
- `src/modules/game/hand.ts` - Hand and action logging
- `src/modules/game/game.ts` - Session, player, round logging

### CLI Tools
- `src/cli/game.ts` - CLI game with audit trail saving
- `src/cli/audit-viewer.ts` - Audit trail viewer

### Documentation
- `AUDIT-TRAIL.md` - This file

## Example Session

```bash
# Start the CLI game
$ bun run cli

# Play a few rounds
# ...

# Exit the game
? Play another round? No

👋 Thanks for playing, Ryan!
Final balance: $1025.00

? Would you like to save the audit trail? Yes

✓ Audit trail saved to: ./audit-logs/audit-session-xyz789-2025-11-16T03-00-00-000Z.json

📊 Session Summary:
  Total Events: 156
  Total Rounds: 5
  Duration: 180000ms

# View the audit trail
$ bun run audit-viewer

🔍 BLACKJACK AUDIT TRAIL VIEWER

? What would you like to do?
  ❯ Load Audit Trail from JSON file
    ...

? Enter path to JSON audit file: ./audit-logs/audit-session-xyz789-2025-11-16T03-00-00-000Z.json

✓ Loaded audit trail successfully!

═══════════════════════════════════════════
Session ID: session-xyz789
Total Events: 156
Exported At: 2025-11-16T03:00:00.000Z
═══════════════════════════════════════════

? What would you like to do?
  ❯ View All Events
    View Summary by Type
    Filter by Event Type
    Filter by Round
    Export to CSV
    Back
```

---

**Built with ❤️ for transparency and trust in gaming**
