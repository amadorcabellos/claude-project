# Implementation Plan: Expired Heist Card

## Overview

Create `ExpiredHeistCard` and `ExpiredHeistCardSkeleton` components and use them in the "All Expired Heists" section of the `/heists` page, replacing the plain list of titles. Expired cards are display-only: the title is plain text, not a link. Skeletons sit in the same layout as the cards while expired heists load. The active and assigned sections, `HeistCard`, `HeistCardSkeleton` and the details page are not changed.

Spec: `_specs/expired-heist-card.md`
Figma: https://www.figma.com/design/uIo2S2lzu1PcYaOmHCCmOn/ClaudeCodeMasterClass?node-id=34-13

## Decisions on the Spec's Open Questions

These are the defaults this plan uses; change them here before implementing if you disagree.

- **Success variant**: mirror the failed design in green (`--color-success`) with a `CircleCheck` icon and a "SUCCESS" badge.
- **Narrow layout**: let the header wrap — status icon and title first, deadline and badge wrap underneath when there isn't room. Titles wrap rather than truncate, so they're never cut off.
- **Border colour**: keep `#1E2939` at 30% local to the card's CSS module (documented in a comment); no new theme token.
- **Layout**: use the same responsive grid as the active and assigned sections (`.grid` in `page.module.css`: 3 / 2 / 1 columns), so the page stays consistent. Figma's full-width row is treated as a component drawing, not a page layout.
- **Ordering**: keep the query's order (most recent deadline first); no grouping by outcome.

## Component Requirements

### ExpiredHeistCard

- Status icon before the title: `CircleX` (red, `--color-error`) for `"failure"`, `CircleCheck` (green, `--color-success`) for `"success"`
- Title as plain text in an `h3` (no link, no hover or focus styles)
- Deadline with a `Calendar` icon, formatted like "Nov 28, 03:30 PM"
- Status badge: "FAILED" or "SUCCESS", coloured to match the outcome
- "To: @assignedToCodename" (purple) and "By: @createdByCodename" (pink), each with a `User` icon, side by side
- Muted surface: `--color-lighter` at 30% opacity, 1px translucent border, 10px radius, ~16px padding, no shadow
- Does not show `description` or `createdAt`
- Handles a missing/invalid deadline (deadline omitted) and an unknown `finalStatus` (no icon or badge, no crash)

### ExpiredHeistCardSkeleton

- Same outer size, surface, border, radius and padding as `ExpiredHeistCard` (reuses its `.card` class)
- Header placeholders: a 16px circle (status icon) and a title bar on the left; a deadline bar and a badge-shaped block on the right
- Second-row placeholders: two short bars side by side ("To:" and "By:")
- Block heights match the card's line heights (24px title, 20px text, ~22px badge) so swapping in real cards doesn't shift the page
- Pulse animation, disabled under `prefers-reduced-motion`
- `role="status"`, `aria-busy="true"` and visually hidden "Loading..." text, like the existing skeletons

## Files to Create

### 1. ExpiredHeistCard Component

**Path:** `components/ExpiredHeistCard/ExpiredHeistCard.tsx`

- Import `Calendar`, `CircleCheck`, `CircleX`, `User` (and the `LucideIcon` type) from `lucide-react`
- Props: `{ heist: Heist }` (use the `Heist` and `HeistFinalStatus` types from `@/types/firestore/heist`)
- A status config keyed on `finalStatus` (`"success"` / `"failure"`) holding the label, icon and CSS classes, so the markup only does a lookup
- Format the deadline with `toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })`, matching `HeistCard`
- Structure:
  - `article` card
  - Header: status icon + `h3` title on the left; deadline + badge on the right
  - Meta row: "To:" and "By:" items side by side
- Icons are decorative (lucide hides them from screen readers by default); the badge text carries the outcome
- Not a client component — no state or effects

### 2. ExpiredHeistCardSkeleton Component

**Path:** `components/ExpiredHeistCard/ExpiredHeistCardSkeleton.tsx`

- Uses `.card` plus the layout classes (`.header`, `.titleGroup`, `.aside`, `.meta`) from `ExpiredHeistCard.module.css`, so skeleton and card can't drift apart
- Placeholder blocks inside that structure
- `data-testid="expired-heist-card-skeleton"` so page tests can tell it apart from `HeistCardSkeleton`
- Not a client component

### 3. Shared Styles

**Path:** `components/ExpiredHeistCard/ExpiredHeistCard.module.css`

Starts with `@reference "../../app/globals.css";`. Key classes:

- `.card` — flex column, 8px gap, 16px padding, `bg-lighter/30`, 1px border `rgb(30 41 57 / 0.3)` (commented: no theme token), 10px radius
- `.header` — flex row, `flex-wrap`, `justify-between`, 12px column gap
- `.titleGroup` — flex row, 12px gap, `min-w-0`
- `.titleHeading` — 16px medium, 24px line height, heading colour, -0.3125px letter spacing, wraps long words
- `.statusIcon` — shrink-0, nudged down to align with the first text line
- `.failure` / `.success` — `text-error` / `text-success`
- `.aside` — flex row, 12px gap, deadline + badge
- `.deadline` — flex row, 6px gap, 14px `text-body`, -0.15px letter spacing
- `.icon` — shrink-0
- `.badge` — 12px regular uppercase, +0.6px letter spacing, 4px radius, 8px horizontal padding, 1px border
- `.badgeFailure` — `bg-error/5`, `border-error/20`, `text-error`
- `.badgeSuccess` — `bg-success/5`, `border-success/20`, `text-success`
- `.meta` — flex row, 16px gap, wraps
- `.metaItem` — flex row, 6px gap, 14px `text-body`, -0.15px letter spacing
- `.usernamePrimary` / `.usernameSecondary` — `text-primary` / `text-secondary`
- Skeleton: `.skeleton` (`animate-pulse`, `motion-reduce:animate-none`), `.skeletonIcon`, `.skeletonTitle`, `.skeletonDeadline`, `.skeletonBadge`, `.skeletonMeta` — rounded `bg-lighter` blocks

### 4. Barrel Export

**Path:** `components/ExpiredHeistCard/index.ts`

```typescript
export { default } from "./ExpiredHeistCard"
export { default as ExpiredHeistCardSkeleton } from "./ExpiredHeistCardSkeleton"
```

## Files to Modify

### 5. Update Heists Page

**Path:** `app/(dashboard)/heists/page.tsx`

1. Import `ExpiredHeistCard` and `ExpiredHeistCardSkeleton` from `@/components/ExpiredHeistCard`.
2. Replace the section's `variant: "cards" | "list"` prop with two component props: `Card` (renders one heist) and `Skeleton` (shown while loading). All three sections then share the same grid, loading, empty and error handling.
3. Remove the plain `<ul>` list and the "Loading..." text, which no section uses any more.
4. Active and assigned sections: `Card={HeistCard}`, `Skeleton={HeistCardSkeleton}`. Expired section: `Card={ExpiredHeistCard}`, `Skeleton={ExpiredHeistCardSkeleton}`. Keep each section's title, empty message and error handling.

No changes to `page.module.css` — the expired section reuses `.grid`, `.emptyState` and `.errorMessage`.

## Tests

Write the tests first (TDD, per the project's `/component` convention).

### 6. ExpiredHeistCard Tests

**Path:** `tests/components/ExpiredHeistCard.test.tsx`

- Shows the title as a heading, with no link in the card
- Shows `@assignedToCodename` and `@createdByCodename`
- Shows the formatted deadline (no fake timers needed — the date is fixed)
- `finalStatus: "failure"` shows "failed" badge text (case-insensitive)
- `finalStatus: "success"` shows "success" badge text
- Missing deadline doesn't crash and still renders the title
- `ExpiredHeistCardSkeleton` renders a `role="status"` element with `aria-busy="true"` and "Loading..." text

### 7. Update Heists Page Tests

**Path:** `tests/app/heists-page.test.tsx`

- Expired heists render as cards: the title shows as a heading and the expired section has no links (active and assigned titles still link to `/heists/<id>`)
- While expired heists load, the expired section shows 3 `expired-heist-card-skeleton`s, and the active section doesn't use them
- The expired section's empty message ("No expired heists") and error message still show
- Active and assigned assertions stay as they are, except the old "Loading..." text check, which becomes a skeleton check

## Implementation Sequence

1. Write `tests/components/ExpiredHeistCard.test.tsx` (card and skeleton) and confirm it fails
2. Create `ExpiredHeistCard.tsx`, `ExpiredHeistCardSkeleton.tsx`, `ExpiredHeistCard.module.css` and `index.ts` until the tests pass
3. Update `tests/app/heists-page.test.tsx` for the expired section and confirm the new assertions fail
4. Update `app/(dashboard)/heists/page.tsx` until the page tests pass
5. Run `npx vitest run`, `npm run lint`, `npx tsc --noEmit` and `npm run build`
6. Check `/heists` in the browser at desktop, tablet and mobile widths

## Key Implementation Notes

**Status mapping:**

| `finalStatus` | Icon | Badge | Colour |
|---|---|---|---|
| `"failure"` | `CircleX` | FAILED | `--color-error` |
| `"success"` | `CircleCheck` | SUCCESS | `--color-success` |

**Icon sizing:**

- Status icon: 16px
- Calendar and User icons: 12px, `body` grey

**Differences from the active `HeistCard`:**

- Translucent `lighter` background with a border, instead of solid `light`
- 10px radius instead of 12px
- Status icon instead of the Clock icon
- Title is plain text, not a link
- Deadline sits in the header next to the badge, instead of its own row
- "To:" and "By:" share one row
- No "time left" text — the badge shows the outcome instead

## Verification Steps

1. **Components:** `components/ExpiredHeistCard/` has `ExpiredHeistCard.tsx`, `ExpiredHeistCardSkeleton.tsx`, `ExpiredHeistCard.module.css` and `index.ts`.
2. **Visual:** on `/heists`, expired heists show as muted cards in the 3/2/1-column grid; active and assigned sections look unchanged.
3. **Outcomes:** failed heists show a red X and "FAILED"; successful ones a green check and "SUCCESS".
4. **Interaction:** expired cards have nothing clickable and Tab skips them; active and assigned titles still link to `/heists/[id]`.
5. **Loading:** on refresh, the expired section shows 3 pulsing expired-card skeletons (muted, two rows, same height as the real cards) before the real cards; active and assigned still show `HeistCardSkeleton`s.
6. **Empty/error:** with no expired heists, "No expired heists" shows; on a load error, the error message shows.
7. **Narrow widths:** at 2 columns and below, the deadline and badge wrap under the title without overflowing the card.
