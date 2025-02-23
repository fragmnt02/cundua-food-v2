'use client';

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback
} from 'react';
import { useRouter } from 'next/navigation';
import { UserRole } from '@/lib/roles';

interface AuthContextType {
  user: {
    email: string;
    role?: UserRole;
    firstName?: string;
    lastName?: string;
    dateOfBirth?: string;
    telephone?: string;
    restaurantIds?: string[];
  } | null;
  loading: boolean;
  logout: () => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  signup: (
    email: string,
    password: string,
    firstName: string,
    lastName: string,
    dateOfBirth: string,
    telephone: string
  ) => Promise<void>;
  checkUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  logout: async () => {},
  login: async () => {},
  signup: async () => {},
  checkUser: async () => {}
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<{
    email: string;
    role?: UserRole;
    firstName?: string;
    lastName?: string;
    dateOfBirth?: string;
    telephone?: string;
    restaurantIds?: string[];
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const checkUser = useCallback(async () => {
    try {
      const response = await fetch('/api/auth/me');
      if (response.ok) {
        const data = await response.json();
        if (data.user) {
          setUser({
            email: data.user.email,
            role: data.user.role,
            firstName: data.user.firstName,
            lastName: data.user.lastName,
            dateOfBirth: data.user.dateOfBirth,
            telephone: data.user.telephone,
            restaurantIds: data.user.restaurantIds ?? []
          });
        }
      }
    } catch (error) {
      console.error('Error checking auth status:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkUser();
  }, [checkUser]);

  const signup = async (
    email: string,
    password: string,
    firstName: string,
    lastName: string,
    dateOfBirth: string,
    telephone: string
  ) => {
    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email,
          password,
          firstName,
          lastName,
          dateOfBirth,
          telephone
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to sign up');
      }

      // Show Spanish alert about email validation
      alert(
        'Por favor, revisa tu correo electrónico para validar tu cuenta antes de iniciar sesión.'
      );

      router.push('/auth/login');
    } catch (error) {
      throw error;
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to login');
      }
      checkUser();

      // Check for user's city preference
      const cityResponse = await fetch('/api/user/city');
      if (cityResponse.ok) {
        const { city } = await cityResponse.json();
        if (city) {
          router.push(`/${city}`);
          return;
        }
      }

      router.push('/');
    } catch (error) {
      throw error;
    }
  };

  const logout = async () => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'DELETE'
      });

      if (response.ok) {
        setUser(null);
        router.push('/auth/login');
      }
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  return (
    <AuthContext.Provider
      value={{ user, loading, logout, login, signup, checkUser }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
