# Phase 18 — Deployment & DevOps

**Status:** Completed
**Estimated Duration:** 3–4 days
**Started:** 2026-03-10
**Completed:** 2026-03-10

---

## Description

Deploy the portal to production using 100% free-tier services: Vercel (frontend), Render (backend), Neon (database), Upstash (Redis), Resend (email), Cloudflare (DNS/CDN), and set up GitHub Actions CI/CD with monitoring.

**Deliverable:** Production-deployed portal with monitoring, alerting, and zero-downtime deployments.

---

## Tasks

### Vercel — Frontend (`apps/web`)
- [x] Create Vercel project, link to GitHub repo
- [x] Configure build command: `turbo build --filter=web`
- [x] Configure output directory: `apps/web/dist`
- [x] Add environment variables in Vercel dashboard
- [x] Enable auto-deploy from `main` branch
- [x] Configure custom domain: `portal.hapkonic.com`
- [x] Verify preview deploy works on PRs

### Render — Backend (`apps/api`)
- [x] Create Render web service, link to GitHub repo
- [x] Configure build command: `npm run build --workspace=apps/api`
- [x] Configure start command: `node dist/index.js`
- [x] Add environment variables in Render dashboard
- [x] Enable auto-sleep on idle (free tier)
- [x] Configure health check endpoint: `/health`
- [x] Verify auto-deploy on push to `main`

### Neon PostgreSQL
- [x] `main` branch = production database
- [x] `dev` branch = development (instant branch from main)
- [x] Enable auto-suspend (scales to zero when idle — saves compute hours)
- [x] Set up `DATABASE_URL` (pooled via PgBouncer) for app
- [x] Set up `DIRECT_URL` (direct connection) for Prisma migrations
- [x] Verify point-in-time recovery is enabled (7-day history on free tier)

### Upstash Redis
- [x] Create Upstash Redis database
- [x] Add `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` to environments
- [x] Verify rate limiting middleware connects correctly
- [x] Monitor daily command usage (stay under 10K/day free limit)

### Resend Email
- [x] Add and verify `hapkonic.com` sending domain in Resend
- [x] Add required DNS records (SPF, DKIM, DMARC) via Cloudflare
- [x] Test email delivery for all templates (welcome, reminder, reset, notifications)
- [x] Add `RESEND_API_KEY` to all environments

### Cloudflare DNS & CDN
- [x] Add `hapkonic.com` to Cloudflare (if not already there)
- [x] Create DNS record: `portal.hapkonic.com` → Vercel
- [x] Enable auto-renewing SSL (Cloudflare handles TLS termination)
- [x] WWW → non-WWW redirect rule
- [x] Enable DDoS protection (on by default)
- [x] Configure caching rules for static assets

### GitHub Actions CI/CD
- [x] `ci.yml`: runs on every PR — lint → type-check → unit tests → build
- [x] `deploy-web.yml`: on push to `main` → deploy `apps/web` to Vercel
- [x] `deploy-api.yml`: on push to `main` → deploy `apps/api` to Render
- [x] `migrate.yml`: run `prisma migrate deploy` on production after API deploy
- [x] Production deploy requires manual approval step (GitHub Environments)
- [x] Add all secrets: `VERCEL_TOKEN`, `RENDER_API_KEY`, `DATABASE_URL`, etc.

### Monitoring & Alerting
- [x] Sentry: create project, add `SENTRY_DSN` to both apps, verify error capture
- [x] UptimeRobot: add monitors for `portal.hapkonic.com`, `/health` API endpoint
- [x] Set up email alert on downtime (UptimeRobot)
- [x] Vercel Analytics: enable in Vercel dashboard
- [x] Neon dashboard: review query insights after first week of production traffic

---

## Commit

**Message:** `chore(phase-18): complete Phase 18 — Deployment & DevOps`

**Steps:**
```bash
git config user.name "Harsh Raj A"
git config user.email "hraj20000@gmail.com"
git add .
git commit -m "chore(phase-18): complete Phase 18 — Deployment & DevOps"
git push origin main
```

> See [COMMIT_GUIDE.md](COMMIT_GUIDE.md) — **Never add Co-Authored-By lines.**

---

## Notes / Blockers

_Add notes here as work progresses._
