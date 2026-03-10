# Phase 13 — Search, Filtering & Global Navigation

**Status:** Not Started
**Estimated Duration:** 3–4 days
**Started:** —
**Completed:** —

---

## Description

Build a Cmd+K global command palette for instant cross-resource search, a polished collapsible sidebar with project switcher, dynamic breadcrumbs, and a reusable unified filter bar used across all list views.

**Deliverable:** Seamless navigation and search that makes finding anything instant.

---

## Tasks

### Global Command Palette (Cmd+K / Ctrl+K)
- [ ] Keyboard shortcut registers globally (`useEffect` with keydown listener)
- [ ] Full-screen overlay with centered search input (backdrop blur)
- [ ] Search across: documents, milestones, meetings, invoices, comments, projects
- [ ] Results grouped by type with icon indicators
- [ ] Recent searches shown when input is empty
- [ ] Suggested actions: "Go to Dashboard", "View Invoices", "Open Roadmap", etc.
- [ ] Keyboard navigation: arrow up/down to select, Enter to navigate, Esc to close
- [ ] Highlight matching text in results
- [ ] Debounced API search (300ms) for real-time results

### Sidebar Navigation
- [ ] Collapsible sidebar: expanded (with labels) ↔ icon-only mode
- [ ] Toggle button (chevron) with smooth width transition animation
- [ ] Active route indicator: animated sliding pill/bar behind active nav item
- [ ] Icon animations on hover (subtle scale or color transition)
- [ ] Quick-access pinned items section (user can pin any page)
- [ ] Project switcher dropdown at top of sidebar (for clients with multiple projects)
- [ ] Sidebar state persisted in localStorage

### Breadcrumbs
- [ ] Dynamic breadcrumb trail on every page (auto-generated from route)
- [ ] Clickable intermediate crumbs
- [ ] Truncate long labels on mobile

### Contextual Navigation
- [ ] Back button with route history (uses browser history, not hardcoded paths)
- [ ] "Back to project" button on deep pages (document, milestone, meeting detail)

### Unified Filter Bar Component
- [ ] Reusable `<FilterBar>` component used in: documents, invoices, meetings, milestones, tasks, admin logs
- [ ] Date range picker (start + end date)
- [ ] Multi-select dropdown filters (category, status, assignee, etc. — configurable per page)
- [ ] Text search input
- [ ] Active filter chips: show applied filters, click X to remove individual filter
- [ ] "Clear all filters" button
- [ ] Save filter preset: name preset, persist to user profile (Upstash Redis or DB)
- [ ] Load saved presets from dropdown

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
