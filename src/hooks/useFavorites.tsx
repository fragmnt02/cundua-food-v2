import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './useAuth';
import { useCity } from './useCity';

interface FavoritesState {
  [restaurantId: string]: boolean;
}

export function useFavorites() {
  const [favorites, setFavorites] = useState<FavoritesState>({});
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { city } = useCity();

  const fetchFavorites = useCallback(async () => {
    if (!user || !city) {
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/favorites');
      if (!response.ok) throw new Error('Failed to fetch favorites');
      const data = await response.json();

      // Convert array of favorites to a map for O(1) lookup
      const favoritesMap = data.reduce(
        (acc: FavoritesState, restaurant: { id: string }) => {
          acc[restaurant.id] = true;
          return acc;
        },
        {}
      );

      setFavorites(favoritesMap);
    } catch (error) {
      console.error('Error fetching favorites:', error);
    } finally {
      setLoading(false);
    }
  }, [user, city]);

  useEffect(() => {
    fetchFavorites();
  }, [fetchFavorites]);

  const toggleFavorite = useCallback(
    async (restaurantId: string) => {
      if (!user || !city) return;

      try {
        const method = favorites[restaurantId] ? 'DELETE' : 'POST';
        const response = await fetch(
          `/api/restaurants/${city}/${restaurantId}/favorite`,
          { method }
        );

        if (!response.ok) throw new Error('Failed to update favorite status');

        setFavorites((prev) => ({
          ...prev,
          [restaurantId]: !prev[restaurantId]
        }));
      } catch (error) {
        console.error('Error toggling favorite:', error);
      }
    },
    [favorites, user, city]
  );

  return {
    favorites,
    loading,
    toggleFavorite,
    refreshFavorites: fetchFavorites
  };
}
