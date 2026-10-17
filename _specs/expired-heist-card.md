# Spec for expired-heist-card

branch: claude/feature/expired-heist-card-01
figma_component (if used): HeistCard — expired / failed variant (node 34:13)

## Summary

Add an Expired Heist Card component and use it in the "All Expired Heists" section of the `/heists` page, which currently shows a plain list of titles. Expired heists are those whose deadline has passed and whose final status is set (success or failure). Each card shows the heist's outcome, title, deadline, assignee and creator. A matching Expired Heist Card Skeleton is shown in the same layout as the cards while expired heists load. The active and assigned sections are not changed.

## Functional Requirements

- Create an `ExpiredHeistCard` component that receives a single expired heist and displays:
  - A status icon before the title: a red "X in a circle" for failed heists, and a green "check in a circle" for successful ones
  - The heist title
  - The deadline as a short date and time (e.g. "Nov 28, 03:30 PM") with a calendar icon
  - A status badge showing the outcome ("FAILED" or "SUCCESS"), coloured to match the outcome
  - "To:" followed by the assignee's codename, prefixed with `@`, with a user icon
  - "By:" followed by the creator's codename, prefixed with `@`, with a user icon
- The heist description and created date are not shown on the card.
- The outcome is conveyed by text (the badge), not by colour or icon alone.
- Create an `ExpiredHeistCardSkeleton` component that:
  - Has the same outer size, surface, border, radius and padding as `ExpiredHeistCard`
  - Shows placeholder shapes for the header (status icon, title, deadline and badge) and the "To:"/"By:" row
  - Pulses while loading (and stops for users who prefer reduced motion)
  - Announces a loading state to assistive technology
- On the `/heists` page, the "All Expired Heists" section:
  - Renders its heists as `ExpiredHeistCard`s
  - Shows `ExpiredHeistCardSkeleton`s in the same layout as the cards while loading, instead of the "Loading..." text
  - Keeps its existing empty-state and error messages
- The active and assigned sections, the existing `HeistCard` and `HeistCardSkeleton`, and the heist details page are not changed.
- The new components follow the project's component conventions (own folder, CSS module, `index.ts` re-export) and use theme tokens and `lucide-react` icons.

## Figma Design Reference (only if referenced)

- File: https://www.figma.com/design/uIo2S2lzu1PcYaOmHCCmOn/ClaudeCodeMasterClass?node-id=34-13
- Component name: HeistCard — expired / failed variant (node 34:13)
- Key visual constraints:
  - Card surface is the `lighter` colour at 30% opacity with a thin 1px translucent border (#1E2939 at 30%, which has no theme token), a 10px corner radius, about 16px padding, and no shadow — visibly more muted than the active card.
  - Two rows, 8px apart. Header: 16px status icon and title on the left (12px apart); deadline (12px calendar icon + text, 6px apart) and the status badge on the right (12px apart). Second row: "To:" and "By:" side by side, 16px apart, each with a 12px user icon.
  - Typography is Inter: title 16px medium in white (-0.3125px letter spacing); deadline, "To:"/"By:" labels and codenames 14px regular (-0.15px letter spacing), labels in the `body` grey; badge text 12px regular, uppercase, +0.6px letter spacing.
  - Assignee codename uses `primary` (purple) and creator codename uses `secondary` (pink); all small icons are `body` grey.
  - Failed badge: `error` red text on a 5% red background with a 20% red border, 4px radius, 8px horizontal padding; the status icon is red too.
  - Only the failed variant is designed; the success variant is assumed to mirror it using the `success` green.
  - The design is drawn as a wide (~771px) single-line row; in a narrower layout the header will need to wrap (e.g. deadline and badge below the title).
  - No hover, focus or skeleton states are designed.

## Possible Edge Cases

- Very long titles in a narrow card: the title must not push the deadline or badge out of the card (wrap or truncate).
- The header row (title + deadline + badge) won't fit on one line in a narrow card; the layout must stay readable when it wraps.
- Long codenames should not break the "To:"/"By:" row.
- A heist with a missing or invalid deadline should not crash the card.
- The expired list is not filtered by user, so it can contain many heists; the section should handle any number of cards.
- A final status value other than "success" or "failure" should not crash the card.
- `.page-content` has a minimum width, so the page may scroll sideways on phone-width screens.

## Acceptance Criteria

- On `/heists`, expired heists are shown as cards matching the Figma design's muted surface, border, radius, typography and icons.
- Each card shows the status icon, title, formatted deadline, status badge, `@assignee` and `@creator`.
- Failed heists show a red "FAILED" badge and red X icon; successful heists show a green "SUCCESS" badge and green check icon.
- While expired heists are loading, `ExpiredHeistCardSkeleton`s matching the expired card's size and layout are shown in the same layout as the cards, and are replaced by real cards once loaded.
- Empty and error states for the expired section still display their existing messages.
- The active and assigned sections look and behave exactly as before.
- No raw hex colours are used in the components except a documented border colour (or a new theme token added for it).
- `npm run lint` and `npx vitest run` pass.

## Open Questions

- What should the success variant look like? Figma only shows "failed"; is mirroring it in green correct?
- At narrow widths, should the deadline and badge wrap under the title, or should long titles be truncated to one line?
- Should a `--color-border` (#1E2939) theme token be added, or the translucent border kept local to the card?
- Should the expired cards use the same grid as the active and assigned sections, or a different layout (e.g. full-width rows, as drawn in Figma)?
- Should expired heists be ordered (e.g. most recent deadline first, as the query already does) or grouped by outcome?

## Testing Guidelines

Create a test file(s) in the ./tests folder for the new feature, and create meaningful tests for the following cases, without going too heavy:

- `ExpiredHeistCard` renders the heist title.
- `ExpiredHeistCard` renders the assignee and creator codenames prefixed with `@`, and the formatted deadline.
- A failed heist shows a "failed" status badge; a successful heist shows a "success" status badge.
- The card does not crash when the deadline is missing.
- `ExpiredHeistCardSkeleton` renders with a loading status for assistive technology.
- The heists page shows `ExpiredHeistCardSkeleton`s while expired heists are loading, and `ExpiredHeistCard`s once loaded (with `useHeists` mocked).
- The heists page still shows the expired section's empty-state and error messages, and leaves the active and assigned sections unchanged.
