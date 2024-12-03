'use client';

import { useState, useEffect } from 'react';

const CITY_COOKIE_KEY = 'selectedCity';
const DEFAULT_CITY = 'cunduacan';

export function useCity() {
  const [city, setCity] = useState<string>('');

  useEffect(() => {
    // Read initial city from cookie on mount
    const savedCity = document.cookie
      .split('; ')
      .find((row) => row.startsWith(CITY_COOKIE_KEY))
      ?.split('=')[1];

    setCity(savedCity || DEFAULT_CITY);
  }, []);

  const updateCity = (newCity: string) => {
    // Update state and cookie
    setCity(newCity);
    document.cookie = `${CITY_COOKIE_KEY}=${newCity};path=/;max-age=${
      365 * 24 * 60 * 60
    }`; // Cookie expires in 1 year
  };

  return {
    city,
    updateCity
  };
}
