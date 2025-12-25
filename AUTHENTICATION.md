# Authentication System

Complete authentication system with login, registration, and role-based access control.

## 🔐 Features

### Authentication Pages
- **Login Page** (`/login`) - Mobile-friendly login with username/password
- **Register Page** (`/register`) - Self-registration for teachers and admins
- **Protected Routes** - Automatic redirect based on user role
- **Role-Based Access** - Different dashboards for Admin vs Beneficiary

### Security Features
- Password visibility toggle
- Form validation with Zod
- Error handling with user-friendly messages
- Automatic redirect after login
- Protected route guards
- LocalStorage session persistence
- Role-based authorization

## 📱 Mobile-Friendly Design

Both login and register pages are fully responsive:
- Centered card layout
- Touch-friendly buttons and inputs
- Optimized for all screen sizes (mobile, tablet, desktop)
- Large tap targets
- Clear error messages
- Gradient background
- Logo and branding

## 🚀 Quick Start

### 1. Access the Login Page
Navigate to: `http://localhost:8080/login`

### 2. Demo Accounts (Pre-Seeded)

The system comes with 3 pre-seeded accounts that are **always available**:

**Admin Account:**
- Username: `admin`
- Password: `admin123`
- Role: `ADMIN`
- Redirects to: Admin Dashboard (`/`)

**Super Admin Account:**
- Username: `superadmin`
- Password: `super123`
- Role: `SUPER_ADMIN`
- Redirects to: Admin Dashboard (`/`)

**Teacher/Beneficiary Account:**
- Username: `teacher001`
- Password: `teacher123`
- Role: `BENEFICIARY`
- Teacher ID: `T001`
- Redirects to: Teacher Portal (`/portal/trainings`)

**Important:** These accounts are automatically seeded on app load and cannot be deleted.

### 3. Register New Account
1. Click "Register here" on login page
2. Fill in the form:
   - Account Type (Teacher or Admin)
   - Username (3-20 characters, letters/numbers/underscores only)
   - Email (valid email format)
   - Full Name
   - Phone Number (9-15 digits)
   - Teacher ID (optional, for beneficiaries)
   - Password (min 6 characters)
   - Confirm Password
3. Click "Create Account"
4. Automatically logged in and redirected

## 🏗️ Architecture

### Authentication Context (`src/contexts/AuthContext.tsx`)

Manages global authentication state:

```typescript
interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
}
```

**User Object:**
```typescript
interface User {
  id: string;
  username: string;
  email: string;
  role: 'ADMIN' | 'SUPER_ADMIN' | 'BENEFICIARY';
  name: string;
  phone?: string;
  profile_image_url?: string;
  // Beneficiary-specific
  teacher_id?: string;
  school?: string;
  school_id?: string;
  province_name?: string;
}
```

### Protected Routes (`src/components/auth/ProtectedRoute.tsx`)

Wrapper component that:
- Checks authentication status
- Shows loading spinner while checking
- Redirects to `/login` if not authenticated
- Checks role-based permissions
- Redirects to appropriate dashboard if wrong role

**Usage:**
```typescript
<Route
  path="/trainings"
  element={
    <ProtectedRoute allowedRoles={['ADMIN', 'SUPER_ADMIN']}>
      <Trainings />
    </ProtectedRoute>
  }
/>
```

### Login Page (`src/pages/auth/Login.tsx`)

**Features:**
- Username/password form
- Password visibility toggle (eye icon)
- "Forgot password?" link
- "Remember me" option
- Link to register page
- Demo credentials display
- Form validation
- Error alerts
- Loading states

**Form Validation:**
- Username: min 3 characters
- Password: min 6 characters

### Register Page (`src/pages/auth/Register.tsx`)

**Features:**
- Account type selection (Teacher/Admin)
- Two-column layout on desktop
- Responsive grid on mobile
- Password confirmation
- Conditional Teacher ID field (only for beneficiaries)
- Password strength validation
- Email validation
- Phone number validation
- Terms and conditions
- Back to login link

**Form Validation:**
- Username: 3-20 characters, alphanumeric + underscore only
- Email: valid email format
- Password: 6-50 characters
- Confirm Password: must match
- Phone: 9-15 digits
- Name: min 2 characters

## 🔄 User Flow

### Login Flow
1. User visits any protected route → Redirected to `/login`
2. User enters credentials
3. System validates against mock database
4. On success:
   - User stored in context
   - User stored in localStorage
   - Redirected based on role:
     - Admin/Super Admin → `/` (Dashboard)
     - Beneficiary → `/portal/trainings`
5. On error:
   - Error message displayed
   - Form remains filled
   - User can retry

### Register Flow
1. User clicks "Register here" on login
2. Navigate to `/register`
3. Select account type (Teacher/Admin)
4. Fill in all required fields
5. System validates:
   - Username uniqueness
   - Email uniqueness
   - Password match
   - All fields valid
6. On success:
   - Account created
   - Automatically logged in
   - Redirected to appropriate dashboard
7. On error:
   - Error message displayed
   - Form data preserved
   - User can fix and retry

### Logout Flow
1. User clicks "Log out" in header/sidebar
2. User removed from context
3. LocalStorage cleared
4. Redirected to `/login`

## 🛡️ Protected Route Types

### Admin Routes (ADMIN, SUPER_ADMIN only)
- `/` - Dashboard
- `/trainings` - Training Management
- `/beneficiaries` - Beneficiary Management
- `/attendance` - Attendance Management
- `/settings` - System Settings

### Beneficiary Routes (BENEFICIARY only)
- `/portal/trainings` - My Trainings
- `/portal/attendance/:trainingId` - Attendance Check-in
- `/portal/history` - Training History
- `/portal/history/:trainingId/attendance` - Attendance Detail
- `/portal/profile` - Profile Management

### Public Routes (No authentication required)
- `/login` - Login page
- `/register` - Registration page
- `/enroll` - Public enrollment page

## 💾 Session Management

**LocalStorage:**
- Key: `auth_user`
- Stores user object (without password)
- Persists across browser sessions
- Cleared on logout

**Auto-Login:**
- On app load, checks localStorage
- If valid user found, restores session
- If invalid/corrupted, clears and redirects to login

## 🎨 Styling

**Login Page:**
- Centered card layout
- Gradient background (primary/secondary)
- Logo with shadow
- Demo credentials card
- Responsive padding

**Register Page:**
- Similar to login
- Wider card (max-w-2xl)
- Grid layout for form fields
- Conditional fields based on role
- Back button

**Common Elements:**
- Consistent card styling
- Primary color buttons
- Input fields with icons
- Error text in red
- Loading spinners
- Toast notifications

## 🔧 Backend Integration

Currently uses mock data. To integrate with real backend:

### 1. Replace Mock Users
In `src/contexts/AuthContext.tsx`, replace `mockUsers` with API calls:

```typescript
const login = async (username: string, password: string) => {
  const response = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  });

  if (!response.ok) {
    throw new Error('Invalid credentials');
  }

  const data = await response.json();
  const user = data.user;
  const token = data.token;

  // Store token
  localStorage.setItem('auth_token', token);
  localStorage.setItem('auth_user', JSON.stringify(user));

  setUser(user);
};
```

### 2. Add Token Management
```typescript
// Add to AuthContext
const [token, setToken] = useState<string | null>(null);

// Include in API calls
headers: {
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${token}`
}
```

### 3. Add Refresh Token Logic
```typescript
// Refresh token before expiry
useEffect(() => {
  const interval = setInterval(async () => {
    if (token) {
      await refreshToken();
    }
  }, 15 * 60 * 1000); // Every 15 minutes

  return () => clearInterval(interval);
}, [token]);
```

### 4. Update Registration
```typescript
const register = async (data: RegisterData) => {
  const response = await fetch('/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message);
  }

  const result = await response.json();
  // Auto-login after registration
  await login(data.username, data.password);
};
```

## 🧪 Testing

### Manual Testing Checklist

**Login:**
- [ ] Can login with valid credentials
- [ ] Error shown for invalid credentials
- [ ] Password toggle works
- [ ] Loading state shows during login
- [ ] Redirects to correct dashboard
- [ ] Session persists on page refresh

**Register:**
- [ ] All form fields validate correctly
- [ ] Username uniqueness checked
- [ ] Email uniqueness checked
- [ ] Password confirmation works
- [ ] Teacher ID shows only for beneficiaries
- [ ] Auto-login after registration
- [ ] Error handling works

**Protected Routes:**
- [ ] Cannot access admin routes as beneficiary
- [ ] Cannot access beneficiary routes as admin
- [ ] Redirects to login when not authenticated
- [ ] Preserves intended destination after login

**Logout:**
- [ ] Logout clears session
- [ ] Redirects to login
- [ ] Cannot access protected routes after logout

## 🎯 Best Practices

1. **Never store passwords in plain text** - Only for demo
2. **Use HTTPS in production** - Secure data transmission
3. **Implement rate limiting** - Prevent brute force attacks
4. **Add CSRF protection** - Prevent cross-site attacks
5. **Use secure cookies** - For token storage in production
6. **Add 2FA option** - Extra security layer
7. **Log authentication events** - Audit trail
8. **Session timeout** - Auto-logout after inactivity
9. **Password reset flow** - Allow users to recover accounts
10. **Email verification** - Verify email addresses

## 📝 Next Steps

To enhance the authentication system:

1. **Add Forgot Password**
   - Create forgot password page
   - Email reset link
   - Reset password page

2. **Add Email Verification**
   - Send verification email on register
   - Verify email before full access

3. **Add Two-Factor Authentication**
   - QR code generation
   - TOTP verification
   - Backup codes

4. **Add Social Login**
   - Google OAuth
   - Facebook Login
   - Microsoft Account

5. **Add Account Management**
   - Change password
   - Update email
   - Delete account
   - Activity log

6. **Add Admin User Management**
   - Create users
   - Edit users
   - Disable/enable accounts
   - Reset passwords
   - View login history

## 🐛 Troubleshooting

### Debug Utilities (Browser Console)

The app includes built-in debug utilities accessible via browser console:

**List Demo Accounts:**
```javascript
authDebug.listDemoAccounts()
```
Shows all 3 pre-seeded accounts with usernames and passwords.

**Verify Login Credentials:**
```javascript
authDebug.verifyCredentials('admin', 'admin123')
```
Test if credentials would work before logging in.

**Check if Username Exists:**
```javascript
authDebug.checkUsername('admin')
```

**List All Users:**
```javascript
authDebug.listUsers()
```
Shows all users in the database (without passwords).

**Get Current Session:**
```javascript
authDebug.getCurrentSession()
```
Shows the currently logged-in user.

**Reset Database:**
```javascript
authDebug.reset()
```
Resets the user database to only the 3 seed accounts.

**Clear All Auth Data:**
```javascript
authDebug.clearAuth()
```
Clears localStorage and logs you out. Refresh page after running.

### Common Issues

**"Cannot login with demo accounts"**
1. Open browser console (F12)
2. Run: `authDebug.listDemoAccounts()`
3. Verify the accounts are seeded
4. Run: `authDebug.verifyCredentials('admin', 'admin123')`
5. If still failing, run: `authDebug.reset()`
6. Refresh the page and try again

**"Cannot access protected route"**
- Check if logged in
- Check user role matches route requirements
- Run `authDebug.getCurrentSession()` to verify session
- Clear localStorage and login again

**"Session lost on refresh"**
- Check localStorage for `auth_user`
- Run `authDebug.getCurrentSession()`
- Check browser console for errors
- Ensure AuthProvider wraps app

**"Login not working"**
- Run `authDebug.verifyCredentials(username, password)`
- Check browser console for errors
- Run `authDebug.reset()` to reset database
- Verify AuthContext is working

**"Redirect not working"**
- Check `getDefaultRedirectPath` function
- Verify role is set correctly
- Check browser console for navigation errors
- Run `authDebug.getCurrentSession()` to check role
