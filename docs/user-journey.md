# User Journey Flow - iVALT Developer Portal

This document describes the complete user journey through the iVALT Developer Portal, including the new access control workflow.

## Overview

The iVALT Developer Portal implements a three-step authentication process:
1. **Biometric Authentication** - Verify user identity via iVALT mobile app
2. **Access Approval** - Admin review of use case before API access is granted
3. **Dashboard Access** - User can manage API keys and view documentation

## Flow Diagram

### User Journey Flow

```mermaid
flowchart TD
    A[START] --> B[Login Page - Enter Phone]
    B --> C[Send Auth Request]
    C --> D[Poll /verify - every 2s]
    D --> E[Store Session - pending]
    E --> F[Access Request Form]
    F --> G[Submit Use Case]
    G --> H[Admin Review - Email/Slack]
    H --> I{Approved?}
    
    I -->|Yes| J[Update User Status - approved]
    J --> K[Access Granted - Dashboard]
    
    I -->|No| L[Update User Status - rejected]
    L --> M[Submit New Request]
```

## Step-by-Step User Journey

### Step 1: Authentication

| Phase | Action | Details |
|-------|--------|---------|
| 1.1 | Access Portal | Navigate to portal URL (e.g., `https://portal.ivalt.com`) |
| 1.2 | Enter Phone | Input mobile number with country code |
| 1.3 | Request Auth | Click "Continue" to send biometric request |
| 1.4 | Approve Push | Open iVALT app and approve the notification |
| 1.5 | Polling | System polls `/api/auth/verify` every 2 seconds |

**Outcome:** Session created with `accessStatus: "pending"`

### Step 2: Access Request

| Phase | Action | Details |
|-------|--------|---------|
| 2.1 | Redirect | Automatically redirected to `/access/request` |
| 2.2 | Describe Use Case | Fill in form explaining intended API usage |
| 2.3 | Submit | Click "Submit Request" |
| 2.4 | Confirmation | See confirmation screen with next steps |

**Outcome:** Access request record created, admin notified

### Step 3: Admin Review

| Phase | Action | Details |
|-------|--------|---------|
| 3.1 | Notification | Admin receives email/SMS about new request |
| 3.2 | Review | Admin checks use case in database or admin panel |
| 3.3 | Decision | Admin approves or rejects the request |
| 3.4 | Update | User's `status` field updated to `approved` or `rejected` |

**Outcome:** User status changes accordingly

### Step 4: Final Access

| Approved Path | Rejected Path |
|---------------|---------------|
| User redirected to dashboard | User can submit new request |
| Full API key access | Use case feedback provided |
| Can manage keys, docs | Must wait for admin response |

## User States

| State | Description | User Can Access |
|-------|-------------|-----------------|
| `pending` | Biographic auth complete, access request submitted | Access request form, status page |
| `approved` | Admin approved access | Dashboard, API keys, docs |
| `rejected` | Admin denied access | Access request form (new submission) |

## Technical Flow

### API Interaction Flow

```mermaid
sequenceDiagram
    participant Browser
    participant Server
    participant iVALT_API as iVALT API

    Browser->>Server: 1. POST /api/auth/request
    Server->>iVALT_API: 2. BiometricAuthRequest
    iVALT_API-->>Server: 3. BiometricAuthResponse
    Server-->>Browser: 4. 200 OK

    loop Polling (every 2s)
        Browser->>Server: 5. GET /api/auth/verify
        Server->>iVALT_API: 6. BiometricResult
        iVALT_API-->>Server: 7. Result data (+ accessStatus)
        Server-->>Browser: 8. 200 + accessStatus
    end

    Browser->>Server: 9. POST /api/access/request
    Server-->>Browser: 10. Notify Admin
```

## User Journey Sequence Diagram

```mermaid
sequenceDiagram
    participant User as End User
    participant Browser as Web Browser
    participant Server as Portal Server
    participant iVALT_API as iVALT API
    participant Admin as Admin (Email/UI)
    participant Database as Database

    Note over User,Database: Phase 1: Authentication
    User->>Browser: 1. Open portal and enter phone number
    Browser->>Server: 2. POST /api/auth/request
    Server->>iVALT_API: 3. Send biometric auth request
    iVALT_API-->>Server: 4. Request received (status: pending)
    Server-->>Browser: 5. Redirect to verification page
    loop Polling every 2s
        Browser->>Server: 6. GET /api/auth/verify
        Server->>iVALT_API: 7. Check biometric status
        iVALT_API-->>Server: 8. Status: completed
        Server-->>Browser: 9. Update UI (authenticated)
    end

    Note over User,Database: Phase 2: Access Request
    Browser-->>User: Show access request form
    User->>Browser: 10. Fill and submit use case
    Browser->>Server: 11. POST /api/access/request
    Server->>Database: 12. Create access request record
    Database-->>Server: 13. Record created
    Server->>Admin: 14. Send notification (email/Slack)
    Server-->>Browser: 15. Show confirmation message

    Note over User,Database: Phase 3: Admin Review
    Admin->>Server: 16. Check pending requests
    Server->>Database: 17. Query pending requests
    Database-->>Server: 18. Return request list
    Server-->>Admin: 19. Display requests (email/Slack)

    Admin->>Server: 20. Review use case
    Server->>Database: 21. Fetch user/request details
    Database-->>Server: 22. Return data
    Server-->>Admin: 23. Show user info and use case

    alt Approved
        Admin->>Server: 24. POST /api/access/approve
        Server->>Database: 25. Update status = approved
        Database-->>Server: 26. Confirmation
        Server->>Database: 27. Generate API keys
        Database-->>Server: 28. Keys created
        Server-->>User: 29. Email: Access approved
    else Rejected
        Admin->>Server: 30. POST /api/access/reject
        Server->>Database: 31. Update status = rejected
        Database-->>Server: 32. Confirmation
        Server-->>User: 33. Email: Access rejected + feedback
    end

    Note over User,Database: Phase 4: Dashboard Access
    alt User Status = approved
        User->>Browser: 34. Visit portal again
        Browser->>Server: 35. GET /api/auth/session
        Server->>Database: 36. Get user status
        Database-->>Server: 37. Return user data
        Server-->>Browser: 38. Return approved status
        Browser-->>User: 39. Show dashboard with API keys
    end
```

## Admin Review Sequence Diagram

```mermaid
sequenceDiagram
    participant Admin as Admin (Email/UI)
    participant Server
    participant Database as Database/API

    Admin->>Server: 1. Check pending requests
    Server->>Database: 2. Query pending access requests
    Database-->>Server: 3. Return request list
    Server-->>Admin: 4. Display requests (Email/Slack)

    Admin->>Server: 5. Review use case details
    Server->>Database: 6. Fetch user and request details
    Database-->>Server: 7. Return data
    Server-->>Admin: 8. Show user info and use case

    alt Approved
        Admin->>Server: 9. POST /api/access/approve
        Server->>Database: 10. Update user status = approved
        Database-->>Server: 11. Confirmation
        Server-->>Admin: 12. Approval confirmed
        Server->>Database: 13. Generate API keys
        Database-->>Server: 14. Keys created
        Server-->>User: 15. Notify user via email
    end

    alt Rejected
        Admin->>Server: 16. POST /api/access/reject
        Server->>Database: 17. Update user status = rejected
        Database-->>Server: 18. Confirmation
        Server-->>Admin: 19. Rejection confirmed
        Server-->>User: 20. Notify user with feedback
    end
```

## Error Handling

| Error | User Action |
|-------|-------------|
| Biometric rejected | Try authentication again |
| Request timeout | Refresh page, try again |
| Access denied | Contact admin or submit new request |
| Server error | Contact support |

## Demo Mode

In demo mode (`NEXT_PUBLIC_DEMO_MODE=true`), the access control workflow is bypassed:
- User automatically gets `approved` status
- No real iVALT API calls made
- Demo API keys are shown

## Security Considerations

1. **Use Case Required** - Prevents spam/abuse
2. **Admin Approval** - Manual review ensures responsible usage
3. **Email Notification** - Admin alerted of new requests
4. **One-Time Key Display** - Keys shown only at creation