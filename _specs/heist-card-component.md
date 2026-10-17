# Spec for Heist Card Component

branch: claude/feature/heist-card-component
figma_component: Heist Card (https://www.figma.com/design/elHzuUQZiJXNqJft57oneh/Page-Designs?node-id=54-60&m=dev)

## Summary

Create a HeistCard component to display active and assigned heists on the `/heists` page. Each card shows heist details including title, assignee information, deadline status, and timestamp. Cards are displayed in a 3-column grid layout with a skeleton loading state. The heist title links to the detail page (`/heists/[id]`) without implementing the detail page content yet.

## Functional Requirements

- Display heist cards in a 3-column grid layout on the `/heists` page
- Filter heists to show only active and assigned heists (exclude expired heists)
- Each card displays:
  - Heist title (clickable link to `/heists/[id]`)
  - Assignee information ("To:" and "By:" with usernames)
  - Deadline status (with visual indicator for overdue heists)
  - Timestamp with calendar icon
  - Clock icon in top-right corner for deadline status
  - Username mentions styled with primary (purple) and secondary (pink) colors
  - Overdue status highlighted in error red color
  - Interactive hover states for card and title
- HeistCardSkeleton component for loading states, maintaining same grid layout

## Figma Design Reference

- File: Page Designs (https://www.figma.com/design/uIo2S2lzu1PcYaOmHCCmOn/ClaudeCodeMasterClass?node-id=54-60&t=2xMCS9Ij87jLaxbr-4)
- Component name: Heist Card
- Key visual constraints:
  - Card dimensions: ~378px wide × 178px tall with internal padding
  - Background: `--color-light` (#0A101D) with rounded corners (12-16px radius)
  - Typography: Title uses h3/h4 style (16-18px white text), labels ~14px
  - Username colors: `--color-primary` (purple #C27AFF) and `--color-secondary` (pink #FB64B6)
  - Status colors: Overdue uses `--color-error` (#FF6467)
  - Icons: Clock (top-right), User/Users (assignee), Calendar (timestamp) from lucide-react
  - Interactive states: Title hover with underline/color shift, card hover with elevation/border highlight

## Possible Edge Cases

- No heists available (empty state handling)
- Loading state during data fetch
- Very long heist titles (text truncation or wrapping)
- Missing assignee information
- Past deadline dates (overdue status calculation)
- Network errors when fetching heist data
- Heist with no assigned user vs no creator
- Responsive behavior on smaller screens (grid column adjustment)

## Acceptance Criteria

- HeistCard component renders with all required information from heist data
- Only active and assigned heists appear in the grid (expired heists filtered out)
- Card title links to `/heists/[id]` route (detail page exists but has no content)
- Grid layout displays 3 columns with appropriate gap spacing
- HeistCardSkeleton component matches card dimensions and layout
- Skeleton shows while heists are loading
- Usernames styled with correct theme colors
- Overdue heists display with error color styling
- All icons render correctly (Clock, User/Users, Calendar)
- Hover states work for card and title elements
- Component follows styling architecture (CSS Modules + global theme)
- Component uses barrel export pattern with `index.ts`

## Open Questions

- Should the grid be responsive (e.g., 2 columns on tablet, 1 on mobile)? Yes.
- How many skeleton cards should display during loading? One row of cards in the grid.
- Should there be an empty state message when no heists exist? Yes.
- What determines if a heist is "assigned" vs "active"? Assigned if created by the user, active if created for the current user.
- Should clicking anywhere on the card navigate to detail page, or only the title? Just the title.

## Testing Guidelines

Create a test file in the ./tests/components/HeistCard folder for the new feature, and create meaningful tests for the following cases, without going too heavy:

- HeistCard renders with complete heist data
- Title link generates correct URL with heist ID
- Usernames render with appropriate color classes
- Overdue status displays with error styling when deadline is past
- Icons render correctly (Clock, User/Users, Calendar)
- HeistCardSkeleton renders with correct structure
- Component applies correct CSS module classes
- Hover states can be tested with user interaction events
