import { useState } from 'react';
import { useGlobalFavorites } from '@/providers/FavoritesProvider';

interface UseFavoriteReturn {
  isFavorite: boolean;
  isLoading: boolean;
  error: string | null;
  toggleFavorite: () => Promise<void>;
}

export function useFavorite(restaurantId: string): UseFavoriteReturn {
  const [error, setError] = useState<string | null>(null);
  const {
    favorites,
    loading: isLoading,
    toggleFavorite: toggleGlobalFavorite
  } = useGlobalFavorites();

  const toggleFavorite = async () => {
    try {
      await toggleGlobalFavorite(restaurantId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  return {
    isFavorite: !!favorites[restaurantId],
    isLoading,
    error,
    toggleFavorite
  };
}
