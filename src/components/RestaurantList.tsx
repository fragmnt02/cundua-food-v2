'use client';

import { Cuisine, PaymentMethod } from '@/types/restaurant';
import { useState, useMemo, useCallback, Suspense, useEffect } from 'react';
import { RestaurantCard } from '@/components/RestaurantCard';
import { useRestaurant } from '@/hooks/useRestaurant';
import dynamic from 'next/dynamic';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { analytics } from '@/utils/analytics';
import { useRouter, useSearchParams } from 'next/navigation';

// Constants moved outside component to prevent recreation
const FEATURES = ['hasAC', 'hasParking', 'freeDelivery'] as const;
type Feature = (typeof FEATURES)[number];

const FEATURE_LABELS: Record<Feature, string> = {
  hasAC: 'Aire acondicionado',
  hasParking: 'Estacionamiento',
  freeDelivery: 'Envío gratis'
};

// Lazy load the filter section for better initial load
const FilterSection = dynamic(() => import('./FilterSection'), {
  ssr: false,
  loading: () => <FilterSectionSkeleton />
});

const FilterSectionSkeleton = () => (
  <div className="space-y-4 mb-6">
    <Skeleton className="h-10 w-full" />
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <Skeleton className="h-8" />
      <Skeleton className="h-8" />
      <Skeleton className="h-8" />
      <Skeleton className="h-8" />
    </div>
  </div>
);

const RestaurantCardSkeleton = () => (
  <div className="space-y-3">
    <Skeleton className="h-48 w-full" />
    <div className="space-y-2">
      <Skeleton className="h-6 w-3/4" />
      <Skeleton className="h-4 w-1/2" />
    </div>
  </div>
);

interface Filters {
  searchQuery: string;
  cuisine: string;
  priceRange: string;
  features: Feature[];
  paymentMethods: PaymentMethod[];
  type: string;
  showOnlyOpen: boolean;
  sort: 'name' | 'rating';
  clearAll?: boolean;
}

export default function RestaurantList() {
  const { restaurants, loading } = useRestaurant();
  const router = useRouter();
  const searchParams = useSearchParams();

  // Initialize filters from URL query parameters
  const [filters, setFilters] = useState<Filters>(() => {
    return {
      searchQuery: searchParams.get('q') || '',
      cuisine: searchParams.get('cuisine') || 'all',
      priceRange: searchParams.get('price') || 'all',
      features: (searchParams.get('features')?.split(',') || []) as Feature[],
      paymentMethods: (searchParams.get('payment')?.split(',') ||
        []) as PaymentMethod[],
      type: searchParams.get('type') || 'all',
      showOnlyOpen: searchParams.get('open') === 'true',
      sort: (searchParams.get('sort') as 'name' | 'rating') || 'name'
    };
  });

  // Update URL when filters change
  const updateFilters = useCallback(
    (key: keyof Filters, value: string | string[] | boolean) => {
      let newFilters: Filters;

      // Special case for clearing all filters
      if (key === 'searchQuery' && value === '') {
        newFilters = {
          searchQuery: '',
          cuisine: 'all',
          priceRange: 'all',
          features: [],
          paymentMethods: [],
          type: 'all',
          showOnlyOpen: false,
          sort: 'name'
        };
        setFilters(newFilters);
        router.push(window.location.pathname, { scroll: false });
        return;
      }

      newFilters = { ...filters, [key]: value };
      setFilters(newFilters);

      // Create new URLSearchParams object
      const newParams = new URLSearchParams();

      // Only add non-default values to URL
      if (newFilters.searchQuery) newParams.set('q', newFilters.searchQuery);
      if (newFilters.cuisine !== 'all')
        newParams.set('cuisine', newFilters.cuisine);
      if (newFilters.priceRange !== 'all')
        newParams.set('price', newFilters.priceRange);
      if (newFilters.features.length > 0)
        newParams.set('features', newFilters.features.join(','));
      if (newFilters.paymentMethods.length > 0)
        newParams.set('payment', newFilters.paymentMethods.join(','));
      if (newFilters.type !== 'all') newParams.set('type', newFilters.type);
      if (newFilters.showOnlyOpen) newParams.set('open', 'true');
      if (newFilters.sort !== 'name') newParams.set('sort', newFilters.sort);

      // Update URL without refresh
      const query = newParams.toString();
      router.push(window.location.pathname + (query ? `?${query}` : ''), {
        scroll: false
      });

      // Track analytics
      if (key !== 'searchQuery') {
        analytics.trackFilterUse(
          key,
          typeof value === 'object' ? JSON.stringify(value) : String(value)
        );
      }
    },
    [router, filters]
  );

  useEffect(() => {
    if (filters.searchQuery) {
      analytics.trackSearch(filters.searchQuery);
    }
  }, [filters.searchQuery]);

  // Memoized filter function
  const filteredRestaurants = useMemo(() => {
    if (!restaurants) return [];

    return restaurants
      .filter((restaurant) => {
        const matchesSearch = restaurant.name
          .toLowerCase()
          ?.includes(filters.searchQuery.toLowerCase());
        const matchesCuisine =
          filters.cuisine === 'all' ||
          restaurant.cuisine?.includes(filters.cuisine as keyof typeof Cuisine);
        const matchesType =
          filters.type === 'all' || restaurant.type === filters.type;
        const matchesPriceRange =
          filters.priceRange === 'all' ||
          restaurant.priceRange === filters.priceRange;
        const matchesFeatures =
          filters.features.length === 0 ||
          filters.features.every(
            (feature) =>
              restaurant.features[feature as keyof typeof restaurant.features]
          );
        const matchesPaymentMethods =
          filters.paymentMethods.length === 0 ||
          filters.paymentMethods.every((method) =>
            restaurant.paymentMethods?.includes(method)
          );
        const matchesOpenStatus = !filters.showOnlyOpen || restaurant.isOpen;

        return (
          matchesSearch &&
          matchesCuisine &&
          matchesType &&
          matchesPriceRange &&
          matchesFeatures &&
          matchesPaymentMethods &&
          matchesOpenStatus
        );
      })
      .sort((a, b) => {
        // First sort by open status
        if (a.isOpen !== b.isOpen) return a.isOpen ? -1 : 1;
        if (a.isOpeningSoon !== b.isOpeningSoon)
          return a.isOpeningSoon ? -1 : 1;

        // Then sort by selected sort option
        if (filters.sort === 'rating') {
          return (b.rating || 0) - (a.rating || 0);
        }
        return a.name.localeCompare(b.name);
      });
  }, [restaurants, filters]);

  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Restaurantes</h1>

      {/* Lazy loaded filter section */}
      <Suspense fallback={<FilterSectionSkeleton />}>
        <FilterSection
          filters={filters}
          onFilterChange={updateFilters}
          features={FEATURES}
          featureLabels={FEATURE_LABELS}
        />
      </Suspense>

      {/* Loading state */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <RestaurantCardSkeleton key={i} />
          ))}
        </div>
      ) : filteredRestaurants.length === 0 ? (
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            No se encontraron restaurantes
          </h2>
          <p className="text-gray-600">
            Intenta ajustar los filtros para ver más resultados
          </p>
        </div>
      ) : (
        <ScrollArea className="h-[calc(100vh-300px)]">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-1">
            {filteredRestaurants.map((restaurant) => (
              <RestaurantCard key={restaurant.id} restaurant={restaurant} />
            ))}
          </div>
        </ScrollArea>
      )}
    </main>
  );
}
