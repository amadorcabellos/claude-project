## Overview

Implement functional authentication forms for /login' and '/signup pages with email/password inputs, password visibility toggle, and console-based submission handling.

## Critical Files

### New Components to Create

- `components/Input/Input.tsx` Reusable text/email input component
- `components/Input/Input.module.css` Input styling with theme integration
- `components/Input/index.ts` Barrel export
- `components/PasswordInput/PasswordInput.tsx` Password input with visibility toggle
- `components/PasswordInput/PasswordInput.module.css` Password input styling
- `components/PasswordInput/index.ts` Barrel export
- `components/Button/Button.tsx` Reusable button component
- `components/Button/Button.module.css` Button styling (extends .btn)
- `components/Button/index.ts` Barrel export
- `components/LoginForm/LoginForm.tsx` Login form with email/password
- `components/LoginForm/LoginForm.module.css` Form-specific layout styles
- `components/LoginForm/index.ts` Barrel export
- `components/SignupForm/SignupForm.tsx` Signup form with email/password
- `components/SignupForm/SignupForm.module.css` Form-specific layout styles
- `components/SignupForm/index.ts` Barrel export

### Pages to Update

- `app/(public)/login/page.tsx` Fix component name, add LoginForm
- `app/(public)/signup/page.tsx` Add SignupForm

### Test Files to Create

- `tests/components/Input.test.tsx` Input component tests
- `tests/components/PasswordInput.test.tsx` Password input tests
- `tests/components/Button.test.tsx` Button component tests
- `tests/components/LoginForm.test.tsx` Login form tests
- `tests/components/SignupForm.test.tsx` Signup form tests

## Implementation Steps

### Step 1: Create Input Component
**Files:** `components/Input/`

Create a reusable Input component that:
- Accepts props: `id`, `name`, `type`, `label`, `placeholder`, `required`, `value`, `onChange`
- Renders a label and input field
- Uses CSS Modules for styling
- Applies theme colors from globals.css using `@reference`
- Supports email and text input types
- Includes HTML5 validation attributes

**Styling approach:**
- Use `@apply` for Tailwind utilities
- Reference theme variables for colors (--color-primary, --color-error, --color-lighter)
- Style focus states with primary color
- Add border and padding for input fields

### Step 2: Create PasswordInput Component
**Files:** `components/PasswordInput/`

Create a password input with visibility toggle:

- Accepts same props as Input component
- Includes Eye/Eye0ff icons from `lucide-react` (already available)
- Toggle button switches between `type="password"` and `type="text"`
- Uses internal state for visibility toggle
- Button positioned absolutely within input container

**Icon usage:**
```typescript
import { Eye, EyeOff } from "lucide-react"
```

**Styling approach:**
- Position toggle button inside input field (right side)
- Make button accessible with proper aria-label
- Use hover states for toggle button

### Step 3: Create Button Component
**Files:** `components/Button/`

Create a reusable Button component:
- Accepts props: `type`, `children`, `onClick`, `disabled`
- Extends existing `.btn` class from globals.css
- Adds disabled state styling
- Uses CSS Modules for additional styles

**Implementation:**
- Use `type="submit"` by default for form buttons
- Support disabled state with reduced opacity
- Keep existing hover transition from .btn class

### Step 4: Create LoginForm Component
**Files:** `components/LoginForm/`

Create login form with:
- Email Input component
- Password Input component
- Submit Button component ("Log In")
- Form submission handler that prevents default and logs to console
- Link to signup page: "Don't have an account? Sign up"
- Basic email validation (HTML5 type="email" + light JS validation)

**Form structure:**
```tsx
<form onSubmit={handleSubmit}>
  <Input type="email" label="Email" />
  <PasswordInput label="Password" />
  <Button type="submit">Log In</Button>
  <p>Don't have an account? <Link href="/signup">Sign up</Link></p>
</form>
```

**Form handler:**
- Prevent default form submission
- Log email and password to console
- Use controlled inputs with React state

**Validation:**
- Check for empty email/password before submission
- Use HTML5 email validation
- Log validation errors to console


### Step 5: Create Signup Form Component
**Files:** `components/SignupForm/

Create signup form (nearly identical to LoginForm):
- Same structure as LoginForm
- Submit button labeled "Sign Up"
- Link to login page: "Already have an account? Log in"
- Same validation and console logging behavior

### Step 6: Update Login Page
**File:** `app/(public)/login/page.tsx

Updates needed:

1. Fix component name from `SignupPage` to `LoginPage`
2. Import and render LoginForm component
3. Keep existing layout structure (center-content, page-content)
4. Keep h1 heading above form

### Step 7: Update Signup Page
**File:** `app/(public)/signup/page.tsx`

Updates needed:
1. Import and render SignupForm component
2. Keep existing layout structure
3. Keep h2 heading above form

### Step 8: Create Tests

**Input.test.tsx:**
- Renders with label and placeholder
- Accepts user input
- Has required attribute when specified
- Has correct input type

**PasswordInput.test.tsx:**
- Renders password field (masked by default)
- Toggle button switches between hidden/visible
- Eye icon changes to EyeOff when visible
- Input type changes from password to text

**Button.test.tsx:**
- Renders button with text
- Calls onClick handler when clicked
- Shows disabled state
- Has correct type attribute

**LoginForm.test.tsx:**
- Renders all form fields (email, password, submit button)
- Submit button has "Log In" text
- Form submission prevents default behavior
- Console.log called with form data on submit
- Link to signup page present

**SignupForm.test.tsx:**
- Renders all form fields
- Submit button has "Sign Up" text
- Form submission prevents default behavior
- Console.log called with form data on submit
- Link to login page present

## Design Decisions

### Component Architecture
- **Separate LoginForm and SignupForm**: While they're similar, keeping them separate follows single responsibility principle and makes future divergence easier
- **Reusable Input components**: Input and PasswordInput can be reused across the app
- **Button component**: Wraps .btn class for consistency and reusability

### Styling Strategy
- CSS Modules for all components (follows existing pattern)
- Use `@reference "../../app/globals.css"` to access theme
- Use `@apply` to combine Tailwind utilities into semantic classes
- Minimal inline Tailwind classes (per CLAUDE.md preferences)

### Form State Management
- Use React's built-in `useState` for controlled inputs
- No external form libraries needed (follows minimal dependencies preference)
- Store email and password in component state

### Validation Approach
- HTML5 validation attributes (`type="email"`, `required`)
- Light JavaScript validation before submission (check for empty fields)
- Log validation errors to console (no UI error display needed yet)

### Navigation Between Forms
- Next.js `Link` component at bottom of each form
- Styled as inline text link (not button)
- Clear call-to-action text

## Technical Considerations

### TypeScript Interfaces
All components will have typed props:
```typescript
interface InputProps {
    id: string
    name: string
    type: "text" | "email"
    label: string
    placeholder?: string
    required?: boolean
    value: string
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
}
```

### Accessibility
- Proper label associations (`htmlFor` and `id`)
- ARIA labels for password toggle button
- Keyboard accessible (all inputs and buttons)
- Semantic HTML (form, label, input, button elements)

### Icon Integration
Use lucide-react icons (already available):
- `Eye` Show password icon
- `EyeOff` Hide password icon

### No Semicolons
Per CLAUDE.md preferences, all code will omit semicolons.

## Verification Steps

After implementation, verify:

1. **Visual Check:**
- Navigate to http://localhost:3000/login
- Form displays with email input, password input (masked), and "Log In" button
- Password toggle icon appears in password field
- Link to signup page at bottom
- Navigate to http://localhost:3000/signup and verify same structure

2. **Functionality Check:**
- Enter email and password
- Click password toggle - text should appear/disappear
- Submit form - check browser console for logged credentials
- Verify page doesn't reload on submission
- Click navigation link - should switch between forms

3. **Validation Check:**
- Try submitting empty form - should log error or prevent submission
- Try invalid email format - HTML5 validation should trigger
- Enter valid data - should log to console successfully

4. **Run Tests:**
```bash
npm test
```
All new test files should pass

5. **Accessibility Check:**
- Tab through form all fields should be keyboard accessible
- Password toggle should work via keyboard (Enter/Space)
- Screen reader labels should be present (check with browser inspector)

6. **Responsive Check:**
- Test on mobile viewport (DevTools)
- Form should be readable and usable on small screens
- Inputs should resize appropriately