# Implementation Plan: Logout Button in Navbar

## Overview

Add a logout button to the Navbar component that appears only when a user is authenticated, positioned to the left of the "Create New Heist" button. The button will call Firebase's `signOut` function and rely on the existing `AuthProvider` to handle state updates automatically.

## Spec Reference

Based on `_specs/logout-button.md`

## Critical Files

### Files to Modify

1. `components/Navbar/Navbar.tsx` - Add logout button with conditional rendering
2. `tests/components/Navbar.test.tsx` - Add tests for logout functionality

### Reference Files

- `lib/auth/useUser.ts` - Hook returning `{ user, loading }`
- `lib/firebase/config.ts` - Firebase auth instance
- `app/globals.css` - `.btn` class styling reference
- `components/SignupForm/SignupForm.tsx` - Firebase auth pattern reference

## Implementation Steps

### 1. Update Navbar Component

**File:** `components/Navbar/Navbar.tsx`

**Add "use client" directive at top:**

```typescript
"use client"
```

**Add imports:**

```typescript
import { LogOut } from "lucide-react"
import { signOut } from "firebase/auth"
import { auth } from "@/lib/firebase/config"
import { useUser } from "@/lib/auth/useUser"
```

**Add hook and logout handler in component:**

```typescript
export default function Navbar() {
  const { user } = useUser()

  async function handleLogout() {
    try {
      await signOut(auth)
    } catch (error) {
      console.error("Logout failed:", error)
    }
  }

  // ... rest of component
}
```

**Add conditional logout button in JSX (inside `ul`, BEFORE Create button):**

```tsx
<ul>
  {user && (
    <li>
      <button onClick={handleLogout} className="btn">
        <LogOut size={18} strokeWidth={2.5} />
        Logout
      </button>
    </li>
  )}
  <li>
    <Link href="/heists/create" className="btn">
      <Plus size={18} strokeWidth={2.5} />
      Create New Heist
    </Link>
  </li>
</ul>
```

**Key Design Decisions:**

- Only extract `user` from `useUser` (ignore `loading` per spec)
- No loading state on button (per spec: "Should the button show a loading state? No")
- No confirmation dialog (per spec: "Should there be a confirmation dialog? No")
- Error handling: log to console for debugging, no user-facing error UI
- Button uses same `.btn` class as Create button for consistency
- Icon sizing matches Create button exactly (`size={18}`, `strokeWidth={2.5}`)

## Edge Cases Handled

1. **Rapid clicks:** Firebase SDK handles multiple `signOut` calls gracefully; button disappears after first successful logout
2. **Already signed out:** Button only renders when user exists (conditional rendering prevents this)
3. **Network failures:** Firebase `signOut` is primarily local; errors logged to console but user sees logged-out state
4. **Race conditions:** Firebase SDK guarantees `onAuthStateChanged` fires after `signOut` completes

## State Management Flow

```
User clicks Logout button
→ handleLogout() calls signOut(auth)
→ Firebase SDK clears local auth state
→ onAuthStateChanged listener in AuthProvider fires
→ AuthProvider sets user to null
→ Navbar re-renders, logout button hidden (user === null)
```

No manual redirect needed - spec states: "No redirects are required at this stage - the authentication state change will be handled by the existing AuthProvider"

## Verification Steps

### Automated Testing

```bash
npm test tests/components/Navbar.test.tsx
npm run lint
```

All 4 new tests should pass, no linting errors.

### Manual Testing

1. **Setup:**
   - Start dev server: `npm run dev`
   - Sign up or log in to application
   - Navigate to `/heists` (dashboard route)
2. **Visual verification:**
   - Verify logout button appears LEFT of "Create New Heist" button
   - Verify button styling matches Create button (purple-pink gradient)
   - Verify `LogOut` icon appears with correct sizing
   - Verify both buttons are properly aligned
3. **Functionality testing:**
   - Click logout button
   - Verify logout button disappears (user signed out)
   - Verify no console errors during sign out
   - Sign back in, verify logout button reappears
4. **Edge case testing:**
   - Click logout button multiple times rapidly
   - Check console - should handle gracefully, no errors
5. **Accessibility testing:**
   - Tab to logout button with keyboard
   - Press Enter to activate
   - Verify button has proper focus styles

## Files Modified Summary

**Modified:**

- `components/Navbar/Navbar.tsx` - Add client directive, imports, logout logic, conditional button
- `tests/components/Navbar.test.tsx` - Add mocks and 4 test cases

**Unchanged:**

- `components/Navbar/Navbar.module.css` - Existing styles sufficient
- `lib/auth/AuthContext.tsx` - Already provides needed functionality
- `app/globals.css` - `.btn` class already exists

## Notes

- No CSS changes needed - existing `.btn` class provides all styling
- No new components needed - button rendered inline in Navbar
- No routing changes needed - `AuthProvider` handles state propagation
- Follows existing patterns from `SignupForm` for Firebase auth usage
- Matches existing Button styling and icon usage patterns
