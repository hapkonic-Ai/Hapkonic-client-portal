# Hapkonic Client Portal — Master Project Tracker

**Project:** Hapkonic Client Portal
**Stack:** React 18 · Node.js/Express · PostgreSQL (Neon) · Prisma · Three.js · Socket.io · Framer Motion
**Total Phases:** 20
**Last Updated:** 2026-03-10

---

## Legend

| Symbol | Meaning      |
|--------|--------------|
| `[ ]`  | Not Started  |
| `[~]`  | In Progress  |
| `[x]`  | Completed    |

---

## Overall Progress

```
Completed: 1 / 20 phases  [█░░░░░░░░░░░░░░░░░░░] 5%
```

---

## Phase Summary Table

| #   | Phase Title                                   | Status      | Progress | Duration  | Phase File                     |
|-----|-----------------------------------------------|-------------|----------|-----------|--------------------------------|
| 01  | Project Scaffolding & Design System           | Completed   | 100%     | 3–4 days  | [phase-01.md](phase-01.md)     |
| 02  | Database Schema & API Foundation              | Not Started | 0%       | 4–5 days  | [phase-02.md](phase-02.md)     |
| 03  | Hapkonic Admin Portal                         | Not Started | 0%       | 5–6 days  | [phase-03.md](phase-03.md)     |
| 04  | Authentication System & Login Page            | Not Started | 0%       | 3–4 days  | [phase-04.md](phase-04.md)     |
| 05  | Landing Page with Scroll Animations & 3D      | Not Started | 0%       | 5–7 days  | [phase-05.md](phase-05.md)     |
| 06  | Document Vault                                | Not Started | 0%       | 4–5 days  | [phase-06.md](phase-06.md)     |
| 07  | Meeting Scheduler + Google Calendar Sync      | Not Started | 0%       | 4–5 days  | [phase-07.md](phase-07.md)     |
| 08  | Interactive Gantt Chart / Roadmap             | Not Started | 0%       | 6–7 days  | [phase-08.md](phase-08.md)     |
| 09  | Progress Tracker + Comments                   | Not Started | 0%       | 4–5 days  | [phase-09.md](phase-09.md)     |
| 10  | Historical Milestone Timeline                 | Not Started | 0%       | 5–6 days  | [phase-10.md](phase-10.md)     |
| 11  | Invoice Management & Payment Reminders        | Not Started | 0%       | 4–5 days  | [phase-11.md](phase-11.md)     |
| 12  | Real-Time Notification System                 | Not Started | 0%       | 3–4 days  | [phase-12.md](phase-12.md)     |
| 13  | Search, Filtering & Global Navigation         | Not Started | 0%       | 3–4 days  | [phase-13.md](phase-13.md)     |
| 14  | Mobile Responsiveness & PWA                   | Not Started | 0%       | 4–5 days  | [phase-14.md](phase-14.md)     |
| 15  | Security Hardening & Audit                    | Not Started | 0%       | 3–4 days  | [phase-15.md](phase-15.md)     |
| 16  | Analytics & Admin Dashboard                   | Not Started | 0%       | 4–5 days  | [phase-16.md](phase-16.md)     |
| 17  | Testing & Quality Assurance                   | Not Started | 0%       | 5–6 days  | [phase-17.md](phase-17.md)     |
| 18  | Deployment & DevOps                           | Not Started | 0%       | 3–4 days  | [phase-18.md](phase-18.md)     |
| 19  | Client Onboarding & Documentation             | Not Started | 0%       | 3–4 days  | [phase-19.md](phase-19.md)     |
| 20  | Launch, Feedback & Iteration                  | Not Started | 0%       | Ongoing   | [phase-20.md](phase-20.md)     |

---

## Active Phase

> **Next:** [Phase 02 — Database Schema & API Foundation](phase-02.md)

---

## Infrastructure (All Free Tier)

| Service         | Purpose                            | Free Limit                    |
|-----------------|------------------------------------|-------------------------------|
| Neon PostgreSQL | Primary database                   | 0.5 GB, 190 compute hrs/mo    |
| Uploadthing     | File/document storage              | 2 GB storage, 2 GB bandwidth  |
| Vercel          | Frontend hosting (`apps/web`)      | 100 GB bandwidth/mo           |
| Render          | Backend hosting (`apps/api`)       | 750 hrs/mo                    |
| Upstash Redis   | Rate limiting, caching, sessions   | 10K commands/day              |
| Resend          | Transactional email                | 3,000 emails/mo               |
| Sentry          | Error tracking                     | 5K events/mo                  |
| UptimeRobot     | Uptime monitoring                  | 50 monitors, 5-min intervals  |
| Cloudflare      | DNS, SSL, CDN, DDoS protection     | Free                          |
| Google Calendar | Meeting sync                       | Free                          |

---

## Commit Convention

After each phase: `chore(phase-NN): complete Phase N — <Phase Title>`
Author: **Harsh Raj A** — see [COMMIT_GUIDE.md](COMMIT_GUIDE.md)
