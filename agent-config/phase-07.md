# Phase 07 — Meeting Scheduler + Google Calendar Sync

**Status:** Not Started
**Estimated Duration:** 4–5 days
**Started:** —
**Completed:** —

---

## Description

Integrate Google Calendar via OAuth 2.0 for bi-directional meeting sync, build a client-facing meeting dashboard showing the next 2 weeks of meetings with join links, agendas, and automated reminders.

**Deliverable:** Synced meeting schedule showing upcoming 2 weeks with join links and agendas.

---

## Tasks

### Google Calendar OAuth 2.0
- [ ] Create Google Cloud project, enable Calendar API
- [ ] Set up OAuth 2.0 credentials (client ID + secret)
- [ ] Implement OAuth consent flow for Hapkonic's calendar account (server-side)
- [ ] Store and refresh Google OAuth tokens securely
- [ ] Verify calendar access with test event creation

### Bi-Directional Sync
- [ ] Create meeting in Hapkonic DB → create Google Calendar event via API
- [ ] Edit meeting in DB → update Google Calendar event
- [ ] Delete meeting in DB → delete Google Calendar event
- [ ] Store `gcal_event_id` in Meeting model for reference

### Google Calendar Webhook (Real-Time)
- [ ] Register Google Calendar push notification channel (webhook)
- [ ] Implement webhook endpoint to receive calendar change notifications
- [ ] Sync incoming calendar changes (external edits/deletions) to DB
- [ ] Handle webhook renewal (channels expire, must be renewed)

### Client Meeting Dashboard
- [ ] "Next 2 Weeks" default view (configurable range)
- [ ] Three view modes:
  - [ ] Timeline: horizontal day-by-day with meeting blocks
  - [ ] Calendar grid: month/week grid view
  - [ ] List: chronological list with date grouping
- [ ] Meeting cards: title, date/time, duration, Google Meet link, attendees, type badge
- [ ] Color-coded by type: Kickoff (blue), Review (purple), Standup (green), Demo (orange), Ad-hoc (gray)
- [ ] Empty state when no meetings in range

### Countdown Timer
- [ ] Real-time countdown for next upcoming meeting (if within 24 hours)
- [ ] Shows hours:minutes:seconds ticking down
- [ ] "Starts in X days" for meetings further out

### Meeting Actions
- [ ] "Join Meeting" button — opens Google Meet URL in new tab
- [ ] Pre-meeting agenda: admin adds notes, client can read before meeting
- [ ] Post-meeting: admin adds summary + action items after meeting ends
- [ ] Action items rendered as checklist (client can view, cannot edit)

### Notifications
- [ ] Email reminder via Resend: 24h before + 1h before meeting
- [ ] In-app notification: 24h before + 1h before (via notification system from Phase 12)
- [ ] Reminder uses React Email template with meeting details + Join button

---

## Commit

**Message:** `chore(phase-07): complete Phase 7 — Meeting Scheduler + Google Calendar Sync`

**Steps:**
```bash
git config user.name "Harsh Raj A"
git config user.email "hraj20000@gmail.com"
git add .
git commit -m "chore(phase-07): complete Phase 7 — Meeting Scheduler + Google Calendar Sync"
git push origin main
```

> See [COMMIT_GUIDE.md](COMMIT_GUIDE.md) — **Never add Co-Authored-By lines.**

---

## Notes / Blockers

_Add notes here as work progresses._
