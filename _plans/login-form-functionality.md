# Implementation Plan: Login Form Functionality

## Overview

Implement Firebase Authentication for the `LoginForm` component. When users submit valid credentials, authenticate them with Firebase and display "Login successful" message (no redirect per spec).

## Architecture Context

**Current State:**

- `LoginForm` at `components/LoginForm/LoginForm.tsx` - skeleton with console logging only
- `SignupForm` at `components/SignupForm/SignupForm.tsx` - complete Firebase integration (reference pattern)
- `AuthProvider` already configured and wrapping app - automatically updates on auth changes
- Firebase config exported from `lib/firebase/config.ts` - ready to use

**Key Pattern Difference:**

`SignupForm` redirects to `/heists` after success. `LoginForm` will show success message instead (per spec: "No redirect needed for now").

## Implementation Steps

### 1. Add Firebase Authentication to LoginForm

**File:** `components/LoginForm/LoginForm.tsx`

**Changes:**

1. **Add imports:**

   ```typescript
   import { signInWithEmailAndPassword } from "firebase/auth"
   import { auth } from "@/lib/firebase/config"
   ```

2. **Add state management** (lines 11-13 currently have email/password):

   ```typescript
   const [loading, setLoading] = useState(false)
   const [error, setError] = useState("")
   const [success, setSuccess] = useState(false) // NEW: for success message
   ```

3. **Replace handleSubmit function** (currently lines 14-23):
   - Make it async
   - Clear error and success states at start
   - Call `signInWithEmailAndPassword(auth, email, password)`
   - On success: `setSuccess(true)` and `setLoading(false)`
   - On error: extract error code, call `getErrorMessage()`, set error, set loading false

4. **Add error handling function** (similar to `SignupForm` lines 64-75):

   ```typescript
   function getErrorMessage(errorCode: string): string {
     switch (errorCode) {
       case "auth/invalid-credential":
         return "Invalid email or password. Please try again."
       case "auth/user-not-found":
         return "No account found with this email address."
       case "auth/wrong-password":
         return "Incorrect password. Please try again."
       case "auth/invalid-email":
         return "Please enter a valid email address."
       case "auth/too-many-requests":
         return "Too many failed login attempts. Please try again later."
       case "auth/user-disabled":
         return "This account has been disabled."
       default:
         return "An error occurred during login. Please try again."
     }
   }
   ```

5. **Update JSX** (line 26 onwards):
   - Add success message display: `{success && <div className={styles.success}>Login successful</div>}`
   - Add error message display: `{error && <div className={styles.error}>{error}</div>}`
   - Update Button: `disabled={loading}`
   - Update Button text: `{loading ? "Logging In..." : "Log In"}`

**Reference:** Follow `SignupForm.tsx` pattern (lines 22-62 for `handleSubmit`, lines 64-75 for error handling, lines 78-101 for JSX)

### 2. Add CSS Styles for Success/Error Messages

**File:** `components/LoginForm/LoginForm.module.css`

**Add two new classes:**

```css
.error {
  @apply bg-error/10 text-error text-sm p-3 rounded mb-4;
}

.success {
  @apply bg-success/10 text-success text-sm p-3 rounded mb-4;
}
```

**Reference:** `SignupForm.module.css` for error styling pattern

## Critical Files

1. `components/LoginForm/LoginForm.tsx` - Main implementation
2. `components/LoginForm/LoginForm.module.css` - Add success/error styles
3. `tests/components/LoginForm.test.tsx` - Update tests
4. `components/SignupForm/SignupForm.tsx` - Reference for patterns

## Verification

### Automated Tests

```bash
npm test -- tests/components/LoginForm.test.tsx
```

Expected: All tests pass (success message, error handling, loading state)

### Manual Testing

1. **Successful login:**
   - Use valid test account credentials
   - Submit form
   - Verify "Logging In..." appears briefly
   - Verify "Login successful" message displays
   - Verify Navbar avatar updates (`AuthProvider` context working)
2. **Error handling:**
   - Try wrong password → verify error message
   - Try non-existent email → verify error message
   - Submit with empty fields → HTML5 validation prevents submission
3. **Success message persistence:**
   - After successful login, verify message does NOT auto-dismiss (per spec)
   - Submit form again → verify message clears and updates appropriately

## Success Criteria (from spec)

- ✅ User can log in with valid credentials
- ✅ Success message "Login successful" displays after login
- ✅ Error message shows on failed login with specific reason
- ✅ Form shows loading state (button disabled, text changes)
- ✅ Form validates required fields (HTML5 validation)
- ✅ `AuthProvider` context updates (automatic via Firebase)
- ✅ Existing tests continue to pass (after updates)
- ✅ Navbar avatar updates after successful login
- ✅ No redirect occurs (per spec requirement)
- ✅ Success message does NOT auto-dismiss (per spec clarification)