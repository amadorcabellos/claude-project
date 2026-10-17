# Spec for Use Heists Hook

branch: claude/feature/use-heists-hook

## Summary

Create a custom React hook `useHeists` that provides real-time access to heist data from the Firestore collection. The hook accepts a filter argument to determine which heists to retrieve based on the current user's relationship to the heists and their deadline status. Once created, integrate the hook into the Heists page to display titles from three different result sets: active heists assigned to the user, heists assigned by the user, and expired heists.

## Functional Requirements

- Create a custom hook `useHeists` in the `hooks/` directory
- Hook accepts a single argument: `"active" | "assigned" | "expired"`
- Hook returns an array of `Heist` objects matching the filter criteria
- Hook uses real-time Firestore listeners (not one-time queries)
- Filter logic:
  - `"active"`: All heists where `assignedTo` matches current user ID AND deadline has not passed
  - `"assigned"`: All heists where `createdBy` matches current user ID AND deadline has not passed
  - `"expired"`: All heists where deadline has passed AND `finalStatus` is NOT null (regardless of user)
- Hook should handle loading and error states
- Update the Heists page (`app/(dashboard)/heists/page.tsx`) to use the hook three times with different filter arguments
- Display only the titles of heists in each section on the Heists page

## Possible Edge Cases

- User is not authenticated when hook is called
- Firestore collection does not exist or is empty
- Current user has no heists matching the filter criteria
- Deadline dates are stored in inconsistent formats
- Network interruption during real-time listener subscription
- Component unmounts before Firestore listener is established
- Multiple rapid filter changes before previous queries complete
- Timezone differences affecting deadline comparison

## Acceptance Criteria

- Hook successfully establishes real-time Firestore listeners based on filter argument
- Correct heists are returned for each filter type (`"active"`, `"assigned"`, `"expired"`)
- Heists page displays three separate sections with heist titles from each filter
- Loading states are handled gracefully (empty arrays or loading indicators)
- Real-time updates are reflected in the UI when heist data changes in Firestore
- Hook properly cleans up Firestore listeners on unmount or filter change
- No memory leaks from unclosed listeners
- Hook works correctly when user authentication state is available

## Open Questions

- Should the hook handle authentication state internally or assume the user is authenticated?
- Should there be a maximum limit on the number of heists returned per query?
- How should loading and error states be exposed from the hook (separate return values, or embedded in the array)?
- Should the hook support pagination for large result sets?
- Should expired heists be sorted in any particular order (e.g., most recent first)?

## Testing Guidelines

Create a test file(s) in the `/tests` folder for the new feature, and create meaningful tests for the following cases, without going too heavy:

- Hook returns correct heists for `"active"` filter (assigned to current user, deadline not passed)
- Hook returns correct heists for `"assigned"` filter (created by current user, deadline not passed)
- Hook returns correct heists for `"expired"` filter (deadline passed, `finalStatus` not null)
- Hook returns empty array when no heists match the filter criteria
- Hook properly cleans up Firestore listener on unmount
- Hook updates returned data when Firestore data changes in real-time
- Heists page renders three sections with correct titles from each filter
