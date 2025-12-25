import { usersDb, seedUsers } from '@/data/mockUsers';

/**
 * Authentication Debug Utilities
 * Use these in browser console to debug authentication issues
 */

// Make available globally for console access
(window as any).authDebug = {
  // List all users (without passwords)
  listUsers: () => {
    const users = usersDb.getAll().map(({ password, ...user }) => user);
    console.table(users);
    return users;
  },

  // List demo accounts with passwords (for debugging)
  listDemoAccounts: () => {
    console.log('Demo Accounts:');
    console.table(seedUsers.map(u => ({
      username: u.username,
      password: u.password,
      role: u.role,
      name: u.name,
    })));
  },

  // Check if username exists
  checkUsername: (username: string) => {
    const user = usersDb.findByUsername(username);
    if (user) {
      const { password, ...safeUser } = user;
      console.log('User found:', safeUser);
      return true;
    }
    console.log('User not found');
    return false;
  },

  // Verify login credentials
  verifyCredentials: (username: string, password: string) => {
    const user = usersDb.findByUsername(username);
    if (!user) {
      console.error('❌ User not found');
      return false;
    }
    if (user.password !== password) {
      console.error('❌ Wrong password');
      return false;
    }
    console.log('✅ Credentials valid!', { username, role: user.role });
    return true;
  },

  // Reset to seed data
  reset: () => {
    usersDb.reset();
    console.log('✅ Database reset to seed data');
    console.log('Available accounts:');
    console.table(seedUsers.map(u => ({
      username: u.username,
      password: u.password,
      role: u.role,
    })));
  },

  // Clear all auth data
  clearAuth: () => {
    localStorage.removeItem('auth_user');
    localStorage.removeItem('mock_users_db');
    console.log('✅ Auth data cleared. Please refresh the page.');
  },

  // Get current session
  getCurrentSession: () => {
    const stored = localStorage.getItem('auth_user');
    if (stored) {
      const user = JSON.parse(stored);
      console.log('Current session:', user);
      return user;
    }
    console.log('No active session');
    return null;
  },
};

// Log available commands on load
console.log(`
🔐 Auth Debug Tools Available:
---------------------------------
authDebug.listUsers()           - List all users
authDebug.listDemoAccounts()    - Show demo accounts with passwords
authDebug.checkUsername(user)   - Check if username exists
authDebug.verifyCredentials(user, pass) - Test login
authDebug.reset()               - Reset to seed data
authDebug.clearAuth()           - Clear all auth data
authDebug.getCurrentSession()   - Show current session

Example: authDebug.verifyCredentials('admin', 'admin123')
`);

export {};
