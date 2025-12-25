import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { api } from '@/lib/api';

export type UserRole = 'ADMIN' | 'SUPER_ADMIN' | 'BENEFICIARY';

export interface User {
  id: string;
  username: string;
  email: string;
  role: UserRole;
  name: string;
  phone?: string;
  profile_image_url?: string;
  // Beneficiary-specific fields
  teacher_id?: string;
  school?: string;
  school_id?: string;
  province_name?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
}

interface RegisterData {
  username: string;
  email: string;
  password: string;
  name: string;
  phone: string;
  role: UserRole;
  teacher_id?: string;
  school?: string;
  school_id?: string;
  province_name?: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check for stored auth on mount
  useEffect(() => {
    const storedAuth = localStorage.getItem('auth');
    if (storedAuth) {
      try {
        const auth = JSON.parse(storedAuth);
        setUser(auth.user);
      } catch (error) {
        console.error('Failed to parse stored auth:', error);
        localStorage.removeItem('auth');
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (username: string, password: string): Promise<void> => {
    setIsLoading(true);

    try {
      const response = await api.auth.login(username, password);

      // Store auth data in localStorage
      const authData = {
        token: response.token,
        user: response.user,
      };
      localStorage.setItem('auth', JSON.stringify(authData));

      // Set user in state
      setUser(response.user);
    } catch (error) {
      setIsLoading(false);
      throw error;
    }

    setIsLoading(false);
  };

  const register = async (data: RegisterData): Promise<void> => {
    setIsLoading(true);

    try {
      const response = await api.auth.register(data);

      // Store auth data in localStorage
      const authData = {
        token: response.token,
        user: response.user,
      };
      localStorage.setItem('auth', JSON.stringify(authData));

      // Auto-login after registration
      setUser(response.user);
    } catch (error) {
      setIsLoading(false);
      throw error;
    }

    setIsLoading(false);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('auth');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// Helper function to get redirect path based on role
export function getDefaultRedirectPath(role: UserRole): string {
  switch (role) {
    case 'ADMIN':
    case 'SUPER_ADMIN':
      return '/';
    case 'BENEFICIARY':
      return '/portal/trainings';
    default:
      return '/login';
  }
}
