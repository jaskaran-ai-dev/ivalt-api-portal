# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
bun dev          # Start dev server on http://localhost:3000
bun run build    # Production build
bun start        # Serve production build (or: bun run start)

bun run db:push      # Sync schema to DB (no migration file generated)
bun run db:generate  # Generate a migration file from schema changes
bun run db:migrate   # Run pending migrations
bun run db:studio    # Open Drizzle Studio GUI
```

No test suite is configured. TypeScript is the primary correctness check — `bun run build` will catch type errors.

## Architecture

**Next.js 15 App Router** with React 19. All routing is file-based under `src/app/`.

### Auth flow

1. `POST /api/auth/request` — sends a push notification to the user's phone via the iVALT API (`src/lib/ivalt.ts`).
2. Client polls `POST /api/auth/verify` every 2 s — server polls iVALT `BiometricResultRequest`.
3. On HTTP 200 from iVALT, an **iron-session** cookie (`ivalt_portal_session`) is created and the user is redirected to `/dashboard`.
4. Session is read in every protected route via `getSession()` in `src/lib/session.ts`.

### Demo mode

Set `NEXT_PUBLIC_DEMO_MODE=true` to bypass all real external calls (DB, AWS, iVALT). All API routes check `DEMO_MODE` at the top and return fixture data from `src/lib/demo.ts`. The demo session is auto-injected in `getSession()`. This mode is designed for UI development without credentials.

### Key data flow

- **DB** (`src/db/`): Drizzle ORM + `postgres` driver. Two tables: `users` (keyed by UUID, unique on `phone_number`) and `api_keys` (FK → users, cascade delete). `keyValue` is stored once at creation then masked in the DB record — the raw value is never re-fetched from AWS.
- **AWS API Gateway** (`src/lib/aws-gateway.ts`): Creates/deletes/toggles keys in AWS and attaches them to a single usage plan. The client is constructed lazily and throws if credentials are missing in non-demo mode.
- **iVALT API** (`src/lib/ivalt.ts`): Two calls only — `BiometricAuthRequest` (POST, initiates push) and `BiometricResultRequest` (POST, polls result). Auth status is mapped from HTTP codes: 200 = authenticated, 422 = pending, 403 = rejected, 404 = user not found.

### API routes

| Route | Method | Purpose |
|---|---|---|
| `/api/auth/request` | POST | Initiate biometric auth |
| `/api/auth/verify` | POST | Poll result + create session |
| `/api/auth/logout` | POST | Destroy session |
| `/api/keys` | GET | List user's keys |
| `/api/keys/create` | POST | Create key (max 4 per user) |
| `/api/keys/[id]` | DELETE | Delete key |
| `/api/keys/[id]` | PATCH | Enable/disable key |

### UI structure

`DashboardShell` (`src/components/layout/DashboardShell.tsx`) wraps all dashboard pages with the sidebar and header. Dashboard pages are under `src/app/dashboard/`.

### Design system

Slack-inspired tokens defined in `src/app/globals.css`:
- Primary: `#611f69` (Purple Heart)
- Background: `#fefbff` (Canvas Ice)
- Accent: `#1264a3` (Electric Blue)
- Fonts: Montserrat (headings) + Open Sans (body)

## Environment variables

Copy `.env.local.example` → `.env` and fill in values. Required in production:

| Variable | Purpose |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string |
| `IVALT_API_BASE_URL` | iVALT API base (default: `https://api.ivalt.com`) |
| `IVALT_SECURITY_TOKEN` | iVALT security token |
| `AWS_REGION` | API Gateway region |
| `AWS_ACCESS_KEY_ID` / `AWS_SECRET_ACCESS_KEY` | IAM credentials |
| `AWS_API_GATEWAY_USAGE_PLAN_ID` | Usage plan to attach keys to |
| `SESSION_SECRET` | ≥32-char random string for iron-session |
| `NEXT_PUBLIC_DEMO_MODE` | Set `true` to skip all external calls |
