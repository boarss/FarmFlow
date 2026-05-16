# Email/Password Authentication Guide

## Overview

FarmFlow now supports both phone-based (OTP) and email/password authentication methods, giving users flexibility in how they access the platform.

## Features

### ✅ Implemented

1. **Email/Password Registration**
   - User registration with email and password
   - Password strength validation
   - Real-time password strength indicator
   - Confirm password matching
   - Name collection during signup

2. **Email/Password Login**
   - Secure login with email and password
   - Password visibility toggle
   - Remember me functionality (via session persistence)
   - Error handling for invalid credentials

3. **Password Reset**
   - Forgot password flow
   - Email-based password reset link
   - Secure password update

4. **Email Validation**
   - RFC 5322 compliant email validation
   - Email normalization (lowercase, trim)
   - Common email provider detection
   - Email masking for privacy

5. **Password Security**
   - Minimum 8 characters
   - Requires uppercase letter
   - Requires lowercase letter
   - Requires number
   - Requires special character
   - Password strength scoring (weak/medium/strong/very-strong)

## File Structure

```
src/
├── components/auth/
│   ├── EmailLogin.tsx           # Email/password login
│   ├── EmailRegister.tsx        # Email/password registration
│   ├── ForgotPassword.tsx       # Password reset flow
│   └── index.ts                 # Component exports
├── contexts/
│   └── AuthContext.tsx          # Auth context with email methods
├── utils/
│   └── emailValidation.ts       # Email & password validation
└── lib/
    └── supabase.ts              # Supabase auth methods
```

## Authentication Methods

### 1. Email Registration

**Route:** `/auth/email-register`

**Features:**
- Full name input
- Email validation
- Password strength indicator
- Confirm password matching
- Visual feedback for password requirements

**Flow:**
```
User enters details
  ↓
Validate email format
  ↓
Validate password strength
  ↓
Check password match
  ↓
Create account with Supabase
  ↓
Redirect to onboarding or email verification
```

### 2. Email Login

**Route:** `/auth/email-login`

**Features:**
- Email and password input
- Password visibility toggle
- Forgot password link
- Alternative auth method (phone)

**Flow:**
```
User enters credentials
  ↓
Validate email format
  ↓
Sign in with Supabase
  ↓
Redirect to dashboard
```

### 3. Password Reset

**Route:** `/auth/forgot-password`

**Features:**
- Email input
- Reset link sent via email
- Success confirmation
- Back to login link

**Flow:**
```
User enters email
  ↓
Validate email format
  ↓
Send reset link via Supabase
  ↓
Show success message
  ↓
User clicks link in email
  ↓
Redirect to password update page
```

## API Methods

### Supabase Auth Methods

```typescript
// Sign up with email
auth.signUpWithEmail(email: string, password: string, metadata?: { name?: string })

// Sign in with email
auth.signInWithEmail(email: string, password: string)

// Reset password
auth.resetPassword(email: string)

// Update password
auth.updatePassword(newPassword: string)
```

### AuthContext Methods

```typescript
const {
  // Email authentication
  signUpWithEmail,
  signInWithEmail,
  resetPassword,
  updatePassword,
  
  // Phone authentication
  signInWithPhone,
  verifyOTP,
  
  // Common
  signOut,
  user,
  farmer,
  session,
  loading
} = useAuth();
```

## Email Validation

### Validation Functions

```typescript
// Validate email format
isValidEmail(email: string): boolean

// Normalize email
normalizeEmail(email: string): string

// Validate password strength
validatePassword(password: string): {
  isValid: boolean;
  errors: string[];
}

// Get password strength
getPasswordStrength(password: string): {
  level: 'weak' | 'medium' | 'strong' | 'very-strong';
  score: number;
  feedback: string;
}

// Validate credentials together
validateCredentials(email: string, password: string): {
  isValid: boolean;
  emailError?: string;
  passwordErrors?: string[];
}

// Mask email for privacy
maskEmail(email: string): string  // e.g., j***@example.com

// Get email domain
getEmailDomain(email: string): string

// Check if common provider
isCommonEmailProvider(email: string): boolean
```

## Password Requirements

### Minimum Requirements

- ✅ At least 8 characters long
- ✅ Contains at least one uppercase letter (A-Z)
- ✅ Contains at least one lowercase letter (a-z)
- ✅ Contains at least one number (0-9)
- ✅ Contains at least one special character (!@#$%^&*(),.?":{}|<>)

### Strength Levels

| Level | Score | Requirements |
|-------|-------|--------------|
| Weak | 0-2 | Basic requirements not met |
| Medium | 3-4 | Meets basic requirements |
| Strong | 5-6 | Good length and variety |
| Very Strong | 7+ | Excellent length and variety |

## User Experience

### Registration Flow

1. **Name Entry**
   - Full name input
   - Required field validation

2. **Email Entry**
   - Email format validation
   - Real-time feedback
   - Duplicate email detection

3. **Password Creation**
   - Password strength indicator
   - Visual progress bar
   - Color-coded feedback (red/yellow/blue/green)
   - Requirement checklist

4. **Password Confirmation**
   - Match validation
   - Visual confirmation (✓ or ✗)

5. **Account Creation**
   - Loading state
   - Success/error feedback
   - Automatic redirect

### Login Flow

1. **Credential Entry**
   - Email and password inputs
   - Password visibility toggle
   - Remember me (automatic via session)

2. **Authentication**
   - Loading state
   - Error handling
   - Invalid credential feedback

3. **Success**
   - Automatic redirect to dashboard
   - Session persistence

### Password Reset Flow

1. **Email Entry**
   - Email validation
   - Submit button

2. **Email Sent**
   - Success confirmation
   - Check email message
   - Spam folder reminder

3. **Email Link**
   - Secure token in URL
   - Redirect to password update

4. **New Password**
   - Password requirements
   - Strength validation
   - Confirmation

## Supabase Configuration

### Enable Email Authentication

1. Go to Supabase Dashboard
2. Navigate to Authentication > Providers
3. Enable Email provider
4. Configure email templates (optional)
5. Set up SMTP settings (for custom emails)

### Email Templates

Customize these in Supabase Dashboard:

- **Confirmation Email** - Sent after registration
- **Password Reset** - Sent when user requests reset
- **Email Change** - Sent when user changes email
- **Magic Link** - For passwordless login (optional)

### Email Settings

```
From Email: noreply@farmflow.com
From Name: FarmFlow
Reply To: support@farmflow.com
```

## Security Best Practices

### Password Storage

- ✅ Passwords are hashed by Supabase (bcrypt)
- ✅ Never stored in plain text
- ✅ Never logged or exposed

### Session Management

- ✅ JWT tokens with expiration
- ✅ Automatic token refresh
- ✅ Secure HTTP-only cookies (when configured)
- ✅ Session invalidation on logout

### Email Verification

- ✅ Optional email confirmation
- ✅ Prevents fake accounts
- ✅ Configurable in Supabase

### Rate Limiting

- ✅ Supabase built-in rate limiting
- ✅ Prevents brute force attacks
- ✅ Configurable per endpoint

## Testing

### Manual Testing

1. **Registration**
   ```
   1. Go to /auth/email-register
   2. Enter name: "Test User"
   3. Enter email: "test@example.com"
   4. Enter password: "Test123!@#"
   5. Confirm password: "Test123!@#"
   6. Click "Create Account"
   7. Verify redirect to onboarding
   ```

2. **Login**
   ```
   1. Go to /auth/email-login
   2. Enter email: "test@example.com"
   3. Enter password: "Test123!@#"
   4. Click "Sign In"
   5. Verify redirect to dashboard
   ```

3. **Password Reset**
   ```
   1. Go to /auth/forgot-password
   2. Enter email: "test@example.com"
   3. Click "Send Reset Link"
   4. Check email inbox
   5. Click reset link
   6. Enter new password
   7. Verify redirect to login
   ```

### Test Credentials

For development, create test accounts:

```
Email: test@farmflow.com
Password: Test123!@#

Email: farmer@farmflow.com
Password: Farmer123!@#
```

## Switching Between Auth Methods

### From Phone to Email

Users can switch from phone login to email login:

1. On phone login page
2. Click "Or continue with"
3. Click "Email & Password"
4. Redirects to email login

### From Email to Phone

Users can switch from email login to phone login:

1. On email login page
2. Click "Or continue with"
3. Click "Phone Number"
4. Redirects to phone login

## Error Handling

### Common Errors

| Error | Message | Solution |
|-------|---------|----------|
| Invalid email | "Please enter a valid email address" | Check email format |
| Weak password | "Password must be at least 8 characters..." | Follow password requirements |
| Passwords don't match | "Passwords do not match" | Re-enter matching passwords |
| Email exists | "User already registered" | Use login or reset password |
| Invalid credentials | "Invalid email or password" | Check credentials or reset password |
| Network error | "An error occurred. Please try again." | Check internet connection |

## Migration from Phone to Email

If a user registered with phone and wants to add email:

1. User logs in with phone
2. Goes to profile settings
3. Adds email address
4. Verifies email
5. Can now login with either method

## Future Enhancements

### Planned Features

1. **Social Login**
   - Google OAuth
   - Facebook Login
   - Apple Sign In

2. **Magic Link**
   - Passwordless email login
   - One-click authentication

3. **Two-Factor Authentication**
   - SMS verification
   - Authenticator app support
   - Backup codes

4. **Account Linking**
   - Link phone and email accounts
   - Multiple authentication methods
   - Unified profile

5. **Email Verification**
   - Mandatory email confirmation
   - Resend verification email
   - Verification status indicator

## Troubleshooting

### Issue: Email not received

**Solutions:**
1. Check spam/junk folder
2. Verify email address is correct
3. Check Supabase email quota
4. Verify SMTP configuration
5. Use test mode for development

### Issue: Password reset not working

**Solutions:**
1. Check email delivery
2. Verify reset link hasn't expired
3. Check Supabase logs
4. Ensure redirect URL is configured

### Issue: Can't login after registration

**Solutions:**
1. Check if email verification is required
2. Verify account was created in Supabase
3. Check for error messages
4. Try password reset

## Support

For issues or questions:
- Check Supabase Auth documentation
- Review browser console for errors
- Check Supabase dashboard logs
- Contact development team

---

**Last Updated:** 2026-05-16
**Version:** 1.0.0
**Author:** Bob (AI Assistant)