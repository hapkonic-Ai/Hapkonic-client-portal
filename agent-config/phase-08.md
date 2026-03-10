# Phase 08 — Interactive Gantt Chart / Roadmap

**Status:** Not Started
**Estimated Duration:** 6–7 days
**Started:** —
**Completed:** —

---

## Description

Build a rich, interactive Gantt chart with D3.js or frappe-gantt, featuring drag-resize, dependency arrows, critical path, real-time WebSocket updates, and export capabilities.

**Deliverable:** A rich, interactive Gantt chart giving clients full visibility into their project roadmap.

---

## Tasks

### Gantt Engine Setup
- [ ] Evaluate and choose between custom D3.js or extending `frappe-gantt` / `dhtmlx-gantt`
- [ ] Render horizontal timeline with task bars
- [ ] Map Task model data (start_date, end_date, milestone_id, status, progress) to Gantt rows

### Timeline & Zoom
- [ ] Zoomable scale: Day / Week / Month / Quarter views
- [ ] Zoom controls: buttons + mouse wheel / trackpad pinch
- [ ] Smooth pan: click-drag horizontal scroll
- [ ] "Jump to Today" button

### Task Bars (Admin Edit Mode)
- [ ] Drag-to-resize task bar (change end date)
- [ ] Drag-to-move task bar (change start/end dates)
- [ ] Drag-to-reorder tasks within milestone
- [ ] Nest tasks under milestones (collapsible groups)
- [ ] All edits persist to DB via API (optimistic update + server confirm)

### Visual Design
- [ ] Color-coded by status: Not Started (gray), In Progress (blue), Completed (green), Blocked (red), Delayed (orange)
- [ ] Progress fill inside each bar (percentage-based gradient left-to-right)
- [ ] Today marker: vertical red line with pulse animation
- [ ] Milestone diamonds on the timeline row
- [ ] Smooth rendering (canvas-based or SVG with virtualization for large datasets)

### Dependency Arrows
- [ ] Draw finish-to-start and start-to-start dependency lines between tasks
- [ ] Arrows auto-reroute when tasks are moved
- [ ] Critical path tasks highlighted in red

### Interactivity
- [ ] Click task bar → slide-out detail panel (description, assignee, dates, dependencies, comments)
- [ ] Filter sidebar: by milestone, assignee, status, date range
- [ ] Toggle between Gantt view and Kanban board view
- [ ] Minimap navigator for large projects (shows full timeline, highlights viewport)

### Real-Time Updates (WebSocket)
- [ ] Admin edits a task → all connected clients see bar move/resize in real-time
- [ ] Socket.io event: `task:updated` with new task data
- [ ] Optimistic UI: update locally immediately, revert on error

### Export
- [ ] Export Gantt as PNG (html2canvas or SVG serialization)
- [ ] Export Gantt as PDF (jsPDF)
- [ ] Include project name and date range in export header

---

## Commit

**Message:** `chore(phase-08): complete Phase 8 — Interactive Gantt Chart / Roadmap`

**Steps:**
```bash
git config user.name "Harsh Raj A"
git config user.email "hraj20000@gmail.com"
git add .
git commit -m "chore(phase-08): complete Phase 8 — Interactive Gantt Chart / Roadmap"
git push origin main
```

> See [COMMIT_GUIDE.md](COMMIT_GUIDE.md) — **Never add Co-Authored-By lines.**

---

## Notes / Blockers

_Add notes here as work progresses._
