# FarmFlow Authentication System Documentation

## Overview

The FarmFlow authentication system provides secure phone-based authentication using Supabase Auth with OTP (One-Time Password) verification. The system is designed specifically for Nigerian farmers with support for local phone number formats.

## Architecture

### Components

1. **AuthContext** (`src/contexts/AuthContext.tsx`)
   - Provides authentication state management
   - Handles user session management
   - Manages farmer profile data
   - Exposes authentication methods

2. **Auth Store** (`src/stores/authStore.ts`)
   - Zustand-based state management
   - Persists authentication state
   - Manages onboarding status

3. **Phone Validation** (`src/utils/phoneValidation.ts`)
   - Validates Nigerian phone numbers
   - Formats phone numbers to E.164 format
   - Identifies mobile carriers
   - Masks phone numbers for privacy

4. **UI Components** (`src/components/auth/`)
   - **Login**: Phone number entry and OTP request
   - **VerifyOTP**: 6-digit OTP verification
   - **Onboarding**: Multi-step farmer profile setup
   - **ProtectedRoute**: Route guard for authenticated users
   - **UserProfile**: Profile viewing and editing

## Authentication Flow

### 1. Login Flow

```
User enters phone number
  ↓
Validate phone format
  ↓
Send OTP via Supabase Auth
  ↓
Redirect to OTP verification
```

### 2. OTP Verification Flow

```
User enters 6-digit OTP
  ↓
Verify OTP with Supabase
  ↓
Create/retrieve user session
  ↓
Check if farmer profile exists
  ↓
Redirect to onboarding OR dashboard
```

### 3. Onboarding Flow

```
Step 1: Enter full name
  ↓
Step 2: Select state and LGA
  ↓
Step 3: Enter farm size
  ↓
Step 4: Select primary crops
  ↓
Create farmer profile in database
  ↓
Redirect to dashboard
```

## Phone Number Formats

### Supported Formats

- **Local**: `080XXXXXXXX` (11 digits)
- **International**: `+234XXXXXXXXXX` (14 digits)
- **Without Plus**: `234XXXXXXXXXX` (13 digits)

### Validation Rules

- Must start with 0, 234, or +234
- Second digit (after prefix) must be 7, 8, or 9
- Third digit must be 0 or 1
- Total of 10 digits after country code

### Carrier Detection

The system can identify the following Nigerian carriers:
- MTN
- Glo
- Airtel
- 9mobile

## API Integration

### Supabase Auth Methods

```typescript
// Send OTP
auth.sendOTP(phone: string)

// Verify OTP
auth.verifyOTP(phone: string, token: string)

// Get current session
auth.getSession()

// Get current user
auth.getUser()

// Sign out
auth.signOut()

// Listen to auth changes
auth.onAuthStateChange(callback)
```

### Database Operations

```typescript
// Get farmer profile
db.getFarmer(userId: string)

// Create farmer profile
db.createFarmer(farmer: FarmerData)

// Update farmer profile
db.updateFarmer(id: string, updates: Partial<Farmer>)
```

## Protected Routes

### Usage

```tsx
<ProtectedRoute requireOnboarding>
  <YourComponent />
</ProtectedRoute>
```

### Parameters

- `requireOnboarding`: If true, redirects to onboarding if farmer profile is incomplete

### Behavior

- Shows loading spinner while checking authentication
- Redirects to login if not authenticated
- Redirects to onboarding if profile incomplete (when required)
- Renders children if authenticated and profile complete

## Context Usage

### Using AuthContext

```tsx
import { useAuth } from './contexts/AuthContext';

function MyComponent() {
  const { 
    user,           // Current Supabase user
    farmer,         // Farmer profile data
    session,        // Current session
    loading,        // Loading state
    signInWithPhone,
    verifyOTP,
    signOut,
    updateFarmerProfile
  } = useAuth();

  // Your component logic
}
```

## Security Features

### 1. Session Management
- Auto-refresh tokens
- Persistent sessions across page reloads
- Secure session storage

### 2. Phone Number Privacy
- Phone numbers are masked in UI (080****1234)
- Only displayed in full in profile settings

### 3. OTP Security
- 6-digit OTP codes
- 60-second resend cooldown
- Auto-submit on complete entry
- Paste support for convenience

### 4. Route Protection
- Automatic redirect to login for unauthenticated users
- Onboarding enforcement for incomplete profiles
- Session validation on protected routes

## Error Handling

### Common Errors

1. **Invalid Phone Number**
   - Message: "Invalid Nigerian phone number format"
   - Solution: Enter a valid Nigerian phone number

2. **OTP Send Failed**
   - Message: "Failed to send OTP. Please try again."
   - Solution: Check internet connection, retry

3. **Invalid OTP**
   - Message: "Invalid OTP. Please try again."
   - Solution: Enter correct OTP or request new one

4. **Profile Update Failed**
   - Message: "Failed to update profile. Please try again."
   - Solution: Check internet connection, retry

## State Management

### Auth Store (Zustand)

```typescript
interface AuthState {
  user: SupabaseUser | null;
  farmer: Farmer | null;
  isAuthenticated: boolean;
  isOnboarding: boolean;
  setUser: (user: SupabaseUser | null) => void;
  setFarmer: (farmer: Farmer | null) => void;
  setOnboarding: (isOnboarding: boolean) => void;
  clearAuth: () => void;
}
```

### Persisted State

The following state is persisted to localStorage:
- `isAuthenticated`: Boolean flag
- `isOnboarding`: Boolean flag

User and farmer data are managed by Supabase session.

## Testing Considerations

### Manual Testing Checklist

- [ ] Login with valid Nigerian phone number
- [ ] Login with invalid phone number (should show error)
- [ ] Receive OTP SMS
- [ ] Verify OTP successfully
- [ ] Verify with wrong OTP (should show error)
- [ ] Complete onboarding flow
- [ ] Access protected routes
- [ ] Update profile information
- [ ] Sign out successfully
- [ ] Session persistence after page reload
- [ ] Offline behavior

### Test Phone Numbers

For development, use Supabase test phone numbers:
- Configure in Supabase Dashboard > Authentication > Settings
- Test numbers bypass SMS sending

## Environment Variables

Required environment variables:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Database Schema

### farmers Table

```sql
CREATE TABLE farmers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) UNIQUE NOT NULL,
  phone TEXT NOT NULL,
  name TEXT NOT NULL,
  state TEXT NOT NULL,
  lga TEXT,
  farm_size DECIMAL(10,2),
  primary_crops TEXT[],
  language TEXT DEFAULT 'english',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

## Future Enhancements

1. **Multi-language Support**
   - Hausa, Yoruba, Igbo translations
   - Language selection in onboarding

2. **Biometric Authentication**
   - Fingerprint/Face ID support
   - Quick re-authentication

3. **Social Login**
   - WhatsApp integration
   - Facebook login option

4. **Enhanced Security**
   - Two-factor authentication
   - Device management
   - Login history

5. **Profile Enhancements**
   - Profile photo upload
   - Farm location mapping
   - Multiple farm support

## Troubleshooting

### Issue: OTP not received

**Solutions:**
1. Check phone number format
2. Verify Supabase SMS provider configuration
3. Check SMS quota in Supabase dashboard
4. Use test phone numbers for development

### Issue: Session not persisting

**Solutions:**
1. Check browser localStorage is enabled
2. Verify Supabase client configuration
3. Check for CORS issues
4. Clear browser cache and retry

### Issue: Redirect loop

**Solutions:**
1. Check ProtectedRoute logic
2. Verify farmer profile exists in database
3. Check onboarding completion status
4. Clear auth state and re-login

## Support

For issues or questions:
- Check Supabase Auth documentation
- Review error logs in browser console
- Contact development team

---

**Last Updated:** 2026-05-16
**Version:** 1.0.0
**Author:** Bob (AI Assistant)