# Hapkonic Client Portal

A premium, full-stack client portal built for **Hapkonic Software Agency** — giving clients real-time visibility into their projects, documents, invoices, and meetings, while providing the internal team with a powerful admin dashboard.

![Node.js](https://img.shields.io/badge/Node.js-%3E%3D20-339933?logo=node.js&logoColor=white)
![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178C6?logo=typescript&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Neon-4169E1?logo=postgresql&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-6-2D3748?logo=prisma&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-06B6D4?logo=tailwindcss&logoColor=white)

---

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Database Setup](#database-setup)
- [Running Locally](#running-locally)
- [Deployment](#deployment)
- [API Reference](#api-reference)
- [Security](#security)
- [License](#license)

---

## Features

### Client Portal
- **Dashboard** — Project overview, quick stats, and recent activity
- **Roadmap** — Interactive Gantt chart with milestone tracking
- **Timeline** — Historical milestone timeline visualization
- **Documents** — Categorized document vault with upload/download
- **Invoices** — Invoice tracking with status, payments, and reminders
- **Meetings** — Meeting scheduler with agenda and action items
- **Progress Updates** — Threaded comments, emoji reactions, and progress tracking
- **Notifications** — Real-time notification center
- **Settings** — User profile, avatar upload, password management

### Admin Panel
- **Dashboard** — KPIs, revenue breakdown, project pipeline analytics
- **Client Management** — Full CRUD with deactivation support
- **Project Management** — Create, assign, and track projects
- **User Management** — Create, edit, deactivate, delete users with role-based access
- **Document Management** — Upload to cloud CDN, categorize, track views/downloads
- **Invoice Management** — Create invoices, track payments, send reminders
- **Meeting Management** — Schedule and manage client meetings
- **Activity Logs** — Full audit trail of all admin actions
- **Analytics** — Advanced reporting and data visualization
- **Comments Moderation** — System-wide comment management

### Security
- JWT authentication with refresh token rotation
- Role-based access control (Admin, Manager, Client)
- Rate limiting on auth endpoints (Upstash Redis)
- CORS with explicit origin whitelist
- Helmet security headers
- Audit logging with sensitive field redaction
- Secure user deletion with cascading cleanup
- Cloud file storage (no local filesystem dependency)

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 18, TypeScript, Vite, Tailwind CSS v4, Framer Motion, Three.js |
| **Backend** | Node.js, Express, TypeScript, Socket.io |
| **Database** | PostgreSQL (Neon), Prisma ORM |
| **Cache/Queue** | Upstash Redis (rate limiting, OTP storage, token revocation) |
| **File Storage** | Uploadthing CDN |
| **Email** | Resend |
| **Monorepo** | Turborepo with npm workspaces |
| **Deployment** | Vercel (frontend), Render (API), Neon (database) |

---

## Project Structure

```
hapkonic-client-portal/
├── apps/
│   ├── web/                    # React frontend
│   │   ├── src/
│   │   │   ├── components/
│   │   │   │   ├── layout/     # Sidebar, Topbar, MobileNav
│   │   │   │   ├── ui/         # Button, Input, Card, Modal, Badge, etc.
│   │   │   │   └── guards/     # ProtectedRoute
│   │   │   ├── pages/
│   │   │   │   ├── auth/       # Login, ForgotPassword, ChangePassword
│   │   │   │   ├── portal/     # Dashboard, Documents, Invoices, Meetings, etc.
│   │   │   │   ├── admin/      # AdminDashboard, Clients, Projects, Users, etc.
│   │   │   │   └── errors/     # 404, 403
│   │   │   ├── lib/
│   │   │   │   ├── api.ts      # API client with types and auto-refresh
│   │   │   │   └── utils.ts    # Helper functions
│   │   │   └── App.tsx         # Router and layout
│   │   ├── public/             # Static assets and logo
│   │   └── vite.config.ts
│   │
│   └── api/                    # Express backend
│       ├── src/
│       │   ├── routes/         # auth, clients, projects, documents, etc.
│       │   ├── middleware/     # auth, validate, errorHandler
│       │   ├── lib/            # prisma, redis, utapi helpers
│       │   └── index.ts        # Server entry point
│       └── prisma/
│           └── schema.prisma   # Database schema (15+ models)
│
├── packages/
│   └── ui/                     # Shared design tokens
│
├── turbo.json                  # Turborepo pipeline config
├── vercel.json                 # Vercel deployment config
├── render.yaml                 # Render deployment config
└── package.json                # Root workspace config
```

---

## Getting Started

### Prerequisites

- **Node.js** >= 20.0.0
- **npm** >= 9
- A [Neon](https://neon.tech) PostgreSQL database
- An [Upstash](https://upstash.com) Redis instance
- An [Uploadthing](https://uploadthing.com) account
- (Optional) A [Resend](https://resend.com) account for emails

### Installation

```bash
# Clone the repository
git clone https://github.com/hapkonic-Ai/Hapkonic-client-portal.git
cd Hapkonic-client-portal

# Install all dependencies (workspaces)
npm install
```

---

## Environment Variables

### Backend (`apps/api/.env`)

Copy the example and fill in your values:

```bash
cp apps/api/.env.example apps/api/.env
```

| Variable | Description | Required |
|----------|-------------|----------|
| `PORT` | API server port (default: 4000) | No |
| `NODE_ENV` | `development` or `production` | No |
| `CLIENT_URL` | Frontend URL for CORS (e.g., `http://localhost:3000`) | Yes |
| `DATABASE_URL` | Neon PostgreSQL connection string | Yes |
| `JWT_SECRET` | Secret for access tokens (min 32 chars) | Yes |
| `JWT_REFRESH_SECRET` | Secret for refresh tokens (min 32 chars) | Yes |
| `JWT_EXPIRES_IN` | Access token expiry (default: `15m`) | No |
| `JWT_REFRESH_EXPIRES_IN` | Refresh token expiry (default: `7d`) | No |
| `UPSTASH_REDIS_REST_URL` | Upstash Redis REST URL | Yes |
| `UPSTASH_REDIS_REST_TOKEN` | Upstash Redis REST token | Yes |
| `UPLOADTHING_SECRET` | Uploadthing API secret | Yes |
| `RESEND_API_KEY` | Resend API key for emails | No |
| `RESEND_FROM` | Sender email address | No |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID (for calendar) | No |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret | No |
| `GOOGLE_REDIRECT_URI` | Google OAuth redirect URI | No |

### Frontend (`apps/web/.env`)

```bash
cp apps/web/.env.example apps/web/.env
```

| Variable | Description | Required |
|----------|-------------|----------|
| `VITE_API_URL` | Backend API URL (default: `http://localhost:4000/api/v1`) | No |

---

## Database Setup

```bash
# Generate the Prisma client
cd apps/api
npx prisma generate

# Push schema to database (creates tables)
npx prisma db push

# (Optional) Seed with sample data
npm run prisma:seed

# (Optional) Open Prisma Studio to browse data
npm run prisma:studio
```

---

## Running Locally

From the project root:

```bash
# Start both frontend and backend in development mode
npm run dev
```

This uses Turborepo to run both apps concurrently:
- **Frontend**: http://localhost:3000
- **Backend**: http://localhost:4000
- **API Base**: http://localhost:4000/api/v1

The Vite dev server proxies `/api/*` requests to the backend automatically.

### Running individually

```bash
# Frontend only
cd apps/web && npm run dev

# Backend only
cd apps/api && npm run dev
```

---

## Deployment

### Frontend — Vercel

1. Import the repository on [Vercel](https://vercel.com)
2. The `vercel.json` in the root is pre-configured:
   - **Build Command**: `cd apps/web && npm run build`
   - **Output Directory**: `apps/web/dist`
3. Add environment variable:
   - `VITE_API_URL` = your Render API URL (e.g., `https://your-api.onrender.com/api/v1`)
4. Deploy

### Backend — Render

1. Create a new **Web Service** on [Render](https://render.com)
2. Connect the GitHub repository
3. Configure:
   - **Build Command**: `cd apps/api && npm install && npx prisma generate && npm run build`
   - **Start Command**: `cd apps/api && npx prisma db push && npm start`
4. Add all required environment variables (see table above)
5. Set `CLIENT_URL` to your Vercel frontend URL
6. Deploy

### Database — Neon

1. Create a project on [Neon](https://neon.tech)
2. Copy the connection string to `DATABASE_URL`
3. Run `npx prisma db push` to create tables

---

## API Reference

All endpoints are prefixed with `/api/v1`. Authentication is required unless noted.

### Authentication
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/auth/login` | Login with email/password | No |
| POST | `/auth/refresh` | Refresh access token | Cookie |
| POST | `/auth/logout` | Logout and revoke token | Yes |
| POST | `/auth/forgot-password` | Send password reset OTP | No |
| POST | `/auth/verify-otp` | Verify OTP validity | No |
| POST | `/auth/reset-password` | Reset password with OTP | No |
| POST | `/auth/change-password` | Change current password | Yes |
| GET | `/auth/me` | Get current user profile | Yes |

### Clients
| Method | Endpoint | Description | Roles |
|--------|----------|-------------|-------|
| GET | `/clients` | List clients | All |
| GET | `/clients/:id` | Get client details | All |
| POST | `/clients` | Create client | Admin, Manager |
| PATCH | `/clients/:id` | Update client | Admin, Manager |
| DELETE | `/clients/:id` | Delete client | Admin |
| PATCH | `/clients/:id/deactivate` | Deactivate client | Admin, Manager |

### Projects
| Method | Endpoint | Description | Roles |
|--------|----------|-------------|-------|
| GET | `/projects` | List projects | All |
| GET | `/projects/:id` | Get project details | All |
| POST | `/projects` | Create project | Admin, Manager |
| PATCH | `/projects/:id` | Update project | Admin, Manager |
| DELETE | `/projects/:id` | Delete project | Admin |

### Documents
| Method | Endpoint | Description | Roles |
|--------|----------|-------------|-------|
| POST | `/documents/upload` | Upload file to CDN | Admin, Manager |
| GET | `/documents` | List documents | All |
| GET | `/documents/:id` | Get document details | All |
| POST | `/documents` | Create document record | Admin, Manager |
| DELETE | `/documents/:id` | Delete document | Admin, Manager |
| POST | `/documents/:id/download` | Download document | All |

### Invoices
| Method | Endpoint | Description | Roles |
|--------|----------|-------------|-------|
| GET | `/invoices` | List invoices with summary | All |
| GET | `/invoices/:id` | Get invoice details | All |
| POST | `/invoices` | Create invoice | Admin, Manager |
| PATCH | `/invoices/:id/status` | Update invoice status | Admin, Manager |
| POST | `/invoices/:id/snooze` | Snooze reminder | Admin, Manager |
| DELETE | `/invoices/:id` | Delete invoice | Admin |

### Meetings
| Method | Endpoint | Description | Roles |
|--------|----------|-------------|-------|
| GET | `/meetings` | List meetings | All |
| GET | `/meetings/:id` | Get meeting details | All |
| POST | `/meetings` | Create meeting | Admin, Manager |
| PATCH | `/meetings/:id` | Update meeting | Admin, Manager |
| DELETE | `/meetings/:id` | Delete meeting | Admin, Manager |

### Progress Updates
| Method | Endpoint | Description | Roles |
|--------|----------|-------------|-------|
| GET | `/progress` | List progress updates | All |
| GET | `/progress/:id` | Get update with comments | All |
| POST | `/progress` | Create progress update | Admin, Manager |
| PATCH | `/progress/:id` | Edit progress update | Admin, Manager |
| DELETE | `/progress/:id` | Delete progress update | Admin, Manager |
| POST | `/progress/:id/comments` | Add comment | All |
| DELETE | `/progress/comments/:id` | Delete comment | Owner, Admin |
| POST | `/progress/:id/reactions` | Add reaction | All |
| DELETE | `/progress/:id/reactions/:emoji` | Remove reaction | All |

### Milestones
| Method | Endpoint | Description | Roles |
|--------|----------|-------------|-------|
| GET | `/milestones` | List milestones | All |
| GET | `/milestones/:id` | Get milestone details | All |
| POST | `/milestones` | Create milestone | Admin, Manager |
| PATCH | `/milestones/:id` | Update milestone | Admin, Manager |
| DELETE | `/milestones/:id` | Delete milestone | Admin |
| POST | `/milestones/:id/comments` | Add comment | All |
| PATCH | `/milestones/comments/:id/resolve` | Resolve comment | Admin, Manager |
| DELETE | `/milestones/comments/:id` | Delete comment | Owner, Admin |

### Notifications
| Method | Endpoint | Description | Roles |
|--------|----------|-------------|-------|
| GET | `/notifications` | List notifications | All |
| PATCH | `/notifications/:id/read` | Mark as read | All |
| POST | `/notifications/read-all` | Mark all as read | All |

### Users
| Method | Endpoint | Description | Roles |
|--------|----------|-------------|-------|
| GET | `/users/me` | Get profile | All |
| POST | `/users/me/avatar` | Upload avatar | All |
| DELETE | `/users/me/avatar` | Remove avatar | All |

### Admin
| Method | Endpoint | Description | Roles |
|--------|----------|-------------|-------|
| GET | `/admin/users` | List all users | Admin, Manager |
| POST | `/admin/users` | Create user | Admin, Manager |
| PATCH | `/admin/users/:id` | Update user | Admin, Manager |
| DELETE | `/admin/users/:id` | Delete user permanently | Admin |
| POST | `/admin/users/:id/reset-password` | Reset user password | Admin, Manager |
| GET | `/admin/logs` | Query audit logs | Admin, Manager |
| GET | `/admin/stats` | Dashboard statistics | Admin, Manager |

---

## Security

This application implements multiple layers of security:

- **Authentication**: JWT access + refresh token pattern with httpOnly cookies
- **Authorization**: Role-based access control enforced at route level
- **Rate Limiting**: Upstash Redis-backed rate limiting on auth endpoints
- **Input Validation**: Zod schema validation on all request bodies
- **CORS**: Explicit origin whitelist via `CLIENT_URL` env var
- **Headers**: Helmet middleware for security headers (CSP, HSTS, etc.)
- **Audit Trail**: All admin actions logged with IP address and sanitized metadata
- **Password Security**: bcrypt with 12 salt rounds, forced reset on first login
- **File Storage**: Uploadthing CDN (no local filesystem; works on ephemeral containers)
- **Socket.io**: JWT-authenticated WebSocket connections
- **User Deletion**: Admin-only, prevents self-deletion and admin-deletion, cascading cleanup
- **Sensitive Data**: Passwords, tokens, and OTPs redacted from audit logs

---

## License

This project is proprietary software built for Hapkonic Software Agency. All rights reserved.
