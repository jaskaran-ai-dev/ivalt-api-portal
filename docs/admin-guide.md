# Admin Guide: Approving User Access Requests

## Overview

This guide explains how administrators can approve or reject user access requests to the iVALT Developer Portal.

## How Requests Are Created

1. User completes biometric authentication
2. System automatically creates `access_request` record with `status: "pending"`
3. Admin receives notification (email, Slack, etc.)

## Viewing Pending Requests

### Database Query

```sql
-- View all pending requests with user info
SELECT 
    ar.id,
    ar.use_case,
    ar.requested_at,
    u.phone_number,
    u.name
FROM access_requests ar
JOIN users u ON ar.user_id = u.id
WHERE ar.approved_at IS NULL
ORDER BY ar.requested_at DESC;
```

### API Endpoint

```bash
curl http://localhost:3000/api/access/request?status=pending
```

## Approving Requests

### Via API

```bash
curl -X POST http://localhost:3000/api/access/approve \
  -H "Content-Type: application/json" \
  -d '{
    "requestId": "REQUEST_ID_HERE",
    "approved": true,
    "adminNotes": "Approved for production integration"
  }'
```

### What Happens on Approval

1. User's `status` in `users` table changes to `"approved"`
2. `approved_at` timestamp is set
3. User's `last_login_at` is updated
4. User can now access dashboard

## Rejecting Requests

### Via API

```bash
curl -X POST http://localhost:3000/api/access/approve \
  -H "Content-Type: application/json" \
  -d '{
    "requestId": "REQUEST_ID_HERE",
    "approved": false,
    "adminNotes": "Use case too vague - please resubmit with more details"
  }'
```

### What Happens on Rejection

1. User's `status` changes to `"rejected"`
2. User sees message that access was denied
3. User can submit a new request

## Best Practices

### Before Approving

- [ ] Review use case carefully
- [ ] Ensure user has legitimate business need
- [ ] Verify user's identity through phone number
- [ ] Add helpful notes for future reference

### Common Rejection Reasons

| Reason | Description |
|--------|-------------|
| Insufficient detail | Use case too vague |
| Duplicate request | Already have access |
| Business policy | Doesn't fit API usage policy |
| Misuse detected | Previously abused system |

### Approval Checklist

```markdown
□ User provided clear use case
□ No prior rejections
□ Business justification valid
□ Within acceptable use policy
□ Ready to add admin notes
```

## Quick Actions

### Approve Multiple Requests

```bash
# Get pending requests
requests=$(curl -s http://localhost:3000/api/access/request?status=pending | jq -r '.requests[].id')

# Approve each
for id in $requests; do
  curl -X POST http://localhost:3000/api/access/approve \
    -H "Content-Type: application/json" \
    -d "{\"requestId\": \"$id\", \"approved\": true}"
done
```

### Check User Status

```bash
curl http://localhost:3000/api/access/me
```

### List All Users with Status

```sql
SELECT 
    id, 
    phone_number, 
    status, 
    created_at, 
    approved_at
FROM users
ORDER BY created_at DESC;
```

## Email Notifications (Optional)

To enable admin email notifications, update `sendAdminNotification()` in `src/app/api/access/request/route.ts`:

```typescript
async function sendAdminNotification(userId: string, useCase: string) {
  const adminEmail = process.env.ADMIN_EMAIL;
  
  await sendEmail({
    to: adminEmail,
    subject: `New Access Request - ${userId}`,
    html: `
      <h2>New Access Request</h2>
      <p><strong>User ID:</strong> ${userId}</p>
      <p><strong>Use Case:</strong> ${useCase}</p>
      <p><a href="${process.env.ADMIN_PORTAL_URL}/requests">Review in Admin Panel</a></p>
    `
  });
}
```

## Troubleshooting

### User Can't Access Dashboard After Approval

1. Check user's `status = 'approved'`
2. User may need to logout/login again
3. Session may need to be refreshed

### Request Not Appearing

1. Check `access_requests` table
2. Verify user exists in `users` table
3. Check for database errors

### Approval Not Working

1. Verify API endpoint is accessible
2. Check admin permissions
3. Review server logs for errors