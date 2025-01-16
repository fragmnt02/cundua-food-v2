import { useState, useCallback, useEffect } from 'react';
import { useCity } from './useCity';
import { useAuth } from './useAuth';

interface UseFavoriteReturn {
  isFavorite: boolean;
  isLoading: boolean;
  error: string | null;
  toggleFavorite: () => Promise<void>;
}

export function useFavorite(restaurantId: string): UseFavoriteReturn {
  const [isFavorite, setIsFavorite] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { city } = useCity();
  const { user } = useAuth();

  const checkFavoriteStatus = useCallback(async () => {
    if (!user || !city) return;

    try {
      const response = await fetch(
        `/api/restaurants/${city}/${restaurantId}/favorite`
      );
      if (!response.ok) throw new Error('Failed to check favorite status');
      const data = await response.json();
      setIsFavorite(data.isFavorite);
    } catch (err) {
      console.error('Error checking favorite status:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  }, [city, restaurantId, user]);

  useEffect(() => {
    checkFavoriteStatus();
  }, [checkFavoriteStatus]);

  const toggleFavorite = async () => {
    if (!user || !city) return;

    setIsLoading(true);
    setError(null);

    try {
      const method = isFavorite ? 'DELETE' : 'POST';
      const response = await fetch(
        `/api/restaurants/${city}/${restaurantId}/favorite`,
        { method }
      );

      if (!response.ok) throw new Error('Failed to update favorite status');

      setIsFavorite(!isFavorite);
    } catch (err) {
      console.error('Error toggling favorite:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isFavorite,
    isLoading,
    error,
    toggleFavorite
  };
}
