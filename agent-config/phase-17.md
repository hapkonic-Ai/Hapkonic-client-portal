# Phase 17 — Testing & Quality Assurance

**Status:** Not Started
**Estimated Duration:** 5–6 days
**Started:** —
**Completed:** —

---

## Description

Build a comprehensive test suite: Jest unit tests (≥80% coverage), Supertest API tests, Playwright E2E for critical user journeys, k6 load testing, and a full WCAG 2.1 AA accessibility audit.

**Deliverable:** Fully tested application with automated test suite and CI integration.

---

## Tasks

### Unit Tests — Frontend (Jest + React Testing Library)
- [ ] Test all `packages/ui` components: Button, Input, Card, Badge, Avatar, Modal, Tooltip
- [ ] Test auth forms: login validation, forgot password, change password
- [ ] Test dashboard components: radial progress ring, breakdown cards, sparkline
- [ ] Test document vault: upload component, file card, PDF viewer trigger
- [ ] Test invoice table: status badge rendering, sorting, filter
- [ ] Test notification bell: unread count, dropdown open/close, mark read
- [ ] Test command palette: open/close, keyboard navigation, result rendering
- [ ] Target: ≥80% code coverage (check with `jest --coverage`)

### Unit Tests — API (Jest + Supertest)
- [ ] Auth endpoints: login success, login failure, rate limit, refresh token, logout
- [ ] Client CRUD endpoints: create, read, update, delete, authorization
- [ ] Project endpoints: create, update, status change, milestone operations
- [ ] Document endpoints: upload metadata, list, access log, delete
- [ ] Invoice endpoints: create, status update, reminder trigger
- [ ] All endpoints: unauthenticated → 401, wrong role → 403

### Integration Tests
- [ ] Auth flow: register → login → access protected route → refresh → logout
- [ ] Document flow: admin uploads → client lists → client views → access log recorded
- [ ] Google Calendar sync flow: create meeting → verify event created in calendar
- [ ] Invoice flow: create invoice → reminder schedule queued → manual status update

### E2E Tests (Playwright)
- [ ] **Client journey:** Login → Dashboard → View documents (open PDF) → View roadmap (Gantt) → Download invoice
- [ ] **Admin journey:** Login → Create client → Upload document → Set milestones → Create invoice → Send reminder
- [ ] **Auth journey:** Wrong password → lockout after 5 attempts → unlock → forgot password → OTP → reset
- [ ] **Comment journey:** Post progress update → Client comments → Admin replies → Mark resolved
- [ ] Run E2E in headless mode in CI

### Performance / Load Tests (k6)
- [ ] Simulate 100 concurrent users logging in simultaneously
- [ ] Simulate 100 users browsing dashboard + document list
- [ ] Simulate 50 users posting comments (Socket.io load)
- [ ] Identify and fix endpoints with p95 response time > 500ms
- [ ] Run slow query log analysis on Neon after load test

### Frontend Bundle Analysis
- [ ] Run `vite-bundle-analyzer` or `webpack-bundle-analyzer`
- [ ] Identify and code-split large chunks
- [ ] Verify no unintended duplication of heavy libraries (Three.js, D3.js)
- [ ] Confirm all routes are lazy-loaded

### Accessibility Audit (WCAG 2.1 AA)
- [ ] Run axe DevTools audit on all main pages
- [ ] Fix: missing aria-labels on interactive elements
- [ ] Fix: insufficient color contrast ratios
- [ ] Fix: focus trap in modals and command palette
- [ ] Fix: keyboard navigation for Gantt chart and timeline
- [ ] Screen reader test: NVDA/VoiceOver on dashboard, forms, tables
- [ ] Verify all images have descriptive alt text

---

## Commit

**Message:** `chore(phase-17): complete Phase 17 — Testing & Quality Assurance`

**Steps:**
```bash
git config user.name "Harsh Raj A"
git config user.email "hraj20000@gmail.com"
git add .
git commit -m "chore(phase-17): complete Phase 17 — Testing & Quality Assurance"
git push origin main
```

> See [COMMIT_GUIDE.md](COMMIT_GUIDE.md) — **Never add Co-Authored-By lines.**

---

## Notes / Blockers

_Add notes here as work progresses._
