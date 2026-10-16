# Implementation Plan: Auth State Management

## Overview

Implement a global authentication state management solution using React Context and Firebase's `onAuthStateChanged` listener. Provides a `useUser` hook accessible from any component with real-time auth state updates.

## Spec Reference

Based on `_specs/auth-state-management.md`

## Architecture

### File Structure

```
lib/auth/
  types.ts         # User interface and AuthContextValue types
  AuthContext.tsx  # React Context provider with Firebase listener
  useUser.ts       # Hook for accessing auth state
  index.ts         # Barrel exports

app/
  providers.tsx    # Client component wrapper for AuthProvider
```

### User Object Shape

```typescript
interface User {
  uid: string
  email: string | null
  displayName: string | null
}

interface AuthContextValue {
  user: User | null
  loading: boolean
}
```

## Implementation Steps

### 1. Create Type Definitions

**File**: `lib/auth/types.ts`

- Define `User` interface with `uid`, `email`, `displayName`
- Define `AuthContextValue` interface with `user` and `loading`
- Export both interfaces

### 2. Create AuthContext Provider

**File**: `lib/auth/AuthContext.tsx`

- Mark as client component with `"use client"` directive
- Import `auth` from `@/lib/firebase/config`
- Import `onAuthStateChanged` from `firebase/auth`
- Create `AuthContext` with `createContext<AuthContextValue | undefined>(undefined)`
- Create `AuthProvider` component that:
  - Initializes state: `user: null`, `loading: true`
  - Uses `useEffect` to set up `onAuthStateChanged` listener
  - Maps Firebase User to our `User` interface (extract `uid`, `email`, `displayName`)
  - Sets `loading: false` after initial auth check
  - Returns cleanup function to unsubscribe listener
  - Provides context value to children

### 3. Create useUser Hook

**File**: `lib/auth/useUser.ts`

- Import `AuthContext`
- Call `useContext(AuthContext)`
- Throw error if context is `undefined`: `"useUser must be used within AuthProvider"`
- Return `{ user, loading }`

### 4. Create Barrel Export

**File**: `lib/auth/index.ts`

- Export `AuthProvider` from `./AuthContext`
- Export `useUser` from `./useUser`
- Export type `User` from `./types`

### 5. Create Providers Wrapper

**File**: `app/providers.tsx`

- Mark as client component with `"use client"` directive
- Import `AuthProvider` from `@/lib/auth`
- Create `Providers` component that wraps children with `<AuthProvider>`
- Export as named export

### 6. Update Root Layout

**File**: `app/layout.tsx`

- Import `Providers` from `./providers`
- Wrap `{children}` with `<Providers>` component inside `<body>` tag
- Keep existing metadata and structure

## Testing Plan

### Test File 1: `tests/lib/auth/useUser.test.tsx`

- Mock `AuthContext` provider with controlled values
- Test: Returns `null` when user is not authenticated
- Test: Returns user object when user is authenticated
- Test: Returns loading state during initialization
- Test: Throws error when used outside `AuthProvider`

### Test File 2: `tests/lib/auth/AuthContext.test.tsx`

- Mock `firebase/auth` module and control `onAuthStateChanged`
- Test: Provider renders children successfully
- Test: Initial loading state is `true`
- Test: Loading state becomes `false` after Firebase initializes
- Test: User state updates when Firebase auth state changes

## Edge Cases Handled

| Edge Case | Solution |
| --- | --- |
| Component mounts before auth initialized | `loading: true` initial state + skeleton UI |
| Hook used outside provider | Throw descriptive error |
| User token expires | Firebase handles automatically, triggers listener |
| Auth state changes in another tab | Firebase syncs across tabs automatically |
| Rapid login/logout | React batches state updates |
| User has no displayName or email | Fallback chain to `'User'` string |

## Critical Files

- `lib/auth/AuthContext.tsx` - Core Firebase listener and Context provider
- `lib/auth/useUser.ts` - Public hook API
- `app/layout.tsx` - Must wrap children with provider
- `app/providers.tsx` - Client boundary for Next.js 16

## Verification Steps

1. **Manual Testing**:
   - Start dev server with `npm run dev`
   - Navigate to dashboard routes (e.g., `/heists`)
   - Open browser dev tools and manually trigger auth state (using Firebase console or manual login later)
   - Verify no console errors

2. **Automated Testing**:
   - Run `npm test` to execute all test suites
   - Verify all new tests pass
   - Check that existing component tests still pass

3. **Hook Validation**:
   - Try using `useUser()` in a test component
   - Verify it returns `{ user: null, loading: false }` when not authenticated
   - Verify error is thrown when used outside provider

## Out of Scope

Per spec, these are explicitly NOT included:

- Login/signup/logout flow implementation
- Firebase auth integration in `LoginForm`/`SignupForm`
- Logout button or user menu
- Do not use the hook anywhere in the application yet