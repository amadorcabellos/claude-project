# Implementation Plan: useHeists Hook

## Overview

Create a custom React hook `useHeists` that provides real-time access to heist data from Firestore with filtering capabilities. Integrate the hook into the Heists page to display three categories of heists.

## Architecture Decisions

**Hook Location**: Create new `lib/hooks/` directory

- Rationale: Data-fetching hooks are separate from auth-focused code
- Follows domain-specific organization pattern established by `lib/auth/`
- Scalable for future hooks (`useProfile`, `useNotifications`, etc.)

**Return Pattern**: `{ heists, loading, error }` object

- Matches existing `useUser()` pattern
- Separate return values as specified in requirements

**Real-time Listeners**: Use Firestore `onSnapshot()`

- No existing real-time listener implementations in codebase yet
- Requires proper cleanup with unsubscribe function

## Critical Files

1. `lib/hooks/useHeists.ts` - Main hook implementation
2. `lib/hooks/types.ts` - TypeScript interfaces
3. `lib/hooks/index.ts` - Barrel export
4. `app/(dashboard)/heists/page.tsx` - Integration point (convert to client component)

## Implementation Steps

### Phase 1: Setup Hook Infrastructure

**1.1** Create `lib/hooks/` directory

**1.2** Create `lib/hooks/types.ts`:

```typescript
import { Heist } from "@/types/firestore/heist"

export type HeistFilter = "active" | "assigned" | "expired"

export interface UseHeistsReturn {
  heists: Heist[]
  loading: boolean
  error: string | null
}
```

**1.3** Create `lib/hooks/index.ts`:

```typescript
export { useHeists } from "./useHeists"
export type { HeistFilter, UseHeistsReturn } from "./types"
```

### Phase 2: Core Hook Implementation

**2.1** Create `lib/hooks/useHeists.ts` with imports:

- `useState`, `useEffect` from `react`
- `collection`, `query`, `where`, `orderBy`, `onSnapshot` from `firebase/firestore`
- `db` from `@/lib/firebase`
- `useUser` from `@/lib/auth`
- `heistConverter` from `@/types/firestore/heist`
- `COLLECTIONS` from `@/types/firestore`
- `HeistFilter`, `UseHeistsReturn` from `./types`

**2.2** Define hook signature:

```typescript
export function useHeists(filter: HeistFilter): UseHeistsReturn
```

**2.3** Initialize state:

```typescript
const { user } = useUser()
const [heists, setHeists] = useState<Heist[]>([])
const [loading, setLoading] = useState(true)
const [error, setError] = useState<string | null>(null)
```

**2.4** Create query builder helper function inside hook:

```typescript
const buildQuery = (filter: HeistFilter, userId: string) => {
  const baseCollection = collection(db, COLLECTIONS.HEISTS)

  switch (filter) {
    case "active":
      return query(
        baseCollection,
        where("assignedTo", "==", userId),
        where("deadline", ">", new Date()),
      ).withConverter(heistConverter)

    case "assigned":
      return query(
        baseCollection,
        where("createdBy", "==", userId),
        where("deadline", ">", new Date()),
      ).withConverter(heistConverter)

    case "expired":
      return query(
        baseCollection,
        where("deadline", "<", new Date()),
        where("finalStatus", "!=", null),
        orderBy("finalStatus"), // Required when using != operator
        orderBy("deadline", "desc"), // Most recent first
      ).withConverter(heistConverter)

    default:
      throw new Error(`Invalid filter: ${filter}`)
  }
}
```

**2.5** Implement `useEffect` with real-time listener:

```typescript
useEffect(() => {
  // Guard: no user, no query
  if (!user) {
    setHeists([])
    setLoading(false)
    return
  }

  setLoading(true)
  setError(null)

  // Build query based on filter
  const q = buildQuery(filter, user.uid)

  // Attach real-time listener
  const unsubscribe = onSnapshot(
    q,
    (snapshot) => {
      // the query already has heistConverter attached, so data() returns a Heist
      const heistsList = snapshot.docs.map((doc) => doc.data())
      setHeists(heistsList)
      setLoading(false)
    },
    (err) => {
      console.error("Heists listener error:", err)
      setError("Failed to load heists")
      setLoading(false)
    },
  )

  // Cleanup listener on unmount or dependency change
  return () => unsubscribe()
}, [filter, user?.uid])
```

**2.6** Return hook values:

```typescript
return { heists, loading, error }
```

### Phase 3: Integrate Hook into Heists Page

**3.1** Update `app/(dashboard)/heists/page.tsx` - add client directive at top:

```typescript
"use client"
```

**3.2** Add imports:

```typescript
import { useHeists } from "@/lib/hooks"
```

**3.3** Call hook three times with different filters:

```typescript
export default function HeistsPage() {
  const { heists: activeHeists, loading: activeLoading, error: activeError } = useHeists("active")
  const { heists: assignedHeists, loading: assignedLoading, error: assignedError } = useHeists("assigned")
  const { heists: expiredHeists, loading: expiredLoading, error: expiredError } = useHeists("expired")
  // ...
}
```

**3.4** Render heist titles for each section:

- Show loading state while data fetches
- Display error messages if present
- Show empty state when no heists found
- Map heist titles for each category

Example structure:

```tsx
<div className="active-heists">
  <h2>Your Active Heists</h2>
  {activeLoading && <p>Loading...</p>}
  {activeError && <p>Error: {activeError}</p>}
  {!activeLoading && !activeError && activeHeists.length === 0 && (
    <p>No active heists</p>
  )}
  {!activeLoading &&
    !activeError &&
    activeHeists.map((heist) => <div key={heist.id}>{heist.title}</div>)}
</div>
```

Repeat pattern for assigned and expired sections.

## Important Considerations

**Firestore Composite Index**: The expired heists query requires a composite index:

- Fields: `finalStatus` (Ascending), `deadline` (Descending)
- Firebase Console will auto-prompt with index creation link on first query
- Index creation takes 1-5 minutes

**Performance**: Three simultaneous listeners is acceptable:

- Each query returns small, filtered result sets
- Real-time updates provide valuable UX
- Firestore optimizes multiple listeners efficiently

**Date Comparison**: Query uses `new Date()` for deadline comparison

- Firestore Timestamps are converted to Date objects by `heistConverter`
- Ensure consistent timezone handling

**Cleanup**: `useEffect` returns unsubscribe function to prevent memory leaks

## Verification Plan

### Manual Testing

1. **Start dev server**: `npm run dev`
2. **Navigate to Heists page** (`/heists`) while logged in
3. **Verify loading states**: Check that each section shows loading indicator initially
4. **Verify empty states**: If no data, confirm empty state messages display
5. **Create test heists** (via `/heists/create`):
   - Create heist assigned TO current user with future deadline → should appear in "Active Heists"
   - Create heist assigned BY current user with future deadline → should appear in "Heists You've Assigned"
   - Manually update a heist in Firestore: set deadline to past date and `finalStatus` to `"success"` → should appear in "Expired Heists"
6. **Verify real-time updates**:
   - Open Firestore Console
   - Modify a heist's title
   - Confirm title updates in browser without page refresh
7. **Test filter accuracy**:
   - Verify heists appear in correct sections based on filter criteria
   - Verify expired heists are sorted by most recent first
8. **Test composite index creation**:
   - On first load, expired query may show index error
   - Click Firebase Console link to create index
   - Wait 1-5 minutes for index creation
   - Refresh page and verify expired heists load correctly

### Error Scenarios

9. **Network offline**: Disconnect internet and verify error messages display
10. **No user authenticated**: Logout and verify hook handles gracefully (shouldn't occur due to route protection, but hook should handle it)

### Code Review

11. **Check console**: Verify no errors or warnings in browser console
12. **React DevTools**: Verify no memory leaks (listeners properly cleaned up on unmount)

### Future Testing

13. Create unit tests in `tests/lib/hooks/useHeists.test.tsx`:
    - Mock Firestore `onSnapshot`
    - Test loading states
    - Test error handling
    - Test cleanup (unsubscribe called)
    - Test filter changes

## Expected Behavior

- **Initial load**: Loading indicators for all three sections
- **With data**: Heist titles displayed in appropriate sections
- **Real-time**: Changes in Firestore immediately reflected in UI
- **Empty states**: Clear messaging when no heists match filter
- **Errors**: User-friendly error messages (detailed errors logged to console)
- **Cleanup**: No memory leaks from listeners on page navigation
