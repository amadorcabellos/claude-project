# Implementation Plan: Heist Card Component

## Overview

Create HeistCard and HeistCardSkeleton components to display active and assigned heists in a responsive 3-column grid on the `/heists` page. Cards show heist details with clickable titles linking to `/heists/[id]`. Only the title is clickable (not the entire card).

## Component Requirements

### HeistCard

- Display heist title (clickable `Link` to `/heists/[id]`)
- Show "To: [assignedToCodename]" with User icon (purple color)
- Show "By: [createdByCodename]" with Users icon (pink color)
- Display deadline status (overdue in red, normal in gray)
- Show timestamp with Calendar icon
- Clock icon in top-right corner
- Hover states on title and card
- Background: `--color-light` (#0A101D), rounded corners (12-16px)
- Min height: 178px

### HeistCardSkeleton

- Match HeistCard dimensions and layout
- Show 3 skeleton cards in grid during loading
- Use pulse animation (from existing Skeleton pattern)

## Files to Create

### 1. HeistCard Component

**Path:** `components/HeistCard/HeistCard.tsx`

Key implementation details:

- Import: `Link` from `next/link`, icons (`Clock`, `User`, `Users`, `Calendar`) from `lucide-react`
- Props: `{ heist: Heist }` (use `Heist` type from `@/types/firestore/heist`)
- Calculate overdue status: `const isOverdue = new Date() > heist.deadline`
- Format deadline: Show "Overdue" or time remaining (e.g., "5 hours left", "2 days left")
- Format timestamp: Use `toLocaleDateString()` for date display
- Structure:
  - Header: Title (`Link` component) + Clock icon (top-right)
  - Assignee: "To:" label + `assignedToCodename` (purple) with User icon
  - Creator: "By:" label + `createdByCodename` (pink) with Users icon
  - Deadline status with conditional styling
  - Timestamp with Calendar icon

Helper functions to include:

```typescript
function formatDeadline(deadline: Date): { text: string; isOverdue: boolean }
function formatTimestamp(date: Date): string
```

### 2. HeistCard Styles

**Path:** `components/HeistCard/HeistCard.module.css`

Key CSS classes:

- `.card` — Base styling with `bg-light`, rounded corners, padding, min-height 178px
- `.card:hover` — Border and shadow for elevation effect
- `.cardHeader` — Flex row with space-between for title and clock icon
- `.title` — White text, `font-semibold`, no underline; hover underline with primary color
- `.clockIcon` — Body color for clock icon
- `.assigneeRow` — Flex row with gap for icon + text
- `.usernamePrimary` — Purple color (`--color-primary`)
- `.usernameSecondary` — Pink color (`--color-secondary`)
- `.deadlineOverdue` — Error color (`--color-error`)
- `.deadlineNormal` — Body color
- `.timestamp` — Flex row with Calendar icon

Use `@reference "../../app/globals.css";` to access theme variables.

### 3. HeistCardSkeleton Component

**Path:** `components/HeistCard/HeistCardSkeleton.tsx`

Structure:

- Same card container as HeistCard
- 4-5 skeleton lines with varying widths (75%, 60%, 55%, 40%, 50%)
- Use `bg-lighter` for skeleton elements
- Apply pulse animation (same as existing Skeleton component)

Add pulse animation in CSS module:

```css
@keyframes pulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}
```

### 4. Barrel Export

**Path:** `components/HeistCard/index.ts`

```typescript
export { default } from "./HeistCard"
export { default as HeistCardSkeleton } from "./HeistCardSkeleton"
```

### 5. Page Styles (Grid Layout)

**Path:** `app/(dashboard)/heists/page.module.css`

Grid configuration:

- Default: 3 columns with `gap-6`
- Tablet (max-width 1024px): 2 columns
- Mobile (max-width 640px): 1 column

Additional styles:

- `.emptyState` — Centered text with body color
- `.errorMessage` — Error color

Use `@reference "../../globals.css";` for theme variables.

## Files to Modify

### 6. Update Heists Page

**Path:** `app/(dashboard)/heists/page.tsx`

Changes:

1. Add imports:

   ```typescript
   import HeistCard, { HeistCardSkeleton } from "@/components/HeistCard"
   import styles from "./page.module.css"
   ```

2. Replace "Your Active Heists" section:
   - Loading: Show 3 HeistCardSkeleton components in grid
   - Error: Show error message
   - Empty: Show "No active heists assigned to you" message
   - Data: Map active heists to HeistCard components in grid

3. Replace "Heists You've Assigned" section:
   - Same structure as active section
   - Empty message: "No heists you've assigned"
   - Data: Map assigned heists to HeistCard components in grid

4. Keep "All Expired Heists" section unchanged (per spec requirement to exclude expired from cards)

## Implementation Sequence

1. Create `HeistCard.tsx` with component structure, props interface, helper functions
2. Create `HeistCard.module.css` with all styling classes
3. Create `HeistCardSkeleton.tsx` with skeleton structure
4. Create `index.ts` barrel export
5. Create `page.module.css` with responsive grid
6. Update `page.tsx` to use HeistCard components in grid layout for active and assigned sections
7. Test in browser at all breakpoints (desktop, tablet, mobile)

## Key Implementation Notes

**Date Formatting:**

- Overdue: `new Date() > deadline`
- Time remaining: Calculate hours/days difference, format as "x hours left" or "x days left"
- Timestamp: Use `toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })`

**Icon Sizing:**

- Clock: 20px (top-right)
- User/Users: 16px (inline with text)
- Calendar: 16px (inline with text)

**Color Mapping:**

- `assignedToCodename` → `--color-primary` (purple)
- `createdByCodename` → `--color-secondary` (pink)
- Overdue status → `--color-error` (red)
- Normal deadline → `--color-body` (gray)

**Grid Behavior:**

- Desktop: `grid-template-columns: repeat(3, 1fr)`
- Tablet: `grid-template-columns: repeat(2, 1fr)` at max-width 1024px
- Mobile: `grid-template-columns: 1fr` at max-width 640px

**Edge Cases:**

- Long titles: Use CSS with reasonable max-width (card is ~378px)
- Empty sections: Show descriptive empty state messages
- Loading: Show exactly 3 skeleton cards in grid (one row)

## Verification Steps

1. **Component Creation:**
   - Verify HeistCard folder exists with 4 files (`HeistCard.tsx`, `HeistCard.module.css`, `HeistCardSkeleton.tsx`, `index.ts`)
   - Verify `page.module.css` exists in heists folder

2. **Visual Testing:**
   - Navigate to `/heists` page while logged in
   - Verify active heists show in 3-column grid with styled cards
   - Verify assigned heists show in 3-column grid
   - Verify expired heists remain as simple list (unchanged)
   - Check responsive behavior: resize browser to test 2-column and 1-column layouts

3. **Interaction Testing:**
   - Hover over card title - should underline and change color
   - Click card title - should navigate to `/heists/[id]`
   - Verify clicking elsewhere on card does NOT navigate
   - Check that overdue heists display red "Overdue" text

4. **Loading State:**
   - Refresh page and verify 3 skeleton cards appear in grid
   - Verify skeletons have pulse animation

5. **Empty State:**
   - If no active heists, verify empty message displays
   - If no assigned heists, verify empty message displays

6. **Data Validation:**
   - Verify usernames display in correct colors (assignedTo in purple, createdBy in pink)
   - Verify all icons render correctly (Clock, User, Users, Calendar)
   - Verify deadline calculations are correct
   - Verify timestamp formatting is readable

7. **Browser Testing:**
   - Test at desktop width (>1024px) - 3 columns
   - Test at tablet width (640-1024px) - 2 columns
   - Test at mobile width (<640px) - 1 column
