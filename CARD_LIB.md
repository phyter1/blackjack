# Playing Cards Library - Complete Usage Guide

## 📍 Library Location

All library files are located in: `src/lib/cards/`

## 📦 Installation & Setup

### 1. File Structure

Ensure your project has the following structure:

```
src/
└── lib/
    └── cards/
        ├── patterns/
        │   ├── BicycleClassicPattern.tsx
        │   ├── GeometricHexagonsPattern.tsx
        │   ├── ArtDecoSunburstPattern.tsx
        │   ├── MinimalDotsPattern.tsx
        │   ├── ChevronPattern.tsx
        │   ├── SolidPattern.tsx
        │   └── index.ts
        ├── card-back.tsx
        ├── playing-card.tsx
        ├── types.ts
        ├── constants.ts
        └── index.ts
```

### 2. Dependencies

The library requires:

```json
{
  "peerDependencies": {
    "react": "^18.0.0",
    "react-dom": "^18.0.0"
  },
  "devDependencies": {
    "@types/react": "^18.2.0",
    "typescript": "^5.0.0"
  }
}
```

No additional dependencies needed! Pure React + TypeScript + SVG.

## 🚀 Basic Usage

### Import the Components

```tsx
import { PlayingCard, CardBack } from '@/lib/cards';
```

### Simple Card Back

The simplest usage - renders a card back with default settings:

```tsx
function MyComponent() {
  return <PlayingCard card="back" />;
}
```

This renders:

- **Design:** Bicycle Classic (default)
- **Size:** 225x315px (poker size)
- **Colors:** Default red/white scheme

### Specify a Design

Choose from 8 pre-designed card backs:

```tsx
<PlayingCard 
  card="back" 
  backDesign="geometric-hexagons"
/>
```

**Available Designs:**

- `bicycle-classic` - Traditional ornate design with medallion
- `geometric-hexagons` - Modern hexagonal pattern
- `geometric-diamonds` - Diamond geometric pattern (alias for hexagons)
- `art-deco-sunburst` - 1920s Art Deco sunburst with rays
- `victorian-arabesque` - Victorian-era arabesque flourishes (alias for bicycle-classic)
- `minimal-dots` - Minimalist dot pattern
- `chevron` - Classic chevron zigzag pattern
- `solid` - Simple solid color

## 🎨 Customization

### Custom Colors

Override the default color scheme:

```tsx
<PlayingCard
  card="back"
  backDesign="bicycle-classic"
  backColors={{
    primary: '#3B82F6',      // Blue
    secondary: '#DBEAFE',    // Light blue
    background: '#FFFFFF',   // White
    border: '#1E40AF',       // Dark blue
  }}
/>
```

**Color Properties:**

- `primary` - Main pattern color (dominant visual element)
- `secondary` - Accent color (complementary to primary)
- `background` - Card background color
- `border` - Optional border color (defaults to primary if not specified)

### Custom Sizes

Change card dimensions while maintaining aspect ratio:

```tsx
{/* Small card */}
<PlayingCard 
  card="back" 
  width={100} 
  height={140} 
/>

{/* Medium card */}
<PlayingCard 
  card="back" 
  width={150} 
  height={210} 
/>

{/* Large card (default) */}
<PlayingCard 
  card="back" 
  width={225} 
  height={315} 
/>

{/* Extra large */}
<PlayingCard 
  card="back" 
  width={300} 
  height={420} 
/>
```

**Tip:** The default aspect ratio is 1.4:1 (poker card standard). You can use any dimensions, but maintaining this ratio looks best.

### Border Radius

Adjust the corner rounding:

```tsx
<PlayingCard 
  card="back" 
  borderRadius={16}  // More rounded
/>

<PlayingCard 
  card="back" 
  borderRadius={4}   // Less rounded
/>

<PlayingCard 
  card="back" 
  borderRadius={0}   // Square corners
/>
```

## 🎯 Component APIs

### `<PlayingCard>` Component

Main component for rendering playing cards.

**Props:**

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `card` | `CardNotation \| 'back'` | **required** | Card to display (e.g., "Ah", "Ks") or "back" for card back |
| `width` | `number` | `225` | Width in pixels |
| `height` | `number` | `315` | Height in pixels |
| `borderRadius` | `number` | `12` | Border radius in pixels |
| `backDesign` | `CardBackDesign` | `'bicycle-classic'` | Card back design pattern |
| `backColors` | `Partial<CardBackColors>` | `undefined` | Custom color overrides |
| `className` | `string` | `undefined` | CSS class name |
| `style` | `React.CSSProperties` | `undefined` | Inline styles |
| `onClick` | `() => void` | `undefined` | Click handler |

**Example:**

```tsx
<PlayingCard
  card="back"
  width={200}
  height={280}
  borderRadius={16}
  backDesign="art-deco-sunburst"
  backColors={{
    primary: '#8B5CF6',
    secondary: '#EDE9FE',
    background: '#FFFFFF',
  }}
  onClick={() => console.log('Card clicked!')}
  className="my-card"
  style={{ margin: '10px' }}
/>
```

### `<CardBack>` Component

Standalone component for rendering just the card back (no wrapper).

**Props:**

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `design` | `CardBackDesign` | `'bicycle-classic'` | Card back design pattern |
| `colors` | `Partial<CardBackColors>` | `undefined` | Custom color overrides |
| `width` | `number` | `225` | Width in pixels |
| `height` | `number` | `315` | Height in pixels |
| `borderRadius` | `number` | `12` | Border radius in pixels |

**When to use `CardBack` vs `PlayingCard`:**

- Use `PlayingCard` when you need the full card wrapper with click handlers
- Use `CardBack` for more direct control or when embedding in custom card implementations

**Example:**

```tsx
<CardBack
  design="geometric-hexagons"
  colors={{
    primary: '#EF4444',
    secondary: '#FFFFFF',
    background: '#FEF2F2',
  }}
  width={200}
  height={280}
/>
```

## 📘 TypeScript Types

### Importing Types

```tsx
import type {
  CardBackDesign,
  CardBackColors,
  PlayingCardProps,
  CardBackProps,
  CardNotation,
  Suit,
  Rank,
} from '@/lib/cards';
```

### `CardBackDesign`

Union type for all available card back designs:

```typescript
type CardBackDesign =
  | 'bicycle-classic'
  | 'geometric-hexagons'
  | 'geometric-diamonds'
  | 'art-deco-sunburst'
  | 'victorian-arabesque'
  | 'minimal-dots'
  | 'chevron'
  | 'solid';
```

### `CardBackColors`

Interface for color customization:

```typescript
interface CardBackColors {
  primary: string;      // Main pattern color (hex, rgb, or named color)
  secondary: string;    // Secondary pattern color
  background: string;   // Background color
  border?: string;      // Optional border color
}
```

### `CardNotation`

Type for card identification (currently placeholder for future card front rendering):

```typescript
type Rank = 'A' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | 'J' | 'Q' | 'K';
type Suit = 'hearts' | 'diamonds' | 'clubs' | 'spades';
type CardNotation = `${Rank}${'h' | 'd' | 'c' | 's'}`;

// Examples: "Ah" (Ace of Hearts), "Ks" (King of Spades)
```

## 🎨 Color Schemes & Themes

### Default Color Schemes

Access default colors for any design:

```tsx
import { DEFAULT_BACK_COLORS } from '@/lib/cards';

const bicycleColors = DEFAULT_BACK_COLORS['bicycle-classic'];
// { primary: '#E21C21', secondary: '#FFFFFF', background: '#FFFFFF', border: '#000000' }
```

### Creating Theme Objects

Define reusable color themes:

```tsx
// themes.ts
export const cardThemes = {
  classic: {
    primary: '#E21C21',
    secondary: '#FFFFFF',
    background: '#FFFFFF',
    border: '#000000',
  },
  ocean: {
    primary: '#0EA5E9',
    secondary: '#E0F2FE',
    background: '#FFFFFF',
    border: '#0369A1',
  },
  forest: {
    primary: '#059669',
    secondary: '#D1FAE5',
    background: '#FFFFFF',
    border: '#047857',
  },
  sunset: {
    primary: '#F97316',
    secondary: '#FFEDD5',
    background: '#FFFFFF',
    border: '#EA580C',
  },
  royal: {
    primary: '#7C3AED',
    secondary: '#EDE9FE',
    background: '#FFFFFF',
    border: '#6D28D9',
  },
};

// Usage
<PlayingCard
  card="back"
  backDesign="geometric-hexagons"
  backColors={cardThemes.ocean}
/>
```

### Dynamic Color Generation

Generate colors programmatically:

```tsx
function generateCardColors(hue: number) {
  return {
    primary: `hsl(${hue}, 70%, 50%)`,
    secondary: `hsl(${hue}, 70%, 90%)`,
    background: '#FFFFFF',
    border: `hsl(${hue}, 70%, 35%)`,
  };
}

// Usage - blue cards
<PlayingCard
  card="back"
  backColors={generateCardColors(210)}
/>

// Usage - red cards
<PlayingCard
  card="back"
  backColors={generateCardColors(0)}
/>
```

## 🎮 Common Use Cases

### Card Gallery / Design Showcase

Display all available designs:

```tsx
import { PlayingCard, CardBackDesign } from '@/lib/cards';

const designs: CardBackDesign[] = [
  'bicycle-classic',
  'geometric-hexagons',
  'art-deco-sunburst',
  'minimal-dots',
  'chevron',
  'solid',
];

function CardGallery() {
  return (
    <div style={{ 
      display: 'grid', 
      gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
      gap: '24px' 
    }}>
      {designs.map(design => (
        <div key={design}>
          <h3>{design}</h3>
          <PlayingCard
            card="back"
            backDesign={design}
            width={160}
            height={224}
          />
        </div>
      ))}
    </div>
  );
}
```

### Interactive Card Deck

Create clickable cards with state:

```tsx
import { useState } from 'react';
import { PlayingCard, CardBackDesign } from '@/lib/cards';

function InteractiveDeck() {
  const [selectedDesign, setSelectedDesign] = useState<CardBackDesign>('bicycle-classic');
  
  const designs: CardBackDesign[] = [
    'bicycle-classic',
    'geometric-hexagons',
    'art-deco-sunburst',
  ];
  
  return (
    <div>
      <div style={{ display: 'flex', gap: '16px', marginBottom: '24px' }}>
        {designs.map(design => (
          <button
            key={design}
            onClick={() => setSelectedDesign(design)}
            style={{
              padding: '8px 16px',
              background: selectedDesign === design ? '#667eea' : '#e5e7eb',
              color: selectedDesign === design ? 'white' : 'black',
            }}
          >
            {design}
          </button>
        ))}
      </div>
      
      <PlayingCard
        card="back"
        backDesign={selectedDesign}
        width={225}
        height={315}
      />
    </div>
  );
}
```

### Color Customizer

Let users customize card colors:

```tsx
import { useState } from 'react';
import { PlayingCard } from '@/lib/cards';

function ColorCustomizer() {
  const [colors, setColors] = useState({
    primary: '#E21C21',
    secondary: '#FFFFFF',
    background: '#FFFFFF',
    border: '#000000',
  });
  
  return (
    <div style={{ display: 'flex', gap: '32px' }}>
      <div>
        <h3>Customize Colors</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <label>
            Primary:
            <input
              type="color"
              value={colors.primary}
              onChange={(e) => setColors({ ...colors, primary: e.target.value })}
            />
          </label>
          <label>
            Secondary:
            <input
              type="color"
              value={colors.secondary}
              onChange={(e) => setColors({ ...colors, secondary: e.target.value })}
            />
          </label>
          <label>
            Background:
            <input
              type="color"
              value={colors.background}
              onChange={(e) => setColors({ ...colors, background: e.target.value })}
            />
          </label>
          <label>
            Border:
            <input
              type="color"
              value={colors.border}
              onChange={(e) => setColors({ ...colors, border: e.target.value })}
            />
          </label>
        </div>
      </div>
      
      <PlayingCard
        card="back"
        backDesign="bicycle-classic"
        backColors={colors}
        width={225}
        height={315}
      />
    </div>
  );
}
```

### Responsive Card Grid

Create a responsive layout:

```tsx
function ResponsiveCardGrid() {
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
      gap: '20px',
      padding: '20px',
    }}>
      {Array.from({ length: 12 }).map((_, i) => (
        <div key={i} style={{ width: '100%' }}>
          <PlayingCard
            card="back"
            backDesign="geometric-hexagons"
            width={150}
            height={210}
            style={{ width: '100%', height: 'auto' }}
          />
        </div>
      ))}
    </div>
  );
}
```

### Card Flip Animation

Implement a flip effect:

```tsx
import { useState } from 'react';
import { PlayingCard } from '@/lib/cards';

function FlippableCard() {
  const [isFlipped, setIsFlipped] = useState(false);
  
  return (
    <div
      style={{
        perspective: '1000px',
        cursor: 'pointer',
      }}
      onClick={() => setIsFlipped(!isFlipped)}
    >
      <div
        style={{
          position: 'relative',
          width: '225px',
          height: '315px',
          transformStyle: 'preserve-3d',
          transition: 'transform 0.6s',
          transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
        }}
      >
        {/* Card Back */}
        <div
          style={{
            position: 'absolute',
            width: '100%',
            height: '100%',
            backfaceVisibility: 'hidden',
          }}
        >
          <PlayingCard card="back" backDesign="bicycle-classic" />
        </div>
        
        {/* Card Front (placeholder) */}
        <div
          style={{
            position: 'absolute',
            width: '100%',
            height: '100%',
            backfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)',
            background: 'white',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '48px',
            border: '2px solid #ccc',
          }}
        >
          A♠
        </div>
      </div>
    </div>
  );
}
```

### Card Fan Layout

Create a spread of cards:

```tsx
function CardFan() {
  const cards = Array.from({ length: 7 });
  
  return (
    <div style={{ 
      position: 'relative', 
      height: '400px',
      width: '600px',
      margin: '50px auto'
    }}>
      {cards.map((_, i) => {
        const angle = (i - 3) * 10; // -30 to 30 degrees
        const translateX = (i - 3) * 40;
        
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: '50%',
              bottom: '0',
              transform: `translateX(${translateX}px) rotate(${angle}deg)`,
              transformOrigin: 'bottom center',
              transition: 'transform 0.3s ease',
            }}
          >
            <PlayingCard
              card="back"
              backDesign="bicycle-classic"
              width={150}
              height={210}
            />
          </div>
        );
      })}
    </div>
  );
}
```

## 🎨 Advanced Customization

### Using Individual Pattern Components

For maximum control, use pattern components directly:

```tsx
import { 
  BicycleClassicPattern,
  GeometricHexagonsPattern,
  ArtDecoSunburstPattern 
} from '@/lib/cards/patterns';

function CustomCardBack() {
  const colors = {
    primary: '#FF0000',
    secondary: '#FFFFFF',
    background: '#F0F0F0',
    border: '#CC0000',
  };
  
  return (
    <div style={{ 
      width: '225px', 
      height: '315px',
      borderRadius: '12px',
      overflow: 'hidden',
      boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
    }}>
      <BicycleClassicPattern colors={colors} />
    </div>
  );
}
```

### Creating Custom Patterns

Add your own card back designs:

```tsx
// src/lib/cards/patterns/MyCustomPattern.tsx
import React from 'react';
import { CardBackColors } from '../types';

interface MyCustomPatternProps {
  colors: CardBackColors;
}

export const MyCustomPattern: React.FC<MyCustomPatternProps> = ({ colors }) => {
  return (
    <svg width="100%" height="100%" viewBox="0 0 225 315" xmlns="http://www.w3.org/2000/svg">
      <defs>
        {/* Define reusable patterns here */}
        <pattern id="my-pattern" x="0" y="0" width="50" height="50" patternUnits="userSpaceOnUse">
          <circle cx="25" cy="25" r="10" fill={colors.primary} />
        </pattern>
      </defs>
      
      {/* Background */}
      <rect width="225" height="315" fill={colors.background} />
      
      {/* Apply pattern */}
      <rect width="225" height="315" fill="url(#my-pattern)" />
      
      {/* Border */}
      <rect 
        x="10" 
        y="10" 
        width="205" 
        height="295" 
        fill="none" 
        stroke={colors.border || colors.primary} 
        strokeWidth="2"
        rx="8"
      />
    </svg>
  );
};
```

Then register it in the library:

1. Export from `patterns/index.ts`
2. Add to `CardBackDesign` type in `types.ts`
3. Add default colors in `constants.ts`
4. Update switch statement in `CardBack.tsx`

## 🔧 Constants & Utilities

### Import Constants

```tsx
import {
  DEFAULT_CARD_WIDTH,
  DEFAULT_CARD_HEIGHT,
  DEFAULT_BORDER_RADIUS,
  CARD_ASPECT_RATIO,
  DEFAULT_BACK_COLORS,
} from '@/lib/cards';
```

**Available Constants:**

```typescript
DEFAULT_CARD_WIDTH = 225;           // Poker size width
DEFAULT_CARD_HEIGHT = 315;          // Poker size height
DEFAULT_BORDER_RADIUS = 12;         // Default corner radius
CARD_ASPECT_RATIO = 1.4;            // Height/width ratio (poker cards)

DEFAULT_BACK_COLORS = {
  'bicycle-classic': { /* colors */ },
  'geometric-hexagons': { /* colors */ },
  // ... all default color schemes
};
```

### Calculate Dimensions

Maintain aspect ratio:

```tsx
function calculateCardHeight(width: number): number {
  return Math.round(width * CARD_ASPECT_RATIO);
}

// Usage
const width = 200;
const height = calculateCardHeight(width); // 280
```

## 🎯 Best Practices

### Performance

1. **Memoize expensive renders:**

```tsx
import { memo } from 'react';

const MemoizedCard = memo(PlayingCard);
```

2. **Use CSS for animations:**

```tsx
// Better performance than JavaScript animations
<PlayingCard
  card="back"
  style={{
    transition: 'transform 0.3s ease',
    transform: isHovered ? 'scale(1.1)' : 'scale(1)',
  }}
/>
```

3. **Lazy load large card collections:**

```tsx
import { lazy, Suspense } from 'react';

const CardGallery = lazy(() => import('./CardGallery'));

<Suspense fallback={<div>Loading cards...</div>}>
  <CardGallery />
</Suspense>
```

### Accessibility

1. **Add ARIA labels:**

```tsx
<div role="img" aria-label="Playing card back with bicycle design">
  <PlayingCard card="back" backDesign="bicycle-classic" />
</div>
```

2. **Keyboard navigation:**

```tsx
<PlayingCard
  card="back"
  onClick={handleClick}
  onKeyDown={(e) => e.key === 'Enter' && handleClick()}
  tabIndex={0}
  style={{ cursor: 'pointer' }}
/>
```

### Styling

1. **Use className for custom styles:**

```tsx
// styles.css
.my-card {
  transition: all 0.3s ease;
  cursor: pointer;
}

.my-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 16px rgba(0,0,0,0.3);
}

// Component
<PlayingCard card="back" className="my-card" />
```

2. **Responsive sizing:**

```tsx
<div style={{ width: '100%', maxWidth: '225px' }}>
  <PlayingCard 
    card="back"
    width={225}
    height={315}
    style={{ width: '100%', height: 'auto' }}
  />
</div>
```

## 🐛 Troubleshooting

### Common Issues

**Issue: Colors not updating**

```tsx
// ❌ Wrong - mutating object
colors.primary = '#FF0000';

// ✅ Correct - create new object
setColors({ ...colors, primary: '#FF0000' });
```

**Issue: Cards appearing blurry**

```tsx
// ❌ Wrong - fractional dimensions
<PlayingCard width={225.5} height={315.3} />

// ✅ Correct - whole numbers
<PlayingCard width={225} height={315} />
```

**Issue: SVG not scaling properly**

```tsx
// ❌ Wrong - setting both width and height
<PlayingCard 
  width={200} 
  height={200}  // Wrong aspect ratio
/>

// ✅ Correct - maintain aspect ratio
<PlayingCard 
  width={200} 
  height={280}  // 1.4:1 ratio
/>
```

## 📚 Additional Resources

### TypeScript Support

The library is fully typed. Your IDE should provide:

- Autocomplete for all props
- Type checking for color values
- IntelliSense for design names
- Error highlighting for invalid props

### Example Projects

Check these files for more examples:

- `src/lib/cards/examples.tsx` - Comprehensive usage examples
- `showcase.tsx` - Visual demonstration
- `demo.html` - Static HTML demo

## 🎉 Summary

You now have everything you need to use the playing cards library:

✅ **6 beautiful card back designs**
✅ **Full color customization**
✅ **Type-safe API with TypeScript**
✅ **Flexible sizing and styling**
✅ **Pure SVG - scales perfectly**
✅ **No external dependencies**

Start with simple usage and explore advanced features as needed. The library is designed to be intuitive for beginners while providing powerful customization for advanced use cases.

**Happy coding! 🃏**
