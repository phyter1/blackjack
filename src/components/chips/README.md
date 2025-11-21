# Casino Chip Components

Modular, reusable SVG-based chip components for casino gaming interfaces.

## Components

### DenomChip

Ornate denominational chip for betting. Uses `denom-chip.svg` design.

```tsx
import { DenomChip } from "@/components/chips";

<DenomChip
  value={100}
  color="#DC2626"
  accentColor="#991B1B"
  onClick={() => console.log("Chip clicked")}
  disabled={false}
  selected={false}
  size={96}
/>
```

**Props:**
- `value` (number): Chip denomination to display
- `color` (string): Primary color (hex)
- `accentColor` (string): Accent/gradient color (hex)
- `onClick?` (function): Click handler
- `disabled?` (boolean): Disabled state, default `false`
- `selected?` (boolean): Selected state, default `false`
- `size?` (number): Size in pixels, default `96`

### ActionChip

Hexagonal action chip for game buttons. Uses `action-chip.svg` design.

```tsx
import { ActionChip } from "@/components/chips";

<ActionChip
  label="Deal"
  color="#16A34A"
  accentColor="#15803D"
  onClick={() => console.log("Action clicked")}
  disabled={false}
  size={84}
/>
```

**Props:**
- `label` (string): Button text
- `color` (string): Primary color (hex)
- `accentColor` (string): Accent/gradient color (hex)
- `onClick` (function): Click handler
- `disabled?` (boolean): Disabled state, default `false`
- `size?` (number): Size in pixels, default `84`

### SvgChip (Base Component)

Low-level component for custom chip implementations.

```tsx
import { SvgChip } from "@/components/chips";

<SvgChip
  type="denom"
  color="#DC2626"
  accentColor="#991B1B"
  size={96}
>
  <div>Custom Content</div>
</SvgChip>
```

**Props:**
- `type` ("denom" | "action"): SVG design to use
- `color` (string): Primary color
- `accentColor?` (string): Gradient accent color
- `size?` (number): Size in pixels, default `96`
- `children?` (ReactNode): Content overlay
- `onClick?` (function): Click handler
- `disabled?` (boolean): Disabled state
- `selected?` (boolean): Selected state
- `className?` (string): Additional CSS classes

## Utility Functions

### getChipColor

Get color configuration for a chip value.

```tsx
import { getChipColor } from "@/components/chips";

const { color, accentColor } = getChipColor(100);
```

### generateChipConfigs

Generate chip configurations from denominations.

```tsx
import { generateChipConfigs } from "@/components/chips";

const chips = generateChipConfigs([5, 25, 100, 500]);
```

### CHIP_VALUES

Predefined chip denominations with colors.

```tsx
import { CHIP_VALUES } from "@/components/chips";

console.log(CHIP_VALUES);
// [
//   { value: 5, color: "#DC2626", accentColor: "#991B1B" },
//   { value: 10, color: "#2563EB", accentColor: "#1E40AF" },
//   ...
// ]
```

## Design Philosophy

### SVG-Based

Both chip types use SVG designs that can be dynamically colored:
- **denom-chip.svg**: Ornate design with decorative patterns for betting chips
- **action-chip.svg**: Hexagonal/geometric pattern for action buttons

### Dynamic Coloring

SVGs are colorized using CSS:
- Background gradient created from `color` and `accentColor` props
- SVG overlaid with `mix-blend-overlay` and filters for visual depth
- Text/content rendered on top with drop shadows

### Modular Architecture

```
chips/
├── svg-chip.tsx        # Base component with SVG rendering
├── denom-chip.tsx      # Denominational betting chips
├── action-chip.tsx     # Action button chips
├── index.ts            # Public API exports
└── README.md           # This file
```

## Backward Compatibility

Existing components (`CasinoChip`, `RoundActionButton`) now use these modular components internally, maintaining the same API for seamless migration.

## Usage Examples

### Betting Interface

```tsx
import { DenomChip, generateChipConfigs } from "@/components/chips";

const chips = generateChipConfigs([5, 25, 100, 500]);

<div className="flex gap-2">
  {chips.map(chip => (
    <DenomChip
      key={chip.value}
      value={chip.value}
      color={chip.color}
      accentColor={chip.accentColor}
      onClick={() => selectChip(chip.value)}
      selected={selectedValue === chip.value}
    />
  ))}
</div>
```

### Action Buttons

```tsx
import { ActionChip } from "@/components/chips";

<div className="flex gap-3">
  <ActionChip
    label="Re-bet"
    color="#2563EB"
    accentColor="#1E40AF"
    onClick={handleRebet}
  />
  <ActionChip
    label="Clear All"
    color="#DC2626"
    accentColor="#991B1B"
    onClick={handleClear}
  />
  <ActionChip
    label="Deal"
    color="#16A34A"
    accentColor="#15803D"
    onClick={handleDeal}
  />
</div>
```

### Custom Implementation

```tsx
import { SvgChip } from "@/components/chips";

<SvgChip
  type="action"
  color="#8B5CF6"
  accentColor="#6D28D9"
  size={120}
>
  <div className="flex flex-col items-center">
    <span className="text-2xl">♠️</span>
    <span className="text-xs text-white">Special</span>
  </div>
</SvgChip>
```
