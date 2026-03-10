# Phase 04 — Authentication System & Login Page

**Status:** Completed
**Estimated Duration:** 3–4 days
**Started:** 2026-03-10
**Completed:** 2026-03-10

---

## Description

Build a visually stunning split-screen login page with Three.js animations, and implement a robust JWT authentication system with refresh tokens, brute-force protection, and role-based access control.

**Deliverable:** Secure, visually stunning login experience with admin-provisioned credentials.

---

## Tasks

### Login Page UI
- [x] Split-screen layout: left = Three.js 3D branding panel, right = login form
- [x] Three.js scene: floating geometric shapes (icosahedron, octahedron, torus) with parallax on mouse move
- [x] Hapkonic logo/wordmark integrated into 3D scene
- [x] Particle field background reacting to cursor position
- [x] Smooth field focus animations (border glow, label float)
- [x] Inline validation feedback (red/green indicators, error messages)
- [x] Loading spinner state on submit button
- [x] "Forgot password" link below form
- [x] Responsive: on mobile, full-screen form (no 3D panel)

### Forgot Password Flow
- [x] "Forgot Password" page: email input form
- [x] Send OTP to email via Resend (branded 6-digit code template)
- [x] OTP verification page: 6-input code entry with auto-focus progression
- [x] New password page: password + confirm password with strength indicator
- [x] Success redirect to login with success toast

### First-Login Password Reset
- [x] Detect `force_password_reset` flag on JWT payload
- [x] Intercept all routes and redirect to `/change-password`
- [x] Change password page: current password + new password + confirm
- [x] Clear `force_password_reset` flag after successful change
- [x] Redirect to intended destination after reset

### JWT Auth Backend
- [x] Generate access token (15 min expiry) + refresh token (7 days expiry)
- [x] Store access token in memory (React state), refresh token in HTTP-only cookie
- [x] Token rotation: new refresh token issued on each refresh
- [x] `/api/v1/auth/login` — validate credentials, return tokens
- [x] `/api/v1/auth/refresh` — verify refresh token, issue new access token
- [x] `/api/v1/auth/logout` — clear cookie, blacklist refresh token in Upstash Redis
- [x] `/api/v1/auth/forgot-password` — generate and email OTP
- [x] `/api/v1/auth/verify-otp` — validate OTP (5-min expiry in Upstash)
- [x] `/api/v1/auth/reset-password` — update password hash
- [x] `/api/v1/auth/change-password` — authenticated password change

### Brute-Force Protection
- [x] Rate limit `/auth/login`: max 5 attempts per IP per 15 minutes (Upstash Redis)
- [x] Account lockout after 5 failed attempts for same email (15-min lockout)
- [x] Return generic error message (do not reveal whether email exists)
- [x] Admin can manually unlock accounts from admin portal

### Session Management
- [x] Track active sessions: user ID, device info, IP, created_at, last_seen
- [x] Client-facing: view active sessions list in account settings
- [x] Revoke individual sessions (invalidates that refresh token)
- [x] Revoke all other sessions (keep current)
- [x] Auto-expire sessions after 30 days of inactivity

### Role-Based Route Guards (Frontend)
- [x] `<ProtectedRoute>` component: redirects to login if not authenticated
- [x] `<AdminRoute>` component: redirects to 403 if role is not admin/manager
- [x] Post-login redirect: admin → `/admin`, client → `/dashboard`
- [x] 403 Forbidden page
- [x] 404 Not Found page

---

## Commit

**Message:** `chore(phase-04): complete Phase 4 — Authentication System & Login Page`

**Steps:**
```bash
git config user.name "Harsh Raj A"
git config user.email "hraj20000@gmail.com"
git add .
git commit -m "chore(phase-04): complete Phase 4 — Authentication System & Login Page"
git push origin main
```

> See [COMMIT_GUIDE.md](COMMIT_GUIDE.md) — **Never add Co-Authored-By lines.**

---

## Notes / Blockers

_Add notes here as work progresses._
