# Phase 19 — Client Onboarding & Documentation

**Status:** Completed
**Estimated Duration:** 3–4 days
**Started:** 2026-03-10
**Completed:** 2026-03-10

---

## Description

Build a guided first-login walkthrough with driver.js, an in-app help center, contextual tooltips, full Swagger/OpenAPI API docs, an admin user guide, deployment runbook, and client-facing help articles.

**Deliverable:** Smooth onboarding experience with comprehensive documentation for all user types.

---

## Tasks

### First-Login Guided Tour
- [x] Install driver.js (or Shepherd.js)
- [x] Trigger tour automatically on first login (after forced password change)
- [x] Tour steps (7–10 steps): Welcome → Dashboard overview → Documents → Roadmap → Progress tracker → Meetings → Invoices → Notifications → Done
- [x] Each step: highlight element + tooltip with title, description, "Next" / "Skip" buttons
- [x] Progress indicator (e.g., "Step 3 of 9") in tooltip
- [x] "Skip tour" button on first step and final step
- [x] "Show me again" option in user settings (resets tour flag)
- [x] Tour does not re-trigger on subsequent logins (flag stored in DB + localStorage)

### In-App Help Widget
- [x] Floating help button (?) in bottom-right corner
- [x] Expands to panel: search input + FAQ list + "Contact support" link
- [x] FAQ items: expandable accordion, grouped by category
- [x] FAQ search filters items in real-time
- [x] Short video walkthrough links for each major feature (YouTube embeds or internal)
- [x] Contextual help tooltips on complex UI elements (hover icon → tooltip with explanation)

### Swagger / OpenAPI Documentation
- [x] Install `swagger-ui-express` + `swagger-jsdoc` in `apps/api`
- [x] Document all endpoints with JSDoc annotations (path, method, params, body, responses)
- [x] Serve Swagger UI at `/api/docs` (protected — admin only or internal)
- [x] Export OpenAPI JSON spec to `docs/api/openapi.json`
- [x] Document auth requirements (Bearer token) for all protected endpoints

### Admin User Guide
- [x] How to onboard a new client (step-by-step with screenshots)
- [x] How to create and send login credentials
- [x] How to create a project and add milestones/tasks
- [x] How to upload documents and categorize them
- [x] How to post a progress update
- [x] How to create and manage invoices
- [x] How to schedule a meeting (Google Calendar sync)
- [x] How to respond to client milestone comments
- [x] How to use the activity log and filters
- [x] Saved as Markdown in `docs/admin-guide/`

### Deployment Runbook
- [x] How to redeploy frontend (Vercel trigger)
- [x] How to redeploy backend (Render trigger)
- [x] How to run database migrations (`prisma migrate deploy`)
- [x] How to rollback a Vercel deployment
- [x] How to view and export Sentry errors
- [x] How to check uptime and respond to alerts
- [x] Saved as Markdown in `docs/runbook.md`

### Client-Facing Help Articles
- [x] "How to view and download your documents"
- [x] "How to check your project progress and roadmap"
- [x] "How to view and download invoices"
- [x] "How to join scheduled meetings"
- [x] "How to comment on milestones"
- [x] Saved as Markdown in `docs/client-help/`

---

## Commit

**Message:** `chore(phase-19): complete Phase 19 — Client Onboarding & Documentation`

**Steps:**
```bash
git config user.name "Harsh Raj A"
git config user.email "hraj20000@gmail.com"
git add .
git commit -m "chore(phase-19): complete Phase 19 — Client Onboarding & Documentation"
git push origin main
```

> See [COMMIT_GUIDE.md](COMMIT_GUIDE.md) — **Never add Co-Authored-By lines.**

---

## Notes / Blockers

_Add notes here as work progresses._
