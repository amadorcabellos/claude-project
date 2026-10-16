# Implementation Plan: Signup Firebase Integration

## Overview

Integrate the `SignupForm` with Firebase Authentication to create user accounts, generate random codenames (displayName), and store user data in Firestore.

## Critical Files

**New Files:**

- `lib/utils/codename.ts` - Random codename generator
- `tests/lib/utils/codename.test.ts` - Codename tests

**Modified Files:**

- `components/SignupForm/SignupForm.tsx` - Firebase integration
- `components/SignupForm/SignupForm.module.css` - Error styling
- `tests/components/SignupForm.test.tsx` - Updated tests with Firebase mocks

## Implementation Steps

### Step 1: Create Codename Generator Utility

**File:** `lib/utils/codename.ts`

Create utility function that:

- Defines 3 word arrays (~20 words each):
  - Adjectives: Swift, Silent, Bold, Quick, Clever, Sly, Phantom, Shadow, etc.
  - Colors: Crimson, Azure, Violet, Golden, Silver, Obsidian, etc.
  - Nouns: Falcon, Fox, Wolf, Raven, Tiger, Viper, etc.
- Randomly selects one word from each array
- Concatenates in PascalCase format: "SwiftCrimsonFalcon"

```typescript
export function generateCodename(): string {
  const adjectives = [/* ~20 words */]
  const colors = [/* ~20 words */]
  const nouns = [/* ~20 words */]

  const pick = (arr: string[]) => arr[Math.floor(Math.random() * arr.length)]

  return `${pick(adjectives)}${pick(colors)}${pick(nouns)}`
}
```

### Step 2: Create Codename Tests

**File:** `tests/lib/utils/codename.test.ts`

Test cases:

- Returns non-empty string
- Matches PascalCase pattern with 3 words: `/^[A-Z][a-z]+[A-Z][a-z]+[A-Z][a-z]+$/`
- Generates different values across multiple calls (10 iterations should produce 8+ unique)

### Step 3: Update SignupForm Component

**File:** `components/SignupForm/SignupForm.tsx`

**Add Imports:**

```typescript
import { useRouter } from "next/navigation"
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth"
import { doc, setDoc } from "firebase/firestore"
import { auth, db } from "@/lib/firebase/config"
import { generateCodename } from "@/lib/utils/codename"
```

**Add State:**

```typescript
const [loading, setLoading] = useState(false)
const [error, setError] = useState("")
const router = useRouter()
```

**Replace handleSubmit with async Firebase integration:**

```typescript
async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
  e.preventDefault()
  setError("")
  setLoading(true)

  try {
    // 1. Create Firebase Auth account
    const userCredential = await createUserWithEmailAndPassword(auth, email, password)
    const user = userCredential.user

    // 2. Generate codename
    const codename = generateCodename()

    // 3. Update user profile with displayName
    await updateProfile(user, { displayName: codename })

    // 4. Create Firestore document (log errors but don't block)
    try {
      await setDoc(doc(db, "users", user.uid), {
        id: user.uid,
        codename: codename,
      })
    } catch (firestoreError) {
      console.error("Failed to create user document:", firestoreError)
    }

    // 5. Navigate to heists page
    router.push("/heists")
  } catch (error: any) {
    setError(getErrorMessage(error.code))
    setLoading(false)
  }
}

function getErrorMessage(errorCode: string): string {
  switch (errorCode) {
    case "auth/email-already-in-use":
      return "This email is already registered. Please log in instead."
    case "auth/weak-password":
      return "Password should be at least 6 characters long."
    case "auth/invalid-email":
      return "Please enter a valid email address."
    default:
      return "An error occurred during signup. Please try again."
  }
}
```

**Update JSX:**

- Add error display before form fields (conditional): `{error && <div className={styles.error}>{error}</div>}`
- Update Button: `<Button type="submit" disabled={loading}>{loading ? "Creating Account..." : "Sign Up"}</Button>`
- Add `disabled={loading}` to `Input` and `PasswordInput` components

### Step 4: Add Error Styling

**File:** `components/SignupForm/SignupForm.module.css`

Add error message styles:

```css
.error {
  @apply bg-error/10 text-error text-sm p-3 rounded mb-4;
}
```

### Step 5: Update SignupForm Tests

**File:** `tests/components/SignupForm.test.tsx`

No need for mocks

**Update/Add Test Cases:**

- Update existing `console.log` test to test Firebase calls instead
- Add test for successful signup and navigation
- Add test for `auth/email-already-in-use` error display
- Add test for `auth/weak-password` error display
- Add test for loading state (button text changes, inputs disabled)
- Add test for Firestore error logging (should continue to navigation)

## Key Implementation Details

**Authentication Flow:**

1. User submits form, loading state activates
2. Create Firebase Auth account
3. Generate random codename from 3 word sets
4. Update Firebase Auth profile with displayName
5. Create Firestore document with `id` and `codename` (email NOT stored)
6. Navigate to `/heists` page
7. `AuthContext` automatically detects new user via `onAuthStateChanged`

**Error Handling:**

- Display specific errors for `email-already-in-use`, `weak-password`, `invalid-email`
- Generic error for other Firebase errors
- Log Firestore errors to console but don't block user flow
- Clear error message when user starts typing again

**Edge Cases:**

- If `updateProfile` fails: Error shown to user, account exists without displayName
- If Firestore write fails: Log error, proceed with navigation
- Network failure: Show error, user can retry
- No codename uniqueness validation (spec requirement)

## Testing Strategy

**Unit Tests:**

- Codename generator produces valid PascalCase strings
- Codename generator returns different values

**Integration Tests:**

- Successful signup flow with Firebase mocks
- Error handling for Firebase Auth errors
- Loading state during async operations
- Firestore error doesn't block navigation

**Manual Testing:**

- Test successful signup → verify redirect to `/heists`
- Test duplicate email error
- Test weak password error
- Verify Firestore document creation in Firebase Console
- Verify Auth user displayName is set

## Verification

After implementation, verify:

1. **Run Tests:**

   ```bash
   npm test tests/lib/utils/codename.test.ts
   npm test tests/components/SignupForm.test.tsx
   ```

2. **Manual Testing:**
   - Start dev server: `npm run dev`
   - Navigate to http://localhost:3000/signup
   - Test successful signup with new email
   - Check Firebase Console for:
     - New user in Authentication with displayName set
     - New document in Firestore `users` collection with `id` and `codename` fields
   - Verify redirect to `/heists` page
   - Test error cases: duplicate email, weak password

3. **Code Style:**
   - Run linter: `npm run lint`
   - Verify no semicolons added
   - Verify error styling uses CSS Modules (not inline Tailwind)

## Dependencies

All required packages already installed:

- Firebase SDK (already in `package.json`)
- Next.js 16 with App Router
- React 19
- TypeScript 5
