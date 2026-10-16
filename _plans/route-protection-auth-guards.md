# Implementation Plan: Route Protection with Auth Guards

## Overview

Implement client-side route protection by adding auth guards to the `(public)` and `(dashboard)` layout files. The guards will use the existing `useUser` hook to check authentication status and redirect users accordingly:

- Public routes → redirect authenticated users to `/heists`
- Dashboard routes → redirect unauthenticated users to `/login`
- Show a full-screen loading spinner with Clock icon while Firebase determines auth status

## Architecture Approach

**Client-Side Guards in Layouts:**

- Leverage existing `useUser` hook that provides `{ user, loading }` from Firebase `onAuthStateChanged`
- Implement guards directly in layout files (single protection point for each route group)
- Use Next.js `redirect()` from `next/navigation` for immediate navigation
- Conditional rendering based on three states:
  1. `loading === true` → Show `LoadingSpinner`
  2. `loading === false` && needs redirect → Redirect via `useEffect`
  3. `loading === false` && authorized → Render children

**Why This Prevents FOUC:**

- `AuthProvider` initializes with `loading: true`
- Loading spinner displays immediately on mount
- Children never render before redirect decision is made

## Implementation Steps

### 1. Create LoadingSpinner Component

**New files:**

- `components/LoadingSpinner/LoadingSpinner.tsx` - Full-screen centered spinner with `Clock8` icon from `lucide-react`
- `components/LoadingSpinner/LoadingSpinner.module.css` - Styles with rotation animation
- `components/LoadingSpinner/index.ts` - Barrel export

**Design:**

- Fixed positioning covering entire viewport
- Purple `Clock8` icon (48px, matching Navbar logo)
- CSS rotation animation (1s linear infinite)
- Dark background (`bg-dark`)
- z-index 9999 to ensure it's on top

### 2. Update Public Layout (`app/(public)/layout.tsx`)

**Changes:**

- Add `"use client"` directive
- Import `useUser`, `redirect`, and `LoadingSpinner`
- Add auth guard logic:
  - Show spinner while `loading === true`
  - Redirect authenticated users to `/heists` via `useEffect`
  - Render children only when `loading === false && user === null`

**Pattern:**

```tsx
const { user, loading } = useUser()

useEffect(() => {
  if (!loading && user) redirect("/heists")
}, [user, loading])

if (loading) return <LoadingSpinner />
if (user) return null // Will redirect via useEffect

return <main className="public">{children}</main>
```

### 3. Update Dashboard Layout (`app/(dashboard)/layout.tsx`)

**Changes:**

- Add `"use client"` directive
- Import `useUser`, `redirect`, and `LoadingSpinner`
- Add auth guard logic (inverse of public layout):
  - Show spinner while `loading === true`
  - Redirect unauthenticated users to `/login` via `useEffect`
  - Render `Navbar` and children only when `loading === false && user !== null`

**Pattern:**

```tsx
const { user, loading } = useUser()

useEffect(() => {
  if (!loading && !user) redirect("/login")
}, [user, loading])

if (loading) return <LoadingSpinner />
if (!user) return null // Will redirect via useEffect

return (
  <>
    <Navbar />
    <main>{children}</main>
  </>
)
```

### 4. Create Tests

**LoadingSpinner tests** (`tests/components/LoadingSpinner.test.tsx`):

- Renders without errors
- Displays Clock icon (SVG)
- Applies correct CSS classes
- Icon has correct size props

**Public layout tests** (`tests/app/public-layout.test.tsx`):

- Shows spinner during loading
- Renders children when unauthenticated
- Redirects authenticated users to `/heists`
- No redirect while loading

**Dashboard layout tests** (`tests/app/dashboard-layout.test.tsx`):

- Shows spinner during loading
- Renders `Navbar` and children when authenticated
- Redirects unauthenticated users to `/login`
- No redirect while loading

## Critical Files

**To Create:**

- `components/LoadingSpinner/LoadingSpinner.tsx`
- `components/LoadingSpinner/LoadingSpinner.module.css`
- `components/LoadingSpinner/index.ts`
- `tests/components/LoadingSpinner.test.tsx`
- `tests/app/public-layout.test.tsx`
- `tests/app/dashboard-layout.test.tsx`

**To Modify:**

- `app/(public)/layout.tsx` - Add auth guard for public routes
- `app/(dashboard)/layout.tsx` - Add auth guard for dashboard routes

**Dependencies (no changes needed):**

- `lib/auth/useUser.ts` - Provides auth state
- `lib/auth/AuthContext.tsx` - Manages Firebase auth
- `components/Navbar/Navbar.tsx` - Used in dashboard layout

## Edge Cases Handled

1. **Auth state changes while on page** - `useEffect` dependency array triggers re-render and redirect
2. **Manual URL navigation to protected route** - Spinner shows first, then redirect after auth determined
3. **Firebase takes longer than expected** - Spinner remains visible (no timeout per spec)
4. **Rapid navigation** - Each layout independently checks auth state, React batching prevents races
5. **User logs out while viewing dashboard** - `onAuthStateChanged` fires, triggers redirect

## Implementation Order

1. `LoadingSpinner` component (no dependencies)
2. `LoadingSpinner` tests (verify component works)
3. Public layout guard (simpler logic)
4. Public layout tests (verify pattern)
5. Dashboard layout guard (same pattern)
6. Dashboard layout tests (complete coverage)

## Verification Steps

### 1. Run Tests

```bash
npm test LoadingSpinner.test.tsx
npm test public-layout.test.tsx
npm test dashboard-layout.test.tsx
```

**Expected:** All tests pass

### 2. Manual Testing (with dev server running)

**Unauthenticated user flow:**

- Navigate to `/` → should see landing page
- Navigate to `/heists` → should see spinner briefly, then redirect to `/login`
- Navigate to `/login` → should see login form

**Authenticated user flow:**

- Log in via `/login` → should see spinner briefly, then redirect to `/heists`
- Navigate to `/heists` → should see heists page with `Navbar`
- Navigate to `/login` → should see spinner briefly, then redirect to `/heists`
- Click logout → should see spinner briefly, then redirect to `/login`

### 3. Visual Checks

- Loading spinner is centered on screen
- Clock icon is purple (primary color)
- Smooth rotation animation
- No flash of content before redirects
- No console errors or warnings
- No hydration mismatches

### 4. Edge Case Testing

- While on `/heists`, open dev tools and clear Firebase auth cache → should redirect to `/login`
- Rapidly click between routes → should handle gracefully without errors
- Slow network simulation → spinner should remain visible longer
