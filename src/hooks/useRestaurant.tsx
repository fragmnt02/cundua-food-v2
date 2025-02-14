'use client';

import { useState, useEffect, useCallback } from 'react';
import { Restaurant } from '@/types/restaurant';
import { useCity } from './useCity';
import { isClient } from './isClient';

interface CacheItem {
  data: Restaurant[];
  timestamp: number;
}

interface CacheData {
  [city: string]: CacheItem;
}

const CACHE_KEY = 'restaurant_cache';
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes in milliseconds

interface UseRestaurantReturn {
  restaurants: Restaurant[] | null;
  loading: boolean;
  error: string | null;
  getRestaurant: (id: string) => Restaurant | undefined;
  refreshData: () => Promise<void>;
  createRestaurant: (
    restaurantData: Omit<
      Restaurant,
      'id' | 'isOpen' | 'isOpeningSoon' | 'rating' | 'voteCount'
    >
  ) => Promise<{ ok?: boolean; id?: string } | undefined>;
  updateRestaurant: (
    id: string,
    restaurantData: Omit<
      Restaurant,
      'id' | 'isOpen' | 'isOpeningSoon' | 'rating' | 'voteCount'
    >
  ) => Promise<boolean | undefined>;
  deleteRestaurant: (id: string) => Promise<boolean | undefined>;
}

export function useRestaurant(): UseRestaurantReturn {
  const [restaurants, setRestaurants] = useState<Restaurant[] | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const { city } = useCity();

  const getCache = useCallback((): CacheData => {
    const cached = isClient() ? localStorage.getItem(CACHE_KEY) : null;
    return cached ? JSON.parse(cached) : {};
  }, []);

  const setCache = useCallback(
    (city: string, data: Restaurant[]) => {
      const cache = getCache();
      cache[city] = {
        data,
        timestamp: Date.now()
      };
      if (isClient()) {
        localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
      }
    },
    [getCache]
  );

  const clearCache = useCallback(() => {
    if (isClient()) {
      localStorage.removeItem(CACHE_KEY);
    }
  }, []);

  const isCacheValid = useCallback((timestamp: number): boolean => {
    return Date.now() - timestamp < CACHE_DURATION;
  }, []);

  const fetchRestaurants = useCallback(async () => {
    if (!city) return;

    // Always clear cache before fetching to ensure fresh data
    clearCache();

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/restaurants/${city}`);
      if (!response.ok) {
        throw new Error('Failed to fetch restaurants');
      }
      const data = await response.json();
      setRestaurants(data);
      setCache(city, data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, [city, clearCache, setCache]);

  const getRestaurant = useCallback(
    (id: string) => {
      if (!restaurants) return;
      return restaurants.find((restaurant) => restaurant.id === id);
    },
    [restaurants]
  );

  const createRestaurant = useCallback(
    async (
      restaurantData: Omit<
        Restaurant,
        'id' | 'isOpen' | 'isOpeningSoon' | 'rating' | 'voteCount'
      >
    ) => {
      if (!city) return;

      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/restaurants/${city}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(restaurantData)
        });

        if (!response.ok) {
          throw new Error('Failed to create restaurant');
        }

        localStorage.removeItem(CACHE_KEY);

        // Refresh the restaurants list after creation
        await fetchRestaurants();

        const data = await response.json();

        return { ok: true, id: data?.id };
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
        return { ok: false };
      } finally {
        setLoading(false);
      }
    },
    [city, fetchRestaurants]
  );

  const updateRestaurant = useCallback(
    async (id: string, restaurantData: Partial<Restaurant>) => {
      if (!city) return;

      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/restaurants/${city}/${id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(restaurantData)
        });

        if (!response.ok) {
          throw new Error('Failed to update restaurant');
        }

        localStorage.removeItem(CACHE_KEY);

        // Refresh the restaurants list after update
        await fetchRestaurants();

        return true;
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
        return false;
      } finally {
        setLoading(false);
      }
    },
    [city, fetchRestaurants]
  );

  const deleteRestaurant = useCallback(
    async (id: string) => {
      if (!city) return;

      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/restaurants/${city}/${id}`, {
          method: 'DELETE'
        });

        if (!response.ok) {
          throw new Error('Failed to delete restaurant');
        }

        localStorage.removeItem(CACHE_KEY);

        // Refresh the restaurants list after deletion
        await fetchRestaurants();

        return true;
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
        return false;
      } finally {
        setLoading(false);
      }
    },
    [city, fetchRestaurants]
  );

  // Clear old cache entries on mount
  useEffect(() => {
    const cleanCache = () => {
      const cache = getCache();
      const cities = Object.keys(cache);

      const cleanedCache = cities.reduce((acc, city) => {
        if (isCacheValid(cache[city].timestamp)) {
          acc[city] = cache[city];
        }
        return acc;
      }, {} as CacheData);

      if (isClient()) {
        localStorage.setItem(CACHE_KEY, JSON.stringify(cleanedCache));
      }
    };

    cleanCache();
  }, [getCache, isCacheValid]);

  useEffect(() => {
    if (city) {
      fetchRestaurants();
    }
  }, [city, fetchRestaurants]);

  return {
    restaurants,
    loading,
    error,
    getRestaurant,
    refreshData: fetchRestaurants,
    createRestaurant,
    updateRestaurant,
    deleteRestaurant
  };
}
