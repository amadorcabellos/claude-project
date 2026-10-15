# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

# Tool Usage Guidelines
- Always use the `Edit` or `Write` tool for file modifications.
- Do NOT use shell commands (`sed`, `awk`, `echo`, `cat`) or inline scripts via the `Bash` tool to edit or create files.

## Project

Pocket Heist ("In. Out. Gone.") — starter project for the Claude Code Masterclass. Next.js 16 (App Router) + React 19 + TypeScript (strict) + Tailwind CSS v4. No backend/auth/data layer yet; pages are mostly stubs.

## Commands

- `npm run dev` — dev server at http://localhost:3000
- `npm run build` / `npm start` — production build / serve
- `npm run lint` — ESLint (flat config extending `eslint-config-next` core-web-vitals + typescript)
- `npm test` — Vitest in watch mode (jsdom, globals enabled)
- `npx vitest run` — single non-watch run; `npx vitest run tests/components/Navbar.test.tsx` for one file; add `-t "name"` for one test

## Architecture

- **Route groups** under `app/` split layouts: `(public)` (splash, `login`, `signup`, `preview`) and `(dashboard)` (`heists`, `heists/[id]`, `heists/create`). The public layout wraps pages in `<main className="public">`; the dashboard layout adds `<Navbar />` plus `<main>`. The root layout (`app/layout.tsx`) only sets metadata and imports `app/globals.css`.
- **Splash page** (`app/(public)/page.tsx`) is meant to route users: logged in → `/heists`, logged out → `/login`. That logic doesn't exist yet because there is no auth.
- **Components** live in `components/<Name>/` as a folder with the component, a CSS module (`<Name>.module.css`), and an `index.ts` re-export, so imports look like `@/components/Navbar`. Icons come from `lucide-react`.
- **Styling**: Tailwind v4 is configured in CSS (there is no `tailwind.config.js`). Theme tokens are defined in the `@theme` block of `app/globals.css`, so use utilities like `bg-dark`, `bg-lighter`, `text-primary`, `text-secondary`, `text-body`, `text-success` and `text-error` instead of raw hex values. `globals.css` also defines shared classes: `.page-content` (centered page container used by every page), `.center-content` and `.form-title`. Component-specific styles go in CSS modules.
- **Path alias**: `@/*` maps to the repo root (tsconfig `paths`, mirrored in Vitest via `vite-tsconfig-paths`).
- **Tests** are in `tests/` (mirroring source, e.g. `tests/components/Navbar.test.tsx`), using Testing Library + jest-dom (set up in `vitest.setup.ts`). Tests import components through the `@/` alias.

## Conventions

- No semicolons; double quotes in TS/TSX.
- Imports are grouped under short comments such as `// components`.
