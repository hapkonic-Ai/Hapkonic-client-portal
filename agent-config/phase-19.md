# Phase 19 — Client Onboarding & Documentation

**Status:** Not Started
**Estimated Duration:** 3–4 days
**Started:** —
**Completed:** —

---

## Description

Build a guided first-login walkthrough with driver.js, an in-app help center, contextual tooltips, full Swagger/OpenAPI API docs, an admin user guide, deployment runbook, and client-facing help articles.

**Deliverable:** Smooth onboarding experience with comprehensive documentation for all user types.

---

## Tasks

### First-Login Guided Tour
- [ ] Install driver.js (or Shepherd.js)
- [ ] Trigger tour automatically on first login (after forced password change)
- [ ] Tour steps (7–10 steps): Welcome → Dashboard overview → Documents → Roadmap → Progress tracker → Meetings → Invoices → Notifications → Done
- [ ] Each step: highlight element + tooltip with title, description, "Next" / "Skip" buttons
- [ ] Progress indicator (e.g., "Step 3 of 9") in tooltip
- [ ] "Skip tour" button on first step and final step
- [ ] "Show me again" option in user settings (resets tour flag)
- [ ] Tour does not re-trigger on subsequent logins (flag stored in DB + localStorage)

### In-App Help Widget
- [ ] Floating help button (?) in bottom-right corner
- [ ] Expands to panel: search input + FAQ list + "Contact support" link
- [ ] FAQ items: expandable accordion, grouped by category
- [ ] FAQ search filters items in real-time
- [ ] Short video walkthrough links for each major feature (YouTube embeds or internal)
- [ ] Contextual help tooltips on complex UI elements (hover icon → tooltip with explanation)

### Swagger / OpenAPI Documentation
- [ ] Install `swagger-ui-express` + `swagger-jsdoc` in `apps/api`
- [ ] Document all endpoints with JSDoc annotations (path, method, params, body, responses)
- [ ] Serve Swagger UI at `/api/docs` (protected — admin only or internal)
- [ ] Export OpenAPI JSON spec to `docs/api/openapi.json`
- [ ] Document auth requirements (Bearer token) for all protected endpoints

### Admin User Guide
- [ ] How to onboard a new client (step-by-step with screenshots)
- [ ] How to create and send login credentials
- [ ] How to create a project and add milestones/tasks
- [ ] How to upload documents and categorize them
- [ ] How to post a progress update
- [ ] How to create and manage invoices
- [ ] How to schedule a meeting (Google Calendar sync)
- [ ] How to respond to client milestone comments
- [ ] How to use the activity log and filters
- [ ] Saved as Markdown in `docs/admin-guide/`

### Deployment Runbook
- [ ] How to redeploy frontend (Vercel trigger)
- [ ] How to redeploy backend (Render trigger)
- [ ] How to run database migrations (`prisma migrate deploy`)
- [ ] How to rollback a Vercel deployment
- [ ] How to view and export Sentry errors
- [ ] How to check uptime and respond to alerts
- [ ] Saved as Markdown in `docs/runbook.md`

### Client-Facing Help Articles
- [ ] "How to view and download your documents"
- [ ] "How to check your project progress and roadmap"
- [ ] "How to view and download invoices"
- [ ] "How to join scheduled meetings"
- [ ] "How to comment on milestones"
- [ ] Saved as Markdown in `docs/client-help/`

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
