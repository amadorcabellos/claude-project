# Spec for Route Protection with Auth Guards

branch: claude/feature/route-protection-auth-guards

## Summary

Protect routes based on authentication status: pages in the `(public)` route group are only accessible to unauthenticated users, and pages in the `(dashboard)` route group are only accessible to authenticated users.

Use the existing `useUser` hook to determine authentication status and conditionally redirect users to the appropriate pages. Display a simple loading state in the group layouts while Firebase authentication status is being determined.

## Functional Requirements

- Pages in the `(public)` route group (`/`, `/login`, `/signup`) should redirect authenticated users to `/heists`
- Pages in the `(dashboard)` route group (`/heists`, `/heists/create`, `/heists/[id]`) should redirect unauthenticated users to `/login`
- Show a simple loading indicator in both `(public)` and `(dashboard)` layouts while the `useUser` hook is determining authentication status (when `loading` is true)
- The loading indicator should be displayed before any redirects occur
- Redirects should happen automatically without user interaction
- Use Next.js `useRouter` or `redirect` for navigation
- The `useUser` hook provides both `user` (the authenticated user object or `null`) and `loading` (boolean) states

## Possible Edge Cases

- User authentication state changes while on a page (e.g., token expires, user logs out in another tab)
- User manually navigates to a protected route via URL
- Firebase takes longer than expected to determine auth status
- User rapidly navigates between routes while auth is loading
- SSR/hydration considerations with client-side auth checks

## Acceptance Criteria

- Authenticated users cannot access `/`, `/login`, or `/signup` and are redirected to `/heists`
- Unauthenticated users cannot access `/heists`, `/heists/create`, or `/heists/[id]` and are redirected to `/login`
- A loading indicator is visible in both route groups while `loading` is true from the `useUser` hook
- No flash of incorrect content (FOUC) before redirects occur
- Loading states are simple and consistent across both layouts
- The app remains responsive during auth checks
- Redirects preserve the intended destination (e.g., attempting to access `/heists/create` while logged out should redirect to `/login`, and after login could redirect back to `/heists/create`)

## Open Questions

- Should we preserve the intended destination URL and redirect back after authentication? No.
- What should the loading indicator look like (spinner, skeleton, simple text)? Spinner, using the clock icon from the title.
- Should there be a timeout for the loading state if Firebase takes too long? No.

## Testing Guidelines

Create test files in the ./tests folder for the route protection functionality, covering the following cases:

- Authenticated user accessing public routes (should redirect to `/heists`)
- Unauthenticated user accessing dashboard routes (should redirect to `/login`)
- Loading state is displayed while `loading` is true
- No redirects occur while authentication status is loading
- Redirects work correctly after authentication state is determined
