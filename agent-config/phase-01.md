# Phase 01 — Project Scaffolding & Design System

**Status:** Not Started
**Estimated Duration:** 3–4 days
**Started:** —
**Completed:** —

---

## Description

Initialize the monorepo, configure the Hapkonic design system with brand tokens in Tailwind, build foundational UI components, set up developer tooling (ESLint, Prettier, Husky), configure CI/CD, and build the global layout shell.

**Deliverable:** Empty but fully styled, routed, and deployable application shell.

---

## Tasks

### Monorepo Setup
- [ ] Initialize Turborepo monorepo structure (`apps/web`, `apps/api`, `packages/ui`)
- [ ] Configure root `package.json` with workspaces
- [ ] Set up `turbo.json` with pipeline definitions (build, dev, lint, test)
- [ ] Configure TypeScript `tsconfig.json` (root + per-app extends)

### Tailwind Design Tokens
- [ ] Install and configure Tailwind CSS in `apps/web`
- [ ] Define Hapkonic color palette (primary, accent, neutral, semantic: success/warning/error/info)
- [ ] Define typography scale (display, heading, body, mono — font families + sizes)
- [ ] Define spacing, border-radius, shadow, and motion/transition tokens
- [ ] Configure `tailwind.config.ts` with all custom tokens
- [ ] Create CSS variables file for dark/light theme switching

### Dark/Light Theme
- [ ] Implement dark/light theme toggle using CSS variables + Tailwind `dark:` variant
- [ ] Persist theme preference in `localStorage`
- [ ] Add theme toggle component to topbar

### `packages/ui` Design System Components
- [ ] `<Button>` — variants: primary, secondary, ghost, destructive; sizes: sm, md, lg; loading state
- [ ] `<Input>` — with label, error state, helper text, icons
- [ ] `<Card>` — with header, body, footer slots
- [ ] `<Badge>` — variants: default, success, warning, error, info
- [ ] `<Avatar>` — with image, initials fallback, size variants
- [ ] `<Modal>` — accessible dialog with backdrop, close button, animation
- [ ] `<Tooltip>` — with arrow, placement variants, delay

### Developer Tooling
- [ ] Configure ESLint (TypeScript + React rules)
- [ ] Configure Prettier with project formatting rules
- [ ] Set up Husky pre-commit hooks (lint + format check)
- [ ] Configure `lint-staged` for incremental linting

### CI/CD Pipeline
- [ ] Create `.github/workflows/ci.yml` — runs lint, test, build on every PR
- [ ] Create `.github/workflows/deploy.yml` — deploys `apps/web` to Vercel on push to `main`
- [ ] Create `.github/workflows/deploy-api.yml` — deploys `apps/api` to Render on push to `main`
- [ ] Set up environment variable secrets in GitHub repo settings

### Global Layout Shell
- [ ] Build root layout: sidebar + topbar + main content area
- [ ] Build collapsible sidebar with navigation links and icons
- [ ] Build topbar with theme toggle, user avatar, notification bell placeholder
- [ ] Implement route transitions with Framer Motion
- [ ] Set up React Router v6 with route configuration
- [ ] Create placeholder pages for all 20 feature routes

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
