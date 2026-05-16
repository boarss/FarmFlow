# Authentication System Implementation Guide

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Create a `.env` file in the project root:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. Apply Database Migrations

Follow the guide in `supabase/APPLY_MIGRATIONS_GUIDE.md` to set up the database schema.

### 4. Configure Supabase Auth

1. Go to Supabase Dashboard > Authentication > Providers
2. Enable Phone provider
3. Configure SMS provider (Twilio, MessageBird, etc.)
4. Set up test phone numbers for development

### 5. Run the Application

```bash
npm run dev
```

## File Structure

```
src/
├── contexts/
│   └── AuthContext.tsx          # Authentication context provider
├── stores/
│   └── authStore.ts             # Zustand state management
├── components/
│   └── auth/
│       ├── Login.tsx            # Phone login component
│       ├── VerifyOTP.tsx        # OTP verification component
│       ├── Onboarding.tsx       # Farmer onboarding flow
│       ├── ProtectedRoute.tsx   # Route protection wrapper
│       ├── UserProfile.tsx      # User profile management
│       └── index.ts             # Component exports
├── utils/
│   └── phoneValidation.ts       # Phone number utilities
└── lib/
    └── supabase.ts              # Supabase client & helpers
```

## Implementation Details

### Authentication Context

The `AuthContext` provides:
- User authentication state
- Farmer profile data
- Authentication methods (login, verify, logout)
- Profile update functionality

**Usage:**
```tsx
import { useAuth } from './contexts/AuthContext';

function MyComponent() {
  const { user, farmer, signOut } = useAuth();
  // Use authentication state
}
```

### Protected Routes

Wrap any component that requires authentication:

```tsx
<ProtectedRoute requireOnboarding>
  <DashboardComponent />
</ProtectedRoute>
```

### Phone Number Validation

Nigerian phone number validation and formatting:

```tsx
import { validateAndFormatPhone } from './utils/phoneValidation';

const result = validateAndFormatPhone('08012345678');
// {
//   isValid: true,
//   formatted: '+2348012345678',
//   display: '08012345678',
//   carrier: 'MTN'
// }
```

## Authentication Flow

### 1. User Login
- User enters Nigerian phone number
- System validates format
- OTP sent via SMS
- User redirected to verification

### 2. OTP Verification
- User enters 6-digit code
- System verifies with Supabase
- Session created on success
- Check for existing farmer profile

### 3. Onboarding (New Users)
- Step 1: Enter name
- Step 2: Select location (State, LGA)
- Step 3: Enter farm size
- Step 4: Select crops
- Create farmer profile
- Redirect to dashboard

### 4. Returning Users
- Session automatically restored
- Farmer profile loaded
- Direct access to dashboard

## Key Features

### ✅ Implemented

1. **Phone-based Authentication**
   - Nigerian phone number support
   - OTP verification
   - Session management

2. **User Onboarding**
   - Multi-step form
   - Progress indicator
   - Profile creation

3. **Protected Routes**
   - Authentication guard
   - Onboarding enforcement
   - Loading states

4. **Profile Management**
   - View profile
   - Edit profile
   - Sign out

5. **Phone Validation**
   - Format validation
   - E.164 conversion
   - Carrier detection
   - Privacy masking

6. **State Management**
   - Context API for auth state
   - Zustand for persistent state
   - Session persistence

7. **Error Handling**
   - User-friendly error messages
   - Validation feedback
   - Network error handling

8. **Security**
   - Secure session storage
   - Auto token refresh
   - Protected API calls

## Testing

### Manual Testing Steps

1. **Login Flow**
   ```
   1. Navigate to /auth/login
   2. Enter phone: 08012345678
   3. Click "Send OTP"
   4. Check for OTP SMS
   5. Enter OTP code
   6. Verify redirect to onboarding/dashboard
   ```

2. **Onboarding Flow**
   ```
   1. Complete Step 1: Name
   2. Complete Step 2: Location
   3. Complete Step 3: Farm size
   4. Complete Step 4: Crops
   5. Verify profile creation
   6. Check redirect to dashboard
   ```

3. **Protected Routes**
   ```
   1. Try accessing /dashboard without login
   2. Verify redirect to /auth/login
   3. Login and access /dashboard
   4. Verify successful access
   ```

4. **Profile Management**
   ```
   1. Navigate to /profile
   2. Click edit
   3. Update information
   4. Save changes
   5. Verify updates persist
   ```

5. **Sign Out**
   ```
   1. Click sign out
   2. Verify redirect to login
   3. Try accessing protected route
   4. Verify redirect to login
   ```

### Test Phone Numbers

For development, configure test phone numbers in Supabase:
- Dashboard > Authentication > Settings > Phone Auth
- Add test numbers that bypass SMS sending
- Use fixed OTP codes for testing

## Common Issues & Solutions

### Issue: "Cannot find module 'react'"

**Solution:** Install dependencies
```bash
npm install
```

### Issue: OTP not received

**Solutions:**
1. Check Supabase SMS provider configuration
2. Verify phone number format
3. Use test phone numbers for development
4. Check SMS quota in Supabase dashboard

### Issue: "Invalid phone number format"

**Solution:** Use valid Nigerian format:
- 080XXXXXXXX (11 digits)
- +234XXXXXXXXXX (14 digits)

### Issue: Session not persisting

**Solutions:**
1. Check browser localStorage is enabled
2. Clear browser cache
3. Verify Supabase client configuration

### Issue: Redirect loop

**Solutions:**
1. Check farmer profile exists in database
2. Verify onboarding completion
3. Clear auth state and re-login

## Next Steps

After implementing authentication, you can:

1. **Add Dashboard Features**
   - Crop management
   - Disease detection
   - Market prices
   - Farm records

2. **Implement Multi-language**
   - Add i18n support
   - Translate UI components
   - Language selection

3. **Add Offline Support**
   - Service worker
   - Offline queue
   - Sync on reconnect

4. **Enhance Security**
   - Rate limiting
   - Device management
   - Login history

## API Reference

### AuthContext Methods

```typescript
// Sign in with phone
signInWithPhone(phone: string): Promise<Result>

// Verify OTP
verifyOTP(phone: string, token: string): Promise<Result>

// Sign out
signOut(): Promise<void>

// Update farmer profile
updateFarmerProfile(updates: Partial<Farmer>): Promise<void>
```

### Phone Validation Functions

```typescript
// Validate phone number
isValidNigerianPhone(phone: string): boolean

// Format to E.164
formatPhoneToE164(phone: string): string

// Format for display
formatPhoneForDisplay(phone: string): string

// Mask for privacy
maskPhoneNumber(phone: string): string

// Get carrier
getPhoneCarrier(phone: string): string

// Validate and format
validateAndFormatPhone(phone: string): ValidationResult
```

## Resources

- [Supabase Auth Documentation](https://supabase.com/docs/guides/auth)
- [React Router Documentation](https://reactrouter.com/)
- [Zustand Documentation](https://github.com/pmndrs/zustand)
- [Nigerian Phone Number Format](https://en.wikipedia.org/wiki/Telephone_numbers_in_Nigeria)

## Support

For questions or issues:
1. Check the main documentation in `docs/authentication-system.md`
2. Review Supabase logs in dashboard
3. Check browser console for errors
4. Contact development team

---

**Implementation Date:** 2026-05-16
**Version:** 1.0.0
**Status:** ✅ Complete