import { Metadata } from 'next';
import RestaurantList from '@/components/RestaurantList';
import { Suspense } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

export const metadata: Metadata = {
  title: 'Restaurantes en Tabasco | Tabascomiendo',
  description:
    'Descubre los mejores restaurantes en Tabasco. Filtra por tipo de cocina, precio, y características especiales. Encuentra restaurantes abiertos cerca de ti.',
  keywords:
    'restaurantes, Tabasco, comida, gastronomía, México, restaurantes abiertos, delivery',
  openGraph: {
    title: 'Restaurantes en Tabasco | Tabascomiendo',
    description:
      'Descubre los mejores restaurantes en Tabasco. Filtra por tipo de cocina, precio, y características especiales. Encuentra restaurantes abiertos cerca de ti.',
    type: 'website',
    locale: 'es_MX',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Tabascomiendo - Descubre los mejores restaurantes en Tabasco'
      }
    ]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Restaurantes en Tabasco | Tabascomiendo',
    description:
      'Descubre los mejores restaurantes en Tabasco. Filtra por tipo de cocina, precio, y características especiales.',
    images: ['/og-image.jpg']
  },
  alternates: {
    canonical: 'https://tabascomiendo.com'
  }
};

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

export default function HomePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'WebSite',
            name: 'Tabascomiendo',
            url: 'https://tabascomiendo.com',
            description: 'Descubre los mejores restaurantes en Tabasco',
            potentialAction: {
              '@type': 'SearchAction',
              target: {
                '@type': 'EntryPoint',
                urlTemplate:
                  'https://tabascomiendo.com/search?q={search_term_string}'
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
