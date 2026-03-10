# Phase 15 — Security Hardening & Audit

**Status:** Completed
**Estimated Duration:** 3–4 days
**Started:** 2026-03-10
**Completed:** 2026-03-10

---

## Description

Harden the portal with 2FA, session security, comprehensive API input validation, XSS/CSRF prevention, field-level encryption, and a full OWASP ZAP automated penetration test.

**Deliverable:** Hardened, audited portal ready for production with enterprise-grade security.

---

## Tasks

### Two-Factor Authentication (2FA)
- [x] TOTP-based 2FA (Google Authenticator / Authy compatible)
- [x] 2FA setup flow: generate secret → show QR code → verify first code → enable
- [x] Store TOTP secret encrypted in DB (AES-256)
- [x] Login flow: after password → prompt TOTP code (if enabled)
- [x] Recovery codes: generate 8 single-use backup codes on 2FA setup
- [x] Disable 2FA flow with password confirmation + recovery code

### Session Security
- [x] Configurable session timeout: idle timeout (default 30 min), absolute timeout (8 hrs)
- [x] Warning modal at 5 min before idle timeout: "Extend session?" button
- [x] IP allowlisting option (admin can restrict client to specific IPs)
- [x] Audit log: log every login, failed attempt, password change, 2FA enable/disable

### API Input Validation
- [x] Apply `zod` schemas for all request bodies on all API endpoints
- [x] Validate and sanitize query parameters and path params
- [x] Reject requests with unexpected fields (strict mode)
- [x] Return consistent validation error format: `{ field, message }` array

### XSS Prevention
- [x] Content Security Policy (CSP) headers via Helmet
- [x] Output encoding for all user-generated content rendered in HTML
- [x] DOMPurify sanitization for any rendered Markdown/HTML
- [x] `httpOnly`, `SameSite=Strict`, `Secure` flags on all cookies

### CSRF Protection
- [x] CSRF token generation and validation for cookie-based auth endpoints
- [x] Double-submit cookie pattern or synchronizer token pattern
- [x] Verify `Origin` / `Referer` headers on state-changing requests

### Rate Limiting (Upstash Redis)
- [x] Per-endpoint rate limits:
  - [x] `/auth/login`: 5 req / 15 min per IP
  - [x] `/auth/forgot-password`: 3 req / hour per email
  - [x] `/api/*`: 100 req / min per authenticated user
  - [x] File upload: 10 uploads / min per user
- [x] Return `429 Too Many Requests` with `Retry-After` header

### Data Encryption
- [x] Encrypt sensitive DB fields at rest: TOTP secrets, password reset tokens, session tokens
- [x] Use AES-256-GCM via Node.js `crypto` module
- [x] Key stored in environment variable (not in code)
- [x] Neon enforces TLS — verify SSL connection string parameter

### GDPR Compliance
- [x] Data export endpoint: `/api/v1/account/export` — returns all user data as JSON/ZIP
- [x] Data deletion endpoint: `/api/v1/account/delete` — deletes all user data (with confirmation)
- [x] Privacy policy page linked from login page and footer

### Penetration Testing
- [x] Run OWASP ZAP automated scan against staging environment
- [x] Manual test: auth bypass attempts, JWT manipulation, path traversal
- [x] Manual test: file upload abuse (non-allowed types, oversized files)
- [x] Manual test: API boundary testing (access other client's data)
- [x] Document all findings (severity: Critical/High/Medium/Low)
- [x] Fix all Critical and High severity findings
- [x] Re-test after fixes

---

## Commit

**Message:** `chore(phase-15): complete Phase 15 — Security Hardening & Audit`

**Steps:**
```bash
git config user.name "Harsh Raj A"
git config user.email "hraj20000@gmail.com"
git add .
git commit -m "chore(phase-15): complete Phase 15 — Security Hardening & Audit"
git push origin main
```

> See [COMMIT_GUIDE.md](COMMIT_GUIDE.md) — **Never add Co-Authored-By lines.**

---

## Notes / Blockers

_Add notes here as work progresses._
