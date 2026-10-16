# Spec for logout-button

branch: claude/feature/logout-button
figma_component: Logout Button (node-id=57-18)

## Summary

Add logout functionality to the Navbar component. A logout button should appear in the navbar when a user is authenticated, allowing them to sign out of the application. The button should be visually distinct and positioned appropriately within the navbar layout.

## Functional Requirements

- Add a logout button to the Navbar component that is only visible when a user is logged in
- The button should call Firebase Authentication's sign out method when clicked
- The button should use the existing authentication state from the `AuthProvider`/`useUser` hook
- The button should follow the existing design system (button styling, colors, spacing)
- No redirects are required at this stage - the authentication state change will be handled by the existing `AuthProvider`

## Figma Design Reference

- File: [Page Designs](https://www.figma.com/design/uIo2S2lzu1PcYaOmHCCmOn/ClaudeCodeMasterClass?node-id=57-18&t=y7AtSNdn7XU3RyeX-4)
- Component name: Logout Button
- Key visual constraints:
  - Button displays "Logout" text
  - Dark background with rounded corners (consistent with existing button styles)
  - Minimal, clean design matching navbar aesthetic
  - Button should be positioned in the navbar, likely near the user avatar
  - Uses the existing color palette (dark background, light text)

## Possible Edge Cases

- User clicks logout button multiple times rapidly
- User is already signed out when clicking logout button (should handle gracefully)
- Firebase sign out fails due to network issues
- Component should handle loading/disabled state during sign out process

## Acceptance Criteria

- Logout button appears in the Navbar only when user is authenticated
- Logout button is hidden when user is not authenticated
- Clicking the logout button successfully signs the user out via Firebase Authentication
- The button styling matches the Figma design and existing design system
- No console errors or warnings during the sign out process
- Button has appropriate hover/active states for better UX

## Open Questions

- Should there be a confirmation dialog before logging out? No.
- Should the button show a loading state during the sign out process? No.
- Exact positioning in the navbar (left of avatar, right of avatar, or in a dropdown menu)? It should be just left of the Create button.

## Testing Guidelines

Create a test file in the ./tests folder for the logout button functionality, and create meaningful tests for the following cases, without going too heavy:

- Logout button is visible when user is authenticated
- Logout button is not visible when user is not authenticated
- Clicking logout button calls Firebase `signOut` method
- Button has correct styling and text content
- Button handles click events properly
