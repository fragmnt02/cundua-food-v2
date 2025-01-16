'use client';

import RestaurantList from '@/components/RestaurantList';
import { Suspense } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { CITY_USER_FRIENDLY_NAME } from '@/lib/constants';
import { useParams } from 'next/navigation';

const RestaurantListSkeleton = () => (
  <div className="container mx-auto px-4 py-8">
    <Skeleton className="h-10 w-64 mb-8" />
    <div className="space-y-4 mb-6">
      <Skeleton className="h-10 w-full" />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Skeleton className="h-8" />
        <Skeleton className="h-8" />
        <Skeleton className="h-8" />
        <Skeleton className="h-8" />
      </div>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="space-y-3">
          <Skeleton className="h-48 w-full" />
          <div className="space-y-2">
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        </div>
      ))}
    </div>
  </div>
);

export default function CityPage() {
  const params = useParams();
  const city = params.city as string;
  const cityName =
    CITY_USER_FRIENDLY_NAME[
      params.city as keyof typeof CITY_USER_FRIENDLY_NAME
    ];

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
      <Suspense fallback={<RestaurantListSkeleton />}>
        <RestaurantList />
      </Suspense>
    </>
  );
}
