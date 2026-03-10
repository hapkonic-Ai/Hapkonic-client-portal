# Phase 16 — Analytics & Admin Dashboard

**Status:** Not Started
**Estimated Duration:** 4–5 days
**Started:** —
**Completed:** —

---

## Description

Build a data-driven admin analytics dashboard: client engagement heatmaps, project health overview, revenue pipeline with aging reports, interactive Recharts/D3.js visualizations, and automated weekly/monthly report emails.

**Deliverable:** Data-driven admin dashboard for monitoring client engagement and project health.

---

## Tasks

### Client Engagement Analytics
- [ ] Login frequency heatmap: per-client calendar heatmap (days × activity level)
- [ ] Most viewed documents: ranked list with view count bars
- [ ] Average session duration per client (chart over last 30 days)
- [ ] Comment activity trend: line chart showing comment volume over time
- [ ] Last active date per client (highlight clients not logged in > 14 days)

### Project Health Dashboard
- [ ] All-projects overview table: name, client, status, progress %, health score
- [ ] Health score calculation: based on overdue tasks, delayed milestones, client inactivity
- [ ] Health badge: Healthy (green), At Risk (yellow), Critical (red)
- [ ] Overdue tasks list: tasks past due date, sorted by days overdue
- [ ] Overdue milestones list: milestones past target date
- [ ] Client satisfaction indicators (comment volume, response rate)

### Revenue Pipeline
- [ ] Upcoming invoices: list of invoices due in next 30 days
- [ ] Overdue amounts: total + per-client breakdown
- [ ] Outstanding aging report: 0–30, 31–60, 61–90, 90+ day columns (Recharts BarChart)
- [ ] Monthly revenue chart: paid vs outstanding per month (last 12 months)
- [ ] Quarterly summary numbers: total invoiced, collected, outstanding

### Charts & Visualizations
- [ ] All charts use Recharts (BarChart, LineChart, AreaChart, PieChart as needed)
- [ ] Charts are interactive: hover tooltips, click to drill down
- [ ] Exportable as PNG (html2canvas) and CSV download
- [ ] Date range selector applied globally to analytics views (last 7d / 30d / 90d / custom)
- [ ] Charts are responsive (Recharts `ResponsiveContainer`)

### Automated Reports
- [ ] Weekly project summary email (every Monday): sent to all admin users
  - [ ] All project statuses, overdue items, new documents, upcoming meetings
  - [ ] React Email template with Hapkonic branding
- [ ] Monthly client activity report (1st of each month): per-client login, document views, comment activity
- [ ] Reports sent via Resend
- [ ] Admin can manually trigger any report

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
