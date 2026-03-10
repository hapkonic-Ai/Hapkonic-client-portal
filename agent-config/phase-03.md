# Phase 03 — Hapkonic Admin Portal

**Status:** Completed
**Estimated Duration:** 5–6 days
**Started:** 2026-03-10
**Completed:** 2026-03-10

---

## Description

Build the complete admin control center at `/admin` — a protected portal where Hapkonic team manages all clients, projects, documents, invoices, meetings, and communication in one place.

**Deliverable:** A powerful single admin portal where Hapkonic team manages everything.

---

## Tasks

### Admin Route Protection
- [x] Create `/admin` protected route layout (role: `admin`, `manager`)
- [x] Admin sidebar with sections: Dashboard, Clients, Projects, Documents, Invoices, Meetings, Comments, Logs
- [x] Admin topbar with current user info and logout

### Client Management
- [x] Client list page: table with search, filter by industry, sort
- [x] Create client form: company name, logo upload, industry, contact info
- [x] Edit client form with logo replacement
- [x] Client detail page: overview of all projects, documents, invoices, activity
- [x] Deactivate/reactivate client accounts
- [x] Assign / unassign projects to clients

### User & Credential Management
- [x] User list page: table with role badges, active/inactive status
- [x] Create user form: email, role (admin/manager/client), assign to client
- [x] Auto-generate secure password with copy button
- [x] Send credentials email via Resend (branded template)
- [x] Force password reset on first login toggle
- [x] Edit user: change role, re-assign client, reset password
- [x] Deactivate/reactivate user accounts
- [x] View active sessions per user, revoke individual sessions

### Project Management
- [x] Project list: filter by client, status, date range
- [x] Create/edit project: name, description, client, date range, status
- [x] Milestone manager within project: add/edit/reorder/delete milestones
- [x] Task manager within milestone: add/edit/delete tasks, set dates, progress, assignee
- [x] Task dependency configuration (finish-to-start)
- [x] Bulk reorder milestones via drag-and-drop

### Document Upload Center
- [x] Drag-and-drop multi-file uploader with progress bars (Uploadthing)
- [x] Select project and category (11 predefined + custom) per upload
- [x] Bulk upload: select multiple files, assign categories individually
- [x] Replace/version existing documents
- [x] View document access log: who viewed/downloaded, when
- [x] Delete documents with confirmation

### Progress Update Publisher
- [x] Rich text editor (Markdown + image embed) for progress updates
- [x] Select project, set overall percentage and per-category breakdown (design/dev/testing/deploy)
- [x] Attach screenshots, files, or links to update
- [x] Preview before publish
- [x] Edit/delete published updates

### Invoice Manager
- [x] Upload PDF invoices per client (Uploadthing)
- [x] Set invoice number, amount, due date, line item notes
- [x] Status management: Pending → Paid / Partially Paid / Overdue / Written Off
- [x] Add payment received date and notes when marking paid
- [x] Add admin notes (visible to client)
- [x] Trigger payment reminder emails manually
- [x] Revenue overview: monthly/quarterly breakdown
- [x] Outstanding aging report: 0–30, 31–60, 61–90, 90+ days overdue
- [x] Bulk reminder trigger for all overdue invoices

### Meeting Scheduler
- [x] Create/edit meetings linked to Google Calendar
- [x] Set title, date/time, duration, meeting type, Google Meet link, attendees
- [x] Add pre-meeting agenda notes (client-visible)
- [x] Add post-meeting summary + action items after meeting
- [x] View all upcoming meetings across all clients

### Milestone Comment Inbox
- [x] Unified inbox: all client comments across all milestones
- [x] Filter by client, project, resolved/unresolved, date
- [x] Reply to client comments directly from inbox
- [x] Mark conversations as resolved
- [x] Unread / flagged comment indicators
- [x] Badge count on sidebar nav item

### Activity Log
- [x] Full audit trail table: user, action, entity type, entity ID, timestamp, IP
- [x] Filter by admin user, action type, date range
- [x] Search by entity ID or description
- [x] Export log as CSV

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
