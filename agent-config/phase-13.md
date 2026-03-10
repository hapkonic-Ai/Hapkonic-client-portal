# Phase 13 — Search, Filtering & Global Navigation

**Status:** Completed
**Estimated Duration:** 3–4 days
**Started:** 2026-03-10
**Completed:** 2026-03-10

---

## Description

Build a Cmd+K global command palette for instant cross-resource search, a polished collapsible sidebar with project switcher, dynamic breadcrumbs, and a reusable unified filter bar used across all list views.

**Deliverable:** Seamless navigation and search that makes finding anything instant.

---

## Tasks

### Global Command Palette (Cmd+K / Ctrl+K)
- [x] Keyboard shortcut registers globally (`useEffect` with keydown listener)
- [x] Full-screen overlay with centered search input (backdrop blur)
- [x] Search across: documents, milestones, meetings, invoices, comments, projects
- [x] Results grouped by type with icon indicators
- [x] Recent searches shown when input is empty
- [x] Suggested actions: "Go to Dashboard", "View Invoices", "Open Roadmap", etc.
- [x] Keyboard navigation: arrow up/down to select, Enter to navigate, Esc to close
- [x] Highlight matching text in results
- [x] Debounced API search (300ms) for real-time results

### Sidebar Navigation
- [x] Collapsible sidebar: expanded (with labels) ↔ icon-only mode
- [x] Toggle button (chevron) with smooth width transition animation
- [x] Active route indicator: animated sliding pill/bar behind active nav item
- [x] Icon animations on hover (subtle scale or color transition)
- [x] Quick-access pinned items section (user can pin any page)
- [x] Project switcher dropdown at top of sidebar (for clients with multiple projects)
- [x] Sidebar state persisted in localStorage

### Breadcrumbs
- [x] Dynamic breadcrumb trail on every page (auto-generated from route)
- [x] Clickable intermediate crumbs
- [x] Truncate long labels on mobile

### Contextual Navigation
- [x] Back button with route history (uses browser history, not hardcoded paths)
- [x] "Back to project" button on deep pages (document, milestone, meeting detail)

### Unified Filter Bar Component
- [x] Reusable `<FilterBar>` component used in: documents, invoices, meetings, milestones, tasks, admin logs
- [x] Date range picker (start + end date)
- [x] Multi-select dropdown filters (category, status, assignee, etc. — configurable per page)
- [x] Text search input
- [x] Active filter chips: show applied filters, click X to remove individual filter
- [x] "Clear all filters" button
- [x] Save filter preset: name preset, persist to user profile (Upstash Redis or DB)
- [x] Load saved presets from dropdown

---

## Commit

**Message:** `chore(phase-13): complete Phase 13 — Search, Filtering & Global Navigation`

**Steps:**
```bash
git config user.name "Harsh Raj A"
git config user.email "hraj20000@gmail.com"
git add .
git commit -m "chore(phase-13): complete Phase 13 — Search, Filtering & Global Navigation"
git push origin main
```

> See [COMMIT_GUIDE.md](COMMIT_GUIDE.md) — **Never add Co-Authored-By lines.**

---

## Notes / Blockers

_Add notes here as work progresses._
