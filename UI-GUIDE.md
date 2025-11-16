# Blackjack UI Guide

## Overview

A beautiful, fully functional blackjack UI built with Next.js 16, React 19, and shadcn/ui components.

## Live Demo

**Local**: http://localhost:3000

Run `bun run dev` to start the development server.

## Components

### Core UI Components

1. **src/hooks/use-blackjack-game.tsx**
   - React context provider for game state management
   - Wraps the Game class with React hooks
   - Provides actions: startGame, placeBet, playAction, takeInsurance, etc.
   - Force re-render mechanism for state updates

2. **src/components/card.tsx**
   - Visual playing card component
   - Displays suit symbols (♥ ♦ ♣ ♠)
   - Red suits (hearts, diamonds) and black suits (clubs, spades)
   - Hidden card back for dealer's hole card
   - Hover animation (scale on hover)

3. **src/components/hand-display.tsx**
   - Displays a collection of cards
   - Shows hand value with badges
   - Indicates soft hands (e.g., "Soft 17")
   - Shows hand state (Blackjack!, Busted, Surrendered)
   - Displays bet amount
   - Overlapping card layout

4. **src/components/betting-controls.tsx**
   - Chip-based betting interface
   - Chip values: $5, $10, $25, $50, $100, $500
   - Color-coded chips (red, blue, green, orange, black, purple)
   - Manual bet input
   - Clear and Place Bet buttons
   - Balance display

5. **src/components/action-buttons.tsx**
   - Dynamic action buttons based on available actions
   - Hit, Stand, Double Down, Split, Surrender
   - Color-coded by action type
   - Only shows available actions

6. **src/components/insurance-dialog.tsx**
   - Alert dialog for insurance decisions
   - Appears when dealer shows Ace
   - Shows insurance cost (half of main bet)
   - Explains 2:1 payout
   - Take or decline options

7. **src/components/game-stats.tsx**
   - Three-card layout
   - Balance (green text)
   - Round number
   - Current bet amount

8. **src/components/blackjack-table.tsx**
   - Main game orchestrator
   - Green felt table background
   - Dealer hand at top
   - Action area in middle
   - Player hand(s) at bottom
   - Manages game state and user interactions

## Game Flow

### 1. Start Game
- Enter player name
- Start with $1,000 bankroll
- Beautiful welcome card

### 2. Place Bet
- Click chips to add to bet
- Or manually enter amount
- Click "Place Bet" to start round
- Cards are dealt automatically

### 3. Insurance Phase (if dealer shows Ace)
- Dialog appears automatically
- Option to take insurance (costs half of main bet)
- Or decline and continue
- Auto-resolves: if dealer has blackjack, round settles

### 4. Player Turn
- Action buttons appear for current hand
- Available actions based on game rules:
  - **Hit** - Take another card
  - **Stand** - Keep current hand
  - **Double Down** - Double bet, take one card
  - **Split** - Split matching cards into two hands
  - **Surrender** - Forfeit hand, get half bet back
- Hand updates in real-time
- Automatic progression when hand completes

### 5. Dealer Turn
- Dealer's hole card revealed
- Dealer hits to 17 (or soft 17 based on rules)
- Automatic play according to rules

### 6. Settlement
- Hands compared automatically
- Payouts calculated
- Balance updated
- "Next Round" button appears

### 7. Next Round
- Click "Next Round" to reset
- Return to betting phase

## Visual Design

### Color Scheme
- **Background**: Green gradient (green-800 to green-900)
- **Table**: Green-700 felt with amber-900 border
- **Cards**: White with black/red suits
- **Chips**:
  - $5 - Red
  - $10 - Blue
  - $25 - Green
  - $50 - Orange
  - $100 - Black
  - $500 - Purple

### Layout
- Responsive design
- Max width container (7xl)
- Card-based stats at top
- Large felt table in center
- Dealer at top, player at bottom
- Clear visual hierarchy

### Animations
- Card hover effects
- Chip click effects
- Smooth transitions
- Button hover states

## Features Implemented

### Core Gameplay
- ✅ Player setup
- ✅ Betting with chips
- ✅ Card dealing
- ✅ All standard actions (Hit, Stand, Double, Split, Surrender)
- ✅ Insurance betting
- ✅ Dealer blackjack detection
- ✅ Auto-settlement
- ✅ Round completion

### Visual Features
- ✅ Beautiful card design
- ✅ Chip-based betting
- ✅ Hand value display
- ✅ Soft hand indicators
- ✅ State badges (Blackjack!, Busted, etc.)
- ✅ Hidden dealer card
- ✅ Multiple hands (splits)
- ✅ Balance tracking
- ✅ Round counter

### UX Features
- ✅ Modal insurance dialog
- ✅ Dynamic action buttons
- ✅ Clear game state feedback
- ✅ Responsive layout
- ✅ Keyboard support (Enter to submit)
- ✅ Disabled states for invalid actions

## Technical Details

### State Management
- React Context API for global game state
- Force re-render pattern for updates
- No external state management library needed

### Data Flow
1. User action → Hook method
2. Hook calls Game class method
3. Game updates internal state
4. Hook forces re-render
5. Components receive new props
6. UI updates

### Key Patterns
- **Separation of Concerns**: UI components don't know game logic
- **Single Source of Truth**: Game class manages all state
- **Declarative Rendering**: React components based on current state
- **Prop Drilling**: Minimal, via context provider
- **Type Safety**: Full TypeScript throughout

## Development

### Running Locally
```bash
bun run dev
```

### Building for Production
```bash
bun run build
bun run start
```

### Linting
```bash
bun run lint
```

## Future Enhancements

### Potential Additions
- [ ] Sound effects
- [ ] Card dealing animations
- [ ] Chip stacking animations
- [ ] Win/loss streaks
- [ ] Statistics dashboard
- [ ] Hand history
- [ ] Dark mode toggle
- [ ] Multiple players
- [ ] Responsive mobile layout
- [ ] Settings panel for rules
- [ ] Tutorial mode
- [ ] Achievement system

### Performance Optimizations
- [ ] Memoize expensive computations
- [ ] Lazy load components
- [ ] Optimize re-renders
- [ ] Virtual scrolling for history

## Files Created

```
src/
├── hooks/
│   └── use-blackjack-game.tsx
├── components/
│   ├── card.tsx
│   ├── hand-display.tsx
│   ├── betting-controls.tsx
│   ├── action-buttons.tsx
│   ├── insurance-dialog.tsx
│   ├── game-stats.tsx
│   └── blackjack-table.tsx
└── app/
    └── page.tsx (updated)
```

## Dependencies Used

- **Next.js 16** - React framework with Turbopack
- **React 19** - UI library
- **shadcn/ui** - Component library (Button, Card, Dialog, Input, Badge)
- **Tailwind CSS v4** - Styling
- **TypeScript** - Type safety
- **lucide-react** - Icons

## Game Engine Integration

The UI integrates seamlessly with your blackjack game engine:

```typescript
import { Game } from "@/modules/game/game";
import { RuleSet } from "@/modules/game/rules";
import type { ActionType } from "@/modules/game/action";
```

All game logic, rules, and state management happen in the core game engine. The UI is purely presentational and event-driven.

## Summary

A complete, production-ready blackjack UI that:
- Works with your existing game engine
- Looks beautiful with shadcn/ui
- Provides excellent UX
- Supports all game features
- Ready for further enhancement

Play now at http://localhost:3000!
