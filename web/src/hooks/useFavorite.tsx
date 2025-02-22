import { useState } from 'react';
import { useAuth } from './useAuth';
import { useGlobalFavorites } from '@/providers/FavoritesProvider';
import { analytics } from '@/utils/analytics';

export function useFavorite(restaurantId: string) {
  const { user } = useAuth();
  const { favorites, toggleFavorite: globalToggleFavorite } =
    useGlobalFavorites();
  const [isLoading, setIsLoading] = useState(false);

  const toggleFavorite = async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      await globalToggleFavorite(restaurantId);
      // Track favorite toggle
      analytics.trackFavoriteToggle(restaurantId, !favorites[restaurantId]);
    } catch (error) {
      console.error('Error toggling favorite:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isFavorite: favorites[restaurantId] || false,
    toggleFavorite,
    isLoading
  };
}
