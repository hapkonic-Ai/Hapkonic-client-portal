# Hapkonic Client Portal — API Documentation

Base URL: `/api/v1`

All endpoints return JSON. Authenticated endpoints require a `Bearer` token in the `Authorization` header.

---

## Authentication Flow

### Login
```
POST /auth/login
```
**Body:**
```json
{
  "email": "user@example.com",
  "password": "securePassword123"
}
```
**Response (200):**
```json
{
  "accessToken": "eyJhbG...",
  "user": {
    "id": "clx...",
    "email": "user@example.com",
    "name": "Jane Smith",
    "role": "client",
    "clientId": "clx...",
    "avatar": "https://utfs.io/f/...",
    "forcePasswordReset": false
  }
}
```
A `refreshToken` httpOnly cookie is also set.

If `forcePasswordReset` is `true`, the client should redirect to the change-password page.

### Refresh Token
```
POST /auth/refresh
```
Uses the `refreshToken` cookie. Returns a new `accessToken`.

### Logout
```
POST /auth/logout
```
Clears the refresh token cookie and revokes the token in Redis.

### Forgot Password
```
POST /auth/forgot-password
```
**Body:**
```json
{ "email": "user@example.com" }
```
Sends a 6-digit OTP via email (valid for 10 minutes). Rate-limited to 3 requests per 15 minutes.

### Verify OTP
```
POST /auth/verify-otp
```
**Body:**
```json
{ "email": "user@example.com", "otp": "123456" }
```

### Reset Password
```
POST /auth/reset-password
```
**Body:**
```json
{
  "email": "user@example.com",
  "otp": "123456",
  "newPassword": "newSecurePassword123"
}
```

### Change Password (Authenticated)
```
POST /auth/change-password
```
**Body:**
```json
{
  "currentPassword": "oldPassword",
  "newPassword": "newPassword123"
}
```

---

## Clients

### List Clients
```
GET /clients
```
- Admin/Manager: returns all clients
- Client users: returns only their assigned client

### Get Client
```
GET /clients/:id
```
Returns client with associated projects, users, and invoices.

### Create Client
```
POST /clients
```
**Roles:** Admin, Manager

**Body:**
```json
{
  "companyName": "Acme Corp",
  "industry": "Technology",
  "contactName": "John Doe",
  "contactEmail": "john@acme.com",
  "contactPhone": "+91-9876543210"
}
```

### Update Client
```
PATCH /clients/:id
```
**Roles:** Admin, Manager

### Delete Client
```
DELETE /clients/:id
```
**Roles:** Admin only. Cascades to all associated projects, documents, and invoices.

### Deactivate Client
```
PATCH /clients/:id/deactivate
```
**Roles:** Admin, Manager. Soft-deactivation — preserves data.

---

## Projects

### List Projects
```
GET /projects?clientId=clx...
```
- Admin/Manager: all projects (optionally filtered by `clientId`)
- Client users: only their client's projects

### Get Project
```
GET /projects/:id
```
Returns project with milestones, tasks, and latest progress updates.

Client users can only access projects belonging to their client.

### Create Project
```
POST /projects
```
**Roles:** Admin, Manager

**Body:**
```json
{
  "name": "E-Commerce Platform",
  "clientId": "clx...",
  "description": "Full-stack e-commerce rebuild",
  "status": "planning",
  "startDate": "2025-04-01T00:00:00Z",
  "endDate": "2025-09-30T00:00:00Z"
}
```

---

## Documents

### Upload File
```
POST /documents/upload
Content-Type: multipart/form-data
```
**Roles:** Admin, Manager

Uploads to Uploadthing CDN. Returns the file URL and metadata.

### List Documents
```
GET /documents?projectId=clx...&category=contracts
```

### Create Document Record
```
POST /documents
```
**Body:**
```json
{
  "projectId": "clx...",
  "label": "Contract v2",
  "category": "contracts",
  "fileUrl": "https://utfs.io/f/...",
  "fileKey": "abc123",
  "fileSize": 245000,
  "mimeType": "application/pdf"
}
```

### Download Document
```
POST /documents/:id/download
```
Tracks download timestamp and returns file URL.

---

## Invoices

### List Invoices
```
GET /invoices
```
Returns invoices with summary stats:
```json
{
  "invoices": [...],
  "summary": {
    "totalPaid": 150000,
    "totalPending": 50000,
    "totalOverdue": 25000
  }
}
```

### Create Invoice
```
POST /invoices
```
**Body:**
```json
{
  "clientId": "clx...",
  "invoiceNumber": "INV-2025-001",
  "amount": 50000.00,
  "dueDate": "2025-04-30T00:00:00Z",
  "notes": "Q2 development milestone payment"
}
```

### Update Invoice Status
```
PATCH /invoices/:id/status
```
**Body:**
```json
{
  "status": "paid",
  "paidDate": "2025-04-15T00:00:00Z"
}
```

### Snooze Reminder
```
POST /invoices/:id/snooze
```
**Body:**
```json
{ "days": 7 }
```
Max 30 days.

---

## Meetings

### List Meetings
```
GET /meetings?projectId=clx...&upcoming=true
```

### Create Meeting
```
POST /meetings
```
**Body:**
```json
{
  "projectId": "clx...",
  "title": "Sprint Review",
  "type": "review",
  "startTime": "2025-04-10T10:00:00Z",
  "endTime": "2025-04-10T11:00:00Z",
  "meetLink": "https://meet.google.com/abc-defg-hij",
  "agenda": "Review sprint deliverables"
}
```

---

## Progress Updates

### List Updates
```
GET /progress?projectId=clx...
```

### Create Update
```
POST /progress
```
**Body:**
```json
{
  "projectId": "clx...",
  "body": "Completed authentication module and started dashboard",
  "overallPct": 35,
  "designPct": 80,
  "devPct": 30,
  "testingPct": 10,
  "deployPct": 0
}
```

### Add Comment
```
POST /progress/:id/comments
```
**Body:**
```json
{
  "body": "Great progress! Can we prioritize the payment integration?",
  "parentId": null
}
```
Set `parentId` for threaded replies.

### Add Reaction
```
POST /progress/:id/reactions
```
**Body:**
```json
{ "emoji": "thumbsup" }
```

---

## Milestones

### Create Milestone
```
POST /milestones
```
**Body:**
```json
{
  "projectId": "clx...",
  "title": "MVP Launch",
  "description": "Core features ready for production",
  "targetDate": "2025-06-01T00:00:00Z",
  "order": 3
}
```

### Update Milestone
```
PATCH /milestones/:id
```
When `status` is changed to `completed`, `completedAt` and `completedBy` are auto-set.

---

## Admin

### Create User
```
POST /admin/users
```
**Roles:** Admin, Manager

**Body:**
```json
{
  "email": "newuser@company.com",
  "name": "New User",
  "role": "client",
  "clientId": "clx...",
  "password": "tempPassword123"
}
```
The user receives a welcome email with a one-time OTP. `forcePasswordReset` is set to `true`.

### Delete User
```
DELETE /admin/users/:id
```
**Roles:** Admin only

**Security rules:**
- Cannot delete your own account
- Cannot delete other admin accounts (deactivate instead)
- Cascades: comments, reactions, notifications, progress updates, admin logs
- Documents and invoices preserve files but lose author attribution (set to null)
- Cloud avatar is cleaned up from Uploadthing

### Query Audit Logs
```
GET /admin/logs?userId=clx...&action=DELETE_USER&entityType=User&take=50&skip=0
```
Returns paginated admin activity logs. `take` is capped at 100.

---

## Error Responses

All errors follow a consistent format:

```json
{
  "message": "Human-readable error message",
  "code": "ERROR_CODE"
}
```

Common error codes:
| Code | HTTP Status | Description |
|------|-------------|-------------|
| `UNAUTHENTICATED` | 401 | Missing or invalid token |
| `TOKEN_INVALID` | 401 | Expired or malformed JWT |
| `FORBIDDEN` | 403 | Insufficient permissions |
| `NOT_FOUND` | 404 | Resource not found |
| `CONFLICT` | 409 | Duplicate resource (e.g., email) |
| `VALIDATION_ERROR` | 400 | Invalid request body |
| `SELF_DELETE` | 400 | Cannot delete own account |
| `RATE_LIMIT` | 429 | Too many requests |

---

## WebSocket Events

The server uses Socket.io for real-time features. Connect to the root namespace with JWT auth:

```javascript
import { io } from 'socket.io-client'

const socket = io('https://your-api.onrender.com', {
  auth: { token: accessToken }
})

// Join user-specific room for notifications
socket.emit('join', userId)

// Listen for real-time notifications
socket.on('notification', (data) => {
  console.log('New notification:', data)
})
```

The server verifies the JWT on connection. Invalid tokens are rejected.
