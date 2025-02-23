import { useState, useEffect } from 'react';
import { UserRole } from '@/lib/roles';
import { useAuth } from '@/hooks/useAuth';

export const useClient = () => {
  const [isClient, setIsClient] = useState<boolean | null>(null);
  const [assignedRestaurantIds, setAssignedRestaurantIds] = useState<
    string[] | null
  >(null);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      setIsClient(user.role === UserRole.CLIENT);
      setAssignedRestaurantIds(user.restaurantIds ?? []);
    }
  }, [user]);

  return { isClient, assignedRestaurantIds };
};
