# Phase 09 — Progress Tracker + Comments

**Status:** Not Started
**Estimated Duration:** 4–5 days
**Started:** —
**Completed:** —

---

## Description

Build a live progress dashboard with animated radial progress ring, category breakdowns, weekly sparkline charts, and a real-time Socket.io comment system with @mentions, reactions, and threaded replies.

**Deliverable:** Live progress dashboard with rich commenting for transparent client-provider communication.

---

## Tasks

### Progress Dashboard
- [ ] Large animated radial progress ring (SVG or canvas) — overall project completion %
- [ ] Ring animates from 0 to current value on page load
- [ ] Status badge below ring: On Track / At Risk / Delayed / Completed (color-coded)
- [ ] Breakdown cards row: Design %, Development %, Testing %, Deployment %
- [ ] Each breakdown card has mini progress bar and percentage number
- [ ] Weekly progress sparkline chart (last 8 weeks) — Recharts LineChart

### Progress Updates Feed
- [ ] Timeline-style feed: newest update at top
- [ ] Each update: author avatar, name, date, description, percentage bump, attachments
- [ ] Attached screenshots render as inline image grid (click to expand lightbox)
- [ ] Attached files render as download cards
- [ ] "Load more" pagination for older updates

### Admin — Post Progress Updates
- [ ] Rich text editor (Markdown with toolbar: bold, italic, lists, headers, image embed)
- [ ] Set overall project percentage and per-category breakdown
- [ ] Attach screenshots (drag-and-drop or file picker, Uploadthing)
- [ ] Attach files (any type)
- [ ] Preview before publishing
- [ ] Edit/delete own updates (with "edited" label shown to client)

### Comment System
- [ ] Threaded comments per progress update
- [ ] Post comment: text area with Markdown support
- [ ] Reply to comment: indented thread with collapse toggle
- [ ] @mention support: `@name` triggers dropdown, sends notification
- [ ] Edit own comment (inline edit, "edited" label shown)
- [ ] Delete own comment (soft delete — shows "comment deleted")
- [ ] Emoji reactions: click reaction picker, show reaction counts + who reacted on hover

### Real-Time via Socket.io
- [ ] New comment instantly appears for all users viewing same update (no refresh needed)
- [ ] Typing indicator: "Harsh is typing..." shown to others
- [ ] New reaction appears instantly
- [ ] New progress update notifies all project members

### Notifications
- [ ] In-app notification when new progress update posted (Phase 12 integration)
- [ ] Email notification via Resend when reply to your comment
- [ ] Email notification when @mentioned

---

## Commit

**Message:** `chore(phase-09): complete Phase 9 — Progress Tracker + Comments`

**Steps:**
```bash
git config user.name "Harsh Raj A"
git config user.email "hraj20000@gmail.com"
git add .
git commit -m "chore(phase-09): complete Phase 9 — Progress Tracker + Comments"
git push origin main
```

> See [COMMIT_GUIDE.md](COMMIT_GUIDE.md) — **Never add Co-Authored-By lines.**

---

## Notes / Blockers

_Add notes here as work progresses._
