# Phase 15 — Security Hardening & Audit

**Status:** Not Started
**Estimated Duration:** 3–4 days
**Started:** —
**Completed:** —

---

## Description

Harden the portal with 2FA, session security, comprehensive API input validation, XSS/CSRF prevention, field-level encryption, and a full OWASP ZAP automated penetration test.

**Deliverable:** Hardened, audited portal ready for production with enterprise-grade security.

---

## Tasks

### Two-Factor Authentication (2FA)
- [ ] TOTP-based 2FA (Google Authenticator / Authy compatible)
- [ ] 2FA setup flow: generate secret → show QR code → verify first code → enable
- [ ] Store TOTP secret encrypted in DB (AES-256)
- [ ] Login flow: after password → prompt TOTP code (if enabled)
- [ ] Recovery codes: generate 8 single-use backup codes on 2FA setup
- [ ] Disable 2FA flow with password confirmation + recovery code

### Session Security
- [ ] Configurable session timeout: idle timeout (default 30 min), absolute timeout (8 hrs)
- [ ] Warning modal at 5 min before idle timeout: "Extend session?" button
- [ ] IP allowlisting option (admin can restrict client to specific IPs)
- [ ] Audit log: log every login, failed attempt, password change, 2FA enable/disable

### API Input Validation
- [ ] Apply `zod` schemas for all request bodies on all API endpoints
- [ ] Validate and sanitize query parameters and path params
- [ ] Reject requests with unexpected fields (strict mode)
- [ ] Return consistent validation error format: `{ field, message }` array

### XSS Prevention
- [ ] Content Security Policy (CSP) headers via Helmet
- [ ] Output encoding for all user-generated content rendered in HTML
- [ ] DOMPurify sanitization for any rendered Markdown/HTML
- [ ] `httpOnly`, `SameSite=Strict`, `Secure` flags on all cookies

### CSRF Protection
- [ ] CSRF token generation and validation for cookie-based auth endpoints
- [ ] Double-submit cookie pattern or synchronizer token pattern
- [ ] Verify `Origin` / `Referer` headers on state-changing requests

### Rate Limiting (Upstash Redis)
- [ ] Per-endpoint rate limits:
  - [ ] `/auth/login`: 5 req / 15 min per IP
  - [ ] `/auth/forgot-password`: 3 req / hour per email
  - [ ] `/api/*`: 100 req / min per authenticated user
  - [ ] File upload: 10 uploads / min per user
- [ ] Return `429 Too Many Requests` with `Retry-After` header

### Data Encryption
- [ ] Encrypt sensitive DB fields at rest: TOTP secrets, password reset tokens, session tokens
- [ ] Use AES-256-GCM via Node.js `crypto` module
- [ ] Key stored in environment variable (not in code)
- [ ] Neon enforces TLS — verify SSL connection string parameter

### GDPR Compliance
- [ ] Data export endpoint: `/api/v1/account/export` — returns all user data as JSON/ZIP
- [ ] Data deletion endpoint: `/api/v1/account/delete` — deletes all user data (with confirmation)
- [ ] Privacy policy page linked from login page and footer

### Penetration Testing
- [ ] Run OWASP ZAP automated scan against staging environment
- [ ] Manual test: auth bypass attempts, JWT manipulation, path traversal
- [ ] Manual test: file upload abuse (non-allowed types, oversized files)
- [ ] Manual test: API boundary testing (access other client's data)
- [ ] Document all findings (severity: Critical/High/Medium/Low)
- [ ] Fix all Critical and High severity findings
- [ ] Re-test after fixes

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
