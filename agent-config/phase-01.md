# Phase 01 — Project Scaffolding & Design System

**Status:** Completed
**Estimated Duration:** 3–4 days
**Started:** 2026-03-10
**Completed:** 2026-03-10

---

## Description

Initialize the monorepo, configure the Hapkonic design system with brand tokens in Tailwind, build foundational UI components, set up developer tooling (ESLint, Prettier, Husky), configure CI/CD, and build the global layout shell.

**Deliverable:** Empty but fully styled, routed, and deployable application shell.

---

## Tasks

### Monorepo Setup
- [x] Initialize Turborepo monorepo structure (`apps/web`, `apps/api`, `packages/ui`)
- [x] Configure root `package.json` with workspaces
- [x] Set up `turbo.json` with pipeline definitions (build, dev, lint, test)
- [x] Configure TypeScript `tsconfig.json` (root + per-app extends)

### Tailwind Design Tokens
- [x] Install and configure Tailwind CSS in `apps/web`
- [x] Define Hapkonic color palette (primary, accent, neutral, semantic: success/warning/error/info)
- [x] Define typography scale (display, heading, body, mono — font families + sizes)
- [x] Define spacing, border-radius, shadow, and motion/transition tokens
- [x] Configure `tailwind.config.ts` with all custom tokens
- [x] Create CSS variables file for dark/light theme switching

### Dark/Light Theme
- [x] Implement dark/light theme toggle using CSS variables + Tailwind `dark:` variant
- [x] Persist theme preference in `localStorage`
- [x] Add theme toggle component to topbar

### `packages/ui` Design System Components
- [x] `<Button>` — variants: primary, secondary, ghost, destructive; sizes: sm, md, lg; loading state
- [x] `<Input>` — with label, error state, helper text, icons
- [x] `<Card>` — with header, body, footer slots
- [x] `<Badge>` — variants: default, success, warning, error, info
- [x] `<Avatar>` — with image, initials fallback, size variants
- [x] `<Modal>` — accessible dialog with backdrop, close button, animation
- [x] `<Tooltip>` — with arrow, placement variants, delay

### Developer Tooling
- [x] Configure ESLint (TypeScript + React rules)
- [x] Configure Prettier with project formatting rules
- [x] Set up Husky pre-commit hooks (lint + format check)
- [x] Configure `lint-staged` for incremental linting

### CI/CD Pipeline
- [x] Create `.github/workflows/ci.yml` — runs lint, test, build on every PR
- [x] Create `.github/workflows/deploy.yml` — deploys `apps/web` to Vercel on push to `main`
- [x] Create `.github/workflows/deploy-api.yml` — deploys `apps/api` to Render on push to `main`
- [x] Set up environment variable secrets in GitHub repo settings

### Global Layout Shell
- [x] Build root layout: sidebar + topbar + main content area
- [x] Build collapsible sidebar with navigation links and icons
- [x] Build topbar with theme toggle, user avatar, notification bell placeholder
- [x] Implement route transitions with Framer Motion
- [x] Set up React Router v6 with route configuration
- [x] Create placeholder pages for all 20 feature routes

---

## Commit

**Message:** `chore(phase-01): complete Phase 1 — Project Scaffolding & Design System`

**Steps:**
```bash
git config user.name "Harsh Raj A"
git config user.email "hraj20000@gmail.com"
git add .
git commit -m "chore(phase-01): complete Phase 1 — Project Scaffolding & Design System"
git push origin main
```

> See [COMMIT_GUIDE.md](COMMIT_GUIDE.md) — **Never add Co-Authored-By lines.**

---

## Notes / Blockers

_Add notes here as work progresses._
