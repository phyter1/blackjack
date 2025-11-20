# Critical Shuffle Bug: No Cross-Deck Mixing

**Status**: ✅ RESOLVED
**Date Identified**: 2025-11-20
**Date Resolved**: 2025-11-20
**Original Severity**: High - Affects game fairness

## Summary

The shuffle algorithm has a critical flaw: **cards from different decks are never mixed together**. This causes the first 10-15 cards dealt to frequently contain suited flushes and other non-random patterns.

## Root Cause Analysis

### Current Implementation Flow

1. **In `newShoeStack` (shoe.ts:29-36)**:
   ```typescript
   for (let i = 0; i < numDecks; i++) {
     shoe = shoe.concat(riffleShuffleStack(newDeck()));
   }
   const { stack: cards } = cutStackAtPenetration({
     stack: shuffleShoe(shoe),
     penetration: penetration * 100,
   });
   ```

2. **In `shuffleShoe` (shuffle.ts:125-153)**:
   ```typescript
   const deckSize = 52;
   const numDecks = Math.ceil(shoe.length / deckSize);
   const chunks: Stack[] = [];

   // Shuffle each 52-card chunk independently
   for (let i = 0; i < numDecks; i++) {
     const chunk = shoe.slice(i * deckSize, (i + 1) * deckSize);
     let shuffledChunk = chunk;
     for (let j = 0; j < 5; j++) {
       shuffledChunk = riffleShuffleStack(shuffledChunk);
     }
     shuffledChunk = overhandShuffleStack(shuffledChunk);
     chunks.push(shuffledChunk);
   }

   const reassembledShoe = chunks.flat();  // ⚠️ Just concatenates!
   ```

### The Problem

After breaking the shoe into 52-card chunks and shuffling each chunk:
- Chunks are concatenated with `chunks.flat()`
- **No mixing between chunks occurs**
- Cards from deck 1 stay in their chunk
- Cards from deck 2 stay in their chunk
- etc.

Even though a cut is performed afterward, it only rotates the shoe - it doesn't mix cards across deck boundaries.

## Statistical Evidence

Comprehensive tests reveal the following:

### 1. Zero Cross-Deck Mixing
| Metric | Expected | Observed | Status |
|--------|----------|----------|--------|
| First 52 cards from 4+ original decks | >80% | **0%** | ❌ FAIL |
| First 20 cards from 2+ original decks | >80% | **0%** | ❌ FAIL |
| First 20 cards from 1 deck only | <20% | **100%** | ❌ FAIL |

**Finding**: 100% of first 20 cards come from a single original deck.

### 2. Suited Flush Problem
| Metric | Expected | Observed | Status |
|--------|----------|----------|--------|
| 5+ cards same suit in first 15 | 20-30% | **94%** | ❌ FAIL |
| Average max suit count (first 15) | 4-5 cards | **6.18 cards** | ❌ FAIL |
| 7+ cards same suit | <10% | **30%** | ❌ FAIL |

**Finding**: 94% of shoes have flush potential in first 15 cards.

### 3. Suit Clustering
| Metric | Expected | Observed | Status |
|--------|----------|----------|--------|
| 4+ consecutive same suit (100 cards) | <100 | **120** | ❌ FAIL |
| 5+ consecutive same suit (100 cards) | <10 | **27** | ❌ FAIL |

### Tests That Pass ✅
- Suit distribution in first 52 cards (when averaged over many shoes)
- Chi-square test for suit uniformity
- Rank distribution
- Card count preservation

## Why This Causes Suited Flushes

1. Each deck starts with cards grouped by suit (standard new deck order)
2. Even after 5 riffle shuffles + 1 overhand shuffle per deck, some local suit clustering remains
3. When you deal from the top of the shoe, if the cut happens to place you near the start of one of the original deck chunks, you're dealing from cards that:
   - All came from the same original deck
   - Still have some residual suit clustering from that deck's shuffle
4. Result: Suited cards appear together far more often than they should

## Impact on Gameplay

### Fairness Concerns
- **Card counting**: Counters may see artificially high/low counts early in shoe
- **Strategy decisions**: Insurance, doubling, splitting decisions affected by biased card distribution
- **Player trust**: Observable patterns (suited flushes) reduce trust in shuffle quality

### Observed Symptoms
- Suited flushes in first 10-15 cards (reported by user)
- Occasional runs of same-rank cards
- Predictable patterns across multiple shoes

## Proposed Fix

Replace the simple concatenation in `shuffleShoe` with actual cross-deck mixing:

```typescript
export const shuffleShoe = (shoe: Stack): Stack => {
  const deckSize = 52;
  const numDecks = Math.ceil(shoe.length / deckSize);
  const chunks: Stack[] = [];

  // Shuffle each chunk thoroughly
  for (let i = 0; i < numDecks; i++) {
    const chunk = shoe.slice(i * deckSize, (i + 1) * deckSize);
    let shuffledChunk = chunk;
    for (let j = 0; j < 5; j++) {
      shuffledChunk = riffleShuffleStack(shuffledChunk);
    }
    shuffledChunk = overhandShuffleStack(shuffledChunk);
    chunks.push(shuffledChunk);
  }

  // ✅ NEW: Riffle shuffle chunks together to mix cards across decks
  let reassembledShoe = chunks[0];
  for (let i = 1; i < chunks.length; i++) {
    // Interleave each chunk with the accumulated shoe
    reassembledShoe = riffleShuffleStack([...reassembledShoe, ...chunks[i]]);
  }

  // Final cut
  const desiredPenetration = 75;
  const cutPenetration = 100 - desiredPenetration;
  const cutPosition = Math.floor(
    (cutPenetration / 100) * reassembledShoe.length,
  );
  return [
    ...reassembledShoe.slice(cutPosition),
    ...reassembledShoe.slice(0, cutPosition),
  ];
};
```

### Alternative: Fisher-Yates Shuffle

For maximum randomness, could replace the entire casino-style shuffle with a Fisher-Yates shuffle:

```typescript
export const fisherYatesShuffle = (stack: Stack): Stack => {
  const shuffled = [...stack];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};
```

However, this loses the "realistic casino feel" of the current implementation.

## Resolution

### Implementation (2025-11-20)

Fixed the cross-deck mixing issue in `shuffleShoe` (shuffle.ts:144-154):

```typescript
// Mix chunks together using multiple riffle shuffles to achieve cross-deck mixing
let reassembledShoe = chunks[0];
for (let i = 1; i < chunks.length; i++) {
  // Combine current accumulated shoe with next chunk and riffle shuffle multiple times
  let combined = [...reassembledShoe, ...chunks[i]];
  // Do 3 riffle shuffles when combining to ensure thorough mixing
  for (let j = 0; j < 3; j++) {
    combined = riffleShuffleStack(combined);
  }
  reassembledShoe = combined;
}
```

### Validation Results

After implementing the fix, all tests pass:

**Cross-Deck Mixing**: ✅ FIXED
- First 52 cards from 5-6 different original decks: 100% (was 0%)
- First 20 cards from 4+ different original decks: 97% (was 0%)

**Statistical Tests**: ✅ ALL PASS (395 tests)
- Suit distribution: PASS
- Cross-deck mixing: PASS
- Chi-square uniformity: PASS
- All existing tests: PASS

### Important Discovery: "Suited Flush" is Normal!

During testing, we discovered that the user's reported "suited flush" observations (5+ cards of same suit in first 10-15 cards) are **statistically normal** and occur even with perfect randomness.

**Baseline Testing with Fisher-Yates Perfect Shuffle**:
- 93-96% of shoes have 5+ cards of same suit in first 15 cards
- Average max suit count: 5.79-5.90 cards
- This is the expected behavior for truly random distribution

The actual bug was the **lack of cross-deck mixing**, not the suit clustering itself. Once cross-deck mixing was fixed, the shuffle now performs identically to a perfect Fisher-Yates shuffle in terms of statistical properties.

## Test Files

- `src/modules/game/shuffle-statistical.test.ts` - Comprehensive statistical test suite (11 tests)
- `src/modules/game/shuffle-baseline.test.ts` - Fisher-Yates baseline for comparison (3 tests)
- `src/modules/game/shuffle.test.ts` - Existing shuffle tests (27 tests, all still passing)

## References

- `src/modules/game/shuffle.ts:125-161` - Fixed `shuffleShoe` function
- `src/modules/game/shuffle.ts:132-139` - New `fisherYatesShuffle` function (for comparison)
- `src/modules/game/shoe.ts:14-42` - `newShoeStack` function
