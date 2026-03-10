# Phase 02 — Database Schema & API Foundation

**Status:** Not Started
**Estimated Duration:** 4–5 days
**Started:** —
**Completed:** —

---

## Description

Design and migrate the full Neon PostgreSQL schema via Prisma, build the versioned REST API with Express, implement all middleware layers, seed with demo data, and document all endpoints.

**Deliverable:** Fully documented REST API with seed data and test suite.

---

## Tasks

### Neon PostgreSQL Setup
- [ ] Create Neon project with `main` branch (production) and `dev` branch (development)
- [ ] Enable connection pooling via Neon's built-in PgBouncer
- [ ] Configure environment variables: `DATABASE_URL` (pooled) + `DIRECT_URL` (direct for migrations)
- [ ] Install `@neondatabase/serverless` for edge-compatible connections

### Prisma Schema — 12 Models
- [ ] `User` — id, email, password_hash, role, client_id, avatar, created_at, last_login, is_active, force_password_reset
- [ ] `Client` — id, company_name, logo, industry, contact_name, contact_email, contact_phone, onboarded_at
- [ ] `Project` — id, client_id, name, description, status, start_date, end_date, created_at
- [ ] `Document` — id, project_id, category, label, file_url, file_key, uploaded_by, uploaded_at, viewed_at, downloaded_at
- [ ] `Milestone` — id, project_id, title, description, status, target_date, completed_at, order
- [ ] `MilestoneComment` — id, milestone_id, user_id, body, parent_id, is_resolved, created_at, edited_at
- [ ] `Meeting` — id, project_id, title, gcal_event_id, start_time, end_time, meet_link, type, agenda, summary, created_by
- [ ] `Task` — id, project_id, milestone_id, title, description, start_date, end_date, progress, assignee_id, status, depends_on
- [ ] `Invoice` — id, client_id, invoice_number, amount, status, due_date, paid_date, pdf_url, pdf_key, uploaded_by, notes
- [ ] `PaymentReminder` — id, invoice_id, sent_at, channel, trigger_type
- [ ] `ProgressUpdate` — id, project_id, user_id, body, overall_percentage, design_pct, dev_pct, testing_pct, deploy_pct, attachments, created_at
- [ ] `AdminLog` — id, user_id, action, entity_type, entity_id, metadata, created_at, ip_address
- [ ] Run `prisma migrate dev` and validate schema
- [ ] Generate Prisma client

### API Foundation (`apps/api`)
- [ ] Initialize Express app with TypeScript
- [ ] Configure versioned routing: `/api/v1/`
- [ ] Set up route files: auth, clients, projects, documents, milestones, meetings, tasks, invoices, progress, notifications, admin

### Middleware Stack
- [ ] Auth guard middleware (JWT verification, role check)
- [ ] Rate limiter middleware (Upstash Redis — per-IP + per-endpoint limits)
- [ ] Request logger middleware (Morgan + structured JSON logs)
- [ ] Error handler middleware (centralized, typed error responses)
- [ ] CORS configuration (whitelist frontend origin)
- [ ] Body parser + request size limits
- [ ] Helmet for HTTP security headers

### Seed Data
- [ ] Create seed script: 2 admin users, 3 clients, 2 projects per client
- [ ] Seed milestones (4–6 per project), tasks (3–5 per milestone)
- [ ] Seed sample documents (all 11 categories), invoices (mix of statuses)
- [ ] Seed progress updates (5 per project), meeting records
- [ ] Seed AdminLog entries
- [ ] Run `prisma db seed` and verify

### API Documentation
- [ ] Write Postman/Bruno collection covering all CRUD endpoints
- [ ] Document request/response shapes, auth headers, error codes
- [ ] Export collection JSON and commit to `docs/api/`

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

## Notes / Blockers

_Add notes here as work progresses._
