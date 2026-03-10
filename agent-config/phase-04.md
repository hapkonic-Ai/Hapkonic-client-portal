# Phase 04 — Authentication System & Login Page

**Status:** Not Started
**Estimated Duration:** 3–4 days
**Started:** —
**Completed:** —

---

## Description

Build a visually stunning split-screen login page with Three.js animations, and implement a robust JWT authentication system with refresh tokens, brute-force protection, and role-based access control.

**Deliverable:** Secure, visually stunning login experience with admin-provisioned credentials.

---

## Tasks

### Login Page UI
- [ ] Split-screen layout: left = Three.js 3D branding panel, right = login form
- [ ] Three.js scene: floating geometric shapes (icosahedron, octahedron, torus) with parallax on mouse move
- [ ] Hapkonic logo/wordmark integrated into 3D scene
- [ ] Particle field background reacting to cursor position
- [ ] Smooth field focus animations (border glow, label float)
- [ ] Inline validation feedback (red/green indicators, error messages)
- [ ] Loading spinner state on submit button
- [ ] "Forgot password" link below form
- [ ] Responsive: on mobile, full-screen form (no 3D panel)

### Forgot Password Flow
- [ ] "Forgot Password" page: email input form
- [ ] Send OTP to email via Resend (branded 6-digit code template)
- [ ] OTP verification page: 6-input code entry with auto-focus progression
- [ ] New password page: password + confirm password with strength indicator
- [ ] Success redirect to login with success toast

### First-Login Password Reset
- [ ] Detect `force_password_reset` flag on JWT payload
- [ ] Intercept all routes and redirect to `/change-password`
- [ ] Change password page: current password + new password + confirm
- [ ] Clear `force_password_reset` flag after successful change
- [ ] Redirect to intended destination after reset

### JWT Auth Backend
- [ ] Generate access token (15 min expiry) + refresh token (7 days expiry)
- [ ] Store access token in memory (React state), refresh token in HTTP-only cookie
- [ ] Token rotation: new refresh token issued on each refresh
- [ ] `/api/v1/auth/login` — validate credentials, return tokens
- [ ] `/api/v1/auth/refresh` — verify refresh token, issue new access token
- [ ] `/api/v1/auth/logout` — clear cookie, blacklist refresh token in Upstash Redis
- [ ] `/api/v1/auth/forgot-password` — generate and email OTP
- [ ] `/api/v1/auth/verify-otp` — validate OTP (5-min expiry in Upstash)
- [ ] `/api/v1/auth/reset-password` — update password hash
- [ ] `/api/v1/auth/change-password` — authenticated password change

### Brute-Force Protection
- [ ] Rate limit `/auth/login`: max 5 attempts per IP per 15 minutes (Upstash Redis)
- [ ] Account lockout after 5 failed attempts for same email (15-min lockout)
- [ ] Return generic error message (do not reveal whether email exists)
- [ ] Admin can manually unlock accounts from admin portal

### Session Management
- [ ] Track active sessions: user ID, device info, IP, created_at, last_seen
- [ ] Client-facing: view active sessions list in account settings
- [ ] Revoke individual sessions (invalidates that refresh token)
- [ ] Revoke all other sessions (keep current)
- [ ] Auto-expire sessions after 30 days of inactivity

### Role-Based Route Guards (Frontend)
- [ ] `<ProtectedRoute>` component: redirects to login if not authenticated
- [ ] `<AdminRoute>` component: redirects to 403 if role is not admin/manager
- [ ] Post-login redirect: admin → `/admin`, client → `/dashboard`
- [ ] 403 Forbidden page
- [ ] 404 Not Found page

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
