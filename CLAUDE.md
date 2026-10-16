# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

# Tool Usage Guidelines
- Always use the `Edit` or `Write` tool for file modifications.
- Do NOT use shell commands (`sed`, `awk`, `echo`, `cat`) or inline scripts via the `Bash` tool to edit or create files.

## Project

Pocket Heist ("In. Out. Gone.") — starter project for the Claude Code Masterclass. Next.js 16 (App Router) + React 19 + TypeScript (strict) + Tailwind CSS v4. Firebase (Auth + Firestore) is the backend: `SignupForm` creates the account, sets a random codename (`lib/utils/codename.ts`) as `displayName` and writes `users/{uid}` with `{ id, codename }` (never the email). `LoginForm` still only `console.log`s, and most other pages are stubs.

## Commands

- `npm run dev` — dev server at http://localhost:3000
- `npm run build` / `npm start` — production build / serve
- `npm run lint` — ESLint (flat config extending `eslint-config-next` core-web-vitals + typescript)
- `npm test` — Vitest in watch mode (jsdom, globals enabled)
- `npx vitest run` — single non-watch run; `npx vitest run tests/components/Navbar.test.tsx` for one file; add `-t "name"` for one test

## Architecture

- **Route groups** under `app/` split layouts: `(public)` (splash, `login`, `signup`, `preview`) and `(dashboard)` (`heists`, `heists/[id]`, `heists/create`). The public layout wraps pages in `<main className="public">`; the dashboard layout adds `<Navbar />` plus `<main>`. The root layout (`app/layout.tsx`) sets metadata, imports `app/globals.css` and wraps everything in the client `Providers` from `app/providers.tsx`.
- **Auth state**: `AuthProvider` (in `Providers`) listens to Firebase `onAuthStateChanged`; read it with `const { user, loading } = useUser()` from `@/lib/auth` in client components only. `user` is `{ uid, email, displayName }` or `null`. Firebase is initialized in `lib/firebase.ts` (config from `NEXT_PUBLIC_FIREBASE_*` in `.env.local`); tests mock `@/lib/firebase`.
- **Splash page** (`app/(public)/page.tsx`) is meant to route users: logged in → `/heists`, logged out → `/login`. That logic doesn't exist yet because there is no auth.
- **Components** live in `components/<Name>/` as a folder with the component, a CSS module (`<Name>.module.css`), and an `index.ts` re-export, so imports look like `@/components/Navbar`. Icons come from `lucide-react`.
- **Forms**: `LoginForm` and `SignupForm` are client components (`"use client"`) built from the shared `Input`, `PasswordInput` (show/hide toggle) and `Button` components; reuse these for new forms. Pages stay server components and just render the form.
- **Styling**: Tailwind v4 is configured in CSS (there is no `tailwind.config.js`). Theme tokens are defined in the `@theme` block of `app/globals.css`, so use utilities like `bg-dark`, `bg-lighter`, `text-primary`, `text-secondary`, `text-body`, `text-success` and `text-error` instead of raw hex values. `globals.css` also defines shared classes: `.page-content` (centered page container used by every page), `.center-content`, `.form-title` and `.btn` (which `Button` builds on). Component-specific styles go in CSS modules, which start with `@reference "../../app/globals.css";` so `@apply` can use the theme.
- **CSS gotchas**: `.public h1` (`text-4xl`) overrides `.form-title`'s size on public pages, which is why the signup title is an `h2`. `.page-content` has `min-w-2xl`, so pages scroll sideways on phone-width screens.
- **Path alias**: `@/*` maps to the repo root (tsconfig `paths`, mirrored in Vitest via `vite-tsconfig-paths`).
- **Tests** are in `tests/` (mirroring source, e.g. `tests/components/Navbar.test.tsx`), using Testing Library + jest-dom (set up in `vitest.setup.ts`). Tests import components through the `@/` alias.

## Workflow

- Features start as a spec in `_specs/` (built from `_specs/template.md` by the `/spec` command, which also creates a `claude/feature/<slug>` branch), then a plan saved in `_plans/`.
- Other custom commands in `.claude/commands/`: `/component` (TDD: write the test in `tests/components/` first) and `/commit-message` (emoji-prefixed conventional commits, confirmed before committing).
- A PostToolUse hook in `.claude/settings.local.json` runs `npx prettier --write` on every edited `.ts`/`.tsx` file (config in `.prettierrc`), and dumps each tool call to `tool-use.json`. Don't commit `tool-use.json` changes.

## Conventions

- No semicolons; double quotes in TS/TSX (enforced by the Prettier hook).
- Imports are grouped under short comments such as `// components`.

## Checking Documentation

**important:** When implementing any lib/framework-specific features, ALWAYS check the appropriate lib/framework documentation using the Context7 MCP server before writing any code.