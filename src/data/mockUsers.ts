import { User } from '@/contexts/AuthContext';

export interface StoredUser extends User {
  password: string;
}

// Initialize demo accounts
export const seedUsers: StoredUser[] = [
  {
    id: 'admin-001',
    username: 'admin',
    email: 'admin@moeys.gov.kh',
    password: 'admin123',
    role: 'ADMIN',
    name: 'អ្នកគ្រប់គ្រង',
    phone: '012345678',
    profile_image_url: '',
  },
  {
    id: 'superadmin-001',
    username: 'superadmin',
    email: 'superadmin@moeys.gov.kh',
    password: 'super123',
    role: 'SUPER_ADMIN',
    name: 'អ្នកគ្រប់គ្រងជាន់ខ្ពស់',
    phone: '012987654',
    profile_image_url: '',
  },
  {
    id: 'teacher-001',
    username: 'teacher001',
    email: 'sok.sovannak@moeys.gov.kh',
    password: 'teacher123',
    role: 'BENEFICIARY',
    name: 'សុខ សុវណ្ណា',
    phone: '012345678',
    teacher_id: 'T001',
    school: 'Phnom Penh Primary School',
    school_id: 'SCH-001',
    province_name: 'Phnom Penh',
    profile_image_url: '',
  },
];

// Users database - initialized with seed data
class UsersDatabase {
  private users: StoredUser[];

  constructor() {
    // Initialize with seed data
    this.users = [...seedUsers];

    // Try to load additional users from localStorage
    const storedUsers = localStorage.getItem('mock_users_db');
    if (storedUsers) {
      try {
        const parsed = JSON.parse(storedUsers);
        // Merge with seed data, avoiding duplicates
        const seedUsernames = new Set(seedUsers.map(u => u.username));
        const additionalUsers = parsed.filter((u: StoredUser) => !seedUsernames.has(u.username));
        this.users = [...seedUsers, ...additionalUsers];
      } catch (error) {
        console.error('Failed to load users from storage:', error);
      }
    }
  }

  // Get all users
  getAll(): StoredUser[] {
    return this.users;
  }

  // Find user by username
  findByUsername(username: string): StoredUser | undefined {
    return this.users.find(u => u.username === username);
  }

  // Find user by email
  findByEmail(email: string): StoredUser | undefined {
    return this.users.find(u => u.email === email);
  }

  // Add new user
  addUser(user: StoredUser): void {
    this.users.push(user);
    this.saveToStorage();
  }

  // Save to localStorage (excluding seed users for clean reset)
  private saveToStorage(): void {
    const seedUsernames = new Set(seedUsers.map(u => u.username));
    const customUsers = this.users.filter(u => !seedUsernames.has(u.username));
    localStorage.setItem('mock_users_db', JSON.stringify(customUsers));
  }

  // Reset to seed data
  reset(): void {
    this.users = [...seedUsers];
    localStorage.removeItem('mock_users_db');
  }
}

// Export singleton instance
export const usersDb = new UsersDatabase();
