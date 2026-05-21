# Access Control System - Technical Documentation

## Overview

The access control system manages user permissions to access the iVALT Developer Portal. It ensures that only approved users can view and manage API keys.

## Database Schema

### Users Table (Updated)

```sql
ALTER TABLE "users" ADD COLUMN "status" VARCHAR(20) DEFAULT 'pending' NOT NULL;
ALTER TABLE "users" ADD COLUMN "approved_at" TIMESTAMP;
```

| Column | Type | Default | Description |
|--------|------|---------|-------------|
| `status` | VARCHAR(20) | `'pending'` | User's access status |
| `approved_at` | TIMESTAMP | NULL | When user was approved |

**Status Values:**
- `pending` - Biometric auth complete, awaiting approval
- `approved` - Admin approved, full access granted
- `rejected` - Admin denied, must resubmit

### Access Requests Table (New)

```sql
CREATE TABLE "access_requests" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  "user_id" TEXT NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "use_case" VARCHAR(500) NOT NULL,
  "requested_at" TIMESTAMP NOT NULL DEFAULT NOW(),
  "approved_at" TIMESTAMP,
  "admin_notes" VARCHAR(1000)
);
```

| Column | Type | Description |
|--------|------|-------------|
| `id` | TEXT | Unique identifier |
| `user_id` | TEXT | Foreign key to users |
| `use_case` | VARCHAR(500) | User's explained use case |
| `requested_at` | TIMESTAMP | When request was submitted |
| `approved_at` | TIMESTAMP | When request was approved |
| `admin_notes` | VARCHAR(1000) | Optional admin comments |

## API Endpoints

### POST `/api/access/request`

Submit a new access request.

**Request Body:**
```json
{
  "useCase": "Building a mobile app for biometric authentication"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Access request submitted successfully"
}
```

**Error Responses:**
- `401 Unauthorized` - Not authenticated
- `400 Bad Request` - Request already exists

### GET `/api/access/me`

Get current user's access status.

**Response:**
```json
{
  "status": "pending",
  "request": {
    "id": "xxx",
    "useCase": "...",
    "requestedAt": "2024-01-01T00:00:00Z"
  }
}
```

### GET `/api/access/request` (Admin)

List all access requests.

**Query Parameters:**
- `status` - Filter by status: `pending`, `approved`, `all`

**Response:**
```json
{
  "requests": [
    {
      "id": "xxx",
      "useCase": "...",
      "userId": "yyy",
      "requestedAt": "2024-01-01T00:00:00Z",
      "user": {
        "id": "yyy",
        "phoneNumber": "+1234567890",
        "name": "John Doe"
      }
    }
  ]
}
```

### POST `/api/access/approve`

Approve or reject a request.

**Request Body:**
```json
{
  "requestId": "xxx",
  "approved": true,
  "adminNotes": "Production integration approved"
}
```

## Session Data

```typescript
interface SessionData {
  userId?: string;
  phoneNumber?: string;
  isLoggedIn?: boolean;
  accessStatus?: "pending" | "approved" | "rejected";
}
```

## Middleware/Auth Flow

### Dashboard Layout Protection

```typescript
// src/app/dashboard/layout.tsx
if (!DEMO_MODE && session.accessStatus !== "approved") {
  redirect("/access/status");
}
```

### Login Post-Auth Redirect

```typescript
// src/app/login/page.tsx
const redirectPath = accessStatus === "approved" ? "/dashboard" : "/access/request";
```

## Admin Notification

When a request is submitted, the system logs:

```typescript
console.log(`[ADMIN NOTIFICATION] New access request from user ${userId}: ${useCase}`);
```

**In Production:** Replace this with:
- SMTP email to admin
- Slack webhook notification
- SMS alert

## Demo Mode Behavior

In demo mode:
- User is auto-approved
- No access request submitted
- Demo API keys shown
- `accessStatus: "approved"`

## Migration

Run the migration:

```bash
pnpm db:push
```

Or run manually:

```bash
psql $DATABASE_URL < drizzle/0002_access_control.sql
```

## Environment Variables

None new required. The system uses existing database connection.

## Testing

### Manual Testing

1. **Login as new user:**
   - Enter phone number
   - Approve via iVALT app
   - Should redirect to access request form

2. **Submit request:**
   - Fill use case
   - Submit
   - Check database for request record

3. **Admin approve:**
   - Call `/api/access/approve` with `approved: true`
   - Check user status updated

4. **Verify access:**
   - Login again
   - Should redirect to dashboard