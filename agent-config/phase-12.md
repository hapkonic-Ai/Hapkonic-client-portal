# Phase 12 — Real-Time Notification System

**Status:** Not Started
**Estimated Duration:** 3–4 days
**Started:** —
**Completed:** —

---

## Description

Build a multi-channel notification system: Socket.io in-app bell with dropdown, branded React Email templates, notification preferences per user, daily digest option, and PWA push notifications.

**Deliverable:** Multi-channel notification system ensuring clients never miss an update.

---

## Tasks

### In-App Notification Bell
- [ ] Notification bell icon in topbar with unread count badge
- [ ] Badge animates (bounce/scale) when new notification arrives
- [ ] Click bell → dropdown panel (max height, scrollable)
- [ ] Dropdown groups: Today / This Week / Earlier
- [ ] Each notification: icon (by type), title, description, relative timestamp, read/unread state
- [ ] Click notification → navigate to relevant page + mark as read
- [ ] "Mark all as read" button
- [ ] "View all notifications" link → full notifications page

### Notification Types
- [ ] Meeting reminder (calendar icon)
- [ ] New document uploaded (file icon)
- [ ] Progress update posted (chart icon)
- [ ] New comment / reply (chat icon)
- [ ] @mention in comment (@ icon)
- [ ] Payment due / overdue (invoice icon)
- [ ] Milestone reached / completed (flag icon)

### Real-Time Delivery (Socket.io)
- [ ] Client connects to Socket.io on login, joins room `user:{id}`
- [ ] Server emits `notification:new` event when notification is created
- [ ] Frontend appends to notification list + increments badge (no page refresh)
- [ ] Handles reconnection gracefully (rehydrates unread count on reconnect)

### Notification Preferences
- [ ] Settings page section: "Notification Preferences"
- [ ] Per-channel toggles: In-App, Email, SMS (SMS future)
- [ ] Per-type toggles: choose which event types trigger each channel
- [ ] Quiet hours setting: start time + end time (no email/push during quiet hours)
- [ ] Save preferences to user profile

### Email Notifications (React Email + Resend)
- [ ] Branded HTML email template (Hapkonic logo, colors, footer)
- [ ] Unsubscribe link in every email (one-click, updates preferences)
- [ ] Digest option: user can switch to daily summary email instead of individual emails
- [ ] Daily digest template: groups all day's notifications into one email

### PWA Push Notifications
- [ ] Service worker registration (`service-worker.js`)
- [ ] Push subscription management (`PushManager.subscribe`)
- [ ] Store push subscriptions in DB (per user, per device)
- [ ] Server sends push via Web Push API (VAPID keys)
- [ ] Push notification works even when tab is closed
- [ ] Handle permission request on first login (non-intrusive prompt)

---

## Commit

**Message:** `chore(phase-12): complete Phase 12 — Real-Time Notification System`

**Steps:**
```bash
git config user.name "Harsh Raj A"
git config user.email "hraj20000@gmail.com"
git add .
git commit -m "chore(phase-12): complete Phase 12 — Real-Time Notification System"
git push origin main
```

> See [COMMIT_GUIDE.md](COMMIT_GUIDE.md) — **Never add Co-Authored-By lines.**

---

## Notes / Blockers

_Add notes here as work progresses._
