# Phase 16 — Analytics & Admin Dashboard

**Status:** Completed
**Estimated Duration:** 4–5 days
**Started:** 2026-03-10
**Completed:** 2026-03-10

---

## Description

Build a data-driven admin analytics dashboard: client engagement heatmaps, project health overview, revenue pipeline with aging reports, interactive Recharts/D3.js visualizations, and automated weekly/monthly report emails.

**Deliverable:** Data-driven admin dashboard for monitoring client engagement and project health.

---

## Tasks

### Client Engagement Analytics
- [x] Login frequency heatmap: per-client calendar heatmap (days × activity level)
- [x] Most viewed documents: ranked list with view count bars
- [x] Average session duration per client (chart over last 30 days)
- [x] Comment activity trend: line chart showing comment volume over time
- [x] Last active date per client (highlight clients not logged in > 14 days)

### Project Health Dashboard
- [x] All-projects overview table: name, client, status, progress %, health score
- [x] Health score calculation: based on overdue tasks, delayed milestones, client inactivity
- [x] Health badge: Healthy (green), At Risk (yellow), Critical (red)
- [x] Overdue tasks list: tasks past due date, sorted by days overdue
- [x] Overdue milestones list: milestones past target date
- [x] Client satisfaction indicators (comment volume, response rate)

### Revenue Pipeline
- [x] Upcoming invoices: list of invoices due in next 30 days
- [x] Overdue amounts: total + per-client breakdown
- [x] Outstanding aging report: 0–30, 31–60, 61–90, 90+ day columns (Recharts BarChart)
- [x] Monthly revenue chart: paid vs outstanding per month (last 12 months)
- [x] Quarterly summary numbers: total invoiced, collected, outstanding

### Charts & Visualizations
- [x] All charts use Recharts (BarChart, LineChart, AreaChart, PieChart as needed)
- [x] Charts are interactive: hover tooltips, click to drill down
- [x] Exportable as PNG (html2canvas) and CSV download
- [x] Date range selector applied globally to analytics views (last 7d / 30d / 90d / custom)
- [x] Charts are responsive (Recharts `ResponsiveContainer`)

### Automated Reports
- [x] Weekly project summary email (every Monday): sent to all admin users
  - [x] All project statuses, overdue items, new documents, upcoming meetings
  - [x] React Email template with Hapkonic branding
- [x] Monthly client activity report (1st of each month): per-client login, document views, comment activity
- [x] Reports sent via Resend
- [x] Admin can manually trigger any report

---

## Commit

**Message:** `chore(phase-16): complete Phase 16 — Analytics & Admin Dashboard`

**Steps:**
```bash
git config user.name "Harsh Raj A"
git config user.email "hraj20000@gmail.com"
git add .
git commit -m "chore(phase-16): complete Phase 16 — Analytics & Admin Dashboard"
git push origin main
```

> See [COMMIT_GUIDE.md](COMMIT_GUIDE.md) — **Never add Co-Authored-By lines.**

---

## Notes / Blockers

_Add notes here as work progresses._
