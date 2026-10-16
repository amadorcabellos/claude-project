# Spec for Signup Firebase Integration

branch: claude/feature/signup-firebase-integration

## Summary

Integrate the signup form with Firebase Authentication to create user accounts. Upon successful signup, generate a unique codename (displayName) by combining three randomly selected words in PascalCase. Create a Firestore document in the `users` collection to store the user's codename and ID (excluding email for privacy).

## Functional Requirements

- Connect the signup form to Firebase Auth's `createUserWithEmailAndPassword` method
- Generate a random codename by selecting one word from each of three distinct word sets and combining them in PascalCase (e.g., "SwiftCrimsonFalcon")
- Update the Firebase Auth user profile with `updateProfile` to set the generated codename as the displayName
- Create a Firestore document in the `users` collection with:
  - Document ID matching the Firebase Auth user ID
  - Field: `codename` (string) the generated displayName
  - Field: `id` (string) the user's Firebase Auth UID
- Email should NOT be stored in Firestore
- Handle authentication errors gracefully and display appropriate error messages to the user
- Show loading state during signup process
- Redirect user to dashboard/heists page upon successful signup and document creation

## Possible Edge Cases

- Network failures during account creation or Firestore document write
- Duplicate email addresses (Firebase Auth will reject)
- Weak passwords that don't meet Firebase Auth requirements
- User closes browser/tab mid-signup process
- Firestore document creation fails after successful Auth account creation
- Random codename generation produces duplicates (low probability but possible)
- User profile update fails after account creation

## Acceptance Criteria

- User can successfully sign up with email and password using the existing `SignupForm` component
- A Firebase Auth account is created with the provided credentials
- The Auth user's displayName is set to a randomly generated PascalCase codename
- A document is created in Firestore's `users` collection containing only `codename` and `id` fields
- Error messages are displayed for invalid input or Firebase errors
- Loading state is shown during the signup process
- User is redirected to `/heists` page after successful signup
- Email address is NOT stored in the Firestore `users` collection

## Open Questions

- Should the word sets for codename generation be stored in a separate utility file or inline? New file.
- What should happen if Firestore document creation fails after Auth account is created? (Retry, log error, show warning?) Log the error.
- Should we validate that the generated codename is unique in Firestore before assigning it? No.
- What specific Firebase Auth error messages should we display to users vs generic error messages? Password strength error, email errors, you decide.

## Testing Guidelines

Create a test file(s) in the ./tests folder for the new feature, and create meaningful tests for the following cases, without going too heavy:

- Codename generation produces valid PascalCase strings from three word sets
- Codename generation returns different values on multiple calls
- Signup form successfully creates Firebase Auth account with valid credentials
- User profile displayName is updated after account creation
- Firestore document is created in `users` collection with correct structure
- Error handling displays appropriate messages for common Firebase Auth errors (weak password, email already in use)
- Loading state is shown during async operations
