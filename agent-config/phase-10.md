# Phase 10 — Historical Milestone Timeline

**Status:** Not Started
**Estimated Duration:** 5–6 days
**Started:** —
**Completed:** —

---

## Description

Build a visually rich vertical alternating timeline with scroll-triggered animations, clickable milestone popups with full details, and per-milestone conversation threads between client and Hapkonic team.

**Deliverable:** Beautiful sequential milestone timeline with built-in client-provider conversation per milestone.

---

## Tasks

### Timeline Layout
- [ ] Vertical alternating timeline (left-right zigzag layout, centered connector line)
- [ ] Milestone nodes: icon, title, date, status indicator, mini description
- [ ] Connector line animates (draws/grows downward) as user scrolls
- [ ] Status colors: Completed (green pulse glow), Current/In Progress (blue glow), Upcoming (gray)
- [ ] Parallax depth on milestone cards during scroll (cards move at slightly different rate)

### Scroll Animations
- [ ] Staggered entrance for each node on first scroll into view (Framer Motion or GSAP)
- [ ] Subtle floating particles or dots connecting milestone nodes (Three.js or CSS animation)
- [ ] Celebration confetti burst (canvas-confetti) when all milestones are completed

### Milestone Popup / Detail Drawer
- [ ] Click milestone node → slide-in detail drawer from right (or centered modal)
- [ ] Drawer content:
  - [ ] Full description and deliverables list
  - [ ] Attached files/screenshots grid
  - [ ] Target date vs actual completion date comparison (color-coded: on-time/late)
  - [ ] Who marked it complete + when
  - [ ] Conversation thread (see below)

### Per-Milestone Conversation Thread
- [ ] Threaded message exchange: client ↔ Hapkonic team
- [ ] Post message: text input + file attachment support
- [ ] Reply to specific message (indented thread)
- [ ] Timestamps, author name + avatar on each message
- [ ] Unread indicator badge on milestone node in timeline (red dot, count)
- [ ] "Resolve Thread" button (admin only) — marks conversation as resolved, hides from unread
- [ ] Resolved conversations still viewable (collapsed by default, expandable)

### Filtering & Search
- [ ] Filter tabs: All / Completed / In Progress / Upcoming
- [ ] Keyword search input — highlights matching milestone titles/descriptions
- [ ] Results animate in/out on filter change

### Export
- [ ] Print/Export timeline as PDF (captures full scrollable timeline)
- [ ] Includes project name, client name, export date in PDF header

---

## Commit

**Message:** `chore(phase-10): complete Phase 10 — Historical Milestone Timeline`

**Steps:**
```bash
git config user.name "Harsh Raj A"
git config user.email "hraj20000@gmail.com"
git add .
git commit -m "chore(phase-10): complete Phase 10 — Historical Milestone Timeline"
git push origin main
```

> See [COMMIT_GUIDE.md](COMMIT_GUIDE.md) — **Never add Co-Authored-By lines.**

---

## Notes / Blockers

_Add notes here as work progresses._
