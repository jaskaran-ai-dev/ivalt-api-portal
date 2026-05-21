# API Key Usage Tracking - Implementation Status

## Current Implementation

| Feature | Status | Location |
|---------|--------|----------|
| Last used timestamp | ✅ Exists | `api_keys.lastUsedAt` |
| Active/inactive status | ✅ Exists | `api_keys.is_active` |
| Key creation date | ✅ Exists | `api_keys.created_at` |
| Usage tracking table | ✅ Exists | `api_key_usage` table |
| Admin usage API | ✅ Implemented | `GET /api/admin/usage` |

## Implemented Metrics

| Metric | Description |
|--------|-------------|
| Total API keys | Count of all keys in the system |
| Active keys | Keys with `is_active = true` |
| Recently used | Keys used in last 24h |
| Total requests | Sum of all request counts from AWS |
| Inactive keys | Keys not used in 30 days |

## API Endpoint

`GET /api/admin/usage`

```json
{
  "usage": [
    {
      "id": "key-uuid",
      "keyName": "Production App",
      "awsKeyId": "abc123",
      "isActive": true,
      "usageCount": 15420,
      "user": {
        "id": "user-uuid",
        "name": "John Doe",
        "phoneNumber": "+919876543210"
      }
    }
  ],
  "summary": {
    "totalKeys": 156,
    "activeKeys": 142,
    "inactiveKeys": 12,
    "recentlyUsed": 23,
    "totalRequests": 185000
  }
}
```

## Database Schema

```sql
-- Key usage tracking table
CREATE TABLE IF NOT EXISTS "api_key_usage" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  "api_key_id" TEXT NOT NULL REFERENCES "api_keys"("id") ON DELETE CASCADE,
  "usageCount" INTEGER DEFAULT 0 NOT NULL,
  "lastFetchedAt" TIMESTAMP DEFAULT NOW() NOT NULL,
  "createdAt" TIMESTAMP DEFAULT NOW() NOT NULL
);
```

## Implementation Details

- Usage data is fetched from AWS API Gateway via `fetchApiKeyUsage()` in `src/lib/api-gateway-usage.ts`
- Data is refreshed on each admin dashboard page load
- Usage counts are aggregated per API key and joined with user data