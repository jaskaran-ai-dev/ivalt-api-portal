# iVALT Developer Portal

A full-stack Next.js 15 developer portal for managing iVALT biometric API keys, built with the Slack design system.

## Features

- **Biometric Login** — iVALT passwordless authentication via mobile number + biometric push notification
- **Access Control** — Admin-approved access requests before API key management
- **API Key Management** — Create, enable/disable, and delete AWS API Gateway keys (up to 4 per user)
- **API Documentation** — Interactive in-app docs for the iVALT biometric auth API
- **Design System** — Slack-inspired purple/white design with Montserrat + Open Sans typography

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 15 (App Router) |
| Database | PostgreSQL + Drizzle ORM |
| Auth | iVALT Biometric API + iron-session |
| API Keys | AWS API Gateway SDK |
| Styling | Tailwind CSS v4 + Slack design tokens |
| UI | Shadcn-compatible components (custom) |
| Notifications | Sonner |

## Project Structure

```
src/
├── app/
│   ├── login/                  # Biometric login page
│   ├── access/
│   │   ├── request/page.tsx    # Access request form (new users)
│   │   └── status/page.tsx     # Pending access status page
│   ├── dashboard/
│   │   ├── page.tsx            # Dashboard overview
│   │   ├── keys/page.tsx       # API key management
│   │   └── docs/page.tsx       # API documentation
│   └── api/
│       ├── auth/
│       │   ├── request/        # POST - initiate biometric auth
│       │   ├── verify/         # POST - poll result + create session
│       │   └── logout/         # POST - destroy session
│       ├── access/
│       │   ├── request/route.ts   # POST - submit access request, GET - list requests (admin)
│       │   ├── approve/route.ts   # POST - approve/reject access request
│       │   └── me/route.ts       # GET - current user's access status
│       └── keys/
│           ├── route.ts         # GET - list keys
│           ├── create/          # POST - create key
│           └── [id]/            # DELETE + PATCH - manage key
├── components/
│   ├── layout/
│   │   └── DashboardShell.tsx  # Sidebar + header layout
│   └── ui/
│       └── ...                 # Shadcn-compatible components
├── db/
│   ├── index.ts                # Drizzle connection
│   ├── schema.ts               # Table definitions
│   └── migrations/             # Migration files
└── lib/
    ├── session.ts              # iron-session config
    ├── ivalt.ts                # iVALT API client
    ├── aws-gateway.ts          # AWS API Gateway client
    └── demo.ts                 # Demo mode fixtures
```

## Setup

### 1. Prerequisites

- Node.js 20+
- PostgreSQL 14+
- AWS account with API Gateway configured
- iVALT API credentials (security token)

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Variables

Copy `.env.local.example` to `.env.local` and fill in all values:

```bash
cp .env.local.example .env.local
```

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string |
| `IVALT_API_BASE_URL` | iVALT API base URL (usually `https://api.ivalt.com`) |
| `IVALT_SECURITY_TOKEN` | Your iVALT security token from admin panel |
| `AWS_REGION` | AWS region for API Gateway (e.g. `us-east-1`) |
| `AWS_ACCESS_KEY_ID` | AWS IAM access key |
| `AWS_SECRET_ACCESS_KEY` | AWS IAM secret key |
| `AWS_API_GATEWAY_REST_API_ID` | Your REST API ID in API Gateway |
| `AWS_API_GATEWAY_USAGE_PLAN_ID` | Usage plan to attach keys to |
| `SESSION_SECRET` | Random string ≥32 chars for session encryption |

### 4. Database Setup

```bash
# Push schema to database
npm run db:push

# Or run the migration SQL directly
psql $DATABASE_URL < drizzle/0001_initial.sql
```

### 5. AWS IAM Permissions

Your IAM user needs these API Gateway permissions:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "apigateway:POST",
        "apigateway:GET",
        "apigateway:PATCH",
        "apigateway:DELETE"
      ],
      "Resource": [
        "arn:aws:apigateway:*::/apikeys",
        "arn:aws:apigateway:*::/apikeys/*",
        "arn:aws:apigateway:*::/usageplans/*/keys",
        "arn:aws:apigateway:*::/usageplans/*/keys/*"
      ]
    }
  ]
}
```

### 6. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Authentication Flow

1. User enters mobile number on login page
2. App calls `POST /api/auth/request` → calls iVALT `BiometricAuthRequest`
3. iVALT sends push notification to user's phone
4. Client polls `POST /api/auth/verify` every 2 seconds
5. Server polls iVALT `BiometricResultRequest`
6. On status 200 (authenticated), session is created with `accessStatus: "pending"`
7. User is redirected to `/access/request` to submit use case
8. Admin reviews request and approves/denies via admin panel
9. On approval, user status changes to `"approved"` and can access dashboard

## New User Access Flow

```
Login → Biometric Auth → Access Request Form → Admin Review → Approved → Dashboard
```

Users must describe their use case before getting API access. The admin team receives notification
and can approve/deny requests. Approved users get full dashboard access.

## API Key Limits

- **Maximum 4 keys** per user account
- Keys are created in AWS API Gateway and attached to the configured usage plan
- Key values are shown **only once** at creation — store them securely
- Keys can be enabled/disabled without deletion

## Design System

The portal uses the Slack-inspired design system defined in `DESIGN__3_.md`:
- **Primary**: Purple Heart `#611f69`
- **Background**: Canvas Ice `#fefbff`
- **Cards**: Surface Frost `#ffffff` with 16px border radius
- **Fonts**: Montserrat (headings) + Open Sans (body)
- **Accent**: Electric Blue `#1264a3` for links

## Deployment

```bash
npm run build
npm run start
```

For EC2 + nginx + PM2 deployment (matching your existing iVALT stack), use:

```bash
# Build
npm run build

# Start with PM2
pm2 start npm --name "ivalt-portal" -- start
pm2 save
```

Nginx config example:
```nginx
server {
    listen 80;
    server_name portal.yourdomain.com;
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```
