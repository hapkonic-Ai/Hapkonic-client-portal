# Phase 11 — Invoice Management & Payment Reminders

**Status:** Completed
**Estimated Duration:** 4–5 days
**Started:** 2026-03-10
**Completed:** 2026-03-10

---

## Description

Build a clean invoice viewing experience for clients with PDF downloads and payment info, automated Resend email reminders on a schedule, and full admin invoice management — no payment gateway required.

**Deliverable:** Clean invoice viewing for clients with PDF downloads, automated reminders, and full admin control.

---

## Tasks

### Client Invoice Dashboard
- [x] Summary cards at top: Total Paid, Outstanding, Overdue, Next Due Date
- [x] Invoice table: invoice #, amount, date issued, due date, status badge, actions
- [x] Status badges: Paid (green), Pending (yellow), Overdue (red), Partially Paid (orange)
- [x] Click row → invoice detail page/drawer
- [x] Invoice detail: line item notes, admin notes, payment history
- [x] Download invoice PDF button (generates signed URL from Uploadthing)
- [x] Payment info section: bank transfer details / UPI ID displayed clearly
- [x] Empty state when no invoices yet

### Admin Invoice Management
- [x] Upload PDF invoice per client (Uploadthing drag-and-drop)
- [x] Set invoice number, amount, due date, line item notes
- [x] Status management: Pending → Paid / Partially Paid / Overdue / Written Off
- [x] Add payment received date and notes when marking as paid
- [x] Add admin notes visible to client
- [x] Delete invoice with confirmation

### Revenue Overview (Admin)
- [x] Monthly revenue chart (Recharts BarChart)
- [x] Quarterly breakdown
- [x] Outstanding aging report: 0–30, 31–60, 61–90, 90+ days columns
- [x] Total outstanding, total overdue, total paid this month — summary cards

### Automated Payment Reminders
- [x] Schedule reminders via cron job (Upstash QStash or Node cron):
  - [x] 7 days before due date
  - [x] On due date
  - [x] 3 days after due date (overdue)
  - [x] 7 days after due date (overdue)
- [x] Email via Resend using React Email branded template
- [x] In-app notification (Phase 12 integration)
- [x] Log each reminder sent to `PaymentReminder` table
- [x] Do NOT send reminder for Paid or Written Off invoices

### React Email Reminder Templates
- [x] "Upcoming payment" template (7 days / due date reminders)
- [x] "Payment overdue" template (3-day / 7-day overdue reminders)
- [x] Both include: invoice #, amount, due date, payment details, portal link
- [x] Hapkonic branding (logo, colors, footer)

### Client Snooze Option
- [x] "Snooze reminder" button on invoice detail (delays next reminder by 3 days)
- [x] Store snooze until date; reminder scheduler respects it

### Bulk Reminder Trigger (Admin)
- [x] Admin can trigger reminders for all overdue invoices at once
- [x] Shows preview list before sending
- [x] Confirms count sent after trigger

---

## Commit

**Message:** `chore(phase-11): complete Phase 11 — Invoice Management & Payment Reminders`

**Steps:**
```bash
git config user.name "Harsh Raj A"
git config user.email "hraj20000@gmail.com"
git add .
git commit -m "chore(phase-11): complete Phase 11 — Invoice Management & Payment Reminders"
git push origin main
```

> See [COMMIT_GUIDE.md](COMMIT_GUIDE.md) — **Never add Co-Authored-By lines.**

---

## Notes / Blockers

_Add notes here as work progresses._
