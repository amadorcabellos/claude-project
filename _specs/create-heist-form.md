# Spec for Create Heist Form

branch: claude/feature/create-heist-form
figma_component (if used): N/A

## Summary

Implement a functional "Create Heist" form on the `/heists/create` page that allows users to create new heist missions. The form will collect mission details, automatically set creation timestamp and deadline, and save the heist to Firestore. Upon successful submission, users are redirected to the heists list page.

## Functional Requirements

Form should include input fields matching the `CreateHeistInput` interface:

- **Title** (text input): Name/title of the heist mission
- **Description** (textarea): Detailed description of the heist
- **Created By** (dropdown/select): User creating the heist (populated from users collection with codenames)
- **Assigned To** (dropdown/select): User assigned to complete the heist (populated from users collection with codenames)
- The form should programmatically set:
  - `createdAt`: Firebase server timestamp
  - `deadline`: Automatically calculated as 48 hours from creation time
  - `finalStatus`: Initially set to `null`
- When user selects a user from dropdowns, both the user ID and codename should be captured
- Form submission should:
  - Validate all required fields are filled
  - Create a new document in the `heists` Firestore collection
  - Use the `heistConverter` for proper data transformation
  - Redirect to `/heists` page on success
  - Display appropriate loading state during submission
  - Display error messages if submission fails
- Form should follow existing component patterns (`Button`, `Input` components)

## Figma Design Reference (only if referenced)

N/A

## Possible Edge Cases

- User tries to submit form with missing required fields
- Firestore write fails due to permissions or network issues
- Users collection is empty or fails to load
- User navigates away during form submission
- Deadline calculation crosses daylight saving time boundaries
- User is not authenticated (should be handled by route protection)
- Selected user for "Assigned To" is the same as "Created By"

## Acceptance Criteria

- Form renders on `/heists/create` page with all required input fields
- Dropdowns for creator and assignee are populated with user codenames from Firestore users collection
- Form validates that all required fields are filled before submission
- Successful submission creates a heist document in Firestore with correct field values
- `createdAt` uses Firebase server timestamp
- `deadline` is automatically set to 48 hours after creation
- User is redirected to `/heists` page after successful submission
- Loading state is displayed during submission
- Error messages are shown if submission fails
- Form styling follows the existing design system (`globals.css` classes and CSS Modules)

## Open Questions

- Should the "Created By" field be auto-populated with the currently logged-in user, or should it remain a dropdown? We don't need a dropdown for this, or an input for this. It should be from the currently logged in user.
- Should there be a confirmation dialog before submission? No
- Should the deadline be editable or always fixed at 48 hours? Always fixed
- Should there be validation to prevent assigning a heist to yourself? Don't show the current logged in user in the dropdown for this field.
- What should happen if the users collection is empty? Show a message instead of the form.

## Testing Guidelines

Create a test file(s) in the ./tests folder for the new feature, and create meaningful tests for the following cases, without going too heavy:

- Form renders with all required input fields (title, description, creator dropdown, assignee dropdown)
- Form validation prevents submission when required fields are empty
- Successful form submission calls Firestore with correct data structure
- Form shows loading state during submission
- Form displays error message when Firestore operation fails
- User is redirected to `/heists` after successful submission
- Dropdowns are populated with user data from Firestore
