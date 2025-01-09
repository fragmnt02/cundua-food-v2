'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';

interface CityResponse {
  city: string | null;
}

export function useCity() {
  const [city, setCity] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const fetchCity = useCallback(async () => {
    try {
      const res = await fetch('/api/city');
      const data: CityResponse = await res.json();
      if (!data.city) {
        router.push('/select-city');
        return;
      }
      setCity(data.city);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching cities:', error);
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    fetchCity();
  }, [router, fetchCity]);

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
