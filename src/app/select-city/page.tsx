'use client';

import { CITIES, CITY_USER_FRIENDLY_NAME } from '@/lib/constants';

export default function SelectCity() {
  const handleCitySelect = async (city: string) => {
    try {
      await fetch('/api/city', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ city })
      });
      window.location.href = '/';
    } catch (error) {
      console.error('Error setting city:', error);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <h1 className="text-2xl font-bold mb-8">Selecciona tu ciudad</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-md w-full">
        {CITIES.map((city) => (
          <button
            key={city}
            onClick={() => handleCitySelect(city)}
            className="p-4 text-lg border rounded-lg hover:bg-gray-100 transition-colors capitalize"
          >
            {
              CITY_USER_FRIENDLY_NAME[
                city as keyof typeof CITY_USER_FRIENDLY_NAME
              ]
            }
          </button>
        ))}
      </div>
    </div>
  );
}
