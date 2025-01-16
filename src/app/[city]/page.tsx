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
    <>
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
            }
          })
        }}
      />
      <Suspense>
        {restaurants && (
          <RestaurantList restaurants={restaurants} loading={loading} />
        )}
      </Suspense>
    </>
  );
}
