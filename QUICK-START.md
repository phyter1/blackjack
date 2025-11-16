# Blackjack Game - Quick Start Guide

## Installation

```bash
# The game is already part of your Next.js project
# Just import and use!
```

## Simplest Possible Game

```typescript
import { Game, COMMON_RULESETS, ACTION_STAND } from "@/modules/game";

// Create game
const game = new Game(6, 0.75, 1000000, COMMON_RULESETS.vegasStrip());

// Add player
const player = game.addPlayer("You", 1000);

// Play a round
const round = game.startRound([{ playerId: player.id, amount: 100 }]);

// Stand on whatever you got
game.playAction(ACTION_STAND);

// Complete
game.completeRound();

// Check result
console.log(`Balance: $${player.bank.balance}`);
```

## Complete Game Loop

```typescript
import {
  Game,
  COMMON_RULESETS,
  ACTION_HIT,
  ACTION_STAND
} from "@/modules/game";

const game = new Game(6, 0.75, 1000000, COMMON_RULESETS.vegasStrip());
const player = game.addPlayer("Alice", 1000);

// Play 10 rounds
for (let i = 0; i < 10; i++) {
  const round = game.startRound([
    { playerId: player.id, amount: 10 }
  ]);

  // Simple strategy: stand on 17+, hit otherwise
  while (round.state === "player_turn") {
    const hand = round.currentHand;

    if (hand.handValue >= 17) {
      game.playAction(ACTION_STAND);
    } else {
      game.playAction(ACTION_HIT);
    }
  }

  game.completeRound();
}

console.log(`Final balance: $${player.bank.balance}`);
```

## Multi-Player Game

```typescript
const game = new Game();

const alice = game.addPlayer("Alice", 1000);
const bob = game.addPlayer("Bob", 1500);
const charlie = game.addPlayer("Charlie", 500);

const round = game.startRound([
  { playerId: alice.id, amount: 100 },
  { playerId: bob.id, amount: 50 },
  { playerId: charlie.id, amount: 25 }
]);

// Players take turns automatically based on round.currentHandIndex
while (round.state === "player_turn") {
  const actions = game.getAvailableActions();
  // Make decision...
  game.playAction(ACTION_STAND);
}

game.completeRound();
```

## Custom Rules

```typescript
import { RuleSet } from "@/modules/game";

// Build custom rules
const rules = new RuleSet()
  .setDealerStand("h17")           // Dealer hits soft 17
  .setDeckCount(8)                  // 8 decks
  .setBlackjackPayout(6, 5)        // 6:5 blackjack (bad!)
  .setSurrender("late")             // Late surrender allowed
  .setDoubleAfterSplit(false)       // No DAS
  .setDoubleRestriction("10-11");   // Can only double on 10 or 11

const game = new Game(8, 0.75, 1000000, rules);

// Check house edge
console.log(`House edge: ${rules.build().houseEdge.toFixed(2)}%`);
```

## Available Rule Presets

```typescript
import { COMMON_RULESETS } from "@/modules/game";

COMMON_RULESETS.vegasStrip()      // S17, 4 deck, DAS, LS (0.29% edge)
COMMON_RULESETS.atlanticCity()    // S17, 8 deck, DAS, LS (0.36% edge)
COMMON_RULESETS.downtown()        // H17, 2 deck (0.39% edge)
COMMON_RULESETS.singleDeck()      // H17, 1 deck, restricted (0.17% edge)
COMMON_RULESETS.liberal()         // S17, 4 deck, DAS, LS, RSA (0.19% edge)
COMMON_RULESETS.terrible65()      // H17, 8 deck, 6:5 BJ (2.01% edge - avoid!)
```

## Available Actions

```typescript
import {
  ACTION_HIT,
  ACTION_STAND,
  ACTION_DOUBLE,
  ACTION_SPLIT,
  ACTION_SURRENDER  // Not yet implemented
} from "@/modules/game";

// Get available actions for current hand
const actions = game.getAvailableActions();
// Returns: ["hit", "stand", "double", "split"]

// Play an action
game.playAction(ACTION_HIT);
```

## Accessing Game State

```typescript
const round = game.getCurrentRound();

// Current hand being played
const hand = round.currentHand;
console.log(`Hand value: ${hand.handValue}`);
console.log(`Cards: ${hand.cards.map(c => c.rank).join(", ")}`);
console.log(`Bet: $${hand.betAmount}`);

// Dealer's visible card
console.log(`Dealer shows: ${round.dealerHand.upCard.rank}`);

// Game statistics
const stats = game.getStats();
console.log(stats.roundNumber);        // Rounds played
console.log(stats.houseProfit);        // House profit/loss
console.log(stats.shoeRemainingCards); // Cards left
```

## React Integration Example

```typescript
import { useState, useEffect } from "react";
import { Game, COMMON_RULESETS } from "@/modules/game";

function BlackjackGame() {
  const [game] = useState(() =>
    new Game(6, 0.75, 1000000, COMMON_RULESETS.vegasStrip())
  );
  const [player, setPlayer] = useState(() =>
    game.addPlayer("Player", 1000)
  );
  const [round, setRound] = useState(null);

  const startRound = () => {
    const newRound = game.startRound([
      { playerId: player.id, amount: 100 }
    ]);
    setRound(newRound);
  };

  const hit = () => {
    game.playAction(ACTION_HIT);
    setRound({ ...round }); // Force re-render
  };

  const stand = () => {
    game.playAction(ACTION_STAND);
    game.completeRound();
    setRound(null);
  };

  return (
    <div>
      <div>Balance: ${player.bank.balance}</div>

      {!round && <button onClick={startRound}>Start Round</button>}

      {round && (
        <div>
          <div>Your hand: {round.currentHand.handValue}</div>
          <div>Dealer shows: {round.dealerHand.upCard.rank}</div>
          <button onClick={hit}>Hit</button>
          <button onClick={stand}>Stand</button>
        </div>
      )}
    </div>
  );
}
```

## Common Patterns

### Check if Player Busted

```typescript
if (hand.state === "busted") {
  console.log("You busted!");
}
```

### Check for Blackjack

```typescript
if (hand.state === "blackjack") {
  console.log("Blackjack!");
}
```

### Get Settlement Results

```typescript
game.completeRound();

if (round.settlementResults) {
  round.settlementResults.forEach((result, idx) => {
    console.log(`Outcome: ${result.outcome}`);
    console.log(`Profit: $${result.profit}`);
  });
}
```

### Handle Splits

```typescript
// After a split, round.playerHands grows
const round = game.startRound([{ playerId: player.id, amount: 100 }]);

// If player splits, you'll have multiple hands
game.playAction(ACTION_SPLIT);

console.log(`Hand count: ${round.playerHands.length}`); // Now 2

// Game automatically moves through each hand
// round.currentHandIndex tells you which hand is active
```

### Play Until Shoe Needs Reshuffle

```typescript
while (!shoe.isComplete) {
  // Play round...
}
// Shoe automatically replaced on next round
```

## Error Handling

```typescript
try {
  const round = game.startRound([
    { playerId: player.id, amount: 10000 } // Too much!
  ]);
} catch (error) {
  console.error(error.message);
  // "Player Player has insufficient funds (has $1000, bet $10000)"
}
```

## Testing Your Integration

```bash
# Run the example games to see how it works
bun run src/modules/game/example-game.ts
bun run src/modules/game/test-complete-round.ts
bun run src/modules/game/test-settlement.ts
```

## Import Options

```typescript
// Import everything
import * as Blackjack from "@/modules/game";

// Import specific items
import { Game, COMMON_RULESETS, ACTION_HIT } from "@/modules/game";

// Import from specific files (if needed)
import { Game } from "@/modules/game/game";
import { RuleSet } from "@/modules/game/rules";
```

## Tips

1. **Always check available actions** before playing
   ```typescript
   const actions = game.getAvailableActions();
   if (actions.includes(ACTION_DOUBLE)) {
     // Can double
   }
   ```

2. **Use rule presets** for standard games
   ```typescript
   COMMON_RULESETS.vegasStrip() // Good starting point
   ```

3. **Monitor game state** to know when to act
   ```typescript
   if (game.getState() === "waiting_for_bets") {
     // Start new round
   }
   ```

4. **Check house edge** before committing to rules
   ```typescript
   const edge = rules.build().houseEdge;
   if (edge > 1.0) {
     console.warn("High house edge!");
   }
   ```

5. **Use the Round state** to drive UI
   ```typescript
   switch (round.state) {
     case "player_turn": // Show action buttons
     case "dealer_turn": // Show dealer playing
     case "settling": // Show results
     case "complete": // Show final results
   }
   ```

## Next Steps

- See `README.md` for complete API documentation
- See `example-game.ts` for a full working example
- See `TODO2.md` for upcoming features (insurance, surrender, etc.)
- See `SPRINT-SUMMARY.md` for project status

## Need Help?

Check the documentation:
- `README.md` - Complete documentation
- `ARCHITECTURE.md` - System design (TODO)
- `RULES.md` - Blackjack rules (TODO)
- `API.md` - API reference (TODO)

Or run the examples:
```bash
bun run src/modules/game/example-game.ts
```
