# Phase 18 — Deployment & DevOps

**Status:** Not Started
**Estimated Duration:** 3–4 days
**Started:** —
**Completed:** —

---

## Description

Deploy the portal to production using 100% free-tier services: Vercel (frontend), Render (backend), Neon (database), Upstash (Redis), Resend (email), Cloudflare (DNS/CDN), and set up GitHub Actions CI/CD with monitoring.

**Deliverable:** Production-deployed portal with monitoring, alerting, and zero-downtime deployments.

---

## Tasks

### Vercel — Frontend (`apps/web`)
- [ ] Create Vercel project, link to GitHub repo
- [ ] Configure build command: `turbo build --filter=web`
- [ ] Configure output directory: `apps/web/dist`
- [ ] Add environment variables in Vercel dashboard
- [ ] Enable auto-deploy from `main` branch
- [ ] Configure custom domain: `portal.hapkonic.com`
- [ ] Verify preview deploy works on PRs

### Render — Backend (`apps/api`)
- [ ] Create Render web service, link to GitHub repo
- [ ] Configure build command: `npm run build --workspace=apps/api`
- [ ] Configure start command: `node dist/index.js`
- [ ] Add environment variables in Render dashboard
- [ ] Enable auto-sleep on idle (free tier)
- [ ] Configure health check endpoint: `/health`
- [ ] Verify auto-deploy on push to `main`

### Neon PostgreSQL
- [ ] `main` branch = production database
- [ ] `dev` branch = development (instant branch from main)
- [ ] Enable auto-suspend (scales to zero when idle — saves compute hours)
- [ ] Set up `DATABASE_URL` (pooled via PgBouncer) for app
- [ ] Set up `DIRECT_URL` (direct connection) for Prisma migrations
- [ ] Verify point-in-time recovery is enabled (7-day history on free tier)

### Upstash Redis
- [ ] Create Upstash Redis database
- [ ] Add `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` to environments
- [ ] Verify rate limiting middleware connects correctly
- [ ] Monitor daily command usage (stay under 10K/day free limit)

### Resend Email
- [ ] Add and verify `hapkonic.com` sending domain in Resend
- [ ] Add required DNS records (SPF, DKIM, DMARC) via Cloudflare
- [ ] Test email delivery for all templates (welcome, reminder, reset, notifications)
- [ ] Add `RESEND_API_KEY` to all environments

### Cloudflare DNS & CDN
- [ ] Add `hapkonic.com` to Cloudflare (if not already there)
- [ ] Create DNS record: `portal.hapkonic.com` → Vercel
- [ ] Enable auto-renewing SSL (Cloudflare handles TLS termination)
- [ ] WWW → non-WWW redirect rule
- [ ] Enable DDoS protection (on by default)
- [ ] Configure caching rules for static assets

### GitHub Actions CI/CD
- [ ] `ci.yml`: runs on every PR — lint → type-check → unit tests → build
- [ ] `deploy-web.yml`: on push to `main` → deploy `apps/web` to Vercel
- [ ] `deploy-api.yml`: on push to `main` → deploy `apps/api` to Render
- [ ] `migrate.yml`: run `prisma migrate deploy` on production after API deploy
- [ ] Production deploy requires manual approval step (GitHub Environments)
- [ ] Add all secrets: `VERCEL_TOKEN`, `RENDER_API_KEY`, `DATABASE_URL`, etc.

### Monitoring & Alerting
- [ ] Sentry: create project, add `SENTRY_DSN` to both apps, verify error capture
- [ ] UptimeRobot: add monitors for `portal.hapkonic.com`, `/health` API endpoint
- [ ] Set up email alert on downtime (UptimeRobot)
- [ ] Vercel Analytics: enable in Vercel dashboard
- [ ] Neon dashboard: review query insights after first week of production traffic

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
