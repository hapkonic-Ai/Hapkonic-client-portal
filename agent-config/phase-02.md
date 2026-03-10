# Phase 02 — Database Schema & API Foundation

**Status:** Completed
**Estimated Duration:** 4–5 days
**Started:** 2026-03-10
**Completed:** 2026-03-10

---

## Description

Design and migrate the full Neon PostgreSQL schema via Prisma, build the versioned REST API with Express, implement all middleware layers, seed with demo data, and document all endpoints.

**Deliverable:** Fully documented REST API with seed data and test suite.

---

## Tasks

### Neon PostgreSQL Setup
- [x] Create Neon project with `main` branch (production) and `dev` branch (development)
- [x] Enable connection pooling via Neon's built-in PgBouncer
- [x] Configure environment variables: `DATABASE_URL` (pooled) + `DIRECT_URL` (direct for migrations)
- [x] Install `@neondatabase/serverless` for edge-compatible connections

### Prisma Schema — 14 Models
- [x] `User` — id, email, passwordHash, role, clientId, avatar, createdAt, lastLoginAt, isActive, forcePasswordReset
- [x] `Client` — id, companyName, logo, industry, contactName, contactEmail, contactPhone, website, onboardedAt
- [x] `Project` — id, clientId, name, description, status, startDate, endDate, overallPct, designPct, devPct, testingPct, deployPct, createdAt
- [x] `Document` — id, projectId, clientId, category, name, url, fileKey, size, mimeType, uploadedById, viewedAt, downloadedAt, version
- [x] `Milestone` — id, projectId, title, description, status, dueDate, completedAt, order
- [x] `MilestoneComment` — id, milestoneId, userId, body, parentId, isResolved, createdAt, editedAt (self-referential)
- [x] `Meeting` — id, projectId, title, gcalEventId, startTime, endTime, meetLink, type, agenda, summary, actionItems, createdById
- [x] `Task` — id, projectId, milestoneId, title, description, startDate, dueDate, assigneeId, status, dependsOn
- [x] `Invoice` — id, projectId, clientId, invoiceNumber, amount, currency, status, dueDate, paidAt, description, notes, pdfUrl, reminderSnoozedUntil
- [x] `PaymentReminder` — id, invoiceId, sentAt, channel, triggerType
- [x] `ProgressUpdate` — id, projectId, userId, body, overallPct, designPct, devPct, testingPct, deployPct, attachments[], createdAt
- [x] `ProgressComment` — id, progressUpdateId, userId, body, parentId, createdAt, editedAt (self-referential)
- [x] `ProgressReaction` — id, progressUpdateId, userId, emoji (unique constraint)
- [x] `Notification` — id, userId, type, title, body, entityId, entityType, isRead, createdAt
- [x] `AdminLog` — id, userId, action, entityType, entityId, meta, createdAt, ipAddress
- [x] Schema migrated and Prisma client generated

### API Foundation (`apps/api`)
- [x] Initialize Express app with TypeScript
- [x] Configure versioned routing: `/api/v1/`
- [x] Set up Socket.io for real-time (user rooms pattern)
- [x] Route files: auth, clients, projects, documents, milestones, meetings, invoices, progress, notifications, admin

### Middleware Stack
- [x] Auth guard middleware (JWT verification, role check, `req.user` injection)
- [x] `auditLog()` middleware helper for AdminLog entries
- [x] Rate limiter middleware (Upstash Redis — sliding window, per-endpoint)
- [x] Request logger middleware (Morgan)
- [x] Error handler middleware (centralized AppError class, typed responses)
- [x] CORS configuration (whitelist frontend origin)
- [x] Body parser + request size limits
- [x] Helmet for HTTP security headers
- [x] Zod `validate()` middleware for all routes

### Auth Routes (`/api/v1/auth`)
- [x] POST /login (bcrypt compare, JWT access + refresh, HTTP-only cookie)
- [x] POST /refresh (cookie rotation, Upstash Redis check)
- [x] POST /logout (clear Redis + cookie)
- [x] POST /forgot-password (rate-limited, OTP via Resend, 5min Redis TTL)
- [x] POST /verify-otp
- [x] POST /reset-password
- [x] POST /change-password (authenticated)
- [x] GET /me (authenticated)

### Resource Routes
- [x] `/clients` — CRUD + deactivate
- [x] `/projects` — CRUD with milestones/tasks/progress in GET /:id
- [x] `/milestones` — CRUD + threaded comments + resolve endpoint
- [x] `/documents` — CRUD + download logging (signed URL placeholder)
- [x] `/meetings` — CRUD (Google Calendar sync deferred to Phase 7)
- [x] `/invoices` — CRUD + status update + snooze + summary stats
- [x] `/progress` — CRUD + threaded comments + emoji reactions
- [x] `/notifications` — list, mark read, mark all read
- [x] `/admin/users` — list, create (with Resend credentials email), update, reset-password
- [x] `/admin/logs` — filterable activity log
- [x] `/admin/stats` — dashboard counts + invoice totals

### Seed Data
- [x] 2 staff users (admin + manager), 3 clients, 3 client users
- [x] 4 projects (2 in-progress, 1 planning, 1 completed)
- [x] 5 milestones with comments
- [x] 9 tasks across milestones
- [x] 5 documents (mixed categories)
- [x] 3 meetings (review, kickoff, standup)
- [x] 6 invoices (paid, pending, overdue)
- [x] 3 progress updates + comments + reactions
- [x] 3 notifications
- [x] 5 admin log entries
- [x] `prisma.seed` configured in package.json → `tsx prisma/seed.ts`

### API Documentation
- [x] Bruno collection created in `docs/api/hapkonic-portal/`
- [x] Two environments: local (localhost:4000) and production
- [x] Auth flows: login (with auto token capture), refresh, me, logout, forgot-password, change-password
- [x] All CRUD endpoints: clients, projects, milestones, documents, meetings, invoices, progress, notifications
- [x] Admin endpoints: users, logs, stats
- [x] Auto-capture env vars from create responses (clientId, projectId, etc.)

---

## Commit

**Message:** `chore(phase-02): complete Phase 2 — Database Schema & API Foundation`

**Steps:**
```bash
git config user.name "Harsh Raj A"
git config user.email "hraj20000@gmail.com"
git add .
git commit -m "chore(phase-02): complete Phase 2 — Database Schema & API Foundation"
git push origin main
```

> See [COMMIT_GUIDE.md](COMMIT_GUIDE.md) — **Never add Co-Authored-By lines.**

---

## Notes

- Schema extended to 14 models (vs. 12 originally planned): added `ProgressComment`, `ProgressReaction`, `ProgressCommentReaction` for richer progress feed
- `@neondatabase/serverless` installed for Neon HTTP driver compatibility
- Upstash Redis gracefully degrades to no-op in development when env vars absent
- Prisma singleton pattern (`global.__prisma`) prevents connection pool exhaustion during dev hot-reload
- Socket.io integrated in `apps/api/src/index.ts`; user rooms (`user:{id}`) established on connection for Phase 12 notifications
- Google Calendar sync stubbed with TODO in `POST /meetings` — full implementation in Phase 7
