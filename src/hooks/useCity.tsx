'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';

interface CityResponse {
  city: string | null;
}

const CITY_STORAGE_KEY = 'selectedCity';

export function useCity() {
  const [city, setCity] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  // Initialize from localStorage on client-side only
  useEffect(() => {
    const savedCity = localStorage.getItem(CITY_STORAGE_KEY);
    if (savedCity) {
      setCity(savedCity);
      setLoading(false);
    }
  }, []);

  const fetchCity = useCallback(async () => {
    try {
      const res = await fetch('/api/city');
      const data: CityResponse = await res.json();
      if (!data.city) {
        router.push('/select-city');
        return;
      }
      if (data.city !== city) {
        setCity(data.city);
        localStorage.setItem(CITY_STORAGE_KEY, data.city);
      }
      setLoading(false);
    } catch (error) {
      console.error('Error fetching cities:', error);
      setLoading(false);
    }
  }, [router, city]);

  useEffect(() => {
    // Fetch when there's no city in localStorage or when not on select-city page
    if (!city || pathname !== '/select-city') {
      fetchCity();
    }
  }, [fetchCity, pathname, city]);

  const updateCity = async (newCity: string) => {
    try {
      const response = await fetch('/api/city', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ city: newCity })
      });

      if (response.ok) {
        setCity(newCity);
        localStorage.setItem(CITY_STORAGE_KEY, newCity);
        router.refresh();
      }
    } catch (error) {
      console.error('Error updating city:', error);
    }
  };

  return {
    city,
    updateCity,
    loading,
    refreshCity: fetchCity
  };
}
