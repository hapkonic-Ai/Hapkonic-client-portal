# Deployment Guide

This guide covers deploying the Hapkonic Client Portal to production using free-tier cloud services.

---

## Architecture Overview

```
                    ┌──────────────┐
                    │   Vercel     │
                    │  (Frontend)  │
                    │  React SPA   │
                    └──────┬───────┘
                           │ HTTPS
                           ▼
                    ┌──────────────┐       ┌──────────────┐
                    │   Render     │──────▶│    Neon       │
                    │  (Backend)   │       │ PostgreSQL   │
                    │  Express API │       └──────────────┘
                    └──────┬───────┘
                           │
              ┌────────────┼────────────┐
              ▼            ▼            ▼
       ┌────────────┐ ┌──────────┐ ┌──────────┐
       │  Upstash   │ │Uploadthing│ │  Resend  │
       │  Redis     │ │   CDN    │ │  Email   │
       └────────────┘ └──────────┘ └──────────┘
```

---

## 1. Database — Neon PostgreSQL

1. Sign up at [neon.tech](https://neon.tech)
2. Create a new project (select a region close to your Render deployment)
3. Copy the connection string from the dashboard
4. The connection string format:
   ```
   postgresql://user:password@ep-xxx.region.aws.neon.tech/neondb?sslmode=require
   ```
5. Use this as `DATABASE_URL` in your Render environment

---

## 2. Redis — Upstash

1. Sign up at [upstash.com](https://upstash.com)
2. Create a new Redis database
3. Copy the **REST URL** and **REST Token** from the dashboard
4. Use these as `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN`

---

## 3. File Storage — Uploadthing

1. Sign up at [uploadthing.com](https://uploadthing.com)
2. Create a new app
3. Copy the secret key from Settings
4. Use as `UPLOADTHING_SECRET`

---

## 4. Email — Resend (Optional)

1. Sign up at [resend.com](https://resend.com)
2. Verify a domain or use the sandbox (limited to your own email)
3. Create an API key
4. Use as `RESEND_API_KEY`
5. Set `RESEND_FROM` to your verified sender address

---

## 5. Backend — Render

### Create the Service

1. Go to [render.com](https://render.com) and connect your GitHub repository
2. Create a new **Web Service**
3. Configure:

| Setting | Value |
|---------|-------|
| **Name** | `hapkonic-api` |
| **Region** | Choose closest to your database |
| **Branch** | `main` |
| **Root Directory** | *(leave empty)* |
| **Runtime** | Node |
| **Build Command** | `cd apps/api && npm install && npx prisma generate && npm run build` |
| **Start Command** | `cd apps/api && npx prisma db push && npm start` |
| **Plan** | Free |

### Environment Variables

Add all of these in the Render dashboard under **Environment**:

| Variable | Value |
|----------|-------|
| `NODE_ENV` | `production` |
| `PORT` | `4000` |
| `CLIENT_URL` | `https://your-app.vercel.app` (set after Vercel deploy) |
| `DATABASE_URL` | Neon connection string |
| `JWT_SECRET` | Random 32+ character string |
| `JWT_REFRESH_SECRET` | Different random 32+ character string |
| `JWT_EXPIRES_IN` | `15m` |
| `JWT_REFRESH_EXPIRES_IN` | `7d` |
| `UPSTASH_REDIS_REST_URL` | Upstash REST URL |
| `UPSTASH_REDIS_REST_TOKEN` | Upstash REST token |
| `UPLOADTHING_SECRET` | Uploadthing secret key |
| `RESEND_API_KEY` | Resend API key (optional) |
| `RESEND_FROM` | Sender email (optional) |

### Important Notes

- Render free tier spins down after 15 minutes of inactivity. First request after spin-down takes ~30s.
- The start command runs `prisma db push` on every deploy to keep the schema in sync.
- Render auto-deploys on every push to `main`.

---

## 6. Frontend — Vercel

### Create the Project

1. Go to [vercel.com](https://vercel.com) and import the GitHub repository
2. The `vercel.json` in the root handles configuration automatically:
   - Build: `cd apps/web && npm run build`
   - Output: `apps/web/dist`
   - SPA rewrites for client-side routing

### Environment Variables

Add in Vercel dashboard under **Settings > Environment Variables**:

| Variable | Value |
|----------|-------|
| `VITE_API_URL` | `https://your-api.onrender.com/api/v1` |

### Important Notes

- `VITE_API_URL` is baked in at **build time**. After adding/changing it, you must redeploy.
- Vercel auto-deploys on every push to `main`.
- After the first Vercel deploy, go back to Render and update `CLIENT_URL` with your Vercel URL.

---

## 7. Post-Deployment Checklist

- [ ] Database tables created (check Neon dashboard or Prisma Studio)
- [ ] Render API health check passes: `GET https://your-api.onrender.com/`
- [ ] Frontend loads at your Vercel URL
- [ ] Login works (no CORS errors)
- [ ] File upload works (Uploadthing configured)
- [ ] `CLIENT_URL` on Render matches your Vercel URL exactly
- [ ] `VITE_API_URL` on Vercel matches your Render URL exactly

---

## Seeding Production Data

To create the initial admin user, you can use Prisma Studio or run the seed script:

```bash
# Locally, with DATABASE_URL pointing to your Neon production DB
cd apps/api
DATABASE_URL="your-neon-connection-string" npx prisma db seed
```

The seed script creates a default admin user. Check `apps/api/prisma/seed.ts` for details.

---

## Troubleshooting

### CORS Errors
The API only accepts requests from the URL specified in `CLIENT_URL`. Make sure it matches your Vercel URL exactly (including `https://`, no trailing slash).

### Build Failures on Render
Check that `npm install` runs from the root (installs all workspace dependencies). The build command must `cd apps/api` before running `prisma generate` and `tsc`.

### "Prisma schema validation" Errors
Ensure `DATABASE_URL` is set correctly in Render environment variables. The connection string must include `?sslmode=require` for Neon.

### Render Spin-Down Delays
Free-tier Render services spin down after inactivity. Consider upgrading to a paid plan for production use, or use an external ping service to keep the service warm.
