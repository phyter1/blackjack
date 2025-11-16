# Blackjack CLI

A command-line interface for playing blackjack in your terminal!

## Features

- 🎴 Beautiful ASCII card displays with colored suits
- 💰 Interactive betting with customizable amounts
- 🎯 Full blackjack gameplay (Hit, Stand, Double Down, Split, Surrender)
- 📊 Real-time balance and round tracking
- 🎨 Colorful terminal UI using chalk
- ⚡ Built with Bun for fast performance

## Installation

The CLI dependencies are already installed if you've set up the project. If not, run:

```bash
bun install
```

## Running the CLI Game

To start the blackjack CLI game:

```bash
bun run cli
```

Or directly:

```bash
bun run src/cli/game.ts
```

## How to Play

### Starting the Game

1. When you start the CLI, you'll be prompted to enter your name
2. Enter your starting bankroll (default: $1000)
3. The game begins!

### Gameplay

1. **Place Your Bet**: Enter the amount you want to bet for the round
2. **View Your Hand**: Cards are displayed with ASCII art showing rank and suit
3. **Make Decisions**: Choose from available actions:
   - **Hit**: Take another card
   - **Stand**: End your turn with current hand
   - **Double Down**: Double your bet and take exactly one more card
   - **Split**: Split pairs into two separate hands
   - **Surrender**: Forfeit half your bet and end the round

4. **Insurance**: If the dealer shows an Ace, you'll be offered insurance
5. **Settlement**: See the results and your updated balance
6. **Continue**: Choose whether to play another round or cash out

### Game Display

The CLI displays:
- **Header**: Current balance, round number, and current bet
- **Dealer's Hand**: Shows one card face-up during play, reveals all at settlement
- **Your Hand(s)**: Shows all your cards with current value
- **Results**: Win/loss/push/blackjack with payout information

## Game Rules

- Dealer stands on 17
- Blackjack pays 3:2
- Insurance pays 2:1
- 6 deck shoe with 75% penetration
- Standard Las Vegas rules

## Example Session

```
════════════════════════════════════════════════════════════
                    🃏 BLACKJACK 🃏
════════════════════════════════════════════════════════════
Balance: $1000.00  |  Round: #1  |  Current Bet: $50.00
════════════════════════════════════════════════════════════

Dealer's Hand:
┌─────┐ ┌─────┐
│░░░░░│ │K    │
│░░░░░│ │  ♠  │
│░░░░░│ │    K│
└─────┘ └─────┘

Your Hand:
┌─────┐ ┌─────┐
│A    │ │9    │
│  ♥  │ │  ♦  │
│    A│ │    9│
└─────┘ └─────┘
Value: 20  State: active
Bet: $50.00

? Choose your action: ›
❯ Stand (end turn)
  Hit (take another card)
  Double Down (double bet, take one card)
```

## Technical Details

### Architecture

The CLI uses:
- **@inquirer/prompts**: For interactive command-line prompts
- **chalk**: For colorful terminal output
- **cli-table3**: For formatted table displays (if needed)
- **Game Engine**: Shares the same core game logic as the web UI

### File Structure

```
src/cli/
├── game.ts     # Main CLI game loop and logic
└── display.ts  # Card and UI display utilities
```

### Key Classes

- **BlackjackCLI**: Main game controller
  - Handles player input
  - Manages game loop
  - Orchestrates display updates

- **Display Utilities**:
  - `displayCard()`: Renders single card in ASCII
  - `displayCards()`: Renders multiple cards side-by-side
  - `displayPlayerHand()`: Shows player hand with value
  - `displayDealerHand()`: Shows dealer hand (can hide hole card)
  - `displayHeader()`: Shows game stats
  - `displaySettlement()`: Shows round results

## Tips for Playing

1. **Basic Strategy**: Stand on 17 or higher, hit on 16 or lower (simplified)
2. **Bankroll Management**: Don't bet more than 5% of your bankroll per hand
3. **Insurance**: Generally not recommended unless you're counting cards
4. **Splitting**: Best to split Aces and 8s, never split 10s or 5s
5. **Doubling Down**: Best on 10 or 11, especially when dealer shows 6 or lower

## Exiting the Game

- Press `Ctrl+C` at any prompt to exit immediately
- Or decline to play another round when prompted

## Troubleshooting

### Colors not showing?
Make sure your terminal supports ANSI colors. Most modern terminals do.

### Prompt not responding?
If the prompt seems frozen, try pressing `Ctrl+C` and restarting.

### Cards not displaying correctly?
Ensure your terminal font supports Unicode characters for card suits (♥♦♣♠).

## Future Enhancements

Potential improvements for the CLI:
- [ ] Card counting practice mode
- [ ] Statistics tracking across sessions
- [ ] Multiple player support
- [ ] Configurable game rules
- [ ] Save/load game state
- [ ] Leaderboard

## Contributing

The CLI shares the game engine with the web UI, so improvements to either benefit both!

---

Enjoy playing! 🎰
