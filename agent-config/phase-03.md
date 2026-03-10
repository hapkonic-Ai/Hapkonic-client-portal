# Phase 03 — Hapkonic Admin Portal

**Status:** Not Started
**Estimated Duration:** 5–6 days
**Started:** —
**Completed:** —

---

## Description

Build the complete admin control center at `/admin` — a protected portal where Hapkonic team manages all clients, projects, documents, invoices, meetings, and communication in one place.

**Deliverable:** A powerful single admin portal where Hapkonic team manages everything.

---

## Tasks

### Admin Route Protection
- [ ] Create `/admin` protected route layout (role: `admin`, `manager`)
- [ ] Admin sidebar with sections: Dashboard, Clients, Projects, Documents, Invoices, Meetings, Comments, Logs
- [ ] Admin topbar with current user info and logout

### Client Management
- [ ] Client list page: table with search, filter by industry, sort
- [ ] Create client form: company name, logo upload, industry, contact info
- [ ] Edit client form with logo replacement
- [ ] Client detail page: overview of all projects, documents, invoices, activity
- [ ] Deactivate/reactivate client accounts
- [ ] Assign / unassign projects to clients

### User & Credential Management
- [ ] User list page: table with role badges, active/inactive status
- [ ] Create user form: email, role (admin/manager/client), assign to client
- [ ] Auto-generate secure password with copy button
- [ ] Send credentials email via Resend (branded template)
- [ ] Force password reset on first login toggle
- [ ] Edit user: change role, re-assign client, reset password
- [ ] Deactivate/reactivate user accounts
- [ ] View active sessions per user, revoke individual sessions

### Project Management
- [ ] Project list: filter by client, status, date range
- [ ] Create/edit project: name, description, client, date range, status
- [ ] Milestone manager within project: add/edit/reorder/delete milestones
- [ ] Task manager within milestone: add/edit/delete tasks, set dates, progress, assignee
- [ ] Task dependency configuration (finish-to-start)
- [ ] Bulk reorder milestones via drag-and-drop

### Document Upload Center
- [ ] Drag-and-drop multi-file uploader with progress bars (Uploadthing)
- [ ] Select project and category (11 predefined + custom) per upload
- [ ] Bulk upload: select multiple files, assign categories individually
- [ ] Replace/version existing documents
- [ ] View document access log: who viewed/downloaded, when
- [ ] Delete documents with confirmation

### Progress Update Publisher
- [ ] Rich text editor (Markdown + image embed) for progress updates
- [ ] Select project, set overall percentage and per-category breakdown (design/dev/testing/deploy)
- [ ] Attach screenshots, files, or links to update
- [ ] Preview before publish
- [ ] Edit/delete published updates

### Invoice Manager
- [ ] Upload PDF invoices per client (Uploadthing)
- [ ] Set invoice number, amount, due date, line item notes
- [ ] Status management: Pending → Paid / Partially Paid / Overdue / Written Off
- [ ] Add payment received date and notes when marking paid
- [ ] Add admin notes (visible to client)
- [ ] Trigger payment reminder emails manually
- [ ] Revenue overview: monthly/quarterly breakdown
- [ ] Outstanding aging report: 0–30, 31–60, 61–90, 90+ days overdue
- [ ] Bulk reminder trigger for all overdue invoices

### Meeting Scheduler
- [ ] Create/edit meetings linked to Google Calendar
- [ ] Set title, date/time, duration, meeting type, Google Meet link, attendees
- [ ] Add pre-meeting agenda notes (client-visible)
- [ ] Add post-meeting summary + action items after meeting
- [ ] View all upcoming meetings across all clients

### Milestone Comment Inbox
- [ ] Unified inbox: all client comments across all milestones
- [ ] Filter by client, project, resolved/unresolved, date
- [ ] Reply to client comments directly from inbox
- [ ] Mark conversations as resolved
- [ ] Unread / flagged comment indicators
- [ ] Badge count on sidebar nav item

### Activity Log
- [ ] Full audit trail table: user, action, entity type, entity ID, timestamp, IP
- [ ] Filter by admin user, action type, date range
- [ ] Search by entity ID or description
- [ ] Export log as CSV

---

## Commit

**Message:** `chore(phase-03): complete Phase 3 — Hapkonic Admin Portal`

**Steps:**
```bash
git config user.name "Harsh Raj A"
git config user.email "hraj20000@gmail.com"
git add .
git commit -m "chore(phase-03): complete Phase 3 — Hapkonic Admin Portal"
git push origin main
```

> See [COMMIT_GUIDE.md](COMMIT_GUIDE.md) — **Never add Co-Authored-By lines.**

---

## Notes / Blockers

_Add notes here as work progresses._
