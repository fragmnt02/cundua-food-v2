'use client';

import { RestaurantList } from '@/components/RestaurantList';
import { Suspense } from 'react';
import { CITY_USER_FRIENDLY_NAME } from '@/lib/constants';
import { useParams } from 'next/navigation';
import { useRestaurant } from '@/hooks/useRestaurant';

export default function CityPage() {
  const params = useParams();
  const city = params.city as string;
  const cityName =
    CITY_USER_FRIENDLY_NAME[
      params.city as keyof typeof CITY_USER_FRIENDLY_NAME
    ];
  const { restaurants, loading } = useRestaurant();

  return (
    <main
      className="container mx-auto px-4 py-8"
      role="main"
      aria-label={`Restaurantes en ${cityName}`}
    >
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'WebSite',
            name: 'Tabascomiendo',
            url: `https://tabascomiendo.com/${city}`,
            description: `Descubre los mejores restaurantes en ${cityName}`,
            potentialAction: {
              '@type': 'SearchAction',
              target: {
                '@type': 'EntryPoint',
                urlTemplate: `https://tabascomiendo.com/${city}/search?q={search_term_string}`
              },
              'query-input': 'required name=search_term_string'
            },
            '@graph': [
              {
                '@type': 'Organization',
                name: 'Tabascomiendo',
                url: 'https://tabascomiendo.com',
                logo: '/logo.png'
              },
              {
                '@type': 'LocalBusiness',
                name: `Tabascomiendo ${cityName}`,
                description: `Directorio de restaurantes en ${cityName}`,
                areaServed: {
                  '@type': 'City',
                  name: cityName
                }
              }
            ]
          })
        }}
      />
      <Suspense
        fallback={
          <div
            role="status"
            aria-label="Cargando restaurantes"
            className="animate-pulse"
          >
            <div className="h-8 bg-gray-200 rounded w-3/4 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        }
      >
        {restaurants && (
          <RestaurantList restaurants={restaurants} loading={loading} />
        )}
      </Suspense>
    </main>
  );
}
