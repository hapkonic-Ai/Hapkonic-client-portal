# Hapkonic Client Portal — Running & Deployment Guide

## Quick Reference

| Task | Command |
|------|---------|
| Install all dependencies | `npm install` |
| Start everything (dev) | `npm run dev` |
| Web only | `npm run dev --workspace=apps/web` |
| API only | `npm run dev --workspace=apps/api` |
| Run tests | `npm run test --workspace=apps/web -- --run` |
| Build for production | `npm run build` |

---

## 1. Prerequisites

| Tool | Version | Install |
|------|---------|---------|
| Node.js | ≥ 20 | [nodejs.org](https://nodejs.org) |
| npm | ≥ 10 | Bundled with Node |
| Git | any | [git-scm.com](https://git-scm.com) |

---

## 2. First-Time Local Setup

### 2.1 Clone & install

```bash
git clone https://github.com/your-org/Hapkonic-Client-Portal.git
cd Hapkonic-Client-Portal
npm install
```

### 2.2 Configure environment variables

```bash
# Copy the example env file for the API
cp apps/api/.env.example apps/api/.env
```

Open `apps/api/.env` and fill in the required values (see Section 3 below).

For the web app, create `apps/web/.env.local`:

```bash
VITE_API_URL=http://localhost:4000/api/v1
```

### 2.3 Set up the database

You need a **Neon PostgreSQL** connection string (free tier: [neon.tech](https://neon.tech)).

After adding `DATABASE_URL` and `DIRECT_URL` to `apps/api/.env`:

```bash
# Generate the Prisma client
npm run prisma:generate --workspace=apps/api

# Push schema to the database (creates all tables)
npm run prisma:migrate --workspace=apps/api

# Seed with demo data (users, clients, projects, etc.)
npm run prisma:seed --workspace=apps/api
```

**Demo credentials after seeding:**

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@hapkonic.com | Admin@123456 |
| Manager | manager@hapkonic.com | Manager@123456 |
| Client | client1@acme.com | Client@123456 |
| Client | client2@acme.com | Client@123456 |
| Client | client3@acme.com | Client@123456 |

### 2.4 Start development servers

```bash
npm run dev
```

This starts both servers in parallel via Turborepo:
- **Web** → http://localhost:3000
- **API** → http://localhost:4000

---

## 3. Environment Variables Reference

### `apps/api/.env`

```env
# Server
PORT=4000
CLIENT_URL=http://localhost:3000
NODE_ENV=development

# Neon PostgreSQL (get from neon.tech dashboard)
DATABASE_URL=postgresql://user:password@host/dbname?sslmode=require&pgbouncer=true
DIRECT_URL=postgresql://user:password@host/dbname?sslmode=require

# JWT secrets — generate with: node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
JWT_SECRET=your-64-char-random-hex-here
JWT_REFRESH_SECRET=another-64-char-random-hex-here
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# Upstash Redis (get from console.upstash.com — free tier)
UPSTASH_REDIS_REST_URL=https://your-id.upstash.io
UPSTASH_REDIS_REST_TOKEN=your-token-here

# Resend email (get from resend.com — free tier: 3,000 emails/mo)
RESEND_API_KEY=re_your_key_here
RESEND_FROM=noreply@hapkonic.com

# Uploadthing (get from uploadthing.com — free: 2GB storage)
UPLOADTHING_SECRET=sk_live_your_key
UPLOADTHING_APP_ID=your_app_id

# Google Calendar OAuth (optional — needed for calendar sync)
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-your-secret
GOOGLE_REDIRECT_URI=http://localhost:4000/api/v1/meetings/oauth/callback
```

### `apps/web/.env.local`

```env
VITE_API_URL=http://localhost:4000/api/v1
```

---

## 4. Useful API Scripts

```bash
# Open Prisma Studio (visual DB editor) — runs at http://localhost:5555
npm run prisma:studio --workspace=apps/api

# Create a new migration after schema changes
npm run prisma:migrate:dev --workspace=apps/api

# Reset DB and re-seed (⚠️ destroys all data)
npm run prisma:reset --workspace=apps/api

# Regenerate Prisma client after schema changes
npm run prisma:generate --workspace=apps/api
```

---

## 5. Project Structure

```
Hapkonic-Client-Portal/
├── apps/
│   ├── web/                    # React 18 + Vite frontend
│   │   ├── src/
│   │   │   ├── pages/
│   │   │   │   ├── admin/      # Admin portal pages
│   │   │   │   ├── portal/     # Client portal pages
│   │   │   │   ├── auth/       # Login, forgot password, change password
│   │   │   │   └── LandingPage.tsx
│   │   │   ├── components/
│   │   │   │   ├── ui/         # Button, Card, Input, Badge, Modal, etc.
│   │   │   │   └── layout/     # Sidebar, Topbar, MobileNav, CommandPalette
│   │   │   ├── contexts/       # AuthContext, ThemeContext
│   │   │   ├── lib/
│   │   │   │   ├── api.ts      # Typed API client (all endpoints)
│   │   │   │   └── utils.ts    # formatDate, formatRelativeTime, cn, etc.
│   │   │   └── routes/         # React Router route definitions
│   │   └── public/
│   │       ├── manifest.json   # PWA manifest
│   │       └── sw.js           # Service worker
│   └── api/                    # Express + TypeScript backend
│       ├── src/
│       │   ├── routes/         # All API route handlers
│       │   ├── middleware/     # Auth, rate-limit, security, error handler
│       │   └── index.ts        # Server entry point
│       └── prisma/
│           ├── schema.prisma   # Database schema (12 models)
│           └── seed.ts         # Demo data seeder
├── packages/
│   └── ui/                     # Shared UI component library (future)
├── agent-config/               # Phase tracking & commit guides
└── docs/api/                   # Bruno API collection
```

---

## 6. Key Routes

### Web App Routes

| Path | Page | Access |
|------|------|--------|
| `/` | Landing page | Public |
| `/login` | Login | Public |
| `/forgot-password` | OTP password reset | Public |
| `/change-password` | Forced password change | Auth |
| `/portal/dashboard` | Client dashboard | Client |
| `/portal/documents` | Document vault | Client |
| `/portal/roadmap` | Gantt chart | Client |
| `/portal/progress` | Progress tracker | Client |
| `/portal/timeline` | Milestone timeline | Client |
| `/portal/meetings` | Meeting scheduler | Client |
| `/portal/invoices` | Invoice view | Client |
| `/portal/notifications` | Notification center | Client |
| `/portal/settings` | Account settings | Client |
| `/admin/dashboard` | Admin overview | Admin/Manager |
| `/admin/clients` | Client management | Admin/Manager |
| `/admin/projects` | Project management | Admin/Manager |
| `/admin/documents` | Document upload | Admin/Manager |
| `/admin/invoices` | Invoice management | Admin/Manager |
| `/admin/meetings` | Meeting scheduler | Admin/Manager |
| `/admin/users` | User management | Admin only |
| `/admin/analytics` | Analytics dashboard | Admin/Manager |
| `/admin/activity` | Activity log | Admin only |

### API Base URL: `http://localhost:4000/api/v1`

| Method | Path | Description |
|--------|------|-------------|
| POST | `/auth/login` | Login |
| POST | `/auth/logout` | Logout |
| POST | `/auth/refresh` | Refresh access token |
| GET | `/auth/me` | Current user |
| POST | `/auth/change-password` | Change password |
| POST | `/auth/forgot-password` | Send OTP |
| POST | `/auth/verify-otp` | Verify OTP |
| POST | `/auth/reset-password` | Reset with OTP |
| GET | `/clients` | List clients |
| GET | `/projects` | List projects |
| GET | `/milestones` | List milestones |
| GET | `/documents` | List documents |
| GET | `/meetings` | List meetings |
| GET | `/invoices` | List invoices |
| GET | `/progress` | List progress updates |
| GET | `/notifications` | List notifications |
| GET | `/admin/stats` | Dashboard stats |
| GET | `/admin/users` | All users |
| GET | `/admin/logs` | Activity logs |
| GET | `/health` | Health check |

Use the Bruno collection at `docs/api/hapkonic-portal/` for full API testing.

---

## 7. Running Tests

```bash
# Run all web tests (single run, no watch)
npm run test --workspace=apps/web -- --run

# Run in watch mode (development)
npm run test --workspace=apps/web

# Run with coverage report
npm run test --workspace=apps/web -- --run --coverage
```

Tests are located in:
- `apps/web/src/components/ui/__tests__/` — Component unit tests
- `apps/web/src/lib/__tests__/` — Utility function tests
- `apps/web/src/pages/portal/__tests__/` — Page integration tests
- `apps/web/src/pages/auth/__tests__/` — Auth page tests

---

## 8. Production Deployment

### 8.1 Frontend → Vercel

1. Push to `main` branch
2. Connect repo to [vercel.com](https://vercel.com)
3. Set **Root Directory** to `apps/web`
4. Set **Framework Preset** to `Vite`
5. Add environment variable:
   - `VITE_API_URL` = `https://your-api.onrender.com/api/v1`
6. Deploy — Vercel auto-deploys on every push to `main`

The `apps/web/vercel.json` handles:
- SPA routing (all paths → `index.html`)
- Service worker cache headers
- Static asset immutable caching

### 8.2 Backend → Render

1. Connect repo to [render.com](https://render.com)
2. Create a **Web Service**, set root to `apps/api`
3. Build command: `npm ci && npm run build`
4. Start command: `npm start`
5. Add all environment variables from Section 3
6. The `apps/api/render.yaml` documents the full service definition

**Or use the Render Blueprint** (one-click deploy with `render.yaml`).

### 8.3 Database → Neon

1. Create project at [neon.tech](https://neon.tech)
2. Copy `DATABASE_URL` (pooled, with `?pgbouncer=true`) and `DIRECT_URL` (direct)
3. On first deploy, run migrations:
   ```bash
   DATABASE_URL=your-prod-url npx prisma migrate deploy
   ```

### 8.4 DNS → Cloudflare

Point `portal.hapkonic.com` → Vercel deployment URL via CNAME.
Point `api.hapkonic.com` → Render service URL via CNAME.

---

## 9. Global Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `⌘K` / `Ctrl+K` | Open command palette |
| `↑` / `↓` | Navigate palette results |
| `Enter` | Select palette item |
| `Esc` | Close palette / modal |

---

## 10. Commit Convention

All commits must follow:

```
chore(phase-NN): complete Phase N — <Phase Title>
```

Git identity (set before every commit):
```bash
git config user.name "Harsh Raj A"
git config user.email "hraj20000@gmail.com"
```

See `agent-config/COMMIT_GUIDE.md` for the full workflow.
