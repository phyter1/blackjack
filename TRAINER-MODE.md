# Blackjack Trainer Mode

## Overview

The Trainer Mode is a comprehensive practice system for learning card counting and perfect basic strategy without risking real money. It provides real-time feedback on every decision and tracks your performance over time.

## Features

### 1. **Real-time Strategy Feedback**
- Instant feedback on whether your action matches basic strategy
- Detailed explanations for why a play is correct or incorrect
- Color-coded alerts (green for correct, red for incorrect)

### 2. **Card Counting Practice**
- Hi-Lo counting system integration
- Practice running count and/or true count
- Accuracy tracking for count guesses
- Immediate feedback on count correctness

### 3. **Difficulty Levels**

- **Beginner**: Shows hints and basic feedback
- **Running Count**: Practice running count only
- **True Count**: Practice both running and true count
- **Expert**: No hints, full challenge mode

### 4. **Performance Analytics**

- **Strategy Accuracy**: Percentage of correct decisions with letter grade (A+ to F)
- **Recent Performance**: Track last 10 decisions
- **By Hand Type**: See accuracy for hard hands, soft hands, and pairs separately
- **Counting Accuracy**: Track running count and true count accuracy

### 5. **Practice Balance**

- Start with $10,000 practice money
- Track gains/losses separate from real bankroll
- Reset anytime to start fresh

## How to Use

### Accessing Trainer Mode

Visit `/trainer` in your browser to access the dedicated trainer page:

```
http://localhost:3000/trainer
```

### Getting Started

1. **Enter your name** to start a practice session
2. **Enable Trainer Mode** using the toggle in the left sidebar
3. **Select difficulty level** based on your skill:
   - Start with "Beginner" if new to basic strategy
   - Move to "Running Count" when ready to practice counting
   - Advance to "True Count" for full counting practice
   - Try "Expert" mode for maximum challenge

### Playing a Hand

1. **Place your bet** using the chip interface
2. **Cards are dealt** - if counting is enabled, track the cards
3. **Submit your count** (if practicing counting) in the right panel
4. **Make your decision** (Hit, Stand, Double, Split, or Surrender)
5. **Review feedback** - see if your play matches basic strategy
6. **Check statistics** - monitor your accuracy in real-time

### Understanding Feedback

#### Strategy Feedback

- **Green Alert**: Correct play! Shows the reason why it's optimal
- **Red Alert**: Incorrect play with explanation of what you should have done

Example:
```
✓ Correct! Always stand on hard 17
✗ Incorrect. You chose hit, but optimal play is stand. Always stand on hard 17
```

#### Counting Feedback

- **Perfect**: Both running and true count are correct
- **Off by X**: Shows how far off your count was
- **Color coding**:
  - Green: Correct
  - Yellow: Off by 1 (close!)
  - Red: Off by 2+ (needs work)

Example:
```
✓ Perfect! Both running count and true count are correct!
⚠ Off by 1. Actual running count: +4
✗ Off by 3. Actual running count: +6, True count: +3
```

### Performance Statistics

The stats panel shows:

- **Strategy Accuracy**: Your overall basic strategy adherence
- **Grade**: Letter grade (A+ = 98%+, F = below 60%)
- **Recent Accuracy**: Last 10 decisions (shows if you're improving)
- **Hard/Soft/Pairs**: Accuracy breakdown by hand type
- **Counting Accuracy**: Running count and true count correctness

## Components

### TrainerMode Class (`src/modules/strategy/trainer.ts`)

Core logic that:
- Evaluates player actions against basic strategy
- Processes card counting
- Tracks performance statistics
- Manages practice balance

### UI Components

1. **TrainerControls** (`src/components/trainer-controls.tsx`)
   - Toggle trainer on/off
   - Select difficulty level
   - View practice balance
   - Reset session

2. **StrategyFeedback** (`src/components/strategy-feedback.tsx`)
   - Real-time action feedback
   - Color-coded alerts
   - Explanation text

3. **CountingPanel** (`src/components/counting-panel.tsx`)
   - Count input fields
   - Submit button
   - Count accuracy feedback

4. **TrainerStatsPanel** (`src/components/trainer-stats-panel.tsx`)
   - Performance dashboard
   - Progress bars
   - Accuracy breakdown
   - Letter grades

### Context Provider

**TrainerModeProvider** (`src/hooks/use-trainer-mode.tsx`)
- React context for trainer state
- Actions for activating/deactivating trainer
- Stats refresh functionality

## Integration with Game Engine

The trainer mode integrates seamlessly with the existing game engine:

1. **Cards Dealt**: Automatically tracked for counting
2. **Player Actions**: Evaluated before execution
3. **Hand Settlement**: Updates practice balance
4. **New Round**: Clears feedback, maintains count

## Difficulty Level Details

### Beginner
- Shows hints for optimal play
- Basic feedback on correctness
- No counting required
- **Best for**: Learning basic strategy fundamentals

### Running Count
- No hints
- Must submit running count after each hand
- Accuracy tracked
- **Best for**: Practicing the Hi-Lo running count

### True Count
- No hints
- Must submit both running AND true count
- Both must be correct for full points
- **Best for**: Advanced counting practice

### Expert
- No hints
- Full counting required
- No assistance
- **Best for**: Testing your skills before real play

## Performance Grading

| Grade | Accuracy Range | Meaning |
|-------|---------------|---------|
| A+ | 98-100% | Perfect or near-perfect strategy |
| A | 93-97% | Excellent strategy adherence |
| A- | 90-92% | Very good, minor mistakes |
| B+ | 87-89% | Good, some room for improvement |
| B | 83-86% | Above average |
| B- | 80-82% | Decent, needs practice |
| C+ | 77-79% | Below average, significant mistakes |
| C | 73-76% | Poor strategy adherence |
| C- | 70-72% | Many mistakes |
| D+ | 67-69% | Very poor |
| D | 60-66% | Needs serious study |
| F | <60% | Review basic strategy charts |

## Tips for Improvement

### Strategy Practice

1. **Start with beginner mode** until you achieve 95%+ accuracy
2. **Focus on one hand type at a time**:
   - Master hard hands first (most common)
   - Then soft hands (trickier)
   - Finally pairs (least common)
3. **Review mistakes** - look at the feedback for each incorrect play
4. **Use the stats panel** to identify weak areas

### Counting Practice

1. **Master running count first** before attempting true count
2. **Count by pairs** (high + low = 0, high + high = -2, etc.)
3. **Practice with single deck** first, then multi-deck
4. **Aim for 90%+ accuracy** before using counts for betting decisions
5. **Speed matters** - practice until counting is automatic

### Common Mistakes

- **Hard 16 vs Dealer 10**: Many players hit when they should surrender
- **Soft 18 vs Dealer 9**: Many stand when they should hit
- **Pair of 9s vs Dealer 7**: Many split when they should stand
- **Losing count during splits**: Track each card dealt carefully

## API Usage

For developers wanting to integrate trainer mode:

```typescript
import { TrainerMode } from "@/modules/strategy/trainer";

// Create trainer instance
const trainer = new TrainerMode(game, "beginner", 10000);

// Activate trainer
trainer.activate();

// Evaluate an action
const feedback = trainer.evaluateAction(
  playerCards,
  handValue,
  dealerUpCard,
  canDouble,
  canSplit,
  canSurrender,
  playerAction,
  handId,
  roundId,
  betAmount
);

// Submit count guess
const countFeedback = trainer.submitCountGuess(
  playerRunningCount,
  playerTrueCount
);

// Get statistics
const stats = trainer.getStats();

// Get mistakes for review
const mistakes = trainer.getMistakes();

// Reset session
trainer.reset();
```

## Future Enhancements

Potential additions:
- [ ] Strategy chart visualization
- [ ] Deviation plays based on true count
- [ ] Bet sizing recommendations
- [ ] Session replay
- [ ] Mistake review mode
- [ ] Customizable rules practice
- [ ] Achievement system
- [ ] Leaderboards

## Related Files

- Core logic: `src/modules/strategy/trainer.ts`
- UI components: `src/components/trainer-*.tsx`
- Context provider: `src/hooks/use-trainer-mode.tsx`
- Trainer page: `src/app/trainer/page.tsx`
- Basic strategy: `src/modules/strategy/basic-strategy.ts`
- Card counting: `src/modules/strategy/hi-lo-counter.ts`
- Decision tracking: `src/modules/strategy/decision-tracker.ts`
