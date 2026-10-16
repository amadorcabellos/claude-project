# Spec for auth-state-management

branch: claude/feature/auth-state-management

## Summary

Implement a global authentication state management solution that provides real-time access to the current user's authentication status throughout the application. This solution will expose a `useUser` hook that returns either the authenticated user object or `null` when logged out. The implementation will include a realtime listener that automatically updates the user state when authentication status changes.

## Functional Requirements

- Create a `useUser` hook that can be called from any page or component
- Hook returns `null` when user is logged out
- Hook returns the user object when user is logged in
- Implement a real-time listener that automatically updates user state when authentication status changes
- Provide the authentication context globally throughout the application using React Context
- Update existing components that currently access user information to use the new `useUser` hook
- Ensure the authentication state persists across page refreshes and navigation

## Possible Edge Cases

- User authentication state changes in another browser tab or window
- Firebase connection is lost or interrupted
- Component mounts before authentication state is initialized
- Rapid authentication state changes (login/logout in quick succession)
- User token expires while app is running
- Hook is called outside of the authentication context provider

## Acceptance Criteria

- The `useUser` hook is available and can be imported from a centralized location
- Calling `useUser()` returns `null` when no user is authenticated
- Calling `useUser()` returns the user object with expected properties when authenticated
- Authentication state updates automatically without requiring page refresh
- All existing components that access user data are updated to use the new hook
- The hook can be used in both client components and page components
- No console errors or warnings related to authentication state management
- Authentication state persists correctly across browser refreshes

## Open Questions

- What specific properties should the user object contain (email, uid, displayName, etc.)? email, uid, displayName
- Should the hook also expose loading state while authentication is being initialized? yes
- Do we need error handling for authentication state errors? not for now
- Should there be a separate hook for checking if user is authenticated (boolean) vs getting user data? no

## Testing Guidelines

Create a test file(s) in the ./tests folder for the new feature, and create meaningful tests for the following cases, without going too heavy:

- Hook returns `null` when user is not authenticated
- Hook returns user object when user is authenticated
- Hook updates automatically when authentication state changes
- Hook throws error or returns appropriate value when used outside provider
- Components using the hook receive updated user state on authentication changes
