# 🔐 Login Credentials - Quick Reference

## Pre-Seeded Demo Accounts

These accounts are **automatically seeded** when the app loads and are **always available**:

### 1️⃣ Admin Account
```
Username: admin
Password: admin123
Role: ADMIN
Access: Admin Dashboard
```
**What you can do:**
- Manage trainings
- Manage beneficiaries
- View attendance
- Access settings

---

### 2️⃣ Super Admin Account
```
Username: superadmin
Password: super123
Role: SUPER_ADMIN
Access: Admin Dashboard (Full Access)
```
**What you can do:**
- Everything an Admin can do
- Additional super admin privileges

---

### 3️⃣ Teacher/Beneficiary Account
```
Username: teacher001
Password: teacher123
Role: BENEFICIARY
Teacher ID: T001
School: Phnom Penh Primary School
Access: Teacher Portal
```
**What you can do:**
- View enrolled trainings
- Check-in/Check-out attendance (4 times per day)
- View training history
- Manage profile
- View certificates

---

## 🚀 Quick Start

1. **Start the dev server:**
   ```bash
   npm run dev
   ```

2. **Open browser:**
   ```
   http://localhost:8080
   ```

3. **You'll be redirected to:**
   ```
   http://localhost:8080/login
   ```

4. **Try logging in with any account above!**

---

## 🧪 Testing Each Account

### Test Admin Login
1. Go to http://localhost:8080/login
2. Enter:
   - Username: `admin`
   - Password: `admin123`
3. Click "Sign In"
4. You should be redirected to: http://localhost:8080/ (Dashboard)
5. You'll see the admin dashboard with sidebar

### Test Teacher Login
1. Logout (click avatar → Log out)
2. Go to http://localhost:8080/login
3. Enter:
   - Username: `teacher001`
   - Password: `teacher123`
4. Click "Sign In"
5. You should be redirected to: http://localhost:8080/portal/trainings
6. You'll see the teacher portal with your trainings

---

## 🐛 If Login Doesn't Work

Open browser console (Press F12) and run:

```javascript
// See all demo accounts
authDebug.listDemoAccounts()

// Test credentials
authDebug.verifyCredentials('admin', 'admin123')

// Reset database if needed
authDebug.reset()
```

---

## 📝 Register New Account

You can also create your own account:

1. Click "Register here" on login page
2. Fill in the form
3. Choose account type (Teacher or Admin)
4. Submit
5. You'll be auto-logged in

**Note:** New accounts are saved to localStorage and persist across sessions.

---

## 🎯 Login Flow

```
Visit any page
    ↓
Not logged in?
    ↓
Redirect to /login
    ↓
Enter credentials
    ↓
Validate against database
    ↓
Success?
    ↓
Store user in context + localStorage
    ↓
Redirect based on role:
  - Admin/Super Admin → /
  - Teacher/Beneficiary → /portal/trainings
```

---

## 🔒 Security Notes (Development Only)

**Current Implementation:**
- ✅ Password validation
- ✅ Role-based access control
- ✅ Protected routes
- ✅ Session persistence
- ⚠️ Passwords stored in plain text (DEMO ONLY)
- ⚠️ No encryption (DEMO ONLY)
- ⚠️ No token/JWT (DEMO ONLY)

**For Production:**
- Hash passwords with bcrypt
- Use JWT tokens
- Implement refresh tokens
- Add HTTPS only
- Add rate limiting
- Add CSRF protection

---

## 📍 Important Files

- **User Database:** `src/data/mockUsers.ts`
- **Auth Context:** `src/contexts/AuthContext.tsx`
- **Login Page:** `src/pages/auth/Login.tsx`
- **Register Page:** `src/pages/auth/Register.tsx`
- **Protected Routes:** `src/components/auth/ProtectedRoute.tsx`
- **Debug Utils:** `src/utils/authDebug.ts`

---

## ✅ Verification Checklist

- [ ] Run `npm run dev`
- [ ] Navigate to http://localhost:8080
- [ ] Redirected to /login
- [ ] Demo credentials shown on page
- [ ] Login with `admin` / `admin123` works
- [ ] Redirected to dashboard
- [ ] User name shows in header
- [ ] Logout works
- [ ] Login with `teacher001` / `teacher123` works
- [ ] Redirected to teacher portal
- [ ] Can access all teacher pages
- [ ] Registration works
- [ ] Session persists on refresh

---

## 🎉 All Set!

The authentication system is fully functional with 3 pre-seeded accounts that are always available. Try logging in with any of the accounts above!
