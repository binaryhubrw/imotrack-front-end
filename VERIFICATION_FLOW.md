# Email Verification and Password Setting Flow

This document explains the new email verification and password setting flow implemented in the FMS frontend.

## Overview

The new flow allows users to verify their email and set their password when they receive an invitation link. This replaces the previous password reset functionality for new user invitations.

## Flow Steps

### 1. User Receives Invitation Email
- User is created by an administrator
- System sends an invitation email with a verification link
- Link format: `https://your-domain.com/set-password?token=JWT_TOKEN`

### 2. User Clicks Verification Link
- User clicks the link in their email
- Frontend navigates to `/verify` page with the token as a query parameter
- Page automatically verifies the email using the token
- After successful verification, user is redirected to `/set-password` page

### 3. Email Verification
- Frontend calls `GET /v2/auth/verify?token=JWT_TOKEN`
- If successful:
  - Email is verified
  - New access token is received and stored in `localStorage` as `verification_token`
  - User is redirected to `/set-password` page
- If already verified:
  - Shows "already verified" message
  - Redirects to login
- If invalid/expired:
  - Shows error message
  - User needs new invitation

### 4. Password Setting
- After successful verification, user sees password form
- User enters and confirms new password
- Frontend calls `POST /v2/auth/set-password-and-verify` with:
  - Authorization header with the verification token (stored in localStorage)
  - Request body: `{ "password": "StrongPassword123!" }`
- Verification token is cleared after successful password setting

### 5. Account Activation
- If successful:
  - Account is fully verified and activated
  - Password is set
  - User is redirected to login page
- User can now login with their email and new password

## API Endpoints

### Verify Email
```
GET /v2/auth/verify?token=JWT_TOKEN
```

**Response:**
```json
{
  "message": "User verified successfully",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### Set Password and Verify
```
POST /v2/auth/set-password-and-verify
Authorization: Bearer ACCESS_TOKEN
Content-Type: application/json

{
  "password": "StrongPassword123!"
}
```

**Response:**
```json
{
  "message": "Account verified and password set successfully",
  "data": {
    "auth_id": "1a2b3c4d-5e6f-7890-abcd-1234567890ef",
    "email": "user@example.com",
    "updated_at": "2025-08-06T12:00:00.000Z",
    "user_status": "ACTIVE"
  }
}
```

## Frontend Implementation

### New Types Added
- `VerifyEmailRequest`
- `VerifyEmailResponse`
- `SetPasswordAndVerifyRequest`
- `SetPasswordAndVerifyResponse`

### New Queries Added
- `useVerifyEmail()` - Verifies email with token
- `useSetPasswordAndVerify()` - Sets password and completes verification

### Updated Components
- `/app/(auth)/verify/page.tsx` - New page for email verification
- `/app/(auth)/set-password/page.tsx` - Updated to handle password setting only
- `services/auth.ts` - Added verification methods
- `lib/queries.ts` - Added new API queries

## Error Handling

### Email Verification Errors
- **409 Conflict**: Email already verified
- **400/401**: Invalid or expired token
- **500**: Server error

### Password Setting Errors
- **409 Conflict**: Account already verified
- **401**: Missing or invalid access token
- **400**: Invalid password format
- **500**: Server error

## Security Considerations

1. **Token Storage**: Verification token is stored in localStorage as `verification_token` after email verification
2. **Token Validation**: All API calls validate token presence and format
3. **Password Requirements**: Frontend enforces minimum 8 characters
4. **Error Messages**: Generic error messages to prevent information leakage
5. **Token Cleanup**: Verification token is cleared after successful password setting or on errors

## Testing

To test the flow:

1. Create a user through the admin interface
2. Check the invitation email for the verification link
3. Click the link to navigate to the set-password page
4. Verify the email verification step works
5. Set a password and verify the account activation
6. Test login with the new credentials

## Migration Notes

- The old password reset functionality remains intact for existing users
- New users will use this verification flow
- The `/verify` route handles email verification
- The `/set-password` route now handles password setting only
- Backward compatibility is maintained for existing password reset links 