import { useState, useEffect } from 'react';
import { UserRole } from '@/lib/roles';
import { useAuth } from '@/hooks/useAuth';

export const useClient = () => {
  const [isClient, setIsClient] = useState<boolean | null>(null);
  const [restaurantId, setRestaurantId] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      setIsClient(user.role === UserRole.CLIENT);
      setRestaurantId(user.restaurantId ?? null);
    }
  }, [user]);

  return { isClient, restaurantId };
};
