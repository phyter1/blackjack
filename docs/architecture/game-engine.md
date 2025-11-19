# Blackjack Game Engine

A comprehensive, fully-functional blackjack game engine built in TypeScript with complete rule customization, multi-player support, and accurate casino-style gameplay.

## ✨ Features

- **Complete Game Flow**: Betting → Dealing → Player Actions → Dealer Play → Settlement
- **Multi-Player Support**: Handle multiple players in a single game
- **Configurable Rules**: Vegas Strip, Atlantic City, Single Deck, and custom rule sets
- **Advanced Actions**: Hit, Stand, Double Down, Split (including resplitting)
- **Accurate Payouts**: 3:2 blackjack, 1:1 wins, proper push handling
- **Money Management**: Full bank/escrow system with transaction tracking
- **Shoe Management**: Multi-deck shoes with configurable penetration
- **House Edge Calculator**: Accurate house edge based on rule variations
- **State Machine**: Proper game state management and validation

## 🚀 Quick Start

```typescript
import { Game } from "./game";
import { COMMON_RULESETS } from "./rules";
import { ACTION_HIT, ACTION_STAND } from "./action";

// Create a game with Vegas Strip rules
const game = new Game(
  6, // 6 decks
  0.75, // 75% penetration
  1000000, // House bankroll
  COMMON_RULESETS.vegasStrip()
);

// Add players
const player1 = game.addPlayer("Alice", 1000);
const player2 = game.addPlayer("Bob", 1500);

// Start a round with bets
const round = game.startRound([
  { playerId: player1.id, amount: 100 },
  { playerId: player2.id, amount: 50 }
]);

// Play the round
while (round.state === "player_turn") {
  const hand = round.currentHand;
  const actions = game.getAvailableActions();

  // Simple strategy: stand on 17+, hit otherwise
  if (hand.handValue >= 17) {
    game.playAction(ACTION_STAND);
  } else {
    game.playAction(ACTION_HIT);
  }
}

// Round settles automatically after dealer plays
// Complete the round
game.completeRound();

// Check results
const stats = game.getStats();
console.log(`House profit: $${stats.houseProfit}`);
console.log(`Player 1 balance: $${player1.bank.balance}`);
```

## 📚 Core Classes

### Game
Main orchestrator class for managing the entire game.

```typescript
const game = new Game(numDecks, penetration, houseBankroll, rules);

// Player management
game.addPlayer(name, bankroll);
game.removePlayer(playerId);
game.getPlayer(playerId);
game.getAllPlayers();

// Round management
game.startRound(bets);
game.playAction(action);
game.completeRound();

// State and stats
game.getState();
game.getStats();
game.getAvailableActions();
game.getRulesDescription();
game.getHouseEdge();
```

### Round
Manages a single round of blackjack from deal to settlement.

```typescript
const round = game.startRound(bets);

// Properties
round.playerHands;      // Array of Hand objects
round.dealerHand;       // DealerHand object
round.state;            // "player_turn" | "dealer_turn" | "settling" | "complete"
round.currentHandIndex; // Index of hand currently being played

// Methods
round.playAction(action);
round.getAvailableActions();
round.settle(house);
```

### Hand
Represents a player's hand with betting and action logic.

```typescript
const hand = round.currentHand;

// Properties
hand.cards;            // Array of cards
hand.handValue;        // Computed hand value (handles aces)
hand.state;            // "active" | "busted" | "stood" | "blackjack"
hand.betAmount;        // Current bet amount
hand.isSplit;          // Whether this is a split hand
hand.availableActions; // Actions available for this hand

// Methods
hand.start(cards);
hand.hit(card);
hand.stand();
hand.double(card);
hand.split(card1, card2);
```

### DealerHand
Manages the dealer's hand with auto-play logic.

```typescript
const dealerHand = round.dealerHand;

// Properties
dealerHand.cards;      // Array of cards
dealerHand.handValue;  // Computed hand value
dealerHand.upCard;     // First card (visible to players)
dealerHand.state;      // "active" | "busted" | "stood" | "blackjack"

// Methods
dealerHand.hit(card);
```

### RuleSet
Configure game rules with a fluent builder API.

```typescript
import { RuleSet, COMMON_RULESETS } from "./rules";

// Use preset rules
const rules = COMMON_RULESETS.vegasStrip();
const rules = COMMON_RULESETS.atlanticCity();
const rules = COMMON_RULESETS.singleDeck();

// Or build custom rules
const rules = new RuleSet()
  .setDealerStand("s17")
  .setDeckCount(6)
  .setBlackjackPayout(3, 2)
  .setSurrender("late")
  .setDoubleAfterSplit(true)
  .setDoubleRestriction("any");

// Get house edge
const edge = rules.build().houseEdge;
console.log(`House edge: ${edge.toFixed(2)}%`);
```

## 🎲 Available Actions

```typescript
import {
  ACTION_HIT,
  ACTION_STAND,
  ACTION_DOUBLE,
  ACTION_SPLIT,
  ACTION_SURRENDER
} from "./action";
```

### Hit
Take another card. Available on any active hand under 21.

### Stand
End your turn with current hand value.

### Double Down
Double your bet and receive exactly one more card. Subject to rule restrictions:
- May be restricted to certain hand values (9-11, 10-11, etc.)
- May not be allowed after splitting (depends on DAS rule)

### Split
Split a pair into two separate hands. Each hand gets a new card and is played independently.
- Requires matching card ranks
- Subject to max split limit (typically 3-4 hands)
- Aces may have special restrictions (one card only, no resplit)

### Surrender (Coming Soon)
Forfeit half your bet and end the hand immediately.

## 🏆 Settlement & Payouts

The settlement system handles all payout scenarios:

### Outcomes
- **Blackjack**: Natural 21 with 2 cards (not from split) - Pays 3:2 or 6:5
- **Win**: Hand value higher than dealer (or dealer bust) - Pays 1:1
- **Push**: Same value as dealer - Returns original bet
- **Lose**: Hand value lower than dealer (or player bust) - Loses bet
- **Charlie**: 5+ cards without busting (if rule enabled) - Pays 1:1

### Special Rules
- **Dealer 22 Push**: If enabled, dealer busting with 22 pushes instead of losing
- **Blackjack Tie**: Configurable outcome when both have blackjack (usually push)

## 📊 Statistics & Tracking

```typescript
const stats = game.getStats();

console.log(stats.roundNumber);        // Rounds played
console.log(stats.playerCount);        // Active players
console.log(stats.houseProfit);        // House profit/loss
console.log(stats.houseBankroll);      // House current balance
console.log(stats.shoeRemainingCards); // Cards left in shoe
console.log(stats.shoeComplete);       // Whether shoe needs reshuffle
console.log(stats.state);              // Current game state
```

## 🎯 Example: Complete Game

See `example-game.ts` for a full example that plays 3 rounds with 3 players.

```bash
bun run src/modules/game/example-game.ts
```

## 🧪 Testing

Run the test files to see the game in action:

```bash
# Test settlement logic
bun run src/modules/game/test-settlement.ts

# Test complete round flow
bun run src/modules/game/test-complete-round.ts

# Complete game example
bun run src/modules/game/example-game.ts
```

## 🏗️ Architecture

```
Game (Orchestrator)
├── PlayerManager
│   └── Players (with Banks)
├── RuleSet (Configuration)
├── House (Casino bankroll)
└── Shoe (Multi-deck shoe)
    └── Rounds
        ├── Player Hands
        │   ├── Cards
        │   ├── Bet (Escrow)
        │   └── Actions
        └── Dealer Hand
            └── Cards
```

## 📦 Module Structure

```
src/modules/game/
├── game.ts           - Main Game orchestrator
├── round.ts          - Round management
├── hand.ts           - Player hand logic
├── dealer-hand.ts    - Dealer hand logic
├── player.ts         - Player management
├── settlement.ts     - Payout calculations
├── rules.ts          - Rule configuration
├── shoe.ts           - Shoe/deck management
├── shuffle.ts        - Realistic shuffling
├── bank.ts           - Money management
├── action.ts         - Action types
├── cards.ts          - Card definitions
├── random.ts         - Random utilities
└── archive/          - Old implementations
```

## 🔮 Future Enhancements

- [ ] Insurance betting
- [ ] Surrender implementation
- [ ] Side bets (21+3, Perfect Pairs)
- [ ] Basic strategy calculator
- [ ] Card counting simulation
- [ ] Event system for UI integration
- [ ] Comprehensive test suite
- [ ] Hand history export
- [ ] Statistics dashboard

## 📝 Rule Variations Supported

### Dealer Rules
- **S17**: Dealer stands on soft 17 (better for player)
- **H17**: Dealer hits on soft 17 (worse for player)
- **Peek**: Dealer peeks for blackjack with Ace/10 up

### Player Options
- **DAS**: Double after split allowed
- **RSA**: Resplit aces allowed
- **HSA**: Hit split aces allowed
- **Surrender**: Late or early surrender
- **Double Restrictions**: Any two cards, 9-11, 10-11, or 11 only

### Payouts
- **Blackjack**: 3:2 (standard), 6:5 (bad), or 1:1 (terrible)
- **Charlie Rule**: 5/6/7 card charlie wins automatically
- **Dealer 22**: Dealer 22 pushes instead of losing

### Deck Configuration
- **Deck Count**: 1, 2, 4, 6, or 8 decks
- **Penetration**: How deep into shoe before reshuffle (50%-90%)

## 💰 House Edge

The RuleSet automatically calculates house edge based on configured rules:

```typescript
const rules = COMMON_RULESETS.vegasStrip();
const edge = rules.build().houseEdge;
// Returns: 0.29% (very player-friendly)

const badRules = new RuleSet()
  .setDealerStand("h17")
  .setBlackjackPayout(6, 5);
const badEdge = badRules.build().houseEdge;
// Returns: ~2.5% (avoid these tables!)
```

## 🤝 Contributing

The codebase is modular and well-documented. Key principles:

1. **Immutability**: Avoid mutating external state
2. **Type Safety**: Use TypeScript types everywhere
3. **Validation**: Validate all inputs and state transitions
4. **Money Safety**: All money transactions are tracked and validated
5. **Rule Accuracy**: Match real casino rules exactly

## 📄 License

See project root for license information.
