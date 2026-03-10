# Phase 11 — Invoice Management & Payment Reminders

**Status:** Not Started
**Estimated Duration:** 4–5 days
**Started:** —
**Completed:** —

---

## Description

Build a clean invoice viewing experience for clients with PDF downloads and payment info, automated Resend email reminders on a schedule, and full admin invoice management — no payment gateway required.

**Deliverable:** Clean invoice viewing for clients with PDF downloads, automated reminders, and full admin control.

---

## Tasks

### Client Invoice Dashboard
- [ ] Summary cards at top: Total Paid, Outstanding, Overdue, Next Due Date
- [ ] Invoice table: invoice #, amount, date issued, due date, status badge, actions
- [ ] Status badges: Paid (green), Pending (yellow), Overdue (red), Partially Paid (orange)
- [ ] Click row → invoice detail page/drawer
- [ ] Invoice detail: line item notes, admin notes, payment history
- [ ] Download invoice PDF button (generates signed URL from Uploadthing)
- [ ] Payment info section: bank transfer details / UPI ID displayed clearly
- [ ] Empty state when no invoices yet

### Admin Invoice Management
- [ ] Upload PDF invoice per client (Uploadthing drag-and-drop)
- [ ] Set invoice number, amount, due date, line item notes
- [ ] Status management: Pending → Paid / Partially Paid / Overdue / Written Off
- [ ] Add payment received date and notes when marking as paid
- [ ] Add admin notes visible to client
- [ ] Delete invoice with confirmation

### Revenue Overview (Admin)
- [ ] Monthly revenue chart (Recharts BarChart)
- [ ] Quarterly breakdown
- [ ] Outstanding aging report: 0–30, 31–60, 61–90, 90+ days columns
- [ ] Total outstanding, total overdue, total paid this month — summary cards

### Automated Payment Reminders
- [ ] Schedule reminders via cron job (Upstash QStash or Node cron):
  - [ ] 7 days before due date
  - [ ] On due date
  - [ ] 3 days after due date (overdue)
  - [ ] 7 days after due date (overdue)
- [ ] Email via Resend using React Email branded template
- [ ] In-app notification (Phase 12 integration)
- [ ] Log each reminder sent to `PaymentReminder` table
- [ ] Do NOT send reminder for Paid or Written Off invoices

### React Email Reminder Templates
- [ ] "Upcoming payment" template (7 days / due date reminders)
- [ ] "Payment overdue" template (3-day / 7-day overdue reminders)
- [ ] Both include: invoice #, amount, due date, payment details, portal link
- [ ] Hapkonic branding (logo, colors, footer)

### Client Snooze Option
- [ ] "Snooze reminder" button on invoice detail (delays next reminder by 3 days)
- [ ] Store snooze until date; reminder scheduler respects it

### Bulk Reminder Trigger (Admin)
- [ ] Admin can trigger reminders for all overdue invoices at once
- [ ] Shows preview list before sending
- [ ] Confirms count sent after trigger

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
