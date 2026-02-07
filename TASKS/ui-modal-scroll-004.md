# Task: ui-modal-scroll-004 - Fix Modal Scroll Trap in Session Replay

## Overview

Fix the double-scroll behavior in the session replay modal caused by nested scroll containers. The issue stems from using `min-h-screen` inside a `fixed inset-0` modal overlay, creating conflicting scroll contexts that result in poor UX with scroll traps and nested scrolling.

## Requirements

### Functional Requirements
- Remove nested scroll container from modal content
- Ensure modal content properly fills the viewport
- Maintain proper padding and spacing for modal content
- Preserve all existing modal functionality (close button, navigation, etc.)
- Ensure content remains accessible and scrollable when needed

### Non-Functional Requirements
- Clean scroll behavior with single scroll context
- Smooth user experience without scroll traps
- Responsive layout that works across all viewport sizes
- Maintain visual consistency with existing design system
- No visual regressions in modal appearance

## Acceptance Criteria

- [ ] Modal uses single scroll container at the overlay level
- [ ] Inner content wrapper does not force minimum height
- [ ] Modal content scrolls smoothly without nested scroll behavior
- [ ] Padding and spacing remain consistent with current design
- [ ] Close button remains accessible at all scroll positions
- [ ] Navigation controls remain visible and functional
- [ ] Modal works correctly on mobile and desktop viewports
- [ ] No scroll trap behavior when interacting with modal content
- [ ] All existing modal features continue to work

## Implementation Details

### Technical Approach

The fix involves removing the `min-h-screen` class from the inner content wrapper at line 100 in `src/components/session-replay/index.tsx`. This eliminates the nested scroll container while maintaining proper layout.

**Current Implementation:**
```tsx
<div className="fixed inset-0 bg-black/95 overflow-y-auto z-50">
  <div className="min-h-screen p-4">  {/* Line 100 - Creates scroll trap */}
    <div className="max-w-6xl mx-auto">
      {/* Modal content */}
    </div>
  </div>
</div>
```

**Fixed Implementation:**
```tsx
<div className="fixed inset-0 bg-black/95 overflow-y-auto z-50">
  <div className="p-4">  {/* Removed min-h-screen */}
    <div className="max-w-6xl mx-auto">
      {/* Modal content */}
    </div>
  </div>
</div>
```

### Why This Fix Works

1. **Single Scroll Context**: The outer `fixed inset-0 overflow-y-auto` container handles all scrolling
2. **No Height Conflicts**: Removing `min-h-screen` prevents the inner div from forcing viewport height
3. **Natural Flow**: Content flows naturally within the scrollable overlay
4. **Maintains Padding**: The `p-4` padding remains for proper spacing
5. **Responsive**: Works across all viewport sizes without forced heights

### Files to Modify

- `src/components/session-replay/index.tsx` (line 100)

### Dependencies

- No new dependencies required
- Uses existing Tailwind CSS v4 utilities
- Built on Next.js 16 and TypeScript
- Leverages Radix UI components (via shadcn/ui Card components)

## Testing Requirements

### Manual Testing

1. **Desktop Testing**
   - Open session replay modal
   - Verify single smooth scroll behavior
   - Test scroll with mouse wheel and scrollbar
   - Verify close button accessibility at all scroll positions
   - Test navigation controls functionality
   - Verify content padding and spacing

2. **Mobile Testing**
   - Open modal on mobile viewport
   - Verify touch scroll behavior
   - Test pull-to-refresh doesn't interfere
   - Verify modal content is fully accessible
   - Test navigation controls on small screens

3. **Edge Cases**
   - Test with varying content lengths (short and long)
   - Verify behavior with no decision data
   - Test rapid scrolling behavior
   - Verify keyboard navigation (Tab, arrow keys)

### Visual Regression Testing

- Compare modal appearance before and after fix
- Verify spacing and padding consistency
- Ensure header, content, and controls alignment
- Validate dark background opacity (bg-black/95)
- Confirm z-index layering (z-50)

### Integration Testing

- Verify session summary displays correctly
- Test decision display navigation
- Verify financial metrics rendering
- Test count info display
- Ensure navigation controls work properly
- Test modal close functionality

## Definition of Done

- [ ] Code change implemented and committed
- [ ] Manual testing completed on desktop browsers (Chrome, Firefox, Safari)
- [ ] Mobile testing completed on iOS and Android
- [ ] Visual regression testing confirms no unwanted changes
- [ ] Navigation and interaction testing confirms all features work
- [ ] Code follows project conventions (TypeScript, Tailwind CSS v4)
- [ ] No console errors or warnings
- [ ] Pull request created and reviewed
- [ ] Changes merged to main branch

## Technical Context

### Related Files

- `src/components/session-replay/index.tsx` - Main component requiring fix
- `src/components/session-replay/session-summary.tsx` - Child component
- `src/components/session-replay/decision-display.tsx` - Child component
- `src/components/session-replay/financial-metrics.tsx` - Child component
- `src/components/session-replay/count-info.tsx` - Child component
- `src/components/session-replay/navigation-controls.tsx` - Child component

### Design System Patterns

**Modal Overlay Pattern (Correct):**
```tsx
<div className="fixed inset-0 bg-black/90 overflow-y-auto z-50">
  <div className="p-4">  {/* Simple padding wrapper */}
    <div className="max-w-6xl mx-auto">
      {/* Content */}
    </div>
  </div>
</div>
```

**Anti-Pattern (Current Issue):**
```tsx
<div className="fixed inset-0 overflow-y-auto">
  <div className="min-h-screen p-4">  {/* Creates nested scroll */}
    {/* Content */}
  </div>
</div>
```

### Tailwind CSS v4 Classes Used

- `fixed inset-0` - Fixed positioning covering entire viewport
- `bg-black/95` - Semi-transparent black background (95% opacity)
- `overflow-y-auto` - Enables vertical scrolling when content exceeds viewport
- `z-50` - High z-index for modal layering
- `p-4` - Padding (1rem / 16px on all sides)
- `max-w-6xl` - Maximum width constraint (72rem / 1152px)
- `mx-auto` - Horizontal centering

## Dependencies

**Task Dependencies:**
- `ui-viewport-meta-001` - Viewport meta tag configuration (prevents mobile scroll issues)

**No Blocking Dependencies:**
This task can be implemented immediately as it's a simple CSS class change with no external dependencies.

## Risk Assessment

**Low Risk:**
- Simple class removal with no logic changes
- Well-understood CSS layout issue
- No breaking changes to component API
- Easy to test and verify
- Quick to rollback if needed

## Implementation Notes

### Before Change
```tsx
// Line 100: src/components/session-replay/index.tsx
<div className="min-h-screen p-4">
```

### After Change
```tsx
// Line 100: src/components/session-replay/index.tsx
<div className="p-4">
```

This is a one-line fix that eliminates the scroll trap by removing the `min-h-screen` utility class.
