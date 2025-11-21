# Casino Chip Color System

Sophisticated color generation system for casino chips that follows real-world casino color standards.

## Overview

This module provides a color palette generator that maps chip denominations to authentic casino colors. The system uses canonical casino chip colors (red for $5, green for $25, black for $100, etc.) and allows customization via a base color shift.

## Key Features

- **Casino-Standard Colors**: Red ($5), Green ($25), Black ($100), Purple ($500), Yellow ($1000), etc.
- **Logarithmic Snapping**: Denominations are mapped to the nearest canonical value in log space
- **Color Theming**: Entire palette can be shifted by providing a base color
- **Flexible Denominations**: Supports both standard and custom denomination sets

## Usage

### Basic Usage

```typescript
import { generateStandardCasinoChipPalette } from "@/modules/chip/color";

// Generate colors for specific canonical denominations
const palette = generateStandardCasinoChipPalette("#F9FAFB", {
  denominations: [5, 25, 100, 500, 1000],
});

// Result: Array of { value: number, hex: string }
// [
//   { value: 5, hex: "#DC2626" },    // Red
//   { value: 25, hex: "#16A34A" },   // Green
//   { value: 100, hex: "#111827" },  // Black
//   { value: 500, hex: "#7C3AED" },  // Purple
//   { value: 1000, hex: "#FACC15" }, // Yellow
// ]
```

### With Min/Max Range

```typescript
const palette = generateStandardCasinoChipPalette("#F9FAFB", {
  min: 1,
  max: 1000,
});
// Returns all standard denominations between 1 and 1000
```

### Custom Theme Color

```typescript
// Shift entire palette to a blue theme
const bluePalette = generateStandardCasinoChipPalette("#3B82F6", {
  denominations: [5, 25, 100],
});
// All colors will be shifted relative to the blue base
```

### Generate 1-2-5 Denominations

```typescript
import { generate125Denominations } from "@/modules/chip/color";

const denoms = generate125Denominations(1, 1000);
// Returns: [1, 2, 5, 10, 20, 50, 100, 200, 500, 1000]
```

## Canonical Color Mapping

The system uses these standard casino chip colors:

| Denomination | Color | Hex |
|--------------|-------|-----|
| $0.01 | Copper | #B87333 |
| $0.05 | Sienna | #A0522D |
| $0.25 | Orange/Amber | #D97706 |
| $0.50 | Grey | #9CA3AF |
| $1.00 | White (BASE) | #F9FAFB |
| $5.00 | Red | #DC2626 |
| $25.00 | Green | #16A34A |
| $100.00 | Black | #111827 |
| $500.00 | Purple | #7C3AED |
| $1000.00 | Yellow | #FACC15 |
| $5000.00 | Orange-Brown | #B45309 |
| $10000.00 | Slate Grey | #4B5563 |

## How It Works

### 1. Logarithmic Snapping

When you request a denomination like $50, the system:
1. Calculates `log10(50) = 1.699`
2. Finds the nearest canonical denomination in log space
3. In this case, $50 is closest to $25 (green) or $100 (black)
4. Returns the color of the nearest match

### 2. Color Shifting

The system can retheme the entire palette:
1. Takes your base color (e.g., blue #3B82F6)
2. Calculates HSL delta from the canonical $1 chip (white)
3. Applies the same delta to all other canonical colors
4. This maintains color relationships while shifting the theme

### 3. HSL Color Space

All color manipulation happens in HSL (Hue, Saturation, Lightness):
- **Hue** is rotated to match your theme
- **Saturation** is adjusted relatively
- **Lightness** is adjusted relatively

## Integration with UI Components

The color system integrates with chip components via `generateChipConfigs`:

```typescript
import { generateChipConfigs } from "@/components/casino-chip";

const chips = generateChipConfigs([5, 25, 100, 500]);
// Returns: [
//   { value: 5, color: "#DC2626", accentColor: "#991B1B" },
//   { value: 25, color: "#16A34A", accentColor: "#15803D" },
//   { value: 100, color: "#111827", accentColor: "#0c0f1a" },
//   { value: 500, color: "#7C3AED", accentColor: "#5729a6" },
// ]
```

The `accentColor` is automatically generated as a darker version (70% brightness) of the base color for gradient effects.

## API Reference

### `generateStandardCasinoChipPalette(baseHex, options)`

**Parameters:**
- `baseHex` (string): Base color for the $1 chip (e.g., "#F9FAFB")
- `options` (CasinoPaletteOptions):
  - `denominations?` (number[]): Explicit list of denominations
  - `min?` (number): Minimum denomination (inclusive)
  - `max?` (number): Maximum denomination (inclusive)

**Returns:** `ChipColor[]`
- Array of `{ value: number, hex: string }`

### `generate125Denominations(min, max)`

**Parameters:**
- `min` (number): Minimum value (> 0)
- `max` (number): Maximum value (>= min)

**Returns:** `number[]`
- Array of 1-2-5 style denominations

## Examples

### Casino Table with Dynamic Limits

```typescript
const minBet = 5;
const maxBet = 1000;

// Generate appropriate chip denominations
const denoms = generate125Denominations(minBet, maxBet);
const colors = generateStandardCasinoChipPalette("#F9FAFB", {
  denominations: denoms,
});
```

### High Roller Table

```typescript
const highRollerChips = generateStandardCasinoChipPalette("#FACC15", {
  min: 100,
  max: 100000,
});
// Yellow-themed palette for high stakes
```

### European Casino Style

```typescript
const euroChips = generateStandardCasinoChipPalette("#E5E7EB", {
  denominations: [1, 2, 5, 10, 20, 50, 100, 500],
});
// European-style denominations with grey-white base
```

## Technical Details

### Color Utilities

The module includes internal utilities for color conversion:
- `hexToRgb()`: Convert hex to RGB
- `rgbToHex()`: Convert RGB to hex
- `hexToHsl()`: Convert hex to HSL
- `hslToRgb()`: Convert HSL to RGB
- `hslToHex()`: Convert HSL to hex
- `hueDelta()`: Calculate smallest hue rotation
- `normalizeHue()`: Normalize hue to 0-360 range
- `clamp()`: Constrain value to range

### Nearest Canonical Matching

```typescript
function findNearestCanonical(denom: number, canonical: CanonicalChipColor[]): CanonicalChipColor {
  const logV = Math.log10(denom);
  // Find canonical chip with minimum log-distance
}
```

This ensures that chip colors follow casino conventions even for custom denominations.

## Best Practices

1. **Use Standard Denominations**: Stick to 1-2-5 patterns for familiarity
2. **Consistent Base Color**: Use the same base color across your app
3. **Respect Min/Max**: Set reasonable betting limits
4. **Cache Results**: Color generation is deterministic, cache if needed
5. **Accessibility**: Ensure sufficient contrast between chips

## Migration from Old System

If you're migrating from the old hardcoded color system:

```typescript
// Old way
const CHIP_VALUES = [
  { value: 5, color: "#DC2626", accentColor: "#991B1B" },
  // ...
];

// New way
import { generateChipConfigs } from "@/components/casino-chip";
const chipValues = generateChipConfigs([5, 10, 25, 100]);
```

The new system is backward compatible but provides much more flexibility.

---

*Last Updated: 2025-11-21*
