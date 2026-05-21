# API Key Usage Tracking - Implementation Plan

## Current Capabilities

| Feature | Status | Location |
|---------|--------|----------|
| Last used timestamp | ✅ Exists | `api_keys.lastUsedAt` |
| Active/inactive status | ✅ Exists | `api_keys.is_active` |
| Key creation date | ✅ Exists | `api_keys.created_at` |

## Proposed Enhancements

### 1. Usage Statistics Table

```sql
CREATE TABLE IF NOT EXISTS "api_key_usage" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  "api_key_id" TEXT NOT NULL REFERENCES "api_keys"("id") ON DELETE CASCADE,
  "request_count" INTEGER DEFAULT 0,
  "last_request_at" TIMESTAMP,
  "total_usage_seconds" INTEGER DEFAULT 0,
  "created_at" TIMESTAMP DEFAULT NOW()
);
```

### 2. Dashboard Metrics

| Metric | Description |
|--------|-------------|
| Total API keys | Count of all keys |
| Active keys | Keys with `is_active = true` |
| Recently used | Keys used in last 24h |
| Total requests | Sum of all request counts |
| Inactive keys | Keys not used in 30 days |

### 3. API Endpoint

`GET /api/admin/metrics`

```json
{
  "totalUsers": 150,
  "totalKeys": 420,
  "activeKeys": 380,
  "pendingRequests": 12,
  "recentUsage": {
    "last24h": 25000,
    "last7d": 180000
  },
  "topUsers": [
    {
      "id": "user-xxx",
      "phone": "+919876543210",
      "name": "John Doe",
      "apiKeyCount": 4,
      "totalRequests": 50000
    }
  ]
}
```

## Implementation Steps

| Step | Task | Effort |
|------|------|--------|
| 1 | Add metrics endpoint | Low |
| 2 | Add usage tracking table | Low |
| 3 | Update dashboard UI | Medium |
| 4 | Add export functionality | Medium |

## Questions for You

1. Do you want real-time usage tracking or just daily aggregates?
2. Should we track individual request counts or just last used timestamp?
3. Any specific metrics you need for monitoring?