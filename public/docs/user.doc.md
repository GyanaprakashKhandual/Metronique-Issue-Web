# Bug Tracker User API Documentation

## API Overview

**API Version:** 1.0.0  
**Base URL:** `http://localhost:5000/api/v1`  
**Description:** Complete User Management API with authentication, profile management, and admin operations

### Contact Information
- **Name:** API Support
- **Email:** support@bugtracker.com
- **Website:** https://bugtracker.com

---

## Authentication

All protected endpoints require JWT Bearer token authentication.

### Authentication Details
- **Type:** Bearer Token (JWT)
- **Scheme:** JWT
- **Header Name:** Authorization
- **Format:** `Authorization: Bearer {token}`
- **Example Token:** `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2MGQ1ZWM0OWMxMjM0NTY3ODkwYWJjMTIiLCJpYXQiOjE2MjQ3NzY3NzcsImV4cCI6MTYyNDg2MzE3N30.abc123`

### Token Expiration
- **Standard Session:** 1 day
- **Remember Me:** 30 days
- **Refresh Token:** 7-90 days (depending on remember me)

---

## Error Responses

### Common Error Codes

| Code | Status | Description |
|------|--------|-------------|
| 400 | Bad Request | Validation error or missing required fields |
| 401 | Unauthorized | Missing or invalid authentication token |
| 403 | Forbidden | Insufficient permissions or access denied |
| 404 | Not Found | Resource not found |
| 423 | Locked | Account locked due to failed attempts |
| 500 | Internal Server Error | Server error |

### Error Response Format

```json
{
  "success": false,
  "message": "Error description",
  "error": "Additional error details"
}
```

---

# API Endpoints

## 1. Authentication Endpoints

### 1.1 Register New User

Register a new user account with email and password.

**Endpoint:** `POST /users/register`

**URL:** `http://localhost:5000/api/v1/users/register`

**Authentication:** ❌ Not Required

**Request Body:**

```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john.doe@example.com",
  "phone": "+1234567890",
  "password": "SecurePass123!",
  "organizationName": "ACME Corporation"
}
```

**Request Schema:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| firstName | string | ✅ Yes | User's first name (2-50 chars) |
| lastName | string | ✅ Yes | User's last name (2-50 chars) |
| email | string (email) | ✅ Yes | Valid email address |
| phone | string | ❌ No | Phone number |
| password | string (password) | ✅ Yes | Min 8 chars, uppercase, lowercase, number, special char |
| organizationName | string | ❌ No | Create organization with user as superadmin |

**Success Response (201):**

```json
{
  "success": true,
  "message": "Registration successful! Please check your email to verify your account.",
  "data": {
    "userId": "60d5ec49c1234567890abc12",
    "email": "john.doe@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "isEmailVerified": false
  }
}
```

**Error Response (400):**

```json
{
  "success": false,
  "message": "User with this email already exists"
}
```

**Use Cases:**

1. **New User with Organization**
   - User: Alice Smith
   - Email: alice.smith@company.com
   - Organization: Tech Innovations Inc
   - Outcome: Account created, verification email sent, organization created

2. **Individual User Registration**
   - User: Bob Johnson
   - Email: bob.johnson@gmail.com
   - Outcome: Account created, verification email sent

---

### 1.2 Login User

Authenticate user with email and password.

**Endpoint:** `POST /users/login`

**URL:** `http://localhost:5000/api/v1/users/login`

**Authentication:** ❌ Not Required

**Request Body:**

```json
{
  "email": "john.doe@example.com",
  "password": "SecurePass123!",
  "rememberMe": true
}
```

**Request Schema:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| email | string (email) | ✅ Yes | Registered email address |
| password | string (password) | ✅ Yes | Account password |
| rememberMe | boolean | ❌ No | Extended session (30 days vs 1 day) |

**Success Response (200):**

```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "60d5ec49c1234567890abc12",
      "email": "john.doe@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "fullName": "John Doe",
      "profileImage": null,
      "role": "superadmin",
      "preferences": {
        "language": "en",
        "timezone": "UTC",
        "theme": "auto"
      }
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expiresAt": "2024-01-15T10:30:00Z"
  }
}
```

**Headers Set:**
```
Set-Cookie: refreshToken=xyz123; HttpOnly; Secure; SameSite=Strict
```

**MFA Response (200):**

```json
{
  "success": true,
  "requiresMfa": true,
  "mfaMethod": "totp",
  "tempToken": "temp_jwt_token_for_mfa",
  "message": "MFA verification required"
}
```

**Error Response (401):**

```json
{
  "success": false,
  "message": "Invalid email or password",
  "attemptsRemaining": 4
}
```

**Error Response (403):**

```json
{
  "success": false,
  "message": "Please verify your email before logging in",
  "emailVerified": false
}
```

**Error Response (423):**

```json
{
  "success": false,
  "message": "Account is locked. Please try again in 30 minutes."
}
```

**Use Cases:**

1. **Standard Login with Remember Me**
   - Extended session (30 days)
   - Access token provided
   - Refresh token set in HttpOnly cookie

2. **Login with MFA Enabled**
   - Temp token provided
   - Requires MFA verification
   - Full access granted after MFA verification

---

### 1.3 Verify Email Address

Verify user email with token from registration email.

**Endpoint:** `GET /users/verify-email/:token`

**URL:** `http://localhost:5000/api/v1/users/verify-email/:token`

**Authentication:** ❌ Not Required

**Path Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| token | string | ✅ Yes | Email verification token |

**Success Response (200):**

```
Redirects to: http://localhost:3000/app?verified=true
```

**Error Response (400):**

```json
{
  "success": false,
  "message": "Invalid or expired verification token"
}
```

**Use Case:**

- User receives email with verification link
- Clicks link containing verification token
- Email marked as verified
- Welcome email sent
- Redirected to app dashboard

---

### 1.4 Resend Verification Email

Send verification email again if user didn't receive it.

**Endpoint:** `POST /users/resend-verification`

**URL:** `http://localhost:5000/api/v1/users/resend-verification`

**Authentication:** ❌ Not Required

**Request Body:**

```json
{
  "email": "john.doe@example.com"
}
```

**Success Response (200):**

```json
{
  "success": true,
  "message": "Verification email sent successfully"
}
```

**Error Response (400):**

```json
{
  "success": false,
  "message": "Email is already verified"
}
```

---

### 1.5 Request Password Reset

Send password reset email to user.

**Endpoint:** `POST /users/forgot-password`

**URL:** `http://localhost:5000/api/v1/users/forgot-password`

**Authentication:** ❌ Not Required

**Request Body:**

```json
{
  "email": "john.doe@example.com"
}
```

**Success Response (200):**

```json
{
  "success": true,
  "message": "If an account exists with this email, a password reset link has been sent."
}
```

**Note:** Response is same regardless of whether email exists (security feature)

**Use Case:**

- User requests password reset
- Email sent with reset link (1-hour expiry)
- User clicks link to reset password

---

### 1.6 Reset Password

Reset password using token from reset email.

**Endpoint:** `POST /users/reset-password/:token`

**URL:** `http://localhost:5000/api/v1/users/reset-password/:token`

**Authentication:** ❌ Not Required

**Path Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| token | string | ✅ Yes | Password reset token |

**Request Body:**

```json
{
  "password": "NewSecurePass@456"
}
```

**Success Response (200):**

```json
{
  "success": true,
  "message": "Password reset successful. Please login with your new password."
}
```

**Error Response (400):**

```json
{
  "success": false,
  "message": "Invalid or expired reset token"
}
```

**Security Note:** All sessions are cleared after password reset

---

### 1.7 Refresh Access Token

Get new access token using refresh token.

**Endpoint:** `POST /users/refresh-token`

**URL:** `http://localhost:5000/api/v1/users/refresh-token`

**Authentication:** ❌ Not Required (uses cookie)

**Description:** Refresh token is automatically sent via httpOnly cookie

**Success Response (200):**

```json
{
  "success": true,
  "data": {
    "accessToken": "new_jwt_access_token"
  }
}
```

**Error Response (401):**

```json
{
  "success": false,
  "message": "Invalid refresh token or session expired"
}
```

---

### 1.8 Logout User

Logout from current session.

**Endpoint:** `POST /users/logout`

**URL:** `http://localhost:5000/api/v1/users/logout`

**Authentication:** ✅ Required (Bearer Token)

**Success Response (200):**

```json
{
  "success": true,
  "message": "Logout successful"
}
```

**Headers Set:**
```
Set-Cookie: refreshToken=; HttpOnly; Max-Age=0
```

---

### 1.9 Logout from All Devices

Logout from all active sessions.

**Endpoint:** `POST /users/logout-all`

**URL:** `http://localhost:5000/api/v1/users/logout-all`

**Authentication:** ✅ Required (Bearer Token)

**Success Response (200):**

```json
{
  "success": true,
  "message": "Logged out from all devices successfully"
}
```

---

## 2. User Profile Endpoints

### 2.1 Get Current User Profile

Retrieve authenticated user's profile information.

**Endpoint:** `GET /users/profile`

**URL:** `http://localhost:5000/api/v1/users/profile`

**Authentication:** ✅ Required (Bearer Token)

**Success Response (200):**

```json
{
  "success": true,
  "data": {
    "user": {
      "id": "60d5ec49c1234567890abc12",
      "email": "john.doe@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "fullName": "John Doe",
      "phone": "+1234567890",
      "profileImage": "https://example.com/image.jpg",
      "isEmailVerified": true,
      "mfaEnabled": false,
      "preferences": {
        "language": "en",
        "timezone": "UTC",
        "theme": "auto"
      },
      "organizations": [
        {
          "organizationId": {
            "_id": "60d5ec49c1234567890abc13",
            "name": "ACME Corp",
            "slug": "acme-corp",
            "logo": "https://example.com/logo.png"
          },
          "role": "superadmin",
          "joinedAt": "2024-01-10T10:30:00Z",
          "status": "active"
        }
      ],
      "status": "active",
      "createdAt": "2024-01-10T10:30:00Z"
    }
  }
}
```

---

### 2.2 Update User Profile

Update user profile information.

**Endpoint:** `PUT /users/profile`

**URL:** `http://localhost:5000/api/v1/users/profile`

**Authentication:** ✅ Required (Bearer Token)

**Request Body:**

```json
{
  "firstName": "Jonathan",
  "lastName": "Doe",
  "phone": "+1987654321",
  "profileImage": "https://example.com/new-image.jpg"
}
```

**Request Schema:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| firstName | string | ❌ No | Updated first name |
| lastName | string | ❌ No | Updated last name |
| phone | string | ❌ No | Updated phone number |
| profileImage | string | ❌ No | Updated profile image URL |

**Success Response (200):**

```json
{
  "success": true,
  "message": "Profile updated successfully",
  "data": {
    "user": {
      "id": "60d5ec49c1234567890abc12",
      "firstName": "Jonathan",
      "lastName": "Doe",
      "phone": "+1987654321",
      "profileImage": "https://example.com/new-image.jpg"
    }
  }
}
```

---

### 2.3 Update User Preferences

Update user settings and preferences.

**Endpoint:** `PUT /users/preferences`

**URL:** `http://localhost:5000/api/v1/users/preferences`

**Authentication:** ✅ Required (Bearer Token)

**Request Body:**

```json
{
  "language": "es",
  "timezone": "America/New_York",
  "theme": "dark",
  "notificationSettings": {
    "emailNotifications": true,
    "inAppNotifications": true,
    "dailyDigest": true,
    "digestTime": "09:00"
  }
}
```

**Request Schema:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| language | string | ❌ No | en, es, fr, de |
| timezone | string | ❌ No | UTC, America/New_York, etc. |
| theme | string | ❌ No | light, dark, auto |
| notificationSettings | object | ❌ No | Notification preferences |

**Success Response (200):**

```json
{
  "success": true,
  "message": "Preferences updated successfully",
  "data": {
    "preferences": {
      "language": "es",
      "timezone": "America/New_York",
      "theme": "dark",
      "notificationSettings": {}
    }
  }
}
```

---

### 2.4 Change Password

Change user password.

**Endpoint:** `PUT /users/change-password`

**URL:** `http://localhost:5000/api/v1/users/change-password`

**Authentication:** ✅ Required (Bearer Token)

**Request Body:**

```json
{
  "currentPassword": "SecurePass123!",
  "newPassword": "NewSecurePass@456"
}
```

**Request Schema:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| currentPassword | string | ✅ Yes | Current password for verification |
| newPassword | string | ✅ Yes | New password (min 8 chars) |

**Success Response (200):**

```json
{
  "success": true,
  "message": "Password changed successfully. Please login again."
}
```

**Error Response (400):**

```json
{
  "success": false,
  "message": "Current password is incorrect"
}
```

**Security Note:** All other sessions are cleared after password change

---

### 2.5 Get Active Sessions

List all active sessions for user.

**Endpoint:** `GET /users/sessions`

**URL:** `http://localhost:5000/api/v1/users/sessions`

**Authentication:** ✅ Required (Bearer Token)

**Success Response (200):**

```json
{
  "success": true,
  "data": {
    "sessions": [
      {
        "loginAt": "2024-01-15T10:30:00Z",
        "lastActivityAt": "2024-01-15T12:45:00Z",
        "expiresAt": "2024-01-22T10:30:00Z",
        "deviceInfo": {
          "userAgent": "Mozilla/5.0...",
          "ipAddress": "192.168.1.100",
          "deviceName": "MacBook Pro",
          "osInfo": "macOS 12.1",
          "browserInfo": "Chrome 97"
        },
        "isCurrent": true
      }
    ],
    "totalSessions": 1
  }
}
```

---

### 2.6 Get Activity Log

Retrieve user activity log with pagination.

**Endpoint:** `GET /users/activity-log`

**URL:** `http://localhost:5000/api/v1/users/activity-log`

**Authentication:** ✅ Required (Bearer Token)

**Query Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| page | number | 1 | Page number |
| limit | number | 20 | Items per page |

**Success Response (200):**

```json
{
  "success": true,
  "data": {
    "activities": [
      {
        "action": "user_login",
        "resource": "user",
        "resourceId": "60d5ec49c1234567890abc12",
        "timestamp": "2024-01-15T10:30:00Z",
        "details": {
          "method": "email",
          "ipAddress": "192.168.1.100"
        }
      },
      {
        "action": "profile_updated",
        "resource": "user",
        "resourceId": "60d5ec49c1234567890abc12",
        "timestamp": "2024-01-15T10:45:00Z",
        "details": {
          "fields": ["firstName", "lastName"]
        }
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 5,
      "totalActivities": 100
    }
  }
}
```

---

## 3. Admin Operations

### 3.1 Get Organization Users

List all users in organization with filters.

**Endpoint:** `GET /users/admin/organization/:orgId/users`

**URL:** `http://localhost:5000/api/v1/users/admin/organization/:orgId/users`

**Authentication:** ✅ Required (Bearer Token)

**Admin Only:** Yes

**Query Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| page | number | Page number (default: 1) |
| limit | number | Items per page (default: 20) |
| search | string | Search by name or email |
| role | string | superadmin, admin, member |
| status | string | active, inactive, suspended |

**Success Response (200):**

```json
{
  "success": true,
  "data": {
    "users": [
      {
        "firstName": "John",
        "lastName": "Doe",
        "email": "john.doe@example.com",
        "phone": "+1234567890",
        "profileImage": "https://example.com/image.jpg",
        "status": "active",
        "isEmailVerified": true,
        "organizationMemberships": [
          {
            "organizationId": "60d5ec49c1234567890abc13",
            "role": "superadmin",
            "joinedAt": "2024-01-10T10:30:00Z",
            "status": "active"
          }
        ],
        "createdAt": "2024-01-10T10:30:00Z",
        "lastLogin": "2024-01-15T10:30:00Z"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 5,
      "totalUsers": 100,
      "hasMore": true
    }
  }
}
```

---

### 3.2 Add User to Organization

Add a new user to organization.

**Endpoint:** `POST /users/admin/organization/:orgId/users`

**URL:** `http://localhost:5000/api/v1/users/admin/organization/:orgId/users`

**Authentication:** ✅ Required (Bearer Token)

**Admin Only:** Yes

**Request Body:**

```json
{
  "firstName": "Sarah",
  "lastName": "Wilson",
  "email": "sarah.wilson@company.com",
  "phone": "+1555123456",
  "role": "admin",
  "sendInvite": true
}
```

**Success Response (201):**

```json
{
  "success": true,
  "message": "User added to organization successfully",
  "data": {
    "user": {
      "id": "60d5ec49c1234567890abc14",
      "firstName": "Sarah",
      "lastName": "Wilson",
      "email": "sarah.wilson@company.com",
      "phone": "+1555123456"
    }
  }
}
```

---

### 3.3 Update User Role

Update user role in organization.

**Endpoint:** `PUT /users/admin/organization/:orgId/users/:userId`

**URL:** `http://localhost:5000/api/v1/users/admin/organization/:orgId/users/:userId`

**Authentication:** ✅ Required (Bearer Token)

**Admin Only:** Yes

**Request Body:**

```json
{
  "role": "admin",
  "status": "active"
}
```

**Success Response (200):**

```json
{
  "success": true,
  "message": "User updated successfully"
}
```

---

### 3.4 Remove User from Organization

Remove user from organization.

**Endpoint:** `DELETE /users/admin/organization/:orgId/users/:userId`

**URL:** `http://localhost:5000/api/v1/users/admin/organization/:orgId/users/:userId`

**Authentication:** ✅ Required (Bearer Token)

**Admin Only:** Yes

**Success Response (200):**

```json
{
  "success": true,
  "message": "User removed from organization successfully"
}
```

---

### 3.5 Get User Details

Get detailed information about a user.

**Endpoint:** `GET /users/admin/users/:userId`

**URL:** `http://localhost:5000/api/v1/users/admin/users/:userId`

**Authentication:** ✅ Required (Bearer Token)

**Admin Only:** Yes

**Success Response (200):**

```json
{
  "success": true,
  "data": {
    "user": {
      "id": "60d5ec49c1234567890abc12",
      "email": "john.doe@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "phone": "+1234567890",
      "profileImage": "https://example.com/image.jpg",
      "isEmailVerified": true,
      "mfaEnabled": false,
      "status": "active",
      "organizationMemberships": [],
      "createdAt": "2024-01-10T10:30:00Z",
      "lastLogin": "2024-01-15T10:30:00Z"
    }
  }
}
```

---

### 3.6 Suspend User Account

Suspend user account.

**Endpoint:** `PUT /users/admin/users/:userId/suspend`

**URL:** `http://localhost:5000/api/v1/users/admin/users/:userId/suspend`

**Authentication:** ✅ Required (Bearer Token)

**Admin Only:** Yes

**Request Body:**

```json
{
  "reason": "Violation of terms of service"
}
```

**Success Response (200):**

```json
{
  "success": true,
  "message": "User suspended successfully"
}
```

---

### 3.7 Activate User Account

Activate suspended user account.

**Endpoint:** `PUT /users/admin/users/:userId/activate`

**URL:** `http://localhost:5000/api/v1/users/admin/users/:userId/activate`

**Authentication:** ✅ Required (Bearer Token)

**Admin Only:** Yes

**Success Response (200):**

```json
{
  "success": true,
  "message": "User activated successfully"
}
```

---

### 3.8 Delete User Account

Delete user account permanently.

**Endpoint:** `DELETE /users/admin/users/:userId`

**URL:** `http://localhost:5000/api/v1/users/admin/users/:userId`

**Authentication:** ✅ Required (Bearer Token)

**Admin Only:** Yes

**Success Response (200):**

```json
{
  "success": true,
  "message": "User deleted successfully"
}
```

---

## Response Status Codes

| Code | Status | Description |
|------|--------|-------------|
| 200 | OK | Successful GET, PUT request |
| 201 | Created | Successful POST request |
| 400 | Bad Request | Validation error or missing fields |
| 401 | Unauthorized | Missing or invalid token |
| 403 | Forbidden | Insufficient permissions |
| 404 | Not Found | Resource not found |
| 423 | Locked | Account locked (too many login attempts) |
| 500 | Internal Server Error | Server error |

---

## Request/Response Examples

### cURL Examples

**Register User:**
```bash
curl -X POST http://localhost:5000/api/v1/users/register \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "password": "SecurePass123!"
  }'
```

**Login User:**
```bash
curl -X POST http://localhost:5000/api/v1/users/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "SecurePass123!",
    "rememberMe": true
  }'
```

**Get Profile (with token):**
```bash
curl -X GET http://localhost:5000/api/v1/users/profile \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

---

## Security Best Practices

1. **Password Requirements:**
   - Minimum 8 characters
   - At least one uppercase letter
   - At least one lowercase letter
   - At least one number
   - At least one special character (!@#$%^&*)

2. **Token Management:**
   - Store tokens securely in httpOnly cookies
   - Refresh tokens before expiration
   - Clear tokens on logout
   - Never expose tokens in URLs

3. **Account Security:**
   - Enable MFA for enhanced security
   - Review active sessions regularly
   - Change password periodically
   - Remove unused sessions

4. **Admin Operations:**
   - Limit admin access to authorized users
   - Log all admin actions
   - Review user permissions regularly
   - Suspend compromised accounts immediately

---

## Rate Limiting

- **Standard Limit:** 100 requests per 15 minutes per IP
- **Authentication:** Limited to prevent brute force attacks
- **Admin Operations:** Standard limits apply

---

## Versioning

- **Current Version:** 1.0.0
- **Base URL:** `/api/v1`
- **Deprecation:** None at this time

---

## Support

For API support, contact:
- **Email:** support@bugtracker.com
- **Documentation:** https://bugtracker.com/docs
- **Issues:** Report via support dashboard

---

**Last Updated:** January 2024  
**API Status:** Active and Production Ready