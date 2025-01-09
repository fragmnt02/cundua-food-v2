import { useState, useEffect } from 'react';
import { UserRole } from '@/lib/roles';
import { useAuth } from '@/hooks/useAuth';

export const useAdmin = () => {
  const [isAdmin, setIsAdmin] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    const checkAdminStatus = async () => {
      try {
        const response = await fetch('/api/auth/me');
        if (response.ok) {
          const data = await response.json();
          setIsAdmin(data.user?.role === UserRole.ADMIN);
        }
      } catch (error) {
        console.error('Error checking admin status:', error);
        setIsAdmin(false);
      }
    };

    if (user) {
      checkAdminStatus();
    } else {
      setIsAdmin(false);
    }
  }, [user]);

  return { isAdmin };
};
