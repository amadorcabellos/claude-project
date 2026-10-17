# Create Heist Form Implementation Plan

## Overview

Implement a functional "Create Heist" form on `/heists/create` that creates new heist missions in Firestore and redirects to the heists list page.

## Requirements Summary

- Form fields: title (text), description (textarea), assignedTo (dropdown with user codenames)
- Auto-populate: `createdBy`/`createdByCodename` from logged-in user, `createdAt` (server timestamp), `deadline` (48 hours from now)
- Filter out current user from assignedTo dropdown
- Show message if users collection is empty
- Redirect to `/heists` after successful submission
- Loading states and error handling

## Critical Files

### To Create/Modify

- `app/(dashboard)/heists/create/page.tsx` - Main form component
- `app/(dashboard)/heists/create/page.module.css` - Component styles

### To Create for Testing

- `tests/app/CreateHeistPage.test.tsx` - Component tests

### Reference Files

- `components/SignupForm/SignupForm.tsx` - Pattern for form submission and Firestore writes
- `components/LoginForm/LoginForm.tsx` - Pattern for form state and error handling
- `types/firestore/heist.ts` - `CreateHeistInput` interface and `heistConverter`

## Implementation Steps

### 1. Create CSS Module File

Create `page.module.css` with styles for:

- `.form` - Form container matching existing form patterns
- `.inputGroup` - Field grouping with label
- `.label` - Field labels styled like other forms
- `.textarea` - Styled textarea matching Input component
- `.select` - Styled dropdown matching Input component
- `.error` - Error message display (same as LoginForm/SignupForm)
- `.emptyState` - Message when no users available

### 2. Implement Main Form Component

**Component setup:**

- Add `"use client"` directive
- Import: React hooks, Next.js router, Firebase functions, auth, components, types, styles
- Set up hooks: `useUser()`, `useRouter()`, state variables

**State variables:**

```typescript
const [title, setTitle] = useState("")
const [description, setDescription] = useState("")
const [assignedTo, setAssignedTo] = useState("")
const [assignedToCodename, setAssignedToCodename] = useState("")
const [users, setUsers] = useState<Array<{ id: string; codename: string }>>([])
const [loading, setLoading] = useState(false)
const [error, setError] = useState("")
const [usersLoading, setUsersLoading] = useState(true)
```

**Fetch users on mount:**

- Use `useEffect` to call `getDocs(collection(db, "users"))`
- Filter out current user from results: `usersList.filter((u) => u.id !== user?.uid)`
- Set `users` state with filtered list
- Handle errors gracefully, set `usersLoading` to false

**Form validation:**

```typescript
function validateForm(): boolean {
  if (!title.trim()) {
    setError("Title is required")
    return false
  }
  if (!description.trim()) {
    setError("Description is required")
    return false
  }
  if (!assignedTo) {
    setError("Please select a user to assign this heist to")
    return false
  }
  return true
}
```

**Form submission:**

```typescript
async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
  e.preventDefault()
  setError("")

  if (!validateForm() || !user) return

  setLoading(true)

  try {
    // Calculate deadline (48 hours from now)
    const deadline = new Date()
    deadline.setHours(deadline.getHours() + 48)

    // Construct heist data
    const heistData: CreateHeistInput = {
      title: title.trim(),
      description: description.trim(),
      createdBy: user.uid,
      createdByCodename: user.displayName || "Unknown",
      assignedTo: assignedTo,
      assignedToCodename: assignedToCodename,
      createdAt: serverTimestamp(),
      deadline: deadline,
      finalStatus: null,
    }

    // Write to Firestore
    await addDoc(
      collection(db, "heists").withConverter(heistConverter),
      heistData,
    )

    // Redirect to heists list
    router.push("/heists")
  } catch (err) {
    console.error("Failed to create heist:", err)
    setError("Failed to create heist. Please try again.")
    setLoading(false)
  }
}
```

**Dropdown change handler:**

```typescript
function handleAssignedToChange(e: React.ChangeEvent<HTMLSelectElement>) {
  const selectedUserId = e.target.value
  setAssignedTo(selectedUserId)

  const selectedUser = users.find((u) => u.id === selectedUserId)
  if (selectedUser) {
    setAssignedToCodename(selectedUser.codename)
  }
}
```

**JSX structure:**

- Show loading state while `usersLoading` is true
- Show empty state message if `users.length === 0` and not loading
- Show form if `users.length > 0`:
  - Page title: "Create a New Heist" (already exists)
  - Error message display (conditional)
  - Title input using `<Input>` component
  - Description textarea (native element with custom styling)
  - AssignedTo select dropdown (native element with custom styling)
  - Submit button with loading state: `{loading ? "Creating Heist..." : "Create Heist"}`

### 3. Create Test File

Create `tests/app/CreateHeistPage.test.tsx` with mocks for:

- `@/lib/auth` `useUser` hook
- `firebase/firestore` (`getDocs`, `addDoc`, `collection`, `serverTimestamp`)
- `next/navigation` `useRouter`

**Test scenarios:**

1. Form renders with all required fields
2. Form validation prevents submission when fields are empty
3. Successful submission calls Firestore with correct data structure
4. Form shows loading state during submission
5. Form displays error when Firestore operation fails
6. Dropdown is populated with users (current user filtered out)
7. Empty users collection shows message instead of form

## Key Implementation Details

**Imports:**

```typescript
"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { collection, addDoc, getDocs, serverTimestamp } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { useUser } from "@/lib/auth"
import { CreateHeistInput, heistConverter } from "@/types/firestore/heist"
import Input from "@/components/Input"
import Button from "@/components/Button"
import styles from "./page.module.css"
```

**Edge cases handled:**

- Empty users collection: Show message, don't render form
- No user authenticated: Show error (shouldn't happen with route protection)
- Firestore write fails: Display error, keep form populated
- Trim whitespace from title/description
- Fallback for missing `displayName`

## Verification Steps

After implementation:

1. **Manual testing:**
   - Navigate to `/heists/create` while logged in
   - Verify all form fields render correctly
   - Test validation by submitting empty form
   - Create a heist with valid data
   - Verify redirect to `/heists`
   - Check Firestore console for correct document structure
   - Test with empty users collection (delete all users except current)
2. **Run tests:**

   ```bash
   npm test -- tests/app/CreateHeistPage.test.tsx
   ```

3. **Verify Firestore document:**
   - Check that `createdAt` is a Firebase Timestamp
   - Check that `deadline` is exactly 48 hours after creation
   - Check that `createdBy` matches logged-in user's uid
   - Check that `createdByCodename` matches user's displayName
   - Check that `assignedTo` and `assignedToCodename` match selected user
4. **Verify styling:**
   - Form follows existing design system
   - Matches LoginForm/SignupForm styling patterns
   - Responsive on different screen sizes
   - Textarea and select elements styled consistently with Input component

## Acceptance Criteria

- ✅ Form renders on `/heists/create` with title, description, and assignedTo fields
- ✅ Dropdown populated with user codenames (current user excluded)
- ✅ Form validates all required fields before submission
- ✅ `createdAt` uses `serverTimestamp()`
- ✅ `deadline` set to 48 hours from creation
- ✅ Heist document created in Firestore with correct structure
