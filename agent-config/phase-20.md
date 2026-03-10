# Phase 20 — Launch, Feedback & Iteration

**Status:** Not Started
**Estimated Duration:** Ongoing
**Started:** —
**Completed:** —

---

## Description

Soft launch with 2–3 pilot clients, collect structured feedback, iterate on critical issues, then hard launch all active clients with branded announcement communications. Establish ongoing improvement cadence.

**Deliverable:** Live, production portal with continuous improvement pipeline.

---

## Tasks

### Soft Launch — Beta Access
- [ ] Identify 2–3 pilot clients for beta access
- [ ] Create their accounts, upload their project data, documents, invoices
- [ ] Send personalized beta invitation email (Resend template)
- [ ] Brief pilot clients on the portal (optional walkthrough call)
- [ ] Monitor Sentry for errors during beta period
- [ ] Monitor Vercel/Render performance metrics
- [ ] Monitor Neon query performance

### Feedback Collection
- [ ] In-app feedback widget: floating button → emoji rating (1–5) + optional text
- [ ] Store feedback in DB: rating, text, user_id, page, timestamp
- [ ] Admin feedback inbox: view all submitted feedback, filter by rating/page
- [ ] Weekly feedback review session: review all feedback, categorize, prioritize
- [ ] Feature request board: public board (visible to clients) with upvoting
  - [ ] Admin can add feature request cards
  - [ ] Clients can upvote requests
  - [ ] Admin marks items as "Planned", "In Progress", "Shipped"

### Beta Iteration
- [ ] Fix all critical (crash/data loss) issues within 24 hours of discovery
- [ ] Fix all high-priority UX issues within 3 business days
- [ ] Communicate fixes to beta clients (in-app notification or email)
- [ ] Weekly changelog update posted in the portal (admin posts as progress update)

### Hard Launch
- [ ] Migrate all remaining active clients to portal
- [ ] For each client: create accounts, seed project data, upload all documents, invoices
- [ ] Send branded launch announcement email to all clients (Resend + React Email)
- [ ] Post on social media (LinkedIn, Instagram): portal launch announcement
- [ ] Update Hapkonic website to reference the client portal
- [ ] Internal team announcement + training session

### Post-Launch Ongoing Cadence
- [ ] Monthly feature update releases (minor UX improvements, new features from request board)
- [ ] Quarterly security audit (run OWASP ZAP, review Sentry patterns, update dependencies)
- [ ] Annual UX review and refresh (full design audit, user interviews)
- [ ] Monitor free-tier usage limits monthly (Neon, Uploadthing, Vercel, Render, Upstash, Resend)
- [ ] Plan paid tier upgrade triggers (thresholds for when to upgrade each service)

### Future Roadmap (Backlog)
- [ ] AI-powered project health predictions (risk detection based on activity patterns)
- [ ] Client-side file upload and sharing (clients can upload files to Hapkonic)
- [ ] Multi-language support (i18n — Hindi, other regional languages)
- [ ] White-label option for sub-agencies
- [ ] Native mobile app (React Native — iOS + Android)
- [ ] Slack / Teams integration for notifications
- [ ] Custom client branding per portal (logo, colors)

---

## Commit

**Message:** `chore(phase-20): complete Phase 20 — Launch, Feedback & Iteration`

**Steps:**
```bash
git config user.name "Harsh Raj A"
git config user.email "hraj20000@gmail.com"
git add .
git commit -m "chore(phase-20): complete Phase 20 — Launch, Feedback & Iteration"
git push origin main
```

> See [COMMIT_GUIDE.md](COMMIT_GUIDE.md) — **Never add Co-Authored-By lines.**

---

## Notes / Blockers

_Add notes here as work progresses._
