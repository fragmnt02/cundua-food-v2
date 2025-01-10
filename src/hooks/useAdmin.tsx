import { useState, useEffect } from 'react';
import { UserRole } from '@/lib/roles';
import { useAuth } from '@/hooks/useAuth';

export const useAdmin = () => {
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      setIsAdmin(user.role === UserRole.ADMIN);
    }
  }, [user]);

  return { isAdmin };
};
